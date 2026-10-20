import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Clerk proxy must come before body parsers.
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// Mobile clients authenticate with Bearer tokens. Keep browser CORS
// non-credentialed so third-party origins cannot read cookie-authenticated API
// responses or submit credentialed mutations.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  clerkMiddleware((req) => {
    const allowedHost = getClerkProxyHost(req);
    return {
      publishableKey: allowedHost
        ? publishableKeyFromHost(
            allowedHost,
            process.env.CLERK_PUBLISHABLE_KEY,
          )
        : process.env.CLERK_PUBLISHABLE_KEY,
    };
  }),
);

app.use("/api", router);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Express 5 forwards rejected async handlers here. Always answer with the
// ErrorResponse shape and never leak stack traces or database errors.
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  // Body-parser errors (malformed JSON, payload too large) are http-errors
  // with a 4xx status and a client-safe message flagged by `expose`.
  const httpError = err as { status?: unknown; expose?: unknown; message?: unknown };
  if (
    typeof httpError.status === "number" &&
    httpError.status >= 400 &&
    httpError.status < 500 &&
    httpError.expose === true &&
    typeof httpError.message === "string"
  ) {
    res.status(httpError.status).json({ error: httpError.message });
    return;
  }

  req.log.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

export default app;
