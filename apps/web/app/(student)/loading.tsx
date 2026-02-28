"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function StudentLoading() {
    return (
        <div style={{ background: "var(--brand-bg)", minHeight: "100%", padding: "32px clamp(20px,5vw,60px) 100px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
                <Skeleton width={160} height={12} borderRadius={999} />
                <Skeleton width={360} height={40} borderRadius={14} />
                <Skeleton width={560} height={16} borderRadius={10} />

                <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                    <Skeleton height={52} borderRadius={18} style={{ flex: 1 }} />
                    <Skeleton width={220} height={52} borderRadius={18} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18, marginTop: 10 }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <Skeleton height={200} borderRadius={20} />
                            <Skeleton width="70%" height={18} borderRadius={12} />
                            <Skeleton width="92%" height={14} borderRadius={10} />
                            <Skeleton width="78%" height={14} borderRadius={10} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

