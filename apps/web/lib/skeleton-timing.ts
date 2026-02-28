export const MIN_SKELETON_MS = 450;

export function finishLoadingWithMinimumDelay(
    startedAtMs: number,
    done: () => void,
    minMs: number = MIN_SKELETON_MS
) {
    const elapsed = Date.now() - startedAtMs;
    const remaining = Math.max(0, minMs - elapsed);
    return setTimeout(done, remaining);
}

