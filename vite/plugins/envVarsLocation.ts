import type { HtmlTagDescriptor, IndexHtmlTransformContext, Plugin } from "vite";

export function envVarsLocationPlugin(): Plugin {
  return {
    name: "env_vars_location",
    transformIndexHtml(html: string, ctx: IndexHtmlTransformContext) {
      const appName = process.env.EVERYSK_APP_NAME;

      const out = appName
        ? html.replace(/<title>[^<]*<\/title>/, `<title>${appName}</title>`)
        : html;

      const tags: HtmlTagDescriptor[] =
        ctx.command === "build"
          ? [{ tag: "meta", attrs: { name: "app-config" }, injectTo: "head" }]
          : [];

      return { html: out, tags };
    },
  };
}
