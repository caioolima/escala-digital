"use client";

import { useEffect, useState } from "react";
import { CourseCard, CourseCardSkeleton } from "@/components/courses/course-card";
import {
    Search, Play, Info, Sparkles, TrendingUp
} from "lucide-react";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    level?: "beginner" | "intermediate" | "advanced";
    durationMins?: number;
    lessonsCount?: number;
    studentsCount?: number;
    rating?: number;
    status: string;
}

function CatalogSkeleton({ isMobile }: { isMobile: boolean }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "20px" : "30px" }}>
            {/* Hero Skeleton */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Skeleton width={120} height={14} />
                <Skeleton width={isMobile ? "80%" : "40%"} height={isMobile ? 32 : 42} />
            </div>

            {/* Spotlight Skeleton */}
            <Skeleton height={isMobile ? 400 : 440} borderRadius="32px" />

            {/* Toolbar Skeleton */}
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "20px", marginTop: "20px" }}>
                <Skeleton height={50} borderRadius="16px" style={{ flex: 1 }} />
                <div style={{ display: "flex", gap: "12px" }}>
                    <Skeleton width={140} height={50} borderRadius="16px" />
                    <Skeleton width={140} height={50} borderRadius="16px" />
                </div>
            </div>

            {/* Grid Skeleton */}
            <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "35px",
                marginTop: "20px"
            }}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <CourseCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export default function CatalogPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [mounted, setMounted] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        try {
            const storedCourses: Course[] = JSON.parse(localStorage.getItem("creator_published_courses") || "[]");
            // Map the stored courses to handle missing UI properties gracefully
            const mappedCourses = storedCourses.map(c => ({
                ...c,
                level: c.level || "intermediate",
                durationMins: c.durationMins || 120,
                lessonsCount: c.lessonsCount || 10,
                studentsCount: c.studentsCount || Math.floor(Math.random() * 500) + 10,
                rating: c.rating || 4.5 + Math.random() * 0.5
            }));
            setCourses(mappedCourses);
        } catch (e) {
            console.error(e);
        }

        const timer = setTimeout(() => setIsLoading(false), 800);

        return () => {
            window.removeEventListener("resize", checkMobile);
            clearTimeout(timer);
        };
    }, []);

    if (!mounted) return null;

    const featured = courses[0];

    const filtered = courses.filter(c => {
        return c.title.toLowerCase().includes(search.toLowerCase()) ||
            (c.description || "").toLowerCase().includes(search.toLowerCase());
    });

    const colors = {
        bg: "var(--brand-bg)",
        cardBg: "var(--brand-card)",
        text: "var(--brand-text)",
        textMuted: "var(--brand-text-muted)",
        border: "var(--brand-border)",
        accent: "var(--brand-accent)",
    };

    return (
        <div style={{ background: colors.bg, minHeight: "100%", color: colors.text, display: "flex", flexDirection: "column" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                * { font-family: 'Inter', sans-serif; }
            `}</style>

            <header style={{
                padding: isMobile ? "24px 20px" : "40px clamp(20px, 5vw, 80px)",
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? "20px" : "30px"
            }}>
                {isLoading ? (
                    <CatalogSkeleton isMobile={isMobile} />
                ) : (
                    <>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: colors.accent }}>
                                    <Sparkles size={16} fill="currentColor" />
                                    <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1.5px" }}>Escala Digital Premium</span>
                                </div>
                                <h1 style={{ fontSize: isMobile ? "24px" : "clamp(24px, 4vw, 36px)", fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1 }}>Catálogo de Cursos</h1>
                            </div>
                        </div>

                        {featured && !search && (
                            <div style={{
                                position: "relative",
                                width: "100%",
                                minHeight: isMobile ? "max-content" : "440px",
                                borderRadius: isMobile ? "24px" : "32px",
                                overflow: "hidden",
                                background: colors.cardBg,
                                display: "flex",
                                flexDirection: isMobile ? "column-reverse" : "row",
                                alignItems: "stretch",
                                boxShadow: "0 40px 80px -20px rgba(0,0,0,0.1)",
                                border: `1px solid ${colors.border}`,
                            }}>
                                <div style={{
                                    flex: 1.2,
                                    position: "relative",
                                    zIndex: 10,
                                    padding: isMobile ? "30px 20px" : "clamp(30px, 5vw, 60px)",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    gap: "24px",
                                    background: colors.cardBg
                                }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                                            <div style={{
                                                padding: "6px 12px",
                                                borderRadius: "100px",
                                                background: isDark ? "rgba(59, 130, 246, 0.2)" : "#eff6ff",
                                                color: colors.accent,
                                                fontSize: "10px",
                                                fontWeight: 900,
                                                textTransform: "uppercase",
                                                letterSpacing: "1px",
                                                border: `1px solid ${colors.accent}30`
                                            }}>
                                                Em destaque
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMuted, fontSize: "11px", fontWeight: 700 }}>
                                                <TrendingUp size={14} /> Recomendado para você
                                            </div>
                                        </div>

                                        <h2 style={{
                                            fontSize: isMobile ? "28px" : "clamp(32px, 4vw, 48px)",
                                            fontWeight: 900,
                                            color: colors.text,
                                            letterSpacing: "-2px",
                                            lineHeight: 1.1,
                                            marginBottom: "16px",
                                            maxWidth: "550px"
                                        }}>
                                            {featured.title}
                                        </h2>

                                        <p style={{
                                            fontSize: isMobile ? "15px" : "clamp(16px, 1.8vw, 18px)",
                                            color: colors.textMuted,
                                            lineHeight: 1.6,
                                            fontWeight: 500,
                                            maxWidth: "500px",
                                        }}>
                                            {featured.description || "Nenhuma descrição disponível."}
                                        </p>
                                    </div>

                                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                                        <button
                                            onClick={() => router.push(`/courses/${featured.id}`)}
                                            style={{
                                                flex: isMobile ? 1 : "none",
                                                padding: isMobile ? "14px 24px" : "16px 42px",
                                                borderRadius: "14px",
                                                background: colors.accent,
                                                color: "white",
                                                border: "none",
                                                fontWeight: 900,
                                                fontSize: isMobile ? "15px" : "16px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "10px",
                                                cursor: "pointer",
                                                boxShadow: `0 15px 35px ${colors.accent}40`,
                                                transition: "all 0.3s ease"
                                            }}
                                        >
                                            <Play size={18} fill="currentColor" /> Começar
                                        </button>

                                        <button
                                            onClick={() => router.push(`/courses/${featured.id}`)}
                                            style={{
                                                flex: isMobile ? 1 : "none",
                                                padding: isMobile ? "14px 24px" : "16px 42px",
                                                borderRadius: "14px",
                                                background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                                                color: colors.text,
                                                border: `1px solid ${colors.border}`,
                                                fontWeight: 800,
                                                fontSize: isMobile ? "15px" : "16px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "10px",
                                                cursor: "pointer",
                                                transition: "all 0.3s ease"
                                            }}
                                        >
                                            <Info size={18} /> Detalhes
                                        </button>
                                    </div>
                                </div >

                                <div style={{
                                    flex: 1,
                                    minHeight: isMobile ? "240px" : "auto",
                                    position: "relative",
                                    overflow: "hidden",
                                    background: isDark ? "rgba(255,255,255,0.02)" : "#f1f5f9"
                                }}>
                                    {!imgError ? (
                                        <img
                                            src={featured.thumbnail}
                                            alt={featured.title}
                                            onError={() => setImgError(true)}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                position: "absolute",
                                                inset: 0,
                                                zIndex: 1
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: "100%",
                                            height: "100%",
                                            background: `linear-gradient(135deg, ${colors.accent}15 0%, ${colors.cardBg} 100%)`,
                                            zIndex: 1
                                        }} />
                                    )}

                                    <div style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: isMobile ?
                                            `linear-gradient(to top, ${colors.cardBg} 0%, transparent 60%)` :
                                            `linear-gradient(to right, ${colors.cardBg} 0%, transparent 45%)`,
                                        zIndex: 2
                                    }} />
                                </div>
                            </div >
                        )
                        }

                        <div style={{
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                            alignItems: isMobile ? "stretch" : "center",
                            justifyContent: "space-between",
                            padding: "30px 0",
                            borderBottom: `1px solid ${colors.border}`,
                            marginTop: isMobile ? "10px" : "20px",
                            marginBottom: isMobile ? "24px" : "40px",
                            gap: "24px"
                        }}>
                            <div style={{ position: "relative", width: isMobile ? "100%" : "clamp(300px, 40%, 500px)" }}>
                                <Search size={20} style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: colors.textMuted }} />
                                <input
                                    type="text"
                                    placeholder="Pesquisar treinamentos..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{
                                        width: "100%",
                                        height: "52px",
                                        padding: "0 20px 0 54px",
                                        background: isDark ? "rgba(255,255,255,0.03)" : "white",
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: "14px",
                                        fontSize: "15px",
                                        color: colors.text,
                                        outline: "none",
                                        fontWeight: 500,
                                    }}
                                />
                            </div>

                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "24px",
                                justifyContent: isMobile ? "space-between" : "flex-end",
                                padding: isMobile ? "0 10px" : "0"
                            }}>
                                <div style={{ textAlign: isMobile ? "left" : "right" }}>
                                    <div style={{ fontSize: "10px", color: colors.textMuted, fontWeight: 900, textTransform: "uppercase", letterSpacing: "1.2px" }}>Cursos</div>
                                    <div style={{ fontSize: "20px", fontWeight: 900, color: colors.text }}>{courses.length}</div>
                                </div>
                                <div style={{ width: "1px", height: "30px", background: colors.border }} />
                                <div style={{ textAlign: isMobile ? "left" : "right" }}>
                                    <div style={{ fontSize: "10px", color: colors.textMuted, fontWeight: 900, textTransform: "uppercase", letterSpacing: "1.2px" }}>Concluídos</div>
                                    <div style={{ fontSize: "20px", fontWeight: 900, color: colors.text }}>0</div>
                                </div>
                            </div>
                        </div>

                        {filtered.length > 0 ? (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
                                gap: isMobile ? "24px" : "35px"
                            }}>
                                {filtered.map(course => (
                                    <div key={course.id} onClick={() => router.push(`/courses/${course.id}`)}>
                                        {/* @ts-ignore */}
                                        <CourseCard course={course} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                padding: "60px 20px",
                                textAlign: "center",
                                border: `2px dashed ${colors.border}`,
                                borderRadius: "24px",
                                background: colors.cardBg
                            }}>
                                <div style={{ fontSize: "40px", marginBottom: "20px", opacity: 0.5 }}>🔎</div>
                                <h3 style={{ fontSize: "20px", fontWeight: 900, color: colors.text, marginBottom: "10px" }}>Nada encontrado</h3>
                                <p style={{ fontSize: "14px", color: colors.textMuted, maxWidth: "300px", margin: "0 auto 30px", lineHeight: 1.6 }}>
                                    Tente outros termos de pesquisa.
                                </p>
                                <button
                                    onClick={() => setSearch("")}
                                    style={{
                                        padding: "12px 24px", borderRadius: "12px",
                                        background: colors.accent, color: "white",
                                        border: "none", fontWeight: 800, fontSize: "14px", cursor: "pointer"
                                    }}
                                >
                                    Limpar Filtros
                                </button>
                            </div>
                        )}
                    </>
                )}
            </header>

            <main style={{ padding: isMobile ? "0 20px 80px" : "0 clamp(20px, 5vw, 80px) 100px", flex: 1 }}>
                {/* Footer or extra content */}
            </main>
        </div>
    );
}
