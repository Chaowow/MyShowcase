import placeholder from '../assets/placeholder.jpg';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function proxied(src) {
    if (!src) return placeholder;

    if (src.startsWith('/api/image?u=') || src.startsWith('/assets/')) return src;

    try {
        const url = new URL(src);
        const sameOrigin = url.origin === window.location.origin;
        if (sameOrigin) return src;
        return `${API_BASE}/api/image?u=${encodeURIComponent(src)}`;
    } catch {
        return src;
    }
};