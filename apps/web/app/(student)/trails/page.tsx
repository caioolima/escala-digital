"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Map, Play, BookOpen, Search } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useLanguage } from "@/contexts/language-context";
import { finishLoadingWithMinimumDelay, MIN_SKELETON_MS } from "@/lib/skeleton-timing";

interface Course {
    id: string;
    title: string;
    category?: string;
    thumbnail?: string;
}

interface Trail {
    id: string;
    title: string;
    description?: string;
    accent?: string;
    courses?: Array<{ course?: Course; courseId?: string }>; // backend shape
    courseIds?: string[]; // legacy localStorage shape
    cover?: string;
    progress?: number;
    totalCourses?: number;
    completedCourses?: number;
    isMember?: boolean;
}

interface ApiTrail {
    id: string;
    title: string;
    description?: string;
    cover?: string;
    courses?: Array<{ course?: { id: string }; courseId?: string }>;
    courseIds?: string[];
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
                <div
                    key={i}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        padding: 0
                    }}
                >
                    <Skeleton width="100%" height={200} borderRadius="20px" />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <Skeleton width={120} height={16} borderRadius={999} />
                        <Skeleton width={52} height={16} borderRadius={999} />
                    </div>
                    <Skeleton width="72%" height={24} borderRadius={12} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <Skeleton width="100%" height={14} borderRadius={10} />
                        <Skeleton width="86%" height={14} borderRadius={10} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
                        <Skeleton width={110} height={14} borderRadius={10} />
                        <Skeleton width={44} height={14} borderRadius={10} />
                    </div>
                    <Skeleton width="100%" height={8} borderRadius={999} />
                </div>
            ))}
        </div>
    );
}

