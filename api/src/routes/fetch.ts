import logger from "@shared/Logger";
import getPdf from "@shared/pdf_lookup";
import { Request, Response, Router } from "express";

const FetchRouter = Router();

FetchRouter.get("/pdf", async (req: Request, res: Response) => {
  const source = req.query.source as string;
  const page = req.query.page as string;
  const title = req.query.title as string;

  const startTime = process.hrtime();

  const pdf = await getPdf(source, parseInt(page));

  const endTime = process.hrtime(startTime);
  const duration = Math.round(endTime[0] * 1000 + endTime[1] / 1000000);

  logger.info(
    `Fetched pdf for: ${title} / ${source} / page ${page} in ${duration}ms`
  );

  res.contentType("application/pdf");
  res.send(pdf);
});

export default FetchRouter;
