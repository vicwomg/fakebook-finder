import Papa from "papaparse";
import fs from "fs";
import path from "path";

const getMasterIndex = () => {
  const fakebookIndexPath = process.env.PDF_INDEX_PATH;
  if (fakebookIndexPath) {
    const fakebooks = fs.readdirSync(fakebookIndexPath);
    var file = "";
    fakebooks.map((e) => {
      file += fs.readFileSync(path.join(fakebookIndexPath, e), "utf-8");
    });

    const data = Papa.parse(file, { delimiter: "," }).data;
    //console.log(data);
    return data;
  } else {
    throw Error(
      "PDF index path not found or invalid. Specify it in .env: " +
        process.env.PDF_INDEX_PATH
    );
  }
};

export default getMasterIndex;
