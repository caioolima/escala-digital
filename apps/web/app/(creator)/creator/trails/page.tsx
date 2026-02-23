"use client";

import { useEffect, useRef, useState } from "react";
import { useToast, ToastContainer } from "@/hooks/use-toast";
import {
    Map,
    Plus,
    Trash2,
    Layers,
    Clock,
    CheckCircle2,
    BookOpen,
    X,
    ChevronRight,
    MoreVertical,
    Eye,
    Edit2,
    ExternalLink,
    Play,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/* ─── Types ─────────────────────────────────────────────── */
interface Course {
    id: string;
    title: string;
    category: string;
    thumbnail: string;
    description?: string;
    status: string;
    modules?: {
        id: string;
        title: string;
        lessons: {
            id: string;
            title: string;
            videoUrl: string;
        }[];
    }[];
}

interface Trail {
    id: string;
    title: string;
    description: string;
    accent: string;
    courseIds: string[];
    createdAt: string;
}

/* ─── Helpers ────────────────────────────────────────────── */
function getYouTubeThumbnail(course: Course): string {
    if (course.thumbnail && (course.thumbnail.startsWith("http") || course.thumbnail.startsWith("/"))) {
        return course.thumbnail;
    }
    const firstUrl = course.modules?.flatMap(m => m.lessons).find(l => l.videoUrl?.trim())?.videoUrl;
    if (firstUrl) {
        try {
            const u = new URL(firstUrl);
            const videoId = u.hostname === "youtu.be"
                ? u.pathname.slice(1).split("?")[0]
                : u.searchParams.get("v");
            if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        } catch { /* fall through */ }
    }
    return course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";
}

const ACCENT_OPTIONS = ["#9146FF", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

/* ─── Course picker card ─────────────────────────────────── */
function CoursePickerCard({ course, selected, onToggle, isDark, colors }: {
    course: Course; selected: boolean; onToggle: () => void;
    isDark: boolean; colors: Record<string, string>;
}) {
    return (
        <div
            onClick={onToggle}
            style={{
                display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px",
                borderRadius: "14px", border: `1.5px solid ${selected ? "#9146FF" : colors.border}`,
                background: selected ? "rgba(145,70,255,0.06)" : (isDark ? "rgba(255,255,255,0.02)" : "#fafafa"),
                cursor: "pointer", transition: "all 0.15s ease",
            }}
        >
            <img src={getYouTubeThumbnail(course)} alt={course.title}
                style={{ width: "64px", height: "36px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: colors.text, margin: 0 }}>{course.title}</p>
                <p style={{ fontSize: "11px", color: "#8b5cf6", fontWeight: 600, margin: "2px 0 0" }}>{course.category}</p>
            </div>
            <div style={{
                width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                border: `2px solid ${selected ? "#9146FF" : colors.border}`,
                background: selected ? "#9146FF" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s ease",
            }}>
                {selected && <CheckCircle2 size={14} color="white" />}
            </div>
        </div>
    );
}

/* ─── Row dropdown ───────────────────────────────────────── */
function TrailMenu({ onView, onEdit, onDelete, isDark, colors }: {
    onView: () => void; onEdit: () => void; onDelete: () => void;
    isDark: boolean; colors: Record<string, string>;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const items = [
        { icon: <Eye size={14} />, label: "Ver Trilha", color: colors.text, action: () => { setOpen(false); onView(); } },
        { icon: <Edit2 size={14} />, label: "Editar", color: "#9146FF", action: () => { setOpen(false); onEdit(); } },
        { icon: <Trash2 size={14} />, label: "Excluir", color: "#ef4444", action: () => { setOpen(false); onDelete(); } },
    ];

    return (
        <div ref={ref} style={{ position: "absolute", top: "20px", right: "20px" }}>
            <button onClick={() => setOpen(v => !v)}
                style={{ width: "34px", height: "34px", borderRadius: "10px", border: "none", background: open ? (isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9") : "transparent", color: colors.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MoreVertical size={18} />
            </button>
            {open && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 99, background: isDark ? "#1a1025" : "#fff", borderRadius: "14px", border: `1px solid ${colors.border}`, boxShadow: "0 12px 40px rgba(0,0,0,0.2)", padding: "6px", minWidth: "160px", animation: "dropIn 0.12s ease" }}>
                    {items.map((item, i) => (
                        <button key={i} onClick={item.action}
                            style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", border: "none", background: "transparent", color: item.color, fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                            onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "#f8fafc")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Main page ──────────────────────────────────────────── */
export default function CreatorTrailsPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [trails, setTrails] = useState<Trail[]>([]);
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
    const [showPanel, setShowPanel] = useState(false);
    const [viewTrail, setViewTrail] = useState<Trail | null>(null);
    const [editTrail, setEditTrail] = useState<Trail | null>(null);
    const [viewCourse, setViewCourse] = useState<Course | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const { toasts, toast, remove } = useToast();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // New trail form state
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newAccent, setNewAccent] = useState(ACCENT_OPTIONS[0]);
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

    useEffect(() => {
        const storedTrails: Trail[] = JSON.parse(localStorage.getItem("creator_published_trails") || "[]");
        const storedCourses: Course[] = JSON.parse(localStorage.getItem("creator_published_courses") || "[]");
        setTrails(storedTrails);
        setAvailableCourses(storedCourses);

        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        setTimeout(() => setIsLoading(false), 500);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Derived pagination data
    const totalPages = Math.ceil(trails.length / itemsPerPage);
    const paginatedTrails = trails.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const colors = {
        bg: "var(--brand-bg)", card: "var(--brand-card)", border: "var(--brand-border)",
        text: "var(--brand-text)", textMuted: "var(--brand-text-muted)",
    };

    const openPanel = () => {
        setNewTitle(""); setNewDesc(""); setNewAccent(ACCENT_OPTIONS[0]); setSelectedCourseIds([]);
        setShowPanel(true);
    };

    const handleCreate = () => {
        if (!newTitle.trim() || selectedCourseIds.length === 0) return;
        const trail: Trail = {
            id: Date.now().toString(),
            title: newTitle.trim(),
            description: newDesc.trim(),
            accent: newAccent as string,
            courseIds: selectedCourseIds,
            createdAt: new Date().toLocaleDateString("pt-BR"),
        };
        const updated = [trail, ...trails];
        setTrails(updated);
        localStorage.setItem("creator_published_trails", JSON.stringify(updated));
        setShowPanel(false);
        toast("Trilha criada com sucesso!", "success", `"${trail.title}" foi adicionada às suas trilhas.`);
    };

    const handleDelete = (trailId: string) => {
        const target = trails.find(t => t.id === trailId);
        const updated = trails.filter(t => t.id !== trailId);
        setTrails(updated);
        localStorage.setItem("creator_published_trails", JSON.stringify(updated));
        setConfirmDeleteId(null);
        toast(`"${target?.title}" excluída`, "error", "A trilha foi removida permanentemente.");
    };

    const handleEditSave = () => {
        if (!editTrail || !newTitle.trim() || selectedCourseIds.length === 0) return;
        const updated = trails.map(t => t.id === editTrail.id
            ? { ...t, title: newTitle.trim(), description: newDesc.trim(), accent: newAccent as string, courseIds: selectedCourseIds }
            : t
        );
        setTrails(updated);
        localStorage.setItem("creator_published_trails", JSON.stringify(updated));
        setEditTrail(null);
        toast("Trilha atualizada!", "success", `"${newTitle.trim()}" foi salva com sucesso.`);
    };

    const toggleCourse = (id: string) => {
        setSelectedCourseIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const canCreate = newTitle.trim().length > 0 && selectedCourseIds.length > 0;

    return (
        <div style={{ background: colors.bg, minHeight: "100%", padding: isMobile ? "20px" : "40px" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                * { font-family: 'Plus Jakarta Sans', sans-serif; }
                
                .trail-card:hover {
                    background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"} !important;
                    transform: translateY(-2px);
                    cursor: pointer;
                }
                .trail-card {
                    transition: all 0.3s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-in {
                    animation: fadeIn 0.4s ease forwards;
                }
                .glass-panel {
                    background: ${isDark ? "rgba(20, 20, 30, 0.4)" : "rgba(255, 255, 255, 0.4)"};
                    backdrop-filter: blur(40px);
                    -webkit-backdrop-filter: blur(40px);
                }
                .pagination-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    border: 1px solid var(--brand-border);
                    background: transparent;
                    color: var(--brand-text);
                    display: flex;
                    alignItems: center;
                    justifyContent: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 13px;
                    font-weight: 700;
                }
                .pagination-btn.active {
                    background: #9146FF;
                    border-color: #9146FF;
                    color: white;
                }
                .pagination-btn:hover:not(.active) {
                    background: rgba(145, 70, 255, 0.1);
                    border-color: #9146FF;
                }
            `}</style>

            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "40px" }}>

                {/* Header */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    flexDirection: isMobile ? "column" : "row",
                    gap: "24px"
                }}>
                    <div className="animate-in">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9146FF", marginBottom: "8px" }}>
                            <Map size={18} />
                            <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1.5px" }}>Roteiros de Estudo</span>
                        </div>
                        <h1 style={{ fontSize: isMobile ? "28px" : "40px", fontWeight: 900, color: colors.text, letterSpacing: "-1.5px", margin: 0 }}>Gestão de Trilhas</h1>
                        <p style={{ fontSize: "14px", color: colors.textMuted, marginTop: "8px", fontWeight: 500 }}>
                            {trails.length} {trails.length === 1 ? "Jornada Ativa" : "Jornadas Ativas"} no catálogo
                        </p>
                    </div>
                    <Button onClick={openPanel} style={{
                        background: "#9146FF",
                        borderRadius: "16px",
                        height: "56px",
                        padding: "0 32px",
                        fontWeight: 800,
                        fontSize: "15px",
                        boxShadow: "0 10px 30px rgba(145,70,255,0.3)",
                        border: "none"
                    }} className="animate-in">
                        <Plus size={20} className="mr-2" style={{ strokeWidth: 3 }} /> Nova Trilha
                    </Button>
                </div>

                {/* Trail cards */}
                {isLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} width="100%" height={160} borderRadius="24px" />
                        ))}
                    </div>
                ) : trails.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "80px 40px",
                        border: `2px dashed ${colors.border}`,
                        borderRadius: "32px",
                        background: "transparent",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "20px"
                    }} className="animate-in">
                        <div style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "24px",
                            background: "rgba(145,70,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#9146FF"
                        }}>
                            <Layers size={40} />
                        </div>
                        <div>
                            <p style={{ fontSize: "20px", fontWeight: 900, color: colors.text, marginBottom: "8px" }}>Sua biblioteca está vazia</p>
                            <p style={{ fontSize: "14px", color: colors.textMuted, maxWidth: "400px", margin: "0 auto", lineHeight: 1.6 }}>
                                Organize seus cursos em trilhas lógicas de aprendizado para facilitar a jornada dos seus alunos.
                            </p>
                        </div>
                        <Button onClick={openPanel} style={{ background: "#9146FF", borderRadius: "14px", height: "48px", padding: "0 24px", fontWeight: 800 }}>
                            Criar Primeira Trilha
                        </Button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="animate-in">
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {paginatedTrails.map(trail => {
                                const trailCourses = availableCourses.filter(c => trail.courseIds.includes(c.id));
                                const firstCourse = trailCourses[0];
                                const coverImg = firstCourse ? getYouTubeThumbnail(firstCourse) : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";

                                return (
                                    <div
                                        key={trail.id}
                                        className="trail-card"
                                        onClick={() => setViewTrail(trail)}
                                        style={{
                                            borderRadius: "24px",
                                            border: `1px solid ${colors.border}`,
                                            background: colors.card,
                                            overflow: "hidden",
                                            position: "relative",
                                            display: "flex",
                                            height: isMobile ? "auto" : "140px",
                                            flexDirection: isMobile ? "column" : "row",
                                            alignItems: "stretch"
                                        }}
                                    >
                                        {/* Accent strip */}
                                        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "6px", background: trail.accent }} />

                                        {/* Image / Stats */}
                                        <div style={{
                                            width: isMobile ? "100%" : "220px",
                                            position: "relative",
                                            overflow: "hidden",
                                            flexShrink: 0
                                        }}>
                                            <img src={coverImg} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            <div style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(0,0,0,0.45)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexDirection: "column",
                                                gap: "4px"
                                            }}>
                                                <span style={{ fontSize: "24px", fontWeight: 900, color: "white" }}>{trailCourses.length}</span>
                                                <span style={{ fontSize: "10px", fontWeight: 900, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "1px" }}>Cursos</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, padding: "24px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <div>
                                                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: colors.text, margin: 0, lineHeight: 1.2 }}>{trail.title}</h3>
                                                    <p style={{ fontSize: "14px", color: colors.textMuted, margin: "6px 0 0", fontWeight: 500, opacity: 0.8 }}>
                                                        {trail.description || "Nenhuma descrição adicionada"}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div
                                                    style={{ position: "relative", display: "flex", gap: "8px" }}
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <button
                                                        onClick={() => setViewTrail(trail)}
                                                        style={{
                                                            width: "36px", height: "36px", borderRadius: "12px", border: `1px solid ${colors.border}`,
                                                            background: "transparent", color: colors.textMuted, cursor: "pointer",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            transition: "all 0.2s"
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.color = "#9146FF"}
                                                        onMouseLeave={e => e.currentTarget.style.color = colors.textMuted}
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditTrail(trail);
                                                            setNewTitle(trail.title);
                                                            setNewDesc(trail.description);
                                                            setNewAccent(trail.accent);
                                                            setSelectedCourseIds(trail.courseIds);
                                                        }}
                                                        style={{
                                                            width: "36px", height: "36px", borderRadius: "12px", border: `1px solid ${colors.border}`,
                                                            background: "transparent", color: colors.textMuted, cursor: "pointer",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            transition: "all 0.2s"
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.color = "#9146FF"}
                                                        onMouseLeave={e => e.currentTarget.style.color = colors.textMuted}
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteId(trail.id)}
                                                        style={{
                                                            width: "36px", height: "36px", borderRadius: "12px", border: `1px solid ${colors.border}`,
                                                            background: "transparent", color: "#ef4444", cursor: "pointer",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            transition: "all 0.2s"
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", gap: "20px", marginTop: "16px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: colors.textMuted, fontSize: "12px", fontWeight: 700 }}>
                                                    <Clock size={14} style={{ opacity: 0.6 }} /> Criada em {trail.createdAt}
                                                </div>
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                    color: trail.accent,
                                                    fontSize: "10px",
                                                    fontWeight: 900,
                                                    textTransform: "uppercase",
                                                    padding: "4px 10px",
                                                    borderRadius: "40px",
                                                    background: `${trail.accent}15`
                                                }}>
                                                    Live
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── View Trail Panel (Immersive Preview) ── */}
            {viewTrail && (() => {
                const tc = availableCourses.filter(c => viewTrail.courseIds.includes(c.id));
                const firstCourse = tc[0];
                const coverImg = firstCourse ? getYouTubeThumbnail(firstCourse) : "";

                return (
                    <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }} onClick={() => setViewTrail(null)} />
                        <div style={{
                            position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 999,
                            width: isMobile ? "100%" : "600px",
                            background: isDark ? "#0a0a0f" : "#fff",
                            borderLeft: `1px solid ${colors.border}`,
                            display: "flex", flexDirection: "column",
                            boxShadow: "-24px 0 60px rgba(0,0,0,0.5)",
                            animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                            overflow: "hidden"
                        }}>
                            {/* Background blur gradient */}
                            <div style={{
                                position: "absolute", top: 0, left: 0, right: 0, height: "400px",
                                background: `linear-gradient(to bottom, ${viewTrail.accent}40, transparent)`,
                                filter: "blur(80px)", opacity: 0.6, pointerEvents: "none"
                            }} />

                            {/* Header / Cover section */}
                            <div style={{ position: "relative", padding: "40px", flexShrink: 0 }}>
                                <button onClick={() => setViewTrail(null)} style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10, width: "40px", height: "40px", borderRadius: "12px", border: "none", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: colors.text }}><X size={20} /></button>

                                <div style={{ display: "flex", gap: "24px", alignItems: "flex-end" }}>
                                    <div style={{
                                        width: "180px", height: "100px", borderRadius: "16px", overflow: "hidden",
                                        boxShadow: "0 20px 40px rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`,
                                        flexShrink: 0
                                    }}>
                                        <img src={coverImg} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9146FF", marginBottom: "8px" }}>
                                            <Layers size={14} />
                                            <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>Preview da Trilha</span>
                                        </div>
                                        <h2 style={{ fontSize: "28px", fontWeight: 900, color: colors.text, margin: 0, letterSpacing: "-1px", lineHeight: 1.1 }}>{viewTrail.title}</h2>
                                    </div>
                                </div>
                                <div style={{ marginTop: "24px" }}>
                                    <Button
                                        onClick={() => {
                                            setEditTrail(viewTrail);
                                            setNewTitle(viewTrail.title);
                                            setNewDesc(viewTrail.description);
                                            setNewAccent(viewTrail.accent);
                                            setSelectedCourseIds(viewTrail.courseIds);
                                            setViewTrail(null);
                                        }}
                                        style={{
                                            width: "100%",
                                            height: "56px",
                                            borderRadius: "16px",
                                            background: "linear-gradient(135deg, #9146FF, #7030D8)",
                                            color: "white",
                                            fontWeight: 800,
                                            fontSize: "15px",
                                            border: "none",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "10px",
                                            boxShadow: "0 10px 30px rgba(145, 70, 255, 0.3)",
                                            transition: "all 0.2s ease",
                                        }}
                                        className="premium-action-btn"
                                    >
                                        <Edit2 size={18} strokeWidth={2.5} />
                                        Editar Estrutura da Trilha
                                    </Button>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: "auto", padding: "0 40px 40px", position: "relative" }}>
                                <p style={{ fontSize: "15px", color: colors.textMuted, fontWeight: 500, lineHeight: 1.6, marginBottom: "32px", opacity: 0.9 }}>
                                    {viewTrail.description || "Esta trilha ainda não possui uma descrição detalhada."}
                                </p>

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                    <h3 style={{ fontSize: "12px", fontWeight: 900, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>Grade Curricular ({tc.length})</h3>
                                    <div style={{ height: "1px", flex: 1, background: colors.border, marginLeft: "16px", opacity: 0.5 }} />
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {tc.map((c, idx) => (
                                        <div
                                            key={c.id}
                                            style={{
                                                display: "flex", alignItems: "center", gap: "16px", padding: "12px", borderRadius: "16px",
                                                border: `1px solid ${colors.border}`,
                                                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                                                transition: "all 0.2s"
                                            }}
                                            className="course-row"
                                        >
                                            <span style={{ fontSize: "14px", fontWeight: 900, color: colors.textMuted, width: "24px", textAlign: "center" }}>{idx + 1}</span>
                                            <div style={{ width: "100px", height: "56px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                                                <img src={getYouTubeThumbnail(c)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: colors.text }}>{c.title}</p>
                                                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#9146FF", fontWeight: 700 }}>{c.category}</p>
                                            </div>
                                            <button onClick={() => setViewCourse(c)}
                                                style={{
                                                    width: "32px", height: "32px", borderRadius: "10px", border: "none",
                                                    background: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9", color: colors.textMuted,
                                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                                                }}
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                );
            })()}

            {/* ── Course Detail Modal ── */}
            {viewCourse && (
                <div
                    style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
                    onClick={() => setViewCourse(null)}
                >
                    <div
                        style={{ background: isDark ? "#0f0f15" : "#fff", borderRadius: "32px", width: "95%", maxWidth: "900px", border: `1px solid ${colors.border}`, boxShadow: "0 40px 120px rgba(0,0,0,0.6)", overflow: "hidden", animation: "dropIn 0.3s ease" }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ position: "relative", height: "340px" }}>
                            <img src={getYouTubeThumbnail(viewCourse)} alt={viewCourse.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0f0f15 5%, transparent 60%)" }} />
                            <button
                                onClick={() => setViewCourse(null)}
                                style={{ position: "absolute", top: "24px", right: "24px", width: "44px", height: "44px", borderRadius: "16px", border: "none", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }}
                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                            >
                                <X size={24} />
                            </button>
                            <div style={{ position: "absolute", bottom: "32px", left: "40px", right: "40px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                                    <Badge style={{ background: "#9146FF", color: "white", padding: "6px 14px", borderRadius: "8px", fontWeight: 800, fontSize: "11px" }}>{viewCourse.category}</Badge>
                                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>{viewCourse.modules?.length || 0} módulos</span>
                                </div>
                                <h2 style={{ fontSize: "36px", fontWeight: 900, color: "white", margin: 0, letterSpacing: "-1.5px", lineHeight: 1.1 }}>{viewCourse.title}</h2>
                            </div>
                        </div>

                        <div style={{ padding: "40px", maxHeight: "55vh", overflowY: "auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "40px" }}>
                            <div>
                                <h3 style={{ fontSize: "12px", fontWeight: 900, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Sobre este curso</h3>
                                <p style={{ fontSize: "15px", color: colors.text, lineHeight: "1.7", fontWeight: 500, opacity: 0.9 }}>
                                    {viewCourse.description || "Explore o conteúdo deste curso especializado para dominar novas habilidades e impulsionar sua carreira no digital."}
                                </p>
                            </div>

                            <div>
                                <h3 style={{ fontSize: "12px", fontWeight: 900, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Conteúdo Programático</h3>
                                {viewCourse.modules && viewCourse.modules.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {viewCourse.modules.map((m, idx) => (
                                            <div key={idx} style={{ padding: "16px", borderRadius: "16px", border: `1px solid ${colors.border}`, background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span style={{ fontSize: "13px", fontWeight: 800, color: colors.text }}>{m.title}</span>
                                                    <span style={{ fontSize: "11px", fontWeight: 700, opacity: 0.6 }}>{m.lessons.length} aulas</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: "20px", borderRadius: "16px", border: `1px dashed ${colors.border}`, textAlign: "center", color: colors.textMuted }}>
                                        Curriculum não configurado.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: "32px 40px", background: isDark ? "rgba(255,255,255,0.02)" : "#fafafa", borderTop: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Button
                                variant="ghost"
                                style={{ borderRadius: "12px", height: "48px", fontWeight: 700, padding: "0 24px" }}
                                onClick={() => setViewCourse(null)}
                            >
                                Voltar
                            </Button>
                            <Link href={`/creator/courses/${viewCourse.id}/edit`} style={{ textDecoration: "none" }}>
                                <Button style={{ borderRadius: "16px", height: "56px", padding: "0 32px", fontWeight: 800, background: "#9146FF", color: "white", boxShadow: "0 10px 20px rgba(145,70,255,0.3)" }}>
                                    Editar Configurações
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit Trail Panel ── */}
            {editTrail && (
                <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }} onClick={() => setEditTrail(null)} />
                    <div style={{
                        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 999,
                        width: isMobile ? "100%" : "540px",
                        background: isDark ? "#0a0a0f" : "#fff",
                        borderLeft: `1px solid ${colors.border}`,
                        display: "flex", flexDirection: "column",
                        boxShadow: "-24px 0 60px rgba(0,0,0,0.5)",
                        animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                        overflow: "hidden"
                    }}>
                        <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: "300px",
                            background: `linear-gradient(to bottom, #9146FF20, transparent)`,
                            filter: "blur(60px)", opacity: 0.5, pointerEvents: "none"
                        }} />

                        <div style={{ padding: "40px 40px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0, position: "relative" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9146FF", marginBottom: "8px" }}>
                                    <Edit2 size={16} />
                                    <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>Gestão de Conteúdo</span>
                                </div>
                                <h2 style={{ fontSize: "28px", fontWeight: 900, color: colors.text, margin: 0, letterSpacing: "-1px" }}>Editar Trilha</h2>
                            </div>
                            <button onClick={() => setEditTrail(null)} style={{ width: "40px", height: "40px", borderRadius: "12px", border: "none", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: colors.text }}><X size={20} /></button>
                        </div>

                        <div style={{ flex: 1, overflowY: "auto", padding: "0 40px 40px", display: "flex", flexDirection: "column", gap: "28px", position: "relative" }}>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: colors.textMuted, display: "block", marginBottom: "10px" }}>Nome da Trilha</label>
                                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Do Zero ao Pro" style={{ width: "100%", padding: "16px", borderRadius: "16px", border: `1.5px solid ${colors.border}`, background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", color: colors.text, fontSize: "15px", fontWeight: 600, outline: "none", boxSizing: "border-box", transition: "all 0.2s" }} />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: colors.textMuted, display: "block", marginBottom: "10px" }}>Descrição Detalhada</label>
                                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="O que o aluno vai aprender nesta jornada?" rows={4} style={{ width: "100%", padding: "16px", borderRadius: "16px", border: `1.5px solid ${colors.border}`, background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", color: colors.text, fontSize: "14px", fontWeight: 500, outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.6 }} />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: colors.textMuted, display: "block", marginBottom: "12px" }}>Identidade Visual</label>
                                <div style={{ display: "flex", gap: "12px", padding: "4px" }}>
                                    {ACCENT_OPTIONS.map(c => (
                                        <button key={c} onClick={() => setNewAccent(c)} style={{ width: "36px", height: "36px", borderRadius: "50%", background: c, border: newAccent === c ? `3px solid ${isDark ? '#fff' : '#000'}` : "none", cursor: "pointer", transition: "transform 0.2s", transform: newAccent === c ? "scale(1.15)" : "scale(1)", boxShadow: newAccent === c ? `0 0 15px ${c}80` : "none" }} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: colors.textMuted }}>Estrutura de Cursos</label>
                                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#9146FF" }}>{selectedCourseIds.length} selecionados</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "350px", overflowY: "auto", paddingRight: "8px" }}>
                                    {availableCourses.map(c => (
                                        <CoursePickerCard key={c.id} course={c} selected={selectedCourseIds.includes(c.id)} onToggle={() => toggleCourse(c.id)} isDark={isDark} colors={colors} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: "32px 40px", borderTop: `1px solid ${colors.border}`, display: "flex", gap: "16px", flexShrink: 0, background: isDark ? "rgba(255,255,255,0.02)" : "#fafafa" }}>
                            <Button variant="ghost" onClick={() => setEditTrail(null)} style={{ flex: 1, borderRadius: "14px", height: "52px", fontWeight: 700 }}>Cancelar</Button>
                            <Button onClick={handleEditSave} disabled={!newTitle.trim() || selectedCourseIds.length === 0} style={{ flex: 2, borderRadius: "14px", height: "52px", fontWeight: 800, background: "#9146FF", color: "white", boxShadow: "0 10px 20px rgba(145,70,255,0.3)" }}>Salvar Alterações</Button>
                        </div>
                    </div>
                </>
            )}

            {/* ── New Trail Side Panel ── */}
            {showPanel && (
                <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }} onClick={() => setShowPanel(false)} />
                    <div style={{
                        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 999,
                        width: isMobile ? "100%" : "540px",
                        background: isDark ? "#0a0a0f" : "#fff",
                        borderLeft: `1px solid ${colors.border}`,
                        display: "flex", flexDirection: "column",
                        boxShadow: "-24px 0 60px rgba(0,0,0,0.5)",
                        animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                        overflow: "hidden"
                    }}>
                        <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: "300px",
                            background: `linear-gradient(to bottom, #9146FF20, transparent)`,
                            filter: "blur(60px)", opacity: 0.5, pointerEvents: "none"
                        }} />

                        <div style={{ padding: "40px 40px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0, position: "relative" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9146FF", marginBottom: "8px" }}>
                                    <Plus size={16} />
                                    <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>Novo Roteiro</span>
                                </div>
                                <h2 style={{ fontSize: "28px", fontWeight: 900, color: colors.text, margin: 0, letterSpacing: "-1px" }}>Criar Trilha</h2>
                            </div>
                            <button onClick={() => setShowPanel(false)} style={{ width: "40px", height: "40px", borderRadius: "12px", border: "none", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: colors.text }}><X size={20} /></button>
                        </div>

                        <div style={{ flex: 1, overflowY: "auto", padding: "0 40px 40px", display: "flex", flexDirection: "column", gap: "28px", position: "relative" }}>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: colors.textMuted, display: "block", marginBottom: "10px" }}>Nome da Trilha *</label>
                                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Masterclass de Design" style={{ width: "100%", padding: "16px", borderRadius: "16px", border: `1.5px solid ${colors.border}`, background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", color: colors.text, fontSize: "15px", fontWeight: 600, outline: "none", boxSizing: "border-box", transition: "all 0.2s" }} />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: colors.textMuted, display: "block", marginBottom: "10px" }}>Descrição Facilitadora</label>
                                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Explique brevemente o objetivo desta trilha..." rows={3} style={{ width: "100%", padding: "16px", borderRadius: "16px", border: `1.5px solid ${colors.border}`, background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", color: colors.text, fontSize: "14px", fontWeight: 500, outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.6 }} />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: colors.textMuted, display: "block", marginBottom: "12px" }}>Cor da Trilha</label>
                                <div style={{ display: "flex", gap: "12px", padding: "4px" }}>
                                    {ACCENT_OPTIONS.map(c => (
                                        <button key={c} onClick={() => setNewAccent(c)} style={{ width: "36px", height: "36px", borderRadius: "50%", background: c, border: newAccent === c ? `3px solid ${isDark ? '#fff' : '#000'}` : "none", cursor: "pointer", transition: "transform 0.2s", transform: newAccent === c ? "scale(1.15)" : "scale(1)", boxShadow: newAccent === c ? `0 0 15px ${c}80` : "none" }} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <label style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: colors.textMuted }}>Selecionar Cursos *</label>
                                    {selectedCourseIds.length > 0 && <span style={{ fontSize: "10px", fontWeight: 800, color: "#9146FF" }}>{selectedCourseIds.length} selecionados</span>}
                                </div>
                                {availableCourses.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "40px 20px", border: `2px dashed ${colors.border}`, borderRadius: "24px" }}>
                                        <p style={{ fontSize: "13px", color: colors.textMuted, fontWeight: 600 }}>Crie um curso primeiro.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto", paddingRight: "8px" }}>
                                        {availableCourses.map(course => (
                                            <CoursePickerCard key={course.id} course={course} selected={selectedCourseIds.includes(course.id)} onToggle={() => toggleCourse(course.id)} isDark={isDark} colors={colors} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ padding: "32px 40px", borderTop: `1px solid ${colors.border}`, display: "flex", gap: "16px", flexShrink: 0, background: isDark ? "rgba(255,255,255,0.02)" : "#fafafa" }}>
                            <Button variant="ghost" onClick={() => setShowPanel(false)} style={{ flex: 1, borderRadius: "14px", height: "52px", fontWeight: 700 }}>Cancelar</Button>
                            <Button onClick={handleCreate} disabled={!canCreate} style={{ flex: 2, borderRadius: "14px", height: "52px", fontWeight: 800, background: "#9146FF", color: "white", boxShadow: "0 10px 20px rgba(145,70,255,0.3)" }}>Criar Trilha</Button>
                        </div>
                    </div>
                </>
            )}

            {/* Confirm Delete Modal */}
            {confirmDeleteId !== null && (() => {
                const target = trails.find(t => t.id === confirmDeleteId);
                return (
                    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }} onClick={() => setConfirmDeleteId(null)}>
                        <div style={{ background: isDark ? "#1a1025" : "#fff", borderRadius: "24px", padding: "36px", maxWidth: "420px", width: "90%", border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 40px 80px rgba(0,0,0,0.4)" }} onClick={e => e.stopPropagation()}>
                            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                                <Trash2 size={24} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: "20px", fontWeight: 900, color: isDark ? "#f8fafc" : "#0f172a", marginBottom: "8px" }}>Excluir trilha?</h3>
                            <p style={{ fontSize: "14px", color: isDark ? "#94a3b8" : "#64748b", marginBottom: "28px", lineHeight: "1.6" }}>
                                Tem certeza que deseja excluir <strong>&ldquo;{target?.title}&rdquo;</strong>? Os cursos não serão removidos.
                            </p>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <Button variant="outline" style={{ flex: 1, borderRadius: "12px", height: "48px", fontWeight: 700 }} onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
                                <Button style={{ flex: 1, borderRadius: "12px", height: "48px", fontWeight: 800, background: "#ef4444", color: "white" }} onClick={() => handleDelete(confirmDeleteId)}>Excluir</Button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <ToastContainer toasts={toasts} onRemove={remove} />

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
