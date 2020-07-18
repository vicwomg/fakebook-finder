var fs = require("fs");
import { PDFDocument, ParseSpeeds } from "pdf-lib";
import pdfLibrary from "./pdf_library";
import { masterIndex } from "@server";
import { libraryObject } from "./constants";
import _ from "lodash";

const lookupLibrary = (fakebookName: string) => {
  return pdfLibrary.find((e: libraryObject) => {
    return e.name === fakebookName;
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
    //load source pdf
    const filePath = pdfPath + "/" + libraryObject.pdfFile;
    const uint8Array = fs.readFileSync(filePath);
    const sourcePdfDoc = await PDFDocument.load(uint8Array, {
      parseSpeed: ParseSpeeds.Fastest,
    });

    //build output pdf
    const pdfDoc = await PDFDocument.create();
    const pageIndex = page - 1 + libraryObject.offset;
    var nextSongPageIndex =
      getNextSongPageNumber(fakebookName, page) - 1 + libraryObject.offset;
    nextSongPageIndex++; // tack on extra page just in case

    const copiedPages = await pdfDoc.copyPages(
      sourcePdfDoc,
      _.range(pageIndex, nextSongPageIndex)
    );
    copiedPages.map((e) => pdfDoc.addPage(e));

    const pdfBytes = await pdfDoc.save();
    var pdfBuffer = Buffer.from(pdfBytes.buffer);

    return pdfBuffer;
  } else {
    throw Error("PDF file not found: " + fakebookName);
  }
};

export default getPdf;
