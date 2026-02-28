"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ChevronLeft,
    Play,
    FileText,
    Users,
    BookOpen,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Clock,
    Award,
    Edit2
} from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { finishLoadingWithMinimumDelay, MIN_SKELETON_MS } from "@/lib/skeleton-timing";

interface Attachment {
    id: string;
    title: string;
    url: string;
}

interface Lesson {
    id: string;
    title: string;
    videoUrl: string;
    attachments: Attachment[];
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface Course {
    id: string;
    title: string;
    description: string;
    level: string;
    status: string;
    students: number;
    lastUpdated: string;
    category: string;
    thumbnail: string;
    modules: Module[];
}

// Convert YouTube watch URL to embed URL
function toYouTubeEmbed(url: string): string {
    try {
        const u = new URL(url);
        const videoId = u.searchParams.get("v") || u.pathname.split("/").pop();
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch {
        return url;
    }
}

export default function CourseViewPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

    const colors = {
        bg: "var(--brand-bg)",
        card: "var(--brand-card)",
        text: "var(--brand-text)",
        textMuted: "var(--brand-text-muted)",
        accent: "#9146FF",
        border: "var(--brand-border)"
    };

    useEffect(() => {
        const fetchCourse = async () => {
            const startedAt = Date.now();
            setIsLoading(true);
            try {
                const [courseResp, lessonsResp] = await Promise.all([
                    api.get(`/courses/${courseId}`),
                    api.get(`/courses/${courseId}/lessons`).catch(() => ({ data: [] })),
                ]);

                const apiCourse = courseResp.data || {};
                const lessons = (lessonsResp.data || []).map((l: any) => ({
                    id: l.id,
                    title: l.title,
                    videoUrl: l.videoUrl,
                    attachments: [],
                })) as Lesson[];

                const modules: Module[] = (apiCourse.modules && apiCourse.modules.length > 0)
                    ? apiCourse.modules.map((m: any) => ({
                        id: m.id,
                        title: m.title,
                        lessons: (m.lessons || []).map((l: any) => ({
                            id: l.id,
                            title: l.title,
                            videoUrl: l.videoUrl || "",
                            attachments: [],
                        })),
                    }))
                    : [{ id: "default", title: "Conteúdo", lessons }];

                const mapped: Course = {
                    id: apiCourse.id,
                    title: apiCourse.title,
                    description: apiCourse.description || "",
                    level: apiCourse.level || "Iniciante",
                    status: apiCourse.published ? "published" : "draft",
                    students: apiCourse.studentsCount ?? apiCourse._count?.enrollments ?? 0,
                    lastUpdated: apiCourse.updatedAt ? new Date(apiCourse.updatedAt).toLocaleDateString("pt-BR") : "—",
                    category: apiCourse.category || "Geral",
                    thumbnail: apiCourse.thumbnail || "",
                    modules,
                };

                setCourse(mapped);
                const expanded: Record<string, boolean> = {};
                mapped.modules.forEach((m) => { expanded[m.id] = true; });
                setExpandedModules(expanded);
                setActiveLesson(mapped.modules[0]?.lessons[0] || null);
            } catch (e) {
                console.error("Failed to fetch creator course", e);
                setCourse(null);
            } finally {
                finishLoadingWithMinimumDelay(startedAt, () => setIsLoading(false), MIN_SKELETON_MS);
            }
        };
        fetchCourse();
    }, [courseId]);

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    if (isLoading) {
        return (
            <div style={{ background: colors.bg, minHeight: "100%", padding: "40px" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
                    <Skeleton width={200} height={24} />
                    <Skeleton width="50%" height={48} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px" }}>
                        <Skeleton width="100%" height={400} borderRadius="24px" />
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} width="100%" height={60} borderRadius="12px" />)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div style={{ background: colors.bg, minHeight: "100%", padding: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <BookOpen size={48} color={colors.accent} style={{ margin: "0 auto 16px" }} />
                    <h2 style={{ fontSize: "24px", fontWeight: 900, color: colors.text, marginBottom: "8px" }}>Curso não encontrado</h2>
                    <p style={{ color: colors.textMuted, marginBottom: "24px" }}>Este curso não foi encontrado no armazenamento local.</p>
                    <Button onClick={() => router.back()} style={{ background: colors.accent, borderRadius: "12px", height: "48px", fontWeight: 700 }}>
                        Voltar
                    </Button>
                </div>
            </div>
        );
    }

    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

    return (
        <div style={{ background: colors.bg, minHeight: "100%", padding: "40px" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <button onClick={() => router.back()} style={{ background: "none", border: "none", padding: 0, display: "flex", alignItems: "center", gap: "8px", color: colors.textMuted, cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
                            <ChevronLeft size={16} /> Voltar
                        </button>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <h1 style={{ fontSize: "32px", fontWeight: 900, color: colors.text, letterSpacing: "-1px", margin: 0 }}>{course.title}</h1>
                            <Badge style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)", fontSize: "10px", fontWeight: 900, textTransform: "uppercase" }}>
                                {course.status === "published" ? "Publicado" : "Rascunho"}
                            </Badge>
                        </div>
                        <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: colors.textMuted, fontWeight: 600 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Users size={14} /> {course.students} alunos</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><BookOpen size={14} /> {course.modules.length} módulos</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Play size={14} /> {totalLessons} aulas</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Award size={14} /> {course.level}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Clock size={14} /> {course.lastUpdated}</span>
                        </div>
                    </div>
                    <Link href={`/creator/courses/${courseId}/edit`} style={{ textDecoration: "none" }}>
                        <Button variant="outline" style={{ borderRadius: "14px", height: "48px", padding: "0 20px", fontWeight: 700, display: "flex", gap: "8px", alignItems: "center", color: colors.text }}>
                            <Edit2 size={16} /> Editar Curso
                        </Button>
                    </Link>
                </div>

                {/* Description */}
                {course.description && (
                    <Card style={{ borderRadius: "20px", border: `1px solid ${colors.border}`, background: colors.card }}>
                        <CardContent style={{ padding: "20px 24px" }}>
                            <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: "1.7", margin: 0, fontWeight: 500 }}>{course.description}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content: Player + Curriculum */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px", alignItems: "start" }}>

                    {/* Video Player */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {activeLesson ? (
                            <>
                                <div style={{ borderRadius: "20px", overflow: "hidden", background: "#000", aspectRatio: "16/9", position: "relative" }}>
                                    {activeLesson.videoUrl ? (
                                        <iframe
                                            src={toYouTubeEmbed(activeLesson.videoUrl)}
                                            style={{ width: "100%", height: "100%", border: "none" }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", color: "rgba(255,255,255,0.5)" }}>
                                            <Play size={48} />
                                            <span style={{ fontSize: "14px" }}>Sem vídeo nesta aula</span>
                                        </div>
                                    )}
                                </div>

                                {/* Lesson Info */}
                                <Card style={{ borderRadius: "20px", border: `1px solid ${colors.border}`, background: colors.card }}>
                                    <CardContent style={{ padding: "20px 24px" }}>
                                        <h2 style={{ fontSize: "18px", fontWeight: 900, color: colors.text, marginBottom: "16px" }}>{activeLesson.title}</h2>

                                        {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                                            <>
                                                <p style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: colors.textMuted, marginBottom: "10px" }}>
                                                    Materiais Complementares
                                                </p>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    {activeLesson.attachments.map(att => (
                                                        <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                                                            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "12px", background: isDark ? "rgba(145,70,255,0.08)" : "rgba(145,70,255,0.05)", border: `1px solid rgba(145,70,255,0.15)`, textDecoration: "none", color: colors.accent, fontSize: "13px", fontWeight: 700 }}>
                                                            <FileText size={16} />
                                                            {att.title || "Material PDF"}
                                                            <ExternalLink size={14} style={{ marginLeft: "auto" }} />
                                                        </a>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <div style={{ borderRadius: "20px", background: colors.card, border: `1px solid ${colors.border}`, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
                                <Play size={48} color={colors.accent} />
                                <p style={{ color: colors.textMuted, fontWeight: 700 }}>Selecione uma aula para começar</p>
                            </div>
                        )}
                    </div>

                    {/* Curriculum Sidebar */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "sticky", top: "40px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", color: colors.textMuted, paddingLeft: "4px", marginBottom: "4px" }}>
                            Conteúdo do Curso
                        </div>
                        {course.modules.map((module, mIdx) => (
                            <Card key={module.id} style={{ borderRadius: "16px", border: `1px solid ${colors.border}`, background: colors.card, overflow: "hidden" }}>
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    style={{ width: "100%", padding: "14px 16px", background: "transparent", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: colors.text }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{ width: "24px", height: "24px", borderRadius: "8px", background: "rgba(145,70,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 900, color: colors.accent, flexShrink: 0 }}>
                                            {mIdx + 1}
                                        </div>
                                        <span style={{ fontSize: "13px", fontWeight: 800, textAlign: "left" }}>{module.title}</span>
                                    </div>
                                    {expandedModules[module.id] ? <ChevronDown size={16} color={colors.textMuted} /> : <ChevronRight size={16} color={colors.textMuted} />}
                                </button>

                                {expandedModules[module.id] && (
                                    <div style={{ borderTop: `1px solid ${colors.border}` }}>
                                        {module.lessons.map((lesson, lIdx) => (
                                            <button
                                                key={lesson.id}
                                                onClick={() => setActiveLesson(lesson)}
                                                style={{
                                                    width: "100%",
                                                    padding: "12px 16px 12px 24px",
                                                    background: activeLesson?.id === lesson.id ? "rgba(145,70,255,0.08)" : "transparent",
                                                    border: "none",
                                                    borderLeft: activeLesson?.id === lesson.id ? "3px solid #9146FF" : "3px solid transparent",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                    cursor: "pointer",
                                                    textAlign: "left"
                                                }}>
                                                <Play size={14} color={activeLesson?.id === lesson.id ? "#9146FF" : colors.textMuted} fill={activeLesson?.id === lesson.id ? "#9146FF" : "none"} />
                                                <div>
                                                    <div style={{ fontSize: "13px", fontWeight: 700, color: activeLesson?.id === lesson.id ? colors.accent : colors.text }}>
                                                        {lIdx + 1}. {lesson.title}
                                                    </div>
                                                    {lesson.attachments?.length > 0 && (
                                                        <div style={{ fontSize: "11px", color: colors.textMuted, display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                                            <FileText size={11} /> {lesson.attachments.length} material(is)
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


