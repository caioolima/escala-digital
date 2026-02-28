"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
    company?: string;
    role: "CREATOR" | "STUDENT";
}

type LoginRole = "CREATOR" | "STUDENT";
type LoginResult =
    | { requires2FA: false }
    | { requires2FA: true; userId: string; email: string; role: LoginRole };

type TrustedDeviceContext = {
    deviceId: string;
    timezone?: string;
    locale?: string;
    platform?: string;
    userAgent?: string;
};

export type TrustedDevice = {
    id: string;
    deviceName: string;
    platform: string | null;
    timezone: string | null;
    locale: string | null;
    ipPrefix: string | null;
    trustedAt: string;
    lastSeenAt: string;
    expiresAt: string;
    isCurrent: boolean;
};

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string, role: LoginRole) => Promise<LoginResult>;
    verifyTwoFactor: (userId: string, code: string, requiredRole: LoginRole) => Promise<void>;
    resendTwoFactor: (userId: string) => Promise<void>;
    logout: () => void;
    updateProfile?: (data: { name?: string; email?: string; avatarUrl?: string }) => Promise<void>;
    changePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
    getSettings?: () => Promise<{ preferences?: any; notifications?: any } | null>;
    updateSettings?: (body: { preferences?: any; notifications?: any }) => Promise<void>;
    getTrustedDevices?: () => Promise<TrustedDevice[]>;
    revokeTrustedDevice?: (deviceId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const TRUSTED_DEVICE_KEY = "trusted_device_id";
const LOGIN_TRANSITION_DELAY_MS = 700;

function getTrustedDeviceContext(): TrustedDeviceContext {
    let deviceId = localStorage.getItem(TRUSTED_DEVICE_KEY);
    if (!deviceId) {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            deviceId = crypto.randomUUID();
        } else {
            deviceId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        }
        localStorage.setItem(TRUSTED_DEVICE_KEY, deviceId);
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
    const locale = navigator.language || undefined;
    const platform = navigator.platform || undefined;
    const userAgent = navigator.userAgent || undefined;

    return { deviceId, timezone, locale, platform, userAgent };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("access_token");
            if (token) {
                try {
                    const response = await api.get("/auth/me");
                    setUser(response.data);
                } catch (e) {
                    console.error("Failed to restore session", e);
                    localStorage.removeItem("access_token");
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const completeSession = async (accessToken: string, requiredRole: LoginRole) => {
        localStorage.setItem("access_token", accessToken);
        const userResponse = await api.get("/auth/me");
        const userData = userResponse.data;
        setUser(userData);

        if (userData.role !== requiredRole) {
            localStorage.removeItem("access_token");
            throw new Error(`RESTRICTED_ROLE:${userData.role}`);
        }

        await new Promise((resolve) => setTimeout(resolve, LOGIN_TRANSITION_DELAY_MS));
        const nextPath = userData.role === "CREATOR" ? "/creator/dashboard" : "/catalog";
        router.push(`/opening?next=${encodeURIComponent(nextPath)}`);
    };

    const login = async (email: string, password: string, requiredRole: LoginRole): Promise<LoginResult> => {
        try {
            const deviceContext = getTrustedDeviceContext();
            const response = await api.post("/auth/login", { email, password, ...deviceContext });
            const data = response.data;

            if (data?.requires2FA) {
                if (data.role !== requiredRole) {
                    throw new Error(`RESTRICTED_ROLE:${data.role}`);
                }
                return {
                    requires2FA: true,
                    userId: data.userId,
                    email: data.email,
                    role: data.role,
                };
            }

            await completeSession(data.access_token, requiredRole);
            return { requires2FA: false };
        } catch (e: any) {
            if (e.message?.startsWith("RESTRICTED_ROLE:")) {
                throw e;
            }
            throw new Error("Invalid credentials");
        }
    };

    const verifyTwoFactor = async (userId: string, code: string, requiredRole: LoginRole) => {
        const deviceContext = getTrustedDeviceContext();
        const response = await api.post("/auth/2fa/verify", { userId, code, ...deviceContext });
        const { access_token } = response.data;
        await completeSession(access_token, requiredRole);
    };

    const resendTwoFactor = async (userId: string) => {
        await api.post("/auth/2fa/resend", { userId });
    };

    const logout = () => {
        const role = user?.role;
        localStorage.removeItem("access_token");
        setUser(null);
        const query = role ? `?role=${encodeURIComponent(role)}` : "";
        router.push(`/closing${query}`);
    };

    const updateProfile = async (data: { name?: string; email?: string; avatarUrl?: string }) => {
        const resp = await api.patch('/auth/me', data);
        setUser(resp.data);
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        await api.post('/auth/me/password', { currentPassword, newPassword });
    };

    const getSettings = async () => {
        const resp = await api.get('/auth/me/settings');
        return resp.data;
    };

    const updateSettings = async (body: { preferences?: any; notifications?: any }) => {
        const resp = await api.patch('/auth/me/settings', body);
        return resp.data;
    };

    const getTrustedDevices = async () => {
        const resp = await api.get('/auth/me/trusted-devices');
        return (resp.data || []) as TrustedDevice[];
    };

    const revokeTrustedDevice = async (deviceId: string) => {
        await api.delete(`/auth/me/trusted-devices/${deviceId}`);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, verifyTwoFactor, resendTwoFactor, logout, updateProfile, changePassword, getSettings, updateSettings, getTrustedDevices, revokeTrustedDevice }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
