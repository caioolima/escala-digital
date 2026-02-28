"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function CreatorLoading() {
    return (
        <div style={{ background: "var(--brand-bg)", minHeight: "100%", padding: "32px clamp(20px,5vw,60px) 100px" }}>
            <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
                <Skeleton width={140} height={12} borderRadius={999} />
                <Skeleton width={320} height={40} borderRadius={14} />
                <Skeleton width={520} height={16} borderRadius={10} />

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginTop: 8 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} height={92} borderRadius={20} />
                    ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 18, marginTop: 6 }}>
                    <Skeleton height={320} borderRadius={22} />
                    <Skeleton height={320} borderRadius={22} />
                </div>
            </div>
        </div>
    );
}

