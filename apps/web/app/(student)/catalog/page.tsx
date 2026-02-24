"use client";

import { useEffect, useState } from "react";
import { CourseCard, CourseCardSkeleton } from "@/components/courses/course-card";
import {
    Search, Play, Info, Sparkles, TrendingUp, ArrowRight, SearchX, RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    durationMins: number;
    lessonsCount: number;
    studentsCount: number;
    rating: number;
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
    const [featuredStarted, setFeaturedStarted] = useState(false);
    const [activeFilter, setActiveFilter] = useState<"all" | "started">("all");

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
            const dummyCourses: Course[] = [
                {
                    id: "dummy-1",
                    title: "Masterclass: High-Performance Marketing",
                    description: "Aprenda as estratégias mais avançadas de growth hacking e marketing digital para escalar seu negócio em tempo recorde.",
                    category: "Marketing",
                    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2026&auto=format&fit=crop",
                    level: "advanced",
                    durationMins: 480,
                    lessonsCount: 24,
                    studentsCount: 1240,
                    rating: 4.9,
                    status: "published"
                },
                {
                    id: "dummy-2",
                    title: "Design de Interfaces Modernas",
                    description: "Descubra como criar UIs surreais e experiências de usuário que encantam seus clientes em cada interação.",
                    category: "Design",
                    thumbnail: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1964&auto=format&fit=crop",
                    level: "intermediate",
                    durationMins: 360,
                    lessonsCount: 18,
                    studentsCount: 856,
                    rating: 4.8,
                    status: "published"
                },
                {
                    id: "dummy-3",
                    title: "Estratégia de Vendas e CRM",
                    description: "O guia definitivo para gerenciar pipelines complexos e fechar negócios de alto valor de forma sistemática.",
                    category: "Vendas",
                    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
                    level: "beginner",
                    durationMins: 240,
                    lessonsCount: 12,
                    studentsCount: 2100,
                    rating: 4.7,
                    status: "published"
                }
            ];

            if (storedCourses.length === 0) {
                setCourses(dummyCourses);
            } else {
                setCourses(mappedCourses);
            }

            // Check featured course progress
            const initialCourses = storedCourses.length === 0 ? dummyCourses : mappedCourses;
            if (initialCourses.length > 0) {
                const progress: Record<string, number | undefined> = JSON.parse(localStorage.getItem("student_progress") || "{}");
                const fId = initialCourses[0]?.id;
                if (fId && progress[fId] && (progress[fId] ?? 0) > 0) {
                    setFeaturedStarted(true);
                }
            }
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
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
            (c.description || "").toLowerCase().includes(search.toLowerCase());

        if (activeFilter === "started") {
            const progress: Record<string, number | undefined> = JSON.parse(localStorage.getItem("student_progress") || "{}");
            return matchesSearch && progress[c.id] && (progress[c.id] ?? 0) > 0;
        }

        return matchesSearch;
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
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { font-family: 'Plus Jakarta Sans', sans-serif; }
                .glass { background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}; backdrop-filter: blur(20px); }
                .hover-scale { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .hover-scale:hover { transform: translateY(-8px) scale(1.02); }
                @keyframes shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            {/* Mesh Gradient Background */}
            <div style={{
                position: "fixed",
                inset: 0,
                zIndex: -1,
                background: isDark
                    ? "radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(124, 58, 237, 0.08) 0%, transparent 50%), #020617"
                    : "radial-gradient(circle at 0% 0%, #eff6ff 0%, transparent 50%), radial-gradient(circle at 100% 100%, #faf5ff 0%, transparent 50%), #f8fafc",
            }} />

            <header style={{
                padding: isMobile ? "24px 20px" : "40px clamp(20px, 5vw, 80px)",
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? "30px" : "50px",
                position: "relative",
                zIndex: 10
            }}>
                {isLoading ? (
                    <CatalogSkeleton isMobile={isMobile} />
                ) : (
                    <>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                        >
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: colors.accent }}>
                                    <Sparkles size={16} fill="currentColor" />
                                    <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "2.5px" }}>Escala Digital Hub</span>
                                </div>
                                <h1 style={{
                                    fontSize: isMobile ? "32px" : "clamp(32px, 5vw, 56px)",
                                    fontWeight: 900,
                                    letterSpacing: "-3px",
                                    lineHeight: 0.9,
                                    marginBottom: "10px",
                                    color: isDark ? "#ffffff" : colors.text
                                }}>
                                    Explore o <br /> <span style={{ color: colors.accent }}>Conhecimento</span>
                                </h1>
                            </div>
                        </motion.div>

                        {featured && !search && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    minHeight: isMobile ? "auto" : "500px",
                                    borderRadius: isMobile ? "24px" : "32px",
                                    overflow: "hidden",
                                    background: isDark ? "#ffffff" : "#1d4ed8",
                                    display: "flex",
                                    flexDirection: isMobile ? "column-reverse" : "row",
                                    alignItems: "stretch",
                                    boxShadow: isDark ? "0 50px 100px -20px rgba(0,0,0,0.1)" : "0 50px 100px -20px rgba(0,0,0,0.3)",
                                    border: isDark ? "1px solid rgba(0,0,0,0.05)" : "1px solid rgba(255,255,255,0.1)",
                                    cursor: "pointer"
                                }}
                                onClick={() => router.push(`/courses/${featured.id}`)}
                            >
                                {/* Left Content */}
                                <div style={{
                                    flex: 1,
                                    padding: isMobile ? "40px 24px" : "60px 80px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    zIndex: 10,
                                    position: "relative",
                                    background: isMobile ? "transparent" : (isDark ? "linear-gradient(90deg, #ffffff 40%, transparent 100%)" : "linear-gradient(90deg, #1d4ed8 40%, transparent 100%)")
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
                                        <div style={{
                                            padding: "12px 24px",
                                            borderRadius: "100px",
                                            background: isDark ? "#2563eb" : "#ffffff",
                                            color: isDark ? "white" : "#1d4ed8",
                                            fontSize: "14px",
                                            fontWeight: 900,
                                            textTransform: "uppercase",
                                            letterSpacing: "1.5px",
                                            boxShadow: isDark ? "0 0 20px rgba(37, 99, 235, 0.3)" : "0 0 20px rgba(255,255,255,0.3)",
                                            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.05)"
                                        }}>
                                            Em destaque
                                        </div>
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            color: isDark ? "rgba(15, 23, 42, 0.65)" : "rgba(255,255,255,0.85)",
                                            fontSize: "16px",
                                            fontWeight: 700
                                        }}>
                                            <TrendingUp size={20} /> Recomendado para você
                                        </div>
                                    </div>

                                    <h2 style={{
                                        fontSize: isMobile ? "42px" : "64px",
                                        fontWeight: 950,
                                        color: isDark ? "#020617" : "white",
                                        letterSpacing: "-3.5px",
                                        lineHeight: 0.95,
                                        marginBottom: "20px",
                                        maxWidth: "600px",
                                        textShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.3)"
                                    }}>
                                        {featured.title}
                                    </h2>

                                    <p style={{
                                        fontSize: isMobile ? "15px" : "18px",
                                        color: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)",
                                        lineHeight: 1.6,
                                        fontWeight: 500,
                                        maxWidth: "480px",
                                        marginBottom: isMobile ? "24px" : "40px"
                                    }}>
                                        {featured.description || "Nenhuma descrição disponível."}
                                    </p>

                                    <div>
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                padding: "18px 48px",
                                                borderRadius: "16px",
                                                background: isDark ? "#2563eb" : "#ffffff",
                                                color: isDark ? "#ffffff" : "#1d4ed8",
                                                border: "none",
                                                fontWeight: 900,
                                                fontSize: "16px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                cursor: "pointer",
                                                boxShadow: isDark ? "0 20px 40px rgba(37, 99, 235, 0.4)" : "0 20px 40px rgba(0,0,0,0.2)"
                                            }}
                                        >
                                            <Play size={20} fill="currentColor" /> {featuredStarted ? "Visualizar" : "Prosseguir"}
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Right Image with Fade */}
                                <div style={{
                                    flex: 1,
                                    position: "relative",
                                    width: isMobile ? "100%" : "auto",
                                    height: isMobile ? "240px" : "auto",
                                    zIndex: 1,
                                    minHeight: isMobile ? "240px" : "100%"
                                }}>
                                    <div style={{
                                        position: "absolute",
                                        inset: 0,
                                        backgroundImage: `url('${featured.thumbnail}')`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        opacity: 0.8
                                    }} />

                                    {/* Ambient Glows */}
                                    <div style={{
                                        position: "absolute",
                                        bottom: "-20%",
                                        right: "-10%",
                                        width: "60%",
                                        height: "60%",
                                        background: "radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%)",
                                        filter: "blur(60px)",
                                        zIndex: 2
                                    }} />

                                    <div style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: isMobile ?
                                            (isDark ? "linear-gradient(to top, #ffffff 0%, transparent 100%)" : "linear-gradient(to top, #1d4ed8 0%, transparent 100%)") :
                                            (isDark ? "linear-gradient(to right, #ffffff 0%, transparent 60%)" : "linear-gradient(to right, #1d4ed8 0%, transparent 60%)"),
                                        zIndex: 3
                                    }} />
                                </div>
                            </motion.div>
                        )
                        }

                        <div style={{
                            position: "relative",
                            zIndex: 100,
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                            alignItems: isMobile ? "stretch" : "center",
                            gap: isMobile ? "12px" : "16px",
                            width: "100%",
                            maxWidth: "1000px",
                            margin: isMobile ? "20px auto 40px" : "20px auto 60px",
                        }}>
                            {/* Search Glass Container */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 25 }}
                                style={{
                                    flex: 1,
                                    width: "100%",
                                    background: isDark ? "rgba(15, 23, 42, 0.45)" : "rgba(255, 255, 255, 0.65)",
                                    backdropFilter: "blur(30px) saturate(180%)",
                                    padding: "8px",
                                    borderRadius: "24px",
                                    border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)"}`,
                                    boxShadow: isDark ? "0 30px 60px -12px rgba(0,0,0,0.6)" : "0 30px 60px -12px rgba(0,0,0,0.1)",
                                    borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.8)"}`,
                                    display: "flex",
                                    alignItems: "center",
                                    position: "relative"
                                }}>
                                <Search size={22} style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", color: colors.accent, zIndex: 10, opacity: 0.6 }} />
                                <input
                                    type="text"
                                    placeholder="Qual será seu próximo passo?"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{
                                        width: "100%",
                                        height: "50px",
                                        padding: "0 20px 0 58px",
                                        background: "transparent",
                                        border: "none",
                                        borderRadius: "20px",
                                        fontSize: "16px",
                                        color: colors.text,
                                        outline: "none",
                                        fontWeight: 600,
                                    }}
                                />
                            </motion.div>

                            {/* Filters Glass Container */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 25 }}
                                style={{
                                    background: isDark ? "rgba(15, 23, 42, 0.45)" : "rgba(255, 255, 255, 0.65)",
                                    backdropFilter: "blur(30px) saturate(180%)",
                                    padding: "6px",
                                    borderRadius: "24px",
                                    border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)"}`,
                                    boxShadow: isDark ? "0 30px 60px -12px rgba(0,0,0,0.6)" : "0 30px 60px -12px rgba(0,0,0,0.1)",
                                    borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.8)"}`,
                                    display: "flex",
                                    gap: "4px",
                                    width: isMobile ? "100%" : "auto",
                                    maxWidth: isMobile ? "100%" : "auto"
                                }}>
                                <div
                                    onClick={(e) => { e.stopPropagation(); setActiveFilter("all"); }}
                                    style={{
                                        position: "relative",
                                        zIndex: 2,
                                        flex: 1,
                                        textAlign: "center",
                                        padding: "10px 24px",
                                        borderRadius: "18px",
                                        color: activeFilter === "all" ? "white" : colors.textMuted,
                                        fontSize: "13px",
                                        fontWeight: 800,
                                        cursor: "pointer",
                                        transition: "color 0.3s ease",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    {activeFilter === "all" && (
                                        <motion.div
                                            layoutId="active-pill-v2"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: colors.accent,
                                                borderRadius: "18px",
                                                zIndex: -1,
                                                boxShadow: `0 8px 20px ${colors.accent}40`
                                            }}
                                        />
                                    )}
                                    Todos
                                </div>
                                <div
                                    onClick={(e) => { e.stopPropagation(); setActiveFilter("started"); }}
                                    style={{
                                        position: "relative",
                                        zIndex: 2,
                                        flex: 1,
                                        textAlign: "center",
                                        padding: "10px 24px",
                                        borderRadius: "18px",
                                        color: activeFilter === "started" ? "white" : colors.textMuted,
                                        fontSize: "13px",
                                        fontWeight: 800,
                                        cursor: "pointer",
                                        transition: "color 0.3s ease",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    {activeFilter === "started" && (
                                        <motion.div
                                            layoutId="active-pill-v2"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: colors.accent,
                                                borderRadius: "18px",
                                                zIndex: -1,
                                                boxShadow: `0 8px 20px ${colors.accent}40`
                                            }}
                                        />
                                    )}
                                    Meus Cursos
                                </div>
                            </motion.div>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {filtered.length > 0 ? (
                                <motion.div
                                    layout
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))",
                                        gap: isMobile ? "24px" : "35px"
                                    }}
                                >
                                    {filtered.map((course, idx) => (
                                        <motion.div
                                            key={course.id}
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            transition={{
                                                duration: 0.4,
                                                delay: idx * 0.05,
                                                ease: [0.23, 1, 0.32, 1]
                                            }}
                                            onClick={() => router.push(`/courses/${course.id}`)}
                                            className="hover-scale"
                                            style={{ cursor: "pointer" }}
                                        >
                                            <CourseCard course={course} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        padding: "80px 20px",
                                        textAlign: "center",
                                        borderRadius: "32px",
                                        background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                                        border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                                        backdropFilter: "blur(20px)",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "20px",
                                        marginTop: "40px"
                                    }}
                                >
                                    <div style={{
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "24px",
                                        background: isDark ? "rgba(59, 130, 246, 0.1)" : "#eff6ff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: colors.accent,
                                        border: `1px solid ${isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)"}`,
                                        boxShadow: `0 20px 40px ${colors.accent}15`
                                    }}>
                                        <SearchX size={40} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: "24px", fontWeight: 900, color: colors.text, marginBottom: "8px", letterSpacing: "-1px" }}>Nada encontrado</h3>
                                        <p style={{ fontSize: "15px", color: colors.textMuted, maxWidth: "340px", margin: "0 auto", lineHeight: 1.6 }}>
                                            Não encontramos resultados para sua pesquisa. <br /> Tente pesquisar por outros termos.
                                        </p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSearch("")}
                                        style={{
                                            marginTop: "20px",
                                            padding: "16px 36px",
                                            borderRadius: "18px",
                                            background: colors.accent,
                                            color: "white",
                                            border: "none",
                                            fontWeight: 900,
                                            fontSize: "14px",
                                            textTransform: "uppercase",
                                            letterSpacing: "1px",
                                            cursor: "pointer",
                                            boxShadow: `0 15px 30px ${colors.accent}40`,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}
                                    >
                                        <RotateCcw size={16} />
                                        Limpar Filtros
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )
                }
            </header >

            <main style={{ padding: isMobile ? "0 20px 80px" : "0 clamp(20px, 5vw, 80px) 100px", flex: 1 }}>
                {/* Footer or extra content */}
            </main>
        </div >
    );
}
