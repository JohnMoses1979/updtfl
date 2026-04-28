// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   ImageBackground,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import * as LocalAuthentication from "expo-local-authentication";
// import { apiSignup } from "../api/authService";

// const COLORS = {
//   bg: "#112235",
//   card: "#0f1e30",
//   accent: "#38BDF8",
//   accentDark: "#0e4a6e",
//   text: "#ffffff",
//   muted: "#c7d2fe",
//   border: "#1a3a5c",
//   inputBg: "#f8fafc",
//   error: "#FF6B6B",
// };

// function InputField({ label, placeholder, value, onChangeText, secureTextEntry = false }) {
//   const [hidden, setHidden] = useState(secureTextEntry);

//   return (
//     <View style={{ marginBottom: 14 }}>
//       <Text style={styles.label}>{label}</Text>
//       <View style={styles.inputWrap}>
//         <TextInput
//           placeholder={placeholder}
//           placeholderTextColor="#8aa0b8"
//           value={value}
//           onChangeText={onChangeText}
//           secureTextEntry={hidden}
//           autoCapitalize="none"
//           style={styles.input}
//         />
//         {secureTextEntry ? (
//           <TouchableOpacity onPress={() => setHidden((v) => !v)} style={styles.eyeBtn}>
//             <Text style={styles.eyeText}>{hidden ? "🙈" : "👁️"}</Text>
//           </TouchableOpacity>
//         ) : null}
//       </View>
//     </View>
//   );
// }

// async function runDeviceBiometric() {
//   const hardware = await LocalAuthentication.hasHardwareAsync();
//   const enrolled = await LocalAuthentication.isEnrolledAsync();

//   if (!hardware || !enrolled) {
//     throw new Error("Biometric authentication is not available on this device.");
//   }

//   const result = await LocalAuthentication.authenticateAsync({
//     promptMessage: "Confirm fingerprint to create admin account",
//     fallbackLabel: "Cancel",
//     cancelLabel: "Cancel",
//     disableDeviceFallback: true,
//   });

//   if (!result.success) {
//     if (result.error === "user_cancel" || result.error === "user_fallback") {
//       throw new Error("Biometric setup was cancelled.");
//     }
//     throw new Error("Biometric verification failed.");
//   }
// }

// function FirstScreen({ onSignUp, onSignIn }) {
//   return (
//     <ImageBackground source={require("../assets/bg.jpg")} style={styles.hero} resizeMode="cover">
//       <View style={styles.heroOverlay}>
//         <View style={styles.heroContent}>
//           <Text style={styles.brand}>BLISS SIERRA SOFTWARE SOLUTIONS</Text>
//           <Text style={styles.heroTitle}>Secure admin access, one fingerprint at a time.</Text>
//           <Text style={styles.heroSub}>
//             Sign up an admin account with device biometric protection, then return to sign in.
//           </Text>
//           <TouchableOpacity style={styles.primaryBtn} onPress={onSignUp}>
//             <Text style={styles.primaryBtnText}>Sign Up</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.secondaryBtn} onPress={onSignIn}>
//             <Text style={styles.secondaryBtnText}>Sign In</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ImageBackground>
//   );
// }

// function AdminSignupForm({ goToSignIn }) {
//   const [form, setForm] = useState({ username: "", password: "", confirm: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleRegister = async () => {
//     if (!form.username.trim() || !form.password.trim() || !form.confirm.trim()) {
//       setError("Username and password are required.");
//       return;
//     }

//     if (form.password !== form.confirm) {
//       setError("Passwords do not match.");
//       return;
//     }

//     if (form.password.length < 6) {
//       setError("Password must be at least 6 characters.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       await runDeviceBiometric();

//       await apiSignup({
//         username: form.username.trim(),
//         password: form.password,
//         loginType: "ADMIN",
//         biometricEnabled: true,
//       });

