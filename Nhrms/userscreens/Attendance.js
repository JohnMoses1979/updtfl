/**
 * userscreens/Attendance.js
 *
 * ── Changes vs original ──────────────────────────────────────
 *  • VerifyModal → after capturing photo, calls apiFaceVerify()
 *    against Spring Boot → Python FastAPI
 *  • Uses useUser() to get empId for the API call
 *  • On face mismatch → shows the real rejection message from backend
 *  • FIX: empId is now correctly read from UserContext
 *  • FIX: camera ref properly assigned; photo capture is awaited
 *  • ALL original styles / layout / colours UNTOUCHED
 * ─────────────────────────────────────────────────────────────
 */

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   Modal,
//   ActivityIndicator,
//   Animated,
//   Easing,
//   Platform,
//   Image,
// } from "react-native";

// import { CameraView, useCameraPermissions } from "expo-camera";
// import * as Location from "expo-location";

// import { apiFaceVerify } from "../api/authService";
// import { useUser } from "../context/UserContext";

// // ─── Colors (unchanged) ──────────────────────────────────────
// const C = {
//   bg: "#1a2f4a",
//   orange: "#2F6E8E",
//   white: "#FFFFFF",
//   gray: "#888888",
//   card: "#FFFFFF",
//   border: "#EEEEEE",
//   subText: "#666666",
//   success: "#22C55E",
//   error: "#EF4444",
//   successLight: "#DCFCE7",
//   errorLight: "#FEE2E2",
//   warningLight: "#FEF9C3",
//   warning: "#F59E0B",
// };

// // ─── Office Config (unchanged) ────────────────────────────────
// const OFFICE = {
//   latitude: 17.448381,
//   longitude: 78.399465,
//   radiusMeters: 100,
//   name: "Main Office",
// };

// // ─── Utility helpers (unchanged) ─────────────────────────────
// function getDistanceMeters(lat1, lon1, lat2, lon2) {
//   const R = 6371000;
//   const toRad = (d) => (d * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }

// function formatTime(date) {
//   if (!date) return "--:-- --";
//   const h = date.getHours();
//   const m = date.getMinutes().toString().padStart(2, "0");
//   const ampm = h >= 12 ? "PM" : "AM";
//   const hour = ((h + 11) % 12 + 1).toString().padStart(2, "0");
//   return `${hour}:${m} ${ampm}`;
// }

// function formatHHMMSS(sec) {
//   const h = Math.floor(sec / 3600).toString().padStart(2, "0");
//   const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
//   const s = (sec % 60).toString().padStart(2, "0");
//   return `${h}:${m}:${s} hrs`;
// }

// function formatHHMM(sec) {
//   const h = Math.floor(sec / 3600).toString().padStart(2, "0");
//   const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
//   return `${h}:${m} Hrs`;
// }

// function getDateLabel(date) {
//   return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
// }

// const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// // ─── Seed data (unchanged) ────────────────────────────────────
// const seedHistory = () => {
//   const today = new Date();
//   return [1, 2, 3].map((offset, i) => {
//     const d = new Date(today);
//     d.setDate(d.getDate() - offset);
//     return {
//       id: i,
//       date: d,
//       totalSeconds: [8 * 3600, 8 * 3600, 8 * 3600 + 10 * 60][i],
//       checkin: "09:00 AM",
//       checkout: ["05:00 PM", "05:00 PM", "05:10 PM"][i],
//     };
//   });
// };

// // ─── Step Row (unchanged) ─────────────────────────────────────
// function StepRow({ emoji, title, subtitle, state }) {
//   const bg = { idle: "#F3F4F6", checking: C.warningLight, success: C.successLight, error: C.errorLight }[state];
//   const color = { idle: C.gray, checking: C.warning, success: C.success, error: C.error }[state];

//   return (
//     <View style={sr.row}>
//       <View style={[sr.iconBox, { backgroundColor: bg }]}>
//         {state === "checking"
//           ? <ActivityIndicator size="small" color={C.warning} />
//           : <Text style={[sr.symbol, { color }]}>{{ idle: emoji, success: "✓", error: "✗" }[state] ?? emoji}</Text>}
//       </View>
//       <View style={{ flex: 1 }}>
//         <Text style={sr.title}>{title}</Text>
//         <Text style={[sr.sub, state !== "idle" && { color }]}>{subtitle}</Text>
//       </View>
//     </View>
//   );
// }

// const sr = StyleSheet.create({
//   row: {
//     flexDirection: "row", alignItems: "center", paddingVertical: 10,
//     borderBottomWidth: 0.5, borderBottomColor: C.border,
//   },
//   iconBox: {
//     width: 36, height: 36, borderRadius: 18,
//     alignItems: "center", justifyContent: "center", marginRight: 12,
//   },
//   symbol: { fontSize: 16, fontWeight: "700" },
//   title: { fontSize: 14, fontWeight: "600", color: "#1a2f4a" },
//   sub: { fontSize: 12, color: C.gray, marginTop: 2 },
// });

// // ─────────────────────────────────────────────────────────────
// //  FACE + LOCATION VERIFICATION MODAL
// // ─────────────────────────────────────────────────────────────
// function VerifyModal({ visible, isClockedIn, onSuccess, onCancel }) {
//   const { user } = useUser();
//   const [permission, requestPermission] = useCameraPermissions();

//   const [phase, setPhase] = useState("camera");
//   const [countdown, setCountdown] = useState(3);
//   const [capturedUri, setCapturedUri] = useState(null);

//   const [faceState, setFaceState] = useState("idle");
//   const [faceSub, setFaceSub] = useState("Align your face in the oval");
//   const [locState, setLocState] = useState("idle");
//   const [locSub, setLocSub] = useState("Waiting...");

//   const [resultOk, setResultOk] = useState(false);
//   const [resultMsg, setResultMsg] = useState("");
//   const [faceReady, setFaceReady] = useState(false);

//   const cameraRef = useRef(null);
//   const scanAnim = useRef(new Animated.Value(0)).current;
//   const countdownRef = useRef(null);

//   useEffect(() => {
//     if (visible) {
//       reset();
//       if (!permission?.granted) requestPermission();
//     }
//     return () => clearInterval(countdownRef.current);
//   }, [visible]);

//   useEffect(() => {
//     if (phase === "camera" || phase === "countdown") {
//       const loop = Animated.loop(
//         Animated.timing(scanAnim, {
//           toValue: 1, duration: 1800,
//           easing: Easing.linear, useNativeDriver: true,
//         })
//       );
//       loop.start();
//       return () => loop.stop();
//     }
//   }, [phase]);

//   function reset() {
//     clearInterval(countdownRef.current);
//     setPhase("camera");
//     setCountdown(3);
//     setCapturedUri(null);
//     setFaceState("idle");
//     setFaceSub("Align your face in the oval");
//     setLocState("idle");
//     setLocSub("Waiting...");
//     setResultOk(false);
//     setResultMsg("");
//     setFaceReady(false);
//   }

//   function startCapture() {
//     if (!faceReady) {
//       Alert.alert("Face Not Confirmed", "Please tick the checkbox to confirm your face is clearly visible.");
//       return;
//     }
//     setPhase("countdown");
//     let count = 3;
//     setCountdown(count);
//     countdownRef.current = setInterval(async () => {
//       count -= 1;
//       if (count > 0) {
//         setCountdown(count);
//       } else {
//         clearInterval(countdownRef.current);
//         await captureAndVerify();
//       }
//     }, 1000);
//   }

//   async function captureAndVerify() {
//     setPhase("verifying");

//     // ── Capture photo ────────────────────────────────────────
//     let photoUri = null;
//     try {
//       if (cameraRef.current) {
//         console.log("[VerifyModal] Taking picture...");
//         const photo = await cameraRef.current.takePictureAsync({
//           quality: 0.8,
//           base64: false,
//           skipProcessing: false,
//         });
//         photoUri = photo.uri;
//         setCapturedUri(photo.uri);
//         console.log("[VerifyModal] Photo captured:", photoUri);
//       } else {
//         console.warn("[VerifyModal] cameraRef is null — cannot capture photo");
//       }
//     } catch (captureErr) {
//       console.error("[VerifyModal] Capture error:", captureErr);
//     }

//     // ── Face Verification via Spring Boot → Python FastAPI ────
//     setFaceState("checking");
//     setFaceSub("Verifying face with server...");

//     let faceOk = false;
//     let faceMessage = "Face verification failed";

//     try {
//       // Get empId from UserContext
//       const empId = user?.empId;
//       if (!empId) {
//         throw new Error("Employee ID not found in session. Please log in again.");
//       }

//       console.log("[VerifyModal] Verifying face for empId:", empId);

//       // photoUri may be null if camera failed — the server will return match=false
//       const result = await apiFaceVerify(empId, photoUri || "");

//       console.log("[VerifyModal] Face verify result:", result);

//       faceOk = result.match === true;
//       faceMessage = result.message || (faceOk ? "Face verified ✓" : "Face mismatch");
//     } catch (err) {
//       console.error("[VerifyModal] Face verify error:", err);
//       faceOk = false;
//       faceMessage = err.message || "Could not reach face verification service";
//     }

//     if (!faceOk) {
//       setFaceState("error");
//       setFaceSub(faceMessage);
//       setPhase("result");
//       setResultOk(false);
//       setResultMsg(faceMessage);
//       return;
//     }

//     setFaceState("success");
//     setFaceSub("Face verified ✓");

//     // ── Location Check (unchanged) ─────────────────────────
//     setLocState("checking");
//     setLocSub("Fetching your location...");

//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") throw new Error("permission_denied");

//       const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
//       const dist = getDistanceMeters(
//         pos.coords.latitude, pos.coords.longitude,
//         OFFICE.latitude, OFFICE.longitude
//       );

//       if (dist <= OFFICE.radiusMeters) {
//         setLocState("success");
//         setLocSub(`Within ${OFFICE.name} · ${Math.round(dist)}m away`);
//         await delay(500);
//         setPhase("result");
//         setResultOk(true);
//         setResultMsg(
//           isClockedIn
//             ? `Checked out at ${formatTime(new Date())}`
//             : `Checked in at ${formatTime(new Date())}`
//         );
//       } else {
//         setLocState("error");
//         setLocSub(`${Math.round(dist)}m from office — outside allowed zone`);
//         await delay(400);
//         setPhase("result");
//         setResultOk(false);
//         setResultMsg(
//           `You are ${Math.round(dist)}m away from ${OFFICE.name}.\n` +
//           `Allowed radius is ${OFFICE.radiusMeters}m.\n` +
//           `Please check in from within the office premises.`
//         );
//       }
//     } catch (err) {
//       const msg = err.message === "permission_denied"
//         ? "Location permission denied. Please enable it in device Settings."
//         : "Could not fetch location. Please turn on GPS and try again.";
//       setLocState("error");
//       setLocSub(msg);
//       await delay(400);
//       setPhase("result");
//       setResultOk(false);
//       setResultMsg(msg);
//     }
//   }

//   const scanY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 170] });

//   if (!visible) return null;

