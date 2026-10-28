import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { createDirectMeetingRecapUpload } from "../meetingRecapJobs";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Typical meeting transcripts take this binary path instead of being expanded
  // to base64 and split into multiple JSON/tRPC requests. Keep it before the
  // generic JSON parser so Express retains the original source bytes.
  app.post(
    "/api/tdc-meeting-recaps/upload",
    express.raw({ type: "application/octet-stream", limit: "2mb" }),
    async (req, res) => {
      try {
        const encodedFileName = req.header("x-transcript-file-name") ?? "";
        const fileName = decodeURIComponent(encodedFileName);
        const mimeType = req.header("x-transcript-mime-type") ?? "application/octet-stream";
        if (!Buffer.isBuffer(req.body)) {
          res.status(400).json({ error: "The transcript upload did not include file data." });
          return;
        }
        const result = await createDirectMeetingRecapUpload({
          fileName,
          mimeType,
          fileBuffer: req.body,
        });
        res.status(202).json(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "The secure transcript upload could not complete.";
        res.status(400).json({ error: message });
      }
    }
  );
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Storage proxy for CDN-hosted assets
  registerStorageProxy(app);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
