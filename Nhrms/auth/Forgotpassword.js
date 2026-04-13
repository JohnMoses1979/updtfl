// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Animated,
// } from "react-native";

// // ── Steps ─────────────────────────────────────────────────────
// // 1 → Enter Email
// // 2 → Enter OTP
// // 3 → New Password + Confirm

// export default function ForgotPassword({ onBack }) {
//   const [step, setStep] = useState(1);

//   // Step 1
//   const [email, setEmail] = useState("");
//   const [emailError, setEmailError] = useState("");

//   // Step 2
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [otpError, setOtpError] = useState("");
//   const [timer, setTimer] = useState(30);
//   const [canResend, setCanResend] = useState(false);
//   const otpRefs = useRef([]);

//   // Step 3
//   const [newPass, setNewPass] = useState("");
//   const [confirmPass, setConfirmPass] = useState("");
//   const [newPassVisible, setNewPassVisible] = useState(false);
//   const [confirmPassVisible, setConfirmPassVisible] = useState(false);
//   const [passError, setPassError] = useState("");

//   // Slide animation
//   const slideAnim = useRef(new Animated.Value(0)).current;

//   const animateIn = () => {
//     slideAnim.setValue(40);
//     Animated.timing(slideAnim, {
//       toValue: 0,
//       duration: 320,
//       useNativeDriver: true,
//     }).start();
//   };

//   useEffect(() => { animateIn(); }, [step]);

//   // OTP countdown timer
//   useEffect(() => {
//     if (step !== 2) return;
//     setTimer(30);
//     setCanResend(false);
//     const interval = setInterval(() => {
//       setTimer((t) => {
//         if (t <= 1) {
//           clearInterval(interval);
//           setCanResend(true);
//           return 0;
//         }
//         return t - 1;
//       });
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [step]);

//   // ── Validators ────────────────────────────────────────────
//   const validateEmail = () => {
//     if (!email.trim()) { setEmailError("Please enter your email address."); return false; }
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!re.test(email.trim())) { setEmailError("Please enter a valid email address."); return false; }
//     return true;
//   };

//   const validateOtp = () => {
//     const joined = otp.join("");
//     if (joined.length < 6) { setOtpError("Please enter the complete 6-digit OTP."); return false; }
//     return true;
//   };

//   const validatePass = () => {
//     if (!newPass.trim()) { setPassError("Please enter a new password."); return false; }
//     if (newPass.length < 6) { setPassError("Password must be at least 6 characters."); return false; }
//     if (newPass !== confirmPass) { setPassError("Passwords do not match."); return false; }
//     return true;
//   };

//   // ── Handlers ─────────────────────────────────────────────
//   const handleSendOtp = () => {
//     if (!validateEmail()) return;
//     // TODO: call your send-OTP API here
//     setStep(2);
//   };

//   const handleVerifyOtp = () => {
//     if (!validateOtp()) return;
//     // TODO: verify OTP with backend
//     setStep(3);
//   };

//   const handleResetPassword = () => {
//     if (!validatePass()) return;
//     // TODO: submit new password to backend
//     onBack && onBack(); // go back to sign in on success
//   };

//   // ── OTP input helpers ─────────────────────────────────────
//   const handleOtpChange = (val, idx) => {
//     if (!/^\d*$/.test(val)) return;
//     const next = [...otp];
//     next[idx] = val.slice(-1);
//     setOtp(next);
//     setOtpError("");
//     if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
//   };

//   const handleOtpKeyPress = (e, idx) => {
//     if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
//       otpRefs.current[idx - 1]?.focus();
//     }
//   };