//   return (
//     <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
//       <View style={ms.overlay}>
//         <View style={ms.sheet}>
//           <Text style={ms.sheetTitle}>
//             {isClockedIn ? "Verify to Check Out" : "Verify to Check In"}
//           </Text>
//           <Text style={ms.sheetSub}>Face ID + Location required</Text>

//           {(phase === "camera" || phase === "countdown") && (
//             <>
//               {!permission && (
//                 <View style={ms.centerBox}><ActivityIndicator color={C.orange} /></View>
//               )}

//               {permission && !permission.granted && (
//                 <View style={ms.centerBox}>
//                   <Text style={ms.errorTxt}>Camera permission denied.{"\n"}Enable it in device Settings.</Text>
//                   <TouchableOpacity style={ms.btnOrange} onPress={requestPermission}>
//                     <Text style={ms.btnTxt}>Grant Permission</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}

//               {permission && permission.granted && (
//                 <>
//                   <View style={ms.camBox}>
//                     <CameraView
//                       ref={cameraRef}
//                       style={ms.camera}
//                       facing="front"
//                     >
//                       <View style={ms.ovalWrap}>
//                         <View style={[ms.oval, faceReady && { borderColor: C.success }]} />
//                         <Animated.View style={[ms.scanLine, {
//                           transform: [{ translateY: scanY }],
//                           backgroundColor: faceReady ? C.success : C.orange,
//                         }]} />
//                       </View>

//                       {phase === "countdown" && (
//                         <View style={ms.countdownOverlay}>
//                           <Text style={ms.countdownNum}>{countdown}</Text>
//                         </View>
//                       )}

//                       <View style={[ms.pill, {
//                         backgroundColor: faceReady ? "rgba(34,197,94,0.85)" : "rgba(0,0,0,0.6)",
//                       }]}>
//                         <Text style={ms.pillTxt}>
//                           {phase === "countdown"
//                             ? `Taking photo in ${countdown}...`
//                             : faceReady ? "✓ Ready — tap Capture" : "Look straight at the camera"}
//                         </Text>
//                       </View>
//                     </CameraView>
//                   </View>

//                   {phase === "camera" && (
//                     <TouchableOpacity
//                       style={ms.readyRow}
//                       onPress={() => setFaceReady((v) => !v)}
//                       activeOpacity={0.8}
//                     >
//                       <View style={[ms.readyChk, faceReady && { backgroundColor: C.success, borderColor: C.success }]}>
//                         {faceReady && <Text style={{ color: C.white, fontSize: 13, fontWeight: "700" }}>✓</Text>}
//                       </View>
//                       <Text style={ms.readyLabel}>My face is clearly visible in the frame</Text>
//                     </TouchableOpacity>
//                   )}

//                   {phase === "camera" && (
//                     <TouchableOpacity
//                       style={[ms.btnOrange, !faceReady && { backgroundColor: "#C8C8C8" }]}
//                       onPress={startCapture}
//                     >
//                       <Text style={ms.btnTxt}>Capture & Verify</Text>
//                     </TouchableOpacity>
//                   )}
//                 </>
//               )}
//             </>
//           )}

//           {phase === "verifying" && (
//             <View style={{ marginBottom: 16 }}>
//               <StepRow emoji="👤" title="Face Recognition" subtitle={faceSub} state={faceState} />
//               <StepRow emoji="📍" title="Location Verification" subtitle={locSub} state={locState} />
//             </View>
//           )}

//           {phase === "result" && (
//             <View style={ms.resultBox}>
//               {capturedUri && (
//                 <Image
//                   source={{ uri: capturedUri }}
//                   style={[ms.capturedImg, { borderColor: resultOk ? C.success : C.error }]}
//                 />
//               )}
//               <View style={[ms.resultCircle, { backgroundColor: resultOk ? C.successLight : C.errorLight }]}>
//                 <Text style={[ms.resultIcon, { color: resultOk ? C.success : C.error }]}>
//                   {resultOk ? "✓" : "✗"}
//                 </Text>
//               </View>
//               <Text style={[ms.resultTitle, { color: resultOk ? C.success : C.error }]}>
//                 {resultOk ? (isClockedIn ? "Checked Out!" : "Checked In!") : "Verification Failed"}
//               </Text>
//               <Text style={ms.resultMsg}>{resultMsg}</Text>
//               <TouchableOpacity style={ms.btnOrange} onPress={resultOk ? onSuccess : reset}>
//                 <Text style={ms.btnTxt}>{resultOk ? "Done" : "Try Again"}</Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {!(phase === "result" && resultOk) && (
//             <TouchableOpacity style={ms.cancelBtn} onPress={onCancel}>
//               <Text style={ms.cancelTxt}>Cancel</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </Modal>
//   );
// }

// // ─── Modal styles (unchanged) ─────────────────────────────────
// const ms = StyleSheet.create({
//   overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
//   sheet: {
//     backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
//     paddingHorizontal: 20, paddingTop: 22,
//     paddingBottom: Platform.OS === "ios" ? 38 : 24,
//   },
//   sheetTitle: { fontSize: 18, fontWeight: "700", color: "#1a2f4a" },
//   sheetSub: { fontSize: 13, color: C.gray, marginTop: 3, marginBottom: 16 },

//   camBox: { height: 260, borderRadius: 16, overflow: "hidden", marginBottom: 12 },
//   camera: { flex: 1 },

//   ovalWrap: {
//     position: "absolute", top: "8%", left: "18%", right: "18%", bottom: "8%",
//     alignItems: "center", justifyContent: "center", overflow: "hidden",
//   },
//   oval: {
//     position: "absolute", width: "100%", height: "100%",
//     borderWidth: 2.5, borderColor: C.orange, borderRadius: 999,
//   },
//   scanLine: { position: "absolute", left: 0, right: 0, height: 2, opacity: 0.8 },

//   countdownOverlay: {
//     ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)",
//     alignItems: "center", justifyContent: "center",
//   },
//   countdownNum: { fontSize: 72, fontWeight: "800", color: C.white },

//   pill: {
//     position: "absolute", bottom: 12, alignSelf: "center",
//     borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
//   },
//   pillTxt: { color: C.white, fontSize: 13, fontWeight: "600" },

//   readyRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 10 },
//   readyChk: {
//     width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: C.gray,
//     alignItems: "center", justifyContent: "center",
//   },
//   readyLabel: { fontSize: 13, color: "#1a2f4a", flex: 1 },

//   btnOrange: {
//     backgroundColor: "#2F6E8E", borderRadius: 30, paddingVertical: 14,
//     alignItems: "center", marginBottom: 10,
//   },
//   btnTxt: { color: C.white, fontSize: 16, fontWeight: "700" },

//   cancelBtn: { alignItems: "center", paddingVertical: 12 },
//   cancelTxt: { color: C.gray, fontSize: 15 },

//   centerBox: { height: 200, alignItems: "center", justifyContent: "center", gap: 16 },
//   errorTxt: { color: C.error, fontSize: 14, textAlign: "center", lineHeight: 22 },

//   resultBox: { alignItems: "center", paddingVertical: 8, marginBottom: 8 },
//   capturedImg: { width: 90, height: 90, borderRadius: 45, marginBottom: 14, borderWidth: 3 },
//   resultCircle: {
//     width: 72, height: 72, borderRadius: 36,
//     alignItems: "center", justifyContent: "center", marginBottom: 12,
//   },
//   resultIcon: { fontSize: 30, fontWeight: "800" },
//   resultTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
//   resultMsg: {
//     fontSize: 13, color: C.gray, textAlign: "center",
//     lineHeight: 20, marginBottom: 20, paddingHorizontal: 10,
//   },
// });

// // ─── Orange Header (unchanged) ────────────────────────────────
// function OrangeHeader() {
//   return (
//     <View style={styles.orangeHeader}>
//       <View style={{ flex: 1 }}>
//         <Text style={styles.headerTitle}>Let's Check-In!</Text>
//         <Text style={styles.headerSub}>Don't miss your Check-in schedule</Text>
//       </View>
//       <View style={{ alignItems: "center" }}>
//         <Text style={{ fontSize: 38 }}>⏰</Text>
//         <Text style={styles.sparkles}>✦ ✦ ✦</Text>
//       </View>
//     </View>
//   );
// }

// // ─── Total Work Card (unchanged) ──────────────────────────────
// function TotalWorkCard({ todaySeconds, periodSeconds, isClockedIn, onPress }) {
//   return (
//     <View style={styles.card}>
//       <Text style={styles.cardTitle}>Total Working Hour</Text>
//       <View style={styles.hoursRow}>
//         <View style={styles.hoursBox}>
//           <Text style={styles.hoursLabel}>🕐  Today</Text>
//           <Text style={styles.hoursValue}>{formatHHMM(todaySeconds)}</Text>
//         </View>
//         <View style={{ width: 10 }} />
//         <View style={styles.hoursBox}>
//           <Text style={styles.hoursLabel}>🕐  This Pay Period</Text>
//           <Text style={styles.hoursValue}>{formatHHMM(periodSeconds)}</Text>
//         </View>
//       </View>
//       {isClockedIn && (
//         <View style={styles.liveBadge}>
//           <View style={styles.liveDot} />
//           <Text style={styles.liveTxt}>Currently clocked in</Text>
//         </View>
//       )}
//       <TouchableOpacity
//         style={isClockedIn ? styles.checkoutBtn : styles.checkinBtn}
//         onPress={onPress} activeOpacity={0.85}>
//         <Text style={styles.mainBtnTxt}>{isClockedIn ? "Check Out" : "Check In"}</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// // ─── History Card (unchanged) ────────────────────────────────
// function HistoryCard({ entry }) {
//   return (
//     <View style={styles.historyCard}>
//       <Text style={styles.historyDate}>{getDateLabel(entry.date)}</Text>
//       <View style={styles.historyRow}>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.historyLabel}>Total Hours</Text>
//           <Text style={styles.historyValue}>{formatHHMMSS(entry.totalSeconds)}</Text>
//         </View>
//         <View style={styles.historyDivider} />
//         <View style={{ flex: 1 }}>
//           <Text style={styles.historyLabel}>Clock in & Out</Text>
//           <Text style={styles.historyValue}>
//             {entry.checkin}
//             <Text style={{ color: C.gray }}>  —  </Text>
//             {entry.checkout}
//           </Text>
//         </View>
//       </View>
//     </View>
//   );
// }

// // ─── Main Screen (unchanged structure) ───────────────────────
// export default function CheckInScreen({ onTabPress, activeTab = 1 }) {
//   const [isClockedIn, setIsClockedIn] = useState(false);
//   const [checkinTime, setCheckinTime] = useState(null);
//   const [todaySeconds, setTodaySeconds] = useState(0);
//   const [periodSeconds, setPeriodSeconds] = useState(32 * 3600);
//   const [history, setHistory] = useState(seedHistory());
//   const [modalVisible, setModalVisible] = useState(false);
//   const timerRef = useRef(null);

//   useEffect(() => {
//     if (isClockedIn) {
//       timerRef.current = setInterval(() => {
//         setTodaySeconds((s) => s + 1);
//         setPeriodSeconds((s) => s + 1);
//       }, 1000);
//     } else {
//       clearInterval(timerRef.current);
//     }
//     return () => clearInterval(timerRef.current);
//   }, [isClockedIn]);

