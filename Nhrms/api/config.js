// api/config.js — COMPLETE REPLACEMENT
import { Platform } from "react-native";
import Constants from "expo-constants";

// ── Auto-detect API host (same logic as apiClient.js) ─────────────────────
function extractHost(candidate) {
  if (!candidate || typeof candidate !== "string") return null;
  const trimmed = candidate.trim();
  if (!trimmed) return null;
  const noProtocol = trimmed.replace(/^https?:\/\//, "");
  return noProtocol.split(":")[0] || null;
}

function resolveMobileHost() {
  const expoHost =
    extractHost(Constants.expoConfig?.hostUri) ||
    extractHost(Constants.manifest2?.extra?.expoClient?.hostUri) ||
    extractHost(Constants.manifest?.debuggerHost) ||
    extractHost(Constants.expoGoConfig?.debuggerHost);

  // Fallback to the hardcoded LAN IP if Expo detection fails
  return expoHost || "192.168.0.28";
}

const PORT = "8080";

const getBaseUrl = () => {
  if (Platform.OS === "web") return `http://localhost:${PORT}`;
  const host = resolveMobileHost();
  return `http://${host}:${PORT}`;
};

export const BASE_URL = getBaseUrl();

export const ENDPOINTS = {
  signup: "/api/auth/signup",
  uploadFace: "/api/auth/upload-face",
  verifyOtp: "/api/auth/verify-otp",
  resendOtp: "/api/auth/resend-otp",
  login: "/api/auth/login",
  verifyFace: "/api/attendance/verify-face",
  attendanceStatus: "/api/attendance/status",
};