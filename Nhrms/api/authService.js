// /**
//  * api/authService.js  — UPDATED
//  *
//  * CHANGE: apiFaceVerify now accepts an optional `isClockedIn` boolean.
//  * It appends it as a form field so Spring Boot's AttendanceController
//  * can record the correct check-in vs check-out action in the database.
//  *
//  * All other functions are UNTOUCHED.
//  */
// import { BASE_URL, ENDPOINTS } from "./config";
// import { Platform } from "react-native";

// // ─── Helper: convert any image URI/string to FormData-safe value ─────────────
// async function toFormDataFile(uri, filename = "photo.jpg") {
//     if (Platform.OS === "web") {
//         if (typeof uri === "string" && uri.startsWith("data:")) {
//             return dataUriToBlob(uri, filename);
//         }
//         if (typeof uri === "string" && uri.startsWith("blob:")) {
//             const res = await fetch(uri);
//             const blob = await res.blob();
//             return new File([blob], filename, { type: blob.type || "image/jpeg" });
//         }
//         const res = await fetch(uri);
//         const blob = await res.blob();
//         return new File([blob], filename, { type: blob.type || "image/jpeg" });
//     } else {
//         const normalizedUri =
//             typeof uri === "string" && !uri.startsWith("file://") && !uri.startsWith("http")
//                 ? "file://" + uri
//                 : uri;
//         return { uri: normalizedUri, name: filename, type: "image/jpeg" };
//     }
// }

// function dataUriToBlob(dataUri, filename = "photo.jpg") {
//     const [header, base64Data] = dataUri.split(",");
//     const mimeMatch = header.match(/:(.*?);/);
//     const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
//     const byteChars = atob(base64Data);
//     const byteNums = new Array(byteChars.length);
//     for (let i = 0; i < byteChars.length; i++) {
//         byteNums[i] = byteChars.charCodeAt(i);
//     }
//     const byteArray = new Uint8Array(byteNums);
//     const blob = new Blob([byteArray], { type: mime });
//     try {
//         return new File([blob], filename, { type: mime });
//     } catch {
//         return blob;
//     }
// }

// // ── Step 1: Signup ────────────────────────────────────────────────────────────
// export async function apiSignup({ name, email, empId, designation, password }) {
//     const res = await fetch(`${BASE_URL}${ENDPOINTS.signup}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, email, empId, designation, password }),
//     });
//     const data = await res.json();
//     // 👇 ADD THIS LINE (VERY IMPORTANT)
//     console.log("LOGIN RESPONSE:", data);
//     if (!res.ok) throw new Error(data.message || "Signup failed");
//     return data;
// }

// // ── Step 2: Upload face images ────────────────────────────────────────────────
// export async function apiUploadFace(email, imageUris) {
//     const formData = new FormData();
//     formData.append("email", email);

//     for (let i = 0; i < imageUris.length; i++) {
//         const uri = imageUris[i];
//         const filename = `face_${i + 1}.jpg`;
//         const fileValue = await toFormDataFile(uri, filename);
//         formData.append("images", fileValue);
//     }

//     const res = await fetch(`${BASE_URL}${ENDPOINTS.uploadFace}`, {
//         method: "POST",
//         body: formData,
//     });

//     let data;
//     try {
//         data = await res.json();
//     } catch (_) {
//         throw new Error("Server returned an unexpected response during face upload");
//     }

//     if (!res.ok) throw new Error(data.message || "Face upload failed");
//     if (data.status === "error") throw new Error(data.message || "Face upload failed");
//     return data;
// }

// // ── Step 3: Verify OTP ────────────────────────────────────────────────────────
// export async function apiVerifyOtp(email, otp) {
//     const res = await fetch(`${BASE_URL}${ENDPOINTS.verifyOtp}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp }),
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || "OTP verification failed");
//     return data;
// }

// // ── Resend OTP ────────────────────────────────────────────────────────────────
// export async function apiResendOtp(email) {
//     const res = await fetch(`${BASE_URL}${ENDPOINTS.resendOtp}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || "Resend OTP failed");
//     return data;
// }

// // ── Login ─────────────────────────────────────────────────────────────────────
// export async function apiLogin(empId, password) {
//     const res = await fetch(`${BASE_URL}${ENDPOINTS.login}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ empId, password }),
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || "Login failed");
//     return data;
// }

// // ── Face Verify (check-in / check-out) ───────────────────────────────────────
// /**
//  * @param {string}  empId        employee ID
//  * @param {string}  photoUri     URI of the captured selfie
//  * @param {boolean} isClockedIn  true  = checking OUT
//  *                               false = checking IN  (default)
//  */
// export async function apiFaceVerify(empId, photoUri, isClockedIn = false) {
//     const formData = new FormData();
//     formData.append("empId", empId);

//     // ── NEW: tell the server which action this is ──────────────────────────────
//     formData.append("isClockedIn", String(isClockedIn));

//     const fileValue = await toFormDataFile(photoUri, "live.jpg");
//     formData.append("photo", fileValue);

//     console.log("[apiFaceVerify] empId:", empId, "| isClockedIn:", isClockedIn);

//     const res = await fetch(`${BASE_URL}${ENDPOINTS.verifyFace}`, {
//         method: "POST",
//         body: formData,
//     });
//     const data = await res.json();
//     console.log("[apiFaceVerify] Response:", data);
//     return data; // { match, score, message }
// }








// api/authService.js

