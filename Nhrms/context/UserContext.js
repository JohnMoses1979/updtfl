// /**
//  * UserContext.js
//  * Global state for the logged-in employee profile.
//  * Wrap the whole app with <UserProvider> and use
//  * useUser() anywhere to read / update the profile.
//  */
// import React, { createContext, useContext, useState } from "react";
// const UserContext = createContext(null);

// export function UserProvider({ children }) {
//     const [user, setUser] = useState(null);

//     // user shape after login:
//     // { userId, name, email, empId, designation, faceImagePaths }
//     // userId is the numeric DB primary key (employees.id)
//     const login = (userData) => setUser(userData);
//     const logout = () => setUser(null);

//     return (
//         <UserContext.Provider value={{ user, login, logout }}>
//             {children}
//         </UserContext.Provider>
//     );
// }

// export function useUser() {
//     return useContext(UserContext);
// }







/**
 * UserContext.js
 * Global state for the logged-in employee profile.
 * Persists user data via AsyncStorage so profile survives reloads.
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";

// Safe AsyncStorage wrapper (works on web too)
const storage = {
    async getItem(key) {
        try {
            if (Platform.OS === "web") {
                return localStorage.getItem(key);
            }
            const AsyncStorage = require("@react-native-async-storage/async-storage").default;
            return await AsyncStorage.getItem(key);
        } catch {
            return null;
        }
    },
    async setItem(key, value) {
        try {
            if (Platform.OS === "web") {
                localStorage.setItem(key, value);
                return;
            }
            const AsyncStorage = require("@react-native-async-storage/async-storage").default;
            await AsyncStorage.setItem(key, value);
        } catch { /* ignore */ }
    },
    async removeItem(key) {
        try {
            if (Platform.OS === "web") {
                localStorage.removeItem(key);
                return;
            }
            const AsyncStorage = require("@react-native-async-storage/async-storage").default;
            await AsyncStorage.removeItem(key);
        } catch { /* ignore */ }
    },
};

const STORAGE_KEY = "@hrms_user";

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [hydrated, setHydrated] = useState(false);

    // ── Rehydrate from storage on app start ───────────────────
    useEffect(() => {
        (async () => {
            try {
                const stored = await storage.getItem(STORAGE_KEY);
                if (stored) {
                    setUser(JSON.parse(stored));
                }
            } catch { /* ignore parse errors */ }
            finally {
                setHydrated(true);
            }
        })();
    }, []);

    // ── Persist whenever user changes ─────────────────────────
    useEffect(() => {
        if (!hydrated) return;
        if (user) {
            storage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            storage.removeItem(STORAGE_KEY);
        }
    }, [user, hydrated]);

    /**
     * login — store full user profile after authentication.
     * Shape: { userId, name, email, empId, designation, faceImagePaths }
     */
    const login = (userData) => setUser(userData);

    /**
     * updateProfile — merge partial updates (e.g. after personal data save).
     * Call this after a successful PUT /api/employees/profile/{empId}.
     */
    const updateProfile = (partial) => {
        setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...partial };
            // Rebuild display name from firstName/lastName if provided
            if (partial.firstName !== undefined || partial.lastName !== undefined) {
                const first = partial.firstName ?? prev.firstName ?? "";
                const last = partial.lastName ?? prev.lastName ?? "";
                const full = `${first} ${last}`.trim();
                if (full) updated.name = full;
                updated.firstName = first;
                updated.lastName = last;
            }
            return updated;
        });
    };

    const logout = () => setUser(null);

    // Don't render children until storage is hydrated
    // (prevents flash of "logged-out" state)
    if (!hydrated) return null;

    return (
        <UserContext.Provider value={{ user, login, updateProfile, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
