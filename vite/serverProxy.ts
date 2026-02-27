import type { ProxyOptions } from "vite";

export function createDevServerProxy(): Record<string, string | ProxyOptions> {
  const TARGET = process.env.EVERYSK_API_URL || "https://api.everysk.com/v2";
  if (!TARGET) throw new Error("EVERYSK_API_URL must be set.");

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

          const EVERYSK_API_SID = process.env.EVERYSK_API_SID;
          const EVERYSK_API_TOKEN = process.env.EVERYSK_API_TOKEN;

          if (EVERYSK_API_SID && EVERYSK_API_TOKEN) {
            proxyReq.setHeader("Authorization", `Bearer ${EVERYSK_API_SID}:${EVERYSK_API_TOKEN}`);
          }

        });
      },
    },
  };
}
