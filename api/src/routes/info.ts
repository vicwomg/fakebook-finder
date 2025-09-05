import { fakebookList, masterIndex } from "@server";
import logger from "@shared/Logger";
import { Request, Response, Router } from "express";
import { OK } from "http-status-codes";

const Info = Router();

Info.get("/", async (req: Request, res: Response) => {
  const numberOfSongs = masterIndex.length;
  logger.info(`Fetching info for: ${numberOfSongs} songs`);
  res.status(OK).json({
    result: {
      songCount: numberOfSongs,
      fakebooks: fakebookList,
    },
  });
});

export default Info;
