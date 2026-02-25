"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface User {
    id: string;
    email: string;
    name: string;
    company?: string;
    role: "CREATOR" | "STUDENT";
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string, role: "CREATOR" | "STUDENT") => Promise<void>;
    logout: () => void;
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

    const login = async (email: string, password: string, requiredRole: "CREATOR" | "STUDENT") => {
        try {
            const response = await api.post("/auth/login", { email, password });
            const { access_token, role: userRole } = response.data;

            // Check if the user's role matches the required role for this login form
            if (userRole !== requiredRole) {
                throw new Error(`RESTRICTED_ROLE:${userRole}`);
            }

            localStorage.setItem("access_token", access_token);

            // Fetch complete user profile after login
            const userResponse = await api.get("/auth/me");
            const userData = userResponse.data;
            setUser(userData);

            if (userData.role === "CREATOR") {
                router.push("/creator/dashboard");
            } else {
                router.push("/catalog");
            }
        } catch (e: any) {
            if (e.message?.startsWith("RESTRICTED_ROLE:")) {
                throw e;
            }
            throw new Error("Invalid credentials");
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
