import { Request, Response, Router } from "express";
import getPdf from "@shared/pdf_lookup";

const FetchRouter = Router();

FetchRouter.get("/pdf", async (req: Request, res: Response) => {
  const source = req.query.source as string;
  const page = req.query.page as string;
  const pdf = await getPdf(source, parseInt(page));
  res.contentType("application/pdf");
  res.send(pdf);
});

export default FetchRouter;
