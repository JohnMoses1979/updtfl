package com.blisssierra.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for POST /api/auth/signup
 *
 * Sent by apiSignup() in api/authService.js:
 * Admin signup payload:
 * {
 *   "username": "admin01",
 *   "password": "secret123",
 *   "loginType": "ADMIN",
 *   "biometricEnabled": true
 * }
 *
 * Employee signup payload remains supported for backward compatibility.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequestDto {

    /** Admin/employee login username. */
    private String username;

    /** Full name of the employee. */
    private String name;

    /** Work / personal email address. */
    private String email;

    /** Unique employee ID (e.g. EMP001). */
    private String empId;

    /** Job title / designation (e.g. "Backend Developer"). */
    private String designation;

    /**
     * Plain-text password.
     * NOTE: In production replace with BCrypt hashing via
     * Spring Security's PasswordEncoder.
     */
    private String password;

    /**
     * Signup portal type: ADMIN or EMPLOYEE.
     * Defaults to EMPLOYEE when omitted.
     */
    private String loginType;

    /** Frontend confirms biometric setup before admin account is saved. */
    private Boolean biometricEnabled;
}
