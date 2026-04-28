// import React, { useState } from "react";
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
//   ActivityIndicator,
// } from "react-native";
// import * as LocalAuthentication from "expo-local-authentication";
// import { apiLogin } from "../api/authService";
// import { useUser } from "../context/UserContext";

// const COLORS = {
//   bg: "#112235",
//   card: "#0f1e30",
//   accent: "#38BDF8",
//   accentDark: "#0e4a6e",
//   text: "#ffffff",
//   muted: "#cbd5e1",
//   border: "#1a3a5c",
//   inputBg: "#f8fafc",
//   error: "#FF6B6B",
// };

// async function runDeviceBiometric() {
//   const hardware = await LocalAuthentication.hasHardwareAsync();
//   const enrolled = await LocalAuthentication.isEnrolledAsync();

//   if (!hardware || !enrolled) {
//     throw new Error("Biometric authentication is not available on this device.");
//   }

//   const result = await LocalAuthentication.authenticateAsync({
//     promptMessage: "Confirm fingerprint to continue",
//     fallbackLabel: "Cancel",
//     cancelLabel: "Cancel",
//     disableDeviceFallback: true,
//   });

//   if (!result.success) {
//     if (result.error === "user_cancel" || result.error === "user_fallback") {
//       throw new Error("Biometric authentication was cancelled.");
//     }
//     throw new Error("Biometric authentication failed.");
//   }
// }

