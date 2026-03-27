"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { useTheme } from "next-themes";

const OPENING_DELAY_MS = 1800;

function OpeningFallback() {
    return (
        <main style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            background: "radial-gradient(circle at 20% 20%, #2563eb36, transparent 45%), radial-gradient(circle at 80% 80%, #3b82f630, transparent 45%), #020617",
            color: "#e2e8f0",
            padding: "24px",
        }}>
            <div style={{
                width: "74px",
                height: "74px",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                boxShadow: "0 18px 40px #2563eb66",
                animation: "pulse 1.8s ease-in-out infinite",
            }}>
                <GraduationCap size={34} color="white" />
            </div>

            <div style={{ display: "flex", alignItems: "baseline", lineHeight: 1, letterSpacing: "-1px" }}>
                <span style={{ fontWeight: 500, fontSize: "34px" }}>Escala</span>
                <span style={{ fontWeight: 900, fontSize: "34px", color: "#2563eb", marginLeft: "2px" }}>Digital</span>
            </div>
            <p style={{ margin: 0, color: "rgba(226,232,240,0.78)", fontWeight: 600 }}>
                Preparando seu ambiente...
            </p>

            <div style={{
                width: "220px",
                height: "6px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.12)",
                overflow: "hidden",
                marginTop: "6px",
            }}>
                <div style={{
                    width: "40%",
                    height: "100%",
                    background: "linear-gradient(90deg, #3b82f6, #2563eb)",
                    animation: "loading 1.2s ease-in-out infinite",
                }} />
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.06); }
                }
                @keyframes loading {
                    0% { transform: translateX(-120%); }
                    100% { transform: translateX(320%); }
                }
            `}</style>
        </main>
    );
}

function OpeningContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const next = searchParams.get("next") || "/catalog";
    const isDark = !mounted || resolvedTheme === "dark";
    const isCreatorFlow = next.startsWith("/creator");
    const accent = isCreatorFlow ? "#9146FF" : "#2563eb";
    const accentAlt = isCreatorFlow ? "#772CE8" : "#3b82f6";
    const portalLabel = isCreatorFlow ? "Portal do Criador" : "Portal do Aluno";

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.replace("/login");
            return;
        }

        const safeNext = next.startsWith("/") ? next : "/catalog";
        const timer = window.setTimeout(() => {
            router.replace(safeNext);
        }, OPENING_DELAY_MS);

        return () => window.clearTimeout(timer);
    }, [next, router]);

    return (
        <main style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            background: isDark
                ? `radial-gradient(circle at 20% 20%, ${accent}36, transparent 45%), radial-gradient(circle at 80% 80%, ${accentAlt}30, transparent 45%), #020617`
                : `radial-gradient(circle at 20% 20%, ${accent}20, transparent 45%), radial-gradient(circle at 80% 80%, ${accentAlt}18, transparent 45%), #f8fafc`,
            color: isDark ? "#e2e8f0" : "#0f172a",
            padding: "24px",
        }}>
            <div style={{
                width: "74px",
                height: "74px",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${accentAlt} 0%, ${accent} 100%)`,
                boxShadow: `0 18px 40px ${accent}66`,
                animation: "pulse 1.8s ease-in-out infinite",
            }}>
                <GraduationCap size={34} color="white" />
            </div>

            <div style={{ display: "flex", alignItems: "baseline", lineHeight: 1, letterSpacing: "-1px" }}>
                <span style={{ fontWeight: 500, fontSize: "34px" }}>Escala</span>
                <span style={{ fontWeight: 900, fontSize: "34px", color: accent, marginLeft: "2px" }}>Digital</span>
            </div>
            <div style={{
                padding: "6px 14px",
                borderRadius: "999px",
                background: isDark ? `${accent}2A` : `${accent}1A`,
                border: `1px solid ${isDark ? `${accent}66` : `${accent}40`}`,
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: accent
            }}>
                {portalLabel}
            </div>
            <p style={{ margin: 0, color: isDark ? "rgba(226,232,240,0.78)" : "rgba(15,23,42,0.68)", fontWeight: 600 }}>
                Preparando seu ambiente...
            </p>

            <div style={{
                width: "220px",
                height: "6px",
                borderRadius: "999px",
                background: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.10)",
                overflow: "hidden",
                marginTop: "6px",
            }}>
                <div style={{
                    width: "40%",
                    height: "100%",
                    background: `linear-gradient(90deg, ${accentAlt}, ${accent})`,
                    animation: "loading 1.2s ease-in-out infinite",
                }} />
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.06); }
                }
                @keyframes loading {
                    0% { transform: translateX(-120%); }
                    100% { transform: translateX(320%); }
                }
            `}</style>
        </main>
    );
}

export default function OpeningPage() {
    return (
        <Suspense fallback={<OpeningFallback />}>
            <OpeningContent />
        </Suspense>
    );
}
