import { Request, Response, Router } from "express";
import { fuzzysearch } from "@shared/functions";
import { OK } from "http-status-codes";
import getPdf from "@shared/pdf_lookup";
import { songObject } from "@shared/constants";
import { masterIndex } from "@server";

const SearchRouter = Router();

SearchRouter.get("/song", async (req: Request, res: Response) => {
  const searchTerm = req.query.q as string;
  const results = masterIndex.filter((e: songObject) => {
    return fuzzysearch(searchTerm, e.title);
  });
  res.status(OK).json({ result: results });
});

SearchRouter.get("/pdf", async (req: Request, res: Response) => {
  const source = req.query.source as string;
  const page = req.query.page as string;
  const pdf = await getPdf(source, parseInt(page));
  res.contentType("application/pdf");
  res.send(pdf);
});

export default SearchRouter;
