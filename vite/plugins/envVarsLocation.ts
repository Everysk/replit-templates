import type { Plugin } from "vite";

export function envVarsLocationPlugin(): Plugin {
  return {
    name: "env_vars_location",
    apply: "build",
    transformIndexHtml() {
      return [{ tag: "meta", attrs: { name: "app-config" }, injectTo: "head" }];
    },
  };
}
