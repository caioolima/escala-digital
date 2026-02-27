"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Save,
    Image as ImageIcon,
    Plus,
    Settings,
    Layout,
    FileText,
    Play,
    GripVertical,
    Trash2,
    CheckCircle2
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast, ToastContainer } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function NewCoursePage() {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const [mounted, setMounted] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const { toasts, toast: showToast, remove } = useToast();

    // Form State
    const [courseData, setCourseData] = useState<{
        title: string;
        description: string;
        level: string;
        modules: {
            id: string;
            title: string;
            lessons: {
                id: string;
                title: string;
                videoUrl: string;
                attachments: { id: string; title: string; url: string; }[];
            }[];
        }[];
        coverUrl: string;
    }>({
        title: "",
        description: "",
        level: "Iniciante",
        modules: [
            { id: "m1", title: "Módulo 1: Introdução", lessons: [{ id: "l1", title: "Boas-vindas", videoUrl: "", attachments: [] }] }
        ],
        coverUrl: ""
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const colors = {
        bg: "var(--brand-bg)",
        card: "var(--brand-card)",
        border: "var(--brand-border)",
        text: "var(--brand-text)",
        textMuted: "var(--brand-text-muted)",
        accent: "#9146FF"
    };

    const levelToApi = (level: string) => {
        const normalized = level.toLowerCase();
        if (normalized.includes("inter")) return "intermediate";
        if (normalized.includes("avan")) return "advanced";
        return "beginner";
    };

    const persistCourse = async (publish: boolean) => {
        if (!courseData.title.trim() || !courseData.description.trim()) {
            showToast("Preencha título e descrição.", "error");
            return;
        }

        try {
            const createResp = await api.post("/courses", {
                title: courseData.title.trim(),
                description: courseData.description.trim(),
                level: levelToApi(courseData.level),
                category: "Geral",
                thumbnail: courseData.coverUrl || undefined,
                published: publish,
            });

            const createdCourseId = createResp.data?.id as string;

            const lessons = courseData.modules
                .flatMap((m) => m.lessons)
                .filter((l) => l.title.trim() && l.videoUrl.trim());

            for (let i = 0; i < lessons.length; i++) {
                const lesson = lessons[i];
                if (!lesson) continue;
                await api.post(`/courses/${createdCourseId}/lessons`, {
                    title: lesson.title.trim(),
                    description: "",
                    videoUrl: lesson.videoUrl.trim(),
                    duration: 0,
                    order: i + 1,
                });
            }

            if (publish && createResp.data?.published !== true) {
                await api.patch(`/courses/${createdCourseId}`, { published: true });
            }

            showToast(publish ? "Curso publicado! Redirecionando..." : "Rascunho criado! Redirecionando...");
            setTimeout(() => router.push("/creator/courses"), 1200);
        } catch (e) {
            console.error("Failed to persist course", e);
            showToast("Erro ao salvar curso.", "error");
        }
    };

    const handleSaveDraft = () => {
        void persistCourse(false);
    };

    const handlePublish = () => {
        void persistCourse(true);
    };

    const addModule = () => {
        const newModule = {
            id: Math.random().toString(36).substr(2, 9),
            title: `Novo Módulo ${courseData.modules.length + 1}`,
            lessons: []
        };
        setCourseData(prev => ({ ...prev, modules: [...prev.modules, newModule] }));
    };

    const addLesson = (moduleId: string) => {
        const module = courseData.modules.find(m => m.id === moduleId);
        if (module && module.lessons.length > 0) {
            const lastLesson = module.lessons[module.lessons.length - 1];
            if (lastLesson && (!lastLesson.title.trim() || !lastLesson.videoUrl.trim())) {
                alert("Preencha o título e o link do vídeo da aula atual antes de adicionar uma nova!");
                return;
            }
        }

        const newLesson = {
            id: Math.random().toString(36).substr(2, 9),
            title: "Nova Aula",
            videoUrl: "",
            attachments: []
        };
        setCourseData(prev => ({
            ...prev,
            modules: prev.modules.map(m =>
                m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
            )
        }));
    };

    const updateLesson = (moduleId: string, lessonId: string, field: string, value: any) => {
        setCourseData(prev => ({
            ...prev,
            modules: prev.modules.map(m => {
                if (m.id === moduleId) {
                    return {
                        ...m,
                        lessons: m.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l)
                    };
                }
                return m;
            })
        }));
    };

    const removeModule = (id: string) => {
        setCourseData(prev => ({ ...prev, modules: prev.modules.filter(m => m.id !== id) }));
    };

    const removeLesson = (moduleId: string, lessonId: string) => {
        setCourseData(prev => ({
            ...prev,
            modules: prev.modules.map(m =>
                m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m
            )
        }));
    };

    const canGoToStep = (step: number): boolean => {
        if (step === 1) return true;
        if (step === 2) return courseData.title.trim() !== "" && courseData.description.trim() !== "";
        if (step === 3) {
            const hasLessons = courseData.modules.some(m => m.lessons.length > 0);
            const allLessonsHaveUrl = courseData.modules.every(m => m.lessons.every(l => l.videoUrl.trim() !== ""));
            return canGoToStep(2) && hasLessons && allLessonsHaveUrl;
        }
        return false;
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (courseData.title.trim() === "" || courseData.description.trim() === "") {
                showToast("Preencha o título e a descrição para continuar.", "error");
                return;
            }
        }
        if (currentStep === 2) {
            const hasLessons = courseData.modules.some(m => m.lessons.length > 0);
            const allLessonsHaveUrl = courseData.modules.every(m => m.lessons.every(l => l.videoUrl.trim() !== ""));
            if (!hasLessons || !allLessonsHaveUrl) {
                showToast("Adicione pelo menos uma aula com link do YouTube.", "error");
                return;
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    return (
        <div style={{ background: colors.bg, minHeight: "100%", padding: "40px" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>

                {/* Header Section */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <button onClick={() => router.back()} style={{ background: "none", border: "none", padding: 0, display: "flex", alignItems: "center", gap: "8px", color: colors.textMuted, cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
                            <ChevronLeft size={16} /> Voltar aos Cursos
                        </button>
                        <h1 style={{ fontSize: "36px", fontWeight: 900, color: colors.text, letterSpacing: "-1.5px" }}>{currentStep === 1 ? "Criar Novo Curso" : courseData.title || "Novo Curso"}</h1>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <Button onClick={handleSaveDraft} disabled={!courseData.title.trim() || !courseData.description.trim()} variant="outline" style={{ borderRadius: "14px", height: "52px", padding: "0 24px", fontWeight: 700, opacity: (!courseData.title.trim() || !courseData.description.trim()) ? 0.4 : 1, cursor: (!courseData.title.trim() || !courseData.description.trim()) ? "not-allowed" : "pointer" }}>Salvar Rascunho</Button>
                    </div>
                </div>

                {/* Progress Steps */}
                <div style={{ display: "flex", gap: "8px", background: colors.card, padding: "8px", borderRadius: "18px", border: `1px solid ${colors.border}` }}>
                    {["Informações Básicas", "Conteúdo (Aulas)", "Finalizar"].map((step, idx) => {
                        const stepNum = idx + 1;
                        const isAvailable = canGoToStep(stepNum);
                        const isActive = currentStep === stepNum;

                        return (
                            <button
                                key={step}
                                onClick={() => isAvailable && setCurrentStep(stepNum)}
                                disabled={!isAvailable}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "12px",
                                    background: isActive ? (isDark ? "rgba(145, 70, 255, 0.1)" : "#f5f3ff") : "transparent",
                                    border: "none",
                                    color: isActive ? colors.accent : (isAvailable ? colors.text : colors.textMuted),
                                    fontSize: "13px",
                                    fontWeight: 800,
                                    cursor: isAvailable ? "pointer" : "not-allowed",
                                    transition: "all 0.2s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    opacity: isAvailable ? 1 : 0.5
                                }}>
                                <div style={{
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "5px",
                                    background: isActive ? colors.accent : (isAvailable ? colors.textMuted : colors.border),
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "11px"
                                }}>{stepNum}</div>
                                {step}
                            </button>
                        );
                    })}
                </div>

                {/* Step Content */}
                {currentStep === 1 && (
                    <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
                        <Card style={{ borderRadius: "24px", border: `1px solid ${colors.border}`, background: colors.card }}>
                            <CardHeader style={{ padding: "32px 32px 0" }}>
                                <CardTitle style={{ fontSize: "18px", fontWeight: 900 }}>Detalhes do Curso</CardTitle>
                            </CardHeader>
                            <CardContent style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div>
                                    <label style={{ fontSize: "12px", fontWeight: 800, color: colors.textMuted, textTransform: "uppercase", marginBottom: "8px", display: "block" }}>Título do Curso</label>
                                    <input
                                        value={courseData.title}
                                        onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                                        placeholder="Ex: Masterclass de Vendas Internas"
                                        style={{ width: "100%", height: "52px", padding: "0 18px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "15px", fontWeight: 500, outline: "none" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: "12px", fontWeight: 800, color: colors.textMuted, textTransform: "uppercase", marginBottom: "8px", display: "block" }}>Link da Capa (Imagem)</label>
                                    <input value={courseData.coverUrl} onChange={e => setCourseData({ ...courseData, coverUrl: e.target.value })} placeholder="https://exemplo.com/imagem.jpg" style={{ width: "100%", height: "52px", padding: "0 18px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "15px", fontWeight: 500, outline: "none" }} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "20px" }}>
                                    <div>
                                        <label style={{ fontSize: "12px", fontWeight: 800, color: colors.textMuted, textTransform: "uppercase", marginBottom: "8px", display: "block" }}>Descrição Curta (Pitch)</label>
                                        <input
                                            value={courseData.description}
                                            onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                                            placeholder="O que os alunos vão aprender nesta jornada..."
                                            style={{ width: "100%", height: "52px", padding: "0 18px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "15px", fontWeight: 500 }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "12px", fontWeight: 800, color: colors.textMuted, textTransform: "uppercase", marginBottom: "8px", display: "block" }}>Nível</label>
                                        <select
                                            value={courseData.level}
                                            onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}
                                            style={{ width: "100%", height: "52px", padding: "0 18px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "15px", fontWeight: 500 }}>
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
                                            <input
                                                value={module.title}
                                                onChange={(e) => {
                                                    const updated = [...courseData.modules];
                                                    if (updated[mIdx]) {
                                                        updated[mIdx].title = e.target.value;
                                                    }
                                                    setCourseData({ ...courseData, modules: updated });
                                                }}
                                                style={{ background: "transparent", border: "none", fontSize: "16px", fontWeight: 800, color: colors.text, outline: "none", width: "300px" }}
                                            />
                                        </div>
                                        <Button onClick={() => removeModule(module.id)} variant="ghost" size="icon" style={{ color: "#ef4444" }}><Trash2 size={18} /></Button>
                                    </div>
                                    <CardContent style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {module.lessons.map((lesson, lIdx) => (
                                            <div key={lesson.id} style={{ padding: "16px", borderRadius: "16px", border: `1px solid ${colors.border}`, background: isDark ? "rgba(0,0,0,0.1)" : "white", transition: "all 0.2s ease" }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(145, 70, 255, 0.1)", color: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 900 }}>{lIdx + 1}</div>
                                                        <input
                                                            value={lesson.title}
                                                            onChange={(e) => updateLesson(module.id, lesson.id, "title", e.target.value)}
                                                            placeholder="Título da Aula"
                                                            style={{ flex: 1, background: "transparent", border: "none", fontSize: "14px", fontWeight: 700, color: colors.text, outline: "none" }}
                                                        />
                                                        <Button onClick={() => removeLesson(module.id, lesson.id)} variant="ghost" size="icon" style={{ color: colors.textMuted }}><Trash2 size={16} /></Button>
                                                    </div>
                                                    <div style={{ position: "relative" }}>
                                                        <Play size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: colors.textMuted }} />
                                                        <input
                                                            value={lesson.videoUrl}
                                                            onChange={(e) => updateLesson(module.id, lesson.id, "videoUrl", e.target.value)}
                                                            placeholder="Cole o link do YouTube aqui..."
                                                            style={{ width: "100%", height: "40px", padding: "0 14px 0 38px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${colors.border}`, color: colors.text, fontSize: "13px", fontWeight: 500 }}
                                                        />
                                                    </div>

                                                    {/* Attachments Section */}
                                                    <div style={{ marginTop: "8px", borderTop: `1px solid ${colors.border}`, paddingTop: "12px" }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                            <span style={{ fontSize: "11px", fontWeight: 800, color: colors.textMuted, textTransform: "uppercase" }}>Materiais Complementares (PDF)</span>
                                                            <Button
                                                                onClick={() => {
                                                                    const updatedModules = courseData.modules.map(m => {
                                                                        if (m.id === module.id) {
                                                                            return {
                                                                                ...m,
                                                                                lessons: m.lessons.map(l => {
                                                                                    if (l.id === lesson.id) {
                                                                                        return { ...l, attachments: [...(l.attachments || []), { id: Date.now().toString(), title: "Novo Material", url: "" }] };
                                                                                    }
                                                                                    return l;
                                                                                })
                                                                            };
                                                                        }
                                                                        return m;
                                                                    });
                                                                    setCourseData({ ...courseData, modules: updatedModules as any });
                                                                }}
                                                                variant="ghost" size="sm" style={{ height: "24px", fontSize: "11px", color: colors.accent, fontWeight: 700 }}>
                                                                <FileText size={12} className="mr-1" /> Adicionar
                                                            </Button>
                                                        </div>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                            {lesson.attachments?.map((file, fIdx) => (
                                                                <div key={file.id} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                                    <input
                                                                        value={file.title}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            const updatedModules = courseData.modules.map(m => {
                                                                                if (m.id === module.id) {
                                                                                    return {
                                                                                        ...m,
                                                                                        lessons: m.lessons.map(l => {
                                                                                            if (l.id === lesson.id) {
                                                                                                const updatedFiles = l.attachments.map(att => att.id === file.id ? { ...att, title: val } : att);
                                                                                                return { ...l, attachments: updatedFiles };
                                                                                            }
                                                                                            return l;
                                                                                        })
                                                                                    };
                                                                                }
                                                                                return m;
                                                                            });
                                                                            setCourseData({ ...courseData, modules: updatedModules as any });
                                                                        }}
                                                                        placeholder="Nome do arquivo"
                                                                        style={{ flex: 1, height: "32px", padding: "0 10px", borderRadius: "8px", background: isDark ? "rgba(255,255,255,0.02)" : "#f1f5f9", border: "1px solid transparent", fontSize: "12px", color: colors.text, fontWeight: 600, outline: "none" }}
                                                                    />
                                                                    <input
                                                                        value={file.url}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            const updatedModules = courseData.modules.map(m => {
                                                                                if (m.id === module.id) {
                                                                                    return {
                                                                                        ...m,
                                                                                        lessons: m.lessons.map(l => {
                                                                                            if (l.id === lesson.id) {
                                                                                                const updatedFiles = l.attachments.map(att => att.id === file.id ? { ...att, url: val } : att);
                                                                                                return { ...l, attachments: updatedFiles };
                                                                                            }
                                                                                            return l;
                                                                                        })
                                                                                    };
                                                                                }
                                                                                return m;
                                                                            });
                                                                            setCourseData({ ...courseData, modules: updatedModules as any });
                                                                        }}
                                                                        placeholder="Link do PDF (Google Drive, etc)"
                                                                        style={{ flex: 1.5, height: "32px", padding: "0 10px", borderRadius: "8px", background: isDark ? "rgba(255,255,255,0.02)" : "#f1f5f9", border: "1px solid transparent", fontSize: "12px", color: colors.text, fontWeight: 500, outline: "none" }}
                                                                    />
                                                                    <Button
                                                                        onClick={() => {
                                                                            const updatedModules = courseData.modules.map(m => {
                                                                                if (m.id === module.id) {
                                                                                    return {
                                                                                        ...m,
                                                                                        lessons: m.lessons.map(l => {
                                                                                            if (l.id === lesson.id) {
                                                                                                return { ...l, attachments: l.attachments.filter(a => a.id !== file.id) };
                                                                                            }
                                                                                            return l;
                                                                                        })
                                                                                    };
                                                                                }
                                                                                return m;
                                                                            });
                                                                            setCourseData({ ...courseData, modules: updatedModules });
                                                                        }}
                                                                        variant="ghost" size="icon" style={{ height: "32px", width: "32px", color: colors.textMuted }}><Trash2 size={14} /></Button>
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
                                                <Button
                                                    onClick={() => addLesson(module.id)}
                                                    variant="ghost"
                                                    style={{
                                                        width: "100%",
                                                        height: "50px",
                                                        borderRadius: "12px",
                                                        border: `1px dashed ${colors.border}`,
                                                        color: colors.textMuted,
                                                        fontSize: "13px",
                                                        fontWeight: 700,
                                                        opacity: isLessonIncomplete ? 0.5 : 1,
                                                        cursor: isLessonIncomplete ? "not-allowed" : "pointer"
                                                    }}>
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
                                        <div style={{ background: "rgba(145, 70, 255, 0.1)", padding: "8px", borderRadius: "10px" }}>
                                            <Play size={20} fill="currentColor" />
                                        </div>
                                        <CardTitle style={{ fontSize: "16px", fontWeight: 900 }}>Importante: Vídeos no YouTube</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent style={{ padding: "0 24px 24px" }}>
                                    <p style={{ fontSize: "13px", color: colors.text, lineHeight: "1.6", fontWeight: 700, marginBottom: "12px" }}>
                                        Nossa plataforma é otimizada para YouTube. Siga estes passos:
                                    </p>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                        <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
                                            <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: colors.accent, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 900, flexShrink: 0 }}>1</div>
                                            <div>
                                                <p style={{ fontSize: "13px", color: colors.text, fontWeight: 700, margin: 0 }}>Suba seu vídeo no YouTube</p>
                                                <p style={{ fontSize: "12px", color: colors.textMuted, margin: "4px 0 0" }}>Use o YouTube Studio para fazer o upload da sua aula.</p>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
                                            <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: colors.accent, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 900, flexShrink: 0 }}>2</div>
                                            <div>
                                                <p style={{ fontSize: "13px", color: colors.text, fontWeight: 700, margin: 0 }}>Configure como "Não Listado"</p>
                                                <p style={{ fontSize: "12px", color: colors.textMuted, margin: "4px 0 0" }}>Isso garante que <span style={{ color: "#ef4444", fontWeight: 700 }}>apenas seus alunos</span> vejam o vídeo.</p>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
                                            <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: colors.accent, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 900, flexShrink: 0 }}>3</div>
                                            <div>
                                                <p style={{ fontSize: "13px", color: colors.text, fontWeight: 700, margin: 0 }}>Copie o link da barra de endereço</p>
                                                <div style={{ marginTop: "8px", padding: "10px", borderRadius: "10px", background: isDark ? "rgba(0,0,0,0.3)" : "rgba(145, 70, 255, 0.05)", fontSize: "11px", fontWeight: 700, color: colors.accent, border: `1px dashed ${colors.accent}44` }}>
                                                    youtube.com/watch?v=...
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: "20px", padding: "12px", borderRadius: "14px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.1)", display: "flex", gap: "10px", alignItems: "center" }}>
                                        <CheckCircle2 size={16} color="#10b981" />
                                        <span style={{ fontSize: "11px", color: "#065f46", fontWeight: 700 }}>Formatamos o player automaticamente.</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Button onClick={handleNextStep} style={{ background: colors.accent, height: "56px", borderRadius: "16px", fontWeight: 800 }}>Confirmar e Finalizar</Button>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%", textAlign: "center" }}>
                        <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 style={{ fontSize: "24px", fontWeight: 900, color: colors.text, marginBottom: "12px" }}>Tudo Pronto!</h2>
                        <p style={{ fontSize: "15px", color: colors.textMuted, marginBottom: "40px", fontWeight: 500, lineHeight: "1.6" }}>
                            Seu curso <strong>"{courseData.title}"</strong> já tem estrutura e conteúdo definidos. <br />
                            Ele estará disponível para todos os assinantes da plataforma assim que for publicado.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <Button onClick={handlePublish} style={{ background: colors.accent, height: "56px", borderRadius: "16px", fontWeight: 800, fontSize: "16px" }}>
                                <CheckCircle2 size={20} className="mr-2" /> Publicar Curso Agora
                            </Button>
                            <Button variant="outline" onClick={() => setCurrentStep(1)} style={{ height: "56px", borderRadius: "16px", fontWeight: 700 }}>
                                <Settings size={18} className="mr-2" /> Revisar Detalhes
                            </Button>
                        </div>
                    </div>
                )}\r
            </div>

            <ToastContainer toasts={toasts} onRemove={remove} />
        </div>
    );
}