//   // ── Step indicator ────────────────────────────────────────
//   const steps = [
//     { num: 1, label: "Email" },
//     { num: 2, label: "OTP" },
//     { num: 3, label: "Password" },
//   ];

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           {/* ── Step Indicator ── */}
//           <View style={styles.stepRow}>
//             {steps.map((s, i) => (
//               <React.Fragment key={s.num}>
//                 <View style={styles.stepItem}>
//                   <View style={[styles.stepCircle, step >= s.num && styles.stepCircleActive]}>
//                     {step > s.num ? (
//                       <Text style={styles.stepCheckmark}>✓</Text>
//                     ) : (
//                       <Text style={[styles.stepNum, step >= s.num && styles.stepNumActive]}>
//                         {s.num}
//                       </Text>
//                     )}
//                   </View>
//                   <Text style={[styles.stepLabel, step >= s.num && styles.stepLabelActive]}>
//                     {s.label}
//                   </Text>
//                 </View>
//                 {i < steps.length - 1 && (
//                   <View style={[styles.stepLine, step > s.num && styles.stepLineActive]} />
//                 )}
//               </React.Fragment>
//             ))}
//           </View>

//           {/* ── Animated Card ── */}
//           <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>

//             {/* ════════════════ STEP 1 — EMAIL ════════════════ */}
//             {step === 1 && (
//               <>
//                 <View style={styles.iconCircle}>
//                   <Text style={styles.iconText}>✉️</Text>
//                 </View>
//                 <Text style={styles.title}>Forgot Password?</Text>
//                 <Text style={styles.subtitle}>
//                   Enter your registered email address and we'll send you a verification code.
//                 </Text>

//                 <Text style={styles.label}>Email Address</Text>
//                 <View style={[styles.inputWrap, emailError && styles.inputError]}>
//                   <TextInput
//                     style={styles.inputFlex}
//                     placeholder="yourname@example.com"
//                     placeholderTextColor="#999"
//                     value={email}
//                     onChangeText={(v) => { setEmail(v); setEmailError(""); }}
//                     keyboardType="email-address"
//                     autoCapitalize="none"
//                     autoCorrect={false}
//                   />
//                 </View>
//                 {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

//                 <TouchableOpacity style={[styles.button, { marginTop: 30 }]} onPress={handleSendOtp} activeOpacity={0.85}>
//                   <Text style={styles.buttonText}>Send OTP</Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             {/* ════════════════ STEP 2 — OTP ════════════════ */}
//             {step === 2 && (
//               <>
//                 <View style={styles.iconCircle}>
//                   <Text style={styles.iconText}>🔢</Text>
//                 </View>
//                 <Text style={styles.title}>Verify OTP</Text>
//                 <Text style={styles.subtitle}>
//                   We sent a 6-digit code to{"\n"}
//                   <Text style={styles.emailHighlight}>{email}</Text>
//                 </Text>

//                 {/* OTP Boxes */}
//                 <View style={styles.otpRow}>
//                   {otp.map((digit, idx) => (
//                     <TextInput
//                       key={idx}
//                       ref={(r) => (otpRefs.current[idx] = r)}
//                       style={[
//                         styles.otpBox,
//                         digit ? styles.otpBoxFilled : null,
//                         otpError ? styles.otpBoxError : null,
//                       ]}
//                       value={digit}
//                       onChangeText={(v) => handleOtpChange(v, idx)}
//                       onKeyPress={(e) => handleOtpKeyPress(e, idx)}
//                       keyboardType="number-pad"
//                       maxLength={1}
//                       textAlign="center"
//                       selectionColor="#2F6E8E"
//                     />
//                   ))}
//                 </View>
//                 {otpError ? <Text style={[styles.errorText, { textAlign: "center" }]}>{otpError}</Text> : null}

//                 {/* Timer / Resend */}
//                 <View style={styles.resendRow}>
//                   {canResend ? (
//                     <TouchableOpacity onPress={() => { setStep(2); }}>
//                       <Text style={styles.resendLink}>Resend OTP</Text>
//                     </TouchableOpacity>
//                   ) : (
//                     <Text style={styles.timerText}>
//                       Resend in{" "}
//                       <Text style={styles.timerNum}>00:{String(timer).padStart(2, "0")}</Text>
//                     </Text>
//                   )}
//                 </View>

