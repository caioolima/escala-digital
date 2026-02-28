"use client";

import { useEffect, useState } from "react";
import {
    User,
    Bell,
    Shield,
    // CreditCard removed (unused)
    LogOut,
    Camera,
    // Award, Clock removed (unused)
    BookOpen,
    Settings,
    ChevronRight,
    CheckCircle2,
    Laptop,
    Smartphone,
    } from "lucide-react";
import { useTheme } from "next-themes";
import { api } from "@/lib/api";
import { TrustedDevice, useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useLanguage } from "@/contexts/language-context";
import { Skeleton, SkeletonCircle } from "@/components/ui/skeleton";
import { finishLoadingWithMinimumDelay, MIN_SKELETON_MS } from "@/lib/skeleton-timing";
// useAuth already imported above; no duplicate imports

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

function PersonalDataForm({ user, colors, isDark }: { user: { name?: string; email?: string } | null; colors: Record<string, string>; isDark: boolean }) {
    const { updateProfile } = useAuth();
    const { showToast } = useToast();
    const [name, setName] = useState<string>(user?.name || "");
    const [email, setEmail] = useState<string>(user?.email || "");
    const [isSaving, setIsSaving] = useState(false);
    const initialName = user?.name || "";
    const initialEmail = user?.email || "";
    const hasChanges = name.trim() !== initialName.trim() || email.trim() !== initialEmail.trim();

    useEffect(() => {
        setName(user?.name || "");
        setEmail(user?.email || "");
    }, [user?.name, user?.email]);

    const onSave = async () => {
        if (!hasChanges) return;
        setIsSaving(true);
        try {
            await updateProfile?.({ name: name.trim(), email: email.trim() });
            showToast("Dados pessoais salvos com sucesso.", "success");
        } catch (e) {
            console.error("Failed to update profile", e);
            showToast("Erro ao salvar dados pessoais.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 800, color: colors.textMuted }}>NOME COMPLETO</label>
                <input value={name} onChange={e => setName(e.target.value)} style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "16px", fontWeight: 600 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: 800, color: colors.textMuted }}>E-MAIL</label>
                <input value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "16px", fontWeight: 600 }} />
            </div>
            <button disabled={isSaving || !hasChanges} onClick={onSave} style={{ marginTop: "12px", padding: "18px", borderRadius: "16px", background: colors.accent, color: "white", border: "none", fontWeight: 900, fontSize: "16px", cursor: (isSaving || !hasChanges) ? "not-allowed" : "pointer", opacity: (!hasChanges && !isSaving) ? 0.6 : 1, boxShadow: `0 12px 24px ${colors.accent}40` }}>{isSaving ? "Salvando..." : "Salvar Alterações"}</button>
        </div>
    );
}