function TrailsHeaderSkeleton({ isMobile }: { isMobile: boolean }) {
    return (
        <header style={{ padding: isMobile ? '24px 20px' : '40px clamp(20px,5vw,60px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Skeleton width={24} height={24} borderRadius={8} />
                <Skeleton width={140} height={12} borderRadius={999} />
            </div>
            <Skeleton width={isMobile ? "60%" : 380} height={44} borderRadius={14} />
            <Skeleton width={isMobile ? "90%" : 560} height={18} borderRadius={10} />
            <Skeleton width={isMobile ? "80%" : 520} height={18} borderRadius={10} />

            <div style={{
                position: "relative",
                zIndex: 100,
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "stretch" : "center",
                gap: isMobile ? "12px" : "16px",
                width: "100%",
                maxWidth: "1000px",
            }}>
                <Skeleton width="100%" height={64} borderRadius={24} />
                <div style={{ width: isMobile ? "100%" : 340, display: "flex", gap: 10 }}>
                    <Skeleton height={44} borderRadius={14} style={{ flex: 1 }} />
                    <Skeleton height={44} borderRadius={14} style={{ flex: 1 }} />
                </div>
            </div>
        </header>
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
    const [activeFilter, setActiveFilter] = useState<"all" | "mine">("all");
    const [search, setSearch] = useState("");
    const { t } = useLanguage();

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);

        const fetchData = async () => {
            const startedAt = Date.now();
            setIsLoading(true);
            try {
                // Try backend first
                const [trailsResp, coursesResp, trailEnrollmentsResp] = await Promise.all([
                    api.get('/trails'),
                    api.get('/courses?published=true'),
                    api.get('/trails/enrollments/me').catch(() => ({ data: [] })),
                ]);

                const fetchedTrails: ApiTrail[] = trailsResp.data || [];
                const fetchedCourses: Course[] = coursesResp.data || [];
                const enrolledTrailIds: string[] = (trailEnrollmentsResp.data || []).map((e: any) => e.trailId);

                // compute per-trail progress by aggregating course progress
                const computeTrail = async (t: ApiTrail): Promise<Trail> => {
                    const ids: string[] = (t.courses || []).map((tc) => tc.course?.id || tc.courseId).filter(Boolean) as string[];
                    const trailCourses = fetchedCourses.filter(c => ids.includes(c.id));

                    const percentages = await Promise.all(trailCourses.map(async (c) => {
                        try {
                            const r = await api.get(`/courses/${c.id}/progress`);
                            return r.data?.percentage ?? 0;
                        } catch {
                            return 0;
                        }
                    }));

                    const completedCount = percentages.filter(p => p === 100).length;
                    const progress = trailCourses.length > 0 ? Math.round((completedCount / trailCourses.length) * 100) : 0;

                    return {
                        id: t.id,
                        title: t.title,
                        description: t.description,
                        cover: trailCourses[0]?.thumbnail || t.cover || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
                        progress,
                        totalCourses: trailCourses.length,
                        completedCourses: completedCount,
                        isMember: enrolledTrailIds.includes(t.id),
                    } as Trail;
                };
                const mapped = await Promise.all(fetchedTrails.map((t: ApiTrail) => computeTrail(t)));
                setTrails(mapped);
            } catch {
                // fallback to localStorage for offline/dev experience
                try {
                    const storedTrails: Trail[] = JSON.parse(localStorage.getItem('creator_published_trails') || '[]');
                    const storedCourses: Course[] = JSON.parse(localStorage.getItem('creator_published_courses') || '[]');
                    const studentProgress: Record<string, number> = JSON.parse(localStorage.getItem('student_progress') || '{}');

                    const mapped = storedTrails.map(t => {
                        const trailCourses = storedCourses.filter(c => (t.courseIds || []).includes(c.id));
                        const completedCount = trailCourses.filter(c => (studentProgress[c.id] || 0) === 100).length;
                        const progress = trailCourses.length > 0 ? Math.round((completedCount / trailCourses.length) * 100) : 0;
                        const isMember = trailCourses.some(c => (studentProgress[c.id] || 0) > 0);
                        return { ...t, progress, totalCourses: trailCourses.length, completedCourses: completedCount, isMember };
                    });
                    setTrails(mapped);
                } catch (e) {
                    console.error('Failed to load trails fallback', e);
                }
            } finally {
                finishLoadingWithMinimumDelay(startedAt, () => setIsLoading(false), MIN_SKELETON_MS);
            }
        };

        fetchData();

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!mounted) {
        return (
            <div style={{ background: "var(--brand-bg)", minHeight: "100%", color: "var(--brand-text)" }}>
                <TrailsHeaderSkeleton isMobile={false} />
                <main style={{ padding: "0 clamp(20px,5vw,60px) 100px", flex: 1 }}>
                    <TrailsCatalogSkeleton isMobile={false} />
                </main>
            </div>
        );
    }

    const colors = {
        bg: 'var(--brand-bg)',
        cardBg: 'var(--brand-card)',
        text: 'var(--brand-text)',
        textMuted: 'var(--brand-text-muted)',
        border: 'var(--brand-border)',
        accent: 'var(--brand-accent)'
    };
    const searchedTrails = trails.filter((trail) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        const title = (trail.title || "").toLowerCase();
        const description = (trail.description || "").toLowerCase();
        return title.includes(q) || description.includes(q);
    });
    const filteredTrails = activeFilter === "mine" ? searchedTrails.filter((trail) => trail.isMember) : searchedTrails;

    return (
        <div style={{ background: colors.bg, minHeight: '100%', color: colors.text }}>
            <style>{`
                .trail-card { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease; }
                .trail-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
                .trail-card:hover .cover-overlay { opacity: 1 !important; }
            `}</style>

            {isLoading ? (
                <TrailsHeaderSkeleton isMobile={isMobile} />
            ) : (
            <header style={{ padding: isMobile ? '24px 20px' : '40px clamp(20px,5vw,60px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: colors.accent, marginBottom: '8px' }}>
                    <Map size={24} strokeWidth={2.5} />
                    <span style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{t("trails.journey")}</span>
                </div>
                <h1 style={{ fontSize: isMobile ? 28 : 42, fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1 }}>{t("trails.title")}</h1>
                <p style={{ fontSize: 16, color: colors.textMuted, maxWidth: 600, lineHeight: 1.6, fontWeight: 500 }}>{t("trails.subtitle")}</p>
                <div style={{
                    position: "relative",
                    zIndex: 100,
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "stretch" : "center",
                    gap: isMobile ? "12px" : "16px",
                    width: "100%",
                    maxWidth: "1000px",
                }}>
                <div style={{
                    position: "relative",
                    flex: 1,
                    width: "100%",
                    background: isDark ? "rgba(15, 23, 42, 0.45)" : "rgba(255, 255, 255, 0.65)",
                    backdropFilter: "blur(30px) saturate(180%)",
                    padding: "8px",
                    borderRadius: "24px",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)"}`,
                    boxShadow: isDark ? "0 20px 40px -12px rgba(0,0,0,0.45)" : "0 20px 40px -12px rgba(0,0,0,0.08)",
                }}>
                    <Search size={20} style={{ position: "absolute", left: "24px", top: "50%", transform: "translateY(-50%)", color: colors.accent, opacity: 0.7 }} />
                    <input
                        type="text"
                        placeholder="Buscar trilhas por nome ou descrição..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: "100%",
                            height: "48px",
                            padding: "0 16px 0 50px",
                            background: "transparent",
                            border: "none",
                            borderRadius: "20px",
                            fontSize: "15px",
                            color: colors.text,
                            outline: "none",
                            fontWeight: 600,
                        }}
                    />
                </div>
                <div style={{
                    background: isDark ? "rgba(15, 23, 42, 0.45)" : "rgba(255, 255, 255, 0.65)",
                    backdropFilter: "blur(30px) saturate(180%)",
                    padding: "6px",
                    borderRadius: "18px",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)"}`,
                    boxShadow: isDark ? "0 20px 40px -12px rgba(0,0,0,0.45)" : "0 20px 40px -12px rgba(0,0,0,0.08)",
                    display: "flex",
                    gap: "4px",
                    width: isMobile ? "100%" : "auto",
                    maxWidth: isMobile ? "100%" : "auto",
                }}>
                    <div
                        onClick={() => setActiveFilter("all")}
                        style={{
                            position: "relative",
                            zIndex: 2,
                            textAlign: "center",
                            flex: isMobile ? 1 : undefined,
                            padding: "10px 20px",
                            borderRadius: "14px",
                            color: activeFilter === "all" ? "white" : colors.textMuted,
                            fontSize: "13px",
                            fontWeight: 800,
                            cursor: "pointer",
                            transition: "color 0.3s ease",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {activeFilter === "all" && (
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                background: colors.accent,
                                borderRadius: "14px",
                                zIndex: -1,
                                boxShadow: `0 8px 20px ${colors.accent}40`,
                            }} />
                        )}
                        Todas
                    </div>
                    <div
                        onClick={() => setActiveFilter("mine")}
                        style={{
                            position: "relative",
                            zIndex: 2,
                            textAlign: "center",
                            flex: isMobile ? 1 : undefined,
                            padding: "10px 20px",
                            borderRadius: "14px",
                            color: activeFilter === "mine" ? "white" : colors.textMuted,
                            fontSize: "13px",
                            fontWeight: 800,
                            cursor: "pointer",
                            transition: "color 0.3s ease",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {activeFilter === "mine" && (
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                background: colors.accent,
                                borderRadius: "14px",
                                zIndex: -1,
                                boxShadow: `0 8px 20px ${colors.accent}40`,
                            }} />
                        )}
                        Minhas trilhas
                    </div>
                </div>
                </div>
            </header>
            )}

            <main style={{ padding: isMobile ? '0 20px 80px' : '0 clamp(20px,5vw,60px) 100px', flex: 1 }}>
                {isLoading ? (
                    <TrailsCatalogSkeleton isMobile={isMobile} />
                ) : filteredTrails.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center', border: `2px dashed ${colors.border}`, borderRadius: 24, background: colors.cardBg, marginTop: 20 }}>
                        <Map size={48} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
                        <h3 style={{ fontSize: 20, fontWeight: 900, color: colors.text, marginBottom: 10 }}>
                            {activeFilter === "mine" ? "Você ainda não participa de nenhuma trilha." : t("trails.emptyTitle")}
                        </h3>
                        <p style={{ fontSize: 14, color: colors.textMuted, maxWidth: 360, margin: '0 auto 30px', lineHeight: 1.6 }}>
                            {activeFilter === "mine" ? "Entre em uma trilha para começar sua jornada de aprendizado." : t("trails.emptyDesc")}
                        </p>
                        <button
                            onClick={() => activeFilter === "mine" ? setActiveFilter("all") : router.push('/catalog')}
                            style={{ padding: '12px 24px', borderRadius: 12, background: colors.accent, color: 'white', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
                        >
                            {activeFilter === "mine" ? "Ver todas as trilhas" : t("trails.exploreCatalog")}
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px,1fr))', gap: 35, marginTop: 20 }}>
                        {filteredTrails.map((trail) => (
                            <div key={trail.id} className="trail-card" onClick={() => router.push(`/trails/${trail.id}`)} style={{ background: colors.cardBg, borderRadius: 24, overflow: 'hidden', border: `1px solid ${colors.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                                    <Image src={trail.cover || ''} alt={trail.title || 'trail cover'} style={{ objectFit: 'cover' }} fill sizes="(max-width: 768px) 100vw, 33vw" />
                                    <div className="cover-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s ease' }}>
                                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                            <Play size={28} fill="currentColor" style={{ marginLeft: 4 }} />
                                        </div>
                                    </div>
                                    <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <BookOpen size={14} /> {t("trails.coursesCount", { count: trail.totalCourses ?? 0 })}
                                    </div>
                                </div>
                                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <h3 style={{ fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 8, lineHeight: 1.3 }}>{trail.title}</h3>
                                    {(() => {
                                        const clampStyles: React.CSSProperties & { WebkitLineClamp?: number; WebkitBoxOrient?: string } = {
                                            fontSize: 14,
                                            color: colors.textMuted,
                                            lineHeight: '1.6',
                                            marginBottom: 24,
                                            flex: 1,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        };
                                        return <p style={clampStyles}>{trail.description}</p>;
                                    })()}
                                    <div style={{ marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, fontWeight: 800 }}>
                                            <span style={{ color: colors.textMuted }}>{t("trails.progress")}</span>
                                            <span style={{ color: colors.accent }}>{trail.progress ?? 0}%</span>
                                        </div>
                                        <div style={{ height: 6, width: '100%', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', borderRadius: 10, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${trail.progress ?? 0}%`, background: colors.accent, borderRadius: 10, transition: 'width 1s ease' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

