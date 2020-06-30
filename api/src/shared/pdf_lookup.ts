var fs = require("fs");
import { PDFDocument } from "pdf-lib";
import pdfLibrary, { pdfFile } from "./pdf_library";

const lookupPdfData = (fakebookName: string) => {
  return pdfLibrary.find((e: pdfFile) => {
    return e.name === fakebookName;
  });
};

const getPdf = async (fakebookName: string, page: string) => {
  const pdfPath = process.env.PDF_PATH;
  const pageNumber = parseInt(page);
  const libraryObject = lookupPdfData(fakebookName);

  if (!!libraryObject) {
    //load source pdf
    let before = Date.now();
    const filePath = pdfPath + "/" + libraryObject.pdf;
    const uint8Array = fs.readFileSync(filePath);
    const sourcePdfDoc = await PDFDocument.load(uint8Array);
    let after = Date.now();
    console.log("Loading pdf took (ms): " + (after - before));

    //build output pdf
    before = Date.now();
    const pdfDoc = await PDFDocument.create();
    const page = pageNumber - 1 + libraryObject.offset;
    const copiedPages = await pdfDoc.copyPages(sourcePdfDoc, [page, page + 1]);
    copiedPages.map((e) => pdfDoc.addPage(e));

    const pdfBytes = await pdfDoc.save();
    var pdfBuffer = Buffer.from(pdfBytes.buffer);
    after = Date.now();
    console.log("Building pdf took (ms): " + (after - before));
    return pdfBuffer;
  } else {
    throw Error("PDF file not found: " + fakebookName);
  }
};

export default getPdf;
