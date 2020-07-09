import { Request, Response, Router } from "express";
import { OK } from "http-status-codes";
import { masterIndex, fakebookList } from "@server";

const Info = Router();

Info.get("/", async (req: Request, res: Response) => {
  const numberOfSongs = masterIndex.length;
  res.status(OK).json({
    result: {
      songCount: numberOfSongs,
      fakebooks: fakebookList,
    },
  });
});

export default Info;
