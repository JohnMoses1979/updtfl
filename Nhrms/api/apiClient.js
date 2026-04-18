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

export const API_BASE_URL = `http://${API_HOST}:${PORT}/api`;

export async function request(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(data?.message || `Request failed: ${response.status}`);
    }

    return data?.data ?? data;
  } catch (error) {
    if (error instanceof TypeError && String(error.message).toLowerCase().includes("network request failed")) {
      throw new Error(
        `Network request failed. Using API ${API_BASE_URL}. Make sure your phone and backend are on the same network and Spring Boot is running on port ${PORT}.`
      );
    }
    throw error;
  }
}
