"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronLeft,
    Play,
    Clock,
    Users,
    Star,
    BookOpen,
    ChevronRight,
    Sparkles,
    CheckCircle2,
    Calendar,
    ArrowRight,
    MessageSquare,
    User
} from "lucide-react";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/contexts/toast-context";

interface Lesson {
    id: string;
    title: string;
    durationMins?: number;
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
    thumbnail: string;
    category: string;
    level: string;
    durationMins: number;
    lessonsCount: number;
    studentsCount: number;
    rating: number;
    modules?: Module[];
    updatedAt?: string;
}

function DetailsSkeleton() {
    return (
        <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Skeleton width={100} height={20} />
                <Skeleton width="60%" height={48} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "40px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <Skeleton height={400} borderRadius="24px" />
                    <Skeleton height={150} borderRadius="20px" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <Skeleton height={80} borderRadius="16px" />
                    <Skeleton height={300} borderRadius="20px" />
                </div>
            </div>
        </div>
    );
}

export default function CourseDetailsPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const router = useRouter();
    const { showToast } = useToast();
    const params = useParams();
    const courseId = params.courseId as string;

    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [course, setCourse] = useState<Course | null>(null);
    const [isStarted, setIsStarted] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setMounted(true);
        try {
            // Fetch detailed course data
            const fullCourseRaw = localStorage.getItem(`course_${courseId}`);
            const summaryList: Course[] = JSON.parse(localStorage.getItem("creator_published_courses") || "[]");
            const summary = summaryList.find(c => c.id === courseId);

            if (fullCourseRaw) {
                const data = JSON.parse(fullCourseRaw);
                const modules = data.modules || summary?.modules || [];
                const calcLessonsCount = modules.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0);

                setCourse({
                    ...data,
                    modules,
                    // Merge summary stats if missing in full detail
                    durationMins: data.durationMins || summary?.durationMins || 120,
                    lessonsCount: calcLessonsCount || data.lessonsCount || summary?.lessonsCount || 0,
                    studentsCount: data.studentsCount || summary?.studentsCount || 0,
                    rating: data.rating || summary?.rating || 4.8
                });
            } else if (summary) {
                setCourse(summary);
            }

            // Check if student has already started the course
            const progressData: Record<string, number> = JSON.parse(localStorage.getItem("student_progress") || "{}");
            const currentProgress = progressData[courseId] || 0;
            setProgress(currentProgress);
            if (currentProgress > 0) {
                setIsStarted(true);
            }
        } catch (e) {
            console.error("Failed to load course details", e);
        }

        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [courseId]);

    const handleStartCourse = () => {
        if (!course || !course.modules || course.modules.length === 0) return;

        // Save enrollment if it's the first time
        try {
            const progress: Record<string, number> = JSON.parse(localStorage.getItem("student_progress") || "{}");
            if (!progress[courseId]) {
                progress[courseId] = 1; // Initial progress to show in dashboard
                localStorage.setItem("student_progress", JSON.stringify(progress));
                showToast("Jornada Iniciada! Bons estudos.", "premium");
            }
        } catch (e) {
            console.error("Failed to save progress", e);
        }

        const firstLessonId = course.modules[0]?.lessons[0]?.id;
        if (firstLessonId) {
            router.push(`/courses/${courseId}/lessons/${firstLessonId}`);
        }
    };

    if (!mounted) return null;
    if (isLoading) return <DetailsSkeleton />;

    if (!course) {
        return (
            <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px" }}>
                <div>
                    <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "16px" }}>Curso não encontrado</h2>
                    <Button onClick={() => router.push("/catalog")}>Voltar ao catálogo</Button>
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

    return (
        <div style={{ background: colors.bg, minHeight: "100%", paddingBottom: "100px" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { font-family: 'Plus Jakarta Sans', sans-serif; }
                .glass { background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}; backdrop-filter: blur(20px); }
                .hover-scale { transition: transform 0.2s ease; }
                .hover-scale:hover { transform: scale(1.02); }
            `}</style>

            <header style={{ padding: "40px clamp(20px, 5vw, 80px)", borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <button
                        onClick={() => router.back()}
                        style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "8px", color: colors.textMuted, cursor: "pointer", fontWeight: 700, fontSize: "14px", marginBottom: "24px", padding: 0 }}
                    >
                        <ChevronLeft size={16} /> Voltar ao catálogo
                    </button>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <Badge style={{ background: colors.accent, color: "white", border: "none" }}>{course.category}</Badge>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMuted, fontSize: "13px", fontWeight: 700 }}>
                                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                <span style={{ color: colors.text }}>{course.rating.toFixed(1)}</span>
                            </div>
                        </div>
                        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, letterSpacing: "-2px", color: colors.text, lineHeight: 1.1, margin: 0 }}>
                            {course.title}
                        </h1>
                    </div>
                </div>
            </header>

            <main style={{ padding: "40px clamp(20px, 5vw, 80px)", maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 400px", gap: "40px", alignItems: "start" }}>
                {/* Desktop layout adjustments for mobile */}
                <style>{`
                    @media (max-width: 1024px) {
                        main { grid-template-columns: 1fr; }
                        aside { order: -1; }
                    }
                `}</style>

                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    {/* Hero Thumbnail */}
                    <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "32px", overflow: "hidden", position: "relative", border: `1px solid ${colors.border}`, boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }}>
                        <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
                        <div style={{ position: "absolute", bottom: "30px", left: "30px", display: "flex", gap: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "white" }}>
                                <Clock size={20} />
                                <span style={{ fontWeight: 800 }}>{Math.floor(course.durationMins / 60)}h {course.durationMins % 60}m</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "white" }}>
                                <BookOpen size={20} />
                                <span style={{ fontWeight: 800 }}>{course.lessonsCount} aulas</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <section>
                        <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", color: colors.text }}>
                            O que você vai aprender
                            <Sparkles size={20} color={colors.accent} />
                        </h2>
                        <Card style={{ borderRadius: "24px", background: colors.card, border: `1px solid ${colors.border}` }}>
                            <CardContent style={{ padding: "30px" }}>
                                <p style={{ fontSize: "16px", lineHeight: 1.7, color: colors.textMuted, fontWeight: 500, margin: 0 }}>
                                    {course.description || "Nenhuma descrição detalhada disponível para este treinamento."}
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Curriculum */}
                    <section>
                        <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "20px", color: colors.text }}>Grade Curricular</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {course.modules?.map((mod, idx) => (
                                <div key={mod.id} style={{
                                    padding: "20px",
                                    borderRadius: "20px",
                                    background: colors.card,
                                    border: `1px solid ${colors.border}`,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "16px"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: `${colors.accent}20`, color: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "14px" }}>
                                                {idx + 1}
                                            </div>
                                            <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>{mod.title}</h3>
                                        </div>
                                        <Badge variant="outline">{mod.lessons.length} aulas</Badge>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "44px" }}>
                                        {mod.lessons.map((lesson, lIdx) => (
                                            <div key={lesson.id} style={{ display: "flex", alignItems: "center", gap: "10px", color: colors.textMuted, fontSize: "14px", fontWeight: 500 }}>
                                                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: colors.border }} />
                                                <span>{lIdx + 1}. {lesson.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {(!course.modules || course.modules.length === 0) && (
                                <div style={{ textAlign: "center", padding: "40px", border: `2px dashed ${colors.border}`, borderRadius: "20px", color: colors.textMuted }}>
                                    Conteúdo em breve
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Reviews Section */}
                    <section>
                        <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", color: colors.text }}>
                            Avaliações dos Alunos
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "16px", color: "#f59e0b" }}>
                                <Star size={18} fill="#f59e0b" />
                                <span>{course.rating.toFixed(1)}</span>
                            </div>
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                            {[
                                { name: "Carlos Silva", date: "Há 2 dias", rating: 5, comment: "Conteúdo extremamente prático e direto ao ponto. Consegui aplicar já no primeiro dia!" },
                                { name: "Mariana Costa", date: "Há 1 semana", rating: 5, comment: "O melhor treinamento que já fiz sobre o assunto. A didática do instrutor é impecável." },
                                { name: "João Pedro", date: "Há 2 semanas", rating: 4, comment: "Muito bom, as aulas são bem explicadas. Só senti falta de materiais extras em PDF." }
                            ].map((review, i) => (
                                <Card key={i} style={{ borderRadius: "20px", background: colors.card, border: `1px solid ${colors.border}` }}>
                                    <CardContent style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: colors.accent + "20", color: colors.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <User size={16} />
                                                </div>
                                                <span style={{ fontWeight: 800, fontSize: "14px" }}>{review.name}</span>
                                            </div>
                                            <span style={{ fontSize: "12px", color: colors.textMuted }}>{review.date}</span>
                                        </div>
                                        <div style={{ display: "flex", gap: "2px" }}>
                                            {Array.from({ length: 5 }).map((_, j) => (
                                                <Star key={j} size={14} fill={j < review.rating ? "#f59e0b" : "none"} color="#f59e0b" />
                                            ))}
                                        </div>
                                        <p style={{ margin: 0, fontSize: "14px", color: colors.textMuted, lineHeight: 1.5, fontWeight: 500 }}>
                                            "{review.comment}"
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                </div>

                <aside style={{ display: "flex", flexDirection: "column", gap: "24px", position: "sticky", top: "40px" }}>
                    <Card style={{ borderRadius: "28px", padding: "30px", background: colors.card, border: `1px solid ${colors.border}`, boxShadow: "0 40px 80px rgba(0,0,0,0.1)" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <span style={{ fontSize: "12px", fontWeight: 900, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "1.5px" }}>Nível {course.level || "Iniciante"}</span>
                                <div style={{ fontSize: "24px", fontWeight: 900, color: colors.text }}>Acesso Vitalício</div>
                            </div>

                            <Button
                                onClick={handleStartCourse}
                                style={{
                                    height: "64px",
                                    borderRadius: "18px",
                                    background: progress === 100 ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : colors.accent,
                                    color: "white",
                                    fontSize: "18px",
                                    fontWeight: 900,
                                    boxShadow: progress === 100 ? "0 15px 35px rgba(59, 130, 246, 0.4)" : `0 15px 35px ${colors.accent}40`
                                }}
                            >
                                {progress === 100 ? (
                                    <>
                                        <CheckCircle2 size={20} style={{ marginRight: "10px" }} />
                                        Visualizar Curso
                                    </>
                                ) : (
                                    <>
                                        <Play size={20} fill="currentColor" style={{ marginRight: "10px" }} />
                                        {isStarted ? "Continuar treinando" : "Iniciar agora"}
                                    </>
                                )}
                            </Button>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: colors.text, fontWeight: 700, fontSize: "14px" }}>
                                    <CheckCircle2 size={18} color="#10b981" />
                                    <span>Certificado de conclusão</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: colors.text, fontWeight: 700, fontSize: "14px" }}>
                                    <Users size={18} color={colors.accent} />
                                    <span>{course.studentsCount} alunos matriculados</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: colors.text, fontWeight: 700, fontSize: "14px" }}>
                                    <Calendar size={18} color={colors.textMuted} />
                                    <span>Atualizado: {course.updatedAt || "Recém publicado"}</span>
                                </div>
                            </div>

                            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: "24px", marginTop: "8px" }}>
                                <h4 style={{ fontSize: "14px", fontWeight: 900, marginBottom: "16px", color: colors.text }}>Alunos que já iniciaram</h4>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    width: "32px",
                                                    height: "32px",
                                                    borderRadius: "50%",
                                                    border: `3px solid ${colors.card}`,
                                                    marginLeft: i === 1 ? 0 : "-12px",
                                                    background: `hsl(${i * 60}, 70%, 50%)`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "white",
                                                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                                                    zIndex: 10 - i
                                                }}
                                            >
                                                <User size={16} />
                                            </div>
                                        ))}
                                    </div>
                                    {course.studentsCount > 5 && (
                                        <span style={{ fontSize: "13px", fontWeight: 700, color: colors.textMuted }}>+{course.studentsCount - 5} alunos</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card style={{ borderRadius: "20px", background: colors.accent + "10", border: `1px solid ${colors.accent}20` }}>
                        <CardContent style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ padding: "12px", background: "white", borderRadius: "12px" }}>
                                <ArrowRight size={24} color={colors.accent} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontWeight: 800, color: colors.text }}>Suporte VIP</h4>
                                <p style={{ margin: 0, fontSize: "12px", color: colors.textMuted }}>Tire dúvidas com o instrutor</p>
                            </div>
                        </CardContent>
                    </Card>
                </aside>
            </main>
        </div>
    );
}
