const raw = import.meta.env.VITE_API_BASE;
export const API_BASE = (typeof raw === 'string' ? raw.replace(/\/$/, '') : '') || 'http://127.0.0.1:8000';
