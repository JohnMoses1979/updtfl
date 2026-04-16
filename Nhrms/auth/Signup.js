// /**
//  * auth/Signup.js  — COMPLETE FILE
//  *
//  * KEY FIXES vs previous version:
//  *
//  * StepFace — WEB vs MOBILE camera handling:
//  *   Web    : CameraView on web renders as <video>. takePictureAsync() returns
//  *            a base64 data URI (data:image/png;base64,...) but the ref approach
//  *            is unreliable. We use a hidden <canvas> to snapshot the <video>
//  *            element directly, giving us a reliable base64 PNG every time.
//  *
//  *   Mobile : cameraRef.current.takePictureAsync() returns {uri: "file://..."}
//  *            which works fine as-is.
//  *
//  * apiUploadFace (in authService.js) converts data URIs → File/Blob on web,
//  * so Spring Boot always receives real file parts named "images".
//  *
//  * All original styles / layout / colours UNTOUCHED.
//  */
// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   Image,
//   ImageBackground,
//   Modal,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
// } from "react-native";
// import { CameraView, useCameraPermissions } from "expo-camera";
// import { apiSignup, apiUploadFace, apiVerifyOtp, apiResendOtp } from "../api/authService";
// const C = {
//   bg: "#112235",
//   bgCard: "#0f1e30",
//   orange: "#3B82F6",
//   white: "#151414",
//   gray: "#AAAAAA",
//   border: "#1a3a5c",
//   inputBg: "#EFF6FF",
// };
// // ── Shared Input Field (unchanged) ───────────────────────────────────────────
// function InputField({ label, placeholder, value, onChangeText, secureTextEntry = false }) {
//   const [hidden, setHidden] = useState(secureTextEntry);
//   return (
//     <View style={{ marginBottom: 14 }}>
//       <Text style={styles.label}>{label}</Text>
//       <View style={styles.inputWrap}>
//         <TextInput
//           placeholder={placeholder}
//           placeholderTextColor={C.gray}
//           value={value}
//           onChangeText={onChangeText}
//           secureTextEntry={hidden}
//           style={styles.inputFlex}
//         />
//         {secureTextEntry && (
//           <TouchableOpacity onPress={() => setHidden((h) => !h)} style={styles.eyeInside}>
//             <Text style={styles.eyeText}>{hidden ? "👁️" : "🙈"}</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// }
// // ── Step Bar (unchanged) ─────────────────────────────────────────────────────
// function StepBar({ step }) {
//   const steps = ["Details", "Face ID", "Verify"];
//   return (
//     <View style={styles.stepRow}>
//       {steps.map((item, i) => (
//         <View key={i} style={styles.stepWrap}>
//           <View style={[styles.circle, { backgroundColor: i <= step ? "#2F6E8E" : "#222" }]}>
//             <Text style={{ color: C.white }}>{i + 1}</Text>
//           </View>
//           <Text style={{ color: i <= step ? "#2F6E8E" : C.gray, fontSize: 11 }}>{item}</Text>
//         </View>
//       ))}
//     </View>
//   );
// }
// // ── Step 1: Details → POST /api/auth/signup ──────────────────────────────────
// function StepDetails({ form, setForm, onNext }) {
//   const [passwordError, setPasswordError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const handleNext = async () => {
//     if (!form.name.trim() || !form.email.trim() || !form.empId.trim() || !form.designation.trim()) {
//       setPasswordError("Please fill in all fields.");
//       return;
//     }
//     if (form.password !== form.confirm) {
//       setPasswordError("Passwords do not match");
//       return;
//     }
//     if (form.password.length < 6) {
//       setPasswordError("Password must be at least 6 characters");
//       return;
//     }
//     setPasswordError("");
//     setLoading(true);
//     try {
//       await apiSignup({
//         name: form.name.trim(),
//         email: form.email.trim().toLowerCase(),
//         empId: form.empId.trim(),
//         designation: form.designation.trim(),
//         password: form.password,
//       });
//       onNext();
//     } catch (err) {
//       setPasswordError(err.message || "Registration failed. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <View>
//       <Text style={styles.registrationTitle}>Registration</Text>
//       <Text style={styles.title}>Your Details</Text>
//       <Text style={styles.sub}>Fill your basic information</Text>
//       <InputField label="Name" placeholder="Enter Name" value={form.name}
//         onChangeText={(v) => setForm({ ...form, name: v })} />
//       <InputField label="Email" placeholder="Enter Email" value={form.email}
//         onChangeText={(v) => setForm({ ...form, email: v })} />
//       <InputField label="Employee ID" placeholder="Employee ID" value={form.empId}
//         onChangeText={(v) => setForm({ ...form, empId: v })} />
//       <InputField label="Designation" placeholder="Designation" value={form.designation}
//         onChangeText={(v) => setForm({ ...form, designation: v })} />
//       <InputField label="Password" placeholder="Password" secureTextEntry
//         value={form.password} onChangeText={(v) => { setForm({ ...form, password: v }); setPasswordError(""); }} />
//       <InputField label="Confirm Password" placeholder="Confirm Password" secureTextEntry
//         value={form.confirm} onChangeText={(v) => { setForm({ ...form, confirm: v }); setPasswordError(""); }} />
//       {passwordError !== "" && <Text style={styles.errorText}>{passwordError}</Text>}
//       <TouchableOpacity style={[styles.orangeBtn, loading && { opacity: 0.7 }]}
//         onPress={handleNext} disabled={loading}>
//         {loading
//           ? <ActivityIndicator color="#fff" />
//           : <Text style={styles.btnText}>Next — Register Face</Text>}
//       </TouchableOpacity>
//     </View>
//   );
// }
// // ── Step 2: Face capture → POST /api/auth/upload-face ────────────────────────
// //
// // CROSS-PLATFORM CAMERA STRATEGY
// // ───────────────────────────────
// // Web:
// //   expo-camera's CameraView renders as a <video> element.
// //   takePictureAsync() on web sometimes returns a data URI but the ref
// //   is not always available. The most reliable approach is:
// //   1. Find the <video> element in the DOM.
// //   2. Draw it onto a hidden <canvas>.
// //   3. Call canvas.toDataURL() → reliable base64 PNG every time.
// //
// // Mobile (Expo Go / native):
// //   cameraRef.current.takePictureAsync() returns { uri: "file://..." }
// //   which is a real file path that multipart fetch can stream directly.
// //
// function StepFace({ email, onNext, onBack }) {
//   const cameraRef = useRef(null);
//   const [permission, requestPermission] = useCameraPermissions();
//   // Array of captured photo URIs (data: on web, file:// on mobile)
//   const [capturedUris, setCapturedUris] = useState([]);
//   // UI state
//   const [uploading, setUploading] = useState(false);
//   const [uploadError, setUploadError] = useState("");
//   const [capturing, setCapturing] = useState(false);
//   useEffect(() => {
//     (async () => {
//       if (!permission?.granted) {
//         await requestPermission();
//       }
//     })();
//   }, []);
//   if (!permission) {
//     return (
//       <View style={{ alignItems: "center", marginTop: 40 }}>
//         <ActivityIndicator color="#2F6E8E" />
//       </View>
//     );
//   }
//   if (!permission.granted) {
//     return (
//       <View style={{ alignItems: "center", marginTop: 40 }}>
//         <Text style={[styles.sub, { textAlign: "center", marginBottom: 16 }]}>
//           Camera permission is required to register your face.
//         </Text>
//         <TouchableOpacity style={styles.orangeBtn} onPress={requestPermission}>
//           <Text style={styles.btnText}>Allow Camera</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }
//   // ── Capture a photo ──────────────────────────────────────────────────────
//   const capture = async () => {
//     if (capturedUris.length >= 3 || capturing) return;
//     setCapturing(true);
//     setUploadError("");
//     try {
//       let photoUri;
//       if (Platform.OS === "web") {
//         // ── WEB: snapshot the live <video> via <canvas> ──────────────────
//         photoUri = await captureFromVideoElement();
//       } else {
//         // ── MOBILE: use the expo-camera ref ──────────────────────────────
//         if (!cameraRef.current) {
//           throw new Error("Camera not ready. Please wait a moment and try again.");
//         }
//         console.log("[StepFace] Mobile: takePictureAsync...");
//         const photo = await cameraRef.current.takePictureAsync({
//           quality: 0.8,
//           base64: false,
//           skipProcessing: false,
//         });
//         photoUri = photo.uri;
//         console.log("[StepFace] Mobile photo URI:", photoUri.substring(0, 60));
//       }
//       setCapturedUris((prev) => [...prev, photoUri]);
//       console.log(`[StepFace] Photo ${capturedUris.length + 1}/3 captured`);
//     } catch (err) {
//       console.error("[StepFace] Capture error:", err);
//       setUploadError("Failed to capture photo: " + err.message);
//     } finally {
//       setCapturing(false);
//     }
//   };
//   /**
//    * Web-only: find the <video> element rendered by CameraView and draw
//    * a single frame onto an off-screen <canvas>, then export as base64 PNG.
//    */
//   async function captureFromVideoElement() {
//     // expo-camera renders a <video> inside a container. Find it.
//     const video = document.querySelector("video");
//     if (!video) {
//       throw new Error("Camera video element not found. Please allow camera access and try again.");
//     }
//     const canvas = document.createElement("canvas");
//     canvas.width = video.videoWidth || 640;
//     canvas.height = video.videoHeight || 480;
//     const ctx = canvas.getContext("2d");
//     // Mirror horizontally so the selfie is not flipped (front camera)
//     ctx.save();
//     ctx.translate(canvas.width, 0);
//     ctx.scale(-1, 1);
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     ctx.restore();
//     const dataUri = canvas.toDataURL("image/jpeg", 0.85);
//     console.log("[StepFace] Web canvas capture: data URI length =", dataUri.length);
//     return dataUri;
//   }
//   const retake = () => {
//     setCapturedUris([]);
//     setUploadError("");
//   };
//   const handleContinue = async () => {
//     if (capturedUris.length < 3) {
//       setUploadError("Please capture all 3 photos first.");
//       return;
//     }
//     setUploadError("");
//     setUploading(true);
//     try {
//       console.log("[StepFace] Uploading", capturedUris.length, "images for email:", email);
//       const result = await apiUploadFace(email, capturedUris);
//       console.log("[StepFace] Upload success:", result);
//       onNext();
//     } catch (err) {
//       console.error("[StepFace] Upload error:", err);
//       setUploadError(err.message || "Face upload failed. Please try again.");
//     } finally {
//       setUploading(false);
//     }
//   };
//   const remaining = 3 - capturedUris.length;
//   return (
//     <View style={{ alignItems: "center" }}>
//       <Text style={styles.title}>Register Your Face</Text>
//       <Text style={styles.sub}>
//         {remaining > 0
//           ? `Capture ${remaining} more photo${remaining > 1 ? "s" : ""} (${capturedUris.length}/3)`
//           : "All 3 photos captured! Tap Continue."}
//       </Text>
//       {/* Camera — always rendered while photos still needed */}
//       {capturedUris.length < 3 ? (
//         <View style={styles.cameraWrap}>
//           <CameraView
//             ref={cameraRef}
//             style={styles.camera}
//             facing="front"
//           />
//           {/* Overlay showing count */}
//           <View style={styles.cameraOverlay}>
//             <Text style={styles.cameraOverlayText}>{capturedUris.length}/3</Text>
//           </View>
//         </View>
//       ) : (
//         /* Show last captured image as preview once all 3 done */
//         <View style={styles.cameraWrap}>
//           <Image
//             source={{ uri: capturedUris[2] }}
//             style={[styles.camera, { borderRadius: 20 }]}
//           />
//           <View style={[styles.cameraOverlay, { backgroundColor: "rgba(34,197,94,0.7)" }]}>
//             <Text style={styles.cameraOverlayText}>✓ 3/3</Text>
//           </View>
//         </View>
//       )}
//       {/* Capture button */}
//       {capturedUris.length < 3 && (
//         <TouchableOpacity
//           style={[styles.orangeBtn, capturing && { opacity: 0.5 }]}
//           onPress={capture}
//           disabled={capturing || uploading}
//         >
//           {capturing
//             ? <ActivityIndicator color="#fff" />
//             : <Text style={styles.btnText}>
//               📷 Capture Photo {capturedUris.length + 1}/3
//             </Text>}
//         </TouchableOpacity>
//       )}
//       {/* Preview thumbnails */}
//       {capturedUris.length > 0 && (
//         <View style={styles.previewRow}>
//           {capturedUris.map((uri, i) => (
//             <View key={i} style={styles.previewWrap}>
//               <Image source={{ uri }} style={styles.preview} />
//               <Text style={styles.previewTick}>✓</Text>
//             </View>
//           ))}
//         </View>
//       )}
//       {/* Error message */}
//       {uploadError !== "" && (
//         <Text style={[styles.errorText, { textAlign: "center", marginTop: 8 }]}>
//           {uploadError}
//         </Text>
//       )}
//       {/* Retake button */}
//       {capturedUris.length > 0 && !uploading && (
//         <TouchableOpacity style={[styles.outlineBtn, { marginTop: 8 }]} onPress={retake}>
//           <Text style={styles.outlineText}>↺ Retake All</Text>
//         </TouchableOpacity>
//       )}
//       {/* Continue button — only when 3 photos captured */}
//       {capturedUris.length >= 3 && (
//         <TouchableOpacity
//           style={[styles.orangeBtn, uploading && { opacity: 0.7 }]}
//           onPress={handleContinue}
//           disabled={uploading}
//         >
//           {uploading
//             ? <ActivityIndicator color="#fff" />
//             : <Text style={styles.btnText}>✓ Continue to Verify Email</Text>}
//         </TouchableOpacity>
//       )}
//       {/* Back button */}
//       <TouchableOpacity style={[styles.outlineBtn, { marginTop: 8 }]} onPress={onBack}>
//         <Text style={styles.outlineText}>Back</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
// // ── Success Modal (unchanged) ─────────────────────────────────────────────────
// function SuccessModal({ visible, onGoToSignIn }) {
//   return (
//     <Modal transparent animationType="fade" visible={visible}>
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalCard}>
//           <Text style={styles.modalIcon}>🎉</Text>
//           <Text style={styles.modalTitle}>Registration Successful!</Text>
//           <Text style={styles.modalSub}>
//             Your account has been created. Please sign in to continue.
//           </Text>
//           <TouchableOpacity style={styles.orangeBtn} onPress={onGoToSignIn}>
//             <Text style={styles.btnText}>Go to Sign In</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// }
// // ── Step 3: OTP → POST /api/auth/verify-otp ──────────────────────────────────
// // In auth/Signup.js, REPLACE the StepOtp function:

