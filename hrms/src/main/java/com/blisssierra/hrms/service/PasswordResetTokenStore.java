// src/main/java/com/blisssierra/hrms/service/PasswordResetTokenStore.java
package com.blisssierra.hrms.service;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

/**
 * In-memory store for validated forgot-password tokens.
 * After OTP is verified, the email is whitelisted for 10 minutes
 * so the reset-password call can proceed without re-entering OTP.
 */
@Component
public class PasswordResetTokenStore {

    private final Map<String, LocalDateTime> store = new ConcurrentHashMap<>();

    /** Allow a password reset for this email for the next 10 minutes. */
    public void allow(String email) {
        store.put(email.trim().toLowerCase(), LocalDateTime.now().plusMinutes(10));
    }

    /**
     * Returns true if this email recently passed forgot-password OTP verification.
     */
    public boolean isAllowed(String email) {
        String key = email.trim().toLowerCase();
        LocalDateTime expiry = store.get(key);
        if (expiry == null)
            return false;
        if (LocalDateTime.now().isAfter(expiry)) {
            store.remove(key);
            return false;
        }
        return true;
    }

    /** Revoke after successful reset so the token cannot be reused. */
    public void revoke(String email) {
        store.remove(email.trim().toLowerCase());
    }
}