// export default function SignIn({ onBack, goToSignUp, onLoginSuccess, onAdminSuccess, onForgotPassword }) {
//   const { login } = useUser();
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [isAdminMode, setIsAdminMode] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const resetFields = () => {
//     setUsername("");
//     setPassword("");
//     setError("");
//   };

//   const handleAdminToggle = () => {
//     setIsAdminMode((prev) => !prev);
//     resetFields();
//   };

//   const completeLogin = (data) => {
//     login({
//       userId: data.userId,
//       name: data.name,
//       email: data.email,
//       empId: data.empId,
//       designation: data.designation,
//       token: data.token,
//       role: data.role,
//     });

//     if (data.role === "ROLE_ADMIN") {
//       onAdminSuccess?.();
//     } else {
//       onLoginSuccess?.();
//     }
//   };

//   const handleAdminLogin = async () => {
//     const trimmedUsername = username.trim();
//     const trimmedPassword = password.trim();

//     if (!trimmedUsername || !trimmedPassword) {
//       setError("Please enter both username and password.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const credentialCheck = await apiLogin({
//         username: trimmedUsername,
//         password: trimmedPassword,
//         loginType: "ADMIN",
//         biometricVerified: false,
//       });

//       if (credentialCheck.status === "error") {
//         setError(credentialCheck.message || "Admin login failed.");
//         return;
//       }

//       if (credentialCheck.status !== "biometric_required" && credentialCheck.role !== "ROLE_ADMIN") {
//         setError("Admin login could not be verified.");
//         return;
//       }

//       await runDeviceBiometric();

//       const finalLogin = await apiLogin({
//         username: trimmedUsername,
//         password: trimmedPassword,
//         loginType: "ADMIN",
//         biometricVerified: true,
//       });

//       if (finalLogin.status !== "success") {
//         setError(finalLogin.message || "Admin login failed.");
//         return;
//       }

//       completeLogin(finalLogin);
//     } catch (err) {
//       setError(err.message || "Admin login failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEmployeeLogin = async () => {
//     const trimmedId = username.trim();
//     const trimmedPassword = password.trim();

//     if (!trimmedId || !trimmedPassword) {
//       setError("Please enter both Employee ID and Password.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const data = await apiLogin({
//         empId: trimmedId,
//         password: trimmedPassword,
//         loginType: "EMPLOYEE",
//       });

//       if (data.status !== "success") {
//         setError(data.message || "Login failed.");
//         return;
//       }

//       completeLogin(data);
//     } catch (err) {
//       setError(err.message || "Login failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSignIn = () => {
//     if (isAdminMode) {
//       handleAdminLogin();
//       return;
//     }

//     handleEmployeeLogin();
//   };

//   return (
//     <SafeAreaView style={styles.screen}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={20}
//       >
//         <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
//           <View style={styles.card}>
//             <Text style={styles.title}>Sign In</Text>
//             <Text style={styles.subTitle}>
//               {isAdminMode ? "Admin access requires a fingerprint after credentials are verified." : "Sign in with your employee credentials."}
//             </Text>

//             {isAdminMode ? (
//               <View style={styles.notice}>
//                 <Text style={styles.noticeText}>
//                   Admin biometric login is enforced every time. Device biometrics must be enabled.
//                 </Text>
//               </View>
//             ) : null}

//             <Text style={styles.label}>{isAdminMode ? "Admin Username" : "Employee ID"}</Text>
//             <View style={[styles.inputWrap, !username.trim() && error ? styles.inputError : null]}>
//               <TextInput
//                 style={styles.input}
//                 placeholder={isAdminMode ? "Enter admin username" : "Enter employee ID"}
//                 placeholderTextColor="#8aa0b8"
//                 value={username}
//                 onChangeText={(v) => {
//                   setUsername(v);
//                   setError("");
//                 }}
//                 autoCapitalize="none"
//                 editable={!loading}
//               />
//             </View>

//             <Text style={styles.label}>{isAdminMode ? "Admin Password" : "Password"}</Text>
//             <View style={[styles.inputWrap, !password.trim() && error ? styles.inputError : null]}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter password"
//                 placeholderTextColor="#8aa0b8"
//                 value={password}
//                 secureTextEntry={!showPassword}
//                 onChangeText={(v) => {
//                   setPassword(v);
//                   setError("");
//                 }}
//                 editable={!loading}
//               />
//               <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
//                 <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
//               </TouchableOpacity>
//             </View>

//             {error ? <Text style={styles.errorText}>{error}</Text> : null}

//             <View style={styles.row}>
//               <Text style={styles.linkText}>Need help signing in?</Text>
//               <TouchableOpacity onPress={onForgotPassword} disabled={loading}>
//                 <Text style={styles.link}>Forgot Password</Text>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity
//               style={[styles.primaryBtn, loading && { opacity: 0.75 }]}
//               onPress={handleSignIn}
//               disabled={loading}
//             >
//               {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{isAdminMode ? "Sign In as Admin" : "Sign In"}</Text>}
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.secondaryBtn} onPress={handleAdminToggle} disabled={loading}>
//               <Text style={styles.secondaryBtnText}>{isAdminMode ? "Back to Employee Login" : "Login as Admin"}</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.ghostBtn} onPress={goToSignUp} disabled={loading}>
//               <Text style={styles.ghostBtnText}>Create Admin Account</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.backBtn} onPress={onBack} disabled={loading}>
//               <Text style={styles.backText}>Back to Home</Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

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
//   card: {
//     backgroundColor: COLORS.card,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 20,
//   },
//   title: {
//     color: COLORS.text,
//     fontSize: 30,
//     fontWeight: "900",
//     textAlign: "center",
//   },
//   subTitle: {
//     color: "#cbd5e1",
//     marginTop: 8,
//     marginBottom: 16,
//     textAlign: "center",
//     lineHeight: 20,
//   },
//   notice: {
//     backgroundColor: "rgba(56, 189, 248, 0.08)",
//     borderColor: "rgba(56, 189, 248, 0.25)",
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 14,
//   },
//   noticeText: {
//     color: COLORS.accent,
//     lineHeight: 18,
//     fontSize: 13,
//   },
//   label: {
//     color: COLORS.text,
//     marginBottom: 8,
//     marginTop: 12,
//     fontWeight: "700",
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
//   inputError: {
//     borderColor: COLORS.error,
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
//     marginTop: 8,
//     marginBottom: 2,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 14,
//     marginBottom: 8,
//   },
//   linkText: {
//     color: COLORS.muted,
//     fontSize: 12,
//   },
//   link: {
//     color: COLORS.accent,
//     fontWeight: "700",
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
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     borderRadius: 28,
//     alignItems: "center",
//     paddingVertical: 14,
//     marginTop: 12,
//   },
//   secondaryBtnText: {
//     color: COLORS.accent,
//     fontWeight: "700",
//   },
//   ghostBtn: {
//     alignItems: "center",
//     marginTop: 8,
//     paddingVertical: 10,
//   },
//   ghostBtnText: {
//     color: "#cbd5e1",
//     fontWeight: "600",
//   },
//   backBtn: {
//     alignItems: "center",
//     marginTop: 10,
//     paddingVertical: 8,
//   },
//   backText: {
//     color: COLORS.muted,
//   },
// });









