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
    Edit3,
    CheckCircle2,
    RotateCcw
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
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
    const { showToast } = useToast();
    const isDark = resolvedTheme === "dark";
    const [userStats, setUserStats] = useState({
        courses: "00",
        completedLessons: "00"
    });
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        // Calculate real stats from localStorage
        try {
            const studentProgress: Record<string, number> = JSON.parse(localStorage.getItem("student_progress") || "{}");
            const activeCoursesCount = Object.keys(studentProgress).filter(id => (studentProgress[id] || 0) < 100).length;

            const completedLessons: Record<string, boolean> = JSON.parse(localStorage.getItem("student_completed_lessons") || "{}");
            const allCourses: any[] = JSON.parse(localStorage.getItem("creator_published_courses") || "[]");

            // Format status object

            const stats = {
                courses: activeCoursesCount.toString().padStart(2, '0'),
                completedLessons: Object.keys(completedLessons).length.toString().padStart(2, '0')
            };

            setUserStats(stats as any);
            localStorage.setItem("user_profile_stats", JSON.stringify(stats));
        } catch (e) {
            console.error("Failed to calc real stats", e);
        }

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
        { icon: BookOpen, label: "Cursos Ativos", value: userStats.courses, color: "#3b82f6" },
        { icon: CheckCircle2, label: "Aulas Concluídas", value: userStats.completedLessons || "00", color: "#10b981" },
    ];

    const menuItems = [
        { id: "personal", icon: User, label: "Dados Pessoais", sub: "Nome, e-mail e foto" },
        { id: "security", icon: Shield, label: "Segurança", sub: "Alterar senha e 2FA" },
        { id: "notifications", icon: Bell, label: "Notificações", sub: "Alertas e e-mails" },
        { id: "preferences", icon: Settings, label: "Preferências", sub: "Idioma e tema" },
    ];

    return (
        <div style={{ background: colors.bg, minHeight: "100%", color: colors.text }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                * { font-family: 'Inter', sans-serif; }
            `}</style>

            <header style={{
                padding: isMobile ? "60px 20px 40px" : "80px clamp(20px, 5vw, 80px) 60px",
                background: isDark
                    ? `radial-gradient(circle at 10% 20%, ${colors.accent}15 0%, transparent 50%), radial-gradient(circle at 90% 80%, ${colors.accent}10 0%, transparent 50%)`
                    : `radial-gradient(circle at 10% 20%, ${colors.accent}08 0%, transparent 50%), radial-gradient(circle at 90% 80%, ${colors.accent}05 0%, transparent 50%)`,
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: colors.accent, marginBottom: "12px" }}>
                        <div style={{ width: "32px", height: "2px", background: colors.accent }}></div>
                        <span style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "3px" }}>Configurações Pessoais</span>
                    </div>
                    <h1 style={{
                        fontSize: "clamp(32px, 5vw, 48px)",
                        fontWeight: 900,
                        letterSpacing: "-2.5px",
                        lineHeight: 1,
                        margin: 0,
                        color: colors.text
                    }}>Meu Perfil</h1>
                </div>

                {/* Ambient Decorative element */}
                <div style={{
                    position: "absolute",
                    top: "-20%",
                    right: "-10%",
                    width: "40%",
                    height: "140%",
                    background: `linear-gradient(135deg, ${colors.accent}08 0%, transparent 100%)`,
                    filter: "blur(120px)",
                    borderRadius: "50%",
                    pointerEvents: "none"
                }}></div>
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
                                background: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.7)",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                borderRadius: "32px",
                                border: `1px solid ${colors.border}`,
                                padding: "40px 30px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                boxShadow: isDark ? "0 25px 50px -12px rgba(0,0,0,0.5)" : "0 25px 50px -12px rgba(0,0,0,0.08)",
                                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-8px)";
                                    e.currentTarget.style.borderColor = colors.accent + "40";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.borderColor = colors.border;
                                }}
                            >
                                <div style={{ position: "relative", marginBottom: "24px" }}>
                                    <div style={{
                                        width: "140px",
                                        height: "140px",
                                        borderRadius: "48px",
                                        background: `linear-gradient(135deg, ${colors.accent}, #7c3aed)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: `6px solid ${isDark ? "#0f172a" : "#fff"}`,
                                        boxShadow: `0 20px 40px ${colors.accent}30`,
                                        transition: "all 0.5s ease"
                                    }}>
                                        <span style={{ fontSize: "56px", fontWeight: 900, color: "white" }}>{user?.name?.charAt(0)}</span>
                                    </div>
                                    <button style={{
                                        position: "absolute",
                                        bottom: "0",
                                        right: "0",
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "16px",
                                        background: colors.accent,
                                        border: `4px solid ${isDark ? "#0f172a" : "#fff"}`,
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                                        transition: "all 0.3s ease"
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1) rotate(10deg)"}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1) rotate(0deg)"}
                                    >
                                        <Camera size={20} />
                                    </button>
                                </div>

                                <h2 style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: "4px", color: colors.text }}>{user?.name}</h2>
                                <p style={{ color: colors.textMuted, fontSize: "15px", fontWeight: 600, marginBottom: "24px" }}>{user?.email}</p>

                                <div style={{
                                    padding: "8px 20px",
                                    borderRadius: "100px",
                                    background: colors.accent + "15",
                                    color: colors.accent,
                                    fontSize: "12px",
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    letterSpacing: "2px",
                                    border: `1px solid ${colors.accent}30`
                                }}>
                                    MATRÍCULA ATIVA • ALUNO DA {user?.company || "SUA EMPRESA"}
                                </div>
                            </div>

                            {/* Quick Stats Grid */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                                gap: "16px"
                            }}>
                                {stats.map(stat => (
                                    <div key={stat.label} style={{
                                        background: isDark ? "rgba(255, 255, 255, 0.02)" : "#fff",
                                        borderRadius: "28px",
                                        border: `1px solid ${colors.border}`,
                                        padding: "24px 16px",
                                        textAlign: "center",
                                        transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-5px) scale(1.02)";
                                            e.currentTarget.style.borderColor = stat.color + "40";
                                            e.currentTarget.style.boxShadow = `0 15px 30px ${stat.color}15`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0) scale(1)";
                                            e.currentTarget.style.borderColor = colors.border;
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        <div style={{
                                            width: "40px", height: "40px", borderRadius: "12px",
                                            background: stat.color + "15", color: stat.color,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            margin: "0 auto 12px"
                                        }}>
                                            <stat.icon size={20} />
                                        </div>
                                        <div style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.5px" }}>{stat.value}</div>
                                        <div style={{ fontSize: "10px", fontWeight: 800, color: colors.textMuted, textTransform: "uppercase", marginTop: "4px", letterSpacing: "1px" }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Panel: Settings / Active Section */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {!activeSection ? (
                                <div style={{
                                    background: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.7)",
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)",
                                    borderRadius: "32px",
                                    border: `1px solid ${colors.border}`,
                                    padding: isMobile ? "24px" : "40px",
                                    boxShadow: isDark ? "0 25px 50px -12px rgba(0,0,0,0.5)" : "0 25px 50px -12px rgba(0,0,0,0.08)"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                                        <h3 style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-1px" }}>Configurações da Conta</h3>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {menuItems.map((item) => (
                                            <button
                                                key={item.label}
                                                onClick={() => setActiveSection(item.id)}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "20px",
                                                    padding: "16px",
                                                    borderRadius: "20px",
                                                    background: "transparent",
                                                    border: `1px solid transparent`,
                                                    width: "100%",
                                                    cursor: "pointer",
                                                    textAlign: "left",
                                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "#fff";
                                                    e.currentTarget.style.borderColor = colors.border;
                                                    e.currentTarget.style.transform = "translateX(10px)";
                                                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.05)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = "transparent";
                                                    e.currentTarget.style.borderColor = "transparent";
                                                    e.currentTarget.style.transform = "translateX(0)";
                                                    e.currentTarget.style.boxShadow = "none";
                                                }}
                                            >
                                                <div style={{
                                                    width: "50px",
                                                    height: "50px",
                                                    borderRadius: "16px",
                                                    background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: colors.accent,
                                                    border: `1px solid ${colors.border}`,
                                                    transition: "all 0.3s ease"
                                                }}>
                                                    <item.icon size={22} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: "17px", fontWeight: 800, color: colors.text }}>{item.label}</div>
                                                    <div style={{ fontSize: "13px", color: colors.textMuted, fontWeight: 500 }}>{item.sub}</div>
                                                </div>
                                                <ChevronRight size={20} color={colors.textMuted} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    background: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.7)",
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)",
                                    borderRadius: "32px",
                                    border: `1px solid ${colors.border}`,
                                    padding: isMobile ? "24px" : "40px",
                                    boxShadow: isDark ? "0 25px 50px -12px rgba(0,0,0,0.5)" : "0 25px 50px -12px rgba(0,0,0,0.08)",
                                    minHeight: "400px",
                                    display: "flex",
                                    flexDirection: "column"
                                }}>
                                    <button
                                        onClick={() => setActiveSection(null)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            background: "transparent",
                                            border: "none",
                                            color: colors.textMuted,
                                            fontWeight: 800,
                                            fontSize: "14px",
                                            cursor: "pointer",
                                            marginBottom: "32px",
                                            padding: 0
                                        }}
                                    >
                                        <ChevronRight size={18} style={{ transform: "rotate(180deg)" }} /> Voltar para o menu
                                    </button>

                                    {activeSection === "personal" && (
                                        <div>
                                            <h3 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px" }}>Dados Pessoais</h3>
                                            <p style={{ color: colors.textMuted, marginBottom: "32px" }}>Atualize suas informações de contato e foto do perfil.</p>

                                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    <label style={{ fontSize: "14px", fontWeight: 800, color: colors.textMuted }}>NOME COMPLETO</label>
                                                    <input
                                                        defaultValue={user?.name}
                                                        style={{
                                                            padding: "16px",
                                                            borderRadius: "14px",
                                                            background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                                                            border: `1px solid ${colors.border}`,
                                                            color: colors.text,
                                                            fontSize: "16px",
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    <label style={{ fontSize: "14px", fontWeight: 800, color: colors.textMuted }}>E-MAIL</label>
                                                    <input
                                                        defaultValue={user?.email}
                                                        style={{
                                                            padding: "16px",
                                                            borderRadius: "14px",
                                                            background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                                                            border: `1px solid ${colors.border}`,
                                                            color: colors.text,
                                                            fontSize: "16px",
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </div>
                                                <button style={{
                                                    marginTop: "12px",
                                                    padding: "18px",
                                                    borderRadius: "16px",
                                                    background: colors.accent,
                                                    color: "white",
                                                    border: "none",
                                                    fontWeight: 900,
                                                    fontSize: "16px",
                                                    cursor: "pointer",
                                                    boxShadow: `0 12px 24px ${colors.accent}40`
                                                }}>
                                                    Salvar Alterações
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeSection === "security" && (
                                        <div>
                                            <h3 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px" }}>Segurança</h3>
                                            <p style={{ color: colors.textMuted, marginBottom: "32px" }}>Mantenha sua conta protegida alterando sua senha regularmente.</p>

                                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    <label style={{ fontSize: "14px", fontWeight: 800, color: colors.textMuted }}>SENHA ATUAL</label>
                                                    <input type="password" placeholder="••••••••" style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text }} />
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    <label style={{ fontSize: "14px", fontWeight: 800, color: colors.textMuted }}>NOVA SENHA</label>
                                                    <input type="password" placeholder="Mínimo 8 caracteres" style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text }} />
                                                </div>
                                                <button style={{
                                                    marginTop: "12px",
                                                    padding: "18px",
                                                    borderRadius: "16px",
                                                    background: colors.text,
                                                    color: isDark ? "#000" : "#fff",
                                                    border: "none",
                                                    fontWeight: 900,
                                                    fontSize: "16px",
                                                    cursor: "pointer"
                                                }}>
                                                    Atualizar Senha
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeSection === "notifications" && (
                                        <div>
                                            <h3 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px" }}>Notificações</h3>
                                            <p style={{ color: colors.textMuted, marginBottom: "32px" }}>Escolha como e quando você quer ser notificado.</p>

                                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                {["E-mails de novos cursos", "Alertas de certificados", "Novidades da plataforma"].map((label, i) => (
                                                    <div key={label} style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        padding: "20px",
                                                        borderRadius: "20px",
                                                        background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                                                        border: `1px solid ${colors.border}`
                                                    }}>
                                                        <span style={{ fontWeight: 700 }}>{label}</span>
                                                        <div style={{
                                                            width: "48px",
                                                            height: "26px",
                                                            borderRadius: "100px",
                                                            background: i < 2 ? colors.accent : (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"),
                                                            position: "relative",
                                                            cursor: "pointer"
                                                        }}>
                                                            <div style={{
                                                                position: "absolute",
                                                                top: "3px",
                                                                right: i < 2 ? "3px" : "auto",
                                                                left: i < 2 ? "auto" : "3px",
                                                                width: "20px",
                                                                height: "20px",
                                                                borderRadius: "50%",
                                                                background: "white",
                                                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                                            }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}


                                    {activeSection === "preferences" && (
                                        <div>
                                            <h3 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px" }}>Preferências</h3>
                                            <p style={{ color: colors.textMuted, marginBottom: "32px" }}>Personalize sua experiência na plataforma.</p>

                                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    <label style={{ fontSize: "14px", fontWeight: 800, color: colors.textMuted }}>IDIOma</label>
                                                    <select style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontWeight: 600 }}>
                                                        <option>Português (Brasil)</option>
                                                        <option>English</option>
                                                        <option>Español</option>
                                                    </select>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", borderRadius: "20px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}` }}>
                                                    <div>
                                                        <div style={{ fontWeight: 800 }}>Modo Noturno</div>
                                                        <div style={{ fontSize: "13px", color: colors.textMuted }}>Mudar aparência da plataforma</div>
                                                    </div>
                                                    <button
                                                        onClick={() => useTheme().setTheme(isDark ? "light" : "dark")}
                                                        style={{
                                                            width: "48px",
                                                            height: "26px",
                                                            borderRadius: "100px",
                                                            background: isDark ? colors.accent : "#e2e8f0",
                                                            position: "relative",
                                                            cursor: "pointer",
                                                            border: "none"
                                                        }}>
                                                        <div style={{
                                                            position: "absolute",
                                                            top: "3px",
                                                            right: isDark ? "3px" : "auto",
                                                            left: isDark ? "auto" : "3px",
                                                            width: "20px",
                                                            height: "20px",
                                                            borderRadius: "50%",
                                                            background: "white",
                                                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                                        }}></div>
                                                    </button>
                                                </div>

                                                <div style={{ padding: "20px", borderRadius: "20px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", marginTop: "12px" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <div>
                                                            <div style={{ fontWeight: 800, color: "#ef4444" }}>Resetar Progresso</div>
                                                            <div style={{ fontSize: "12px", color: isDark ? "rgba(239, 68, 68, 0.7)" : "#ef4444" }}>Limpar todas as aulas concluídas e avaliações</div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm("Tem certeza que deseja limpar todo o seu progresso? Isso não pode ser desfeito.")) {
                                                                    localStorage.removeItem("student_completed_lessons");
                                                                    localStorage.removeItem("student_progress");
                                                                    localStorage.removeItem("user_profile_stats");
                                                                    localStorage.removeItem("student_watched_times");
                                                                    Object.keys(localStorage).forEach(key => {
                                                                        if (key.startsWith("course_finished_") || key.startsWith("course_evaluated_")) {
                                                                            localStorage.removeItem(key);
                                                                        }
                                                                    });
                                                                    showToast("Progresso Restaurado.", "info");
                                                                    setTimeout(() => window.location.reload(), 1500);
                                                                }
                                                            }}
                                                            style={{
                                                                padding: "10px 16px",
                                                                borderRadius: "12px",
                                                                background: "#ef4444",
                                                                color: "white",
                                                                border: "none",
                                                                fontWeight: 800,
                                                                fontSize: "13px",
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "8px"
                                                            }}
                                                        >
                                                            <RotateCcw size={14} /> Limpar Tudo
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Danger Zone */}
                            {!activeSection && (
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
                            )}
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
