"use client";

import { useEffect, useState } from "react";
import {
    User,
    Bell,
    Shield,
    CreditCard,
    LogOut,
    Camera,
    Award,
    Clock,
    BookOpen,
    Settings,
    ChevronRight,
    Edit3
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/ui/skeleton";

function ProfileSkeleton({ isMobile }: { isMobile: boolean }) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr",
            gap: "40px",
            alignItems: "start"
        }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ background: "var(--brand-card)", borderRadius: "32px", padding: "40px 30px", border: "1px solid var(--brand-border)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <SkeletonCircle size={120} style={{ marginBottom: "24px" }} />
                    <Skeleton width="60%" height={24} style={{ marginBottom: "8px" }} />
                    <Skeleton width="40%" height={16} style={{ marginBottom: "24px" }} />
                    <Skeleton width="80%" height={28} borderRadius="100px" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "16px" }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} height={100} borderRadius="24px" />
                    ))}
                </div>
            </div>
            <div style={{ background: "var(--brand-card)", borderRadius: "32px", padding: "32px", border: "1px solid var(--brand-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
                    <Skeleton width="40%" height={24} />
                    <Skeleton width="20%" height={20} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{ display: "flex", gap: "20px", alignItems: "center", paddingBottom: "20px", borderBottom: i === 4 ? "none" : "1px solid var(--brand-border)" }}>
                            <Skeleton width={44} height={44} borderRadius="14px" />
                            <div style={{ flex: 1 }}>
                                <Skeleton width="30%" height={18} style={{ marginBottom: "6px" }} />
                                <Skeleton width="50%" height={14} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { resolvedTheme } = useTheme();
    const { user, logout } = useAuth();
    const isDark = resolvedTheme === "dark";
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        const timer = setTimeout(() => setIsLoading(false), 1200);

        return () => {
            window.removeEventListener("resize", checkMobile);
            clearTimeout(timer);
        };
    }, []);

    if (!mounted) return null;

    const colors = {
        bg: "var(--brand-bg)",
        cardBg: "var(--brand-card)",
        text: "var(--brand-text)",
        textMuted: "var(--brand-text-muted)",
        border: "var(--brand-border)",
        accent: "var(--brand-accent)",
        danger: "#ef4444"
    };

    const stats = [
        { icon: BookOpen, label: "Cursos Ativos", value: "12", color: "#3b82f6" },
        { icon: Award, label: "Certificados", value: "08", color: "#10b981" },
        { icon: Clock, label: "Horas de Estudo", value: "42h", color: "#f59e0b" },
    ];

    const menuItems = [
        { icon: User, label: "Dados Pessoais", sub: "Nome, e-mail e foto" },
        { icon: Shield, label: "Segurança", sub: "Alterar senha e 2FA" },
        { icon: Bell, label: "Notificações", sub: "Alertas e e-mails" },
        { icon: CreditCard, label: "Assinatura", sub: "Plano e pagamentos" },
        { icon: Settings, label: "Preferências", sub: "Idioma e tema" },
    ];

    return (
        <div style={{ background: colors.bg, minHeight: "100%", color: colors.text }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                * { font-family: 'Inter', sans-serif; }
            `}</style>

            <header style={{
                padding: isMobile ? "24px 20px" : "40px clamp(20px, 5vw, 80px)",
                background: `linear-gradient(to bottom, ${isDark ? "rgba(59,130,246,0.05)" : "rgba(59,130,246,0.02)"} 0%, transparent 100%)`
            }}>
                <h1 style={{ fontSize: isMobile ? "28px" : "36px", fontWeight: 900, letterSpacing: "-1.5px" }}>Meu Perfil</h1>
            </header>

            <main style={{ padding: isMobile ? "0 20px 60px" : "0 clamp(20px, 5vw, 80px) 80px" }}>
                {isLoading ? (
                    <ProfileSkeleton isMobile={isMobile} />
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr",
                        gap: "40px",
                        alignItems: "start"
                    }}>

                        {/* Left Panel: Identity */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <div style={{
                                background: colors.cardBg,
                                borderRadius: "32px",
                                border: `1px solid ${colors.border}`,
                                padding: "40px 30px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center"
                            }}>
                                <div style={{ position: "relative", marginBottom: "24px" }}>
                                    <div style={{
                                        width: "120px",
                                        height: "120px",
                                        borderRadius: "40px",
                                        background: isDark ? "#1e293b" : "#f1f5f9",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: `4px solid ${colors.bg}`,
                                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                                    }}>
                                        <span style={{ fontSize: "48px", fontWeight: 900, color: colors.accent }}>{user?.name?.charAt(0)}</span>
                                    </div>
                                    <button style={{
                                        position: "absolute",
                                        bottom: "-10px",
                                        right: "-10px",
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "14px",
                                        background: colors.accent,
                                        border: `3px solid ${colors.bg}`,
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        boxShadow: "0 10px 20px rgba(59,130,246,0.3)"
                                    }}>
                                        <Camera size={18} />
                                    </button>
                                </div>

                                <h2 style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-0.5px", marginBottom: "4px" }}>{user?.name}</h2>
                                <p style={{ color: colors.textMuted, fontSize: "14px", fontWeight: 500, marginBottom: "20px" }}>{user?.email}</p>

                                <div style={{
                                    padding: "6px 14px",
                                    borderRadius: "100px",
                                    background: isDark ? "rgba(59, 130, 246, 0.1)" : "#f0f7ff",
                                    color: colors.accent,
                                    fontSize: "11px",
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    letterSpacing: "1px"
                                }}>
                                    Membro Escala Digital Platinum
                                </div>
                            </div>

                            {/* Quick Stats Grid */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                                gap: "16px"
                            }}>
                                {stats.map(stat => (
                                    <div key={stat.label} style={{
                                        background: colors.cardBg,
                                        borderRadius: "24px",
                                        border: `1px solid ${colors.border}`,
                                        padding: "20px",
                                        textAlign: "center"
                                    }}>
                                        <div style={{ color: stat.color, marginBottom: "8px", display: "flex", justifyContent: "center" }}>
                                            <stat.icon size={20} />
                                        </div>
                                        <div style={{ fontSize: "18px", fontWeight: 900 }}>{stat.value}</div>
                                        <div style={{ fontSize: "10px", fontWeight: 800, color: colors.textMuted, textTransform: "uppercase", marginTop: "4px" }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Panel: Settings */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <div style={{
                                background: colors.cardBg,
                                borderRadius: "32px",
                                border: `1px solid ${colors.border}`,
                                padding: isMobile ? "24px" : "32px"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                                    <h3 style={{ fontSize: "20px", fontWeight: 900 }}>Configurações da Conta</h3>
                                    <button style={{
                                        background: "transparent",
                                        border: "none",
                                        color: colors.accent,
                                        fontSize: "14px",
                                        fontWeight: 800,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px"
                                    }}>
                                        <Edit3 size={16} /> Editar Tudo
                                    </button>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {menuItems.map((item, idx) => (
                                        <button
                                            key={item.label}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "20px",
                                                padding: "20px 0",
                                                background: "transparent",
                                                border: "none",
                                                borderBottom: idx === menuItems.length - 1 ? "none" : `1px solid ${colors.border}`,
                                                width: "100%",
                                                cursor: "pointer",
                                                textAlign: "left"
                                            }}
                                        >
                                            <div style={{
                                                width: "44px",
                                                height: "44px",
                                                borderRadius: "14px",
                                                background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: colors.textMuted,
                                                border: `1px solid ${colors.border}`
                                            }}>
                                                <item.icon size={20} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: "16px", fontWeight: 800, color: colors.text }}>{item.label}</div>
                                                <div style={{ fontSize: "13px", color: colors.textMuted, fontWeight: 500 }}>{item.sub}</div>
                                            </div>
                                            <ChevronRight size={20} color={colors.textMuted} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div style={{
                                background: isDark ? "rgba(239, 68, 68, 0.05)" : "#fef2f2",
                                borderRadius: "24px",
                                border: `1px solid ${isDark ? "rgba(239, 68, 68, 0.2)" : "#fee2e2"}`,
                                padding: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}>
                                <div>
                                    <h4 style={{ fontSize: "16px", fontWeight: 800, color: colors.danger }}>Encerrar Sessão</h4>
                                    <p style={{ fontSize: "13px", color: isDark ? "rgba(239, 68, 68, 0.7)" : "#ef4444", fontWeight: 500 }}>Você será desconectado deste dispositivo.</p>
                                </div>
                                <button
                                    onClick={logout}
                                    style={{
                                        padding: "12px 24px",
                                        borderRadius: "14px",
                                        background: colors.danger,
                                        color: "white",
                                        border: "none",
                                        fontWeight: 900,
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        boxShadow: "0 8px 16px rgba(239, 68, 68, 0.3)"
                                    }}
                                >
                                    <LogOut size={16} /> Sair agora
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
