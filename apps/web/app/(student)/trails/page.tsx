"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Map, Sparkles, Play, BookOpen } from "lucide-react";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
    id: string;
    title: string;
    category: string;
    thumbnail: string;
    status: string;
}

interface Trail {
    id: string;
    title: string;
    description: string;
    accent: string;
    courseIds: string[];
    createdAt: string;
    cover?: string;
    progress?: number;
    totalCourses?: number;
    completedCourses?: number;
}

function TrailsCatalogSkeleton({ isMobile }: { isMobile: boolean }) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "30px",
            marginTop: "20px"
        }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <Skeleton width="100%" height={200} borderRadius="20px" />
                    <Skeleton width="70%" height={24} />
                    <Skeleton width="100%" height={60} />
                </div>
            ))}
        </div>
    );
}

export default function TrailsCatalogPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [trails, setTrails] = useState<Trail[]>([]);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        const storedTrails: Trail[] = JSON.parse(localStorage.getItem("creator_published_trails") || "[]");
        const storedCourses: Course[] = JSON.parse(localStorage.getItem("creator_published_courses") || "[]");
        const studentProgress: Record<string, number> = JSON.parse(localStorage.getItem("student_progress") || "{}");

        const mappedTrails = storedTrails.map(t => {
            const trailCourses = storedCourses.filter(c => t.courseIds.includes(c.id));
            const completedCount = trailCourses.filter(c => studentProgress[c.id] === 100).length;
            const progress = trailCourses.length > 0 ? Math.round((completedCount / trailCourses.length) * 100) : 0;

            return {
                ...t,
                cover: trailCourses[0]?.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
                progress,
                totalCourses: trailCourses.length,
                completedCourses: completedCount,
            };
        });

        setTrails(mappedTrails);
        const timer = setTimeout(() => setIsLoading(false), 800);

        return () => {
            window.removeEventListener("resize", checkMobile);
            clearTimeout(timer);
        };
    }, []);

    if (!mounted) return null;

    const colors = {
        bg: "var(--brand-bg)",
        cardBg: "var(--brand-card)",
        text: "var(--brand-text)",
        textMuted: "var(--brand-text-muted)",
        border: "var(--brand-border)",
        accent: "var(--brand-accent)"
    };

    return (
        <div style={{ background: colors.bg, minHeight: "100%", color: colors.text, display: "flex", flexDirection: "column" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { font-family: 'Plus Jakarta Sans', sans-serif; }
                
                .trail-card {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
                }
                .trail-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                .trail-card:hover .cover-overlay {
                    opacity: 1 !important;
                }
            `}</style>

            <header style={{
                padding: isMobile ? "24px 20px" : "40px clamp(20px, 5vw, 60px)",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: colors.accent, marginBottom: "8px" }}>
                    <Map size={24} strokeWidth={2.5} />
                    <span style={{ fontSize: "12px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1.5px" }}>Sua Jornada</span>
                </div>
                <h1 style={{ fontSize: isMobile ? "28px" : "42px", fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1 }}>Trilhas de Aprendizado</h1>
                <p style={{ fontSize: "16px", color: colors.textMuted, maxWidth: "600px", lineHeight: 1.6, fontWeight: 500 }}>
                    Caminhos guiados passo a passo para você atingir seus objetivos mais rápido. Escolha uma trilha e comece sua evolução.
                </p>
            </header>

            <main style={{ padding: isMobile ? "0 20px 80px" : "0 clamp(20px, 5vw, 60px) 100px", flex: 1 }}>
                {isLoading ? (
                    <TrailsCatalogSkeleton isMobile={isMobile} />
                ) : trails.length === 0 ? (
                    <div style={{
                        padding: "60px 20px",
                        textAlign: "center",
                        border: `2px dashed ${colors.border}`,
                        borderRadius: "24px",
                        background: colors.cardBg,
                        marginTop: "20px"
                    }}>
                        <Map size={48} style={{ margin: "0 auto 20px", opacity: 0.3 }} />
                        <h3 style={{ fontSize: "20px", fontWeight: 900, color: colors.text, marginBottom: "10px" }}>Nenhuma trilha encontrada</h3>
                        <p style={{ fontSize: "14px", color: colors.textMuted, maxWidth: "300px", margin: "0 auto 30px", lineHeight: 1.6 }}>
                            Novas trilhas serão publicadas em breve pela nossa equipe de criadores.
                        </p>
                        <button
                            onClick={() => router.push("/catalog")}
                            style={{
                                padding: "12px 24px", borderRadius: "12px",
                                background: colors.accent, color: "white",
                                border: "none", fontWeight: 800, fontSize: "14px", cursor: "pointer"
                            }}
                        >
                            Explorar Catálogo de Cursos
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))",
                        gap: "35px",
                        marginTop: "20px"
                    }}>
                        {trails.map(trail => (
                            <div
                                key={trail.id}
                                className="trail-card"
                                onClick={() => router.push(`/trails/${trail.id}`)}
                                style={{
                                    background: colors.cardBg,
                                    borderRadius: "24px",
                                    overflow: "hidden",
                                    border: `1px solid ${colors.border}`,
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    position: "relative"
                                }}
                            >
                                <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#f1f5f9" }}>
                                    <img
                                        src={trail.cover}
                                        alt={trail.title}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />

                                    <div className="cover-overlay" style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: "rgba(0,0,0,0.5)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        opacity: 0,
                                        transition: "opacity 0.3s ease"
                                    }}>
                                        <div style={{
                                            width: "60px",
                                            height: "60px",
                                            borderRadius: "50%",
                                            background: "rgba(255,255,255,0.2)",
                                            backdropFilter: "blur(10px)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white"
                                        }}>
                                            <Play size={28} fill="currentColor" style={{ marginLeft: "4px" }} />
                                        </div>
                                    </div>

                                    <div style={{
                                        position: "absolute",
                                        top: "16px",
                                        left: "16px",
                                        background: "rgba(0,0,0,0.6)",
                                        backdropFilter: "blur(4px)",
                                        color: "white",
                                        padding: "6px 12px",
                                        borderRadius: "100px",
                                        fontSize: "12px",
                                        fontWeight: 800,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px"
                                    }}>
                                        <BookOpen size={14} /> {trail.totalCourses} Cursos
                                    </div>
                                </div>

                                <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: colors.text, marginBottom: "8px", lineHeight: 1.3 }}>
                                        {trail.title}
                                    </h3>

                                    <p style={{
                                        fontSize: "14px",
                                        color: colors.textMuted,
                                        lineHeight: 1.6,
                                        marginBottom: "24px",
                                        flex: 1,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden"
                                    }}>
                                        {trail.description}
                                    </p>

                                    <div style={{ marginTop: "auto" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px", fontWeight: 800 }}>
                                            <span style={{ color: colors.textMuted }}>Progresso</span>
                                            <span style={{ color: colors.accent }}>{trail.progress}%</span>
                                        </div>
                                        <div style={{ height: "6px", width: "100%", background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)", borderRadius: "10px", overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${trail.progress}%`, background: colors.accent, borderRadius: "10px", transition: "width 1s ease" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div >
                )}
            </main >
        </div >
    );
}
