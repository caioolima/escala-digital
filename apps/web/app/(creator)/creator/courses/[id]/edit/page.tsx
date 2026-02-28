"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Settings,
    Plus,
    FileText,
    Play,
    GripVertical,
    Trash2,
    CheckCircle2,
    Save
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Attachment { id: string; title: string; url: string; }
interface Lesson { id: string; title: string; videoUrl: string; attachments: Attachment[]; }
interface Module { id: string; title: string; lessons: Lesson[]; }
interface CourseData {
    title: string;
    description: string;
    level: string;
    modules: Module[];
    coverUrl?: string;
}

function EditCourseSkeleton() {
    return (
        <div style={{ background: "var(--brand-bg)", minHeight: "100%", padding: "40px" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <Skeleton width={180} height={14} borderRadius={10} />
                    <Skeleton width={360} height={40} borderRadius={14} />
                </div>
                <Skeleton width="100%" height={64} borderRadius={18} />
                <Skeleton width="100%" height={420} borderRadius={22} />
                <Skeleton width="100%" height={260} borderRadius={22} />
            </div>
        </div>
    );
}

function getYouTubeThumbnail(url: string): string | null {
    try {
        const u = new URL(url);
        const videoId = u.hostname === "youtu.be"
            ? u.pathname.slice(1).split("?")[0]
            : u.searchParams.get("v");
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    } catch { return null; }
}

export default function EditCoursePage() {
    const { id: courseId } = useParams() as { id: string };
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [originalStudents, setOriginalStudents] = useState(0);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const [courseData, setCourseData] = useState<CourseData>({
        title: "",
        description: "",
        level: "Iniciante",
        modules: [{ id: "m1", title: "Módulo 1: Introdução", lessons: [{ id: "l1", title: "Boas-vindas", videoUrl: "", attachments: [] }] }],
        coverUrl: ""
    });

    useEffect(() => {
        setMounted(true);
        const fetchCourse = async () => {
            setIsLoading(true);
            try {
                const [courseResp, lessonsResp] = await Promise.all([
                    api.get(`/courses/${courseId}`),
                    api.get(`/courses/${courseId}/lessons`).catch(() => ({ data: [] })),
                ]);
                const c = courseResp.data || {};
                const lessons = (lessonsResp.data || []).map((l: any) => ({
                    id: l.id,
                    title: l.title || "Aula",
                    videoUrl: l.videoUrl || "",
                    attachments: [],
                }));
                setOriginalStudents(c.studentsCount ?? c._count?.enrollments ?? 0);
                setCourseData({
                    title: c.title || "",
                    description: c.description || "",
                    level: c.level || "Iniciante",
                    modules: [{ id: "default", title: "Conteúdo", lessons }],
                    coverUrl: c.thumbnail || "",
                });
            } catch (e) {
                console.error("Failed to fetch course for edit", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    if (!mounted) return <EditCourseSkeleton />;
    if (isLoading) return <EditCourseSkeleton />;

    const colors = {
        bg: "var(--brand-bg)",
        card: "var(--brand-card)",
        border: "var(--brand-border)",
        text: "var(--brand-text)",
        textMuted: "var(--brand-text-muted)",
        accent: "#9146FF"
    };

    const handleSave = () => {
        const save = async () => {
            try {
                const firstVideoUrl = courseData.modules.flatMap(m => m.lessons).find(l => l.videoUrl.trim())?.videoUrl || "";
                const thumbnail = (firstVideoUrl && getYouTubeThumbnail(firstVideoUrl))
                    || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop";

                await api.patch(`/courses/${courseId}`, {
                    title: courseData.title,
                    description: courseData.description,
                    level: courseData.level,
                    category: "Geral",
                    thumbnail: courseData.coverUrl || thumbnail,
                });

                const existingLessonsResp = await api.get(`/courses/${courseId}/lessons`).catch(() => ({ data: [] }));
                const existingLessons = existingLessonsResp.data || [];
                for (const l of existingLessons) {
                    await api.delete(`/courses/${courseId}/lessons/${l.id}`);
                }

                const nextLessons = courseData.modules.flatMap((m) => m.lessons).filter((l) => l.title.trim() && l.videoUrl.trim());
                for (let i = 0; i < nextLessons.length; i++) {
                    const lesson = nextLessons[i];
                    if (!lesson) continue;
                    await api.post(`/courses/${courseId}/lessons`, {
                        title: lesson.title.trim(),
                        description: "",
                        videoUrl: lesson.videoUrl.trim(),
                        duration: 0,
                        order: i + 1,
                    });
                }

                showToast("Alterações salvas! Redirecionando...");
                setTimeout(() => router.push("/creator/courses"), 1200);
            } catch (e) {
                console.error("Failed to save edited course", e);
                showToast("Erro ao salvar alterações.", "error");
            }
        };
        void save();
    };

    const addModule = () => {
        const newModule: Module = {
            id: Math.random().toString(36).substr(2, 9),
            title: `Novo Módulo ${courseData.modules.length + 1}`,
            lessons: []
        };
        setCourseData(prev => ({ ...prev, modules: [...prev.modules, newModule] }));
    };

    const addLesson = (moduleId: string) => {
        const module = courseData.modules.find(m => m.id === moduleId);
        if (module && module.lessons.length > 0) {
            const last = module.lessons[module.lessons.length - 1];
            if (last && (!last.title.trim() || !last.videoUrl.trim())) {
                showToast("Preencha o título e o link da aula atual antes de adicionar uma nova.", "error");
                return;
            }
        }
        const newLesson: Lesson = { id: Math.random().toString(36).substr(2, 9), title: "Nova Aula", videoUrl: "", attachments: [] };
        setCourseData(prev => ({
            ...prev,
            modules: prev.modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m)
        }));
    };

    const updateLesson = (moduleId: string, lessonId: string, field: string, value: string) => {
        setCourseData(prev => ({
            ...prev,
            modules: prev.modules.map(m => m.id !== moduleId ? m : {
                ...m,
                lessons: m.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l)
            })
        }));
    };

    const removeModule = (id: string) => setCourseData(prev => ({ ...prev, modules: prev.modules.filter(m => m.id !== id) }));
    const removeLesson = (moduleId: string, lessonId: string) => {
        setCourseData(prev => ({ ...prev, modules: prev.modules.map(m => m.id !== moduleId ? m : { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }) }));
    };

    const canGoToStep = (step: number): boolean => {
        if (step === 1) return true;
        if (step === 2) return courseData.title.trim() !== "" && courseData.description.trim() !== "";
        if (step === 3) {
            const hasLessons = courseData.modules.some(m => m.lessons.length > 0);
            const allHaveUrl = courseData.modules.every(m => m.lessons.every(l => l.videoUrl.trim() !== ""));
            return canGoToStep(2) && hasLessons && allHaveUrl;
        }
        return false;
    };

    const handleNextStep = () => {
        if (currentStep === 1 && (!courseData.title.trim() || !courseData.description.trim())) {
            showToast("Preencha o título e a descrição para continuar.", "error"); return;
        }
        if (currentStep === 2) {
            const hasLessons = courseData.modules.some(m => m.lessons.length > 0);
            const allHaveUrl = courseData.modules.every(m => m.lessons.every(l => l.videoUrl.trim() !== ""));
            if (!hasLessons || !allHaveUrl) { showToast("Adicione pelo menos uma aula com link do YouTube.", "error"); return; }
        }
        setCurrentStep(prev => prev + 1);
    };

    return (
        <div style={{ background: colors.bg, minHeight: "100%", padding: "40px" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <button onClick={() => router.back()} style={{ background: "none", border: "none", padding: 0, display: "flex", alignItems: "center", gap: "8px", color: colors.textMuted, cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
                            <ChevronLeft size={16} /> Voltar aos Cursos
                        </button>
                        <h1 style={{ fontSize: "36px", fontWeight: 900, color: colors.text, letterSpacing: "-1.5px" }}>
                            {currentStep === 1 ? "Editar Curso" : courseData.title || "Editar Curso"}
                        </h1>
                    </div>
                </div>

                {/* Progress Steps */}
                <div style={{ display: "flex", gap: "8px", background: colors.card, padding: "8px", borderRadius: "18px", border: `1px solid ${colors.border}` }}>
                    {["Informações Básicas", "Conteúdo (Aulas)", "Salvar"].map((step, idx) => {
                        const stepNum = idx + 1;
                        const isAvailable = canGoToStep(stepNum);
                        const isActive = currentStep === stepNum;
                        return (
                            <button key={step} onClick={() => isAvailable && setCurrentStep(stepNum)} disabled={!isAvailable}
                                style={{ flex: 1, padding: "12px", borderRadius: "12px", background: isActive ? (isDark ? "rgba(145,70,255,0.1)" : "#f5f3ff") : "transparent", border: "none", color: isActive ? colors.accent : (isAvailable ? colors.text : colors.textMuted), fontSize: "13px", fontWeight: 800, cursor: isAvailable ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: isAvailable ? 1 : 0.5 }}>
                                <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: isActive ? colors.accent : (isAvailable ? colors.textMuted : colors.border), color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>{stepNum}</div>
                                {step}
                            </button>
                        );
                    })}
                </div>

                {/* Step 1 - Details */}
                {currentStep === 1 && (
                    <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
                        <Card style={{ borderRadius: "24px", border: `1px solid ${colors.border}`, background: colors.card }}>
                            <CardHeader style={{ padding: "32px 32px 0" }}>
                                <CardTitle style={{ fontSize: "18px", fontWeight: 900 }}>Detalhes do Curso</CardTitle>
                            </CardHeader>
                            <CardContent style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div>
                                    <label style={{ fontSize: "12px", fontWeight: 800, color: colors.textMuted, textTransform: "uppercase", marginBottom: "8px", display: "block" }}>Título do Curso</label>
                                    <input value={courseData.title} onChange={e => setCourseData({ ...courseData, title: e.target.value })} placeholder="Ex: Masterclass de Vendas Internas" style={{ width: "100%", height: "52px", padding: "0 18px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "15px", fontWeight: 500, outline: "none" }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: "12px", fontWeight: 800, color: colors.textMuted, textTransform: "uppercase", marginBottom: "8px", display: "block" }}>Link da Capa (Imagem)</label>
                                    <input value={courseData.coverUrl} onChange={e => setCourseData({ ...courseData, coverUrl: e.target.value })} placeholder="https://exemplo.com/imagem.jpg" style={{ width: "100%", height: "52px", padding: "0 18px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "15px", fontWeight: 500, outline: "none" }} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "20px" }}>
                                    <div>
                                        <label style={{ fontSize: "12px", fontWeight: 800, color: colors.textMuted, textTransform: "uppercase", marginBottom: "8px", display: "block" }}>Descrição</label>
                                        <input value={courseData.description} onChange={e => setCourseData({ ...courseData, description: e.target.value })} placeholder="O que os alunos vão aprender..." style={{ width: "100%", height: "52px", padding: "0 18px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "15px", fontWeight: 500, outline: "none" }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "12px", fontWeight: 800, color: colors.textMuted, textTransform: "uppercase", marginBottom: "8px", display: "block" }}>Nível</label>
                                        <select value={courseData.level} onChange={e => setCourseData({ ...courseData, level: e.target.value })} style={{ width: "100%", height: "52px", padding: "0 18px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "15px", fontWeight: 500, outline: "none" }}>
                                            <option>Iniciante</option>
                                            <option>Intermediário</option>
                                            <option>Avançado</option>
                                        </select>
                                    </div>
                                </div>
                                <Button onClick={handleNextStep} style={{ background: colors.accent, height: "56px", borderRadius: "16px", fontWeight: 800, marginTop: "12px" }}>Prosseguir para as Aulas</Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Step 2 - Content */}
                {currentStep === 2 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "start" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h2 style={{ fontSize: "20px", fontWeight: 900, color: colors.text }}>Conteúdo do Curso</h2>
                                <Button onClick={addModule} variant="outline" style={{ borderRadius: "12px", fontWeight: 700, borderColor: colors.accent, color: colors.accent }}>
                                    <Plus size={18} className="mr-2" /> Adicionar Módulo
                                </Button>
                            </div>

                            {courseData.modules.map((module, mIdx) => (
                                <Card key={module.id} style={{ borderRadius: "24px", border: `1px solid ${colors.border}`, background: colors.card, overflow: "hidden" }}>
                                    <div style={{ padding: "20px 24px", background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <GripVertical size={18} style={{ color: colors.textMuted, cursor: "grab" }} />
                                            <input value={module.title} onChange={e => {
                                                const newTitle = e.target.value;
                                                setCourseData(prev => ({
                                                    ...prev,
                                                    modules: prev.modules.map(m => m.id === module.id ? { ...m, title: newTitle } : m)
                                                }));
                                            }}
                                                style={{ background: "transparent", border: "none", fontSize: "16px", fontWeight: 800, color: colors.text, outline: "none", width: "300px" }} />
                                        </div>
                                        <Button onClick={() => removeModule(module.id)} variant="ghost" size="icon" style={{ color: "#ef4444" }}><Trash2 size={18} /></Button>
                                    </div>
                                    <CardContent style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {module.lessons.map((lesson, lIdx) => (
                                            <div key={lesson.id} style={{ padding: "16px", borderRadius: "16px", border: `1px solid ${colors.border}`, background: isDark ? "rgba(0,0,0,0.1)" : "white" }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(145,70,255,0.1)", color: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 900 }}>{lIdx + 1}</div>
                                                        <input value={lesson.title} onChange={e => updateLesson(module.id, lesson.id, "title", e.target.value)} placeholder="Título da Aula" style={{ flex: 1, background: "transparent", border: "none", fontSize: "14px", fontWeight: 700, color: colors.text, outline: "none" }} />
                                                        <Button onClick={() => removeLesson(module.id, lesson.id)} variant="ghost" size="icon" style={{ color: colors.textMuted }}><Trash2 size={16} /></Button>
                                                    </div>
                                                    <div style={{ position: "relative" }}>
                                                        <Play size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: colors.textMuted }} />
                                                        <input value={lesson.videoUrl} onChange={e => updateLesson(module.id, lesson.id, "videoUrl", e.target.value)} placeholder="Cole o link do YouTube aqui..." style={{ width: "100%", height: "40px", padding: "0 14px 0 38px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "13px", fontWeight: 500, outline: "none" }} />
                                                    </div>

                                                    {/* Attachments */}
                                                    <div style={{ marginTop: "8px", borderTop: `1px solid ${colors.border}`, paddingTop: "12px" }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                            <span style={{ fontSize: "11px", fontWeight: 800, color: colors.textMuted, textTransform: "uppercase" }}>Materiais Complementares</span>
                                                            <Button onClick={() => {
                                                                setCourseData(prev => ({ ...prev, modules: prev.modules.map(m => m.id !== module.id ? m : { ...m, lessons: m.lessons.map(l => l.id !== lesson.id ? l : { ...l, attachments: [...l.attachments, { id: Date.now().toString(), title: "Novo Material", url: "" }] }) }) }));
                                                            }} variant="ghost" size="sm" style={{ height: "24px", fontSize: "11px", color: colors.accent, fontWeight: 700 }}>
                                                                <FileText size={12} className="mr-1" /> Adicionar
                                                            </Button>
                                                        </div>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                            {lesson.attachments?.map((file, fIdx) => (
                                                                <div key={file.id} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                                    <input value={file.title} onChange={e => {
                                                                        const val = e.target.value;
                                                                        setCourseData(prev => ({ ...prev, modules: prev.modules.map(m => m.id !== module.id ? m : { ...m, lessons: m.lessons.map(l => { if (l.id !== lesson.id) return l; const a = l.attachments.map(att => att.id === file.id ? { ...att, title: val } : att); return { ...l, attachments: a }; }) }) }));
                                                                    }} placeholder="Nome do arquivo" style={{ flex: 1, height: "32px", padding: "0 10px", borderRadius: "8px", background: isDark ? "rgba(255,255,255,0.02)" : "#f1f5f9", border: "1px solid transparent", fontSize: "12px", color: colors.text, fontWeight: 600, outline: "none" }} />
                                                                    <input value={file.url} onChange={e => {
                                                                        const val = e.target.value;
                                                                        setCourseData(prev => ({ ...prev, modules: prev.modules.map(m => m.id !== module.id ? m : { ...m, lessons: m.lessons.map(l => { if (l.id !== lesson.id) return l; const a = l.attachments.map(att => att.id === file.id ? { ...att, url: val } : att); return { ...l, attachments: a }; }) }) }));
                                                                    }} placeholder="Link do PDF (Google Drive, etc)" style={{ flex: 1.5, height: "32px", padding: "0 10px", borderRadius: "8px", background: isDark ? "rgba(255,255,255,0.02)" : "#f1f5f9", border: "1px solid transparent", fontSize: "12px", color: colors.text, fontWeight: 500, outline: "none" }} />
                                                                    <Button onClick={() => {
                                                                        setCourseData(prev => ({ ...prev, modules: prev.modules.map(m => m.id !== module.id ? m : { ...m, lessons: m.lessons.map(l => l.id !== lesson.id ? l : { ...l, attachments: l.attachments.filter(a => a.id !== file.id) }) }) }));
                                                                    }} variant="ghost" size="icon" style={{ height: "32px", width: "32px", color: colors.textMuted }}><Trash2 size={14} /></Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(() => {
                                            const lastLesson = module.lessons[module.lessons.length - 1];
                                            const isLessonIncomplete = module.lessons.length > 0 && lastLesson && (!lastLesson.title.trim() || !lastLesson.videoUrl.trim());
                                            return (
                                                <Button onClick={() => addLesson(module.id)} variant="ghost" style={{ width: "100%", height: "50px", borderRadius: "12px", border: `1px dashed ${colors.border}`, color: colors.textMuted, fontSize: "13px", fontWeight: 700, opacity: isLessonIncomplete ? 0.5 : 1, cursor: isLessonIncomplete ? "not-allowed" : "pointer" }}>
                                                    <Plus size={16} className="mr-2" /> Adicionar Aula
                                                </Button>
                                            );
                                        })()}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "sticky", top: "40px" }}>
                            <Card style={{ borderRadius: "24px", border: `1px solid ${colors.border}`, background: colors.card, borderLeft: `4px solid ${colors.accent}` }}>
                                <CardHeader style={{ padding: "24px 24px 12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: colors.accent }}>
                                        <div style={{ background: "rgba(145,70,255,0.1)", padding: "8px", borderRadius: "10px" }}>
                                            <Play size={20} fill="currentColor" />
                                        </div>
                                        <CardTitle style={{ fontSize: "16px", fontWeight: 900 }}>Vídeos no YouTube</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent style={{ padding: "0 24px 24px" }}>
                                    <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: "1.6", fontWeight: 600 }}>
                                        Use links do YouTube (pode ser não listado) para que apenas alunos tenham acesso.
                                    </p>
                                </CardContent>
                            </Card>
                            <Button onClick={handleNextStep} style={{ background: colors.accent, height: "56px", borderRadius: "16px", fontWeight: 800 }}>Confirmar e Salvar</Button>
                        </div>
                    </div>
                )}

                {/* Step 3 - Save */}
                {currentStep === 3 && (
                    <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%", textAlign: "center" }}>
                        <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "rgba(145,70,255,0.1)", color: "#9146FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                            <Save size={40} />
                        </div>
                        <h2 style={{ fontSize: "24px", fontWeight: 900, color: colors.text, marginBottom: "12px" }}>Tudo Revisado?</h2>
                        <p style={{ fontSize: "15px", color: colors.textMuted, marginBottom: "40px", fontWeight: 500, lineHeight: "1.6" }}>
                            As alterações em <strong>&ldquo;{courseData.title}&rdquo;</strong> serão salvas e o curso será atualizado imediatamente.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <Button onClick={handleSave} style={{ background: colors.accent, height: "56px", borderRadius: "16px", fontWeight: 800, fontSize: "16px" }}>
                                <Save size={20} className="mr-2" /> Salvar Alterações
                            </Button>
                            <Button variant="outline" onClick={() => setCurrentStep(1)} style={{ height: "56px", borderRadius: "16px", fontWeight: 700 }}>
                                <Settings size={18} className="mr-2" /> Revisar Detalhes
                            </Button>
                        </div>
                    </div>
                )}

            </div>

            {/* Toast */}
            {toast !== null && (() => {
                const t = toast;
                return (
                    <div key="toast" style={{ position: "fixed", bottom: "32px", right: "32px", zIndex: 9999, display: "flex", alignItems: "center", gap: "12px", padding: "16px 24px", borderRadius: "16px", background: t.type === "success" ? (isDark ? "#1e1533" : "#faf5ff") : (isDark ? "#2a1515" : "#fff5f5"), border: `1px solid ${t.type === "success" ? "rgba(145,70,255,0.3)" : "rgba(239,68,68,0.3)"}`, boxShadow: `0 20px 60px ${t.type === "success" ? "rgba(145,70,255,0.25)" : "rgba(239,68,68,0.2)"}`, animation: "slideUp 0.3s ease", maxWidth: "360px" }}>
                        <CheckCircle2 size={20} color={t.type === "success" ? "#9146FF" : "#ef4444"} />
                        <span style={{ fontSize: "14px", fontWeight: 700, color: t.type === "success" ? (isDark ? "#c4b5fd" : "#6d28d9") : (isDark ? "#fca5a5" : "#b91c1c") }}>{t.message}</span>
                    </div>
                );
            })()}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}


