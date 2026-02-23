"use client";

import { Play, Clock, Star, Users, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
            borderRadius: "20px",
            border: "1px solid var(--brand-border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            height: "100%"
        }}>
            <Skeleton height={180} borderRadius="0" />
            <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Skeleton width={80} height={14} />
                    <Skeleton width={4} height={4} borderRadius="50%" />
                    <Skeleton width={40} height={14} />
                </div>
                <Skeleton width="90%" height={20} />
                <Skeleton width="100%" height={40} />
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

    const levelLabel = {
        beginner: "Iniciante",
        intermediate: "Intermediário",
        advanced: "Avançado",
    };

    const colors = {
        cardBg: "var(--brand-card)",
        text: "var(--brand-text)",
        textMuted: "var(--brand-text-muted)",
        accent: "var(--brand-accent)",
        border: "var(--brand-border)",
        hoverBorder: isDark ? "rgba(59, 130, 246, 0.4)" : "rgba(37, 99, 235, 0.2)",
    };

    return (
        <div
            style={{
                background: colors.cardBg,
                borderRadius: "20px",
                border: `1px solid ${isHovered ? colors.hoverBorder : colors.border}`,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                transform: isHovered ? "translateY(-8px)" : "translateY(0)",
                boxShadow: isHovered ? (isDark ? "0 30px 60px rgba(0,0,0,0.5)" : "0 20px 40px rgba(0,0,0,0.08)") : "none",
                height: "100%"
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Thumbnail */}
            <div style={{
                width: "100%",
                aspectRatio: "16/9",
                backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                backgroundImage: course.thumbnail?.startsWith('url') ? course.thumbnail : (course.thumbnail ? `url('${course.thumbnail}')` : 'none'),
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: isHovered ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)",
                    transition: "background 0.3s ease",
                }} />

                <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? "scale(1)" : "scale(0.8)",
                    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    zIndex: 2
                }}>
                    <div style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.95)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#0f172a",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                        backdropFilter: "blur(4px)"
                    }}>
                        <Play size={24} fill="currentColor" style={{ marginLeft: "4px" }} />
                    </div>
                </div>

                <div style={{ position: "absolute", top: "16px", left: "16px", zIndex: 3 }}>
                    <span style={{
                        fontSize: "11px",
                        fontWeight: 900,
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        backdropFilter: "blur(12px)",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        border: "1px solid rgba(255,255,255,0.1)"
                    }}>
                        {levelLabel[course.level || "beginner"]}
                    </span>
                </div>
            </div>

            <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: colors.accent, textTransform: "uppercase", letterSpacing: "1px" }}>
                        {course.category}
                    </span>
                    <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: colors.textMuted }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMuted }}>
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: "13px", fontWeight: 800, color: colors.text }}>{course.rating.toFixed(1)}</span>
                    </div>
                </div>

                <h3 style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: colors.text,
                    marginBottom: "10px",
                    lineHeight: 1.3,
                    letterSpacing: "-0.5px"
                }}>
                    {course.title}
                </h3>

                <p style={{
                    fontSize: "14px",
                    color: colors.textMuted,
                    lineHeight: 1.6,
                    marginBottom: "24px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    flex: 1,
                    fontWeight: 500
                }}>
                    {course.description}
                </p>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "20px",
                    borderTop: `1px solid ${colors.border}`
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMuted }}>
                            <Clock size={14} />
                            <span style={{ fontSize: "12px", fontWeight: 700 }}>{Math.floor(course.durationMins / 60)}h {course.durationMins % 60}m</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMuted }}>
                            <Users size={14} />
                            <span style={{ fontSize: "12px", fontWeight: 700 }}>{course.studentsCount}</span>
                        </div>
                    </div>

                    <div style={{
                        color: isHovered ? colors.accent : colors.textMuted,
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        transform: isHovered ? "translateX(4px)" : "translateX(0)"
                    }}>
                        <ArrowRight size={20} strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </div>
    );
}
