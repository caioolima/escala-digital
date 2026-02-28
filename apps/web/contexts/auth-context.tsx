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
}

const AuthContext = createContext<AuthContextType | null>(null);

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

        if (userData.role === "CREATOR") {
            router.push("/creator/dashboard");
        } else {
            router.push("/catalog");
        }
    };

    const login = async (email: string, password: string, requiredRole: LoginRole): Promise<LoginResult> => {
        try {
            const response = await api.post("/auth/login", { email, password });
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
        const response = await api.post("/auth/2fa/verify", { userId, code });
        const { access_token } = response.data;
        await completeSession(access_token, requiredRole);
    };

    const resendTwoFactor = async (userId: string) => {
        await api.post("/auth/2fa/resend", { userId });
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
        router.push("/login");
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

    return (
        <AuthContext.Provider value={{ user, loading, login, verifyTwoFactor, resendTwoFactor, logout, updateProfile, changePassword, getSettings, updateSettings }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
