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

const EC2_IP = "https://workhrms.in";

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
