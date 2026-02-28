"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { useState, useEffect } from "react";
import { GraduationCap, Bell, MoreVertical, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CreatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { user, logout } = useAuth();
    const { resolvedTheme, setTheme } = useTheme();
    const pathname = usePathname();
    // Avoid hydration mismatch: theme is only reliable after mount.
    const isDark = mounted && resolvedTheme === "dark";

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Close menu when navigating
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const colors = {
        bg: "var(--brand-bg)",
        border: "var(--brand-border)",
        headerBg: "var(--brand-header)",
        text: "var(--brand-text)",
        textMuted: "var(--brand-text-muted)",
        accent: "var(--brand-accent)",
        cardBg: "var(--brand-card)",
    };

    const sidebarWidth = isCollapsed ? "80px" : "280px";

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            {/* GLOBAL HEADER */}
            <header style={{
                height: "72px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: isMobile ? "0 20px" : "0 32px",
                background: colors.headerBg,
                borderBottom: `1px solid ${colors.border}`,
                backdropFilter: "blur(20px)",
                flexShrink: 0,
                zIndex: 100
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                        width: isMobile ? "36px" : "42px",
                        height: isMobile ? "36px" : "42px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #9146FF 0%, #772CE8 100%)", // Twitch Purple
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 16px rgba(145, 70, 255, 0.4)",
                        flexShrink: 0,
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        <GraduationCap size={isMobile ? 18 : 22} color="white" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                        <div style={{ display: "flex", alignItems: "baseline" }}>
                            <span style={{ fontWeight: 500, fontSize: isMobile ? "18px" : "22px", color: colors.text }}>Escala</span>
                            <span style={{ fontWeight: 900, fontSize: isMobile ? "18px" : "22px", color: "#8b5cf6" }}>Digital</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "12px" : "24px" }}>
                    {!isMobile && (
                        <div style={{
                            padding: "6px 16px",
                            borderRadius: "100px",
                            background: "rgba(139, 92, 246, 0.1)",
                            border: "1px solid rgba(139, 92, 246, 0.2)",
                            color: "#8b5cf6",
                            fontSize: "12px",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                        }}>
                            Portal do Criador
                        </div>
                    )}

                    {isMobile && (
                        <button onClick={() => setIsMobileMenuOpen(true)} style={{ border: "none", color: colors.text, cursor: "pointer", background: "transparent" }}>
                            <MoreVertical size={24} />
                        </button>
                    )}

                    {!isMobile && (
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${colors.border}` }}>
                            <span style={{ fontSize: "14px", fontWeight: 800, color: "#8b5cf6" }}>{user?.name?.charAt(0)}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* CONTAINER PRINCIPAL */}
            <div className="flex flex-1 overflow-hidden">
                {!isMobile && (
                    <div style={{
                        width: sidebarWidth,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        background: colors.bg,
                        borderRight: `1px solid ${colors.border}`,
                        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        flexShrink: 0
                    }}>
                        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
                    </div>
                )}

                <main className="flex-1 overflow-y-auto bg-background custom-scroll">
                    {children}
                </main>
            </div>

            <style jsx global>{`
                .custom-scroll::-webkit-scrollbar { width: 6px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.10);
                    border-radius: 10px;
                }
                html.dark .custom-scroll::-webkit-scrollbar-thumb,
                body.dark .custom-scroll::-webkit-scrollbar-thumb,
                [data-theme="dark"] .custom-scroll::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.10);
                }
            `}</style>
        </div>
    );
}
