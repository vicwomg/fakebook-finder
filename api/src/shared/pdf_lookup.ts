var fs = require("fs");
import { masterIndex } from "@server";
import _ from "lodash";
import { PDFDocument, ParseSpeeds } from "pdf-lib";
import { libraryObject } from "./constants";
import logger from "./Logger";
import pdfLibrary from "./pdf_library";

// PDF cache with memory management
const pdfCache = new Map<string, PDFDocument>();
const MAX_CACHE_SIZE_MB = 500; // Limit cache to 500MB
let currentCacheSize = 0;

// Memory monitoring utility
const logMemoryUsage = () => {
  const memUsage = process.memoryUsage();
  const heapUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(1);
  const heapTotalMB = (memUsage.heapTotal / 1024 / 1024).toFixed(1);
  logger.info(
    `System memory: ${heapUsedMB}MB used, ${heapTotalMB}MB allocated`
  );
};

const lookupLibrary = (fakebookName: string) => {
  return pdfLibrary.find((e: libraryObject) => {
    return e.name.toLowerCase() === fakebookName.toLowerCase();
  });
};

const getNextSongPageNumber = (
  fakebookName: string,
  startPage: number
): number => {
  const currentSongIndex = masterIndex.findIndex((e) => {
    return e.source === fakebookName && e.page === startPage;
  });
  const nextSong = masterIndex[currentSongIndex + 1];
  if (nextSong.page > startPage) {
    return masterIndex[currentSongIndex + 1].page;
  } else {
    //if it's at the end of the book, we'll assume this chart is one page
    return startPage + 1;
  }
};

const getPdf = async (fakebookName: string, page: number) => {
  const pdfPath = process.env.PDF_PATH;
  const libraryObject = lookupLibrary(fakebookName);

  if (!!libraryObject) {
    //load source pdf (with caching)
    const filePath = pdfPath + "/" + libraryObject.pdfFile;
    let sourcePdfDoc = pdfCache.get(fakebookName);

    if (!sourcePdfDoc) {
      // Log file size
      const stats = fs.statSync(filePath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      logger.info(`Loading source pdf: ${fakebookName} (${fileSizeInMB}MB)`);

      const uint8Array = fs.readFileSync(filePath);
      const startTime = process.hrtime();

      sourcePdfDoc = await PDFDocument.load(uint8Array, {
        parseSpeed: ParseSpeeds.Fastest,
      });

      const endTime = process.hrtime(startTime);
      const duration = Math.round(endTime[0] * 1000 + endTime[1] / 1000000);
      const pageCount = sourcePdfDoc.getPageCount();

      const msPerMB = (duration / parseFloat(fileSizeInMB)).toFixed(1);
      const msPerPage = (duration / pageCount).toFixed(1);
      logger.info(
        `Loaded source pdf: ${fakebookName} (${fileSizeInMB}MB, ${pageCount} pages) in ${duration}ms (${msPerMB}ms/MB, ${msPerPage}ms/page)`
      );

      // Cache management - evict oldest if over limit
      const fileSizeMB = parseFloat(fileSizeInMB);
      if (currentCacheSize + fileSizeMB > MAX_CACHE_SIZE_MB) {
        // Evict oldest entries until we have room
        const entries = Array.from(pdfCache.entries());
        while (
          currentCacheSize + fileSizeMB > MAX_CACHE_SIZE_MB &&
          entries.length > 0
        ) {
          const [oldestName] = entries.shift()!;
          pdfCache.delete(oldestName);
          // Estimate evicted size (rough approximation)
          currentCacheSize -= 50; // Average PDF size estimate
          logger.info(`Evicted ${oldestName} from cache to free memory`);
        }
      }

      // Cache the loaded PDF
      pdfCache.set(fakebookName, sourcePdfDoc);
      currentCacheSize += fileSizeMB;

      logger.info(
        `PDF cache: ${pdfCache.size} files, ~${currentCacheSize.toFixed(
          1
        )}MB used`
      );

      // Log system memory usage periodically
      if (pdfCache.size % 3 === 0) {
        // Every 3rd cache addition
        logMemoryUsage();
      }
    } else {
      logger.info(`Using cached source pdf: ${fakebookName}`);
    }

    //build output pdf
    const pdfDoc = await PDFDocument.create();
    const pageIndex = page + libraryObject.offset - 1;
    var nextSongPageIndex =
      getNextSongPageNumber(fakebookName, page) + libraryObject.offset - 1;

    //tack on an extra page just in case it spills over to next page on multi-song-per-page
    var endPageIndex = nextSongPageIndex + 1;

    //handle last page sorts of issues
    if (endPageIndex - 1 > sourcePdfDoc.getPageCount() - 1) {
      endPageIndex = sourcePdfDoc.getPageCount() - 1;
    }
    var range = _.range(pageIndex, endPageIndex);
    if (range.length === 0) {
      range = [pageIndex];
    }

    const copiedPages = await pdfDoc.copyPages(sourcePdfDoc, range);
    copiedPages.map((e) => pdfDoc.addPage(e));

    const pdfBytes = await pdfDoc.save();
    var pdfBuffer = Buffer.from(pdfBytes.buffer);

    return pdfBuffer;
  } else {
    throw Error("PDF file not found: " + fakebookName);
  }
};

export default getPdf;
