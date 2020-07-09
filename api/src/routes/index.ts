import { Router } from "express";
import SearchRouter from "./search";
import Info from "./info";
import FetchRouter from "./fetch";

// Init router and path
const router = Router();

// Add sub-routes
router.use("/search", SearchRouter);
router.use("/fetch", FetchRouter);
router.use("/info", Info);

// Export the base-router
export default router;
