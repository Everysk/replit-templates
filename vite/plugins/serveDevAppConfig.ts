
import path from "node:path";
import fs from "node:fs/promises";

import type { Plugin } from "vite";

export function serveDevAppConfigPlugin(): Plugin {
  return {
    name: "serve-dev-app-config",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/app-config.dev.json") return next();

        try {
          const filePath = path.resolve(process.cwd(), "dev", "app-config.dev.json");
          const content = await fs.readFile(filePath, "utf-8");

          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.statusCode = 200;
          res.end(content);
        } catch {
          res.statusCode = 404;
          res.end();
        }
      });
    },
  };
}
