import { defineConfig, loadEnv } from "vite";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

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

    build: {
      outDir: "./dist",
      emptyOutDir: true,
      cssCodeSplit: false,
      assetsInlineLimit: 100000000,
    },

    server: {
      host: true,
      port: Number(process.env.PORT) || 5173,
      strictPort: true,
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
      viteSingleFile(),
    ],
  };
});
 