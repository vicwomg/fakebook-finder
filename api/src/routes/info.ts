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

// Get all songs for a specific fakebook
Info.get("/fakebook/:name", async (req: Request, res: Response) => {
  const fakebookName = req.params.name;
  logger.info(`Fetching songs for fakebook: ${fakebookName}`);

  const songs = masterIndex
    .filter((song) => {
      return song.source.toLowerCase() === fakebookName.toLowerCase();
    })
    .map((song) => ({
      title: song.title,
      page: song.page,
      source: song.source,
    }));

  res.status(OK).json({
    result: {
      fakebook: fakebookName,
      songs: songs,
      count: songs.length,
    },
  });
});

// Get a random song from the entire library
Info.get("/random", async (req: Request, res: Response) => {
  logger.info("Fetching random song");

  if (masterIndex.length === 0) {
    return res.status(OK).json({
      result: null,
      message: "No songs available",
    });
  }

  const randomIndex = Math.floor(Math.random() * masterIndex.length);
  const randomSong = masterIndex[randomIndex];

  logger.info(
    `Random song selected: ${randomSong.title} from ${randomSong.source}, page ${randomSong.page}`
  );

  res.status(OK).json({
    result: {
      title: randomSong.title,
      source: randomSong.source,
      page: randomSong.page,
    },
  });
});

export default Info;
