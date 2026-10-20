import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(reportsRouter);

export default router;
