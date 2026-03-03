import { handleApiRoute, renderPage } from "../dist/server/entry.js";

interface Env {
  ASSETS: Fetcher;
  PROVIDER_DATA_BUCKET?: R2Bucket;
  PROVIDER_DB?: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const resolvedUrl = `${url.pathname}${url.search}`;
    globalThis.__EIR_ASSET_FETCH__ = (assetPath: string) => {
      const assetUrl = new URL(assetPath, url.origin);
      return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
    };
    if (env.PROVIDER_DATA_BUCKET) {
      globalThis.__EIR_R2_GET_JSON__ = async (key: string) => {
        const object = await env.PROVIDER_DATA_BUCKET!.get(key);
        if (!object) return null;
        return object.json();
      };
    } else {
      globalThis.__EIR_R2_GET_JSON__ = undefined;
    }

    if (env.PROVIDER_DB) {
      globalThis.__EIR_D1_QUERY__ = async (sql: string, params: unknown[] = []) => {
        const statement = env.PROVIDER_DB!.prepare(sql).bind(...params)
        const result = await statement.all()
        return Array.isArray(result.results) ? result.results : []
      }
    } else {
      globalThis.__EIR_D1_QUERY__ = undefined
    }

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
