"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    BookOpen,
    Plus,
    Search,
    Users,
    Eye,
    Edit2,
    Trash2,
    Clock,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast, ToastContainer } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Lesson { id: string; videoUrl: string; }
interface Module { id: string; lessons: Lesson[]; }
interface Course {
    id: string;
    title: string;
    status: string;
    students: number;
    lastUpdated: string;
    category: string;
    thumbnail: string;
    modules?: Module[];
}

function getCourseThumbnail(course: Course): string {
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

const PAGE_SIZE = 8;

function DropdownMenu({ course, onDelete, isDark, colors }: {
    course: Course;
    onDelete: (id: string) => void;
    isDark: boolean;
    colors: Record<string, string>;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const items = [
        { icon: <Eye size={15} />, label: "Ver curso", color: colors.text, action: () => router.push(`/creator/courses/${course.id}`) },
        { icon: <Edit2 size={15} />, label: "Editar", color: "#9146FF", action: () => router.push(`/creator/courses/${course.id}/edit`) },
        { icon: <ExternalLink size={15} />, label: "Abrir no YouTube", color: colors.textMuted, action: () => window.open(`https://studio.youtube.com`, "_blank") },
        { icon: <Trash2 size={15} />, label: "Excluir", color: "#ef4444", action: () => { setOpen(false); onDelete(course.id); } },
    ];

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                onClick={() => setOpen(v => !v)}
                style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: open ? (isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9") : "transparent", color: colors.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s ease" }}
            >
                <MoreVertical size={18} />
            </button>

            {open && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 999, background: isDark ? "#1a1025" : "#fff", borderRadius: "16px", border: `1px solid ${colors.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", padding: "6px", minWidth: "180px", animation: "dropIn 0.15s ease" }}>
                    {items.map((item, i) => (
                        <button
                            key={i}
                            onClick={item.action}
                            style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", border: "none", background: "transparent", color: item.color, fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "background 0.12s ease", textAlign: "left" }}
                            onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "#f8fafc")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CreatorCoursesPage() {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const [isLoading, setIsLoading] = useState(true);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const { toasts, toast, remove } = useToast();

    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            try {
                const resp = await api.get("/courses");
                const mapped = (resp.data || []).map((c: any) => ({
                    id: c.id,
                    title: c.title,
                    status: c.published ? "published" : "draft",
                    students: c.studentsCount ?? 0,
                    lastUpdated: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("pt-BR") : "-",
                    category: c.category || "Geral",
                    thumbnail: c.thumbnail || "",
                    modules: c.modules,
                })) as Course[];
                setAllCourses(mapped);
            } catch (e) {
                console.error("Failed to fetch creator courses", e);
                setAllCourses([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleDelete = async (courseId: string) => {
        const target = allCourses.find(c => c.id === courseId);
        try {
            await api.delete(`/courses/${courseId}`);
            const updated = allCourses.filter(c => c.id !== courseId);
            setAllCourses(updated);
            setConfirmDeleteId(null);
            toast(`"${target?.title}" excluído`, "error", "O curso foi removido permanentemente.");
        } catch (e) {
            console.error("Failed to delete course", e);
            toast("Erro ao excluir curso", "error", "Tente novamente em instantes.");
        }
    };

    const colors = {
        bg: "var(--brand-bg)",
        card: "var(--brand-card)",
        text: "var(--brand-text)",
        textMuted: "var(--brand-text-muted)",
        border: "var(--brand-border)",
        accent: "#9146FF",
    };

    // Filter + paginate
    const filtered = allCourses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category?.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const thStyle: React.CSSProperties = {
        padding: "12px 16px",
        fontSize: "11px",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: colors.textMuted,
        textAlign: "left",
        whiteSpace: "nowrap",
    };

    return (
        <div style={{ background: colors.bg, minHeight: "100%", padding: "40px" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: colors.accent, marginBottom: "8px" }}>
                            <BookOpen size={16} />
                            <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1.5px" }}>Gestão de Conteúdo</span>
                        </div>
                        <h1 style={{ fontSize: "32px", fontWeight: 900, color: colors.text, letterSpacing: "-1.5px", margin: 0 }}>Seus Cursos</h1>
                        <p style={{ fontSize: "14px", color: colors.textMuted, fontWeight: 500, marginTop: "6px" }}>
                            {allCourses.length} {allCourses.length === 1 ? "curso" : "cursos"} no total
                        </p>
                    </div>
                    <Button asChild style={{ background: colors.accent, borderRadius: "14px", height: "50px", padding: "0 24px", fontWeight: 800, fontSize: "14px", boxShadow: "0 8px 24px rgba(145,70,255,0.35)" }}>
                        <Link href="/creator/courses/new">
                            <Plus size={18} className="mr-2" /> Novo Curso
                        </Link>
                    </Button>
                </div>

                {/* Search bar */}
                <div style={{ position: "relative", maxWidth: "480px" }}>
                    <Search size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: colors.textMuted }} />
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Buscar cursos..."
                        style={{ width: "100%", height: "44px", padding: "0 16px 0 44px", borderRadius: "14px", background: colors.card, border: `1px solid ${colors.border}`, color: colors.text, fontSize: "14px", fontWeight: 500, outline: "none" }}
                    />
                </div>

                {/* Table */}
                <div style={{ background: colors.card, borderRadius: "20px", border: `1px solid ${colors.border}`, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                                <th style={{ ...thStyle, width: "40%" }}>Curso</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Alunos</th>
                                <th style={thStyle}>Última atualização</th>
                                <th style={{ ...thStyle, textAlign: "center", width: "64px" }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                                        <td style={{ padding: "16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                                <Skeleton width={112} height={63} borderRadius="10px" />
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    <Skeleton width={200} height={16} />
                                                    <Skeleton width={100} height={12} />
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "16px" }}><Skeleton width={80} height={24} borderRadius="8px" /></td>
                                        <td style={{ padding: "16px" }}><Skeleton width={50} height={16} /></td>
                                        <td style={{ padding: "16px" }}><Skeleton width={100} height={16} /></td>
                                        <td style={{ padding: "16px", textAlign: "right" }}><Skeleton width={36} height={36} borderRadius="10px" /></td>
                                    </tr>
                                ))
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: "64px 24px", textAlign: "center" }}>
                                        <BookOpen size={40} color={colors.accent} style={{ margin: "0 auto 16px", display: "block" }} />
                                        <p style={{ fontSize: "16px", fontWeight: 800, color: colors.text, marginBottom: "8px" }}>
                                            {search ? "Nenhum curso encontrado" : "Nenhum curso criado ainda"}
                                        </p>
                                        <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "24px" }}>
                                            {search ? "Tente buscar por outro termo." : "Crie seu primeiro curso e comece a ensinar!"}
                                        </p>
                                        {!search && (
                                            <Button asChild style={{ background: colors.accent, borderRadius: "12px", height: "44px", padding: "0 20px", fontWeight: 700 }}>
                                                <Link href="/creator/courses/new">Criar Curso</Link>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((course, idx) => (
                                    <tr
                                        key={course.id}
                                        onClick={() => router.push(`/creator/courses/${course.id}`)}
                                        style={{
                                            borderBottom: idx < paginated.length - 1 ? `1px solid ${colors.border}` : "none",
                                            transition: "background 0.15s ease",
                                            cursor: "pointer"
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.02)" : "#fafafa")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                    >
                                        {/* Title column */}
                                        <td style={{ padding: "16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                                <img
                                                    src={getCourseThumbnail(course)}
                                                    alt={course.title}
                                                    style={{ width: "112px", height: "63px", borderRadius: "10px", objectFit: "cover", flexShrink: 0, background: "#ccc" }}
                                                />
                                                <div>
                                                    <p style={{ fontSize: "14px", fontWeight: 800, color: colors.text, margin: "0 0 4px" }}>{course.title}</p>
                                                    <p style={{ fontSize: "12px", color: "#8b5cf6", fontWeight: 600, margin: 0 }}>{course.category}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td style={{ padding: "16px" }}>
                                            <Badge style={{
                                                background: course.status === "published" ? "rgba(16,185,129,0.1)" : "rgba(234,179,8,0.1)",
                                                color: course.status === "published" ? "#10b981" : "#ca8a04",
                                                border: `1px solid ${course.status === "published" ? "rgba(16,185,129,0.25)" : "rgba(234,179,8,0.25)"}`,
                                                fontSize: "10px",
                                                fontWeight: 900,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                            }}>
                                                {course.status === "published" ? "Publicado" : "Rascunho"}
                                            </Badge>
                                        </td>

                                        {/* Students */}
                                        <td style={{ padding: "16px" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: colors.textMuted, fontWeight: 600 }}>
                                                <Users size={14} /> {course.students}
                                            </span>
                                        </td>

                                        {/* Last updated */}
                                        <td style={{ padding: "16px" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: colors.textMuted, fontWeight: 600 }}>
                                                <Clock size={14} /> {course.lastUpdated}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ padding: "16px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
                                            <DropdownMenu
                                                course={course}
                                                onDelete={() => setConfirmDeleteId(course.id)}
                                                isDark={isDark}
                                                colors={colors}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination footer */}
                    {!isLoading && filtered.length > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: `1px solid ${colors.border}` }}>
                            <span style={{ fontSize: "13px", color: colors.textMuted, fontWeight: 600 }}>
                                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} &nbsp;·&nbsp; Página {safePage} de {totalPages}
                            </span>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={safePage === 1}
                                    style={{ display: "flex", alignItems: "center", gap: "6px", height: "36px", padding: "0 14px", borderRadius: "10px", border: `1px solid ${colors.border}`, background: "transparent", color: safePage === 1 ? colors.textMuted : colors.text, fontWeight: 700, fontSize: "13px", cursor: safePage === 1 ? "not-allowed" : "pointer", opacity: safePage === 1 ? 0.5 : 1, transition: "all 0.15s ease" }}
                                >
                                    <ChevronLeft size={16} /> Anterior
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={safePage === totalPages}
                                    style={{ display: "flex", alignItems: "center", gap: "6px", height: "36px", padding: "0 14px", borderRadius: "10px", border: `1px solid ${colors.border}`, background: "transparent", color: safePage === totalPages ? colors.textMuted : colors.text, fontWeight: 700, fontSize: "13px", cursor: safePage === totalPages ? "not-allowed" : "pointer", opacity: safePage === totalPages ? 0.5 : 1, transition: "all 0.15s ease" }}
                                >
                                    Próxima <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Delete Modal */}
            {confirmDeleteId !== null && (() => {
                const target = allCourses.find(c => c.id === confirmDeleteId);
                return (
                    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }} onClick={() => setConfirmDeleteId(null)}>
                        <div style={{ background: isDark ? "#1a1025" : "#fff", borderRadius: "24px", padding: "36px", maxWidth: "420px", width: "90%", border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 40px 80px rgba(0,0,0,0.4)" }} onClick={e => e.stopPropagation()}>
                            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                                <Trash2 size={24} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: "20px", fontWeight: 900, color: isDark ? "#f8fafc" : "#0f172a", marginBottom: "8px" }}>Excluir curso?</h3>
                            <p style={{ fontSize: "14px", color: isDark ? "#94a3b8" : "#64748b", marginBottom: "28px", lineHeight: "1.6" }}>
                                Tem certeza que deseja excluir <strong>&ldquo;{target?.title}&rdquo;</strong>? Essa ação não pode ser desfeita.
                            </p>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <Button variant="outline" style={{ flex: 1, borderRadius: "12px", height: "48px", fontWeight: 700 }} onClick={() => setConfirmDeleteId(null)}>
                                    Cancelar
                                </Button>
                                <Button style={{ flex: 1, borderRadius: "12px", height: "48px", fontWeight: 800, background: "#ef4444", color: "white" }} onClick={() => handleDelete(confirmDeleteId)}>
                                    Excluir
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <ToastContainer toasts={toasts} onRemove={remove} />

            <style>{`
                @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}