export default function ProfilePage() {
    const { resolvedTheme, setTheme } = useTheme();
    const { user, logout, changePassword, getSettings, updateSettings, getTrustedDevices, revokeTrustedDevice } = useAuth();
    const { showToast } = useToast();
    const { setLanguage: setAppLanguage, t } = useLanguage();
    const isDark = resolvedTheme === "dark";
    type UserStats = { courses: string; completedLessons: string };
    const [userStats, setUserStats] = useState<UserStats>({
        courses: "00",
        completedLessons: "00"
    });
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [settings, setSettings] = useState<{ preferences?: any; notifications?: any } | null>(null);
    const defaultNotifications = { newCoursesEmail: true };
    const [notificationPrefs, setNotificationPrefs] = useState(defaultNotifications);
    const [initialNotificationPrefs, setInitialNotificationPrefs] = useState(defaultNotifications);
    const [language, setLanguage] = useState("pt-BR");
    const [initialLanguage, setInitialLanguage] = useState("pt-BR");
    const [preferredTheme, setPreferredTheme] = useState<"light" | "dark">(isDark ? "dark" : "light");
    const [initialPreferredTheme, setInitialPreferredTheme] = useState<"light" | "dark">(isDark ? "dark" : "light");
    const [enable2FA, setEnable2FA] = useState(false);
    const [initialEnable2FA, setInitialEnable2FA] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSavingNotifications, setIsSavingNotifications] = useState(false);
    const [isSavingPreferences, setIsSavingPreferences] = useState(false);
    const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
    const [isLoadingTrustedDevices, setIsLoadingTrustedDevices] = useState(false);
    const [revokingDeviceId, setRevokingDeviceId] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        // Fetch real stats from the backend (enrollments + course progress)
        const fetchStats = async () => {
            const startedAt = Date.now();
            setIsLoading(true);
            try {
                const enrollResp = await api.get('/enrollments/me');
                const enrollments: Array<{ courseId?: string; course?: { id?: string } }> = enrollResp.data || [];

                // For each enrolled course, get progress and aggregate
                const progressPromises = enrollments.map(async (en) => {
                    const courseId = en.courseId || en.course?.id;
                    if (!courseId) return { total: 0, completed: 0, percentage: 0 };
                    try {
                        const resp = await api.get(`/courses/${courseId}/progress`);
                        return resp.data || { total: 0, completed: 0, percentage: 0 };
                    } catch (e) {
                        console.warn('progress fetch failed for', courseId, e);
                        return { total: 0, completed: 0, percentage: 0 };
                    }
                });

                const progresses = await Promise.all(progressPromises);

                const activeCoursesCount = progresses.filter(p => (p.percentage ?? 0) < 100).length;
                const completedLessonsCount = progresses.reduce((acc, p) => acc + (p.completed ?? 0), 0);

                const stats: UserStats = {
                    courses: activeCoursesCount.toString().padStart(2, '0'),
                    completedLessons: completedLessonsCount.toString().padStart(2, '0')
                };

                setUserStats(stats);
                // keep a local cache for occasional offline dev
                try { localStorage.setItem('user_profile_stats', JSON.stringify(stats)); } catch { /* ignore */ }
            } catch (err) {
                console.error('Failed to fetch user stats', err);
                // fallback to cached stats if available
                try {
                    const cached = JSON.parse(localStorage.getItem('user_profile_stats') || 'null');
                    if (cached && cached.courses) setUserStats(cached as UserStats);
                } catch (e) {
                    console.warn('failed to read cached user_profile_stats', e);
                }
            } finally {
                finishLoadingWithMinimumDelay(startedAt, () => setIsLoading(false), MIN_SKELETON_MS);
            }
        };

        fetchStats();

        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await getSettings?.();
                const next = data || { preferences: null, notifications: null };
                setSettings(next);

                const loadedNotifications = {
                    newCoursesEmail: next.notifications?.newCoursesEmail ?? true,
                };
                setNotificationPrefs(loadedNotifications);
                setInitialNotificationPrefs(loadedNotifications);

                const loadedLanguage = next.preferences?.language ?? "pt-BR";
                const loadedTheme = (next.preferences?.theme === "light" || next.preferences?.theme === "dark") ? next.preferences.theme : (resolvedTheme === "dark" ? "dark" : "light");
                const loaded2FA = Boolean(next.preferences?.enable2FA ?? next.preferences?.security?.enable2FA ?? false);

                setLanguage(loadedLanguage);
                setAppLanguage(loadedLanguage as "pt-BR" | "en" | "es");
                setInitialLanguage(loadedLanguage);
                setPreferredTheme(loadedTheme);
                setInitialPreferredTheme(loadedTheme);
                setEnable2FA(loaded2FA);
                setInitialEnable2FA(loaded2FA);
            } catch (e) {
                console.warn("failed to load user settings", e);
            }
        };
        loadSettings();
    }, [getSettings, resolvedTheme]);

    useEffect(() => {
        if (activeSection !== "security") return;
        let isMounted = true;
        const loadTrustedDevices = async () => {
            setIsLoadingTrustedDevices(true);
            try {
                const devices = await getTrustedDevices?.();
                if (isMounted) {
                    setTrustedDevices(devices || []);
                }
            } catch (e) {
                console.error("Failed to load trusted devices", e);
                const status = (e as any)?.response?.status;
                const hasToken = typeof window !== "undefined" && Boolean(localStorage.getItem("access_token"));
                const isAuthRelated = status === 401 || status === 403 || !hasToken;
                if (isMounted && !isAuthRelated) {
                    showToast("Erro ao carregar dispositivos conectados.", "error");
                }
            } finally {
                if (isMounted) {
                    setIsLoadingTrustedDevices(false);
                }
            }
        };
        loadTrustedDevices();
        return () => {
            isMounted = false;
        };
    }, [activeSection, getTrustedDevices, showToast]);

    if (!mounted) {
        return (
            <div style={{ background: "var(--brand-bg)", minHeight: "100%", padding: "40px clamp(20px,5vw,60px) 100px" }}>
                <ProfileSkeleton isMobile={false} />
            </div>
        );
    }

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
        { id: "personal", icon: User, label: t("profile.personalData"), sub: "Nome, e-mail e foto" },
        { id: "security", icon: Shield, label: "Segurança", sub: "Alterar senha e 2FA" },
        { id: "notifications", icon: Bell, label: t("profile.notificationsTitle"), sub: "Alertas e e-mails" },
        { id: "preferences", icon: Settings, label: t("profile.preferencesTitle"), sub: "Idioma e tema" },
    ];

    const notificationItems = [
        { key: "newCoursesEmail", label: "E-mails de novos cursos" },
    ] as const;

    const hasNotificationChanges = JSON.stringify(notificationPrefs) !== JSON.stringify(initialNotificationPrefs);
    const hasPreferencesChanges = language !== initialLanguage || preferredTheme !== initialPreferredTheme;
    const hasSecurityChanges = enable2FA !== initialEnable2FA || currentPassword.length > 0 || newPassword.length > 0;
    const formatDeviceDate = (value: string) => new Date(value).toLocaleString("pt-BR");
    const getDeviceIcon = (deviceName: string) => /mobile|android|iphone|ipad/i.test(deviceName) ? Smartphone : Laptop;

    const handleSaveSecurity = async () => {
        if (!hasSecurityChanges) return;

        if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
            showToast("Preencha senha atual e nova senha.", "error");
            return;
        }

        if (newPassword && newPassword.length < 8) {
            showToast("A nova senha precisa ter no mínimo 8 caracteres.", "error");
            return;
        }

        setIsChangingPassword(true);
        try {
            if (currentPassword && newPassword) {
                await changePassword?.(currentPassword, newPassword);
            }

            if (enable2FA !== initialEnable2FA) {
                const updatedPreferences = { ...(settings?.preferences || {}), language, theme: preferredTheme, enable2FA };
                await updateSettings?.({ preferences: updatedPreferences });
                setSettings((prev) => ({ ...(prev || {}), preferences: updatedPreferences }));
                setInitialEnable2FA(enable2FA);
            }

            setCurrentPassword("");
            setNewPassword("");
            showToast("Configurações de segurança salvas.", "success");
        } catch (e) {
            console.error("Failed to update security settings", e);
            showToast("Erro ao salvar configurações de segurança.", "error");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleRevokeDevice = async (deviceId: string) => {
        setRevokingDeviceId(deviceId);
        try {
            await revokeTrustedDevice?.(deviceId);
            setTrustedDevices((prev) => prev.filter((device) => device.id !== deviceId));
            showToast("Dispositivo removido com sucesso.", "success");
        } catch (e) {
            console.error("Failed to revoke trusted device", e);
            showToast("Erro ao remover dispositivo.", "error");
        } finally {
            setRevokingDeviceId(null);
        }
    };

    const handleSaveNotifications = async () => {
        if (!hasNotificationChanges) return;
        setIsSavingNotifications(true);
        try {
            await updateSettings?.({ notifications: notificationPrefs });
            setInitialNotificationPrefs(notificationPrefs);
            setSettings((prev) => ({ ...(prev || {}), notifications: notificationPrefs }));
            showToast("Notificações salvas com sucesso.", "success");
        } catch (e) {
            console.error("Failed to update notification settings", e);
            showToast("Erro ao salvar notificações.", "error");
        } finally {
            setIsSavingNotifications(false);
        }
    };

    const handleSavePreferences = async () => {
        if (!hasPreferencesChanges) return;
        setIsSavingPreferences(true);
        try {
            const updatedPreferences = { ...(settings?.preferences || {}), language, theme: preferredTheme, enable2FA };
            await updateSettings?.({ preferences: updatedPreferences });
            setTheme(preferredTheme);
            setAppLanguage(language as "pt-BR" | "en" | "es");
            setInitialLanguage(language);
            setInitialPreferredTheme(preferredTheme);
            setSettings((prev) => ({ ...(prev || {}), preferences: updatedPreferences }));
            showToast("Preferências salvas com sucesso.", "success");
        } catch (e) {
            console.error("Failed to update preferences", e);
            showToast("Erro ao salvar preferências.", "error");
        } finally {
            setIsSavingPreferences(false);
        }
    };

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
                        <span style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "3px" }}>Configurações da Conta</span>
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
                                                {/* Personal data form */}
                                                <PersonalDataForm user={user} colors={colors} isDark={isDark} />
                                            </div>
                                        </div>
                                    )}

                                    {activeSection === "security" && (
                                        <div>
                                            <h3 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px" }}>Segurança</h3>
                                            <p style={{ color: colors.textMuted, marginBottom: "32px" }}>{t("profile.securityDesc")}</p>

                                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    <label style={{ fontSize: "14px", fontWeight: 800, color: colors.textMuted }}>{t("profile.currentPassword")}</label>
                                                    <input value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} type="password" placeholder="********" style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text }} />
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    <label style={{ fontSize: "14px", fontWeight: 800, color: colors.textMuted }}>{t("profile.newPassword")}</label>
                                                    <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder={t("profile.passwordMin")} style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text }} />
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", borderRadius: "20px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}` }}>
                                                    <div>
                                                        <div style={{ fontWeight: 800 }}>{t("profile.twoFactor")}</div>
                                                        <div style={{ fontSize: "13px", color: colors.textMuted }}>{t("profile.twoFactorDesc")}</div>
                                                    </div>
                                                    <button
                                                        onClick={() => setEnable2FA(prev => !prev)}
                                                        style={{
                                                            width: "48px",
                                                            height: "26px",
                                                            borderRadius: "100px",
                                                            background: enable2FA ? colors.accent : (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"),
                                                            position: "relative",
                                                            cursor: "pointer",
                                                            border: "none"
                                                        }}>
                                                        <div style={{
                                                            position: "absolute",
                                                            top: "3px",
                                                            right: enable2FA ? "3px" : "auto",
                                                            left: enable2FA ? "auto" : "3px",
                                                            width: "20px",
                                                            height: "20px",
                                                            borderRadius: "50%",
                                                            background: "white",
                                                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                                        }}></div>
                                                    </button>
                                                </div>
                                                <button onClick={handleSaveSecurity} disabled={isChangingPassword || !hasSecurityChanges} style={{
                                                    marginTop: "12px",
                                                    padding: "18px",
                                                    borderRadius: "16px",
                                                    background: colors.accent,
                                                    color: "white",
                                                    border: "none",
                                                    fontWeight: 900,
                                                    fontSize: "16px",
                                                    cursor: (isChangingPassword || !hasSecurityChanges) ? "not-allowed" : "pointer",
                                                    opacity: (!hasSecurityChanges && !isChangingPassword) ? 0.6 : 1,
                                                    boxShadow: `0 12px 24px ${colors.accent}40`
                                                }}>
                                                    {isChangingPassword ? "Salvando..." : t("profile.saveChanges")}
                                                </button>

                                                <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <h4 style={{ fontSize: "16px", fontWeight: 900, margin: 0 }}>Dispositivos conectados</h4>
                                                        <span style={{ fontSize: "12px", color: colors.textMuted }}>{trustedDevices.length} dispositivo(s)</span>
                                                    </div>

                                                    {isLoadingTrustedDevices ? (
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                            <Skeleton height={64} borderRadius="14px" />
                                                            <Skeleton height={64} borderRadius="14px" />
                                                        </div>
                                                    ) : trustedDevices.length === 0 ? (
                                                        <div style={{ padding: "14px 16px", borderRadius: "14px", border: `1px solid ${colors.border}`, color: colors.textMuted }}>
                                                            Nenhum dispositivo confiavel salvo ainda.
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                            {trustedDevices.map((device) => {
                                                                const Icon = getDeviceIcon(device.deviceName);
                                                                return (
                                                                    <div key={device.id} style={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "space-between",
                                                                        gap: "12px",
                                                                        padding: "14px",
                                                                        borderRadius: "14px",
                                                                        border: `1px solid ${colors.border}`,
                                                                        background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc"
                                                                    }}>
                                                                        <div style={{ display: "flex", gap: "12px", alignItems: "center", minWidth: 0 }}>
                                                                            <div style={{
                                                                                width: "36px",
                                                                                height: "36px",
                                                                                borderRadius: "10px",
                                                                                background: isDark ? "rgba(255,255,255,0.06)" : "white",
                                                                                border: `1px solid ${colors.border}`,
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                color: colors.accent
                                                                            }}>
                                                                                <Icon size={18} />
                                                                            </div>
                                                                            <div style={{ minWidth: 0 }}>
                                                                                <div style={{ fontWeight: 800, fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                                                    {device.deviceName} {device.isCurrent ? "(Atual)" : ""}
                                                                                </div>
                                                                                <div style={{ fontSize: "12px", color: colors.textMuted }}>
                                                                                    Ultimo acesso: {formatDeviceDate(device.lastSeenAt)}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleRevokeDevice(device.id)}
                                                                            disabled={revokingDeviceId === device.id}
                                                                            style={{
                                                                                border: "none",
                                                                                background: "rgba(239, 68, 68, 0.1)",
                                                                                color: "#ef4444",
                                                                                padding: "8px 10px",
                                                                                borderRadius: "10px",
                                                                                fontSize: "12px",
                                                                                fontWeight: 800,
                                                                                cursor: revokingDeviceId === device.id ? "not-allowed" : "pointer",
                                                                                opacity: revokingDeviceId === device.id ? 0.7 : 1
                                                                            }}
                                                                        >
                                                                            {revokingDeviceId === device.id ? "Removendo..." : "Desconectar"}
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeSection === "notifications" && (
                                        <div>
                                            <h3 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px" }}>{t("profile.notificationsTitle")}</h3>
                                            <p style={{ color: colors.textMuted, marginBottom: "32px" }}>{t("profile.notificationsDesc")}</p>

                                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                {notificationItems.map((item) => (
                                                    <div key={item.key} style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        padding: "20px",
                                                        borderRadius: "20px",
                                                        background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                                                        border: `1px solid ${colors.border}`
                                                    }}>
                                                        <span style={{ fontWeight: 700 }}>{item.label}</span>
                                                        <button onClick={() => setNotificationPrefs(prev => ({ ...prev, [item.key]: !prev[item.key] }))} style={{
                                                            width: "48px",
                                                            height: "26px",
                                                            borderRadius: "100px",
                                                            background: notificationPrefs[item.key] ? colors.accent : (isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"),
                                                            position: "relative",
                                                            cursor: "pointer",
                                                            border: "none"
                                                        }}>
                                                            <div style={{
                                                                position: "absolute",
                                                                top: "3px",
                                                                right: notificationPrefs[item.key] ? "3px" : "auto",
                                                                left: notificationPrefs[item.key] ? "auto" : "3px",
                                                                width: "20px",
                                                                height: "20px",
                                                                borderRadius: "50%",
                                                                background: "white",
                                                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                                            }}></div>
                                                        </button>
                                                    </div>
                                                ))}

                                                <button onClick={handleSaveNotifications} disabled={isSavingNotifications || !hasNotificationChanges} style={{
                                                    marginTop: "12px",
                                                    padding: "18px",
                                                    borderRadius: "16px",
                                                    background: colors.accent,
                                                    color: "white",
                                                    border: "none",
                                                    fontWeight: 900,
                                                    fontSize: "16px",
                                                    cursor: (isSavingNotifications || !hasNotificationChanges) ? "not-allowed" : "pointer",
                                                    opacity: (!hasNotificationChanges && !isSavingNotifications) ? 0.6 : 1
                                                }}>
                                                    {isSavingNotifications ? "Salvando..." : t("profile.saveChanges")}
                                                </button>
                                            </div>
                                        </div>
                                    )}


                                    {activeSection === "preferences" && (
                                        <div>
                                            <h3 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "8px" }}>{t("profile.preferencesTitle")}</h3>
                                            <p style={{ color: colors.textMuted, marginBottom: "32px" }}>{t("profile.preferencesDesc")}</p>

                                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    <label style={{ fontSize: "14px", fontWeight: 800, color: colors.textMuted }}>{t("profile.language")}</label>
                                                    <select value={language} onChange={e => { const next = e.target.value; setLanguage(next); setAppLanguage(next as "pt-BR" | "en" | "es"); }} style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontWeight: 600, WebkitTextFillColor: colors.text }}>
                                                        <option value="pt-BR" style={{ color: "#0f172a", background: "#ffffff" }}>Português (Brasil)</option>
                                                        <option value="en" style={{ color: "#0f172a", background: "#ffffff" }}>English</option>
                                                        <option value="es" style={{ color: "#0f172a", background: "#ffffff" }}>Espanol</option>
                                                    </select>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", borderRadius: "20px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}` }}>
                                                    <div>
                                                        <div style={{ fontWeight: 800 }}>{t("profile.darkMode")}</div>
                                                        <div style={{ fontSize: "13px", color: colors.textMuted }}>
                                                            {preferredTheme === "dark" ? t("profile.disableDarkMode") : t("profile.enableDarkMode")}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setPreferredTheme(prev => prev === "dark" ? "light" : "dark")}
                                                        style={{
                                                            width: "48px",
                                                            height: "26px",
                                                            borderRadius: "100px",
                                                            background: preferredTheme === "dark" ? colors.accent : "#e2e8f0",
                                                            position: "relative",
                                                            cursor: "pointer",
                                                            border: "none"
                                                        }}>
                                                        <div style={{
                                                            position: "absolute",
                                                            top: "3px",
                                                            right: preferredTheme === "dark" ? "3px" : "auto",
                                                            left: preferredTheme === "dark" ? "auto" : "3px",
                                                            width: "20px",
                                                            height: "20px",
                                                            borderRadius: "50%",
                                                            background: "white",
                                                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                                        }}></div>
                                                    </button>
                                                </div>

                                                <button onClick={handleSavePreferences} disabled={isSavingPreferences || !hasPreferencesChanges} style={{
                                                    marginTop: "12px",
                                                    padding: "18px",
                                                    borderRadius: "16px",
                                                    background: colors.accent,
                                                    color: "white",
                                                    border: "none",
                                                    fontWeight: 900,
                                                    fontSize: "16px",
                                                    cursor: (isSavingPreferences || !hasPreferencesChanges) ? "not-allowed" : "pointer",
                                                    opacity: (!hasPreferencesChanges && !isSavingPreferences) ? 0.6 : 1
                                                }}>
                                                    {isSavingPreferences ? "Salvando..." : t("profile.saveChanges")}
                                                </button>
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


