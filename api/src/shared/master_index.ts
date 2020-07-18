import Papa from "papaparse";
import fs from "fs";
import path from "path";
import { songObject } from "./constants";

function sortBySourceAndPage(a: songObject, b: songObject) {
  var o1 = a.source.toLowerCase();
  var o2 = b.source.toLowerCase();
  var p1 = a.page;
  var p2 = b.page;
  if (o1 < o2) return -1;
  if (o1 > o2) return 1;
  if (p1 < p2) return -1;
  if (p1 > p2) return 1;
  return 0;
}

const getMasterIndex = () => {
  // const fakebookIndexPath = process.env.PDF_INDEX_PATH;
  const fakebookIndexPath = __dirname + "/fakebook_indexes";
  const pdfPath = process.env.PDF_PATH;

  if (pdfPath && fs.existsSync(pdfPath)) {
    const pdfs = fs.readdirSync(pdfPath);

    const fbIndexes = fs.readdirSync(fakebookIndexPath);
    var file = "title,source,page"; //include csv header

    const validFbIndexes = fbIndexes.filter((e) => {
      if (e.includes(".csv")) {
        var pdfFile = e.replace(".csv", ".pdf");
        if (pdfs.includes(pdfFile)) {
          return e;
        } else {
          console.log("No pdf found for: " + e.replace(".csv", ""));
        }
      }
    });

    validFbIndexes.map((e) => {
      console.log("Found pdf file for: " + e.replace(".csv", ""));
      file += "\n" + fs.readFileSync(path.join(fakebookIndexPath, e), "utf-8");
    });

    const data = Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      // step: (result) => {
      //   result.errors.length > 0 &&
      //     result.errors[0].code != "TooManyFields" &&
      //     console.log(result);
      // },
      dynamicTyping: (field) => {
        return field === "page";
      },
    }).data as songObject[];

    const sorted = data.sort(sortBySourceAndPage);

    return sorted;
  } else {
    throw Error(
      "PDF index path not found or invalid. Specify it in .env as PDF_PATH: " +
        process.env.PDF_PATH
    );
  }
};

export default getMasterIndex;