//   const handleVerified = () => {
//     setModalVisible(false);
//     if (!isClockedIn) {
//       const now = new Date();
//       setCheckinTime(now);
//       setIsClockedIn(true);
//       Alert.alert("✅ Checked In", `Welcome! Checked in at ${formatTime(now)}`);
//     } else {
//       const now = new Date();
//       setIsClockedIn(false);
//       setHistory((prev) => [{
//         id: Date.now(), date: new Date(), totalSeconds: todaySeconds,
//         checkin: formatTime(checkinTime), checkout: formatTime(now),
//       }, ...prev]);
//       Alert.alert("👋 Checked Out",
//         `Checked out at ${formatTime(now)}\nTotal today: ${formatHHMMSS(todaySeconds)}`);
//       setTodaySeconds(0);
//       setCheckinTime(null);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <OrangeHeader />
//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={{ paddingBottom: 24 }}
//         showsVerticalScrollIndicator={false}>
//         <TotalWorkCard
//           todaySeconds={todaySeconds}
//           periodSeconds={periodSeconds}
//           isClockedIn={isClockedIn}
//           onPress={() => setModalVisible(true)}
//         />
//         {history.map((e) => <HistoryCard key={e.id} entry={e} />)}
//       </ScrollView>

//       <VerifyModal
//         visible={modalVisible}
//         isClockedIn={isClockedIn}
//         onSuccess={handleVerified}
//         onCancel={() => setModalVisible(false)}
//       />
//     </SafeAreaView>
//   );
// }

// // ─── Styles (100% original — zero changes) ───────────────────
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: C.bg },
//   scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

//   orangeHeader: {
//     backgroundColor: "#2F6E8E", paddingHorizontal: 22,
//     paddingTop: 20, paddingBottom: 26,
//     flexDirection: "row", alignItems: "center",
//   },
//   headerTitle: { color: C.white, fontSize: 24, fontWeight: "800", paddingTop: 39 },
//   headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
//   sparkles: { color: C.white, fontSize: 10, letterSpacing: 2, marginTop: 2 },

//   card: {
//     backgroundColor: C.card, borderRadius: 16, padding: 18, marginBottom: 14,
//     shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
//   },
//   cardTitle: { color: "#1a2f4a", fontSize: 15, fontWeight: "700" },

//   hoursRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
//   hoursBox: { flex: 1, backgroundColor: "#EFF6FF", borderRadius: 10, padding: 12 },
//   hoursLabel: { color: C.subText, fontSize: 12, marginBottom: 6 },
//   hoursValue: { color: "#1a2f4a", fontSize: 20, fontWeight: "700" },

//   liveBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
//   liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.success },
//   liveTxt: { fontSize: 12, color: C.success, fontWeight: "600" },

//   checkinBtn: { backgroundColor: "#2F6E8E", borderRadius: 30, paddingVertical: 14, alignItems: "center" },
//   checkoutBtn: { backgroundColor: "#1a3a5c", borderRadius: 30, paddingVertical: 14, alignItems: "center" },
//   mainBtnTxt: { color: C.white, fontSize: 16, fontWeight: "700" },

//   historyCard: {
//     backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12,
//     shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
//   },
//   historyDate: { color: C.orange, fontWeight: "700", fontSize: 14, marginBottom: 12 },
//   historyRow: {
//     flexDirection: "row", backgroundColor: "#EFF6FF",
//     borderRadius: 10, padding: 12, alignItems: "center",
//   },
//   historyDivider: { width: 1, height: 36, backgroundColor: "#DDDDDD", marginHorizontal: 12 },
//   historyLabel: { color: C.subText, fontSize: 11, marginBottom: 4 },
//   historyValue: { color: "#1a2f4a", fontSize: 13, fontWeight: "600" },
// });


// /**
//  * userscreens/Attendance.js
//  *
//  * ── ONLY CHANGES vs original ─────────────────────────────────
//  *  1. takePictureAsync() now retries up to 3 times with a 400 ms gap
//  *     (fixes "Failed to capture image" on Android / Expo Go).
//  *  2. Added a 600 ms warm-up delay before the first capture attempt so the
//  *     Android camera sensor has time to initialise.
//  *  3. If ALL capture attempts fail we show a clear error result screen
//  *     instead of sending an empty URI to the server (fixes
//  *     "Network request failed" that happened because FormData with an
//  *     empty/null URI crashes on Android).
//  *  4. skipProcessing: true added to takePictureAsync options — speeds up
//  *     Android capture significantly.
//  *
//  *  ALL original styles / layout / colours / logic UNTOUCHED.
//  * ─────────────────────────────────────────────────────────────
//  */

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   Modal,
//   ActivityIndicator,
//   Animated,
//   Easing,
//   Platform,
//   Image,
// } from "react-native";

// import { CameraView, useCameraPermissions } from "expo-camera";
// import * as Location from "expo-location";

// import { apiFaceVerify } from "../api/authService";
// import { useUser } from "../context/UserContext";

// // ─── Colors (unchanged) ──────────────────────────────────────
// const C = {
//   bg: "#1a2f4a",
//   orange: "#2F6E8E",
//   white: "#FFFFFF",
//   gray: "#888888",
//   card: "#FFFFFF",
//   border: "#EEEEEE",
//   subText: "#666666",
//   success: "#22C55E",
//   error: "#EF4444",
//   successLight: "#DCFCE7",
//   errorLight: "#FEE2E2",
//   warningLight: "#FEF9C3",
//   warning: "#F59E0B",
// };

// // ─── Office Config (unchanged) ────────────────────────────────
// const OFFICE = {
//   latitude: 17.448381,
//   longitude: 78.399465,
//   radiusMeters: 100,
//   name: "Main Office",
// };

// // ─── Utility helpers (unchanged) ─────────────────────────────
// function getDistanceMeters(lat1, lon1, lat2, lon2) {
//   const R = 6371000;
//   const toRad = (d) => (d * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }

// function formatTime(date) {
//   if (!date) return "--:-- --";
//   const h = date.getHours();
//   const m = date.getMinutes().toString().padStart(2, "0");
//   const ampm = h >= 12 ? "PM" : "AM";
//   const hour = ((h + 11) % 12 + 1).toString().padStart(2, "0");
//   return `${hour}:${m} ${ampm}`;
// }

// function formatHHMMSS(sec) {
//   const h = Math.floor(sec / 3600).toString().padStart(2, "0");
//   const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
//   const s = (sec % 60).toString().padStart(2, "0");
//   return `${h}:${m}:${s} hrs`;
// }

// function formatHHMM(sec) {
//   const h = Math.floor(sec / 3600).toString().padStart(2, "0");
//   const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
//   return `${h}:${m} Hrs`;
// }

// function getDateLabel(date) {
//   return date.toLocaleDateString("en-GB", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });
// }

// const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// // ─── Seed data (unchanged) ────────────────────────────────────
// const seedHistory = () => {
//   const today = new Date();
//   return [1, 2, 3].map((offset, i) => {
//     const d = new Date(today);
//     d.setDate(d.getDate() - offset);
//     return {
//       id: i,
//       date: d,
//       totalSeconds: [8 * 3600, 8 * 3600, 8 * 3600 + 10 * 60][i],
//       checkin: "09:00 AM",
//       checkout: ["05:00 PM", "05:00 PM", "05:10 PM"][i],
//     };
//   });
// };

// // ─── Step Row (unchanged) ─────────────────────────────────────
// function StepRow({ emoji, title, subtitle, state }) {
//   const bg = {
//     idle: "#F3F4F6",
//     checking: C.warningLight,
//     success: C.successLight,
//     error: C.errorLight,
//   }[state];
//   const color = {
//     idle: C.gray,
//     checking: C.warning,
//     success: C.success,
//     error: C.error,
//   }[state];

//   return (
//     <View style={sr.row}>
//       <View style={[sr.iconBox, { backgroundColor: bg }]}>
//         {state === "checking" ? (
//           <ActivityIndicator size="small" color={C.warning} />
//         ) : (
//           <Text style={[sr.symbol, { color }]}>
//             {{ idle: emoji, success: "✓", error: "✗" }[state] ?? emoji}
//           </Text>
//         )}
//       </View>
//       <View style={{ flex: 1 }}>
//         <Text style={sr.title}>{title}</Text>
//         <Text style={[sr.sub, state !== "idle" && { color }]}>{subtitle}</Text>
//       </View>
//     </View>
//   );
// }

// const sr = StyleSheet.create({
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderBottomWidth: 0.5,
//     borderBottomColor: C.border,
//   },
//   iconBox: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 12,
//   },
//   symbol: { fontSize: 16, fontWeight: "700" },
//   title: { fontSize: 14, fontWeight: "600", color: "#1a2f4a" },
//   sub: { fontSize: 12, color: C.gray, marginTop: 2 },
// });

// // ─────────────────────────────────────────────────────────────
// //  FACE + LOCATION VERIFICATION MODAL
// // ─────────────────────────────────────────────────────────────
// function VerifyModal({ visible, isClockedIn, onSuccess, onCancel }) {
//   const { user } = useUser();
//   const [permission, requestPermission] = useCameraPermissions();

//   const [phase, setPhase] = useState("camera");
//   const [countdown, setCountdown] = useState(3);
//   const [capturedUri, setCapturedUri] = useState(null);

//   const [faceState, setFaceState] = useState("idle");
//   const [faceSub, setFaceSub] = useState("Align your face in the oval");
//   const [locState, setLocState] = useState("idle");
//   const [locSub, setLocSub] = useState("Waiting...");

//   const [resultOk, setResultOk] = useState(false);
//   const [resultMsg, setResultMsg] = useState("");
//   const [faceReady, setFaceReady] = useState(false);

//   const cameraRef = useRef(null);
//   const scanAnim = useRef(new Animated.Value(0)).current;
//   const countdownRef = useRef(null);

//   useEffect(() => {
//     if (visible) {
//       reset();
//       if (!permission?.granted) requestPermission();
//     }
//     return () => clearInterval(countdownRef.current);
//   }, [visible]);

//   useEffect(() => {
//     if (phase === "camera" || phase === "countdown") {
//       const loop = Animated.loop(
//         Animated.timing(scanAnim, {
//           toValue: 1,
//           duration: 1800,
//           easing: Easing.linear,
//           useNativeDriver: true,
//         })
//       );
//       loop.start();
//       return () => loop.stop();
//     }
//   }, [phase]);

//   function reset() {
//     clearInterval(countdownRef.current);
//     setPhase("camera");
//     setCountdown(3);
//     setCapturedUri(null);
//     setFaceState("idle");
//     setFaceSub("Align your face in the oval");
//     setLocState("idle");
//     setLocSub("Waiting...");
//     setResultOk(false);
//     setResultMsg("");
//     setFaceReady(false);
//   }

//   function startCapture() {
//     if (!faceReady) {
//       Alert.alert(
//         "Face Not Confirmed",
//         "Please tick the checkbox to confirm your face is clearly visible."
//       );
//       return;
//     }
//     setPhase("countdown");
//     let count = 3;
//     setCountdown(count);
//     countdownRef.current = setInterval(async () => {
//       count -= 1;
//       if (count > 0) {
//         setCountdown(count);
//       } else {
//         clearInterval(countdownRef.current);
//         await captureAndVerify();
//       }
//     }, 1000);
//   }

