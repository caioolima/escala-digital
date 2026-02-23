"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { useState, useEffect } from "react";
import { GraduationCap, Bell, MoreVertical, X, LayoutGrid, Map, User as UserIcon, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { user, logout } = useAuth();
    const { resolvedTheme, setTheme } = useTheme();
    const pathname = usePathname();
    const isDark = resolvedTheme === "dark";

    useEffect(() => {
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

    const studentLinks = [
        { href: "/catalog", label: "Catálogo", icon: LayoutGrid },
        { href: "/trails", label: "Trilhas", icon: Map },
        { href: "/profile", label: "Meu Perfil", icon: UserIcon },
    ];

    const sidebarWidth = isCollapsed ? "80px" : "280px";

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background" style={{ "--brand-accent": "#2563eb" } as React.CSSProperties}>

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
                        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 16px rgba(59, 130, 246, 0.4)",
                        flexShrink: 0,
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        <div style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
                            animation: "shimmer 3s infinite linear"
                        }} />
                        <GraduationCap size={isMobile ? 18 : 22} color="white" style={{ position: "relative", zIndex: 1 }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                        <div style={{ display: "flex", alignItems: "baseline" }}>
                            <span style={{
                                fontWeight: 500,
                                fontSize: isMobile ? "18px" : "22px",
                                color: colors.text,
                                letterSpacing: "-0.5px"
                            }}>
                                Escala
                            </span>
                            <span style={{
                                fontWeight: 900,
                                fontSize: isMobile ? "18px" : "22px",
                                color: colors.accent,
                                letterSpacing: "-0.5px"
                            }}>
                                Digital
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "12px" : "24px" }}>
                    {!isMobile && (
                        <div style={{
                            padding: "6px 16px",
                            borderRadius: "100px",
                            background: "rgba(59, 130, 246, 0.1)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                            color: colors.accent,
                            fontSize: "12px",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                        }}>
                            Portal do Aluno
                        </div>
                    )}

                    {!isMobile && (
                        <button style={{ background: "transparent", border: "none", color: colors.textMuted, cursor: "pointer" }}>
                            <Bell size={20} />
                        </button>
                    )}

                    {isMobile ? (
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            style={{
                                border: "none",
                                color: colors.text,
                                cursor: "pointer",
                                width: "40px",
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "10px",
                                background: colors.cardBg
                            }}
                        >
                            <MoreVertical size={24} />
                        </button>
                    ) : (
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${colors.border}` }}>
                            <span style={{ fontSize: "14px", fontWeight: 800, color: colors.accent }}>{user?.name?.charAt(0)}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* MOBILE MENU OVERLAY */}
            {isMobile && isMobileMenuOpen && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 1000,
                    background: isDark ? "#020617" : "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    padding: "24px",
                    animation: "slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                }}>
                    <style>{`
                        @keyframes slideIn {
                            from { transform: translateY(-100%); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                    `}</style>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "40px" }}>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "16px",
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                color: "#ef4444",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                        >
                            <X size={28} strokeWidth={2.5} />
                        </button>
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                        {studentLinks.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "20px",
                                    padding: "20px",
                                    borderRadius: "20px",
                                    fontSize: "20px",
                                    fontWeight: 800,
                                    textDecoration: "none",
                                    color: pathname === href ? colors.accent : colors.text,
                                    background: pathname === href ? "rgba(59, 130, 246, 0.1)" : colors.cardBg,
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <Icon size={28} />
                                {label}
                            </Link>
                        ))}
                    </div>

                    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "20px" }}>
                        <button
                            onClick={() => setTheme(isDark ? "light" : "dark")}
                            style={{
                                width: "100%",
                                padding: "18px",
                                borderRadius: "16px",
                                background: colors.cardBg,
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                cursor: "pointer",
                                color: colors.text,
                                fontSize: "16px",
                                fontWeight: 700
                            }}
                        >
                            {isDark ? <Sun size={24} /> : <Moon size={24} />}
                            <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>
                        </button>

                        <button
                            onClick={logout}
                            style={{
                                width: "100%",
                                padding: "18px",
                                borderRadius: "16px",
                                background: "rgba(239, 68, 68, 0.05)",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                cursor: "pointer",
                                color: "#ef4444",
                                fontSize: "16px",
                                fontWeight: 800
                            }}
                        >
                            <LogOut size={24} />
                            <span>Sair da Conta</span>
                        </button>
                    </div>
                </div>
            )}

            {/* CONTAINER PRINCIPAL */}
            <div className="flex flex-1 overflow-hidden">

                {/* SIDEBAR COLUNA - HIDDEN ON MOBILE */}
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

                {/* AREA DE CONTEUDO */}
                <main className="flex-1 overflow-y-auto bg-background custom-scroll">
                    {children}
                </main>
            </div>

            <style jsx global>{`
                @keyframes shimmer {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
                .custom-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background: ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
                    border-radius: 10px;
                }
                .custom-scroll::-webkit-scrollbar-thumb:hover {
                    background: ${isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"};
                }
            `}</style>
        </div>
    );
}
