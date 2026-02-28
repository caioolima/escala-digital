"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Map,
    CheckCircle2,
    Lock,
    Play,
    Sparkles,
    ChevronRight,
    ArrowLeft
} from "lucide-react";
import { useTheme } from "next-themes";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { finishLoadingWithMinimumDelay, MIN_SKELETON_MS } from "@/lib/skeleton-timing";

interface Course {
    id: string;
    title: string;
    category: string;
    thumbnail: string;
    description?: string;
    status: string;
    duration?: string;
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
    courseIds?: string[];
    courses?: any[];
    createdAt: string;
    cover?: string;
    progress?: number;
    totalCourses?: number;
    completedCourses?: number;
    updatedAt?: string;
}

function TrailSkeleton({ isMobile }: { isMobile: boolean }) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "380px 1fr",
            gap: "40px",
            alignItems: "start"
        }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px", borderRadius: "24px", border: "1px solid var(--brand-border)", background: "var(--brand-card)" }}>
                <Skeleton width="100%" height={180} borderRadius="16px" />
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <Skeleton width="80%" height={28} />
                    <Skeleton width="100%" height={14} />
                    <Skeleton width="60%" height={14} />
                </div>
                <Skeleton width="100%" height={60} borderRadius="16px" />
                <Skeleton width="100%" height={48} borderRadius="24px" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ display: "flex", gap: "20px", padding: "12px", alignItems: "center" }}>
                        <Skeleton width={180} height={100} borderRadius="10px" />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                            <Skeleton width="20%" height={10} />
                            <Skeleton width="60%" height={20} />
                            <Skeleton width="30%" height={12} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function TrailDetailsPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const router = useRouter();
    const params = useParams();
    const trailId = params.trailId as string;

    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTrail, setActiveTrail] = useState<Trail | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [courseProgressById, setCourseProgressById] = useState<Record<string, number>>({});

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        const fetchTrailDetails = async () => {
            const startedAt = Date.now();
            setIsLoading(true);
            try {
                await api.post(`/trails/${trailId}/enroll`).catch(() => null);

                const [trailResp, coursesResp] = await Promise.all([
                    api.get(`/trails/${trailId}`),
                    api.get('/courses?published=true'),
                ]);

                const foundTrail: Trail = trailResp.data;
                const fetchedCourses: Course[] = coursesResp.data || [];

                if (foundTrail) {
                    const ids: string[] = (foundTrail.courses || []).map((tc: any) => tc.course?.id || tc.courseId).filter(Boolean);
                    const trailCourses = fetchedCourses.filter(c => ids.includes(c.id));

                    // compute progress per course
                    const getProgress = async (courseId: string) => {
                        try {
                            const r = await api.get(`/courses/${courseId}/progress`);
                            return r.data?.percentage ?? 0;
                        } catch {
                            return 0;
                        }
                    };

                    const percentages: number[] = await Promise.all(trailCourses.map(c => getProgress(c.id)));
                    const nextCourseProgressById: Record<string, number> = {};
                    trailCourses.forEach((course, idx) => {
                        nextCourseProgressById[course.id] = percentages[idx] ?? 0;
                    });
                    const completedCount = percentages.filter((p: number) => p === 100).length;
                    const progress = trailCourses.length > 0 ? Math.round((completedCount / trailCourses.length) * 100) : 0;

                    setActiveTrail({
                        ...foundTrail,
                        cover: trailCourses[0]?.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
                        progress,
                        totalCourses: trailCourses.length,
                        completedCourses: completedCount,
                        updatedAt: foundTrail.createdAt ? `Criada em ${foundTrail.createdAt}` : "Atualizado recentemente"
                    });

                    setCourses(fetchedCourses);
                    setCourseProgressById(nextCourseProgressById);
                }
            } catch {
                console.error('Failed to load trail details');
            } finally {
                finishLoadingWithMinimumDelay(startedAt, () => setIsLoading(false), MIN_SKELETON_MS);
            }
        };

        if (trailId) fetchTrailDetails();

        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, [trailId]);

    if (!mounted) {
        return (
            <div style={{ background: "var(--brand-bg)", minHeight: "100%", padding: "40px 60px" }}>
                <TrailSkeleton isMobile={false} />
            </div>
        );
    }

    if (!isLoading && !activeTrail) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyItems: "center", justifyContent: "center", minHeight: "80vh", gap: "20px", color: "var(--brand-text-muted)" }}>
                <Map size={60} strokeWidth={1} style={{ opacity: 0.5 }} />
                <h2 style={{ fontSize: "20px", fontWeight: 800 }}>Trilha n\u00e3o encontrada.</h2>
                <button
                    onClick={() => router.push("/trails")}
                    style={{ padding: "12px 24px", borderRadius: "12px", background: "var(--brand-accent)", color: "white", border: "none", fontWeight: 800, cursor: "pointer" }}
                >
                    Voltar para Trilhas
                </button>
            </div>
        );
    }

    if (isLoading) return <div style={{ padding: isMobile ? "20px" : "40px 60px" }}><TrailSkeleton isMobile={isMobile} /></div>;
    if (!activeTrail) return null;

    const activeTrailCourseIds: string[] = (activeTrail.courses || activeTrail.courseIds || []).map((tc: any) => typeof tc === 'string' ? tc : (tc.course?.id || tc.courseId)).filter(Boolean);

    const activeTrailCourses = courses.filter(c => activeTrailCourseIds.includes(c.id)).map(c => {
        const progress = courseProgressById[c.id] ?? 0;
        return {
            ...c,
            status: progress === 100 ? "completed" : (progress > 0 ? "in_progress" : "not_started"),
            progress
        };
    });

    const handleCourseClick = async (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        await api.post(`/enrollments/${courseId}`).catch(() => null);

        const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id;
        if (firstLessonId) {
            router.push(`/courses/${courseId}/lessons/${firstLessonId}`);
        } else {
            router.push(`/courses/${courseId}`);
        }
    };

    const handleContinue = () => {
        const nextCourse = activeTrailCourses.find(c => c.status !== "completed") || activeTrailCourses[0];
        if (nextCourse) handleCourseClick(nextCourse.id);
    };

    const colors = {
        bg: "var(--brand-bg)",
        cardBg: "var(--brand-card)",
        text: "var(--brand-text)",
        textMuted: "var(--brand-text-muted)",
        border: "var(--brand-border)",
        accent: activeTrail.accent || "var(--brand-accent)"
    };

    return (
        <div style={{
            background: colors.bg,
            minHeight: "100%",
            color: colors.text,
            position: "relative",
            overflow: "hidden"
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                * { font-family: 'Plus Jakarta Sans', sans-serif; }
                
                .course-item:hover .thumbnail-overlay {
                    opacity: 1 !important;
                }
                .course-item:hover {
                    background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"} !important;
                }
                .sidebar-glass {
                    background: ${isDark ? "rgba(20, 20, 30, 0.4)" : "rgba(255, 255, 255, 0.4)"};
                    backdrop-filter: blur(40px);
                    -webkit-backdrop-filter: blur(40px);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-in {
                    animation: fadeIn 0.4s ease forwards;
                }
            `}</style>

            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "600px",
                background: `linear-gradient(to bottom, ${colors.accent}25 0%, transparent 100%)`,
                pointerEvents: "none",
                zIndex: 0
            }} />

            <main style={{
                position: "relative",
                zIndex: 1,
                padding: isMobile ? "20px" : "40px 60px",
                maxWidth: "1600px",
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "380px 1fr",
                gap: "40px",
                alignItems: "start"
            }}>
                <div style={{
                    position: isMobile ? "static" : "sticky",
                    top: "40px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    padding: "24px",
                    borderRadius: "24px",
                    border: `1px solid ${colors.border}`,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.1)"
                }} className="sidebar-glass animate-in">

                    <button
                        onClick={() => router.push("/trails")}
                        style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: colors.textMuted, cursor: "pointer", fontWeight: 700, fontSize: "14px", padding: 0 }}
                    >
                        <ArrowLeft size={16} /> Voltar para o Catálogo
                    </button>

                    <div style={{
                        width: "100%",
                        aspectRatio: "16/9",
                        borderRadius: "16px",
                        overflow: "hidden",
                        position: "relative",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                    }}>
                        <img
                            src={activeTrail.cover}
                            alt={activeTrail.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)"
                        }} />
                        <div style={{
                            position: "absolute",
                            bottom: "16px",
                            left: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "white",
                            fontSize: "12px",
                            fontWeight: 700
                        }}>
                            <Map size={14} /> Trilha • {activeTrail.totalCourses} Cursos
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <h1 style={{ fontSize: "28px", fontWeight: 800, lineHeight: 1.2, color: colors.text }}>
                            {activeTrail.title}
                        </h1>
                        <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.5, fontWeight: 500 }}>
                            {activeTrail.description}
                        </p>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            fontSize: "13px",
                            color: colors.text,
                            fontWeight: 700,
                            marginTop: "8px"
                        }}>
                            <span>{activeTrail.completedCourses} de {activeTrail.totalCourses} finalizados</span>
                            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: colors.textMuted }} />
                            <span style={{ color: colors.textMuted }}>{activeTrail.updatedAt}</span>
                        </div>
                    </div>

                    <div style={{
                        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                        padding: "16px",
                        borderRadius: "16px",
                        border: `1px solid ${colors.border}`
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", fontWeight: 800 }}>
                            <span>Progresso da Trilha</span>
                            <span style={{ color: colors.accent }}>{activeTrail.progress}%</span>
                        </div>
                        <div style={{ height: "8px", width: "100%", background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", borderRadius: "10px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${activeTrail.progress}%`, background: colors.accent, borderRadius: "10px", transition: "width 1s ease" }} />
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            onClick={handleContinue}
                            style={{
                                flex: 1,
                                height: "48px",
                                borderRadius: "24px",
                                background: colors.text,
                                color: isDark ? "#000" : "#fff",
                                border: "none",
                                fontWeight: 800,
                                fontSize: "14px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                transition: "opacity 0.2s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                        >
                            <Play size={18} fill="currentColor" /> {activeTrail.progress && activeTrail.progress > 0 ? "Continuar" : "Come\u00e7ar"}
                        </button>
                        <button style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                            border: "none",
                            color: colors.text,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <Sparkles size={18} />
                        </button>
                    </div>
                </div >

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }} className="animate-in">
                    <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "12px", color: colors.text }}>Cursos da Trilha</h2>
                    {activeTrailCourses.map((course, idx) => (
                        <div
                            key={course.id}
                            className="course-item"
                            onClick={() => handleCourseClick(course.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                                padding: "12px 16px",
                                borderRadius: "16px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                background: "transparent",
                                position: "relative"
                            }}
                        >
                            <div style={{
                                width: "24px",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: colors.textMuted,
                                textAlign: "center",
                                flexShrink: 0
                            }}>
                                {idx + 1}
                            </div>

                            <div style={{
                                width: isMobile ? "120px" : "180px",
                                aspectRatio: "16/9",
                                borderRadius: "10px",
                                overflow: "hidden",
                                position: "relative",
                                flexShrink: 0,
                                background: "#222"
                            }}>
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        opacity: course.status === "locked" ? 0.4 : 1
                                    }}
                                />
                                {course.status === "locked" && (
                                    <div style={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "rgba(0,0,0,0.3)"
                                    }}>
                                        <Lock size={20} color="white" />
                                    </div>
                                )}
                                {course.status !== "locked" && (
                                    <div className="thumbnail-overlay" style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: "rgba(0,0,0,0.4)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        opacity: 0,
                                        transition: "opacity 0.2s"
                                    }}>
                                        <Play size={24} color="white" fill="white" />
                                    </div>
                                )}
                                <div style={{
                                    position: "absolute",
                                    bottom: "6px",
                                    right: "6px",
                                    background: "rgba(0,0,0,0.8)",
                                    color: "white",
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    padding: "2px 6px",
                                    borderRadius: "4px"
                                }}>
                                    {course.duration}
                                </div>
                            </div>

                            <div style={{ flex: 1, overflow: "hidden" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                    <span style={{ fontSize: "11px", fontWeight: 800, color: colors.accent, letterSpacing: "0.5px" }}>{course.category.toUpperCase()}</span>
                                    {course.status === "completed" && <CheckCircle2 size={12} color="#10b981" />}
                                </div>
                                <h3 style={{
                                    fontSize: isMobile ? "14px" : "16px",
                                    fontWeight: 700,
                                    color: colors.text,
                                    margin: 0,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                }}>
                                    {course.title}
                                </h3>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                                    <span style={{ fontSize: "12px", color: colors.textMuted, fontWeight: 500 }}>
                                        {course.status === "completed" ? "Concluído" : (course.status === "in_progress" ? "Em andamento" : "Não iniciado")}
                                    </span>
                                </div>
                            </div>

                            {!isMobile && (
                                <button style={{
                                    background: "none",
                                    border: "none",
                                    color: colors.textMuted,
                                    cursor: "pointer",
                                    padding: "8px"
                                }}>
                                    <ChevronRight size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </main >
        </div >
    );
}