// function StepOtp({ email, onDone }) {
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [showModal, setShowModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [resending, setResending] = useState(false);
//   const [error, setError] = useState("");

//   // ── Match backend OTP validity: 5 minutes = 300 seconds ──────────────
//   const OTP_VALIDITY_SECONDS = 300; // must match otp.validity.minutes in backend
//   const [secondsLeft, setSecondsLeft] = useState(OTP_VALIDITY_SECONDS);
//   const [otpExpired, setOtpExpired] = useState(false);

//   const inputs = useRef([]);
//   const timerRef = useRef(null);

//   const startTimer = () => {
//     setSecondsLeft(OTP_VALIDITY_SECONDS);
//     setOtpExpired(false);
//     clearInterval(timerRef.current);
//     timerRef.current = setInterval(() => {
//       setSecondsLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timerRef.current);
//           setOtpExpired(true);
//           setError("OTP has expired. Please click 'Resend OTP' to get a new code.");
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   useEffect(() => {
//     startTimer();
//     return () => clearInterval(timerRef.current);
//   }, []);

//   // Format seconds as MM:SS
//   const formatTimer = (secs) => {
//     const m = Math.floor(secs / 60).toString().padStart(2, "0");
//     const s = (secs % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   };

//   // Timer colour: green → yellow → red
//   const timerColor =
//     secondsLeft > 120 ? "#22C55E" :
//       secondsLeft > 60 ? "#F59E0B" : "#EF4444";

//   const handleChange = (value, index) => {
//     if (otpExpired) return; // block input when expired
//     const clean = value.replace(/[^0-9]/g, "");
//     const newOtp = [...otp];
//     newOtp[index] = clean;
//     setOtp(newOtp);
//     setError("");
//     if (clean && index < 5) inputs.current[index + 1]?.focus();
//   };

//   const handleKeyPress = (e, index) => {
//     if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
//       inputs.current[index - 1]?.focus();
//     }
//   };

//   const handleSubmit = async () => {
//     if (otpExpired) {
//       setError("OTP has expired. Please click 'Resend OTP' to get a new code.");
//       return;
//     }
//     const joined = otp.join("");
//     if (joined.length < 6) {
//       setError("Please enter the full 6-digit OTP.");
//       return;
//     }
//     setLoading(true);
//     setError("");
//     try {
//       await apiVerifyOtp(email, joined);
//       clearInterval(timerRef.current);
//       setShowModal(true);
//     } catch (err) {
//       // Backend now returns specific messages like "OTP has expired"
//       setError(err.message || "Invalid OTP. Please try again.");
//       // If backend says expired, update frontend state too
//       if (err.message && err.message.toLowerCase().includes("expir")) {
//         setOtpExpired(true);
//         setSecondsLeft(0);
//         clearInterval(timerRef.current);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     setResending(true);
//     setError("");
//     try {
//       await apiResendOtp(email);
//       // Reset OTP fields
//       setOtp(["", "", "", "", "", ""]);
//       inputs.current[0]?.focus();
//       // Restart timer
//       startTimer();
//     } catch (err) {
//       setError(err.message || "Could not resend OTP.");
//     } finally {
//       setResending(false);
//     }
//   };

//   const canSubmit = !otpExpired && !loading && otp.join("").length === 6;

//   return (
//     <View>
//       <SuccessModal visible={showModal} onGoToSignIn={onDone} />
//       <Text style={styles.title}>OTP Verification</Text>
//       <Text style={styles.sub}>Code sent to {email}</Text>

//       {/* ── Timer display ──────────────────────────────────────────── */}
//       <View
//         style={{
//           flexDirection: "row", justifyContent: "center",
//           alignItems: "center", marginBottom: 8, gap: 8,
//         }}
//       >
//         <Text style={{ color: timerColor, fontSize: 22, fontWeight: "800" }}>
//           {otpExpired ? "00:00" : formatTimer(secondsLeft)}
//         </Text>
//         <Text style={{ color: "#888", fontSize: 13 }}>
//           {otpExpired ? "⏱ Expired" : "remaining"}
//         </Text>
//       </View>

//       {/* ── OTP Boxes ──────────────────────────────────────────────── */}
//       <View style={styles.otpRow}>
//         {otp.map((item, i) => (
//           <TextInput
//             key={i}
//             ref={(ref) => (inputs.current[i] = ref)}
//             maxLength={1}
//             keyboardType="numeric"
//             value={item}
//             onChangeText={(v) => handleChange(v, i)}
//             onKeyPress={(e) => handleKeyPress(e, i)}
//             editable={!otpExpired}
//             style={[
//               styles.otpBox,
//               otpExpired && { opacity: 0.4, backgroundColor: "#ccc" },
//             ]}
//           />
//         ))}
//       </View>

//       {/* ── Expired banner ────────────────────────────────────────── */}
//       {otpExpired && (
//         <View
//           style={{
//             backgroundColor: "#FEE2E2", borderRadius: 10,
//             padding: 10, marginTop: 8, marginBottom: 4,
//             alignItems: "center",
//           }}
//         >
//           <Text style={{ color: "#DC2626", fontSize: 13, fontWeight: "600" }}>
//             ⏰ OTP has expired. Please request a new one.
//           </Text>
//         </View>
//       )}

//       {error !== "" && (
//         <Text style={[styles.errorText, { textAlign: "center" }]}>{error}</Text>
//       )}

//       {/* ── Resend ────────────────────────────────────────────────── */}
//       <View style={{ alignItems: "center", marginTop: 12, marginBottom: 6 }}>
//         <TouchableOpacity onPress={handleResend} disabled={resending}>
//           <Text style={{ color: "#2F6E8E", fontWeight: "700", fontSize: 14 }}>
//             {resending ? "Sending…" : "Resend OTP"}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* ── Submit (disabled when expired) ───────────────────────── */}
//       <TouchableOpacity
//         style={[
//           styles.orangeBtn,
//           (!canSubmit) && { opacity: 0.4, backgroundColor: "#888" },
//         ]}
//         onPress={handleSubmit}
//         disabled={!canSubmit}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>
//             {otpExpired ? "OTP Expired — Resend First" : "Submit"}
//           </Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }
// // ── Named export: SignUpFlow ──────────────────────────────────────────────────
// export function SignUpFlow({ onBack, goToSignIn }) {
//   const [step, setStep] = useState(0);
//   const [form, setForm] = useState({
//     name: "", email: "", empId: "", designation: "", password: "", confirm: "",
//   });
//   return (
//     <SafeAreaView style={styles.screen}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
//       >
//         <ScrollView
//           contentContainerStyle={{ paddingBottom: 60 }}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           <StepBar step={step} />
//           {step === 0 && (
//             <StepDetails form={form} setForm={setForm} onNext={() => setStep(1)} />
//           )}
//           {step === 1 && (
//             <StepFace
//               email={form.email}
//               onNext={() => setStep(2)}
//               onBack={() => setStep(0)}
//             />
//           )}
//           {step === 2 && (
//             <StepOtp email={form.email} onDone={goToSignIn || onBack} />
//           )}
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }
// // ── Named export: FirstScreen (unchanged) ─────────────────────────────────────
// export function FirstScreen({ onSignUp, onSignIn }) {
//   return (
//     <ImageBackground
//       source={require("../assets/bg.jpg")}
//       style={styles.background}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.overlay}>
//         <View style={styles.heroContent}>
//           <Text style={styles.brandTitle}>
//             <Text style={styles.orangeText}>BLISS SIERRA </Text>
//             <Text style={styles.whiteText}>SOFTWARE SOLUTIONS</Text>
//           </Text>
//           <Text style={styles.bigTitle}>
//             Navigate Your Work Journey Efficient & Easy
//           </Text>
//           <Text style={styles.subCenter}>
//             Increase your work management & career development radically
//           </Text>
//           <TouchableOpacity style={styles.orangeBtn} onPress={onSignUp}>
//             <Text style={styles.btnText}>Sign Up</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.outlineBtn} onPress={onSignIn}>
//             <Text style={styles.outlineText}>Sign In</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </ImageBackground>
//   );
// }
// // ── Styles (100% original — zero changes) ────────────────────────────────────
// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: C.bg, padding: 20 },
//   background: { flex: 1, width: "100%", height: "100%" },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.45)",
//     justifyContent: "center",
//     paddingHorizontal: 24,
//   },
//   heroContent: { marginTop: 40 },
//   brandTitle: {
//     fontSize: 22,
//     fontWeight: "900",
//     marginBottom: 290,
//     lineHeight: 30,
//     marginTop: -50,
//   },
//   orangeText: { color: "#2F6E8E" },
//   whiteText: { color: "white" },
//   title: { color: "white", fontSize: 24, fontWeight: "700", marginBottom: 6 },
//   bigTitle: {
//     color: "white", fontSize: 30, fontWeight: "700",
//     lineHeight: 40, marginBottom: 14,
//   },
//   sub: { color: C.gray, marginBottom: 20 },
//   subCenter: { color: C.gray, fontSize: 15, lineHeight: 24, marginBottom: 40 },
//   label: { color: C.gray, marginBottom: 6 },
//   inputWrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: C.inputBg,
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 12,
//   },
//   inputFlex: { flex: 1, padding: 14, color: C.white },
//   eyeInside: {
//     paddingHorizontal: 14, paddingVertical: 14,
//     justifyContent: "center", alignItems: "center",
//   },
//   eyeText: { fontSize: 16 },
//   orangeBtn: {
//     backgroundColor: "#2F6E8E", padding: 16,
//     borderRadius: 30, alignItems: "center", marginTop: 14,
//   },
//   outlineBtn: {
//     borderWidth: 1, borderColor: C.white, padding: 16,
//     borderRadius: 30, alignItems: "center", marginTop: 14,
//   },
//   btnText: { color: "white", fontWeight: "700", backgroundColor: "#2F6E8E" },
//   outlineText: { color: "white", fontWeight: "700" },
//   stepRow: {
//     flexDirection: "row", justifyContent: "space-between",
//     marginBottom: 30, marginTop: 30,
//   },
//   stepWrap: { alignItems: "center" },
//   circle: {
//     width: 36, height: 36, borderRadius: 18,
//     justifyContent: "center", alignItems: "center", marginBottom: 4,
//   },
//   cameraWrap: {
//     width: 260, height: 320, borderRadius: 20,
//     overflow: "hidden", marginTop: 20, position: "relative",
//   },
//   camera: { flex: 1 },
//   cameraOverlay: {
//     position: "absolute",
//     bottom: 10,
//     right: 10,
//     backgroundColor: "rgba(0,0,0,0.6)",
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//   },
//   cameraOverlayText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 14,
//   },
//   previewRow: { flexDirection: "row", marginTop: 16, gap: 10 },
//   previewWrap: { position: "relative" },
//   preview: { width: 70, height: 70, borderRadius: 10, borderWidth: 2, borderColor: "#22C55E" },
//   previewTick: {
//     position: "absolute",
//     top: -6,
//     right: -6,
//     backgroundColor: "#22C55E",
//     color: "#fff",
//     fontSize: 11,
//     fontWeight: "700",
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     textAlign: "center",
//     lineHeight: 18,
//   },
//   otpRow: {
//     flexDirection: "row", justifyContent: "space-between", marginTop: 20,
//   },
//   otpBox: {
//     width: 45, height: 55, borderRadius: 10,
//     backgroundColor: C.inputBg, color: C.white,
//     fontSize: 20, textAlign: "center",
//   },
//   registrationTitle: {
//     color: "#2F6E8E", fontSize: 13, fontWeight: "700",
//     letterSpacing: 2, textTransform: "uppercase", marginBottom: 6,
//   },
//   errorText: { color: "#FF4D4D", fontSize: 13, marginTop: 4, marginBottom: 4 },
//   modalOverlay: {
//     flex: 1, backgroundColor: "rgba(0,0,0,0.75)",
//     justifyContent: "center", alignItems: "center", paddingHorizontal: 30,
//   },
//   modalCard: {
//     backgroundColor: "#0f1e30", borderRadius: 20, padding: 30,
//     alignItems: "center", width: "100%",
//     borderWidth: 1, borderColor: C.border,
//   },
//   modalIcon: { fontSize: 52, marginBottom: 14 },
//   modalTitle: {
//     color: "white", fontSize: 22, fontWeight: "700",
//     marginBottom: 10, textAlign: "center",
//   },
//   modalSub: {
//     color: C.gray, fontSize: 14, textAlign: "center",
//     lineHeight: 22, marginBottom: 6,
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
  SafeAreaView,
  Image,
  ImageBackground,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { apiSignup, apiUploadFace, apiVerifyOtp} from "../api/authService";

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

function SuccessModal({ visible, onGoToSignIn }) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalIcon}>🎉</Text>
          <Text style={styles.modalTitle}>Signup Request Sent!</Text>
          <Text style={styles.modalSub}>
            Your signup request has been sent to admin for approval.
            {"\n\n"}
            Once admin approves your account, you can sign in.
          </Text>
          <TouchableOpacity style={styles.orangeBtn} onPress={onGoToSignIn}>
            <Text style={styles.btnText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function StepOtp({ email, onDone }) {
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
      <SuccessModal visible={showModal} onGoToSignIn={onDone} />
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
            <StepOtp email={form.email} onDone={goToSignIn || onBack} />
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