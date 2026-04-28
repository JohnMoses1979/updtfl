package com.blisssierra.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for POST /api/auth/login
 *
 * Sent by apiLogin() in api/authService.js:
 * Admin login payload:
 * {
 *   "username": "admin01",
 *   "password": "secret123",
 *   "loginType": "ADMIN",
 *   "biometricVerified": true
 * }
 *
 * Note: empId is normalised to UPPERCASE in AuthService.login()
 * before the DB lookup, so the frontend can send any casing.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {

    /**
     * The employee's unique ID.
     * Case-insensitive — AuthService normalises it to uppercase.
     */
    private String empId;

    /** Admin username or legacy employee username. */
    private String username;

    /**
     * Plain-text password.
     * AuthService compares this directly against the stored value.
     * In production, replace with BCrypt: encoder.matches(raw, stored).
     */
    private String password;

    /**
     * Required login portal: ADMIN or EMPLOYEE.
     */
    private String loginType;

    /** Frontend confirms biometric success before final admin login. */
    private Boolean biometricVerified;
}
