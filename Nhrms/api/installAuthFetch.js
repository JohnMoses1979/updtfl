import { BASE_URL } from "./config";
import { tokenStore } from "./tokenStore";

let installed = false;
let originalFetch = null;

function normalizeBase(base) {
  return String(base || "").trim().replace(/\/+$/, "");
}

function shouldAttachAuth(url) {
  const base = normalizeBase(BASE_URL);
  if (!base) return false;
  return String(url).startsWith(`${base}/api/`);
}

export function installAuthFetchInterceptor() {
  if (installed || typeof global.fetch !== "function") return;
  installed = true;
  originalFetch = global.fetch.bind(global);

  global.fetch = async (input, init = {}) => {
    try {
      const url = typeof input === "string" ? input : input?.url;
      if (!url || !shouldAttachAuth(url)) {
        return originalFetch(input, init);
      }

      const token = tokenStore.get();
      if (!token) {
        return originalFetch(input, init);
      }

      const currentHeaders = new Headers(init?.headers || (typeof input !== "string" ? input.headers : undefined));
      if (!currentHeaders.has("Authorization")) {
        currentHeaders.set("Authorization", `Bearer ${token}`);
      }

      return originalFetch(input, {
        ...init,
        headers: currentHeaders,
      });
    } catch {
      return originalFetch(input, init);
    }
  };
}

