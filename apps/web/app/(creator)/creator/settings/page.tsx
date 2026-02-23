"use client";

import { useEffect, useState } from "react";
import {
    Settings,
    User,
    Shield,
    Bell,
    Palette,
    Globe,
    Check,
    ChevronRight,
    Camera,
    CreditCard
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function CreatorSettingsPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const { user } = useAuth();
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [isSaving, setIsSaving] = useState(false);

    // Initial States (for comparison)
    const [initialSettings, setInitialSettings] = useState<any>(null);

    // Settings States
    const [profile, setProfile] = useState({
        name: user?.name || "Criador",
        bio: "",
        avatar: ""
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
        // Load from localStorage if exists
        const saved = localStorage.getItem("creator_settings");
        if (saved) {
            const data = JSON.parse(saved);
            if (data.profile) setProfile(data.profile);
            if (data.platform) setPlatform(data.platform);
            if (data.notifications) setNotifications(data.notifications);
            setInitialSettings(data);
        } else {
            // Default initial settings
            const defaults = {
                profile: { name: user?.name || "Criador", bio: "", avatar: "" },
                platform: { logo: "" },
                notifications: { newEnrollments: true, performanceReports: true }
            };
            setInitialSettings(defaults);
        }
    }, [user]);

    if (!mounted) return null;

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            const settingsData = { profile, platform, notifications };
            localStorage.setItem("creator_settings", JSON.stringify(settingsData));
            setInitialSettings(settingsData);
            setIsSaving(false);
            toast("Configurações salvas!", "success", "Suas alterações foram aplicadas com sucesso.");
        }, 800);
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
        { id: "billing", label: "Pagamentos & Planos", icon: CreditCard },
        { id: "notifications", label: "Notificações", icon: Bell },
    ];

    return (
        <div style={{ background: colors.bg, minHeight: "100%", padding: "40px" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "40px" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9146FF", marginBottom: "8px" }}>
                            <Settings size={18} />
                            <span style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1.5px" }}>Configurações do Sistema</span>
                        </div>
                        <h1 style={{ fontSize: "36px", fontWeight: 900, color: colors.text, letterSpacing: "-1.5px" }}>Configurações</h1>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "40px" }}>
                    {/* Navigation Sidebar */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {sections.map((section) => {
                            const active = activeTab === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveTab(section.id)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        padding: "16px",
                                        borderRadius: "16px",
                                        background: active ? (isDark ? "rgba(145, 70, 255, 0.1)" : "#f5f3ff") : "transparent",
                                        border: "none",
                                        color: active ? "#9146FF" : colors.textMuted,
                                        fontSize: "14px",
                                        fontWeight: 800,
                                        textAlign: "left",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease"
                                    }}>
                                    <section.icon size={18} strokeWidth={active ? 2.5 : 2} />
                                    {section.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Settings Content */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
                                            <button style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "32px", height: "32px", borderRadius: "10px", background: "#9146FF", color: "white", border: "4px solid " + colors.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <Camera size={14} />
                                            </button>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: "11px", fontWeight: 900, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", display: "block" }}>Nome do Criador</label>
                                            <input
                                                value={profile.name}
                                                onChange={e => setProfile({ ...profile, name: e.target.value })}
                                                style={{ width: "100%", height: "48px", padding: "0 16px", borderRadius: "12px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "14px", fontWeight: 600, outline: "none" }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "11px", fontWeight: 900, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", display: "block" }}>Bio do Perfil</label>
                                        <textarea
                                            value={profile.bio}
                                            onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                            placeholder="Conte um pouco sobre sua experiência..."
                                            style={{ width: "100%", height: "120px", padding: "16px", borderRadius: "12px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "14px", fontWeight: 500, resize: "none", outline: "none" }}
                                        />
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
                                                placeholder="••••••••"
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

                        {activeTab === "billing" && (
                            <Card style={{ borderRadius: "24px", border: `1px solid ${colors.border}`, background: colors.card, overflow: "hidden" }}>
                                <CardHeader style={{ padding: "32px 32px 0" }}>
                                    <CardTitle style={{ fontSize: "18px", fontWeight: 900 }}>Plano & Faturamento</CardTitle>
                                </CardHeader>
                                <CardContent style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                                    <div style={{ padding: "32px", borderRadius: "24px", background: "linear-gradient(135deg, #9146FF, #7030D8)", color: "white", position: "relative", overflow: "hidden" }}>
                                        <div style={{ position: "relative", zIndex: 1 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                                                <div>
                                                    <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8 }}>Plano Atual</span>
                                                    <h3 style={{ fontSize: "28px", fontWeight: 900, margin: "4px 0" }}>Escala Digital Pro</h3>
                                                </div>
                                                <div style={{ padding: "6px 14px", borderRadius: "100px", background: "rgba(255,255,255,0.2)", fontSize: "12px", fontWeight: 800, backdropFilter: "blur(10px)" }}>
                                                    Ativo
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", gap: "24px" }}>
                                                <div>
                                                    <span style={{ fontSize: "11px", fontWeight: 700, opacity: 0.7 }}>Próximo Vencimento</span>
                                                    <p style={{ fontSize: "14px", fontWeight: 800, margin: 0 }}>12 de Março, 2026</p>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: "11px", fontWeight: 700, opacity: 0.7 }}>Custo Mensal</span>
                                                    <p style={{ fontSize: "14px", fontWeight: 800, margin: 0 }}>R$ 497,90</p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Decorative circle */}
                                        <div style={{ position: "absolute", right: "-40px", top: "-40px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "24px", borderTop: `1px solid ${colors.border}` }}>
                                        <Button
                                            onClick={handleSave}
                                            disabled={true}
                                            style={{ background: "#9146FF", borderRadius: "10px", height: "40px", padding: "0 20px", fontWeight: 700, fontSize: "13px", opacity: 0.5 }}
                                        >
                                            <Check size={16} className="mr-2" /> Salvar Alterações
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
