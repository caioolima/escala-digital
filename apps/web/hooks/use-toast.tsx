"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    description?: string;
}

const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={18} />,
    error: <XCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Info size={18} />,
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; progress: string; glow: string }> = {
    success: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", icon: "#10b981", progress: "#10b981", glow: "rgba(16,185,129,0.15)" },
    error: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", icon: "#ef4444", progress: "#ef4444", glow: "rgba(239,68,68,0.15)" },
    warning: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", icon: "#f59e0b", progress: "#f59e0b", glow: "rgba(245,158,11,0.15)" },
    info: { bg: "rgba(145,70,255,0.08)", border: "rgba(145,70,255,0.25)", icon: "#9146FF", progress: "#9146FF", glow: "rgba(145,70,255,0.15)" },
};

/* ─── ToastContainer (renders in fixed position) ─── */
export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
    return (
        <div style={{ position: "fixed", bottom: "32px", right: "32px", zIndex: 99999, display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end", pointerEvents: "none" }}>
            {toasts.map(toast => {
                const c = COLORS[toast.type];
                return (
                    <div
                        key={toast.id}
                        className="toast-item"
                        style={{
                            pointerEvents: "all",
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            padding: "14px 20px",
                            borderRadius: "20px",
                            background: "rgba(10, 10, 15, 0.75)",
                            border: `1px solid ${c.border}`,
                            backdropFilter: "blur(24px) saturate(180%)",
                            boxShadow: `0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset`,
                            minWidth: "320px",
                            maxWidth: "420px",
                            animation: "toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        {/* Background subtle glow behind icon */}
                        <div style={{
                            position: "absolute",
                            left: "0",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "80px",
                            height: "80px",
                            background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)`,
                            pointerEvents: "none",
                            zIndex: 0
                        }} />

                        {/* Icon Container */}
                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "12px",
                            background: "rgba(255,255,255,0.03)",
                            border: `1px solid rgba(255,255,255,0.06)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: c.icon,
                            flexShrink: 0,
                            position: "relative",
                            zIndex: 1,
                            boxShadow: `0 8px 16px rgba(0,0,0,0.2)`
                        }}>
                            {ICONS[toast.type]}
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                            <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.2px" }}>
                                {toast.message}
                            </p>
                            {toast.description && (
                                <p style={{ margin: "4px 0 0", fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                                    {toast.description}
                                </p>
                            )}
                        </div>

                        {/* Close button with premium look */}
                        <button
                            onClick={() => onRemove(toast.id)}
                            style={{
                                flexShrink: 0,
                                width: "28px",
                                height: "28px",
                                borderRadius: "8px",
                                border: "none",
                                background: "rgba(255,255,255,0.05)",
                                color: "rgba(255,255,255,0.3)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                position: "relative",
                                zIndex: 1
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                                e.currentTarget.style.color = "#fff";
                                e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                e.currentTarget.style.color = "rgba(255,255,255,0.3)";
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            <X size={14} strokeWidth={2.5} />
                        </button>

                        {/* Progress Bar (Glow mode) */}
                        <div style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            height: "2px",
                            background: c.progress,
                            boxShadow: `0 0 8px ${c.progress}`,
                            animation: "toastProgress 3.5s linear forwards",
                            zIndex: 2
                        }} />
                    </div>
                );
            })}

            <style>{`
                @keyframes toastIn {
                    from { transform: translateX(100%) scale(0.9); opacity: 0; filter: blur(10px); }
                    to { transform: translateX(0) scale(1); opacity: 1; filter: blur(0); }
                }
                @keyframes toastProgress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .toast-item {
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
}

/* ─── useToast hook ─── */
export function useToast(durationMs = 3500) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const remove = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((message: string, type: ToastType = "success", description?: string) => {
        const id = Date.now().toString() + Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, message, type, description }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), durationMs);
    }, [durationMs]);

    return { toasts, toast, remove };
}
