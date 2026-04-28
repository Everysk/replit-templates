import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { createDevServerProxy } from "./vite/serverProxy";
import { envVarsLocationPlugin } from "./vite/plugins/envVarsLocation";
import { serveDevAppConfigPlugin } from "./vite/plugins/serveDevAppConfig";

export default defineConfig(({ mode, command }) => {
  const root = process.env.PROJECT_ROOT ?? process.cwd();

  const env = loadEnv(mode, root, "");
  Object.assign(process.env, env);

  return {
    base: "./",
    envDir: root,

    resolve: {
      alias: {
        "@src": resolve(__dirname, "src"),
      },
    },

    build: {
      outDir: "./dist",
      emptyOutDir: true,
    },

    server: {
      host: true,
      port: Number(process.env.PORT) || 5000,
      strictPort: true,
      allowedHosts: true,
      proxy: command === "serve" ? createDevServerProxy() : undefined,
    },

    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
      tailwindcss(),
      envVarsLocationPlugin(),
      serveDevAppConfigPlugin(),
    ],

    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.test.{ts,tsx}"],
      css: false,
    },
  };
});
