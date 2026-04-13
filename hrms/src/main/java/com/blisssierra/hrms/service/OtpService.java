// package com.blisssierra.hrms.service;

// import com.blisssierra.hrms.entity.OtpRecord;
// import com.blisssierra.hrms.repository.OtpRepository;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import java.security.SecureRandom;
// import java.time.LocalDateTime;

// /**
//  * OtpService — generates, stores, and validates 6-digit OTPs.
//  *
//  * FIX: Autowired field changed from `Emailservice emailService` (typo)
//  *      to `EmailService emailService` (matches the actual class name).
//  */
// @Service
// public class OtpService {

//     private static final Logger log = LoggerFactory.getLogger(OtpService.class);
//     private static final int OTP_VALIDITY_MINUTES = 10;

//     @Autowired
//     private OtpRepository otpRepository;

//     /**
//      * FIX: was `Emailservice` (lowercase 's') — corrected to `EmailService`.
//      * Spring could not autowire the bean with the wrong class reference,
//      * causing a NoSuchBeanDefinitionException at startup.
//      */
//     @Autowired
//     private EmailService emailService;

//     /**
//      * Generate a 6-digit OTP, store it in DB, and email it to the employee.
//      * Any previous unused OTPs for this email are invalidated first.
//      *
//      * @param email        recipient email address
//      * @param employeeName used in the email body greeting
//      * @return the generated OTP string (useful for testing/logging)
//      */
//     public String generateAndSendOtp(String email, String employeeName) {
//         // Invalidate any existing OTPs for this email so only one is active at a time
//         otpRepository.markAllUsedByEmail(email);

//         // Generate a cryptographically secure 6-digit OTP
//         String otp = generateSixDigitOtp();

//         // Persist to DB with 10-minute expiry window
//         OtpRecord record = new OtpRecord();
//         record.setEmail(email);
//         record.setOtp(otp);
//         record.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES));
//         record.setUsed(false);
//         otpRepository.save(record);

//         log.info("Generated OTP for {}: {} (expires in {} min)", email, otp, OTP_VALIDITY_MINUTES);

//         // Delegate email delivery to EmailService
//         emailService.sendOtpEmail(email, employeeName, otp);

//         return otp;
//     }

//     /**
//      * Validate a submitted OTP against the most recent active record.
//      *
//      * Checks:
//      *  1. An unused OTP exists for the given email
//      *  2. It has not expired (within OTP_VALIDITY_MINUTES window)
//      *  3. It matches the submitted value
//      *
//      * On success the OTP record is marked as used so it cannot be reused.
//      *
//      * @param email         the employee's email address
//      * @param submittedOtp  the OTP string entered by the user
//      * @return true if valid, false otherwise
//      */
//     public boolean validateOtp(String email, String submittedOtp) {
//         var optionalRecord = otpRepository
//                 .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email);

//         if (optionalRecord.isEmpty()) {
//             log.warn("No active OTP found for email: {}", email);
//             return false;
//         }

//         OtpRecord record = optionalRecord.get();

//         if (record.isExpired()) {
//             log.warn("OTP expired for email: {}", email);
//             return false;
//         }

//         if (!record.getOtp().equals(submittedOtp.trim())) {
//             log.warn("OTP mismatch for email: {} — expected {} got {}", email, record.getOtp(), submittedOtp);
//             return false;
//         }

//         // Mark as used so it cannot be replayed
//         record.setUsed(true);
//         otpRepository.save(record);
//         log.info("✅ OTP verified for email: {}", email);
//         return true;
//     }

//     /**
//      * Generate a random 6-digit number using a cryptographically secure RNG.
//      * Range: 100000–999999 (always exactly 6 digits).
//      */
//     private String generateSixDigitOtp() {
//         SecureRandom random = new SecureRandom();
//         int num = 100000 + random.nextInt(900000);
//         return String.valueOf(num);
//     }
// }

// src/main/java/com/blisssierra/hrms/service/OtpService.java
// COMPLETE REPLACEMENT — adds configurable expiry and better error messages