/**
 * auth/Signin.js
 *
 * ── Changes vs original ──────────────────────────────────────
 *  • handleSignIn  → calls apiLogin() (POST /api/auth/login)
 *                    stores user data in UserContext via login()
 *  • Admin shortcut still works (empId="admin", pass="admin123")
 *  • ALL original styles / layout / colours UNTOUCHED
 * ─────────────────────────────────────────────────────────────
 */
// import React, { useState, useEffect } from "react";
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
//   Alert,
//   Animated,
//   ActivityIndicator,
// } from "react-native";
// import * as LocalAuthentication from "expo-local-authentication";
// import { apiLogin } from "../api/authService";
// import { useUser } from "../context/UserContext";
// // ── Admin credentials ─────────────────────────────────────────
// const ADMIN_ID = "admin";
// const ADMIN_PASSWORD = "admin123";
// export default function SignIn({ onBack, goToSignUp, onLoginSuccess, onAdminSuccess, onForgotPassword }) {
//   const { login } = useUser();
//   const [passwordVisible, setPasswordVisible] = useState(false);
//   const [empId, setEmpId] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [biometricAvailable, setBiometricAvailable] = useState(false);
//   const [biometricType, setBiometricType] = useState(null);
//   const [fingerprintPulse] = useState(new Animated.Value(1));
//   // ── Check biometric support ────────────────────────────────
//   useEffect(() => {
//     (async () => {
//       const compatible = await LocalAuthentication.hasHardwareAsync();
//       const enrolled = await LocalAuthentication.isEnrolledAsync();
//       if (compatible && enrolled) {
//         setBiometricAvailable(true);
//         const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();
//         if (supported.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
//           setBiometricType("fingerprint");
//         } else if (supported.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
//           setBiometricType("face");
//         }
//       }
//     })();
//   }, []);
//   // ── Pulse animation ────────────────────────────────────────
//   useEffect(() => {
//     if (!biometricAvailable) return;
//     const pulse = Animated.loop(
//       Animated.sequence([
//         Animated.timing(fingerprintPulse, { toValue: 1.15, duration: 900, useNativeDriver: true }),
//         Animated.timing(fingerprintPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
//       ])
//     );
//     pulse.start();
//     return () => pulse.stop();
//   }, [biometricAvailable]);
//   // ── Biometric auth ─────────────────────────────────────────
//   const handleBiometricAuth = async () => {
//     try {
//       const result = await LocalAuthentication.authenticateAsync({
//         promptMessage: biometricType === "face" ? "Authenticate with Face ID" : "Authenticate with Fingerprint",
//         fallbackLabel: "Use Password",
//         disableDeviceFallback: false,
//         cancelLabel: "Cancel",
//       });
//       if (result.success) {
//         onLoginSuccess && onLoginSuccess();
//       } else if (result.error !== "user_cancel") {
//         Alert.alert("Authentication Failed", "Biometric authentication was not successful.");
//       }
//     } catch {
//       Alert.alert("Error", "Biometric authentication is not available right now.");
//     }
//   };
//   // ── Regular sign-in → Spring Boot ─────────────────────────
//   const handleSignIn = async () => {
//     setError("");
//     if (!empId.trim() || !password.trim()) {
//       setError("Please enter both Employee ID and Password.");
//       return;
//     }
//     // Admin shortcut (local check, no API call needed)
//     if (
//       empId.trim().toLowerCase() === ADMIN_ID &&
//       password.trim() === ADMIN_PASSWORD
//     ) {
//       onAdminSuccess && onAdminSuccess();
//       return;
//     }
//     setLoading(true);
//     try {
//       const data = await apiLogin(empId.trim(), password.trim());
//       // data = { status, message, name, email, empId, designation, faceImagePaths }
//       console.log("LOGIN DATA IN SCREEN:", data);
//       if (data.status === "success") {
//         // Store profile globally
//         login({
//           userId: data.userId,
//           name: data.name,
//           email: data.email,
//           empId: data.empId,
//           designation: data.designation,
//           faceImagePaths: data.faceImagePaths || "",
//         });
//         onLoginSuccess && onLoginSuccess();
//       } else {
//         setError(data.message || "Login failed. Please try again.");
//       }
//     } catch (err) {
//       setError(err.message || "Login failed. Check your credentials.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   const biometricLabel = biometricType === "face" ? "Login with Face ID" : "Login with Fingerprint";
//   const biometricIcon = biometricType === "face" ? "🪪" : "👆";
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
//           <View style={styles.card}>
//             <Text style={styles.title}>Sign In</Text>
//             <Text style={styles.subtitle}>Sign in to my account</Text>
//             {/* ── Admin hint badge ── */}
//             <View style={styles.hintBadge}>
//               <Text style={styles.hintIcon}>🔐</Text>
//               <Text style={styles.hintText}>
//                 Admin login: ID{" "}
//                 <Text style={styles.hintCode}>admin</Text>
//                 {"  "}pass{" "}
//                 <Text style={styles.hintCode}>admin123</Text>
//               </Text>
//             </View>
//             {/* Employee ID */}
//             <Text style={styles.label}>Employee ID</Text>
//             <View style={[styles.inputWrap, error && !empId.trim() && styles.inputError]}>
//               <TextInput
//                 style={styles.inputFlex}
//                 placeholder="e.g. 11234  or  admin"
//                 placeholderTextColor="#999"
//                 value={empId}
//                 onChangeText={(v) => { setEmpId(v); setError(""); }}
//                 autoCapitalize="none"
//               />
//             </View>
//             {/* Password */}
//             <Text style={styles.label}>Password</Text>
//             <View style={[styles.inputWrap, error && !password.trim() && styles.inputError]}>
//               <TextInput
//                 style={styles.inputFlex}
//                 secureTextEntry={!passwordVisible}
//                 placeholder="Enter password"
//                 placeholderTextColor="#999"
//                 value={password}
//                 onChangeText={(v) => { setPassword(v); setError(""); }}
//               />
//               <TouchableOpacity style={styles.eyeInside} onPress={() => setPasswordVisible((v) => !v)}>
//                 <Text style={styles.eyeText}>{passwordVisible ? "🙈" : "👁️"}</Text>
//               </TouchableOpacity>
//             </View>
//             {error ? <Text style={styles.errorText}>{error}</Text> : null}
//             <View style={styles.row}>
//               <Text style={styles.remember}>Remember Me</Text>
//               <TouchableOpacity onPress={onForgotPassword}>
//                 <Text style={styles.link}>Forgot Password</Text>
//               </TouchableOpacity>
//             </View>
//             {/* Sign In button */}
//             <TouchableOpacity
//               style={[styles.button, loading && { opacity: 0.7 }]}
//               onPress={handleSignIn} activeOpacity={0.85} disabled={loading}>
//               {loading
//                 ? <ActivityIndicator color="#fff" />
//                 : <Text style={styles.buttonText}>Sign In</Text>}
//             </TouchableOpacity>
//             {/* Biometric button */}
//             {biometricAvailable && (
//               <>
//                 <View style={styles.dividerRow}>
//                   <View style={styles.dividerLine} />
//                   <Text style={styles.dividerText}>OR</Text>
//                   <View style={styles.dividerLine} />
//                 </View>
//                 <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometricAuth} activeOpacity={0.8}>
//                   <Animated.View style={{ transform: [{ scale: fingerprintPulse }] }}>
//                     <Text style={styles.biometricBtnIcon}>{biometricIcon}</Text>
//                   </Animated.View>
//                   <Text style={styles.biometricBtnText}>{biometricLabel}</Text>
//                 </TouchableOpacity>
//               </>
//             )}
//             {/* OR divider */}
//             <View style={styles.dividerRow}>
//               <View style={styles.dividerLine} />
//               <Text style={styles.dividerText}>OR</Text>
//               <View style={styles.dividerLine} />
//             </View>
//             {/* Admin quick-login */}
//             <TouchableOpacity
//               style={styles.adminButton} activeOpacity={0.85}
//               onPress={() => { setEmpId("admin"); setPassword("admin123"); }}>
//               <Text style={styles.adminButtonIcon}>🛡️</Text>
//               <Text style={styles.adminButtonText}>Login as Admin</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
//               <Text style={styles.bottomText}>
//                 ←{"  "}<Text style={styles.link}>Back to Home</Text>
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={goToSignUp} style={{ marginTop: 14 }}>
//               <Text style={styles.bottomText}>
//                 Don't have an account?{"  "}
//                 <Text style={styles.link}>Sign Up Here</Text>
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }
// // ── Styles (100% original — zero changes) ────────────────────
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#112235" },
//   scrollContent: {
//     flexGrow: 1, justifyContent: "center",
//     paddingHorizontal: 25, paddingVertical: 40,
//   },
//   card: { marginTop: -20 },
//   title: { color: "white", fontSize: 34, fontWeight: "700", textAlign: "center" },
//   subtitle: { color: "#ddd", textAlign: "center", marginBottom: 20, marginTop: 8 },
//   hintBadge: {
//     flexDirection: "row", alignItems: "center", gap: 8,
//     backgroundColor: "rgba(59,130,246,0.12)",
//     borderWidth: 1, borderColor: "rgba(59,130,246,0.3)",
//     borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20,
//   },
//   hintIcon: { fontSize: 16 },
//   hintText: { color: "#ccc", fontSize: 12, flex: 1 },
//   hintCode: { color: "#2F6E8E", fontWeight: "700" },
//   biometricBtn: {
//     flexDirection: "row", alignItems: "center", justifyContent: "center",
//     gap: 12, backgroundColor: "#0f1e30", borderWidth: 1.5,
//     borderColor: "#2F6E8E", padding: 15, borderRadius: 30,
//   },
//   biometricBtnIcon: { fontSize: 24 },
//   biometricBtnText: { color: "#2F6E8E", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
//   label: { color: "white", marginBottom: 8, marginTop: 15, fontWeight: "500" },
//   inputWrap: {
//     flexDirection: "row", alignItems: "center",
//     backgroundColor: "#f1f1f1", borderRadius: 14, overflow: "hidden",
//     borderWidth: 2, borderColor: "transparent",
//   },
//   inputError: { borderColor: "#FF4D6D" },
//   inputFlex: { flex: 1, padding: 15, fontSize: 16, color: "#000" },
//   eyeInside: { paddingHorizontal: 14, justifyContent: "center", alignItems: "center" },
//   eyeText: { fontSize: 17 },
//   errorText: { color: "#FF4D6D", fontSize: 13, marginTop: 8, marginLeft: 4 },
//   row: {
//     flexDirection: "row", justifyContent: "space-between",
//     marginTop: 15, marginBottom: 25,
//   },
//   remember: { color: "white" },
//   link: { color: "#2F6E8E" },
//   button: {
//     backgroundColor: "#2D6F8E", padding: 16, borderRadius: 30, alignItems: "center",
//     shadowColor: "#1F5670", shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
//   },
//   buttonText: { color: "white", fontSize: 17, fontWeight: "600" },
//   dividerRow: {
//     flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20,
//   },
//   dividerLine: { flex: 1, height: 1, backgroundColor: "#1a3a5c" },
//   dividerText: { color: "#555", fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
//   adminButton: {
//     flexDirection: "row", alignItems: "center", justifyContent: "center",
//     gap: 10, backgroundColor: "#0f1e30", borderWidth: 1.5,
//     borderColor: "#2F6E8E", padding: 15, borderRadius: 30,
//   },
//   adminButtonIcon: { fontSize: 18 },
//   adminButtonText: { color: "#2F6E8E", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
//   bottomText: { color: "white", textAlign: "center" },
// });
import React, { useState, useEffect, useRef } from "react";
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
  Alert,
  Animated,
  ActivityIndicator,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { apiLogin } from "../api/authService";
