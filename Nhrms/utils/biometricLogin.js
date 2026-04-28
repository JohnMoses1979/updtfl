import { Platform } from "react-native";
import * as Device from "expo-device";

const SETTINGS_KEY = "@hrms_biometric_login";
const ADMIN_SETTINGS_KEY = "@hrms_admin_biometric_login";

// Generate a unique fingerprint key (tied to specific user + device)
const generateFingerprintKey = async (empId) => {
  const deviceId = Device.modelId || Device.osInternalBuildId || "unknown";
  const timestamp = Date.now();
  // Create a unique key combining: employee ID + device + timestamp
  return `${empId}-${deviceId}-${timestamp}`;
};

const storage = {
  async getItem(key) {
    try {
      if (Platform.OS === "web") return localStorage.getItem(key);
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key, value) {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(key, value);
        return;
      }
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.setItem(key, value);
    } catch {
      // ignore storage failures
    }
  },
  async removeItem(key) {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(key);
        return;
      }
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore storage failures
    }
  },
};

export async function getBiometricLoginSettings() {
  const raw = await storage.getItem(SETTINGS_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveBiometricLoginSettings(user) {
  if (!user?.empId) return;

  const fingerprintKey = await generateFingerprintKey(user.empId);
  const deviceId = Device.modelId || Device.osInternalBuildId || "unknown";

  await storage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      enabled: true,
      fingerprintKey,           // Unique key tied to this fingerprint registration
      deviceId,                 // Device where fingerprint was registered
      registeredAt: new Date().toISOString(),  // When fingerprint was registered
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        empId: user.empId,
        designation: user.designation,
        avatarUri: user.avatarUri || "",
        faceImagePaths: user.faceImagePaths || "",
      },
    })
  );
}

export async function validateBiometricFingerprint() {
  const settings = await getBiometricLoginSettings();
  if (!settings?.enabled || !settings?.fingerprintKey) {
    return false;
  }

  const deviceId = Device.modelId || Device.osInternalBuildId || "unknown";

  // Verify fingerprint is registered on the SAME device
  if (settings.deviceId !== deviceId) {
    console.warn("⚠️ Biometric registered on different device - invalid");
    return false;
  }

  // Verify fingerprint key exists (prevents access from other registered fingerprints)
  if (!settings.fingerprintKey) {
    console.warn("⚠️ Fingerprint not properly registered");
    return false;
  }

  return true;
}

export async function updateBiometricLoginUserIfEnabled(user) {
  if (!user?.empId) return;

  const settings = await getBiometricLoginSettings();
  if (settings?.enabled === true && settings?.user?.empId === user.empId) {
    // Re-save with new user data but keep the same fingerprint key
    const deviceId = Device.modelId || Device.osInternalBuildId || "unknown";
    
    await storage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        enabled: true,
        fingerprintKey: settings.fingerprintKey,  // Keep original fingerprint key
        deviceId: settings.deviceId,              // Keep original device
        registeredAt: settings.registeredAt,      // Keep original registration time
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          empId: user.empId,
          designation: user.designation,
          avatarUri: user.avatarUri || "",
          faceImagePaths: user.faceImagePaths || "",
        },
      })
    );
  }
}

export async function clearBiometricLoginSettings() {
  await storage.removeItem(SETTINGS_KEY);
}

export async function getAdminBiometricLoginSettings() {
  const raw = await storage.getItem(ADMIN_SETTINGS_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveAdminBiometricLoginSettings(adminProfile = {}) {
  const deviceId = Device.modelId || Device.osInternalBuildId || "unknown";
  const fingerprintKey = await generateFingerprintKey("admin");

  await storage.setItem(
    ADMIN_SETTINGS_KEY,
    JSON.stringify({
      enabled: true,
      fingerprintKey,
      deviceId,
      registeredAt: new Date().toISOString(),
      user: {
        userId: "admin",
        empId: "admin",
        name: adminProfile.name || "Admin",
        designation: adminProfile.designation || "Administrator",
        avatarUri: adminProfile.avatarUri || "",
        role: "admin",
        isAdmin: true,
      },
    })
  );
}

export async function validateAdminBiometricFingerprint() {
  const settings = await getAdminBiometricLoginSettings();
  if (!settings?.enabled || !settings?.fingerprintKey) {
    return false;
  }

  const deviceId = Device.modelId || Device.osInternalBuildId || "unknown";
  if (settings.deviceId !== deviceId) {
    console.warn("Admin biometric registered on different device - invalid");
    return false;
  }

  return true;
}

export async function updateAdminBiometricLoginUserIfEnabled(adminProfile = {}) {
  const settings = await getAdminBiometricLoginSettings();
  if (settings?.enabled !== true) return;

  await storage.setItem(
    ADMIN_SETTINGS_KEY,
    JSON.stringify({
      ...settings,
      user: {
        ...(settings.user || {}),
        userId: "admin",
        empId: "admin",
        name: adminProfile.name || settings.user?.name || "Admin",
        designation: adminProfile.designation || settings.user?.designation || "Administrator",
        avatarUri: adminProfile.avatarUri || settings.user?.avatarUri || "",
        role: "admin",
        isAdmin: true,
      },
    })
  );
}

export async function clearAdminBiometricLoginSettings() {
  await storage.removeItem(ADMIN_SETTINGS_KEY);
}