/**

* CHANGES:

*  - Added apiForgotPassword, apiVerifyForgotOtp, apiResetPassword

*  - All existing exports UNTOUCHED

*/

import { BASE_URL, ENDPOINTS } from "./config";

import { Platform } from "react-native";

// ─── Helper: convert any image URI/string to FormData-safe value ─────────────

async function toFormDataFile(uri, filename = "photo.jpg") {

    if (Platform.OS === "web") {

        if (typeof uri === "string" && uri.startsWith("data:")) {

            return dataUriToBlob(uri, filename);

        }

        if (typeof uri === "string" && uri.startsWith("blob:")) {

            const res = await fetch(uri);

            const blob = await res.blob();

            return new File([blob], filename, { type: blob.type || "image/jpeg" });

        }

        const res = await fetch(uri);

        const blob = await res.blob();

        return new File([blob], filename, { type: blob.type || "image/jpeg" });

    } else {

        const normalizedUri =

            typeof uri === "string" && !uri.startsWith("file://") && !uri.startsWith("http")

                ? "file://" + uri

                : uri;

        return { uri: normalizedUri, name: filename, type: "image/jpeg" };

    }

}

function dataUriToBlob(dataUri, filename = "photo.jpg") {

    const [header, base64Data] = dataUri.split(",");

    const mimeMatch = header.match(/:(.*?);/);

    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const byteChars = atob(base64Data);

    const byteNums = new Array(byteChars.length);

    for (let i = 0; i < byteChars.length; i++) {

        byteNums[i] = byteChars.charCodeAt(i);

    }

    const byteArray = new Uint8Array(byteNums);

    const blob = new Blob([byteArray], { type: mime });

    try {

        return new File([blob], filename, { type: mime });

    } catch {

        return blob;

    }

}

// ── Step 1: Signup ──────────────────────────────────────────────────────────

export async function apiSignup({ name, email, empId, designation, password }) {

    const res = await fetch(`${BASE_URL}${ENDPOINTS.signup}`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ name, email, empId, designation, password }),

    });

    const data = await res.json();

    console.log("LOGIN RESPONSE:", data);

    if (!res.ok) throw new Error(data.message || "Signup failed");

    return data;

}

// ── Step 2: Upload face images ──────────────────────────────────────────────

export async function apiUploadFace(email, imageUris) {

    const formData = new FormData();

    formData.append("email", email);

    for (let i = 0; i < imageUris.length; i++) {

        const uri = imageUris[i];

        const filename = `face_${i + 1}.jpg`;

        const fileValue = await toFormDataFile(uri, filename);

        formData.append("images", fileValue);

    }

    const res = await fetch(`${BASE_URL}${ENDPOINTS.uploadFace}`, {

        method: "POST",

        body: formData,

    });

    let data;

    try {

        data = await res.json();

    } catch (_) {

        throw new Error("Server returned an unexpected response during face upload");

    }

    if (!res.ok) throw new Error(data.message || "Face upload failed");

    if (data.status === "error") throw new Error(data.message || "Face upload failed");

    return data;

}

// ── Step 3: Verify OTP (signup) ──────────────────────────────────────────────

export async function apiVerifyOtp(email, otp) {

    const res = await fetch(`${BASE_URL}${ENDPOINTS.verifyOtp}`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email, otp }),

    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "OTP verification failed");

    return data;

}

// ── Resend OTP ───────────────────────────────────────────────────────────────

export async function apiResendOtp(email) {

    const res = await fetch(`${BASE_URL}${ENDPOINTS.resendOtp}`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email }),

    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Resend OTP failed");

    return data;

}

// ── Login ────────────────────────────────────────────────────────────────────

export async function apiLogin(empId, password) {

    const res = await fetch(`${BASE_URL}${ENDPOINTS.login}`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ empId, password }),

    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Login failed");

    return data;

}

// ── Face Verify (check-in / check-out) ──────────────────────────────────────

export async function apiFaceVerify(empId, photoUri, isClockedIn = false) {

    const formData = new FormData();

    formData.append("empId", empId);

    formData.append("isClockedIn", String(isClockedIn));

    const fileValue = await toFormDataFile(photoUri, "live.jpg");

    formData.append("photo", fileValue);

    console.log("[apiFaceVerify] empId:", empId, "| isClockedIn:", isClockedIn);

    const res = await fetch(`${BASE_URL}${ENDPOINTS.verifyFace}`, {

        method: "POST",

        body: formData,

    });

    const data = await res.json();

    console.log("[apiFaceVerify] Response:", data);

    return data;

}

// ── Forgot Password: Step 1 — validate email & trigger OTP ──────────────────

export async function apiForgotPassword(email) {

    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email: email.trim().toLowerCase() }),

    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Request failed");

    if (data.status === "error") throw new Error(data.message || "Request failed");

    return data;

}

// ── Forgot Password: Step 2 — verify OTP ────────────────────────────────────

export async function apiVerifyForgotOtp(email, otp) {

    const res = await fetch(`${BASE_URL}/api/auth/verify-forgot-otp`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),

    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "OTP verification failed");

    if (data.status === "error") throw new Error(data.message || "OTP verification failed");

    return data;

}

// ── Forgot Password: Step 3 — reset password ────────────────────────────────

export async function apiResetPassword(email, newPassword) {

    const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

            email: email.trim().toLowerCase(),

            newPassword: newPassword.trim(),

        }),

    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Password reset failed");

    if (data.status === "error") throw new Error(data.message || "Password reset failed");

    return data;

}
