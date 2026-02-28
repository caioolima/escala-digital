"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, LogOut } from "lucide-react";
import { useTheme } from "next-themes";

const CLOSING_DELAY_MS = 1300;

export default function ClosingPage() {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const isDark = !mounted || resolvedTheme === "dark";

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            router.replace("/login");
        }, CLOSING_DELAY_MS);

        return () => window.clearTimeout(timer);
    }, [router]);

    return (
        <main style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: isDark
                ? "radial-gradient(circle at 20% 20%, rgba(239,68,68,0.18), transparent 45%), radial-gradient(circle at 80% 80%, rgba(244,63,94,0.16), transparent 45%), #020617"
                : "radial-gradient(circle at 20% 20%, rgba(239,68,68,0.10), transparent 45%), radial-gradient(circle at 80% 80%, rgba(244,63,94,0.08), transparent 45%), #f8fafc",
            color: isDark ? "#e2e8f0" : "#0f172a",
            padding: "24px",
        }}>
            <section style={{
                width: "100%",
                maxWidth: "460px",
                borderRadius: "24px",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "14px",
                background: isDark ? "rgba(2,6,23,0.6)" : "rgba(255,255,255,0.78)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.10)"}`,
                boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.35)" : "0 20px 60px rgba(15,23,42,0.12)",
                backdropFilter: "blur(12px)",
            }}>
                <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    boxShadow: "0 14px 28px rgba(37,99,235,0.35)",
                }}>
                    <GraduationCap size={28} color="white" />
                </div>

                <div style={{ display: "flex", alignItems: "baseline", lineHeight: 1, letterSpacing: "-1px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 500, fontSize: "30px" }}>Escala</span>
                    <span style={{ fontWeight: 900, fontSize: "30px", color: "#2563eb", marginLeft: "2px" }}>Digital</span>
                </div>

                <div style={{
                    width: "54px",
                    height: "54px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)",
                    boxShadow: "0 12px 24px rgba(239, 68, 68, 0.35)",
                }}>
                    <LogOut size={24} color="white" />
                </div>

                <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 900, letterSpacing: "-1px" }}>
                    Sessao encerrada
                </h1>
                <p style={{ margin: 0, color: isDark ? "rgba(226,232,240,0.78)" : "rgba(15,23,42,0.68)", fontWeight: 600, textAlign: "center" }}>
                    Sua conta foi desconectada deste dispositivo.
                </p>
                <p style={{ margin: 0, color: isDark ? "rgba(226,232,240,0.58)" : "rgba(15,23,42,0.54)", fontSize: "13px", fontWeight: 700, textAlign: "center" }}>
                    Redirecionando para o login...
                </p>
            </section>
        </main>
    );
}
