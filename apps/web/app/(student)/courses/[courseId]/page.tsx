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
import { api } from "@/lib/api";
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

interface Review {
    id: string;
    rating: number;
    comment: string;
    user: { name: string; avatarUrl: string | null };
    createdAt: string;
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
    lessons?: Lesson[];
    reviews?: Review[];
    updatedAt?: string;
    isEnrolled?: boolean;
    enrolledStudents?: { name: string; avatarUrl: string | null }[];
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
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setMounted(true);

        const fetchCourseDetails = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/courses/${courseId}`);
                const data = response.data;

                // NestJS API should return the full course with lessons/modules/enrollment
                setCourse(data);

                if (data.isEnrolled) {
                    setIsEnrolled(true);
                }

                // Check progress via API
                try {
                    const progressResp = await api.get(`/courses/${courseId}/progress`);
                    setProgress(progressResp.data.percentage);
                } catch (pe) {
                    console.error("Failed to load progress", pe);
                }
            } catch (e) {
                console.error("Failed to load course details", e);
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) {
            fetchCourseDetails();
        }
    }, [courseId]);

    const handleStartCourse = async () => {
        if (!course) return;

        try {
            // Only enroll if not already enrolled
            if (!course.isEnrolled) {
                await api.post(`/enrollments/${courseId}`);
                showToast("Jornada Iniciada! Bons estudos.", "premium");
            }
        } catch (e) {
            console.error("Failed to enroll", e);
        }

        const firstLessonId = course.lessons?.[0]?.id || course.modules?.[0]?.lessons?.[0]?.id;
        if (firstLessonId) {
            router.push(`/courses/${courseId}/lessons/${firstLessonId}`);
        } else {
            showToast("Conteúdo em preparação. Volte em breve!", "premium");
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
                            {course.modules && course.modules.length > 0 ? (
                                course.modules.map((mod, idx) => (
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
                                ))
                            ) : course.lessons && course.lessons.length > 0 ? (
                                <div style={{
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
                                                1
                                            </div>
                                            <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>Conteúdo do Curso</h3>
                                        </div>
                                        <Badge variant="outline">{course.lessons.length} aulas</Badge>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "44px" }}>
                                        {course.lessons.map((lesson, lIdx) => (
                                            <div key={lesson.id} style={{ display: "flex", alignItems: "center", gap: "10px", color: colors.textMuted, fontSize: "14px", fontWeight: 500 }}>
                                                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: colors.border }} />
                                                <span>{lIdx + 1}. {lesson.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
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
                            {course.reviews?.map((review) => (
                                <Card key={review.id} style={{ borderRadius: "20px", background: colors.card, border: `1px solid ${colors.border}` }}>
                                    <CardContent style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: colors.accent + "20", color: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                                    {review.user.avatarUrl ? (
                                                        <img src={review.user.avatarUrl} alt={review.user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    ) : (
                                                        <User size={16} />
                                                    )}
                                                </div>
                                                <span style={{ fontWeight: 800, fontSize: "14px" }}>{review.user.name}</span>
                                            </div>
                                            <span style={{ fontSize: "12px", color: colors.textMuted }}>
                                                {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                                            </span>
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
                            {(!course.reviews || course.reviews.length === 0) && (
                                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: colors.textMuted }}>
                                    Ainda não há avaliações para este curso.
                                </div>
                            )}
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
                                        {course.isEnrolled ? "Continuar treinando" : "Iniciar agora"}
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
                                    <span>Atualizado: {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "Recém publicado"}</span>
                                </div>
                            </div>

                            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: "24px", marginTop: "8px" }}>
                                <h4 style={{ fontSize: "14px", fontWeight: 900, marginBottom: "16px", color: colors.text }}>Alunos que já iniciaram</h4>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        {course.enrolledStudents && course.enrolledStudents.length > 0 ? (
                                            course.enrolledStudents.slice(0, 5).map((student, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        width: "32px",
                                                        height: "32px",
                                                        borderRadius: "50%",
                                                        border: `3px solid ${colors.card}`,
                                                        marginLeft: i === 0 ? 0 : "-12px",
                                                        background: colors.accent + "20",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        overflow: "hidden",
                                                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                                                        zIndex: 10 - i
                                                    }}
                                                >
                                                    {student.avatarUrl ? (
                                                        <img src={student.avatarUrl} alt={student.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    ) : (
                                                        <User size={16} color={colors.accent} />
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            [1, 2, 3].map((i) => (
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
                                                        zIndex: 10 - i
                                                    }}
                                                >
                                                    <User size={16} />
                                                </div>
                                            ))
                                        )}
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
