"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
    Users,
    Star,
    Sparkles,
    CheckCircle
} from "lucide-react";
import { useTheme } from "next-themes";
import { VideoPlayer } from "@/components/courses/video-player";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { api } from "@/lib/api";
import { finishLoadingWithMinimumDelay, MIN_SKELETON_MS } from "@/lib/skeleton-timing";

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
    const { showToast } = useToast();
    const params = useParams();
    const { user } = useAuth();
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
    const [isCourseFinished, setIsCourseFinished] = useState(false);
    const [showEvaluation, setShowEvaluation] = useState(false);
    const [rating, setRating] = useState(0);
    const [evaluationText, setEvaluationText] = useState("");
    const [hasEvaluated, setHasEvaluated] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        const fetchLessonData = async () => {
            const startedAt = Date.now();
            setIsLoading(true);
            try {
                // Fetch course details with modules/lessons from API
                const response = await api.get(`/courses/${courseId}`);
                const foundCourse = response.data;
                setCourse(foundCourse);

                // Flatten lessons from all modules for easier navigation
                const lessonsList: Lesson[] = [];
                if (foundCourse.modules && foundCourse.modules.length > 0) {
                    foundCourse.modules.forEach((mod: any) => {
                        if (mod.lessons) {
                            lessonsList.push(...mod.lessons);
                        }
                    });
                } else if (foundCourse.lessons) {
                    lessonsList.push(...foundCourse.lessons);
                }

                setAllLessons(lessonsList);

                const currentLesson = lessonsList.find(l => l.id === lessonId) || lessonsList[0];
                setActiveLesson(currentLesson || null);

                // Fetch real progress from API
                const progressResp = await api.get(`/courses/${courseId}/progress`);
                const progressData = progressResp.data;

                const completedMap: Record<string, boolean> = {};
                progressData.completedLessonIds?.forEach((id: string) => {
                    completedMap[id] = true;
                });
                setCompletedLessons(completedMap);

                // Finish status based on all lessons completed + hasReviewed
                const allDone = lessonsList.length > 0 && lessonsList.every(l => completedMap[l.id]);
                setIsCourseFinished(allDone);
                setHasEvaluated(foundCourse.hasReviewed || false);
            } catch (e) {
                console.error("Failed to load lesson data", e);
            } finally {
                finishLoadingWithMinimumDelay(startedAt, () => setIsLoading(false), MIN_SKELETON_MS);
            }
        };

        if (courseId && lessonId) {
            fetchLessonData();
        }

        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, [courseId, lessonId]);

    if (!mounted) {
        return (
            <div style={{ background: "var(--brand-bg)", minHeight: "100%" }}>
                <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    <Skeleton height={600} borderRadius="32px" />
                    <Skeleton width="60%" height={32} />
                    <Skeleton width="40%" height={20} />
                </div>
            </div>
        );
    }

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

    const handleLessonComplete = async () => {
        if (!activeLesson) return;

        try {
            // Call completion API
            await api.post(`/courses/${courseId}/lessons/${activeLesson.id}/complete`);

            const updatedCompleted = { ...completedLessons, [activeLesson.id]: true };
            setCompletedLessons(updatedCompleted);

            // local state backup for instant feedback
            localStorage.setItem("student_completed_lessons", JSON.stringify(updatedCompleted));

            showToast("Aula Concluída!", "success");

            // Auto advance
            if (hasNextLesson) {
                handleNextLesson();
            }
        } catch (e) {
            console.error("Failed to mark lesson complete", e);
        }
    };

    const handleFinishCourse = () => {
        console.log("Finishing course, opening evaluation modal...");
        setShowEvaluation(true);
    };

    const handleSaveEvaluation = async () => {
        if (rating === 0) return;

        try {
            await api.post(`/reviews/${courseId}`, {
                rating,
                comment: evaluationText
            });

            setHasEvaluated(true);
            setShowEvaluation(false);

            showToast("Curso Finalizado! Parabéns.", "premium");
            showToast("Feedback Enviado! Obrigado.", "success");
            router.push("/dashboard");
        } catch (e) {
            console.error("Failed to save evaluation", e);
            showToast("Erro ao enviar avaliação. Tente novamente.", "error");
        }
    };

    const isLastLesson = currentLessonIndex === allLessons.length - 1;
    const allLessonsCompleted = allLessons.length > 0 && allLessons.every(l => completedLessons[l.id]);
    const canFinishCourse = isLastLesson && allLessonsCompleted && !hasEvaluated;

    return (
        <div style={{ background: colors.bg, minHeight: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : (isSidebarOpen ? "1fr 400px" : "1fr"),
                height: isMobile ? "auto" : "calc(100vh - 72px)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative"
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
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "0 0 20px 0",
                                borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
                                marginBottom: "20px"
                            }}>
                                <Link href="/catalog" style={{
                                    display: "flex", alignItems: "center", gap: "8px",
                                    color: colors.textMuted, textDecoration: "none",
                                    fontSize: "13px", fontWeight: 700,
                                    padding: "8px 16px", borderRadius: "10px",
                                    background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    border: `1px solid ${colors.border}`
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "#fff";
                                        e.currentTarget.style.color = colors.accent;
                                        e.currentTarget.style.transform = "translateX(-4px)";
                                        e.currentTarget.style.borderColor = colors.accent + "40";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
                                        e.currentTarget.style.color = colors.textMuted;
                                        e.currentTarget.style.transform = "translateX(0)";
                                        e.currentTarget.style.borderColor = colors.border;
                                    }}
                                >
                                    <ChevronLeft size={16} /> Voltar ao Catálogo
                                </Link>

                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMuted, fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
                                    <span>{course?.title}</span>
                                    <ChevronRight size={14} />
                                    <span style={{ color: colors.accent }}>{activeLesson.title}</span>
                                </div>
                            </div>

                            {/* Video Player Section - Cinema Mode */}
                            <div style={{
                                margin: isMobile ? "-20px -20px 0 -20px" : "-20px -40px 0 -40px",
                                background: "#000",
                                position: "relative",
                                boxShadow: "0 50px 100px -20px rgba(0,0,0,0.5)",
                                borderBottom: isDark ? "1px solid rgba(255,255,255,0.1)" : "none"
                            }}>
                                <div style={{ position: "relative", zIndex: 1 }}>
                                    <VideoPlayer
                                        url={activeLesson.videoUrl}
                                        title={activeLesson.title}
                                        aspectRatio="21 / 9"
                                        borderRadius="0"
                                        onComplete={handleLessonComplete}
                                    />
                                </div>
                                {/* Ambient Light Effect */}
                                <div style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: `radial-gradient(circle at 50% 50%, ${colors.accent}15 0%, transparent 70%)`,
                                    pointerEvents: "none",
                                    zIndex: 0
                                }} />
                            </div>

                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                                padding: "32px 0"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: colors.accent, marginBottom: "12px" }}>
                                            <div style={{ width: "24px", height: "1px", background: colors.accent }}></div>
                                            <span style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "2px" }}>
                                                Aula {currentLessonIndex + 1} de {allLessons.length}
                                            </span>
                                        </div>
                                        <h1 style={{
                                            fontSize: "clamp(28px, 4vw, 42px)",
                                            fontWeight: 900,
                                            color: colors.text,
                                            letterSpacing: "-2px",
                                            lineHeight: 1,
                                            margin: 0
                                        }}>{activeLesson.title}</h1>
                                    </div>

                                    {!completedLessons[activeLesson.id] ? (
                                        <button
                                            onClick={handleLessonComplete}
                                            style={{
                                                display: "flex", alignItems: "center", gap: "10px",
                                                padding: "18px 36px", borderRadius: "18px",
                                                background: colors.accent,
                                                color: "white", border: "none",
                                                fontSize: "16px", fontWeight: 900, cursor: "pointer",
                                                boxShadow: `0 20px 40px ${colors.accent}40`,
                                                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                                                e.currentTarget.style.boxShadow = `0 25px 50px ${colors.accent}60`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = "translateY(0) scale(1)";
                                                e.currentTarget.style.boxShadow = `0 20px 40px ${colors.accent}40`;
                                            }}
                                        >
                                            <CheckCircle2 size={22} fill="white" color={colors.accent} /> Marcar como Concluída
                                        </button>
                                    ) : (
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: "12px",
                                                padding: "14px 28px", borderRadius: "14px",
                                                background: "#10b98115", color: "#10b981",
                                                fontSize: "15px", fontWeight: 900,
                                                border: "1px solid #10b98130"
                                            }}>
                                                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
                                                Aula Concluída
                                            </div>

                                            {canFinishCourse && (
                                                <button
                                                    onClick={handleFinishCourse}
                                                    style={{
                                                        display: "flex", alignItems: "center", gap: "10px",
                                                        padding: "18px 36px", borderRadius: "18px",
                                                        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                                        color: "white", border: "none",
                                                        fontSize: "16px", fontWeight: 900, cursor: "pointer",
                                                        boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
                                                        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
                                                        e.currentTarget.style.boxShadow = "0 30px 60px rgba(59, 130, 246, 0.6)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = "translateY(0) scale(1)";
                                                        e.currentTarget.style.boxShadow = "0 20px 40px rgba(59, 130, 246, 0.4)";
                                                    }}
                                                >
                                                    <Sparkles size={22} fill="white" /> Finalizar Curso
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
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
                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "scale(1.01) translateY(-4px)";
                                                    e.currentTarget.style.borderColor = colors.accent + "50";
                                                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.1)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "scale(1) translateY(0)";
                                                    e.currentTarget.style.borderColor = colors.border;
                                                    e.currentTarget.style.boxShadow = "none";
                                                }}
                                            >
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

                        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }} className="custom-scroll">
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                {course?.modules?.map((module, mIdx) => (
                                    <div key={module.id}>
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: "10px",
                                            marginBottom: "12px", padding: "0 8px"
                                        }}>
                                            <div style={{
                                                fontSize: "11px", fontWeight: 900,
                                                background: colors.accent + "10",
                                                color: colors.accent,
                                                padding: "4px 8px", borderRadius: "6px",
                                                textTransform: "uppercase", letterSpacing: "1px"
                                            }}>M{mIdx + 1}</div>
                                            <h4 style={{ fontSize: "14px", fontWeight: 800, color: colors.text, margin: 0, flex: 1 }}>
                                                {module.title}
                                            </h4>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            {module.lessons?.map((lesson, lIdx) => {
                                                const isActive = activeLesson?.id === lesson.id;
                                                const isCompleted = completedLessons[lesson.id];
                                                return (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => navigateToLesson(lesson.id)}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "14px",
                                                            padding: "14px",
                                                            borderRadius: "14px",
                                                            background: isActive ? (isDark ? "rgba(59, 130, 246, 0.1)" : "#eff6ff") : "transparent",
                                                            border: `1px solid ${isActive ? colors.accent + "40" : "transparent"}`,
                                                            textAlign: "left",
                                                            cursor: "pointer",
                                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                            position: "relative",
                                                            overflow: "hidden"
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!isActive) {
                                                                e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
                                                                e.currentTarget.style.transform = "translateX(4px)";
                                                            } else {
                                                                e.currentTarget.style.transform = "translateY(-2px)";
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!isActive) {
                                                                e.currentTarget.style.background = "transparent";
                                                            }
                                                            e.currentTarget.style.transform = "translateX(0) translateY(0)";
                                                        }}
                                                    >
                                                        {isActive && (
                                                            <div style={{
                                                                position: "absolute", left: 0, top: "20%", bottom: "20%",
                                                                width: "4px", background: colors.accent, borderRadius: "0 4px 4px 0"
                                                            }} />
                                                        )}
                                                        <div style={{
                                                            width: "32px",
                                                            height: "32px",
                                                            borderRadius: "10px",
                                                            background: isActive ? colors.accent : (isCompleted ? "#10b98120" : (isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9")),
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: isActive ? "white" : (isCompleted ? "#10b981" : colors.textMuted),
                                                            flexShrink: 0,
                                                            transition: "all 0.3s ease",
                                                            fontSize: "12px",
                                                            fontWeight: 900
                                                        }}>
                                                            {isCompleted ? <CheckCircle2 size={16} strokeWidth={3} /> : (isActive ? <PlayCircle size={18} fill="white" color={colors.accent} /> : lIdx + 1)}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{
                                                                fontSize: "13px",
                                                                fontWeight: isActive ? 800 : 600,
                                                                color: isActive ? colors.accent : (isCompleted ? colors.text : colors.textMuted),
                                                                margin: 0,
                                                                lineHeight: 1.3
                                                            }}>{lesson.title}</p>
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
                                        padding: "20px",
                                        borderRadius: "18px",
                                        background: colors.accent,
                                        color: "white",
                                        border: "none",
                                        fontWeight: 900,
                                        fontSize: "16px",
                                        cursor: "pointer",
                                        boxShadow: `0 15px 30px ${colors.accent}40`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "12px",
                                        transition: "all 0.3s ease"
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                                >
                                    Próxima Aula <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* EVALUATION MODAL */}
            {mounted && typeof document !== "undefined" && createPortal(
                <AnimatePresence>
                    {showEvaluation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: "fixed",
                                inset: 0,
                                zIndex: 9999,
                                background: "rgba(0,0,0,0.8)",
                                backdropFilter: "blur(10px)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "20px"
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                style={{
                                    width: "100%",
                                    maxWidth: "500px",
                                    background: isDark ? "rgba(15, 23, 42, 0.9)" : "white",
                                    borderRadius: "32px",
                                    padding: "40px",
                                    border: `1px solid ${colors.border}`,
                                    boxShadow: "0 50px 100px rgba(0,0,0,0.5)",
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                            >
                                {/* Decorative background glow */}
                                <div style={{
                                    position: "absolute",
                                    top: "-50px",
                                    right: "-50px",
                                    width: "150px",
                                    height: "150px",
                                    background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
                                    filter: "blur(40px)"
                                }} />

                                <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                                    <div style={{
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "24px",
                                        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 24px auto",
                                        boxShadow: "0 15px 30px rgba(59, 130, 246, 0.3)"
                                    }}>
                                        <Sparkles size={40} color="white" />
                                    </div>

                                    <h2 style={{ fontSize: "28px", fontWeight: 900, color: colors.text, letterSpacing: "-1px", marginBottom: "8px" }}>
                                        Parabéns!
                                    </h2>
                                    <p style={{ fontSize: "15px", color: colors.textMuted, fontWeight: 600, marginBottom: "32px" }}>
                                        Você concluiu o curso <strong>{course?.title}</strong>. O que achou da experiência?
                                    </p>

                                    <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "32px" }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    padding: "4px",
                                                    transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                            >
                                                <Star
                                                    size={36}
                                                    fill={rating >= star ? "#f59e0b" : "none"}
                                                    color={rating >= star ? "#f59e0b" : colors.border}
                                                    strokeWidth={2}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        placeholder="Deixe um comentário sobre o curso (opcional)..."
                                        value={evaluationText}
                                        onChange={(e) => setEvaluationText(e.target.value)}
                                        style={{
                                            width: "100%",
                                            height: "120px",
                                            borderRadius: "20px",
                                            padding: "20px",
                                            background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                                            border: `1px solid ${colors.border}`,
                                            color: colors.text,
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            outline: "none",
                                            resize: "none",
                                            marginBottom: "32px",
                                            transition: "all 0.3s ease"
                                        }}
                                        onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
                                    />

                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <button
                                            onClick={() => setShowEvaluation(false)}
                                            style={{
                                                flex: 1,
                                                padding: "16px",
                                                borderRadius: "16px",
                                                background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                                                color: colors.textMuted,
                                                border: "none",
                                                fontSize: "15px",
                                                fontWeight: 800,
                                                cursor: "pointer"
                                            }}
                                        >
                                            Pular
                                        </button>
                                        <button
                                            onClick={handleSaveEvaluation}
                                            disabled={rating === 0}
                                            style={{
                                                flex: 2,
                                                padding: "16px",
                                                borderRadius: "16px",
                                                background: rating === 0 ? colors.border : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                                color: "white",
                                                border: "none",
                                                fontSize: "15px",
                                                fontWeight: 900,
                                                cursor: rating === 0 ? "not-allowed" : "pointer",
                                                boxShadow: rating === 0 ? "none" : "0 10px 20px rgba(59, 130, 246, 0.3)"
                                            }}
                                        >
                                            Enviar e Finalizar
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
