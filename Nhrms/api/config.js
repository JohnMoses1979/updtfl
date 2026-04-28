// // api/config.js
// import { Platform } from "react-native";
// import Constants from "expo-constants";

// const WEB_HOST = "192.168.0.20";
// const PORT = "8080";
// const FALLBACK_MOBILE_HOST = "192.168.0.20";

// function extractHost(candidate) {
//   if (!candidate || typeof candidate !== "string") return null;
//   const trimmed = candidate.trim();
//   if (!trimmed) return null;

//   const noProtocol = trimmed.replace(/^https?:\/\//, "");
//   return noProtocol.split(":")[0] || null;
// }

// function resolveMobileHost() {
//   return (
//     extractHost(Constants.expoConfig?.hostUri) ||
//     extractHost(Constants.manifest2?.extra?.expoGo?.debuggerHost) ||
//     extractHost(Constants.manifest?.debuggerHost) ||
//     FALLBACK_MOBILE_HOST
//   );
// }

// const extraApiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
// const API_HOST = Platform.OS === "web" ? WEB_HOST : resolveMobileHost();

// export const BASE_URL =
//   typeof extraApiBaseUrl === "string" && extraApiBaseUrl.trim()
//     ? extraApiBaseUrl.trim().replace(/\/+$/, "")
//     : `http://${API_HOST}:${PORT}`;

// export const ENDPOINTS = {
//   signup: "/api/auth/signup",
//   uploadFace: "/api/auth/upload-face",
//   verifyOtp: "/api/auth/verify-otp",
//   resendOtp: "/api/auth/resend-otp",
//   login: "/api/auth/login",
//   verifyFace: "/api/attendance/verify-face",
//   attendanceStatus: "/api/attendance/status",
// };


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

// const EC2_IP = "https://workhrms.in";
const EC2_IP = "http://192.168.0.41:8080";

export const BASE_URL = EC2_IP;

export const ENDPOINTS = {
  signup: "/api/auth/signup",
  uploadFace: "/api/auth/upload-face",
  verifyOtp: "/api/auth/verify-otp",
  resendOtp: "/api/auth/resend-otp",
  login: "/api/auth/login",
  verifyFace: "/api/attendance/verify-face",
  attendanceStatus: "/api/attendance/status",
};