//       Alert.alert("Success", "Admin account created. Please sign in.");
//       goToSignIn?.();
//     } catch (err) {
//       setError(err.message || "Admin signup failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.formCard}>
//       <Text style={styles.sectionTag}>Admin Registration</Text>
//       <Text style={styles.title}>Create your admin account</Text>
//       <Text style={styles.subTitle}>Use only a username and password. Biometric setup happens on submit.</Text>

//       <InputField
//         label="Username"
//         placeholder="Enter username"
//         value={form.username}
//         onChangeText={(v) => setForm((prev) => ({ ...prev, username: v }))}
//       />
//       <InputField
//         label="Password"
//         placeholder="Enter password"
//         value={form.password}
//         secureTextEntry
//         onChangeText={(v) => setForm((prev) => ({ ...prev, password: v }))}
//       />
//       <InputField
//         label="Confirm Password"
//         placeholder="Confirm password"
//         value={form.confirm}
//         secureTextEntry
//         onChangeText={(v) => setForm((prev) => ({ ...prev, confirm: v }))}
//       />

//       {error ? <Text style={styles.errorText}>{error}</Text> : null}

//       <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
//         {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Register</Text>}
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.ghostBtn} onPress={goToSignIn} disabled={loading}>
//         <Text style={styles.ghostBtnText}>Back to Sign In</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// export function SignUpFlow({ onBack, goToSignIn }) {
//   return (
//     <SafeAreaView style={styles.screen}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={20}
//       >
//         <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
//           <AdminSignupForm goToSignIn={goToSignIn || onBack} />
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// export default FirstScreen;

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: COLORS.bg,
//   },
//   scroll: {
//     flexGrow: 1,
//     justifyContent: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 28,
//   },
//   formCard: {
//     backgroundColor: COLORS.card,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 20,
//   },
//   sectionTag: {
//     color: COLORS.accent,
//     fontSize: 12,
//     fontWeight: "800",
//     letterSpacing: 0,
//     textTransform: "uppercase",
//     marginBottom: 8,
//   },
//   title: {
//     color: COLORS.text,
//     fontSize: 26,
//     fontWeight: "800",
//     lineHeight: 32,
//   },
//   subTitle: {
//     color: "#b7c6d9",
//     marginTop: 8,
//     marginBottom: 18,
//     lineHeight: 20,
//   },
//   label: {
//     color: COLORS.text,
//     marginBottom: 8,
//     fontWeight: "600",
//   },
//   inputWrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: COLORS.inputBg,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "transparent",
//     overflow: "hidden",
//   },
//   input: {
//     flex: 1,
//     paddingHorizontal: 14,
//     paddingVertical: 14,
//     fontSize: 16,
//     color: "#0f172a",
//   },
//   eyeBtn: {
//     paddingHorizontal: 14,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   eyeText: {
//     fontSize: 16,
//   },
//   errorText: {
//     color: COLORS.error,
//     marginTop: 2,
//     marginBottom: 10,
//   },
//   primaryBtn: {
//     backgroundColor: COLORS.accentDark,
//     paddingVertical: 15,
//     borderRadius: 28,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   primaryBtnText: {
//     color: COLORS.text,
//     fontSize: 16,
//     fontWeight: "800",
//   },
//   secondaryBtn: {
//     marginTop: 12,
//     paddingVertical: 14,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     borderRadius: 28,
//   },
//   secondaryBtnText: {
//     color: COLORS.accent,
//     fontWeight: "700",
//   },
//   ghostBtn: {
//     marginTop: 8,
//     paddingVertical: 10,
//     alignItems: "center",
//   },
//   ghostBtnText: {
//     color: "#cbd5e1",
//     fontWeight: "600",
//   },
//   hero: {
//     flex: 1,
//   },
//   heroOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(5, 15, 28, 0.62)",
//     justifyContent: "center",
//     paddingHorizontal: 22,
//   },
//   heroContent: {
//     maxWidth: 520,
//   },
//   brand: {
//     color: COLORS.accent,
//     fontSize: 12,
//     fontWeight: "800",
//     letterSpacing: 0,
//     textTransform: "uppercase",
//     marginBottom: 14,
//   },
//   heroTitle: {
//     color: COLORS.text,
//     fontSize: 32,
//     lineHeight: 40,
//     fontWeight: "900",
//     marginBottom: 12,
//   },
//   heroSub: {
//     color: "#dbeafe",
//     fontSize: 15,
//     lineHeight: 22,
//     marginBottom: 22,
//     maxWidth: 420,
//   },
// });