//                 <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={handleVerifyOtp} activeOpacity={0.85}>
//                   <Text style={styles.buttonText}>Verify OTP</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity onPress={() => setStep(1)} style={{ marginTop: 20 }}>
//                   <Text style={styles.bottomText}>
//                     ←{"  "}<Text style={styles.link}>Change Email</Text>
//                   </Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             {/* ════════════════ STEP 3 — NEW PASSWORD ════════════════ */}
//             {step === 3 && (
//               <>
//                 <View style={styles.iconCircle}>
//                   <Text style={styles.iconText}>🔒</Text>
//                 </View>
//                 <Text style={styles.title}>New Password</Text>
//                 <Text style={styles.subtitle}>
//                   Create a strong new password for your account.
//                 </Text>

//                 <Text style={styles.label}>New Password</Text>
//                 <View style={[styles.inputWrap, passError && !newPass && styles.inputError]}>
//                   <TextInput
//                     style={styles.inputFlex}
//                     placeholder="Enter new password"
//                     placeholderTextColor="#999"
//                     secureTextEntry={!newPassVisible}
//                     value={newPass}
//                     onChangeText={(v) => { setNewPass(v); setPassError(""); }}
//                   />
//                   <TouchableOpacity style={styles.eyeInside} onPress={() => setNewPassVisible((v) => !v)}>
//                     <Text style={styles.eyeText}>{newPassVisible ? "🙈" : "👁️"}</Text>
//                   </TouchableOpacity>
//                 </View>

//                 <Text style={styles.label}>Confirm Password</Text>
//                 <View style={[styles.inputWrap, passError && newPass !== confirmPass && styles.inputError]}>
//                   <TextInput
//                     style={styles.inputFlex}
//                     placeholder="Re-enter new password"
//                     placeholderTextColor="#999"
//                     secureTextEntry={!confirmPassVisible}
//                     value={confirmPass}
//                     onChangeText={(v) => { setConfirmPass(v); setPassError(""); }}
//                   />
//                   <TouchableOpacity style={styles.eyeInside} onPress={() => setConfirmPassVisible((v) => !v)}>
//                     <Text style={styles.eyeText}>{confirmPassVisible ? "🙈" : "👁️"}</Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Password match indicator */}
//                 {confirmPass.length > 0 && (
//                   <View style={styles.matchRow}>
//                     <Text style={newPass === confirmPass ? styles.matchGood : styles.matchBad}>
//                       {newPass === confirmPass ? "✓  Passwords match" : "✗  Passwords do not match"}
//                     </Text>
//                   </View>
//                 )}

//                 {passError ? <Text style={styles.errorText}>{passError}</Text> : null}

//                 {/* Password strength hint */}
//                 <View style={styles.hintBadge}>
//                   <Text style={styles.hintIcon}>💡</Text>
//                   <Text style={styles.hintText}>
//                     Use at least 6 characters with a mix of letters, numbers & symbols.
//                   </Text>
//                 </View>

//                 <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={handleResetPassword} activeOpacity={0.85}>
//                   <Text style={styles.buttonText}>Reset Password</Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             {/* ── Back to Sign In ── */}
//             <TouchableOpacity onPress={onBack} style={{ marginTop: 24 }}>
//               <Text style={styles.bottomText}>
//                 ←{"  "}<Text style={styles.link}>Back to Sign In</Text>
//               </Text>
//             </TouchableOpacity>

//           </Animated.View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#112235",
//   },

//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: "center",
//     paddingHorizontal: 25,
//     paddingVertical: 40,
//   },

//   // ── Step indicator ──
//   stepRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 36,
//   },
//   stepItem: {
//     alignItems: "center",
//     gap: 6,
//   },
//   stepCircle: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     borderWidth: 2,
//     borderColor: "#1a3a5c",
//     backgroundColor: "#0f1e30",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   stepCircleActive: {
//     borderColor: "#2F6E8E",
//     backgroundColor: "#2D6F8E",
//   },
//   stepNum: {
//     color: "#555",
//     fontWeight: "700",
//     fontSize: 14,
//   },
//   stepNumActive: {
//     color: "#fff",
//   },
//   stepCheckmark: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "700",
//   },
//   stepLabel: {
//     color: "#555",
//     fontSize: 11,
//     fontWeight: "600",
//   },
//   stepLabelActive: {
//     color: "#2F6E8E",
//   },
//   stepLine: {
//     flex: 1,
//     height: 2,
//     backgroundColor: "#1a3a5c",
//     marginHorizontal: 6,
//     marginBottom: 18,
//   },
//   stepLineActive: {
//     backgroundColor: "#2D6F8E",
//   },