//   // ─────────────────────────────────────────────────────────
//   // FIX 1: retry wrapper — handles "Failed to capture image"
//   // on Android where the first attempt often fails because the
//   // camera sensor hasn't finished initialising.
//   // ─────────────────────────────────────────────────────────
//   async function takePictureWithRetry() {
//     // FIX 2: warm-up delay so Android camera is fully ready
//     await delay(600);

//     for (let attempt = 1; attempt <= 3; attempt++) {
//       try {
//         if (!cameraRef.current) {
//           console.warn(`[VerifyModal] cameraRef null on attempt ${attempt}`);
//           await delay(400);
//           continue;
//         }

//         console.log(`[VerifyModal] takePictureAsync attempt ${attempt}/3`);

//         const photo = await cameraRef.current.takePictureAsync({
//           quality: 0.8,
//           base64: false,
//           // FIX 3: skipProcessing speeds up Android capture and avoids
//           // post-processing crashes in Expo Go
//           skipProcessing: true,
//         });

//         if (photo && photo.uri) {
//           console.log(
//             `[VerifyModal] Captured on attempt ${attempt}:`,
//             photo.uri.substring(0, 60) + "..."
//           );
//           return photo.uri;
//         }
//       } catch (err) {
//         console.warn(
//           `[VerifyModal] Attempt ${attempt} failed: ${err.message}`
//         );
//         if (attempt < 3) await delay(400);
//       }
//     }

//     return null;
//   }

//   async function captureAndVerify() {
//     setPhase("verifying");

//     // ── Capture photo ──────────────────────────────────────
//     let photoUri = null;
//     try {
//       if (Platform.OS === "web") {
//         // Web path — unchanged from original
//         if (cameraRef.current) {
//           console.log("[VerifyModal] Taking picture...");
//           const photo = await cameraRef.current.takePictureAsync({
//             quality: 0.8,
//             base64: false,
//             skipProcessing: false,
//           });
//           photoUri = photo.uri;
//           setCapturedUri(photo.uri);
//           console.log("[VerifyModal] Photo captured:", photoUri);
//         } else {
//           console.warn("[VerifyModal] cameraRef is null — cannot capture photo");
//         }
//       } else {
//         // Android / iOS — use retry wrapper
//         photoUri = await takePictureWithRetry();
//         if (photoUri) setCapturedUri(photoUri);
//       }
//     } catch (captureErr) {
//       console.error("[VerifyModal] Capture error:", captureErr);
//     }

//     // ─────────────────────────────────────────────────────
//     // FIX 4: bail out early if capture failed entirely.
//     // Without this the original code called apiFaceVerify("")
//     // which built FormData with an empty URI → crash →
//     // "Network request failed" on Android.
//     // ─────────────────────────────────────────────────────
//     if (!photoUri) {
//       console.warn("[VerifyModal] All capture attempts failed");
//       setFaceState("error");
//       setFaceSub("Camera capture failed. Please try again.");
//       setPhase("result");
//       setResultOk(false);
//       setResultMsg(
//         "Could not take a photo from the camera.\n\n" +
//         "Please:\n• Hold the phone steady\n" +
//         "• Ensure good lighting\n• Try again"
//       );
//       return;
//     }

//     // ── Face Verification via Spring Boot → Python FastAPI ─
//     setFaceState("checking");
//     setFaceSub("Verifying face with server...");

//     let faceOk = false;
//     let faceMessage = "Face verification failed";

//     try {
//       const empId = user?.empId;
//       if (!empId) {
//         throw new Error(
//           "Employee ID not found in session. Please log in again."
//         );
//       }

//       console.log("[VerifyModal] Verifying face for empId:", empId);

//       const result = await apiFaceVerify(empId, photoUri);

//       console.log("[VerifyModal] Face verify result:", result);

//       faceOk = result.match === true;
//       faceMessage =
//         result.message || (faceOk ? "Face verified ✓" : "Face mismatch");
//     } catch (err) {
//       console.error("[VerifyModal] Face verify error:", err);
//       faceOk = false;
//       faceMessage =
//         err.message || "Could not reach face verification service";
//     }

//     if (!faceOk) {
//       setFaceState("error");
//       setFaceSub(faceMessage);
//       setPhase("result");
//       setResultOk(false);
//       setResultMsg(faceMessage);
//       return;
//     }

//     setFaceState("success");
//     setFaceSub("Face verified ✓");

//     // ── Location Check (unchanged) ─────────────────────────
//     setLocState("checking");
//     setLocSub("Fetching your location...");

//     try {
//       const { status } =
//         await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") throw new Error("permission_denied");

//       const pos = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       });
//       const dist = getDistanceMeters(
//         pos.coords.latitude,
//         pos.coords.longitude,
//         OFFICE.latitude,
//         OFFICE.longitude
//       );

//       if (dist <= OFFICE.radiusMeters) {
//         setLocState("success");
//         setLocSub(`Within ${OFFICE.name} · ${Math.round(dist)}m away`);
//         await delay(500);
//         setPhase("result");
//         setResultOk(true);
//         setResultMsg(
//           isClockedIn
//             ? `Checked out at ${formatTime(new Date())}`
//             : `Checked in at ${formatTime(new Date())}`
//         );
//       } else {
//         setLocState("error");
//         setLocSub(
//           `${Math.round(dist)}m from office — outside allowed zone`
//         );
//         await delay(400);
//         setPhase("result");
//         setResultOk(false);
//         setResultMsg(
//           `You are ${Math.round(dist)}m away from ${OFFICE.name}.\n` +
//           `Allowed radius is ${OFFICE.radiusMeters}m.\n` +
//           `Please check in from within the office premises.`
//         );
//       }
//     } catch (err) {
//       const msg =
//         err.message === "permission_denied"
//           ? "Location permission denied. Please enable it in device Settings."
//           : "Could not fetch location. Please turn on GPS and try again.";
//       setLocState("error");
//       setLocSub(msg);
//       await delay(400);
//       setPhase("result");
//       setResultOk(false);
//       setResultMsg(msg);
//     }
//   }

//   const scanY = scanAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, 170],
//   });

//   if (!visible) return null;

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="slide"
//       onRequestClose={onCancel}
//     >
//       <View style={ms.overlay}>
//         <View style={ms.sheet}>
//           <Text style={ms.sheetTitle}>
//             {isClockedIn ? "Verify to Check Out" : "Verify to Check In"}
//           </Text>
//           <Text style={ms.sheetSub}>Face ID + Location required</Text>

//           {(phase === "camera" || phase === "countdown") && (
//             <>
//               {!permission && (
//                 <View style={ms.centerBox}>
//                   <ActivityIndicator color={C.orange} />
//                 </View>
//               )}

//               {permission && !permission.granted && (
//                 <View style={ms.centerBox}>
//                   <Text style={ms.errorTxt}>
//                     Camera permission denied.{"\n"}Enable it in device
//                     Settings.
//                   </Text>
//                   <TouchableOpacity
//                     style={ms.btnOrange}
//                     onPress={requestPermission}
//                   >
//                     <Text style={ms.btnTxt}>Grant Permission</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}

//               {permission && permission.granted && (
//                 <>
//                   <View style={ms.camBox}>
//                     <CameraView
//                       ref={cameraRef}
//                       style={ms.camera}
//                       facing="front"
//                     >
//                       <View style={ms.ovalWrap}>
//                         <View
//                           style={[
//                             ms.oval,
//                             faceReady && { borderColor: C.success },
//                           ]}
//                         />
//                         <Animated.View
//                           style={[
//                             ms.scanLine,
//                             {
//                               transform: [{ translateY: scanY }],
//                               backgroundColor: faceReady
//                                 ? C.success
//                                 : C.orange,
//                             },
//                           ]}
//                         />
//                       </View>

//                       {phase === "countdown" && (
//                         <View style={ms.countdownOverlay}>
//                           <Text style={ms.countdownNum}>{countdown}</Text>
//                         </View>
//                       )}

//                       <View
//                         style={[
//                           ms.pill,
//                           {
//                             backgroundColor: faceReady
//                               ? "rgba(34,197,94,0.85)"
//                               : "rgba(0,0,0,0.6)",
//                           },
//                         ]}
//                       >
//                         <Text style={ms.pillTxt}>
//                           {phase === "countdown"
//                             ? `Taking photo in ${countdown}...`
//                             : faceReady
//                               ? "✓ Ready — tap Capture"
//                               : "Look straight at the camera"}
//                         </Text>
//                       </View>
//                     </CameraView>
//                   </View>

//                   {phase === "camera" && (
//                     <TouchableOpacity
//                       style={ms.readyRow}
//                       onPress={() => setFaceReady((v) => !v)}
//                       activeOpacity={0.8}
//                     >
//                       <View
//                         style={[
//                           ms.readyChk,
//                           faceReady && {
//                             backgroundColor: C.success,
//                             borderColor: C.success,
//                           },
//                         ]}
//                       >
//                         {faceReady && (
//                           <Text
//                             style={{
//                               color: C.white,
//                               fontSize: 13,
//                               fontWeight: "700",
//                             }}
//                           >
//                             ✓
//                           </Text>
//                         )}
//                       </View>
//                       <Text style={ms.readyLabel}>
//                         My face is clearly visible in the frame
//                       </Text>
//                     </TouchableOpacity>
//                   )}

//                   {phase === "camera" && (
//                     <TouchableOpacity
//                       style={[
//                         ms.btnOrange,
//                         !faceReady && { backgroundColor: "#C8C8C8" },
//                       ]}
//                       onPress={startCapture}
//                     >
//                       <Text style={ms.btnTxt}>Capture & Verify</Text>
//                     </TouchableOpacity>
//                   )}
//                 </>
//               )}
//             </>
//           )}

//           {phase === "verifying" && (
//             <View style={{ marginBottom: 16 }}>
//               <StepRow
//                 emoji="👤"
//                 title="Face Recognition"
//                 subtitle={faceSub}
//                 state={faceState}
//               />
//               <StepRow
//                 emoji="📍"
//                 title="Location Verification"
//                 subtitle={locSub}
//                 state={locState}
//               />
//             </View>
//           )}

//           {phase === "result" && (
//             <View style={ms.resultBox}>
//               {capturedUri && (
//                 <Image
//                   source={{ uri: capturedUri }}
//                   style={[
//                     ms.capturedImg,
//                     { borderColor: resultOk ? C.success : C.error },
//                   ]}
//                 />
//               )}
//               <View
//                 style={[
//                   ms.resultCircle,
//                   {
//                     backgroundColor: resultOk
//                       ? C.successLight
//                       : C.errorLight,
//                   },
//                 ]}
//               >
//                 <Text
//                   style={[
//                     ms.resultIcon,
//                     { color: resultOk ? C.success : C.error },
//                   ]}
//                 >
//                   {resultOk ? "✓" : "✗"}
//                 </Text>
//               </View>
//               <Text
//                 style={[
//                   ms.resultTitle,
//                   { color: resultOk ? C.success : C.error },
//                 ]}
//               >
//                 {resultOk
//                   ? isClockedIn
//                     ? "Checked Out!"
//                     : "Checked In!"
//                   : "Verification Failed"}
//               </Text>
//               <Text style={ms.resultMsg}>{resultMsg}</Text>
//               <TouchableOpacity
//                 style={ms.btnOrange}
//                 onPress={resultOk ? onSuccess : reset}
//               >
//                 <Text style={ms.btnTxt}>
//                   {resultOk ? "Done" : "Try Again"}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {!(phase === "result" && resultOk) && (
//             <TouchableOpacity style={ms.cancelBtn} onPress={onCancel}>
//               <Text style={ms.cancelTxt}>Cancel</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </Modal>
//   );
// }

