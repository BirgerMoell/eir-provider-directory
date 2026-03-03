import { handleApiRoute, renderPage } from "../dist/server/entry.js";

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const resolvedUrl = `${url.pathname}${url.search}`;
    globalThis.__EIR_ASSET_FETCH__ = (assetPath: string) => {
      const assetUrl = new URL(assetPath, url.origin);
      return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
    };

    if (url.pathname.startsWith("/api/") || url.pathname === "/api") {
      return handleApiRoute(request, resolvedUrl);
    }

    const page = await renderPage(request, resolvedUrl, null);
    if (page) {
      return page;
    }

    return env.ASSETS.fetch(request);
  },
};
