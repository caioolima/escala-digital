"use client";

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
    const baseStyle: React.CSSProperties = {
        width: width || "100%",
        height: height || "20px",
        borderRadius: borderRadius,
        backgroundImage:
            "linear-gradient(90deg, var(--skeleton-base) 25%, var(--skeleton-highlight) 50%, var(--skeleton-base) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.5s infinite linear",
        ...style
    };

    return (
        <div className={`skeleton ${className}`} style={baseStyle}>
            <style jsx>{`
                :global(:root) {
                    --skeleton-base: rgba(0, 0, 0, 0.04);
                    --skeleton-highlight: rgba(0, 0, 0, 0.08);
                }
                :global(html.dark), :global(body.dark), :global([data-theme="dark"]) {
                    --skeleton-base: rgba(255, 255, 255, 0.05);
                    --skeleton-highlight: rgba(255, 255, 255, 0.10);
                }
                @keyframes skeleton-shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}

export function SkeletonCircle({ size = 40, className = "", style }: { size?: number, className?: string, style?: React.CSSProperties }) {
    return <Skeleton width={size} height={size} borderRadius="50%" className={className} style={style} />;
}

export function SkeletonText({ lines = 3, gap = 8, className = "", style }: { lines?: number, gap?: number, className?: string, style?: React.CSSProperties }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: `${gap}px`, ...style }} className={className}>
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