// // ─── Modal styles (100% original — zero changes) ──────────────
// const ms = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.65)",
//     justifyContent: "flex-end",
//   },
//   sheet: {
//     backgroundColor: C.white,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     paddingHorizontal: 20,
//     paddingTop: 22,
//     paddingBottom: Platform.OS === "ios" ? 38 : 24,
//   },
//   sheetTitle: { fontSize: 18, fontWeight: "700", color: "#1a2f4a" },
//   sheetSub: {
//     fontSize: 13,
//     color: C.gray,
//     marginTop: 3,
//     marginBottom: 16,
//   },

//   camBox: {
//     height: 260,
//     borderRadius: 16,
//     overflow: "hidden",
//     marginBottom: 12,
//   },
//   camera: { flex: 1 },

//   ovalWrap: {
//     position: "absolute",
//     top: "8%",
//     left: "18%",
//     right: "18%",
//     bottom: "8%",
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//   },
//   oval: {
//     position: "absolute",
//     width: "100%",
//     height: "100%",
//     borderWidth: 2.5,
//     borderColor: C.orange,
//     borderRadius: 999,
//   },
//   scanLine: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     height: 2,
//     opacity: 0.8,
//   },

//   countdownOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.45)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   countdownNum: { fontSize: 72, fontWeight: "800", color: C.white },

//   pill: {
//     position: "absolute",
//     bottom: 12,
//     alignSelf: "center",
//     borderRadius: 20,
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//   },
//   pillTxt: { color: C.white, fontSize: 13, fontWeight: "600" },

//   readyRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 14,
//     gap: 10,
//   },
//   readyChk: {
//     width: 24,
//     height: 24,
//     borderRadius: 6,
//     borderWidth: 1.5,
//     borderColor: C.gray,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   readyLabel: { fontSize: 13, color: "#1a2f4a", flex: 1 },

//   btnOrange: {
//     backgroundColor: "#2F6E8E",
//     borderRadius: 30,
//     paddingVertical: 14,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   btnTxt: { color: C.white, fontSize: 16, fontWeight: "700" },

//   cancelBtn: { alignItems: "center", paddingVertical: 12 },
//   cancelTxt: { color: C.gray, fontSize: 15 },

//   centerBox: {
//     height: 200,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 16,
//   },
//   errorTxt: {
//     color: C.error,
//     fontSize: 14,
//     textAlign: "center",
//     lineHeight: 22,
//   },

//   resultBox: {
//     alignItems: "center",
//     paddingVertical: 8,
//     marginBottom: 8,
//   },
//   capturedImg: {
//     width: 90,
//     height: 90,
//     borderRadius: 45,
//     marginBottom: 14,
//     borderWidth: 3,
//   },
//   resultCircle: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 12,
//   },
//   resultIcon: { fontSize: 30, fontWeight: "800" },
//   resultTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
//   resultMsg: {
//     fontSize: 13,
//     color: C.gray,
//     textAlign: "center",
//     lineHeight: 20,
//     marginBottom: 20,
//     paddingHorizontal: 10,
//   },
// });

// // ─── Orange Header (unchanged) ────────────────────────────────
// function OrangeHeader() {
//   return (
//     <View style={styles.orangeHeader}>
//       <View style={{ flex: 1 }}>
//         <Text style={styles.headerTitle}>Let's Check-In!</Text>
//         <Text style={styles.headerSub}>
//           Don't miss your Check-in schedule
//         </Text>
//       </View>
//       <View style={{ alignItems: "center" }}>
//         <Text style={{ fontSize: 38 }}>⏰</Text>
//         <Text style={styles.sparkles}>✦ ✦ ✦</Text>
//       </View>
//     </View>
//   );
// }

// // ─── Total Work Card (unchanged) ──────────────────────────────
// function TotalWorkCard({ todaySeconds, periodSeconds, isClockedIn, onPress }) {
//   return (
//     <View style={styles.card}>
//       <Text style={styles.cardTitle}>Total Working Hour</Text>
//       <View style={styles.hoursRow}>
//         <View style={styles.hoursBox}>
//           <Text style={styles.hoursLabel}>🕐  Today</Text>
//           <Text style={styles.hoursValue}>{formatHHMM(todaySeconds)}</Text>
//         </View>
//         <View style={{ width: 10 }} />
//         <View style={styles.hoursBox}>
//           <Text style={styles.hoursLabel}>🕐  This Pay Period</Text>
//           <Text style={styles.hoursValue}>{formatHHMM(periodSeconds)}</Text>
//         </View>
//       </View>
//       {isClockedIn && (
//         <View style={styles.liveBadge}>
//           <View style={styles.liveDot} />
//           <Text style={styles.liveTxt}>Currently clocked in</Text>
//         </View>
//       )}
//       <TouchableOpacity
//         style={isClockedIn ? styles.checkoutBtn : styles.checkinBtn}
//         onPress={onPress}
//         activeOpacity={0.85}
//       >
//         <Text style={styles.mainBtnTxt}>
//           {isClockedIn ? "Check Out" : "Check In"}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// // ─── History Card (unchanged) ────────────────────────────────
// function HistoryCard({ entry }) {
//   return (
//     <View style={styles.historyCard}>
//       <Text style={styles.historyDate}>{getDateLabel(entry.date)}</Text>
//       <View style={styles.historyRow}>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.historyLabel}>Total Hours</Text>
//           <Text style={styles.historyValue}>
//             {formatHHMMSS(entry.totalSeconds)}
//           </Text>
//         </View>
//         <View style={styles.historyDivider} />
//         <View style={{ flex: 1 }}>
//           <Text style={styles.historyLabel}>Clock in & Out</Text>
//           <Text style={styles.historyValue}>
//             {entry.checkin}
//             <Text style={{ color: C.gray }}>  —  </Text>
//             {entry.checkout}
//           </Text>
//         </View>
//       </View>
//     </View>
//   );
// }

// // ─── Main Screen (unchanged) ──────────────────────────────────
// export default function CheckInScreen({ onTabPress, activeTab = 1 }) {
//   const [isClockedIn, setIsClockedIn] = useState(false);
//   const [checkinTime, setCheckinTime] = useState(null);
//   const [todaySeconds, setTodaySeconds] = useState(0);
//   const [periodSeconds, setPeriodSeconds] = useState(32 * 3600);
//   const [history, setHistory] = useState(seedHistory());
//   const [modalVisible, setModalVisible] = useState(false);
//   const timerRef = useRef(null);

//   useEffect(() => {
//     if (isClockedIn) {
//       timerRef.current = setInterval(() => {
//         setTodaySeconds((s) => s + 1);
//         setPeriodSeconds((s) => s + 1);
//       }, 1000);
//     } else {
//       clearInterval(timerRef.current);
//     }
//     return () => clearInterval(timerRef.current);
//   }, [isClockedIn]);

//   const handleVerified = () => {
//     setModalVisible(false);
//     if (!isClockedIn) {
//       const now = new Date();
//       setCheckinTime(now);
//       setIsClockedIn(true);
//       Alert.alert("✅ Checked In", `Welcome! Checked in at ${formatTime(now)}`);
//     } else {
//       const now = new Date();
//       setIsClockedIn(false);
//       setHistory((prev) => [
//         {
//           id: Date.now(),
//           date: new Date(),
//           totalSeconds: todaySeconds,
//           checkin: formatTime(checkinTime),
//           checkout: formatTime(now),
//         },
//         ...prev,
//       ]);
//       Alert.alert(
//         "👋 Checked Out",
//         `Checked out at ${formatTime(now)}\nTotal today: ${formatHHMMSS(
//           todaySeconds
//         )}`
//       );
//       setTodaySeconds(0);
//       setCheckinTime(null);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <OrangeHeader />
//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={{ paddingBottom: 24 }}
//         showsVerticalScrollIndicator={false}
//       >
//         <TotalWorkCard
//           todaySeconds={todaySeconds}
//           periodSeconds={periodSeconds}
//           isClockedIn={isClockedIn}
//           onPress={() => setModalVisible(true)}
//         />
//         {history.map((e) => (
//           <HistoryCard key={e.id} entry={e} />
//         ))}
//       </ScrollView>

//       <VerifyModal
//         visible={modalVisible}
//         isClockedIn={isClockedIn}
//         onSuccess={handleVerified}
//         onCancel={() => setModalVisible(false)}
//       />
//     </SafeAreaView>
//   );
// }

// // ─── Styles (100% original — zero changes) ───────────────────
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: C.bg },
//   scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

//   orangeHeader: {
//     backgroundColor: "#2F6E8E",
//     paddingHorizontal: 22,
//     paddingTop: 20,
//     paddingBottom: 26,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   headerTitle: {
//     color: C.white,
//     fontSize: 24,
//     fontWeight: "800",
//     paddingTop: 39,
//   },
//   headerSub: {
//     color: "rgba(255,255,255,0.85)",
//     fontSize: 13,
//     marginTop: 4,
//   },
//   sparkles: { color: C.white, fontSize: 10, letterSpacing: 2, marginTop: 2 },

//   card: {
//     backgroundColor: C.card,
//     borderRadius: 16,
//     padding: 18,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   cardTitle: { color: "#1a2f4a", fontSize: 15, fontWeight: "700" },

//   hoursRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   hoursBox: {
//     flex: 1,
//     backgroundColor: "#EFF6FF",
//     borderRadius: 10,
//     padding: 12,
//   },
//   hoursLabel: { color: C.subText, fontSize: 12, marginBottom: 6 },
//   hoursValue: { color: "#1a2f4a", fontSize: 20, fontWeight: "700" },

//   liveBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginBottom: 12,
//   },
//   liveDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: C.success,
//   },
//   liveTxt: { fontSize: 12, color: C.success, fontWeight: "600" },

//   checkinBtn: {
//     backgroundColor: "#2F6E8E",
//     borderRadius: 30,
//     paddingVertical: 14,
//     alignItems: "center",
//   },
//   checkoutBtn: {
//     backgroundColor: "#1a3a5c",
//     borderRadius: 30,
//     paddingVertical: 14,
//     alignItems: "center",
//   },
//   mainBtnTxt: { color: C.white, fontSize: 16, fontWeight: "700" },