//   // ── Card ──
//   card: {
//     alignItems: "stretch",
//   },

//   iconCircle: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: "rgba(47,110,142,0.15)",
//     borderWidth: 1.5,
//     borderColor: "rgba(47,110,142,0.4)",
//     justifyContent: "center",
//     alignItems: "center",
//     alignSelf: "center",
//     marginBottom: 20,
//   },
//   iconText: { fontSize: 32 },

//   title: {
//     color: "white",
//     fontSize: 30,
//     fontWeight: "700",
//     textAlign: "center",
//   },

//   subtitle: {
//     color: "#ddd",
//     textAlign: "center",
//     marginBottom: 10,
//     marginTop: 8,
//     lineHeight: 22,
//   },

//   emailHighlight: {
//     color: "#2F6E8E",
//     fontWeight: "700",
//   },

//   label: {
//     color: "white",
//     marginBottom: 8,
//     marginTop: 15,
//     fontWeight: "500",
//   },

//   inputWrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f1f1f1",
//     borderRadius: 14,
//     overflow: "hidden",
//     borderWidth: 2,
//     borderColor: "transparent",
//   },

//   inputError: {
//     borderColor: "#FF4D6D",
//   },

//   inputFlex: {
//     flex: 1,
//     padding: 15,
//     fontSize: 16,
//     color: "#000",
//   },

//   eyeInside: {
//     paddingHorizontal: 14,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   eyeText: { fontSize: 17 },

//   errorText: {
//     color: "#FF4D6D",
//     fontSize: 13,
//     marginTop: 8,
//     marginLeft: 4,
//   },

//   // ── OTP ──
//   otpRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 24,
//     marginBottom: 6,
//     gap: 8,
//   },
//   otpBox: {
//     flex: 1,
//     height: 56,
//     borderRadius: 14,
//     backgroundColor: "#f1f1f1",
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#112235",
//     borderWidth: 2,
//     borderColor: "transparent",
//     textAlign: "center",
//   },
//   otpBoxFilled: {
//     borderColor: "#2F6E8E",
//     backgroundColor: "#e8f4f8",
//   },
//   otpBoxError: {
//     borderColor: "#FF4D6D",
//   },

