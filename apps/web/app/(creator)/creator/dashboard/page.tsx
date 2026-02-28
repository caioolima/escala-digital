"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    BookOpen,
    Users,
    Video,
    TrendingUp,
    Plus,
    Clock,
    Eye,
    Edit2,
    FileEdit,
    CheckCircle2,
    Layers,
    ArrowRight
} from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

interface Lesson { id: string; videoUrl: string; }
interface Module { id: string; lessons: Lesson[]; }
interface Course {
    id: string;
    title: string;
    description?: string;
    thumbnail: string;
    status: string;
    students: number;
    lastUpdated: string;
    updatedAt?: string;
    category: string;
    lessonsCount?: number;
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

export default function CreatorDashboardPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const [courses, setCourses] = useState<Course[]>([]);
    const [companyStudentsCount, setCompanyStudentsCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [courseFilter, setCourseFilter] = useState<"recent" | "published" | "draft">("recent");

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const [coursesResp, companyStatsResp] = await Promise.all([
                    api.get("/courses"),
                    api.get("/auth/company/stats").catch(() => ({ data: { studentsCount: 0 } })),
                ]);
                const resp = coursesResp;
                const data = (resp.data || []).map((c: any) => ({
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    thumbnail: c.thumbnail || "",
                    status: c.published ? "published" : "draft",
                    students: c.studentsCount ?? 0,
                    lastUpdated: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("pt-BR") : "—",
                    updatedAt: c.updatedAt || undefined,
                    category: c.category || "Geral",
                    lessonsCount: c.lessonsCount ?? 0,
                    modules: c.modules,
                })) as Course[];
                setCourses(data);
                setCompanyStudentsCount(companyStatsResp.data?.studentsCount ?? 0);
            } catch (e) {
                console.error("Failed to fetch creator dashboard courses", e);
                setCourses([]);
                setCompanyStudentsCount(0);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const colors = {
        bg: "var(--brand-bg)",
        card: "var(--brand-card)",
        text: "var(--brand-text)",
        textMuted: "var(--brand-text-muted)",
        border: "var(--brand-border)",
        accent: "#9146FF",
    };

    const totalStudents = companyStudentsCount;
    const totalLessons = courses.reduce((acc, c) => acc + (c.lessonsCount ?? c.modules?.flatMap(m => m.lessons).length ?? 0), 0);
    const publishedCount = courses.filter(c => c.status === "published").length;
    const draftCount = courses.length - publishedCount;

    const filteredCourses = useMemo(() => {
        const sorted = [...courses].sort((a, b) => {
            const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return tb - ta;
        });
        if (courseFilter === "published") return sorted.filter((c) => c.status === "published");
        if (courseFilter === "draft") return sorted.filter((c) => c.status === "draft");
        return sorted;
    }, [courses, courseFilter]);

    const stats = [
        { label: "Total de alunos", value: totalStudents, icon: Users, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
        { label: "Cursos publicados", value: publishedCount, icon: CheckCircle2, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
        { label: "Total de aulas", value: totalLessons, icon: Video, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
        { label: "Rascunhos", value: draftCount, icon: FileEdit, color: "#9146FF", bg: "rgba(145,70,255,0.1)" },
    ];

    return (
        <div style={{ background: colors.bg, minHeight: "100%", padding: "40px 24px" }}>
            <style>{`
                .dash-pill {
                    padding: 10px 14px;
                    border-radius: 999px;
                    border: 1px solid ${colors.border};
                    background: transparent;
                    color: ${colors.textMuted};
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.02em;
                    cursor: pointer;
                    transition: all 0.18s ease;
                    white-space: nowrap;
                }
                .dash-pill:hover { transform: translateY(-1px); }
                .dash-pill.active {
                    background: ${colors.accent};
                    color: white;
                    border-color: ${colors.accent};
                    box-shadow: 0 12px 30px rgba(145,70,255,0.28);
                }
                .quick-card {
                    border-radius: 18px;
                    border: 1px solid ${colors.border};
                    background: ${colors.card};
                    transition: transform 0.18s ease, box-shadow 0.18s ease;
                }
                .quick-card:hover { transform: translateY(-2px); box-shadow: 0 18px 50px rgba(0,0,0,0.12); }
            `}</style>
            <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: colors.accent, marginBottom: "8px" }}>
                            <TrendingUp size={16} />
                            <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1.5px" }}>Visão Geral</span>
                        </div>
                        <h1 style={{ fontSize: "32px", fontWeight: 900, color: colors.text, letterSpacing: "-1.5px", margin: 0 }}>Dashboard</h1>
                        <p style={{ fontSize: "14px", color: colors.textMuted, fontWeight: 500, marginTop: "6px", maxWidth: "460px" }}>
                            Acompanhe os indicadores principais e mantenha o ritmo das suas turmas.
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
                    {stats.map(stat => (
                        <Card key={stat.label} style={{ borderRadius: "20px", border: `1px solid ${colors.border}`, background: colors.card }}>
                            <CardContent style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 12px 30px ${stat.color}30` }}>
                                    <stat.icon size={22} color={stat.color} />
                                </div>
                                <div>
                                    <p style={{ fontSize: "28px", fontWeight: 900, color: colors.text, margin: 0, lineHeight: 1 }}>
                                        {loading ? "..." : stat.value}
                                    </p>
                                    <p style={{ fontSize: "12px", color: colors.textMuted, fontWeight: 600, margin: "4px 0 0" }}>{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions + Next Steps */}
                <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "18px", alignItems: "start" }}>
                    <Card style={{ borderRadius: "22px", border: `1px solid ${colors.border}`, background: colors.card }}>
                        <CardContent style={{ padding: "22px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <p style={{ margin: 0, fontSize: "12px", fontWeight: 900, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                                        Acoes rapidas
                                    </p>
                                    <p style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: colors.text }}>
                                        O que voce quer fazer agora?
                                    </p>
                                </div>
                                <Link href="/creator/courses" style={{ fontSize: "13px", fontWeight: 800, color: colors.accent, textDecoration: "none" }}>
                                    Gerenciar <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
                                </Link>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
                                <Link href="/creator/courses/new" style={{ textDecoration: "none" }}>
                                    <div className="quick-card" style={{ padding: "14px" }}>
                                        <div style={{ width: "42px", height: "42px", borderRadius: "14px", background: "rgba(145,70,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                                            <Plus size={18} color={colors.accent} />
                                        </div>
                                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 900, color: colors.text }}>Criar curso</p>
                                        <p style={{ margin: "6px 0 0", fontSize: "12px", fontWeight: 600, color: colors.textMuted, lineHeight: 1.4 }}>Monte um curso e publique quando estiver pronto.</p>
                                    </div>
                                </Link>
                                <Link href="/creator/courses" style={{ textDecoration: "none" }}>
                                    <div className="quick-card" style={{ padding: "14px" }}>
                                        <div style={{ width: "42px", height: "42px", borderRadius: "14px", background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                                            <BookOpen size={18} color="#10b981" />
                                        </div>
                                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 900, color: colors.text }}>Cursos</p>
                                        <p style={{ margin: "6px 0 0", fontSize: "12px", fontWeight: 600, color: colors.textMuted, lineHeight: 1.4 }}>Edite, publique e acompanhe os conteudos.</p>
                                    </div>
                                </Link>
                                <Link href="/creator/trails" style={{ textDecoration: "none" }}>
                                    <div className="quick-card" style={{ padding: "14px" }}>
                                        <div style={{ width: "42px", height: "42px", borderRadius: "14px", background: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                                            <Layers size={18} color="#3b82f6" />
                                        </div>
                                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 900, color: colors.text }}>Trilhas</p>
                                        <p style={{ margin: "6px 0 0", fontSize: "12px", fontWeight: 600, color: colors.textMuted, lineHeight: 1.4 }}>Organize cursos em jornadas para alunos.</p>
                                    </div>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card style={{ borderRadius: "22px", border: `1px solid ${colors.border}`, background: colors.card }}>
                        <CardContent style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <p style={{ margin: 0, fontSize: "12px", fontWeight: 900, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                                Proximos passos
                            </p>
                            <p style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: colors.text }}>
                                Checklist para deixar tudo redondo
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>
                                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                    <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: colors.accent, marginTop: "5px" }} />
                                    <div>
                                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: colors.text }}>Publique pelo menos 1 curso</p>
                                        <p style={{ margin: "4px 0 0", fontSize: "12px", fontWeight: 600, color: colors.textMuted, lineHeight: 1.4 }}>
                                            Hoje voce tem {publishedCount} publicado(s) e {draftCount} rascunho(s).
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                    <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: "rgba(255,255,255,0.18)", marginTop: "5px" }} />
                                    <div>
                                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: colors.text }}>Crie uma trilha inicial</p>
                                        <p style={{ margin: "4px 0 0", fontSize: "12px", fontWeight: 600, color: colors.textMuted, lineHeight: 1.4 }}>
                                            Trilhas aumentam adesao e deixam o caminho claro.
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                    <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: "rgba(255,255,255,0.18)", marginTop: "5px" }} />
                                    <div>
                                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: colors.text }}>Convide alunos</p>
                                        <p style={{ margin: "4px 0 0", fontSize: "12px", fontWeight: 600, color: colors.textMuted, lineHeight: 1.4 }}>
                                            Voce tem {totalStudents} aluno(s) cadastrado(s) na companhia.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Courses */}
                <div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: 900, color: colors.text, margin: 0 }}>Cursos</h2>
                            <Link href="/creator/courses" style={{ fontSize: "13px", fontWeight: 800, color: colors.accent, textDecoration: "none" }}>
                                Ver todos →
                            </Link>
                        </div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button className={"dash-pill" + (courseFilter === "recent" ? " active" : "")} onClick={() => setCourseFilter("recent")}>
                                Recentes
                            </button>
                            <button className={"dash-pill" + (courseFilter === "published" ? " active" : "")} onClick={() => setCourseFilter("published")}>
                                Publicados ({publishedCount})
                            </button>
                            <button className={"dash-pill" + (courseFilter === "draft" ? " active" : "")} onClick={() => setCourseFilter("draft")}>
                                Rascunhos ({draftCount})
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} style={{ borderRadius: "20px", overflow: "hidden", border: `1px solid ${colors.border}`, background: colors.card }}>
                                    <Skeleton width="100%" height={158} />
                                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                        <Skeleton width="70%" height={18} />
                                        <Skeleton width="40%" height={13} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "64px 24px", border: `1px dashed ${colors.border}`, borderRadius: "20px", background: colors.card }}>
                            <BookOpen size={40} color={colors.accent} style={{ margin: "0 auto 16px", display: "block" }} />
                            <p style={{ fontSize: "16px", fontWeight: 800, color: colors.text, marginBottom: "8px" }}>
                                {courseFilter === "published" ? "Nenhum curso publicado" : (courseFilter === "draft" ? "Nenhum rascunho" : "Nenhum curso ainda")}
                            </p>
                            <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "24px" }}>
                                {courseFilter === "published"
                                    ? "Publique um curso para liberar acesso aos alunos."
                                    : (courseFilter === "draft"
                                        ? "Crie um curso e salve como rascunho para editar depois."
                                        : "Crie seu primeiro curso e comece a ensinar!")}
                            </p>
                            <Button asChild style={{ background: colors.accent, borderRadius: "12px", height: "44px", padding: "0 20px", fontWeight: 700 }}>
                                <Link href="/creator/courses/new">Criar Curso</Link>
                            </Button>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                            {filteredCourses.slice(0, 8).map(course => (
                                <div key={course.id} style={{ borderRadius: "20px", overflow: "hidden", border: `1px solid ${colors.border}`, background: colors.card, display: "flex", flexDirection: "column", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                                >
                                    {/* Thumbnail */}
                                    <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                                        <img
                                            src={getCourseThumbnail(course)}
                                            alt={course.title}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
                                        <Badge style={{ position: "absolute", top: "12px", left: "12px", background: course.status === "published" ? "rgba(16,185,129,0.9)" : "rgba(245,158,11,0.9)", color: "white", border: "none", fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>
                                            {course.status === "published" ? "Publicado" : "Rascunho"}
                                        </Badge>
                                    </div>

                                    {/* Info */}
                                    <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                                        <p style={{ fontSize: "15px", fontWeight: 800, color: colors.text, margin: 0, lineHeight: 1.3 }}>{course.title}</p>
                                        <p style={{ fontSize: "12px", color: "#8b5cf6", fontWeight: 600, margin: 0 }}>{course.category}</p>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: colors.textMuted, fontWeight: 600, marginTop: "4px" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Users size={12} /> {course.students} alunos</span>
                                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> {course.lastUpdated}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ padding: "12px 16px", borderTop: `1px solid ${colors.border}`, display: "flex", gap: "8px" }}>
                                        <Button asChild variant="ghost" size="sm" style={{ flex: 1, borderRadius: "10px", fontSize: "12px", fontWeight: 700, color: colors.textMuted }}>
                                            <Link href={`/creator/courses/${course.id}`}>
                                                <Eye size={14} className="mr-1" /> Ver
                                            </Link>
                                        </Button>
                                        <Button asChild size="sm" style={{ flex: 1, borderRadius: "10px", fontSize: "12px", fontWeight: 700, background: colors.accent, color: "white" }}>
                                            <Link href={`/creator/courses/${course.id}/edit`}>
                                                <Edit2 size={14} className="mr-1" /> Editar
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}


