"use client";

import { useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    PlayCircle,
    Lock,
    MessageSquare,
    FileText,
    ExternalLink,
    Calendar,
    Users
} from "lucide-react";
import { useTheme } from "next-themes";
import { VideoPlayer } from "@/components/courses/video-player";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

interface Lesson {
    id: string;
    title: string;
    videoUrl: string;
    attachments?: { id?: string; title?: string; type?: string; url?: string }[];
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface Course {
    id: string;
    title: string;
    modules?: Module[];
}

export default function LessonViewPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseId as string;
    const lessonId = params.lessonId as string;

    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [course, setCourse] = useState<Course | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [allLessons, setAllLessons] = useState<Lesson[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        try {
            const storedCourses: Course[] = JSON.parse(localStorage.getItem("creator_published_courses") || "[]");
            const foundCourse = storedCourses.find(c => c.id === courseId);

            if (foundCourse) {
                setCourse(foundCourse);

                // Flatten lessons from all modules for easier navigation
                const lessonsList: Lesson[] = [];
                foundCourse.modules?.forEach(mod => {
                    if (mod.lessons) {
                        lessonsList.push(...mod.lessons);
                    }
                });

                setAllLessons(lessonsList);

                const currentLesson = lessonsList.find(l => l.id === lessonId) || lessonsList[0];
                setActiveLesson(currentLesson || null);
            }

            const storedCompleted: Record<string, boolean> = JSON.parse(localStorage.getItem("student_completed_lessons") || "{}");
            setCompletedLessons(storedCompleted);

        } catch (e) {
            console.error("Failed to load course", e);
        }

        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", checkMobile);
        };
    }, [courseId, lessonId]);

    if (!mounted) return null;

    const colors = {
        bg: "var(--brand-bg)",
        card: "var(--brand-card)",
        text: "var(--brand-text)",
        textMuted: "var(--brand-text-muted)",
        accent: "var(--brand-accent)",
        border: "var(--brand-border)"
    };

    if (!isLoading && !course) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: "20px", color: colors.textMuted }}>
                <h2 style={{ fontSize: "20px", fontWeight: 800 }}>Curso não encontrado.</h2>
                <Link href="/catalog" style={{ padding: "12px 24px", borderRadius: "12px", background: colors.accent, color: "white", textDecoration: "none", fontWeight: 800 }}>
                    Voltar ao Catálogo
                </Link>
            </div>
        );
    }

    const currentLessonIndex = activeLesson ? allLessons.findIndex(l => l.id === activeLesson.id) : -1;
    const hasNextLesson = currentLessonIndex !== -1 && currentLessonIndex < allLessons.length - 1;

    const navigateToLesson = (targetLessonId: string) => {
        router.push(`/courses/${courseId}/lessons/${targetLessonId}`);
    };

    const handleNextLesson = () => {
        if (hasNextLesson) {
            const nextLesson = allLessons[currentLessonIndex + 1];
            if (nextLesson) {
                navigateToLesson(nextLesson.id);
            }
        }
    };

    const handleLessonComplete = () => {
        if (!activeLesson) return;

        const updatedCompleted = { ...completedLessons, [activeLesson.id]: true };
        setCompletedLessons(updatedCompleted);
        localStorage.setItem("student_completed_lessons", JSON.stringify(updatedCompleted));

        // Recalculate course progress
        if (allLessons.length > 0) {
            const courseCompletedCount = allLessons.filter(l => updatedCompleted[l.id]).length;
            const progressPercentage = Math.round((courseCompletedCount / allLessons.length) * 100);

            const storedProgress: Record<string, number> = JSON.parse(localStorage.getItem("student_progress") || "{}");
            storedProgress[courseId] = progressPercentage;
            localStorage.setItem("student_progress", JSON.stringify(storedProgress));
        }

        // Auto advance if there's a next lesson
        if (hasNextLesson) {
            handleNextLesson();
        }
    };

    return (
        <div style={{ background: colors.bg, minHeight: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : (isSidebarOpen ? "1fr 380px" : "1fr"),
                height: isMobile ? "auto" : "calc(100vh - 72px)",
                transition: "grid-template-columns 0.4s ease"
            }}>
                {/* Main Content (Player & Notes) */}
                <div style={{ overflowY: isMobile ? "visible" : "auto", padding: isMobile ? "20px" : "40px", display: "flex", flexDirection: "column", gap: "32px" }}>
                    {isLoading || !activeLesson ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <Skeleton height={600} borderRadius="32px" />
                            <Skeleton width="60%" height={32} />
                            <Skeleton width="40%" height={20} />
                        </div>
                    ) : (
                        <>
                            {/* Navigation Top Bar */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Link href="/trails" style={{ display: "flex", alignItems: "center", gap: "8px", color: colors.textMuted, textDecoration: "none", fontSize: "14px", fontWeight: 700 }}>
                                    <ChevronLeft size={16} /> Voltar
                                </Link>
                            </div>

                            {/* Video Player Section */}
                            <div style={{ margin: isMobile ? "-20px -20px 0 -20px" : "-40px -40px 0 -40px", background: "#000" }}>
                                <VideoPlayer
                                    url={activeLesson.videoUrl}
                                    title={activeLesson.title}
                                    aspectRatio="16 / 9"
                                    borderRadius="0"
                                />
                            </div>

                            {/* Lesson Info */}
                            <div style={{ position: "relative" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                                    <span style={{ fontSize: "12px", fontWeight: 900, color: colors.accent, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                                        Aula {currentLessonIndex + 1} de {allLessons.length}
                                    </span>

                                    {!completedLessons[activeLesson.id] && (
                                        <button
                                            onClick={handleLessonComplete}
                                            style={{
                                                display: "flex", alignItems: "center", gap: "8px",
                                                padding: "8px 16px", borderRadius: "8px",
                                                background: isDark ? "rgba(59, 130, 246, 0.1)" : "#eff6ff",
                                                color: colors.accent, border: `1px solid ${colors.accent}`,
                                                fontSize: "13px", fontWeight: 800, cursor: "pointer",
                                            }}
                                        >
                                            <CheckCircle2 size={16} /> Marcar como Concluída
                                        </button>
                                    )}
                                    {completedLessons[activeLesson.id] && (
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: "8px",
                                            padding: "8px 16px", borderRadius: "8px",
                                            background: "none", color: "#10b981",
                                            fontSize: "13px", fontWeight: 800
                                        }}>
                                            <CheckCircle2 size={16} /> Aula Concluída
                                        </div>
                                    )}
                                </div>
                                <h1 style={{ fontSize: "32px", fontWeight: 900, color: colors.text, letterSpacing: "-1px", marginBottom: "16px" }}>{activeLesson.title}</h1>
                            </div>

                            {/* Materials Area */}
                            <div style={{ marginTop: "40px", borderTop: `1px solid ${colors.border}`, paddingTop: "40px" }}>
                                <div style={{ display: "flex", gap: "32px", marginBottom: "32px" }}>
                                    <h2 style={{ fontSize: "20px", fontWeight: 800, color: colors.text }}>Materiais da Aula</h2>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {activeLesson.attachments && activeLesson.attachments.length > 0 ? (
                                        activeLesson.attachments.map((material, idx) => (
                                            <a key={idx} href={material.url || "#"} target="_blank" rel="noopener noreferrer" style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "16px",
                                                padding: "20px",
                                                borderRadius: "16px",
                                                background: colors.card,
                                                border: `1px solid ${colors.border}`,
                                                textDecoration: "none",
                                                color: colors.text,
                                                transition: "all 0.2s ease",
                                            }}>
                                                <div style={{
                                                    width: "48px",
                                                    height: "48px",
                                                    borderRadius: "12px",
                                                    background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: colors.accent
                                                }}>
                                                    <FileText size={24} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "4px" }}>{material.title || `Material Complementar ${idx + 1}`}</h4>
                                                    <p style={{ fontSize: "13px", color: colors.textMuted, margin: 0 }}>{material.type || "Documento em PDF"}</p>
                                                </div>
                                                <div style={{ padding: "8px", background: isDark ? "rgba(59, 130, 246, 0.1)" : "#eff6ff", borderRadius: "50%", color: colors.accent }}>
                                                    <ExternalLink size={18} />
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <div style={{
                                            padding: "40px 20px",
                                            textAlign: "center",
                                            border: `2px dashed ${colors.border}`,
                                            borderRadius: "16px",
                                            background: isDark ? "rgba(255,255,255,0.02)" : "#fafafa",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "12px"
                                        }}>
                                            <FileText size={32} style={{ color: colors.textMuted, opacity: 0.5 }} />
                                            <div>
                                                <h3 style={{ fontSize: "16px", fontWeight: 800, color: colors.text, marginBottom: "4px" }}>Nenhum material disponível</h3>
                                                <p style={{ fontSize: "14px", color: colors.textMuted, margin: 0 }}>Esta aula não possui materiais complementares.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar (Lesson List) */}
                {(isSidebarOpen || isMobile) && (
                    <div style={{
                        background: colors.card,
                        borderLeft: isMobile ? "none" : `1px solid ${colors.border}`,
                        borderTop: isMobile ? `1px solid ${colors.border}` : "none",
                        display: "flex",
                        flexDirection: "column",
                        overflow: isMobile ? "visible" : "hidden",
                        minHeight: isMobile ? "500px" : "auto"
                    }}>
                        <div style={{ padding: "32px", borderBottom: `1px solid ${colors.border}` }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 900, color: colors.text, marginBottom: "8px" }}>{course?.title || "Conteúdo do Curso"}</h3>
                        </div>

                        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {course?.modules?.map((module, mIdx) => (
                                    <div key={module.id} style={{ marginBottom: "16px" }}>
                                        <h4 style={{ fontSize: "14px", fontWeight: 800, color: colors.text, margin: "0 0 8px 8px" }}>
                                            {module.title.toLowerCase().startsWith('módulo') || module.title.toLowerCase().startsWith('modulo')
                                                ? module.title
                                                : `Módulo ${mIdx + 1}: ${module.title}`}
                                        </h4>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                            {module.lessons?.map((lesson) => {
                                                const isActive = activeLesson?.id === lesson.id;
                                                return (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => navigateToLesson(lesson.id)}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "14px",
                                                            padding: "12px",
                                                            borderRadius: "12px",
                                                            background: isActive ? (isDark ? "rgba(59, 130, 246, 0.1)" : "#eff6ff") : "transparent",
                                                            border: isActive ? `1px solid ${colors.accent}40` : "1px solid transparent",
                                                            textAlign: "left",
                                                            cursor: "pointer",
                                                            transition: "all 0.2s ease"
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: "28px",
                                                            height: "28px",
                                                            borderRadius: "8px",
                                                            background: isActive ? colors.accent : (completedLessons[lesson.id] ? "#10b981" : (isDark ? "#1e293b" : "#f1f5f9")),
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: (isActive || completedLessons[lesson.id]) ? "white" : colors.textMuted,
                                                            flexShrink: 0
                                                        }}>
                                                            {completedLessons[lesson.id] ? <CheckCircle2 size={16} /> : <PlayCircle size={16} />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ fontSize: "13px", fontWeight: 800, color: isActive ? colors.accent : colors.text, margin: 0 }}>{lesson.title}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {hasNextLesson && (
                            <div style={{ padding: "24px", borderTop: `1px solid ${colors.border}`, background: isDark ? "rgba(0,0,0,0.2)" : "#fafafa" }}>
                                <button
                                    onClick={handleNextLesson}
                                    style={{
                                        width: "100%",
                                        padding: "16px",
                                        borderRadius: "14px",
                                        background: colors.accent,
                                        color: "white",
                                        border: "none",
                                        fontWeight: 900,
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        boxShadow: `0 10px 20px ${colors.accent}30`
                                    }}
                                >
                                    Próxima Aula <ChevronRight size={18} style={{ display: "inline", marginLeft: "4px" }} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
