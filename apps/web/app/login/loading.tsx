"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
    return (
        <div style={{ minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "var(--brand-bg)" }}>
            <div style={{ width: "100%", maxWidth: 520, borderRadius: "22px", border: "1px solid var(--brand-border)", background: "var(--brand-card)", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <Skeleton width={120} height={12} borderRadius={999} />
                    <Skeleton width="70%" height={34} borderRadius={14} />
                    <Skeleton width="55%" height={16} borderRadius={10} />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <Skeleton height={44} borderRadius={14} style={{ flex: 1 }} />
                    <Skeleton height={44} borderRadius={14} style={{ flex: 1 }} />
                </div>
                <Skeleton height={52} borderRadius={16} />
                <Skeleton height={52} borderRadius={16} />
                <Skeleton height={56} borderRadius={16} />
            </div>
        </div>
    );
}

