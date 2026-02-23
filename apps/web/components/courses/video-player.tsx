"use client";

import { useEffect, useState } from "react";
import { Play, Maximize2, Volume2, Settings, Loader2 } from "lucide-react";

interface VideoPlayerProps {
    url: string;
    title?: string;
    onComplete?: () => void;
    aspectRatio?: string;
    borderRadius?: string;
}

export function VideoPlayer({ url, title, onComplete, aspectRatio = "16/9", borderRadius = "24px" }: VideoPlayerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [videoId, setVideoId] = useState<string | null>(null);
    const [platform, setPlatform] = useState<"youtube" | "vimeo" | "direct">("youtube");

    useEffect(() => {
        setIsLoading(true);
        // Extract ID from YouTube
        const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
        if (ytMatch && ytMatch[1]) {
            setVideoId(ytMatch[1].split('&')[0] as string);
            setPlatform("youtube");
            return;
        }

        // Extract ID from Vimeo
        const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com)\/(.+)/);
        if (vimeoMatch && vimeoMatch[1]) {
            setVideoId(vimeoMatch[1]);
            setPlatform("vimeo");
            return;
        }

        setVideoId(url);
        setPlatform("direct");
    }, [url]);

    const handleLoad = () => {
        setIsLoading(false);
    };

    return (
        <div style={{
            width: "100%",
            aspectRatio: aspectRatio,
            background: "#000",
            borderRadius: borderRadius,
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 40px 100px -20px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)"
        }}>
            {isLoading && (
                <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#020617",
                    zIndex: 10
                }}>
                    <Loader2 size={48} className="animate-spin text-blue-500" opacity={0.5} />
                </div>
            )}

            {platform === "youtube" && videoId && (
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`}
                    title={title || "Video Player"}
                    onLoad={handleLoad}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                        zIndex: 1
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            )}

            {platform === "vimeo" && videoId && (
                <iframe
                    src={`https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
                    title={title || "Video Player"}
                    onLoad={handleLoad}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                        zIndex: 1
                    }}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                />
            )}

            {platform === "direct" && (
                <video
                    src={url}
                    controls
                    onCanPlay={handleLoad}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                    }}
                />
            )}

            <style jsx>{`
                iframe {
                    /* Custom styles to hide parts of YT/Vimeo players if possible via API or CSS overlaps */
                }
            `}</style>
        </div>
    );
}