/**
 * auth/Signup.js
 *
 * MERGED VERSION:
 * - Keeps OLD FILE full working signup flow and UI
 * - Adds employee-side admin approval request behavior from NEW FILE
 * - Does not remove old existing functionality
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { apiSignup, apiUploadFace, apiVerifyOtp } from "../api/authService";

const C = {
  bg: "#112235",
  bgCard: "#0f1e30",
  orange: "#3B82F6",
  white: "#151414",
  gray: "#AAAAAA",
  border: "#1a3a5c",
  inputBg: "#EFF6FF",
};

function InputField({ label, placeholder, value, onChangeText, secureTextEntry = false }) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={C.gray}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          style={styles.inputFlex}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden((h) => !h)} style={styles.eyeInside}>
            <Text style={styles.eyeText}>{hidden ? "👁️" : "🙈"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function normalizeEmpIdInput(value) {
  return String(value || "").toUpperCase().replace(/\s+/g, "");
}

function StepBar({ step }) {
  const steps = ["Details", "Face ID", "Verify"];
  return (
    <View style={styles.stepRow}>
      {steps.map((item, i) => (
        <View key={i} style={styles.stepWrap}>
          <View style={[styles.circle, { backgroundColor: i <= step ? "#2F6E8E" : "#222" }]}>
            <Text style={{ color: C.white }}>{i + 1}</Text>
          </View>
          <Text style={{ color: i <= step ? "#2F6E8E" : C.gray, fontSize: 11 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function StepDetails({ form, setForm, onNext, onBack }) {
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.empId.trim() || !form.designation.trim()) {
      setPasswordError("Please fill in all fields.");
      return;
    }

    if (form.password !== form.confirm) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setPasswordError("");
    setLoading(true);

    try {
      await apiSignup({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        empId: form.empId.trim(),
        designation: form.designation.trim(),
        password: form.password,
        loginType: "EMPLOYEE",
      });
      onNext();
    } catch (err) {
      setPasswordError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
          <Text style={{ fontSize: 24, color: "#2F6E8E" }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>
      <Text style={styles.registrationTitle}>Registration</Text>
      <Text style={styles.title}>Your Details</Text>
      <Text style={styles.sub}>Fill your basic information</Text>

      <InputField
        label="Name"
        placeholder="Enter Name"
        value={form.name}
        onChangeText={(v) => setForm({ ...form, name: v })}
      />

      <InputField
        label="Email"
        placeholder="Enter Email"
        value={form.email}
        onChangeText={(v) => setForm({ ...form, email: v })}
      />

      <InputField
        label="Employee ID"
        placeholder="Employee ID"
        value={form.empId}
        onChangeText={(v) => setForm({ ...form, empId: normalizeEmpIdInput(v) })}
      />

      <InputField
        label="Designation"
        placeholder="Designation"
        value={form.designation}
        onChangeText={(v) => setForm({ ...form, designation: v })}
      />

      <InputField
        label="Password"
        placeholder="Password"
        secureTextEntry
        value={form.password}
        onChangeText={(v) => {
          setForm({ ...form, password: v });
          setPasswordError("");
        }}
      />

      <InputField
        label="Confirm Password"
        placeholder="Confirm Password"
        secureTextEntry
        value={form.confirm}
        onChangeText={(v) => {
          setForm({ ...form, confirm: v });
          setPasswordError("");
        }}
      />

      {passwordError !== "" && <Text style={styles.errorText}>{passwordError}</Text>}

      <TouchableOpacity
        style={[styles.orangeBtn, loading && { opacity: 0.7 }]}
        onPress={handleNext}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Next — Register Face</Text>}
      </TouchableOpacity>
    </View>
  );
}

function StepFace({ email, onNext, onBack }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUris, setCapturedUris] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, []);

  if (!permission) {
    return (
      <View style={{ alignItems: "center", marginTop: 40 }}>
        <ActivityIndicator color="#2F6E8E" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={{ alignItems: "center", marginTop: 40 }}>
        <Text style={[styles.sub, { textAlign: "center", marginBottom: 16 }]}>
          Camera permission is required to register your face.
        </Text>
        <TouchableOpacity style={styles.orangeBtn} onPress={requestPermission}>
          <Text style={styles.btnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const capture = async () => {
    if (capturedUris.length >= 3 || capturing) return;

    if (Platform.OS !== "web" && !cameraReady) {
      setUploadError("Camera is still loading. Please wait a moment and try again.");
      return;
    }

    setCapturing(true);
    setUploadError("");

    try {
      let photoUri;

      if (Platform.OS === "web") {
        photoUri = await captureFromVideoElement();
      } else {
        if (!cameraRef.current) {
          throw new Error("Camera not ready. Please wait a moment and try again.");
        }

        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
          exif: true,
          skipProcessing: false,
        });

        photoUri = photo.uri;
      }

      setCapturedUris((prev) => [...prev, photoUri]);
    } catch (err) {
      setUploadError("Failed to capture photo: " + err.message);
    } finally {
      setCapturing(false);
    }
  };

  async function captureFromVideoElement() {
    const video = document.querySelector("video");

    if (!video) {
      throw new Error("Camera video element not found. Please allow camera access and try again.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUri = canvas.toDataURL("image/jpeg", 0.85);
    return dataUri;
  }

  const retake = () => {
    setCapturedUris([]);
    setUploadError("");
  };

  const handleContinue = async () => {
    if (capturedUris.length < 3) {
      setUploadError("Please capture all 3 photos first.");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      await apiUploadFace(email, capturedUris);

      // added from new flow: send fresh otp after face upload
      // await apiResendOtp(email);

      onNext();
    } catch (err) {
      setUploadError(err.message || "Face upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const remaining = 3 - capturedUris.length;

  return (
    <View style={{ alignItems: "center" }}>
      <Text style={styles.title}>Register Your Face</Text>
      <Text style={styles.sub}>
        {remaining > 0
          ? `Capture ${remaining} more photo${remaining > 1 ? "s" : ""} (${capturedUris.length}/3)`
          : "All 3 photos captured! Tap Continue."}
      </Text>

      {capturedUris.length < 3 ? (
        <View style={styles.cameraWrap}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
            onCameraReady={() => setCameraReady(true)}
          />
          <View style={styles.cameraOverlay}>
            <Text style={styles.cameraOverlayText}>{capturedUris.length}/3</Text>
          </View>
        </View>
      ) : (
        <View style={styles.cameraWrap}>
          <Image source={{ uri: capturedUris[2] }} style={[styles.camera, { borderRadius: 20 }]} />
          <View style={[styles.cameraOverlay, { backgroundColor: "rgba(34,197,94,0.7)" }]}>
            <Text style={styles.cameraOverlayText}>✓ 3/3</Text>
          </View>
        </View>
      )}

      {capturedUris.length < 3 && (
        <TouchableOpacity
          style={[
            styles.orangeBtn,
            (capturing || (Platform.OS !== "web" && !cameraReady)) && { opacity: 0.5 },
          ]}
          onPress={capture}
          disabled={capturing || uploading || (Platform.OS !== "web" && !cameraReady)}
        >
          {capturing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>📷 Capture Photo {capturedUris.length + 1}/3</Text>
          )}
        </TouchableOpacity>
      )}

      {capturedUris.length > 0 && (
        <View style={styles.previewRow}>
          {capturedUris.map((uri, i) => (
            <View key={i} style={styles.previewWrap}>
              <Image source={{ uri }} style={styles.preview} />
              <Text style={styles.previewTick}>✓</Text>
            </View>
          ))}
        </View>
      )}

      {uploadError !== "" && (
        <Text style={[styles.errorText, { textAlign: "center", marginTop: 8 }]}>
          {uploadError}
        </Text>
      )}

      {capturedUris.length > 0 && !uploading && (
        <TouchableOpacity style={[styles.outlineBtn, { marginTop: 8 }]} onPress={retake}>
          <Text style={styles.outlineText}>↺ Retake All</Text>
        </TouchableOpacity>
      )}

      {capturedUris.length >= 3 && (
        <TouchableOpacity
          style={[styles.orangeBtn, uploading && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>✓ Continue to Verify Email</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.outlineBtn, { marginTop: 8 }]} onPress={onBack}>
        <Text style={styles.outlineText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

function SuccessModal({ visible, onGoToSignIn, accountType = "EMPLOYEE" }) {
  const isAdmin = accountType === "ADMIN";
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalIcon}>🎉</Text>
          <Text style={styles.modalTitle}>{isAdmin ? "Account Activated!" : "Signup Request Sent!"}</Text>
          <Text style={styles.modalSub}>
            {isAdmin
              ? "Your admin account is verified and active now."
              : "Your signup request has been sent to admin for approval.\n\nOnce admin approves your account, you can sign in."}
          </Text>
          <TouchableOpacity style={styles.orangeBtn} onPress={onGoToSignIn}>
            <Text style={styles.btnText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function StepOtp({ email, onDone, accountType = "EMPLOYEE" }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  const OTP_VALIDITY_SECONDS = 300;
  const [secondsLeft, setSecondsLeft] = useState(OTP_VALIDITY_SECONDS);
  const [otpExpired, setOtpExpired] = useState(false);

  const inputs = useRef([]);
  const timerRef = useRef(null);

  const startTimer = () => {
    setSecondsLeft(OTP_VALIDITY_SECONDS);
    setOtpExpired(false);
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setOtpExpired(true);
          setError("OTP has expired. Please click 'Resend OTP' to get a new code.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const timerColor =
    secondsLeft > 120 ? "#22C55E" :
      secondsLeft > 60 ? "#F59E0B" : "#EF4444";

  const handleChange = (value, index) => {
    if (otpExpired) return;

    const clean = value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);
    setError("");

    if (clean && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (otpExpired) {
      setError("OTP has expired. Please click 'Resend OTP' to get a new code.");
      return;
    }

    const joined = otp.join("");
    if (joined.length < 6) {
      setError("Please enter the full 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiVerifyOtp(email, joined);
      clearInterval(timerRef.current);
      setShowModal(true);
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");

      if (err.message && err.message.toLowerCase().includes("expir")) {
        setOtpExpired(true);
        setSecondsLeft(0);
        clearInterval(timerRef.current);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");

    try {
      await apiResendOtp(email);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
      startTimer();
    } catch (err) {
      setError(err.message || "Could not resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const canSubmit = !otpExpired && !loading && otp.join("").length === 6;

  return (
    <View>
      <SuccessModal visible={showModal} onGoToSignIn={onDone} accountType={accountType} />
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.sub}>Code sent to {email}</Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 8,
          gap: 8,
        }}
      >
        <Text style={{ color: timerColor, fontSize: 22, fontWeight: "800" }}>
          {otpExpired ? "00:00" : formatTimer(secondsLeft)}
        </Text>
        <Text style={{ color: "#888", fontSize: 13 }}>
          {otpExpired ? "⏱ Expired" : "remaining"}
        </Text>
      </View>

      <View style={styles.otpRow}>
        {otp.map((item, i) => (
          <TextInput
            key={i}
            ref={(ref) => (inputs.current[i] = ref)}
            maxLength={1}
            keyboardType="numeric"
            value={item}
            onChangeText={(v) => handleChange(v, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            editable={!otpExpired}
            style={[
              styles.otpBox,
              otpExpired && { opacity: 0.4, backgroundColor: "#ccc" },
            ]}
          />
        ))}
      </View>

      {otpExpired && (
        <View
          style={{
            backgroundColor: "#FEE2E2",
            borderRadius: 10,
            padding: 10,
            marginTop: 8,
            marginBottom: 4,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#DC2626", fontSize: 13, fontWeight: "600" }}>
            ⏰ OTP has expired. Please request a new one.
          </Text>
        </View>
      )}

      {error !== "" && (
        <Text style={[styles.errorText, { textAlign: "center" }]}>{error}</Text>
      )}

      <View style={{ alignItems: "center", marginTop: 12, marginBottom: 6 }}>
        <TouchableOpacity onPress={handleResend} disabled={resending}>
          <Text style={{ color: "#2F6E8E", fontWeight: "700", fontSize: 14 }}>
            {resending ? "Sending…" : "Resend OTP"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.orangeBtn,
          !canSubmit && { opacity: 0.4, backgroundColor: "#888" },
        ]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>
            {otpExpired ? "OTP Expired — Resend First" : "Submit"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export function SignUpFlow({ onBack, goToSignIn }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    empId: "",
    designation: "",
    password: "",
    confirm: "",
    loginType: "EMPLOYEE",
  });

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepBar step={step} />

          {step === 0 && (
            <StepDetails form={form} setForm={setForm} onNext={() => setStep(1)} onBack={onBack} />
          )}

          {step === 1 && (
            <StepFace
              email={form.email}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}

          {step === 2 && (
            <StepOtp
              email={form.email}
              accountType="EMPLOYEE"
              onDone={goToSignIn || onBack}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function FirstScreen({ onSignUp, onSignIn }) {
  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.heroContent}>
          <Text style={styles.brandTitle}>
            <Text style={styles.orangeText}>BLISS SIERRA </Text>
            <Text style={styles.whiteText}>SOFTWARE SOLUTIONS</Text>
          </Text>

          <Text style={styles.bigTitle}>
            Navigate Your Work Journey Efficient & Easy
          </Text>

          <Text style={styles.subCenter}>
            Increase your work management & career development radically
          </Text>

          <TouchableOpacity style={styles.orangeBtn} onPress={onSignUp}>
            <Text style={styles.btnText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn} onPress={onSignIn}>
            <Text style={styles.outlineText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 20 },
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  heroContent: { marginTop: 40 },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 290,
    lineHeight: 30,
    marginTop: -50,
  },
  orangeText: { color: "#2F6E8E" },
  whiteText: { color: "white" },
  title: { color: "white", fontSize: 24, fontWeight: "700", marginBottom: 6 },
  bigTitle: {
    color: "white",
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 40,
    marginBottom: 14,
  },
  sub: { color: C.gray, marginBottom: 20 },
  subCenter: { color: C.gray, fontSize: 15, lineHeight: 24, marginBottom: 40 },
  label: { color: C.gray, marginBottom: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
  },
  inputFlex: { flex: 1, padding: 14, color: C.white },
  eyeInside: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeText: { fontSize: 16 },
  orangeBtn: {
    backgroundColor: "#2F6E8E",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 14,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: C.white,
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 14,
  },
  btnText: { color: "white", fontWeight: "700", backgroundColor: "#2F6E8E" },
  outlineText: { color: "white", fontWeight: "700" },
  stepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    marginTop: 30,
  },
  stepWrap: { alignItems: "center" },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  cameraWrap: {
    width: 260,
    height: 320,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 20,
    position: "relative",
  },
  camera: { flex: 1 },
  cameraOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cameraOverlayText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  previewRow: { flexDirection: "row", marginTop: 16, gap: 10 },
  previewWrap: { position: "relative" },
  preview: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#22C55E",
  },
  previewTick: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#22C55E",
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: "center",
    lineHeight: 18,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderRadius: 10,
    backgroundColor: C.inputBg,
    color: C.white,
    fontSize: 20,
    textAlign: "center",
  },
  registrationTitle: {
    color: "#2F6E8E",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  errorText: { color: "#FF4D4D", fontSize: 13, marginTop: 4, marginBottom: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalCard: {
    backgroundColor: "#0f1e30",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: C.border,
  },
  modalIcon: { fontSize: 52, marginBottom: 14 },
  modalTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSub: {
    color: C.gray,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 6,
  },
});
