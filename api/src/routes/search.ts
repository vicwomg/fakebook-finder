import { masterIndex } from "@server";
import { songObject } from "@shared/constants";
import { fuzzysearch } from "@shared/functions";
import logger from "@shared/Logger";
import { Request, Response, Router } from "express";
import { OK } from "http-status-codes";

const SearchRouter = Router();

SearchRouter.get("/song", async (req: Request, res: Response) => {
  const searchTerm = req.query.q as string;
  logger.info("Searching for: " + searchTerm);
  const results = masterIndex.filter((e: songObject) => {
    return fuzzysearch(searchTerm, e.title);
  });
  res.status(OK).json({ result: results });
});

export default SearchRouter;
