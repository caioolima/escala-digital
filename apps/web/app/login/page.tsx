"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "next-themes";
import {
    Loader2, GraduationCap, ArrowRight, BookOpen,
    BarChart3, Users, Building2, UserCircle,
    Sun, Moon, Eye, EyeOff
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const MODES = {
    student: {
        title: "Acessar meus cursos",
        subtitle: "Entre com o e-mail da sua inscrição",
        emailLabel: "E-mail da inscrição",
        placeholder: "seu@email.com",
        footer: (isDark: boolean) => <>Sem acesso? <span style={{ color: isDark ? "#60a5fa" : "#2563eb", fontWeight: 600 }}>Fale com sua empresa</span></>,
    },
    corporate: {
        title: "Acesso corporativo",
        subtitle: "Gerencie cursos, trilhas e sua equipe",
        emailLabel: "E-mail corporativo",
        placeholder: "nome@empresa.com",
        footer: (isDark: boolean) => <>Novo por aqui? <span style={{ color: isDark ? "#60a5fa" : "#2563eb", fontWeight: 600 }}>Fale com a Escala Digital</span></>,
    },
};

export default function LoginPage() {
    const RESEND_COOLDOWN_SECONDS = 30;
    const CODE_VALIDITY_MINUTES = 10;
    const { login, verifyTwoFactor, resendTwoFactor } = useAuth();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<"student" | "corporate">("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [pending2FA, setPending2FA] = useState<{ userId: string; email: string; role: "CREATOR" | "STUDENT" } | null>(null);
    const [resendingCode, setResendingCode] = useState(false);
    const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Hydration fix for next-themes
    useEffect(() => setMounted(true), []);

    const isDark = resolvedTheme === "dark";
    const cfg = MODES[mode];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const requiredRole = mode === "student" ? "STUDENT" : "CREATOR";
            if (pending2FA) {
                await verifyTwoFactor(pending2FA.userId, twoFactorCode, requiredRole);
            } else {
                const result = await login(email, password, requiredRole);
                if (result.requires2FA) {
                    setPending2FA({
                        userId: result.userId,
                        email: result.email,
                        role: result.role,
                    });
                    setTwoFactorCode("");
                    setResendAvailableAt(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
                }
            }
        } catch (err: any) {
            if (err.message?.startsWith("RESTRICTED_ROLE:")) {
                const role = err.message.split(":")[1];
                setError(role === "CREATOR"
                    ? "Esta conta tem acesso corporativo. Por favor, use o login de Gestor."
                    : "Esta conta é de aluno. Por favor, use o login de Aluno.");
            } else {
                setError(pending2FA
                    ? "Código inválido ou expirado. Verifique e tente novamente."
                    : "E-mail ou senha inválidos. Verifique suas credenciais.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!pending2FA) return;
        setResendingCode(true);
        setError("");
        try {
            await resendTwoFactor(pending2FA.userId);
            setResendAvailableAt(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
        } catch {
            setError("Não foi possível reenviar o código agora. Tente novamente em instantes.");
        } finally {
            setResendingCode(false);
        }
    };

    useEffect(() => {
        if (!pending2FA || !resendAvailableAt) {
            setCooldownSeconds(0);
            return;
        }

        const update = () => {
            const remaining = Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000));
            setCooldownSeconds(remaining);
        };

        update();
        const timer = setInterval(update, 250);
        return () => clearInterval(timer);
    }, [pending2FA, resendAvailableAt]);

    if (!mounted) {
        return (
            <div style={{ minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "var(--brand-bg)" }}>
                <div style={{ width: "100%", maxWidth: 520, borderRadius: "22px", border: "1px solid var(--brand-border)", background: "var(--brand-card)", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <Skeleton width={120} height={12} borderRadius={999} />
                        <Skeleton width="70%" height={34} borderRadius={14} />
                        <Skeleton width="55%" height={16} borderRadius={10} />
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <Skeleton height={44} borderRadius={14} style={{ flex: 1 }} />
                        <Skeleton height={44} borderRadius={14} style={{ flex: 1 }} />
                    </div>
                    <Skeleton height={52} borderRadius={16} />
                    <Skeleton height={52} borderRadius={16} />
                    <Skeleton height={56} borderRadius={16} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px", marginTop: "8px" }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} height={60} borderRadius={16} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const colors = {
        bg: isDark ? "#060d1f" : "#f8fafc",
        cardBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
        border: isDark ? "rgba(255,255,255,0.1)" : "rgba(37,99,235,0.1)",
        text: isDark ? "white" : "#0f172a",
        textMuted: isDark ? "rgba(255,255,255,0.45)" : "#64748b",
        inputBg: isDark ? "rgba(255,255,255,0.07)" : "#ffffff",
        inputBorder: isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0",
        heroHighlight: "transparent",
        heroBorder: "transparent",
        heroAccent: "transparent",
        socialProofBg: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
        socialProofBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
    };

    const inputBase: React.CSSProperties = {
        width: "100%", height: "46px", borderRadius: "12px",
        border: `1px solid ${colors.inputBorder}`,
        background: colors.inputBg,
        padding: "0 16px", fontSize: "15px",
        color: colors.text, outline: "none", boxSizing: "border-box",
        fontFamily: "inherit",
        transition: "all 0.2s ease",
    };

    const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = "#3b82f6";
        e.target.style.background = isDark ? "rgba(255,255,255,0.1)" : "#ffffff";
        e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.15)";
    };
    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = colors.inputBorder;
        e.target.style.background = colors.inputBg;
        e.target.style.boxShadow = "none";
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-40px) scale(1.05)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,30px) scale(0.95)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(20px,20px)} 66%{transform:translate(-15px,-10px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }
        .login-container { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .btn-submit { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(59,130,246,0.5) !important; }
        .btn-submit:active { transform: translateY(0); }
        .mode-btn { cursor: pointer; transition: all 0.2s ease; }
        @media (max-width:1100px) { 
          .brand-col { display:none !important; }
          .form-section { flex: 1 !important; width: 100% !important; padding: 0 !important; }
        }
        @media (max-width:600px) {
          .login-container { padding: 16px !important; }
          .form-box { padding: 32px 16px !important; width: 100% !important; border-radius: 16px !important; }
        }
      `}</style>

            <div style={{
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                backgroundColor: colors.bg,
                position: "relative",
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                transition: "background-color 0.3s ease",
            }}>

                {/* Theme Toggle Button */}
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
                        color: colors.text,
                        boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Blobs (Visible only in dark mode) */}
                {isDark && (
                    <>
                        <div style={{ position: "absolute", width: "700px", height: "700px", borderRadius: "50%", filter: "blur(120px)", opacity: 0.35, background: "radial-gradient(circle,#1d4ed8,#7c3aed)", top: "-200px", left: "-100px", animation: "float1 15s ease-in-out infinite", pointerEvents: "none" }} />
                        <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", filter: "blur(140px)", opacity: 0.25, background: "radial-gradient(circle,#0ea5e9,#2563eb)", bottom: "-150px", right: "100px", animation: "float2 18s ease-in-out infinite", pointerEvents: "none" }} />
                        <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", filter: "blur(100px)", opacity: 0.15, background: "radial-gradient(circle,#6366f1,#3b82f6)", top: "30%", left: "40%", animation: "float3 20s ease-in-out infinite", pointerEvents: "none" }} />
                    </>
                )}

                {/* Light Mode subtle patterns */}
                {!isDark && (
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.05) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(37,99,235,0.03) 0%, transparent 50%)",
                        pointerEvents: "none"
                    }} />
                )}

                <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${isDark ? "rgba(255,255,255,0.02)" : "rgba(37,99,235,0.03)"} 1px,transparent 1px),linear-gradient(90deg,${isDark ? "rgba(255,255,255,0.02)" : "rgba(37,99,235,0.03)"} 1px,transparent 1px)`, backgroundSize: "64px 64px", pointerEvents: "none" }} />

                {/* ── Main centered content wrap ── */}
                <div className="login-container" style={{
                    width: "100%",
                    maxWidth: "1440px",
                    zIndex: 1,
                    display: "flex",
                    gap: "40px",
                    alignItems: "center",
                    justifyContent: "center"
                }}>

                    {/* ── Brand section ── */}
                    <div className="brand-col" style={{ flex: 1.2, display: "flex", flexDirection: "column", gap: "60px" }}>
                        {/* Logo */}
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
                                <GraduationCap size={22} color="white" style={{ position: "relative", zIndex: 1 }} />
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline" }}>
                                <span style={{ fontWeight: 600, fontSize: "20px", color: colors.text, letterSpacing: "-0.5px" }}>Escala</span>
                                <span style={{ fontWeight: 900, fontSize: "20px", color: "#3b82f6", letterSpacing: "-0.5px" }}>Digital</span>
                            </div>
                        </div>

                        {/* Hero content area */}
                        <div style={{ width: "100%" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: colors.heroAccent, border: `1px solid ${isDark ? "rgba(59,130,246,0.3)" : "rgba(37,99,235,0.2)"}`, borderRadius: "100px", padding: "6px 16px 6px 10px", marginBottom: "32px" }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 10px #3b82f6" }} />
                                <span style={{ fontSize: "12px", fontWeight: 700, color: isDark ? "#93c5fd" : "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Aprendizado online de qualidade</span>
                            </div>

                            <h1 style={{ fontSize: "56px", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", margin: "0 0 24px", color: colors.text }}>
                                Aprenda no<br />seu <span style={{ background: "linear-gradient(90deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>próprio ritmo</span>
                            </h1>

                            <p style={{ color: colors.textMuted, fontSize: "19px", lineHeight: 1.7, margin: "0 0 48px", maxWidth: "600px" }}>
                                <strong style={{ color: colors.text, fontWeight: 600 }}>Cursos em vídeo</strong>, trilhas personalizadas e <strong style={{ color: colors.text, fontWeight: 600 }}>progresso real</strong> para você ou para sua equipe.
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                {[
                                    { icon: BookOpen, title: "Conteúdo em vídeo", desc: "Alta definição e qualidade" },
                                    { icon: BarChart3, title: "Métricas de progresso", desc: "E certificação por conclusão" },
                                    { icon: Users, title: "Flexibilidade total", desc: "Para profissionais ou empresas" },
                                ].map(({ icon: Icon, title, desc }) => (
                                    <div key={title} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                        <div style={{ width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0, background: colors.heroAccent, border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(37,99,235,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Icon size={20} color="#60a5fa" />
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                                            <span style={{ fontSize: "17px", color: colors.text, fontWeight: 700 }}>{title}</span>
                                            <span style={{ fontSize: "14px", color: colors.textMuted, fontWeight: 500 }}>{desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social proof */}
                        <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "16px", background: colors.socialProofBg, padding: "12px 20px", borderRadius: "16px", border: `1px solid ${colors.socialProofBorder}` }}>
                            <div style={{ display: "flex" }}>
                                {["M", "C", "A", "R"].map((l, i) => (
                                    <div key={l} style={{ width: "34px", height: "34px", borderRadius: "50%", background: `hsl(${210 + i * 25} 70% 50%)`, border: `2px solid ${colors.bg}`, marginLeft: i === 0 ? 0 : "-10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "white" }}>{l}</div>
                                ))}
                            </div>
                            <div style={{ lineHeight: 1.4 }}>
                                <div style={{ fontSize: "15px", fontWeight: 700, color: colors.text }}>+2.500 alunos</div>
                                <div style={{ fontSize: "13px", color: colors.textMuted }}>evoluindo diariamente</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Form section ── */}
                    <div className="form-section" style={{ flex: 0.8, display: "flex", justifyContent: "center", width: "100%" }}>
                        <div className="form-box" style={{
                            width: "100%",
                            maxWidth: "460px",
                            boxSizing: "border-box",
                            background: isDark ? "rgba(255,255,255,0.05)" : "white",
                            backdropFilter: isDark ? "blur(32px)" : "none",
                            WebkitBackdropFilter: isDark ? "blur(32px)" : "none",
                            border: `1px solid ${colors.border}`,
                            borderRadius: "24px",
                            padding: "48px 40px",
                            boxShadow: isDark ? "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" : "0 20px 50px rgba(0,0,0,0.08)",
                            transition: "all 0.3s ease",
                        }}>

                            {!pending2FA && (
                                <div style={{ display: "flex", background: isDark ? "rgba(0,0,0,0.4)" : "#f1f5f9", borderRadius: "14px", padding: "5px", marginBottom: "32px", gap: "5px" }}>
                                    {([
                                        { key: "student" as const, icon: UserCircle, label: "Sou aluno" },
                                        { key: "corporate" as const, icon: Building2, label: "Gestor" },
                                    ]).map(({ key, icon: Icon, label }) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => { setMode(key); setError(""); setEmail(""); setPassword(""); setPending2FA(null); setTwoFactorCode(""); }}
                                            className="mode-btn"
                                            style={{
                                                flex: 1, height: "42px", borderRadius: "10px", border: "none",
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                                fontSize: "14px", fontWeight: 600, fontFamily: "inherit",
                                                background: mode === key
                                                    ? (isDark ? "linear-gradient(135deg, rgba(37,99,235,0.6), rgba(99,102,241,0.5))" : "white")
                                                    : "transparent",
                                                color: mode === key ? (isDark ? "white" : "#2563eb") : colors.textMuted,
                                                boxShadow: mode === key ? (isDark ? "0 4px 12px rgba(0,0,0,0.2)" : "0 2px 8px rgba(0,0,0,0.1)") : "none",
                                            }}
                                        >
                                            <Icon size={16} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Titles */}
                            <div style={{ marginBottom: "32px" }}>
                                <h2 style={{ fontSize: "24px", fontWeight: 800, color: colors.text, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
                                    {pending2FA ? "Verificação em duas etapas" : cfg.title}
                                </h2>
                                <p style={{ color: colors.textMuted, fontSize: "15px", margin: 0, lineHeight: 1.5 }}>
                                    {pending2FA ? `Digite o código de 6 dígitos enviado para ${pending2FA.email}.` : cfg.subtitle}
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                {!pending2FA ? (
                                    <>
                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: colors.text, opacity: 0.7, marginBottom: "8px" }}>
                                                {cfg.emailLabel}
                                            </label>
                                            <input type="email" placeholder={cfg.placeholder} value={email} onChange={(e) => setEmail(e.target.value)} required style={inputBase} onFocus={onFocus} onBlur={onBlur} />
                                        </div>

                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                <label style={{ fontSize: "14px", fontWeight: 600, color: colors.text, opacity: 0.7 }}>Senha</label>
                                                <button type="button" style={{ fontSize: "13px", color: "#3b82f6", background: "none", border: "none", fontWeight: 600, padding: 0, fontFamily: "inherit" }}>Esqueceu?</button>
                                            </div>
                                            <div style={{ position: "relative" }}>
                                                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputBase} onFocus={onFocus} onBlur={onBlur} />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{
                                                        position: "absolute",
                                                        right: "12px",
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        background: "none",
                                                        border: "none",
                                                        color: colors.textMuted,
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        padding: "4px",
                                                        borderRadius: "6px",
                                                        transition: "all 0.2s ease"
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ display: "grid", gap: "10px" }}>
                                            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: isDark ? "rgba(59,130,246,0.16)" : "#eff6ff", color: isDark ? "#bfdbfe" : "#1d4ed8", border: `1px solid ${isDark ? "rgba(59,130,246,0.28)" : "#bfdbfe"}`, borderRadius: "999px", padding: "6px 12px", fontSize: "12px", fontWeight: 700, width: "fit-content" }}>
                                                Código por e-mail
                                            </div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: colors.text, opacity: 0.7, marginBottom: "8px" }}>
                                                Código de verificação
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                pattern="[0-9]{6}"
                                                placeholder="000000"
                                                value={twoFactorCode}
                                                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                required
                                                style={{ ...inputBase, letterSpacing: "6px", textAlign: "center", fontWeight: 700 }}
                                                onFocus={onFocus}
                                                onBlur={onBlur}
                                            />
                                            <p style={{ margin: "10px 0 0 0", color: colors.textMuted, fontSize: "12px", fontWeight: 600 }}>
                                                Código válido por {CODE_VALIDITY_MINUTES} minutos.
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                                            <button type="button" onClick={handleResendCode} disabled={resendingCode || cooldownSeconds > 0} style={{ fontSize: "13px", color: "#3b82f6", background: isDark ? "rgba(59,130,246,0.12)" : "#eff6ff", border: `1px solid ${isDark ? "rgba(59,130,246,0.35)" : "#bfdbfe"}`, borderRadius: "10px", fontWeight: 700, padding: "10px 12px", fontFamily: "inherit", opacity: (resendingCode || cooldownSeconds > 0) ? 0.6 : 1, cursor: (resendingCode || cooldownSeconds > 0) ? "default" : "pointer" }}>
                                                {resendingCode ? "Reenviando..." : cooldownSeconds > 0 ? `Aguarde ${cooldownSeconds}s` : "Reenviar código"}
                                            </button>
                                            <button type="button" onClick={() => { setPending2FA(null); setTwoFactorCode(""); setError(""); setResendAvailableAt(null); }} style={{ fontSize: "13px", color: colors.textMuted, background: "transparent", border: `1px solid ${colors.inputBorder}`, borderRadius: "10px", fontWeight: 700, padding: "10px 12px", fontFamily: "inherit" }}>
                                                Voltar
                                            </button>
                                        </div>
                                    </>
                                )}

                                {error && (
                                    <div style={{ background: isDark ? "rgba(239,68,68,0.15)" : "#fef2f2", border: `1px solid ${isDark ? "rgba(239,68,68,0.3)" : "#fecaca"}`, borderRadius: "12px", padding: "12px 16px", fontSize: "14px", color: isDark ? "#fca5a5" : "#dc2626" }}>
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-submit"
                                    style={{
                                        width: "100%",
                                        height: "50px",
                                        borderRadius: "14px",
                                        background: "linear-gradient(135deg,#2563eb 0%,#6366f1 100%)",
                                        color: "white",
                                        fontWeight: 800,
                                        fontSize: "16px",
                                        border: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "10px",
                                        boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
                                        opacity: loading ? 0.7 : 1,
                                        marginTop: "8px",
                                        fontFamily: "inherit"
                                    }}
                                >
                                    {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
                                    {loading ? "Entrando..." : (pending2FA ? "Validar código" : "Acessar Plataforma")}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                            </form>

                            <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9"}`, textAlign: "center" }}>
                                <p style={{ fontSize: "14px", color: colors.textMuted, margin: 0 }}>
                                    {pending2FA ? <>Sem acesso? <span style={{ color: isDark ? "#60a5fa" : "#2563eb", fontWeight: 600 }}>Fale com sua empresa</span></> : cfg.footer(isDark)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
