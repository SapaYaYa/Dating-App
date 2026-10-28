import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import reportsRouter from "./reports";
import safetyRouter from "./safety";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(reportsRouter);
router.use(safetyRouter);

export default router;
