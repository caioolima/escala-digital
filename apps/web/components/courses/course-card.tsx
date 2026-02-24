"use client";

import { Play, Clock, Star, Users, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const isMobile = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    level?: "beginner" | "intermediate" | "advanced";
    durationMins: number;
    lessonsCount: number;
    studentsCount: number;
    rating: number;
    category: string;
}

export function CourseCardSkeleton() {
    return (
        <div style={{
            background: "var(--brand-card)",
            borderRadius: "24px",
            border: "1px solid var(--brand-border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            height: "100%"
        }}>
            <Skeleton height={200} borderRadius="0" />
            <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Skeleton width={80} height={14} />
                    <Skeleton width={4} height={4} borderRadius="50%" />
                    <Skeleton width={40} height={14} />
                </div>
                <Skeleton width="90%" height={24} />
                <Skeleton width="100%" height={60} />
                <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid var(--brand-border)", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <Skeleton width={50} height={12} />
                        <Skeleton width={50} height={12} />
                    </div>
                    <Skeleton width={20} height={20} />
                </div>
            </div>
        </div>
    );
}

export function CourseCard({ course }: { course: Course }) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const [isHovered, setIsHovered] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [progress, setProgress] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);

    // Mouse position for holographic effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth springs for rotation
    const rotateX = useSpring(useTransform(mouseY, [-100, 100], [10, -10]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-10, 10]), { stiffness: 300, damping: 30 });

    useEffect(() => {
        try {
            const studentProgress = JSON.parse(localStorage.getItem("student_progress") || "{}");
            const courseProgress = studentProgress?.[course.id];
            if (courseProgress > 0) {
                setIsStarted(true);
                setProgress(courseProgress);
            }
        } catch (e) { }
    }, [course.id]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        mouseX.set(0);
        mouseY.set(0);
    };

    const colors = {
        cardBg: isDark ? "rgba(15, 23, 42, 0.4)" : "rgba(255, 255, 255, 0.8)",
        text: "var(--brand-text)",
        textMuted: "var(--brand-text-muted)",
        accent: "var(--brand-accent)",
        border: "var(--brand-border)",
    };

    const levelLabel = {
        beginner: "Iniciante",
        intermediate: "Intermediário",
        advanced: "Avançado",
    };

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
                height: "100%"
            }}
        >
            <motion.div
                style={{
                    background: isDark ? "rgba(15, 23, 42, 0.75)" : "rgba(255, 255, 255, 0.95)",
                    borderRadius: "32px",
                    border: `1px solid ${isHovered ? "rgba(59, 130, 246, 0.5)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)")}`,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    backdropFilter: "blur(32px) saturate(180%)",
                    WebkitBackdropFilter: "blur(32px) saturate(180%)",
                    height: "100%",
                    position: "relative",
                    rotateX: isMobile ? 0 : rotateX,
                    rotateY: isMobile ? 0 : rotateY,
                    boxShadow: isHovered
                        ? (isDark ? "0 40px 100px -20px rgba(0,0,0,0.8), 0 0 50px -10px rgba(59, 130, 246, 0.3)" : "0 30px 60px -12px rgba(0,0,0,0.15)")
                        : (isDark ? "0 10px 40px -20px rgba(0,0,0,0.5)" : "0 10px 20px -10px rgba(0,0,0,0.05)"),
                    transition: "all 0.5s cubic-bezier(0.23, 1, 0.32, 1)"
                }}
                animate={{
                    y: isHovered ? -15 : 0,
                    scale: isHovered ? 1.03 : 1
                }}
            >
                {/* Inner Glow / Border Highlight */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "32px",
                    padding: "1px",
                    background: isHovered
                        ? `linear-gradient(135deg, rgba(59, 130, 246, 0.5), transparent, rgba(59, 130, 246, 0.3))`
                        : "transparent",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMaskComposite: "destination-out",
                    pointerEvents: "none",
                    zIndex: 10
                }} />

                {/* Holographic Glow Effect */}
                <motion.div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: `radial-gradient(circle at ${mouseX.get() + 200}px ${mouseY.get() + 200}px, rgba(59, 130, 246, 0.2) 0%, transparent 70%)`,
                        opacity: isHovered ? 1 : 0,
                        zIndex: 0,
                        pointerEvents: "none"
                    }}
                />

                {/* Thumbnail Container */}
                <div style={{
                    width: "100%",
                    aspectRatio: "16/11",
                    backgroundImage: course.thumbnail?.startsWith('url') ? course.thumbnail : (course.thumbnail ? `url('${course.thumbnail}')` : 'none'),
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                    overflow: "hidden",
                    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`
                }}>
                    <motion.div
                        animate={{ scale: isHovered ? 1.15 : 1 }}
                        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(to bottom, transparent 40%, rgba(15, 23, 42, 0.8) 100%)",
                            zIndex: 1
                        }}
                    />

                    {/* Play Button Overlay */}
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2
                    }}>
                        <motion.div
                            animate={{
                                opacity: isHovered ? 1 : 0,
                                scale: isHovered ? 1 : 0.5,
                                rotate: isHovered ? 0 : -15
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            style={{
                                width: "70px",
                                height: "70px",
                                borderRadius: "50%",
                                background: "rgba(59, 130, 246, 0.6)",
                                backdropFilter: "blur(16px)",
                                border: "1px solid rgba(255,255,255,0.4)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.5)"
                            }}
                        >
                            <Play size={30} fill="currentColor" style={{ marginLeft: "4px" }} />
                        </motion.div>
                    </div>

                    {/* Level Badge */}
                    <div style={{ position: "absolute", top: "20px", left: "20px", zIndex: 3 }}>
                        <span style={{
                            fontSize: "11px",
                            fontWeight: 900,
                            background: "rgba(15, 23, 42, 0.75)",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "100px",
                            backdropFilter: "blur(12px)",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                        }}>
                            <div style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: course.level === "advanced" ? "#ff4d4d" : "#00f2fe",
                                boxShadow: `0 0 10px ${course.level === "advanced" ? "#ff4d4d" : "#00f2fe"}`
                            }} />
                            {levelLabel[course.level || "beginner"]}
                        </span>
                    </div>
                </div>

                <div style={{ padding: "28px", flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
                    {/* Category & Rating Row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                        <span style={{
                            fontSize: "11px",
                            fontWeight: 900,
                            color: "white",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            background: `linear-gradient(135deg, ${colors.accent}, #7c3aed)`,
                            padding: "6px 14px",
                            borderRadius: "8px",
                            boxShadow: `0 8px 16px ${colors.accent}30`
                        }}>
                            {course.category}
                        </span>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                            padding: "6px 12px",
                            borderRadius: "100px",
                            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`
                        }}>
                            <Star size={14} fill="#f59e0b" color="#f59e0b" />
                            <span style={{ fontSize: "14px", fontWeight: 950, color: colors.text }}>{course.rating.toFixed(1)}</span>
                        </div>
                    </div>

                    {/* Title - HEAVY IMPACT */}
                    <h3 style={{
                        fontSize: "24px",
                        fontWeight: 950,
                        color: colors.text,
                        marginBottom: "14px",
                        lineHeight: 1.1,
                        letterSpacing: "-1.2px",
                        textShadow: isDark ? "0 2px 10px rgba(0,0,0,0.3)" : "none"
                    }}>
                        {course.title}
                    </h3>

                    {/* Description */}
                    <p style={{
                        fontSize: "15px",
                        color: colors.textMuted,
                        lineHeight: 1.6,
                        marginBottom: "28px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        fontWeight: 500,
                        opacity: 0.8
                    }}>
                        {course.description}
                    </p>

                    {/* Progress or Quick Learn */}
                    <div style={{ marginTop: "auto" }}>
                        {isStarted ? (
                            <div style={{ marginBottom: "24px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <span style={{ fontSize: "13px", fontWeight: 800, color: colors.textMuted }}>Sua jornada</span>
                                    <span style={{ fontSize: "13px", fontWeight: 950, color: colors.accent }}>{progress}%</span>
                                </div>
                                <div style={{
                                    height: "10px",
                                    width: "100%",
                                    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                                    borderRadius: "100px",
                                    overflow: "hidden",
                                    border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"}`,
                                    padding: "2px"
                                }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1.2, ease: "circOut" }}
                                        style={{
                                            height: "100%",
                                            background: `linear-gradient(90deg, ${colors.accent}, #9333ea)`,
                                            boxShadow: `0 0 15px ${colors.accent}60`,
                                            borderRadius: "100px"
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                marginBottom: "24px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "12px 16px",
                                background: isDark ? "rgba(59, 130, 246, 0.05)" : "rgba(59, 130, 246, 0.03)",
                                borderRadius: "14px",
                                border: `1px solid ${isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)"}`
                            }}>
                                <TrendingUp size={16} color={colors.accent} strokeWidth={2.5} />
                                <span style={{ fontSize: "12px", fontWeight: 800, color: colors.text, opacity: 0.9 }}>
                                    Recomendado para o seu perfil
                                </span>
                            </div>
                        )}

                        {/* Footer Stats Row */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingTop: "24px",
                            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMuted }}>
                                    <Clock size={15} strokeWidth={2.5} />
                                    <span style={{ fontSize: "13px", fontWeight: 900 }}>{Math.floor(course.durationMins / 60)}h</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMuted }}>
                                    <Users size={15} strokeWidth={2.5} />
                                    <span style={{ fontSize: "13px", fontWeight: 900 }}>{course.studentsCount}</span>
                                </div>
                            </div>

                            <motion.div
                                animate={{ x: isHovered ? 5 : 0 }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    color: colors.accent,
                                    fontSize: "14px",
                                    fontWeight: 950,
                                    letterSpacing: "-0.5px"
                                }}
                            >
                                {isStarted ? "Visualizar" : "Explorar"}
                                <ArrowRight size={18} strokeWidth={3.5} />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}


