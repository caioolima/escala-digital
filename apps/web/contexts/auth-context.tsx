"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    login: (email: string, password: string, role?: "CREATOR" | "STUDENT") => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedUser = localStorage.getItem("mock_user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string, role: "CREATOR" | "STUDENT" = "STUDENT") => {
        // Mocking API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockUser: User = {
            id: "mock-id-123",
            email,
            name: email === "dev.pedrodahmer@gmail.com" ? "Dev Pedro Dahmer" : ((email.split("@")[0] || "User").charAt(0).toUpperCase() + (email.split("@")[0] || "user").slice(1)),
            company: "Empresa Platinum",
            role: role,
        };

        localStorage.setItem("mock_user", JSON.stringify(mockUser));
        localStorage.setItem("access_token", "mock-jwt-token");
        setUser(mockUser);

        if (role === "CREATOR") {
            router.push("/creator/dashboard");
        } else {
            router.push("/catalog");
        }
    };

    const logout = () => {
        localStorage.removeItem("mock_user");
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