//   historyCard: {
//     backgroundColor: C.card,
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   historyDate: {
//     color: C.orange,
//     fontWeight: "700",
//     fontSize: 14,
//     marginBottom: 12,
//   },
//   historyRow: {
//     flexDirection: "row",
//     backgroundColor: "#EFF6FF",
//     borderRadius: 10,
//     padding: 12,
//     alignItems: "center",
//   },
//   historyDivider: {
//     width: 1,
//     height: 36,
//     backgroundColor: "#DDDDDD",
//     marginHorizontal: 12,
//   },
//   historyLabel: { color: C.subText, fontSize: 11, marginBottom: 4 },
//   historyValue: { color: "#1a2f4a", fontSize: 13, fontWeight: "600" },
// });


/**
 * userscreens/Attendance.js
 *
 * ── FIX for Android / Expo Go "cameraRef null" bug ──────────
 *
 * ROOT CAUSE:
 *   CameraView was conditionally rendered only when
 *   phase === "camera" || phase === "countdown".
 *   When captureAndVerify() ran it first set phase → "verifying",
 *   which UNMOUNTED the CameraView, making cameraRef null before
 *   takePictureAsync() could be called.
 *
 * THE FIX:
 *   1. CameraView is NOW ALWAYS MOUNTED inside the Modal (just
 *      hidden via { display: "none" } / opacity:0 when not needed).
 *      This means the ref is always valid.
 *   2. Photo is captured FIRST, THEN phase is changed to "verifying".
 *   3. Increased warm-up delay to 800 ms on Android for sensor init.
 *   4. Added a 1-second post-mount settle before allowing capture.
 *
 * ALL original styles / layout / colours UNTOUCHED.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Image,
} from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";

import { apiFaceVerify } from "../api/authService";
import { useUser } from "../context/UserContext";
import { BASE_URL } from "../api/config";

// ─── Colors (unchanged) ──────────────────────────────────────
const C = {
  bg: "#1a2f4a",
  orange: "#2F6E8E",
  white: "#FFFFFF",
  gray: "#888888",
  card: "#FFFFFF",
  border: "#EEEEEE",
  subText: "#666666",
  success: "#22C55E",
  error: "#EF4444",
  successLight: "#DCFCE7",
  errorLight: "#FEE2E2",
  warningLight: "#FEF9C3",
  warning: "#F59E0B",
};

// ─── Office Config (unchanged) ────────────────────────────────
const OFFICE = {
  latitude: 17.448381,
  longitude: 78.399465,
  radiusMeters: 100,
  name: "Main Office",
};

// ─── Utility helpers (unchanged) ─────────────────────────────
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatTime(date) {
  if (!date) return "--:-- --";
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = ((h + 11) % 12 + 1).toString().padStart(2, "0");
  return `${hour}:${m} ${ampm}`;
}

function formatHHMMSS(sec) {
  const h = Math.floor(sec / 3600).toString().padStart(2, "0");
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s} hrs`;
}

function formatHHMM(sec) {
  const h = Math.floor(sec / 3600).toString().padStart(2, "0");
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
  return `${h}:${m} Hrs`;
}

function getDateLabel(date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function parseAttendanceDateTime(dateString, timeString) {
  if (!timeString) return null;
  const [h = "0", m = "0"] = String(timeString).split(":");
  const base = dateString ? new Date(`${dateString}T00:00:00`) : new Date();
  base.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
  return base;
}

function toHistoryEntry(record) {
  const date = record?.date ? new Date(`${record.date}T00:00:00`) : new Date();
  const checkInDate = parseAttendanceDateTime(record?.date, record?.checkIn);
  const checkOutDate = parseAttendanceDateTime(record?.date, record?.checkOut);
  const totalSeconds =
    typeof record?.durationMinutes === "number" && record.durationMinutes >= 0
      ? record.durationMinutes * 60
      : checkInDate
        ? Math.max(0, Math.floor((Date.now() - checkInDate.getTime()) / 1000))
        : 0;

  return {
    id: record?.id ?? `${record?.date}-${record?.checkIn}-${record?.checkOut}`,
    date,
    totalSeconds,
    checkin: checkInDate ? formatTime(checkInDate) : "--:-- --",
    checkout: checkOutDate ? formatTime(checkOutDate) : "--:-- --",
  };
}

// ─── Seed data (unchanged) ────────────────────────────────────
const seedHistory = () => {
  const today = new Date();
  return [1, 2, 3].map((offset, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    return {
      id: i,
      date: d,
      totalSeconds: [8 * 3600, 8 * 3600, 8 * 3600 + 10 * 60][i],
      checkin: "09:00 AM",
      checkout: ["05:00 PM", "05:00 PM", "05:10 PM"][i],
    };
  });
};

// ─── Step Row (unchanged) ─────────────────────────────────────
function StepRow({ emoji, title, subtitle, state }) {
  const bg = {
    idle: "#F3F4F6",
    checking: C.warningLight,
    success: C.successLight,
    error: C.errorLight,
  }[state];
  const color = {
    idle: C.gray,
    checking: C.warning,
    success: C.success,
    error: C.error,
  }[state];

  return (
    <View style={sr.row}>
      <View style={[sr.iconBox, { backgroundColor: bg }]}>
        {state === "checking" ? (
          <ActivityIndicator size="small" color={C.warning} />
        ) : (
          <Text style={[sr.symbol, { color }]}>
            {{ idle: emoji, success: "✓", error: "✗" }[state] ?? emoji}
          </Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={sr.title}>{title}</Text>
        <Text style={[sr.sub, state !== "idle" && { color }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

const sr = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  symbol: { fontSize: 16, fontWeight: "700" },
  title: { fontSize: 14, fontWeight: "600", color: "#1a2f4a" },
  sub: { fontSize: 12, color: C.gray, marginTop: 2 },
});

// ─────────────────────────────────────────────────────────────
//  FACE + LOCATION VERIFICATION MODAL
// ─────────────────────────────────────────────────────────────
function VerifyModal({ visible, isClockedIn, onSuccess, onCancel }) {
  const { user } = useUser();
  const [permission, requestPermission] = useCameraPermissions();

  const [phase, setPhase] = useState("camera");
  const [countdown, setCountdown] = useState(3);
  const [capturedUri, setCapturedUri] = useState(null);

  const [faceState, setFaceState] = useState("idle");
  const [faceSub, setFaceSub] = useState("Align your face in the oval");
  const [locState, setLocState] = useState("idle");
  const [locSub, setLocSub] = useState("Waiting...");

  const [resultOk, setResultOk] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [faceReady, setFaceReady] = useState(false);

  // FIX: track whether camera has had time to initialise
  const [cameraReady, setCameraReady] = useState(false);

  const cameraRef = useRef(null);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const countdownRef = useRef(null);

  useEffect(() => {
    if (visible) {
      reset();
      if (!permission?.granted) requestPermission();
    }
    return () => clearInterval(countdownRef.current);
  }, [visible]);

  useEffect(() => {
    if (phase === "camera" || phase === "countdown") {
      const loop = Animated.loop(
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    }
  }, [phase]);

  function reset() {
    clearInterval(countdownRef.current);
    setPhase("camera");
    setCountdown(3);
    setCapturedUri(null);
    setFaceState("idle");
    setFaceSub("Align your face in the oval");
    setLocState("idle");
    setLocSub("Waiting...");
    setResultOk(false);
    setResultMsg("");
    setFaceReady(false);
    setCameraReady(false);
  }

  function startCapture() {
    if (!faceReady) {
      Alert.alert(
        "Face Not Confirmed",
        "Please tick the checkbox to confirm your face is clearly visible."
      );
      return;
    }
    setPhase("countdown");
    let count = 3;
    setCountdown(count);
    countdownRef.current = setInterval(async () => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownRef.current);
        await captureAndVerify();
      }
    }, 1000);
  }

  // ─────────────────────────────────────────────────────────
  // CORE FIX: takePictureWithRetry
  // - Does NOT change phase before capturing
  // - Camera stays mounted throughout (see render section)
  // - Longer warm-up on Android
  // ─────────────────────────────────────────────────────────
  async function takePictureWithRetry() {
    // Give Android camera sensor extra time to stabilise
    const warmup = Platform.OS === "android" ? 800 : 300;
    await delay(warmup);

    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        if (!cameraRef.current) {
          console.warn(`[VerifyModal] cameraRef null on attempt ${attempt}, waiting...`);
          await delay(600);
          continue;
        }

        console.log(`[VerifyModal] takePictureAsync attempt ${attempt}/5`);

        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          skipProcessing: true, // faster on Android
        });

        if (photo && photo.uri) {
          console.log(
            `[VerifyModal] Captured on attempt ${attempt}:`,
            photo.uri.substring(0, 60) + "..."
          );
          return photo.uri;
        }
      } catch (err) {
        console.warn(`[VerifyModal] Attempt ${attempt} failed: ${err.message}`);
        if (attempt < 5) await delay(500);
      }
    }

    return null;
  }

  async function captureAndVerify() {
    // ── STEP 1: Capture photo FIRST (camera still mounted) ────
    // Do NOT change phase yet — changing phase would unmount CameraView
    let photoUri = null;

    try {
      if (Platform.OS === "web") {
        // Web path — unchanged
        if (cameraRef.current) {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.8,
            base64: false,
            skipProcessing: false,
          });
          photoUri = photo?.uri || null;
        }
      } else {
        // Mobile: use retry wrapper while camera is still mounted
        photoUri = await takePictureWithRetry();
      }
    } catch (captureErr) {
      console.error("[VerifyModal] Capture error:", captureErr);
    }

    if (photoUri) setCapturedUri(photoUri);

    // ── STEP 2: Now switch to "verifying" phase ───────────────
    // Camera will hide but ref becomes irrelevant — photo already captured
    setPhase("verifying");

    // ── STEP 3: Bail if capture failed ───────────────────────
    if (!photoUri) {
      console.warn("[VerifyModal] All capture attempts failed");
      setFaceState("error");
      setFaceSub("Camera capture failed. Please try again.");
      setPhase("result");
      setResultOk(false);
      setResultMsg(
        "Could not take a photo from the camera.\n\n" +
        "Please:\n• Hold the phone steady\n" +
        "• Ensure good lighting\n• Try again"
      );
      return;
    }

    // ── STEP 4: Face Verification via Spring Boot → Python ────
    setFaceState("checking");
    setFaceSub("Verifying face with server...");

    let faceOk = false;
    let faceMessage = "Face verification failed";

    try {
      const empId = user?.empId;
      if (!empId) {
        throw new Error("Employee ID not found in session. Please log in again.");
      }

      console.log("[VerifyModal] Verifying face for empId:", empId);
      const result = await apiFaceVerify(empId, photoUri, isClockedIn);
      console.log("[VerifyModal] Face verify result:", result);

      faceOk = result.match === true;
      faceMessage = result.message || (faceOk ? "Face verified ✓" : "Face mismatch");
    } catch (err) {
      console.error("[VerifyModal] Face verify error:", err);
      faceOk = false;
      faceMessage = err.message || "Could not reach face verification service";
    }

    if (!faceOk) {
      setFaceState("error");
      setFaceSub(faceMessage);
      setPhase("result");
      setResultOk(false);
      setResultMsg(faceMessage);
      return;
    }

    setFaceState("success");
    setFaceSub("Face verified ✓");

    // ── STEP 5: Location Check (unchanged) ────────────────────
    setLocState("checking");
    setLocSub("Fetching your location...");

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("permission_denied");

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const dist = getDistanceMeters(
        pos.coords.latitude,
        pos.coords.longitude,
        OFFICE.latitude,
        OFFICE.longitude
      );

      if (dist <= OFFICE.radiusMeters) {
        setLocState("success");
        setLocSub(`Within ${OFFICE.name} · ${Math.round(dist)}m away`);
        await delay(500);
        setPhase("result");
        setResultOk(true);
        setResultMsg(
          isClockedIn
            ? `Checked out at ${formatTime(new Date())}`
            : `Checked in at ${formatTime(new Date())}`
        );
      } else {
        setLocState("error");
        setLocSub(`${Math.round(dist)}m from office — outside allowed zone`);
        await delay(400);
        setPhase("result");
        setResultOk(false);
        setResultMsg(
          `You are ${Math.round(dist)}m away from ${OFFICE.name}.\n` +
          `Allowed radius is ${OFFICE.radiusMeters}m.\n` +
          `Please check in from within the office premises.`
        );
      }
    } catch (err) {
      const msg =
        err.message === "permission_denied"
          ? "Location permission denied. Please enable it in device Settings."
          : "Could not fetch location. Please turn on GPS and try again.";
      setLocState("error");
      setLocSub(msg);
      await delay(400);
      setPhase("result");
      setResultOk(false);
      setResultMsg(msg);
    }
  }

  const scanY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 170],
  });

  // Whether the camera UI should be visible to the user
  const showCameraUI = phase === "camera" || phase === "countdown";

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={ms.overlay}>
        <View style={ms.sheet}>
          <Text style={ms.sheetTitle}>
            {isClockedIn ? "Verify to Check Out" : "Verify to Check In"}
          </Text>
          <Text style={ms.sheetSub}>Face ID + Location required</Text>

          {/* ─────────────────────────────────────────────────
              CAMERA SECTION
              KEY FIX: CameraView is ALWAYS rendered while the
              modal is open (phase camera/countdown/verifying).
              We only hide it visually once we're in "result".
              This keeps cameraRef valid throughout capture.
          ───────────────────────────────────────────────── */}
          {phase !== "result" && (
            <>
              {!permission && (
                <View style={ms.centerBox}>
                  <ActivityIndicator color={C.orange} />
                </View>
              )}

              {permission && !permission.granted && (
                <View style={ms.centerBox}>
                  <Text style={ms.errorTxt}>
                    Camera permission denied.{"\n"}Enable it in device Settings.
                  </Text>
                  <TouchableOpacity style={ms.btnOrange} onPress={requestPermission}>
                    <Text style={ms.btnTxt}>Grant Permission</Text>
                  </TouchableOpacity>
                </View>
              )}

              {permission && permission.granted && (
                <>
                  {/* Camera box — visible during camera/countdown, hidden during verifying */}
                  <View
                    style={[
                      ms.camBox,
                      // Hide visually during verifying but keep mounted so ref stays valid
                      !showCameraUI && { height: 0, overflow: "hidden", marginBottom: 0 },
                    ]}
                  >
                    <CameraView
                      ref={cameraRef}
                      style={ms.camera}
                      facing="front"
                      onCameraReady={() => {
                        console.log("[VerifyModal] Camera is ready");
                        setCameraReady(true);
                      }}
                    >
                      {showCameraUI && (
                        <>
                          <View style={ms.ovalWrap}>
                            <View
                              style={[
                                ms.oval,
                                faceReady && { borderColor: C.success },
                              ]}
                            />
                            <Animated.View
                              style={[
                                ms.scanLine,
                                {
                                  transform: [{ translateY: scanY }],
                                  backgroundColor: faceReady ? C.success : C.orange,
                                },
                              ]}
                            />
                          </View>

                          {phase === "countdown" && (
                            <View style={ms.countdownOverlay}>
                              <Text style={ms.countdownNum}>{countdown}</Text>
                            </View>
                          )}

                          <View
                            style={[
                              ms.pill,
                              {
                                backgroundColor: faceReady
                                  ? "rgba(34,197,94,0.85)"
                                  : "rgba(0,0,0,0.6)",
                              },
                            ]}
                          >
                            <Text style={ms.pillTxt}>
                              {phase === "countdown"
                                ? `Taking photo in ${countdown}...`
                                : faceReady
                                  ? "✓ Ready — tap Capture"
                                  : "Look straight at the camera"}
                            </Text>
                          </View>
                        </>
                      )}
                    </CameraView>
                  </View>

                  {/* Controls — only shown in camera phase */}
                  {phase === "camera" && (
                    <>
                      <TouchableOpacity
                        style={ms.readyRow}
                        onPress={() => setFaceReady((v) => !v)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            ms.readyChk,
                            faceReady && {
                              backgroundColor: C.success,
                              borderColor: C.success,
                            },
                          ]}
                        >
                          {faceReady && (
                            <Text
                              style={{
                                color: C.white,
                                fontSize: 13,
                                fontWeight: "700",
                              }}
                            >
                              ✓
                            </Text>
                          )}
                        </View>
                        <Text style={ms.readyLabel}>
                          My face is clearly visible in the frame
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          ms.btnOrange,
                          (!faceReady || !cameraReady) && { backgroundColor: "#C8C8C8" },
                        ]}
                        onPress={startCapture}
                        disabled={!cameraReady}
                      >
                        <Text style={ms.btnTxt}>
                          {cameraReady ? "Capture & Verify" : "Camera initialising..."}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Verifying steps shown below hidden camera */}
                  {phase === "verifying" && (
                    <View style={{ marginBottom: 16 }}>
                      <StepRow
                        emoji="👤"
                        title="Face Recognition"
                        subtitle={faceSub}
                        state={faceState}
                      />
                      <StepRow
                        emoji="📍"
                        title="Location Verification"
                        subtitle={locSub}
                        state={locState}
                      />
                    </View>
                  )}
                </>
              )}
            </>
          )}

          {/* Result screen */}
          {phase === "result" && (
            <View style={ms.resultBox}>
              {capturedUri && (
                <Image
                  source={{ uri: capturedUri }}
                  style={[
                    ms.capturedImg,
                    { borderColor: resultOk ? C.success : C.error },
                  ]}
                />
              )}
              <View
                style={[
                  ms.resultCircle,
                  {
                    backgroundColor: resultOk ? C.successLight : C.errorLight,
                  },
                ]}
              >
                <Text
                  style={[
                    ms.resultIcon,
                    { color: resultOk ? C.success : C.error },
                  ]}
                >
                  {resultOk ? "✓" : "✗"}
                </Text>
              </View>
              <Text
                style={[
                  ms.resultTitle,
                  { color: resultOk ? C.success : C.error },
                ]}
              >
                {resultOk
                  ? isClockedIn
                    ? "Checked Out!"
                    : "Checked In!"
                  : "Verification Failed"}
              </Text>
              <Text style={ms.resultMsg}>{resultMsg}</Text>
              <TouchableOpacity
                style={ms.btnOrange}
                onPress={resultOk ? onSuccess : reset}
              >
                <Text style={ms.btnTxt}>{resultOk ? "Done" : "Try Again"}</Text>
              </TouchableOpacity>
            </View>
          )}

          {!(phase === "result" && resultOk) && (
            <TouchableOpacity style={ms.cancelBtn} onPress={onCancel}>
              <Text style={ms.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Modal styles (100% original — zero changes) ──────────────
const ms = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: Platform.OS === "ios" ? 38 : 24,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: "#1a2f4a" },
  sheetSub: {
    fontSize: 13,
    color: C.gray,
    marginTop: 3,
    marginBottom: 16,
  },

  camBox: {
    height: 260,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  camera: { flex: 1 },

  ovalWrap: {
    position: "absolute",
    top: "8%",
    left: "18%",
    right: "18%",
    bottom: "8%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  oval: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderWidth: 2.5,
    borderColor: C.orange,
    borderRadius: 999,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
  },

  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  countdownNum: { fontSize: 72, fontWeight: "800", color: C.white },

  pill: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillTxt: { color: C.white, fontSize: 13, fontWeight: "600" },

  readyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  readyChk: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: C.gray,
    alignItems: "center",
    justifyContent: "center",
  },
  readyLabel: { fontSize: 13, color: "#1a2f4a", flex: 1 },

  btnOrange: {
    backgroundColor: "#2F6E8E",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  btnTxt: { color: C.white, fontSize: 16, fontWeight: "700" },

  cancelBtn: { alignItems: "center", paddingVertical: 12 },
  cancelTxt: { color: C.gray, fontSize: 15 },

  centerBox: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  errorTxt: {
    color: C.error,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  resultBox: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  capturedImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 14,
    borderWidth: 3,
  },
  resultCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  resultIcon: { fontSize: 30, fontWeight: "800" },
  resultTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  resultMsg: {
    fontSize: 13,
    color: C.gray,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

// ─── Orange Header (unchanged) ────────────────────────────────
function OrangeHeader() {
  return (
    <View style={styles.orangeHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>Let's Check-In!</Text>
        <Text style={styles.headerSub}>
          Don't miss your Check-in schedule
        </Text>
      </View>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 38 }}>⏰</Text>
        <Text style={styles.sparkles}>✦ ✦ ✦</Text>
      </View>
    </View>
  );
}

// ─── Total Work Card (unchanged) ──────────────────────────────
function TotalWorkCard({ todaySeconds, periodSeconds, isClockedIn, onPress }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Total Working Hour</Text>
      <View style={styles.hoursRow}>
        <View style={styles.hoursBox}>
          <Text style={styles.hoursLabel}>🕐  Today</Text>
          <Text style={styles.hoursValue}>{formatHHMM(todaySeconds)}</Text>
        </View>
        <View style={{ width: 10 }} />
        <View style={styles.hoursBox}>
          <Text style={styles.hoursLabel}>🕐  This Pay Period</Text>
          <Text style={styles.hoursValue}>{formatHHMM(periodSeconds)}</Text>
        </View>
      </View>
      {isClockedIn && (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTxt}>Currently clocked in</Text>
        </View>
      )}
      <TouchableOpacity
        style={isClockedIn ? styles.checkoutBtn : styles.checkinBtn}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={styles.mainBtnTxt}>
          {isClockedIn ? "Check Out" : "Check In"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── History Card (unchanged) ────────────────────────────────
function HistoryCard({ entry }) {
  return (
    <View style={styles.historyCard}>
      <Text style={styles.historyDate}>{getDateLabel(entry.date)}</Text>
      <View style={styles.historyRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.historyLabel}>Total Hours</Text>
          <Text style={styles.historyValue}>
            {formatHHMMSS(entry.totalSeconds)}
          </Text>
        </View>
        <View style={styles.historyDivider} />
        <View style={{ flex: 1 }}>
          <Text style={styles.historyLabel}>Clock in & Out</Text>
          <Text style={styles.historyValue}>
            {entry.checkin}
            <Text style={{ color: C.gray }}>  —  </Text>
            {entry.checkout}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen (unchanged) ──────────────────────────────────
// userscreens/Attendance.js
// Replace the CheckInScreen component with this version

function LegacyCheckInScreen({ onTabPress, activeTab = 1 }) {
  const { user } = useUser();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkinTime, setCheckinTime] = useState(null);
  const [checkoutTime, setCheckoutTime] = useState(null);
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [periodSeconds, setPeriodSeconds] = useState(0);
  const [history, setHistory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef(null);

  // ── NEW: Restore clock-in state from backend on mount ─────────────────────
  // ── Restore clock-in state from backend on mount ──────────────────
  useEffect(() => {
    const fetchTodayStatus = async () => {
      if (!user?.empId) {
        setStatusLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${BASE_URL}/api/attendance/status/${user.empId}`
        );
        if (!res.ok) throw new Error("Status fetch failed");
        const data = await res.json();

        if (data.checkedIn && data.checkedOut) {
          // ── Both done: show completed state ──────────────────────
          setIsClockedIn(false);
          setIsCheckedOut(true);
          // Restore times for display
          if (data.checkIn) {
            const [h, m] = data.checkIn.split(":");
            const t = new Date();
            t.setHours(parseInt(h), parseInt(m), 0, 0);
            setCheckinTime(t);
          }
          if (data.checkOut) {
            const [h, m] = data.checkOut.split(":");
            const t = new Date();
            t.setHours(parseInt(h), parseInt(m), 0, 0);
            setCheckoutTime(t);
          }
        } else if (data.checkedIn && !data.checkedOut) {
          // ── Checked in but not out: resume timer ─────────────────
          setIsClockedIn(true);
          setIsCheckedOut(false);
          if (data.checkIn) {
            const [h, m] = data.checkIn.split(":");
            const t = new Date();
            t.setHours(parseInt(h), parseInt(m), 0, 0);
            setCheckinTime(t);
            const elapsed = Math.floor((Date.now() - t.getTime()) / 1000);
            setTodaySeconds(Math.max(0, elapsed));
          }
        } else {
          // ── Not checked in yet ────────────────────────────────────
          setIsClockedIn(false);
          setIsCheckedOut(false);
        }
      } catch (err) {
        console.warn(
          "[CheckInScreen] Could not fetch today's status:",
          err.message
        );
      } finally {
        setStatusLoading(false);
      }
    };

    fetchTodayStatus();
  }, [user?.empId]);
  // ── Timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isClockedIn) {
      timerRef.current = setInterval(() => {
        setTodaySeconds((s) => s + 1);
        setPeriodSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isClockedIn]);

  const handleVerified = () => {
    setModalVisible(false);
    if (!isClockedIn && !isCheckedOut) {
      // ── Check In ──────────────────────────────────────────────────
      const now = new Date();
      setCheckinTime(now);
      setIsClockedIn(true);
      setIsCheckedOut(false);
      Alert.alert("✅ Checked In", `Welcome! Checked in at ${formatTime(now)}`);
    } else if (isClockedIn && !isCheckedOut) {
      // ── Check Out ─────────────────────────────────────────────────
      const now = new Date();
      setIsClockedIn(false);
      setIsCheckedOut(true);
      setCheckoutTime(now);
      setHistory((prev) => [
        {
          id: Date.now(),
          date: new Date(),
          totalSeconds: todaySeconds,
          checkin: formatTime(checkinTime),
          checkout: formatTime(now),
        },
        ...prev,
      ]);
      Alert.alert(
        "👋 Checked Out",
        `Checked out at ${formatTime(now)}\nTotal today: ${formatHHMMSS(
          todaySeconds
        )}`
      );
      setTodaySeconds(0);
      setCheckinTime(null);
    }
  };

  if (statusLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <OrangeHeader />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#2F6E8E" />
          <Text style={{ color: "#fff", marginTop: 12, fontSize: 14 }}>
            Checking attendance status...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <OrangeHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Completed state card ────────────────────────────────── */}
        {isCheckedOut ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today's Attendance</Text>
            <View style={styles.hoursRow}>
              <View style={styles.hoursBox}>
                <Text style={styles.hoursLabel}>🟢  Check In</Text>
                <Text style={styles.hoursValue}>
                  {checkinTime ? formatTime(checkinTime) : "--:--"}
                </Text>
              </View>
              <View style={{ width: 10 }} />
              <View style={styles.hoursBox}>
                <Text style={styles.hoursLabel}>🔴  Check Out</Text>
                <Text style={styles.hoursValue}>
                  {checkoutTime ? formatTime(checkoutTime) : "--:--"}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.liveBadge,
                { backgroundColor: "#DCFCE7", borderRadius: 8, padding: 8 },
              ]}
            >
              <View style={[styles.liveDot, { backgroundColor: "#22C55E" }]} />
              <Text style={[styles.liveTxt, { color: "#16A34A" }]}>
                ✓ Attendance completed for today
              </Text>
            </View>
          </View>
        ) : (
          <TotalWorkCard
            todaySeconds={todaySeconds}
            periodSeconds={periodSeconds}
            isClockedIn={isClockedIn}
            onPress={() => setModalVisible(true)}
          />
        )}

        {history.map((e) => (
          <HistoryCard key={e.id} entry={e} />
        ))}
      </ScrollView>

      <VerifyModal
        visible={modalVisible}
        isClockedIn={isClockedIn}
        onSuccess={handleVerified}
        onCancel={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles (100% original — zero changes) ───────────────────
export default function CheckInScreen({ onTabPress, activeTab = 1 }) {
  const { user } = useUser();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkinTime, setCheckinTime] = useState(null);
  const [checkoutTime, setCheckoutTime] = useState(null);
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [periodSeconds, setPeriodSeconds] = useState(0);
  const [history, setHistory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef(null);

  const refreshAttendanceData = React.useCallback(async (showLoader = false) => {
    if (!user?.empId) {
      setStatusLoading(false);
      setRefreshing(false);
      return;
    }

    if (showLoader) {
      setStatusLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [statusRes, historyRes] = await Promise.all([
        fetch(`${BASE_URL}/api/attendance/status/${user.empId}`),
        fetch(`${BASE_URL}/api/attendance/history/${user.empId}`),
      ]);

      if (!statusRes.ok) throw new Error("Status fetch failed");
      if (!historyRes.ok) throw new Error("History fetch failed");

      const statusData = await statusRes.json();
      const historyData = await historyRes.json();
      const historyEntries = Array.isArray(historyData)
        ? historyData.map(toHistoryEntry)
        : [];
      const now = new Date();
      const restoredCheckIn = parseAttendanceDateTime(statusData?.date, statusData?.checkIn);
      const restoredCheckOut = parseAttendanceDateTime(statusData?.date, statusData?.checkOut);

      setHistory(historyEntries);
      setPeriodSeconds(
        historyEntries
          .filter(
            (entry) =>
              entry?.date?.getMonth?.() === now.getMonth() &&
              entry?.date?.getFullYear?.() === now.getFullYear()
          )
          .reduce((sum, entry) => sum + (entry.totalSeconds || 0), 0)
      );
      setCheckinTime(restoredCheckIn);
      setCheckoutTime(restoredCheckOut);

      if (statusData?.checkedIn && statusData?.checkedOut) {
        const completedEntry = historyEntries.find(
          (entry) => entry?.date?.toDateString?.() === now.toDateString()
        );
        setIsClockedIn(false);
        setIsCheckedOut(true);
        setTodaySeconds(completedEntry?.totalSeconds || 0);
      } else if (statusData?.checkedIn) {
        setIsClockedIn(true);
        setIsCheckedOut(false);
        setTodaySeconds(
          restoredCheckIn
            ? Math.max(0, Math.floor((Date.now() - restoredCheckIn.getTime()) / 1000))
            : 0
        );
      } else {
        setIsClockedIn(false);
        setIsCheckedOut(false);
        setTodaySeconds(0);
        setCheckinTime(null);
        setCheckoutTime(null);
      }
    } catch (err) {
      console.warn("[CheckInScreen] Could not refresh attendance:", err.message);
    } finally {
      setStatusLoading(false);
      setRefreshing(false);
    }
  }, [user?.empId]);

  useEffect(() => {
    refreshAttendanceData(true);
  }, [refreshAttendanceData]);

  useEffect(() => {
    if (isClockedIn) {
      timerRef.current = setInterval(() => {
        setTodaySeconds((s) => s + 1);
        setPeriodSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isClockedIn]);

  const handleVerified = async () => {
    setModalVisible(false);
    await refreshAttendanceData(false);
  };

  if (statusLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <OrangeHeader />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#2F6E8E" />
          <Text style={{ color: "#fff", marginTop: 12, fontSize: 14 }}>
            Checking attendance status...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <OrangeHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refreshAttendanceData(false)}
            tintColor="#2F6E8E"
          />
        }
      >
        {isCheckedOut ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today's Attendance</Text>
            <View style={styles.hoursRow}>
              <View style={styles.hoursBox}>
                <Text style={styles.hoursLabel}>Check In</Text>
                <Text style={styles.hoursValue}>
                  {checkinTime ? formatTime(checkinTime) : "--:--"}
                </Text>
              </View>
              <View style={{ width: 10 }} />
              <View style={styles.hoursBox}>
                <Text style={styles.hoursLabel}>Check Out</Text>
                <Text style={styles.hoursValue}>
                  {checkoutTime ? formatTime(checkoutTime) : "--:--"}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.liveBadge,
                { backgroundColor: "#DCFCE7", borderRadius: 8, padding: 8 },
              ]}
            >
              <View style={[styles.liveDot, { backgroundColor: "#22C55E" }]} />
              <Text style={[styles.liveTxt, { color: "#16A34A" }]}>
                Attendance completed for today
              </Text>
            </View>
          </View>
        ) : (
          <TotalWorkCard
            todaySeconds={todaySeconds}
            periodSeconds={periodSeconds}
            isClockedIn={isClockedIn}
            onPress={() => setModalVisible(true)}
          />
        )}

        {history.map((entry) => (
          <HistoryCard key={entry.id} entry={entry} />
        ))}
      </ScrollView>

      <VerifyModal
        visible={modalVisible}
        isClockedIn={isClockedIn}
        onSuccess={handleVerified}
        onCancel={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  orangeHeader: {
    backgroundColor: "#2F6E8E",
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 26,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: C.white,
    fontSize: 24,
    fontWeight: "800",
    paddingTop: 39,
  },
  headerSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 4,
  },
  sparkles: { color: C.white, fontSize: 10, letterSpacing: 2, marginTop: 2 },

  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { color: "#1a2f4a", fontSize: 15, fontWeight: "700" },

  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  hoursBox: {
    flex: 1,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 12,
  },
  hoursLabel: { color: C.subText, fontSize: 12, marginBottom: 6 },
  hoursValue: { color: "#1a2f4a", fontSize: 20, fontWeight: "700" },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.success,
  },
  liveTxt: { fontSize: 12, color: C.success, fontWeight: "600" },

  checkinBtn: {
    backgroundColor: "#2F6E8E",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
  },
  checkoutBtn: {
    backgroundColor: "#1a3a5c",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
  },
  mainBtnTxt: { color: C.white, fontSize: 16, fontWeight: "700" },

  historyCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  historyDate: {
    color: C.orange,
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  historyDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#DDDDDD",
    marginHorizontal: 12,
  },
  historyLabel: { color: C.subText, fontSize: 11, marginBottom: 4 },
  historyValue: { color: "#1a2f4a", fontSize: 13, fontWeight: "600" },
});
