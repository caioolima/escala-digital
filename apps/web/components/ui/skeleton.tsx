"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
    style?: React.CSSProperties;
}

export function Skeleton({
    width,
    height,
    borderRadius = "8px",
    className = "",
    style
}: SkeletonProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && resolvedTheme === "dark";

    const baseStyle: React.CSSProperties = {
        width: width || "100%",
        height: height || "20px",
        borderRadius: borderRadius,
        backgroundImage: isDark
            ? "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)"
            : "linear-gradient(90deg, rgba(0,0,0,0.03) 25%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.03) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.5s infinite linear",
        ...style
    };

    return (
        <div className={`skeleton ${className}`} style={baseStyle}>
            <style jsx>{`
                @keyframes skeleton-shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}

export function SkeletonCircle({ size = 40, className = "" }: { size?: number, className?: string }) {
    return <Skeleton width={size} height={size} borderRadius="50%" className={className} />;
}

export function SkeletonText({ lines = 3, gap = 8, className = "" }: { lines?: number, gap?: number, className?: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: `${gap}px` }} className={className}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    width={i === lines - 1 && lines > 1 ? "60%" : "100%"}
                    height="14px"
                />
            ))}
        </div>
    );
}
