"use client";

import { useEffect, useState } from "react";
import {
    Settings,
    User,
    Shield,
    Bell,
    Palette,
    Check,
    ChevronRight,
    Camera,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

function CreatorSettingsSkeleton() {
    return (
        <div style={{ background: "var(--brand-bg)", minHeight: "100%", padding: "40px 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Skeleton width={18} height={18} borderRadius={6} />
                        <Skeleton width={200} height={12} borderRadius={999} />
                    </div>
                    <Skeleton width={260} height={40} borderRadius={14} />
                    <Skeleton width={560} height={16} borderRadius={10} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 28, alignItems: "start" }}>
                    <div style={{ borderRadius: 22, border: "1px solid var(--brand-border)", background: "var(--brand-card)", overflow: "hidden" }}>
                        <div style={{ padding: 18, borderBottom: "1px solid var(--brand-border)", display: "flex", flexDirection: "column", gap: 10 }}>
                            <Skeleton width={180} height={16} borderRadius={10} />
                            <Skeleton width={140} height={12} borderRadius={10} />
                        </div>
                        <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} height={48} borderRadius={16} />
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        <div style={{ borderRadius: 22, border: "1px solid var(--brand-border)", background: "var(--brand-card)" }}>
                            <div style={{ padding: 18, borderBottom: "1px solid var(--brand-border)" }}>
                                <Skeleton width={220} height={18} borderRadius={10} />
                            </div>
                            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                                <Skeleton width={140} height={12} borderRadius={10} />
                                <Skeleton height={48} borderRadius={12} />
                                <Skeleton width={140} height={12} borderRadius={10} style={{ marginTop: 8 }} />
                                <Skeleton height={48} borderRadius={12} />
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                            <Skeleton width={160} height={44} borderRadius={14} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CreatorSettingsPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const { user, updateProfile, getSettings, updateSettings, changePassword } = useAuth();
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profile");
    const [isSaving, setIsSaving] = useState(false);

    // Initial States (for comparison)
    const [initialSettings, setInitialSettings] = useState<any>(null);

    // Settings States
    const [profile, setProfile] = useState({
        name: user?.name || "Criador",
    });

    const [platform, setPlatform] = useState({
        logo: ""
    });

    const [security, setSecurity] = useState({
        currentPassword: "",
        newPassword: "",
        enable2FA: false
    });

    const [notifications, setNotifications] = useState({
        newEnrollments: true,
        performanceReports: true
    });

    useEffect(() => {
        setMounted(true);
        const load = async () => {
            setIsLoading(true);
            try {
                const settings = await getSettings?.();
                const prefs = settings?.preferences || {};
                const nextProfile = {
                    name: user?.name || "Criador",
                };
                const nextPlatform = { logo: prefs.platform?.logo || "" };
                const nextNotifications = {
                    newEnrollments: settings?.notifications?.newEnrollments ?? true,
                    performanceReports: settings?.notifications?.performanceReports ?? true,
                };
                setProfile(nextProfile);
                setPlatform(nextPlatform);
                setNotifications(nextNotifications);
                setSecurity((prev) => ({ ...prev, enable2FA: Boolean(prefs.enable2FA ?? false) }));
                setInitialSettings({
                    profile: nextProfile,
                    platform: nextPlatform,
                    notifications: nextNotifications,
                    security: { enable2FA: Boolean(prefs.enable2FA ?? false) },
                });
            } catch (e) {
                console.error("Failed to load creator settings", e);
                const defaults = {
                    profile: { name: user?.name || "Criador" },
                    platform: { logo: "" },
                    notifications: { newEnrollments: true, performanceReports: true },
                    security: { enable2FA: false },
                };
                setInitialSettings(defaults);
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, [user]);

    if (!mounted) return <CreatorSettingsSkeleton />;
    if (isLoading || !initialSettings) return <CreatorSettingsSkeleton />;

    const handleSave = () => {
        const save = async () => {
            setIsSaving(true);
            try {
                if (activeTab === "profile") {
                    await updateProfile?.({ name: profile.name });
                    await updateSettings?.({ preferences: { platform: { logo: platform.logo }, enable2FA: security.enable2FA } });
                } else if (activeTab === "platform") {
                    await updateSettings?.({ preferences: { platform: { logo: platform.logo }, enable2FA: security.enable2FA } });
                } else if (activeTab === "notifications") {
                    await updateSettings?.({ notifications });
                } else if (activeTab === "security") {
                    if (security.currentPassword && security.newPassword) {
                        await changePassword?.(security.currentPassword, security.newPassword);
                    }
                    await updateSettings?.({ preferences: { platform: { logo: platform.logo }, enable2FA: security.enable2FA } });
                    setSecurity((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
                }

                const settingsData = { profile, platform, notifications, security: { enable2FA: security.enable2FA } };
                setInitialSettings(settingsData);
                toast("Configurações salvas!", "success", "Suas alterações foram aplicadas com sucesso.");
            } catch (e) {
                console.error("Failed to save creator settings", e);
                toast("Erro ao salvar", "error", "Tente novamente em instantes.");
            } finally {
                setIsSaving(false);
            }
        };
        void save();
    };

    // Helper to check if a section has changes
    const hasChanges = (section: string) => {
        if (!initialSettings) return false;

        if (section === "profile") {
            return JSON.stringify(profile) !== JSON.stringify(initialSettings.profile);
        }
        if (section === "platform") {
            return JSON.stringify(platform) !== JSON.stringify(initialSettings.platform);
        }
        if (section === "notifications") {
            return JSON.stringify(notifications) !== JSON.stringify(initialSettings.notifications);
        }
        if (section === "security") {
            // Security handles passwords which aren't stored, so we check if fields are non-empty
            return (security.currentPassword.length > 0 && security.newPassword.length > 0) || security.enable2FA !== (initialSettings.security?.enable2FA || false);
        }
        return false;
    };

    const colors = {
        bg: "var(--brand-bg)",
        card: "var(--brand-card)",
        border: "var(--brand-border)",
        text: "var(--brand-text)",
        textMuted: "var(--brand-text-muted)"
    };

    const sections = [
        { id: "profile", label: "Perfil do Criador", icon: User },
        { id: "platform", label: "Customização da Plataforma", icon: Palette },
        { id: "security", label: "Segurança & Acesso", icon: Shield },
        { id: "notifications", label: "Notificações", icon: Bell },
    ];

    return (
        <div style={{ background: colors.bg, minHeight: "100%", padding: "40px 24px" }}>
            <style>{`
                .settings-shell { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 28px; }
                .settings-grid { display: grid; grid-template-columns: 320px 1fr; gap: 28px; align-items: start; }
                @media (max-width: 980px) { .settings-grid { grid-template-columns: 1fr; } }

                .settings-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
                .settings-kicker { display: inline-flex; align-items: center; gap: 8px; color: #9146FF; margin-bottom: 8px; }
                .settings-title { font-size: 36px; font-weight: 900; color: var(--brand-text); letter-spacing: -1.5px; margin: 0; }
                .settings-sub { font-size: 14px; color: var(--brand-text-muted); font-weight: 500; margin-top: 8px; max-width: 560px; line-height: 1.6; }

                .nav-card { border-radius: 22px; border: 1px solid var(--brand-border); background: var(--brand-card); overflow: hidden; }
                .nav-top { padding: 18px 18px 14px; border-bottom: 1px solid var(--brand-border); display: flex; flex-direction: column; gap: 10px; }
                .nav-meta { display: flex; flex-direction: column; gap: 2px; }
                .nav-name { font-size: 14px; font-weight: 900; color: var(--brand-text); margin: 0; }
                .nav-company { font-size: 12px; font-weight: 700; color: var(--brand-text-muted); margin: 0; }

                .nav-list { padding: 10px; display: flex; flex-direction: column; gap: 6px; }
                .nav-btn {
                    display: flex; align-items: center; gap: 12px;
                    padding: 14px 14px;
                    border-radius: 16px;
                    background: transparent;
                    border: 1px solid transparent;
                    color: var(--brand-text-muted);
                    font-size: 14px;
                    font-weight: 800;
                    text-align: left;
                    cursor: pointer;
                    transition: background 0.16s ease, transform 0.16s ease, border-color 0.16s ease;
                }
                .nav-btn:hover { transform: translateY(-1px); border-color: var(--brand-border); background: rgba(145,70,255,0.06); }
                .nav-btn.active { background: rgba(145, 70, 255, 0.10); border-color: rgba(145,70,255,0.25); color: #9146FF; }

                .content-col { display: flex; flex-direction: column; gap: 18px; }

                .field-label { font-size: 11px; font-weight: 900; color: var(--brand-text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
                .field-input {
                    width: 100%; height: 48px; padding: 0 16px; border-radius: 12px;
                    background: ${isDark ? "rgba(255,255,255,0.03)" : "#f8fafc"};
                    border: 1px solid var(--brand-border);
                    color: var(--brand-text);
                    font-size: 14px;
                    font-weight: 600;
                    outline: none;
                }
            `}</style>

            <div className="settings-shell">

                <div className="settings-header">
                    <div>
                        <div className="settings-kicker">
                            <Settings size={18} />
                            <span style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1.5px" }}>Configurações do Sistema</span>
                        </div>
                        <h1 className="settings-title">Configurações</h1>
                        <p className="settings-sub">
                            Ajuste perfil, notificações e segurança. Estas alterações se aplicam à sua conta e à experiência da sua companhia.
                        </p>
                    </div>
                </div>

                <div className="settings-grid">
                    {/* Navigation Sidebar */}
                    <div className="nav-card">
                        <div className="nav-top">
                            <div className="nav-meta">
                                <p className="nav-name">{user?.name || "Criador"}</p>
                                <p className="nav-company">{user?.company || "Companhia"}</p>
                            </div>
                        </div>
                        <div className="nav-list">
                            {sections.map((section) => {
                                const active = activeTab === section.id;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveTab(section.id)}
                                        className={"nav-btn" + (active ? " active" : "")}
                                    >
                                        <section.icon size={18} strokeWidth={active ? 2.5 : 2} />
                                        {section.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Settings Content */}
                    <div className="content-col">
                        {activeTab === "profile" && (
                            <Card style={{ borderRadius: "24px", border: `1px solid ${colors.border}`, background: colors.card, overflow: "hidden" }}>
                                <CardHeader style={{ padding: "32px 32px 0" }}>
                                    <CardTitle style={{ fontSize: "18px", fontWeight: 900 }}>Informações Públicas</CardTitle>
                                </CardHeader>
                                <CardContent style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                                        <div style={{
                                            width: "80px", height: "80px", borderRadius: "24px",
                                            background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            position: "relative", border: `1px solid ${colors.border}`
                                        }}>
                                            <User size={32} color={colors.textMuted} />
                                            <button
                                                disabled
                                                title="Upload de avatar (em breve)"
                                                style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "32px", height: "32px", borderRadius: "10px", background: "#9146FF", color: "white", border: "4px solid " + colors.card, cursor: "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6 }}
                                            >
                                                <Camera size={14} />
                                            </button>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label className="field-label">Nome do Criador</label>
                                            <input
                                                value={profile.name}
                                                onChange={e => setProfile({ ...profile, name: e.target.value })}
                                                className="field-input"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="field-label">Companhia</label>
                                        <div style={{ width: "100%", minHeight: "48px", padding: "12px 16px", borderRadius: "12px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center" }}>
                                            {user?.company || "—"}
                                        </div>
                                        <p style={{ margin: "8px 0 0", fontSize: "12px", color: colors.textMuted, fontWeight: 600 }}>
                                            O avatar vai aparecer aqui assim que o upload de imagem estiver pronto.
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "24px", marginTop: "8px", borderTop: `1px solid ${colors.border}` }}>
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving || !hasChanges("profile")}
                                            style={{ background: "#9146FF", borderRadius: "10px", height: "40px", padding: "0 20px", fontWeight: 700, fontSize: "13px", opacity: (!hasChanges("profile") && !isSaving) ? 0.5 : 1 }}
                                        >
                                            {isSaving ? "Salvando..." : <><Check size={16} className="mr-2" /> Salvar Alterações</>}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === "platform" && (
                            <Card style={{ borderRadius: "24px", border: `1px solid ${colors.border}`, background: colors.card, overflow: "hidden" }}>
                                <CardHeader style={{ padding: "32px 32px 0" }}>
                                    <CardTitle style={{ fontSize: "18px", fontWeight: 900 }}>Identidade Visual</CardTitle>
                                </CardHeader>
                                <CardContent style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                                    <div style={{ padding: "12px 0 24px" }}>
                                        <p style={{ fontSize: "14px", color: colors.textMuted, margin: 0, lineHeight: 1.5 }}>
                                            Personalize a aparência da sua plataforma para alinhar com a identidade da sua marca.
                                        </p>
                                    </div>
                                    <div style={{ padding: "20px", borderRadius: "16px", background: "#9146FF10", border: "1px dashed #9146FF40", display: "flex", alignItems: "center", gap: "24px" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#9146FF", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                                            <Palette size={20} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: "14px", fontWeight: 800, color: colors.text, margin: 0 }}>Logo da Empresa</h4>
                                            <p style={{ fontSize: "12px", color: colors.textMuted, margin: 0 }}>Recomendado: SVG ou PNG transparente (512x512px)</p>
                                        </div>
                                        <Button variant="outline" style={{ borderRadius: "10px", fontWeight: 700, padding: "0 24px", height: "44px" }}>Upload</Button>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "24px", marginTop: "8px", borderTop: `1px solid ${colors.border}` }}>
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving || !hasChanges("platform")}
                                            style={{ background: "#9146FF", borderRadius: "10px", height: "40px", padding: "0 20px", fontWeight: 700, fontSize: "13px", opacity: (!hasChanges("platform") && !isSaving) ? 0.5 : 1 }}
                                        >
                                            {isSaving ? "Salvando..." : <><Check size={16} className="mr-2" /> Salvar Alterações</>}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === "security" && (
                            <Card style={{ borderRadius: "24px", border: `1px solid ${colors.border}`, background: colors.card, overflow: "hidden" }}>
                                <CardHeader style={{ padding: "32px 32px 0" }}>
                                    <CardTitle style={{ fontSize: "18px", fontWeight: 900 }}>Segurança da Conta</CardTitle>
                                </CardHeader>
                                <CardContent style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                        <div>
                                            <label style={{ fontSize: "11px", fontWeight: 900, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", display: "block" }}>Senha Atual</label>
                                            <input
                                                type="password"
                                                placeholder="Sua senha atual"
                                                style={{ width: "100%", height: "48px", padding: "0 16px", borderRadius: "12px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "14px", fontWeight: 600, outline: "none" }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "11px", fontWeight: 900, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", display: "block" }}>Nova Senha</label>
                                            <input
                                                type="password"
                                                placeholder="Min. 8 caracteres"
                                                style={{ width: "100%", height: "48px", padding: "0 16px", borderRadius: "12px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "14px", fontWeight: 600, outline: "none" }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", borderRadius: "16px", background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc", border: `1px solid ${colors.border}` }}>
                                        <div>
                                            <h4 style={{ fontSize: "14px", fontWeight: 800, color: colors.text, margin: 0 }}>Autenticação em Duas Etapas (2FA)</h4>
                                            <p style={{ fontSize: "12px", color: colors.textMuted, margin: 0 }}>Adicione uma camada extra de segurança à sua conta.</p>
                                        </div>
                                        <button
                                            onClick={() => setSecurity({ ...security, enable2FA: !security.enable2FA })}
                                            style={{
                                                width: "48px", height: "24px", borderRadius: "12px",
                                                background: security.enable2FA ? "#10b981" : colors.border,
                                                border: "none", cursor: "pointer", position: "relative",
                                                transition: "all 0.2s ease"
                                            }}>
                                            <div style={{
                                                width: "18px", height: "18px", borderRadius: "50%", background: "white",
                                                position: "absolute", top: "3px", left: security.enable2FA ? "27px" : "3px",
                                                transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                                            }} />
                                        </button>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "24px", marginTop: "8px", borderTop: `1px solid ${colors.border}` }}>
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving || !hasChanges("security")}
                                            style={{ background: "#9146FF", borderRadius: "10px", height: "40px", padding: "0 20px", fontWeight: 700, fontSize: "13px", opacity: (!hasChanges("security") && !isSaving) ? 0.5 : 1 }}
                                        >
                                            {isSaving ? "Salvando..." : <><Check size={16} className="mr-2" /> Salvar Alterações</>}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === "notifications" && (
                            <Card style={{ borderRadius: "24px", border: `1px solid ${colors.border}`, background: colors.card, overflow: "hidden" }}>
                                <CardHeader style={{ padding: "32px 32px 0" }}>
                                    <CardTitle style={{ fontSize: "18px", fontWeight: 900 }}>Preferências de Notificação</CardTitle>
                                </CardHeader>
                                <CardContent style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {[
                                        { id: "newEnrollments", label: "Novas Matrículas", desc: "Receba alertas imediatos quando um aluno se inscrever." },
                                        { id: "performanceReports", label: "Relatórios de Performance", desc: "Resumo semanal do engajamento dos seus cursos." }
                                    ].map((item) => (
                                        <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", borderRadius: "16px", border: `1px solid ${colors.border}` }}>
                                            <div>
                                                <h4 style={{ fontSize: "14px", fontWeight: 800, color: colors.text, margin: 0 }}>{item.label}</h4>
                                                <p style={{ fontSize: "12px", color: colors.textMuted, margin: 0 }}>{item.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] })}
                                                style={{
                                                    width: "48px", height: "24px", borderRadius: "12px",
                                                    background: notifications[item.id as keyof typeof notifications] ? "#9146FF" : colors.border,
                                                    border: "none", cursor: "pointer", position: "relative",
                                                    transition: "all 0.2s ease"
                                                }}>
                                                <div style={{
                                                    width: "18px", height: "18px", borderRadius: "50%", background: "white",
                                                    position: "absolute", top: "3px", left: notifications[item.id as keyof typeof notifications] ? "27px" : "3px",
                                                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                                                }} />
                                            </button>
                                        </div>
                                    ))}
                                    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "24px", marginTop: "8px", borderTop: `1px solid ${colors.border}` }}>
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving || !hasChanges("notifications")}
                                            style={{ background: "#9146FF", borderRadius: "10px", height: "40px", padding: "0 20px", fontWeight: 700, fontSize: "13px", opacity: (!hasChanges("notifications") && !isSaving) ? 0.5 : 1 }}
                                        >
                                            {isSaving ? "Salvando..." : <><Check size={16} className="mr-2" /> Salvar Alterações</>}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


