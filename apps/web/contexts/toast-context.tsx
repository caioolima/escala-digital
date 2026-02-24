"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

type ToastType = "success" | "error" | "info" | "premium";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: "fixed",
                bottom: "40px",
                right: "40px",
                zIndex: 10000,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                pointerEvents: "none"
            }}>
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem: React.FC<{ toast: Toast, onClose: () => void }> = ({ toast, onClose }) => {
    const icons = {
        success: <CheckCircle2 size={18} color="#10b981" />,
        error: <AlertCircle size={18} color="#ef4444" />,
        info: <Info size={18} color="#3b82f6" />,
        premium: <Sparkles size={18} color="#7c3aed" />
    };

    const glows = {
        success: "rgba(16, 185, 129, 0.15)",
        error: "rgba(239, 68, 68, 0.15)",
        info: "rgba(59, 130, 246, 0.15)",
        premium: "rgba(124, 58, 237, 0.15)"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            style={{
                background: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(20px)",
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                borderRadius: "20px",
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                minWidth: "300px",
                maxWidth: "450px",
                boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 20px ${glows[toast.type]}`,
                pointerEvents: "auto",
                position: "relative",
                overflow: "hidden"
            }}
        >
            {/* Background Glow */}
            <div style={{
                position: "absolute",
                top: "50%",
                left: "-10px",
                transform: "translateY(-50%)",
                width: "40px",
                height: "40px",
                background: glows[toast.type],
                filter: "blur(20px)",
                borderRadius: "50%",
                zIndex: 0
            }} />

            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "16px", width: "100%" }}>
                <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                }}>
                    {icons[toast.type]}
                </div>

                <p style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "white",
                    margin: 0,
                    flexGrow: 1,
                    letterSpacing: "-0.3px"
                }}>
                    {toast.message}
                </p>

                <button
                    onClick={onClose}
                    style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.3)",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                        transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Progress bar timer */}
            <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: "3px",
                    background: toast.type === "premium" ? "linear-gradient(90deg, #7c3aed, #3b82f6)" : glows[toast.type].replace("0.15", "0.5"),
                    opacity: 0.5
                }}
            />
        </motion.div>
    );
};