import { useUser } from "../context/UserContext";
// ── Admin credentials (never exposed in UI) ───────────────────
export default function SignIn({ onBack, goToSignUp, onLoginSuccess, onAdminSuccess, onForgotPassword }) {
  const { login } = useUser();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [fingerprintPulse] = useState(new Animated.Value(1));
  const adminBtnScale = useRef(new Animated.Value(1)).current;
  const fieldShake = useRef(new Animated.Value(0)).current;
  const adminGlow = useRef(new Animated.Value(0)).current;
  // ── Check biometric support on mount ──────────────────────
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (compatible && enrolled) {
        setBiometricAvailable(true);
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType("fingerprint");
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType("face");
        }
      }
    })();
  }, []);
  // ── Fingerprint pulse animation ────────────────────────────
  useEffect(() => {
    if (!biometricAvailable) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fingerprintPulse, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(fingerprintPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [biometricAvailable]);
  // ── Admin glow loop (active only while in admin mode) ─────
  useEffect(() => {
    if (isAdminMode) {
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(adminGlow, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(adminGlow, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      );
      glow.start();
      return () => glow.stop();
    } else {
      adminGlow.setValue(0);
    }
  }, [isAdminMode]);
  // ── Admin button handler ───────────────────────────────────
  const handleAdminToggle = () => {
    Animated.sequence([
      Animated.timing(adminBtnScale, { toValue: 0.92, duration: 90, useNativeDriver: true }),
      Animated.timing(adminBtnScale, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
    if (isAdminMode) {
      setIsAdminMode(false);
      setEmpId("");
      setPassword("");
      setError("");
    } else {
      setIsAdminMode(true);
      setEmpId("");
      setPassword("");
      setError("");
      Animated.sequence([
        Animated.timing(fieldShake, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(fieldShake, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(fieldShake, { toValue: 4, duration: 50, useNativeDriver: true }),
        Animated.timing(fieldShake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  };
  // ── Biometric authentication handler ──────────────────────
  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage:
          biometricType === "face"
            ? "Authenticate with Face ID"
            : "Authenticate with Fingerprint",
        fallbackLabel: "Use Password",
        disableDeviceFallback: false,
        cancelLabel: "Cancel",
      });
      if (result.success) {
        onLoginSuccess && onLoginSuccess();
      } else if (result.error !== "user_cancel") {
        Alert.alert(
          "Authentication Failed",
          "Biometric authentication was not successful. Please try again or use your password.",
          [{ text: "OK" }]
        );
      }
    } catch {
      Alert.alert("Error", "Biometric authentication is not available right now.");
    }
  };
  // ── Sign-in handler (with real API call) ──────────────────
  const handleSignIn = async () => {
    setError("");
    if (!empId.trim() || !password.trim()) {
      setError("Please enter both Employee ID and Password.");
      return;
    }
    // Admin shortcut — local check, no API call needed
    setLoading(true);
    try {
      const data = await apiLogin(
        empId.trim(),
        password.trim(),
        isAdminMode ? "ADMIN" : "EMPLOYEE"
      );
      // data = { status, message, name, email, empId, designation, faceImagePaths }
      console.log("LOGIN DATA IN SCREEN:", data);
      if (data.status === "success") {
        login({
          userId: data.userId,
          name: data.name,
          email: data.email,
          empId: data.empId,
          designation: data.designation,
          faceImagePaths: data.faceImagePaths || "",
          // ✅ ADD THESE LINES HERE
          token: data.token,
          role: data.role,
        });
        if (data.role === "ROLE_ADMIN") {
          onAdminSuccess && onAdminSuccess();
        } else {
          onLoginSuccess && onLoginSuccess();
        }
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };
  // ── Animated border color for admin fields ─────────────────
  const animatedBorderColor = adminGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ["#1a5c7a", "#38BDF8"],
  });
  const biometricLabel = biometricType === "face" ? "Login with Face ID" : "Login with Fingerprint";
  const biometricIcon = biometricType === "face" ? "🪪" : "👆";
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
          <View style={styles.card}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>
              {isAdminMode ? "Admin Access" : "Sign in to my account"}
            </Text>
            {/* ── Admin mode badge (only visible in admin mode) ── */}
            {isAdminMode && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeIcon}>🛡️</Text>
                <Text style={styles.adminBadgeText}>Admin credentials required</Text>
              </View>
            )}
            {/* ── Employee / Admin ID field ── */}
            <Text style={[styles.label, isAdminMode && styles.labelAdmin]}>
              {isAdminMode ? "Admin ID" : "Employee ID"}
            </Text>
            <Animated.View
              style={[
                styles.inputWrap,
                error && !empId.trim() && styles.inputError,
                isAdminMode && {
                  borderColor: animatedBorderColor,
                  backgroundColor: "#0d1f30",
                },
                { transform: [{ translateX: fieldShake }] },
              ]}
            >
              <View style={styles.inputIconWrap}>
                <Text style={styles.inputIcon}>
                  {isAdminMode ? "🛡️" : "👤"}
                </Text>
              </View>
              <TextInput
                style={[styles.inputFlex, isAdminMode && styles.inputTextAdmin]}
                placeholder={isAdminMode ? "Enter Admin ID" : "Enter your Employee ID"}
                placeholderTextColor={isAdminMode ? "#3a7fa0" : "#999"}
                value={empId}
                onChangeText={(v) => { setEmpId(v); setError(""); }}
                autoCapitalize="none"
                editable={!loading}
              />
            </Animated.View>
            {/* ── Password / Admin Password field ── */}
            <Text style={[styles.label, isAdminMode && styles.labelAdmin]}>
              {isAdminMode ? "Admin Password" : "Password"}
            </Text>
            <Animated.View
              style={[
                styles.inputWrap,
                error && !password.trim() && styles.inputError,
                isAdminMode && {
                  borderColor: animatedBorderColor,
                  backgroundColor: "#0d1f30",
                },
                { transform: [{ translateX: fieldShake }] },
              ]}
            >
              <View style={styles.inputIconWrap}>
                <Text style={styles.inputIcon}>
                  {isAdminMode ? "🔑" : "🔒"}
                </Text>
              </View>
              <TextInput
                style={[styles.inputFlex, isAdminMode && styles.inputTextAdmin]}
                secureTextEntry={!passwordVisible}
                placeholder={isAdminMode ? "Enter Admin Password" : "Enter password"}
                placeholderTextColor={isAdminMode ? "#3a7fa0" : "#999"}
                value={password}
                onChangeText={(v) => { setPassword(v); setError(""); }}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeInside}
                onPress={() => setPasswordVisible((v) => !v)}
              >
                <Text style={styles.eyeText}>
                  {passwordVisible ? "🙈" : "👁️"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.row}>
              <Text style={styles.remember}>Remember Me</Text>
              <TouchableOpacity onPress={onForgotPassword}>
                <Text style={styles.link}>Forgot Password</Text>
              </TouchableOpacity>
            </View>
            {/* ── Sign In button ── */}
            <TouchableOpacity
              style={[
                styles.button,
                isAdminMode && styles.buttonAdmin,
                loading && { opacity: 0.7 },
              ]}
              onPress={handleSignIn}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isAdminMode ? "🛡️  Sign In as Admin" : "Sign In"}
                </Text>
              )}
            </TouchableOpacity>
            {/* ── Biometric (hidden in admin mode) ── */}
            {biometricAvailable && !isAdminMode && (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>
                <TouchableOpacity
                  style={styles.biometricBtn}
                  onPress={handleBiometricAuth}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <Animated.View style={{ transform: [{ scale: fingerprintPulse }] }}>
                    <Text style={styles.biometricBtnIcon}>{biometricIcon}</Text>
                  </Animated.View>
                  <Text style={styles.biometricBtnText}>{biometricLabel}</Text>
                </TouchableOpacity>
              </>
            )}
            {/* ── OR divider ── */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
            {/* ── Admin toggle button ── */}
            <Animated.View style={{ transform: [{ scale: adminBtnScale }] }}>
              <TouchableOpacity
                style={[styles.adminButton, isAdminMode && styles.adminButtonActive]}
                activeOpacity={0.85}
                onPress={handleAdminToggle}
                disabled={loading}
              >
                <Text style={styles.adminButtonIcon}>
                  {isAdminMode ? "✖️" : "🛡️"}
                </Text>
                <Text style={[styles.adminButtonText, isAdminMode && styles.adminButtonTextActive]}>
                  {isAdminMode ? "Cancel Admin Login" : "Login as Admin"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }} disabled={loading}>
              <Text style={styles.bottomText}>
                ←{"  "}
                <Text style={styles.link}>Back to Home</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToSignUp} style={{ marginTop: 14 }} disabled={loading}>
              <Text style={styles.bottomText}>
                Don't have an account?{"  "}
                <Text style={styles.link}>Sign Up Here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
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
  card: {
    marginTop: -20,
  },
  // ── Title / subtitle ──
  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: "#ddd",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  // ── Admin badge ──
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(56,189,248,0.08)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  adminBadgeIcon: { fontSize: 15 },
  adminBadgeText: { color: "#38BDF8", fontSize: 13, fontWeight: "600" },
  // ── Labels ──
  label: {
    color: "white",
    marginBottom: 8,
    marginTop: 15,
    fontWeight: "500",
  },
  labelAdmin: {
    color: "#38BDF8",
  },
  // ── Input wrapper ──
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
  inputIconWrap: {
    paddingLeft: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  inputIcon: { fontSize: 16 },
  inputFlex: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: "#000",
  },
  inputTextAdmin: {
    color: "#e0f4ff",
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 25,
  },
  remember: { color: "white" },
  link: { color: "#2F6E8E" },
  // ── Sign In button ──
  button: {
    backgroundColor: "#2D6F8E",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#1F5670",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonAdmin: {
    backgroundColor: "#0e4a6e",
    borderWidth: 1.5,
    borderColor: "#38BDF8",
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  // ── Biometric button ──
  biometricBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#0f1e30",
    borderWidth: 1.5,
    borderColor: "#2F6E8E",
    padding: 15,
    borderRadius: 30,
  },
  biometricBtnIcon: { fontSize: 24 },
  biometricBtnText: {
    color: "#2F6E8E",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  // ── OR divider ──
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1a3a5c",
  },
  dividerText: {
    color: "#555",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  // ── Admin toggle button ──
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#0f1e30",
    borderWidth: 1.5,
    borderColor: "#2F6E8E",
    padding: 15,
    borderRadius: 30,
  },
  adminButtonActive: {
    borderColor: "#FF4D6D",
    backgroundColor: "#1a0f18",
  },
  adminButtonIcon: { fontSize: 18 },
  adminButtonText: {
    color: "#2F6E8E",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  adminButtonTextActive: {
    color: "#FF4D6D",
  },
  bottomText: {
    color: "white",
    textAlign: "center",
  },
});