"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
    BookOpen,
    LayoutGrid,
    Map,
    LogOut,
    PlusCircle,
    Home,
    Settings,
    User as UserIcon,
    Sun,
    Moon,
    ChevronLeft,
    ChevronRight,
    Play,
} from "lucide-react";

const creatorLinks = [
    { href: "/creator/dashboard", label: "Dashboard", icon: Home },
    { href: "/creator/courses", label: "Cursos", icon: BookOpen },
    { href: "/creator/trails", label: "Trilhas", icon: Map },
    { href: "/creator/settings", label: "Configurações", icon: Settings },
];

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    variant?: "student" | "creator";
}

export function Sidebar({ isCollapsed, onToggle, variant }: SidebarProps) {
    const [mounted, setMounted] = useState(false);
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const { setTheme, resolvedTheme } = useTheme();
    const { t } = useLanguage();
    const isDark = mounted && resolvedTheme === "dark";

    useEffect(() => {
        setMounted(true);
    }, []);

    const isCreator = variant ? variant === "creator" : user?.role === "CREATOR";
    const studentLinks = [
        { href: "/catalog", label: t("nav.courses"), icon: LayoutGrid },
        { href: "/trails", label: t("nav.trails"), icon: Map },
        { href: "/profile", label: t("nav.profile"), icon: UserIcon },
    ];
    const links = isCreator ? creatorLinks : studentLinks;
    const brandColor = isCreator ? "#9146FF" : "#3b82f6";
    const brandBg = isCreator ? "rgba(145, 70, 255, 0.12)" : "rgba(59, 130, 246, 0.15)";
    const brandBgLight = isCreator ? "rgba(145, 70, 255, 0.06)" : "rgba(59, 130, 246, 0.05)";

    const colors = {
        bg: "transparent",
        border: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
        text: isDark ? "#f8fafc" : "#0f172a",
        textMuted: isDark ? "rgba(255, 255, 255, 0.45)" : "#64748b",
        activeBg: isDark ? brandBg : brandBgLight,
        activeText: brandColor,
    };

    return (
        <motion.aside
            initial={false}
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: isDark ? "rgba(2, 6, 23, 0.4)" : "rgba(255, 255, 255, 0.4)",
                backdropFilter: "blur(10px)",
                borderRight: `1px solid ${colors.border}`,
                position: "relative",
                overflowX: "hidden"
            }}
        >

            {/* Sidebar Header with Toggle - Re-restored correctly inside sidebar */}
            <div style={{
                padding: "20px 14px",
                display: "flex",
                justifyContent: isCollapsed ? "center" : "flex-end",
                borderBottom: `1px solid ${colors.border}`,
                minHeight: "72px",
                alignItems: "center"
            }}>
                <button
                    onClick={onToggle}
                    style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
                        border: `1px solid ${colors.border}`,
                        color: colors.textMuted,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Nav Section */}
            <nav style={{ flex: 1, padding: "24px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {!isCollapsed && (
                    <div style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: colors.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                        padding: "0 14px",
                        marginBottom: "12px"
                    }}>
                        {t("nav.main")}
                    </div>
                )}

                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link key={href} href={href} style={{ textDecoration: "none" }}>
                            <motion.div
                                whileHover={{ x: 8 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px 14px",
                                    justifyContent: isCollapsed ? "center" : "flex-start",
                                    borderRadius: "12px",
                                    fontSize: "14px",
                                    fontWeight: isActive ? 800 : 600,
                                    color: isActive ? colors.activeText : colors.text,
                                    background: isActive ? colors.activeBg : "transparent",
                                    border: `1px solid ${isActive ? colors.activeText + "20" : "transparent"}`,
                                    transition: "all 0.2s ease",
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            width: "4px",
                                            height: "60%",
                                            background: colors.activeText,
                                            borderRadius: "0 4px 4px 0",
                                            boxShadow: `0 0 15px ${colors.activeText}`
                                        }}
                                    />
                                )}
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} style={{
                                    transition: "all 0.3s ease",
                                    color: isActive ? colors.activeText : (isDark ? "white" : "black"),
                                    opacity: isActive ? 1 : 0.6
                                }} />
                                {!isCollapsed && <span style={{ whiteSpace: "nowrap" }}>{label}</span>}
                            </motion.div>
                        </Link>
                    );
                })}

                {isCreator && (
                    <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: `1px solid ${colors.border}` }}>
                        <Link
                            href="/creator/courses/new"
                            title={isCollapsed ? "Novo Curso" : ""}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px",
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: 700,
                                textDecoration: "none",
                                color: "white",
                                background: colors.activeText,
                                boxShadow: `0 8px 16px ${colors.activeText}40`,
                                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                justifyContent: isCollapsed ? "center" : "flex-start",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
                                e.currentTarget.style.boxShadow = `0 12px 24px ${colors.activeText}60`;
                                e.currentTarget.style.filter = "brightness(1.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1) translateY(0)";
                                e.currentTarget.style.boxShadow = `0 8px 16px ${colors.activeText}40`;
                                e.currentTarget.style.filter = "brightness(1)";
                            }}
                        >
                            <PlusCircle size={18} />
                            {!isCollapsed && <span style={{ whiteSpace: "nowrap" }}>Novo Curso</span>}
                        </Link>
                    </div>
                )}
            </nav>

            {/* Premium Bottom Sidebar Restored Exactly as requested */}
            <div style={{ padding: "24px 14px", borderTop: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>

                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        justifyContent: isCollapsed ? "center" : "flex-start",
                        cursor: "pointer",
                        color: colors.text,
                        fontSize: "13px",
                        fontWeight: 600,
                        transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}
                >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    {!isCollapsed && <span>{isDark ? t("nav.lightMode") : t("nav.darkMode")}</span>}
                </button>

                {/* Profile Box - "The requested style" */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    borderRadius: "16px",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    border: `1px solid ${colors.border}`,
                    transition: "all 0.3s ease"
                }}>
                    <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: colors.activeText,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 800,
                        color: "white",
                        flexShrink: 0,
                        boxShadow: isCreator ? "0 4px 10px rgba(145, 70, 255, 0.3)" : "0 4px 10px rgba(59, 130, 246, 0.3)"
                    }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    {!isCollapsed && (
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: colors.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {user?.name}
                            </div>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                {user?.role}
                            </div>
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <button
                    onClick={logout}
                    title={isCollapsed ? "Sair" : ""}
                    style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        background: "transparent",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        justifyContent: isCollapsed ? "center" : "flex-start",
                        cursor: "pointer",
                        color: "#ef4444",
                        fontSize: "13px",
                        fontWeight: 700,
                        transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                    <LogOut size={18} />
                    {!isCollapsed && <span>{t("nav.logout")}</span>}
                </button>
            </div>
        </motion.aside>
    );
}
