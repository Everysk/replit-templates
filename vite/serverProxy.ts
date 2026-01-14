import type { ProxyOptions } from "vite";

export function createDevServerProxy(): Record<string, string | ProxyOptions> {
  const TARGET = process.env.PROXY_SERVER_TARGET_URL;
  if (!TARGET) throw new Error("PROXY_SERVER_TARGET_URL must be set.");

  return {
    "/api": {
      target: TARGET,
      changeOrigin: true,
      xfwd: true,
      rewrite: (p) => p.replace(/^\/api(?=\/|$)/, ""),

      configure: (proxy) => {
        proxy.on("proxyReq", (proxyReq) => {
          proxyReq.removeHeader("origin");
          proxyReq.removeHeader("referer");

          const ACCOUNT_SID = process.env.ACCOUNT_SID;
          const AUTH_TOKEN = process.env.AUTH_TOKEN;

          if (ACCOUNT_SID && AUTH_TOKEN) {
            proxyReq.setHeader("Authorization", `Bearer ${ACCOUNT_SID}:${AUTH_TOKEN}`);
          }

        });
      },
    },
  };
}
