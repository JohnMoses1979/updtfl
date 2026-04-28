import { BASE_URL } from "./config";
import { tokenStore } from "./tokenStore";

function normalizeApiBaseUrl(baseUrl) {
  const trimmed = String(baseUrl || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export const API_BASE_URL = normalizeApiBaseUrl(BASE_URL);

export async function request(url, options = {}) {
  try {
    const token = tokenStore.get();
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(data?.message || `Request failed: ${response.status}`);
    }

    return data?.data ?? data;
  } catch (error) {
    if (
      error instanceof TypeError &&
      String(error.message).toLowerCase().includes("network request failed")
    ) {
      throw new Error(
        `Network request failed. Using API ${API_BASE_URL}. Check that backend is reachable from this device.`
      );
    }
    throw error;
  }
}