//   resendRow: {
//     alignItems: "center",
//     marginTop: 16,
//     marginBottom: 4,
//   },
//   timerText: {
//     color: "#aaa",
//     fontSize: 13,
//   },
//   timerNum: {
//     color: "#2F6E8E",
//     fontWeight: "700",
//   },
//   resendLink: {
//     color: "#2F6E8E",
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   // ── Password match ──
//   matchRow: {
//     marginTop: 8,
//     marginLeft: 4,
//   },
//   matchGood: {
//     color: "#4CAF50",
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   matchBad: {
//     color: "#FF4D6D",
//     fontSize: 13,
//     fontWeight: "600",
//   },

//   // ── Hint badge ──
//   hintBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     backgroundColor: "rgba(59,130,246,0.12)",
//     borderWidth: 1,
//     borderColor: "rgba(59,130,246,0.3)",
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     marginTop: 18,
//     marginBottom: 6,
//   },
//   hintIcon: { fontSize: 15 },
//   hintText: { color: "#ccc", fontSize: 12, flex: 1, lineHeight: 18 },

//   // ── Button ──
// button: {
//   backgroundColor: "#2D6F8E",
//   padding: 16,
//   borderRadius: 30,
//   alignItems: "center",
//   boxShadow: '0px 4px 10px rgba(31, 86, 112, 0.4)',  // Replacing shadow properties with boxShadow
//   elevation: 6,  // Retaining elevation for Android shadow
// },
//   buttonText: {
//     color: "white",
//     fontSize: 17,
//     fontWeight: "600",
//   },

//   link: { color: "#2F6E8E" },
//   bottomText: {
//     color: "white",
//     textAlign: "center",
//   },
// });








import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import {
  apiForgotPassword,
  apiVerifyForgotOtp,
  apiResetPassword,
  apiResendOtp,
} from "../api/authService";

export default function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(1);

  // Step 1
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Step 2
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes to match backend
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);

  // Step 3
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [newPassVisible, setNewPassVisible] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [passError, setPassError] = useState("");

  // Loading state shared across steps
  const [loading, setLoading] = useState(false);

  // Slide animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    slideAnim.setValue(40);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => { animateIn(); }, [step]);

  // OTP countdown — 5 minutes (matches backend otp.validity.minutes=5)
  useEffect(() => {
    if (step !== 2) return;
    setTimer(300);
    setCanResend(false);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // ── Validators ────────────────────────────────────────────────────────────
  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const validateOtp = () => {
    const joined = otp.join("");
    if (joined.length < 6) {
      setOtpError("Please enter the complete 6-digit OTP.");
      return false;
    }
    return true;
  };

  const validatePass = () => {
    if (!newPass.trim()) {
      setPassError("Please enter a new password.");
      return false;
    }
    if (newPass.length < 6) {
      setPassError("Password must be at least 6 characters.");
      return false;
    }
    if (newPass !== confirmPass) {
      setPassError("Passwords do not match.");
      return false;
    }
    return true;
  };

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!validateEmail()) return;
    setLoading(true);
    setEmailError("");
    try {
      await apiForgotPassword(email.trim().toLowerCase());
      setStep(2);
    } catch (err) {
      setEmailError(err.message || "Failed to send OTP. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;
    setLoading(true);
    setOtpError("");
    try {
      await apiVerifyForgotOtp(email.trim().toLowerCase(), otp.join(""));
      setStep(3);
    } catch (err) {
      setOtpError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ────────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (!validatePass()) return;
    setLoading(true);
    setPassError("");
    try {
      await apiResetPassword(email.trim().toLowerCase(), newPass.trim());
      // Success — go back to sign in
      onBack && onBack();
    } catch (err) {
      setPassError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setLoading(true);
    setOtpError("");
    try {
      await apiForgotPassword(email.trim().toLowerCase()); // re-triggers forgot-password OTP
      setOtp(["", "", "", "", "", ""]);
      setTimer(300);
      setCanResend(false);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setOtpError(err.message || "Could not resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input helpers ─────────────────────────────────────────────────────
  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setOtpError("");
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyPress = (e, idx) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // Format timer MM:SS
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const timerColor = timer > 120 ? "#22C55E" : timer > 60 ? "#F59E0B" : "#EF4444";

  // ── Step indicator ────────────────────────────────────────────────────────
  const steps = [
    { num: 1, label: "Email" },
    { num: 2, label: "OTP" },
    { num: 3, label: "Password" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Step Indicator (UI unchanged) ── */}
          <View style={styles.stepRow}>
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, step >= s.num && styles.stepCircleActive]}>
                    {step > s.num ? (
                      <Text style={styles.stepCheckmark}>✓</Text>
                    ) : (
                      <Text style={[styles.stepNum, step >= s.num && styles.stepNumActive]}>
                        {s.num}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.stepLabel, step >= s.num && styles.stepLabelActive]}>
                    {s.label}
                  </Text>
                </View>
                {i < steps.length - 1 && (
                  <View style={[styles.stepLine, step > s.num && styles.stepLineActive]} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* ── Animated Card ── */}
          <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>

            {/* ════════ STEP 1 — EMAIL ════════ */}
            {step === 1 && (
              <>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>✉️</Text>
                </View>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                  Enter your registered email address and we'll send you a verification code.
                </Text>

                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputWrap, emailError && styles.inputError]}>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="yourname@example.com"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={(v) => { setEmail(v); setEmailError(""); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <TouchableOpacity
                  style={[styles.button, { marginTop: 30 }, loading && { opacity: 0.7 }]}
                  onPress={handleSendOtp}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Send OTP</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* ════════ STEP 2 — OTP ════════ */}
            {step === 2 && (
              <>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>🔢</Text>
                </View>
                <Text style={styles.title}>Verify OTP</Text>
                <Text style={styles.subtitle}>
                  We sent a 6-digit code to{"\n"}
                  <Text style={styles.emailHighlight}>{email}</Text>
                </Text>

                {/* Timer */}
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 8, gap: 8 }}>
                  <Text style={{ color: timerColor, fontSize: 22, fontWeight: "800" }}>
                    {timer === 0 ? "00:00" : formatTimer(timer)}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 13 }}>
                    {timer === 0 ? "⏱ Expired" : "remaining"}
                  </Text>
                </View>

                {/* OTP Boxes */}
                <View style={styles.otpRow}>
                  {otp.map((digit, idx) => (
                    <TextInput
                      key={idx}
                      ref={(r) => (otpRefs.current[idx] = r)}
                      style={[
                        styles.otpBox,
                        digit ? styles.otpBoxFilled : null,
                        otpError ? styles.otpBoxError : null,
                        timer === 0 && { opacity: 0.4, backgroundColor: "#ccc" },
                      ]}
                      value={digit}
                      onChangeText={(v) => handleOtpChange(v, idx)}
                      onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      selectionColor="#2F6E8E"
                      editable={timer > 0 && !loading}
                    />
                  ))}
                </View>
                {otpError
                  ? <Text style={[styles.errorText, { textAlign: "center" }]}>{otpError}</Text>
                  : null}

                {/* Expired banner */}
                {timer === 0 && (
                  <View style={{ backgroundColor: "#FEE2E2", borderRadius: 10, padding: 10, marginTop: 8, alignItems: "center" }}>
                    <Text style={{ color: "#DC2626", fontSize: 13, fontWeight: "600" }}>
                      ⏰ OTP has expired. Please request a new one.
                    </Text>
                  </View>
                )}

                {/* Resend */}
                <View style={styles.resendRow}>
                  {canResend ? (
                    <TouchableOpacity onPress={handleResend} disabled={loading}>
                      <Text style={styles.resendLink}>
                        {loading ? "Sending…" : "Resend OTP"}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.timerText}>
                      Resend in{" "}
                      <Text style={styles.timerNum}>{formatTimer(timer)}</Text>
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.button, { marginTop: 10 }, (loading || timer === 0) && { opacity: 0.4 }]}
                  onPress={handleVerifyOtp}
                  activeOpacity={0.85}
                  disabled={loading || timer === 0}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Verify OTP</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep(1)} style={{ marginTop: 20 }} disabled={loading}>
                  <Text style={styles.bottomText}>
                    ←{"  "}<Text style={styles.link}>Change Email</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* ════════ STEP 3 — NEW PASSWORD ════════ */}
            {step === 3 && (
              <>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>🔒</Text>
                </View>
                <Text style={styles.title}>New Password</Text>
                <Text style={styles.subtitle}>
                  Create a strong new password for your account.
                </Text>

                <Text style={styles.label}>New Password</Text>
                <View style={[styles.inputWrap, passError && !newPass && styles.inputError]}>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="Enter new password"
                    placeholderTextColor="#999"
                    secureTextEntry={!newPassVisible}
                    value={newPass}
                    onChangeText={(v) => { setNewPass(v); setPassError(""); }}
                    editable={!loading}
                  />
                  <TouchableOpacity style={styles.eyeInside} onPress={() => setNewPassVisible((v) => !v)}>
                    <Text style={styles.eyeText}>{newPassVisible ? "🙈" : "👁️"}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.inputWrap, passError && newPass !== confirmPass && styles.inputError]}>
                  <TextInput
                    style={styles.inputFlex}
                    placeholder="Re-enter new password"
                    placeholderTextColor="#999"
                    secureTextEntry={!confirmPassVisible}
                    value={confirmPass}
                    onChangeText={(v) => { setConfirmPass(v); setPassError(""); }}
                    editable={!loading}
                  />
                  <TouchableOpacity style={styles.eyeInside} onPress={() => setConfirmPassVisible((v) => !v)}>
                    <Text style={styles.eyeText}>{confirmPassVisible ? "🙈" : "👁️"}</Text>
                  </TouchableOpacity>
                </View>

                {/* Password match indicator */}
                {confirmPass.length > 0 && (
                  <View style={styles.matchRow}>
                    <Text style={newPass === confirmPass ? styles.matchGood : styles.matchBad}>
                      {newPass === confirmPass ? "✓  Passwords match" : "✗  Passwords do not match"}
                    </Text>
                  </View>
                )}

                {passError ? <Text style={styles.errorText}>{passError}</Text> : null}

                {/* Password strength hint */}
                <View style={styles.hintBadge}>
                  <Text style={styles.hintIcon}>💡</Text>
                  <Text style={styles.hintText}>
                    Use at least 6 characters with a mix of letters, numbers & symbols.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.button, { marginTop: 10 }, loading && { opacity: 0.7 }]}
                  onPress={handleResetPassword}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Reset Password</Text>}
                </TouchableOpacity>
              </>
            )}

            {/* ── Back to Sign In ── */}
            <TouchableOpacity onPress={onBack} style={{ marginTop: 24 }} disabled={loading}>
              <Text style={styles.bottomText}>
                ←{"  "}<Text style={styles.link}>Back to Sign In</Text>
              </Text>
            </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles (100% original — zero changes) ────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#112235",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 40,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  stepItem: {
    alignItems: "center",
    gap: 6,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#1a3a5c",
    backgroundColor: "#0f1e30",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    borderColor: "#2F6E8E",
    backgroundColor: "#2D6F8E",
  },
  stepNum: {
    color: "#555",
    fontWeight: "700",
    fontSize: 14,
  },
  stepNumActive: {
    color: "#fff",
  },
  stepCheckmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  stepLabel: {
    color: "#555",
    fontSize: 11,
    fontWeight: "600",
  },
  stepLabelActive: {
    color: "#2F6E8E",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#1a3a5c",
    marginHorizontal: 6,
    marginBottom: 18,
  },
  stepLineActive: {
    backgroundColor: "#2D6F8E",
  },
  card: {
    alignItems: "stretch",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(47,110,142,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(47,110,142,0.4)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  iconText: { fontSize: 32 },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: "#ddd",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 8,
    lineHeight: 22,
  },
  emailHighlight: {
    color: "#2F6E8E",
    fontWeight: "700",
  },
  label: {
    color: "white",
    marginBottom: 8,
    marginTop: 15,
    fontWeight: "500",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#FF4D6D",
  },
  inputFlex: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: "#000",
  },
  eyeInside: {
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeText: { fontSize: 17 },
  errorText: {
    color: "#FF4D6D",
    fontSize: 13,
    marginTop: 8,
    marginLeft: 4,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 6,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#f1f1f1",
    fontSize: 22,
    fontWeight: "700",
    color: "#112235",
    borderWidth: 2,
    borderColor: "transparent",
    textAlign: "center",
  },
  otpBoxFilled: {
    borderColor: "#2F6E8E",
    backgroundColor: "#e8f4f8",
  },
  otpBoxError: {
    borderColor: "#FF4D6D",
  },
  resendRow: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  timerText: {
    color: "#aaa",
    fontSize: 13,
  },
  timerNum: {
    color: "#2F6E8E",
    fontWeight: "700",
  },
  resendLink: {
    color: "#2F6E8E",
    fontWeight: "700",
    fontSize: 14,
  },
  matchRow: {
    marginTop: 8,
    marginLeft: 4,
  },
  matchGood: {
    color: "#4CAF50",
    fontSize: 13,
    fontWeight: "600",
  },
  matchBad: {
    color: "#FF4D6D",
    fontSize: 13,
    fontWeight: "600",
  },
  hintBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(59,130,246,0.12)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.3)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 18,
    marginBottom: 6,
  },
  hintIcon: { fontSize: 15 },
  hintText: { color: "#ccc", fontSize: 12, flex: 1, lineHeight: 18 },
  button: {
    backgroundColor: "#2D6F8E",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    elevation: 6,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  link: { color: "#2F6E8E" },
  bottomText: {
    color: "white",
    textAlign: "center",
  },
});