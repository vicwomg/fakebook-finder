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

export default SearchRouter;
