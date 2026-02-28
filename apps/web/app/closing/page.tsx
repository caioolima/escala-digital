"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const CLOSING_DELAY_MS = 1800;

export default function ClosingPage() {
    const router = useRouter();
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const isDark = resolvedTheme === "dark";

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
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
                @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-40px) scale(1.05)} }
                @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,30px) scale(0.95)} }
                @keyframes float3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(20px,20px)} 66%{transform:translate(-15px,-10px)} }
                @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                @keyframes shimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }
                @keyframes loading { 0% { transform: translateX(-120%); } 100% { transform: translateX(320%); } }
                .closing-container { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @media (max-width:1100px) {
                  .brand-col { display:none !important; }
                  .closing-col { flex: 1 !important; width: 100% !important; }
                }
                @media (max-width:600px) {
                  .closing-box { padding: 32px 18px !important; border-radius: 16px !important; }
                }
            `}</style>

            <main style={{
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                backgroundColor: mounted ? (isDark ? "#060d1f" : "#f8fafc") : "var(--brand-bg)",
                position: "relative",
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                transition: "background-color 0.3s ease",
            }}>
                <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    style={{
                        position: "absolute",
                        top: "24px",
                        right: "24px",
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: isDark ? "rgba(255,255,255,0.05)" : "white",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 10,
                        color: isDark ? "white" : "#0f172a",
                    }}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {mounted && isDark && (
                    <>
                        <div style={{ position: "absolute", width: "700px", height: "700px", borderRadius: "50%", filter: "blur(120px)", opacity: 0.3, background: "radial-gradient(circle,#1d4ed8,#7c3aed)", top: "-200px", left: "-100px", animation: "float1 15s ease-in-out infinite", pointerEvents: "none" }} />
                        <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", filter: "blur(140px)", opacity: 0.22, background: "radial-gradient(circle,#0ea5e9,#2563eb)", bottom: "-150px", right: "100px", animation: "float2 18s ease-in-out infinite", pointerEvents: "none" }} />
                        <div style={{ position: "absolute", width: "420px", height: "420px", borderRadius: "50%", filter: "blur(110px)", opacity: 0.16, background: "radial-gradient(circle,#ef4444,#f43f5e)", top: "35%", left: "42%", animation: "float3 20s ease-in-out infinite", pointerEvents: "none" }} />
                    </>
                )}

                {mounted && !isDark && (
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.05) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(239,68,68,0.06) 0%, transparent 50%)",
                        pointerEvents: "none"
                    }} />
                )}

                <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${isDark ? "rgba(255,255,255,0.02)" : "rgba(37,99,235,0.03)"} 1px,transparent 1px),linear-gradient(90deg,${isDark ? "rgba(255,255,255,0.02)" : "rgba(37,99,235,0.03)"} 1px,transparent 1px)`, backgroundSize: "64px 64px", pointerEvents: "none" }} />

                <div className="closing-container" style={{
                    width: "100%",
                    maxWidth: "1440px",
                    zIndex: 1,
                    display: "flex",
                    gap: "40px",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <div className="brand-col" style={{ flex: 1.2, display: "flex", flexDirection: "column", gap: "60px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 8px 16px rgba(59, 130, 246, 0.4)",
                                position: "relative",
                                overflow: "hidden"
                            }}>
                                <div style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
                                    animation: "shimmer 3s infinite linear"
                                }} />
                                <GraduationCap size={22} color="white" style={{ position: "relative", zIndex: 1 }} />
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline" }}>
                                <span style={{ fontWeight: 600, fontSize: "20px", color: isDark ? "white" : "#0f172a", letterSpacing: "-0.5px" }}>Escala</span>
                                <span style={{ fontWeight: 900, fontSize: "20px", color: "#3b82f6", letterSpacing: "-0.5px" }}>Digital</span>
                            </div>
                        </div>

                        <div>
                            <h1 style={{ fontSize: "56px", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", margin: "0 0 22px", color: isDark ? "white" : "#0f172a" }}>
                                Sessão<br />encerrada com <span style={{ background: "linear-gradient(90deg,#f87171,#fb7185)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>sucesso</span>
                            </h1>
                            <p style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#64748b", fontSize: "19px", lineHeight: 1.7, margin: 0, maxWidth: "620px" }}>
                                Seu acesso foi encerrado neste dispositivo. Em instantes você será redirecionado para fazer login novamente.
                            </p>
                        </div>
                    </div>

                    <div className="closing-col" style={{ flex: 0.8, display: "flex", justifyContent: "center", width: "100%" }}>
                        <section className="closing-box" style={{
                            width: "100%",
                            maxWidth: "460px",
                            background: isDark ? "rgba(255,255,255,0.05)" : "white",
                            backdropFilter: isDark ? "blur(32px)" : "none",
                            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(37,99,235,0.1)"}`,
                            borderRadius: "24px",
                            padding: "42px 36px",
                            boxShadow: isDark ? "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" : "0 20px 50px rgba(0,0,0,0.08)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "18px",
                            alignItems: "center",
                        }}>
                            <div style={{
                                width: "64px",
                                height: "64px",
                                borderRadius: "16px",
                                background: "linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 16px 30px rgba(239,68,68,0.35)",
                            }}>
                                <LogOut size={30} color="white" />
                            </div>

                            <h2 style={{ margin: "4px 0 0 0", fontSize: "28px", fontWeight: 900, letterSpacing: "-1px", color: isDark ? "white" : "#0f172a" }}>
                                Até logo
                            </h2>
                            <p style={{ margin: 0, textAlign: "center", color: isDark ? "rgba(255,255,255,0.55)" : "#64748b", fontWeight: 600 }}>
                                Redirecionando para o login...
                            </p>

                            <div style={{
                                width: "100%",
                                height: "6px",
                                borderRadius: "999px",
                                background: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.10)",
                                overflow: "hidden",
                                marginTop: "4px",
                            }}>
                                <div style={{
                                    width: "40%",
                                    height: "100%",
                                    background: "linear-gradient(90deg, #ef4444, #f43f5e)",
                                    animation: "loading 1.1s ease-in-out infinite",
                                }} />
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}
