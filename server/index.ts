import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

console.log("🔥 index.ts loaded");

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/* ---------- request logger ---------- */
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  res.json = (bodyJson: any) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

/* ---------- health check ---------- */
app.get("/health", (_req, res) => {
  res.send("OK");
});

(async () => {
  log("Starting server bootstrap...");

  await registerRoutes(httpServer, app);
  log("Routes registered");

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    res.status(status).json({ message });
  });

  const port = Number(process.env.PORT) || 5000;

  /* ---------- START SERVER FIRST ---------- */
  httpServer.listen(port, "0.0.0.0", () => {
    log(`🚀 Server listening on http://localhost:${port}`);
  });

  /* ---------- THEN attach frontend ---------- */
  if (process.env.NODE_ENV === "production") {
    log("Production mode: serving static files");
    serveStatic(app);
  } else {
    log("Development mode: setting up Vite");
    const { setupVite } = await import("./vite");

    // ⚠️ DO NOT await forever
    setupVite(httpServer, app).catch((err: any) => {
      console.error("Vite setup failed:", err);
    });
  }
})();
