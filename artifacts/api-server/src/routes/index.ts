import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import reportsRouter from "./reports";
import safetyRouter from "./safety";
import likesRouter from "./likes";
import adsRouter from "./ads";
import browseCityRouter from "./browseCity";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(reportsRouter);
router.use(safetyRouter);
router.use(likesRouter);
router.use(adsRouter);
router.use(browseCityRouter);

export default router;
