import { Request, Response, Router } from "express";
import { fuzzysearch } from "@shared/functions";
import { OK } from "http-status-codes";
import getPdf from "@shared/pdf_lookup";

const SearchRouter = Router();

SearchRouter.get("/song", async (req: Request, res: Response) => {
  const searchTerm = req.query.q;
  const matches = req.app.get("master_index").filter((e: any[]) => {
    const songTitle = e[0];
    return fuzzysearch(searchTerm as string, songTitle);
  });
  const results = matches.map((e: any[]) => {
    return { title: e[0], page: e[2], source: e[1] };
  });
  // console.log(results);
  res.status(OK).json({ result: results });
});

SearchRouter.get("/pdf", async (req: Request, res: Response) => {
  const source = req.query.source;
  const page = req.query.page;
  const pdf = await getPdf(source as string, page as string);
  res.contentType("application/pdf");
  res.send(pdf);
});

export default SearchRouter;
