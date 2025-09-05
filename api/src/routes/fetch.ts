import logger from "@shared/Logger";
import getPdf from "@shared/pdf_lookup";
import { Request, Response, Router } from "express";

const FetchRouter = Router();

FetchRouter.get("/pdf", async (req: Request, res: Response) => {
  const source = req.query.source as string;
  const page = req.query.page as string;
  const title = req.query.title as string;

  const startTime = performance.now();
  logger.info(`Fetching pdf for: ${title} / ${source} / page ${page}`);

  const pdf = await getPdf(source, parseInt(page));

  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);

  logger.info(`Fetched pdf for: ${title} in ${duration}ms`);

  res.contentType("application/pdf");
  res.send(pdf);
});

export default FetchRouter;
