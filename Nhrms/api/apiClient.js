import { Platform } from "react-native";
import Constants from "expo-constants";

const WEB_HOST = "16.112.62.13";
const PORT = "8080";
const FALLBACK_MOBILE_HOST = "16.112.62.13";

function extractHost(candidate) {
  if (!candidate || typeof candidate !== "string") return null;
  const trimmed = candidate.trim();
  if (!trimmed) return null;

  const noProtocol = trimmed.replace(/^https?:\/\//, "");
  return noProtocol.split(":")[0] || null;
}

function resolveMobileHost() {
  
  return "16.112.62.13";
}

const API_HOST = Platform.OS === "web" ? WEB_HOST : resolveMobileHost();

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