package com.blisssierra.hrms.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.blisssierra.hrms.entity.OtpRecord;
import com.blisssierra.hrms.repository.OtpRepository;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    // ── Configurable via application.properties ────────────────────────────
    // Add: otp.validity.minutes=5 to application.properties
    // Defaults to 5 minutes if not set.
    @Value("${otp.validity.minutes:5}")
    private int otpValidityMinutes;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Generate a 6-digit OTP, store it in DB, and email it.
     * Invalidates any previous unused OTPs for this email first.
     */
    public String generateAndSendOtp(String email, String employeeName) {
        // Invalidate existing OTPs
        otpRepository.markAllUsedByEmail(email);

        String otp = generateSixDigitOtp();

        OtpRecord record = new OtpRecord();
        record.setEmail(email);
        record.setOtp(otp);
        // ── Use configurable validity ──────────────────────────────────────
        record.setExpiresAt(LocalDateTime.now().plusMinutes(otpValidityMinutes));
        record.setUsed(false);
        otpRepository.save(record);

        log.info("Generated OTP for {}: expires in {} min", email, otpValidityMinutes);

        emailService.sendOtpEmail(email, employeeName, otp);

        return otp;
    }

    /**
     * Validate OTP. Returns detailed error messages so the frontend
     * can show the correct UI state (expired vs wrong OTP).
     */
    public OtpValidationResult validateOtpDetailed(String email, String submittedOtp) {
        var optionalRecord = otpRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email);

        if (optionalRecord.isEmpty()) {
            log.warn("No active OTP found for email: {}", email);
            return OtpValidationResult.noOtp();
        }

        OtpRecord record = optionalRecord.get();

        if (record.isExpired()) {
            log.warn("OTP expired for email: {}", email);
            return OtpValidationResult.expired(otpValidityMinutes);
        }

        if (!record.getOtp().equals(submittedOtp.trim())) {
            log.warn("OTP mismatch for email: {}", email);
            return OtpValidationResult.wrongOtp();
        }

        // Mark as used
        record.setUsed(true);
        otpRepository.save(record);
        log.info("✅ OTP verified for email: {}", email);
        return OtpValidationResult.success();
    }

    /**
     * Backward-compatible simple boolean validation.
     * Used by AuthService.verifyOtp() — keeps existing contract.
     */
    public boolean validateOtp(String email, String submittedOtp) {
        return validateOtpDetailed(email, submittedOtp).isValid();
    }

    /**
     * Returns remaining validity seconds for the active OTP.
     * Returns 0 if no active OTP or already expired.
     */
    public int getRemainingSeconds(String email) {
        var optionalRecord = otpRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email);

        if (optionalRecord.isEmpty())
            return 0;

        OtpRecord record = optionalRecord.get();
        if (record.isExpired())
            return 0;

        long seconds = java.time.temporal.ChronoUnit.SECONDS.between(
                LocalDateTime.now(), record.getExpiresAt());
        return (int) Math.max(0, seconds);
    }

    private String generateSixDigitOtp() {
        SecureRandom random = new SecureRandom();
        int num = 100000 + random.nextInt(900000);
        return String.valueOf(num);
    }

    // ── Inner result class ─────────────────────────────────────────────────
    public static class OtpValidationResult {
        private final boolean valid;
        private final String errorCode; // "NO_OTP", "EXPIRED", "WRONG_OTP", null
        private final String message;

        private OtpValidationResult(boolean valid, String errorCode, String message) {
            this.valid = valid;
            this.errorCode = errorCode;
            this.message = message;
        }

        public boolean isValid() {
            return valid;
        }

        public String getErrorCode() {
            return errorCode;
        }

        public String getMessage() {
            return message;
        }

        public static OtpValidationResult success() {
            return new OtpValidationResult(true, null, "OTP verified successfully");
        }

        public static OtpValidationResult expired(int validityMinutes) {
            return new OtpValidationResult(
                    false, "EXPIRED",
                    "OTP has expired. Please click 'Resend OTP' to get a new code.");
        }

        public static OtpValidationResult wrongOtp() {
            return new OtpValidationResult(
                    false, "WRONG_OTP",
                    "Invalid OTP. Please check your email and try again.");
        }

        public static OtpValidationResult noOtp() {
            return new OtpValidationResult(
                    false, "NO_OTP",
                    "No active OTP found. Please request a new OTP.");
        }
    }
}