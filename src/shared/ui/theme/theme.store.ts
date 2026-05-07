import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeId = 'default' | 'dark' | 'high-contrast' | 'sepia';
export type FontScale = 'sm' | 'md' | 'lg' | 'xl';

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  description: string;
  swatch: { bg: string; ink: string; accent: string };
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Tonos neutros con acento Claro',
    swatch: { bg: '#F4F4F0', ink: '#111827', accent: '#DA291C' },
  },
  {
    id: 'dark',
    label: 'Oscuro',
    description: 'Para sesiones largas o pantallas brillantes',
    swatch: { bg: '#0E1318', ink: '#E6E8EC', accent: '#FF6A5C' },
  },
  {
    id: 'high-contrast',
    label: 'Alto contraste',
    description: 'Negro sobre blanco puro, accesibilidad maxima',
    swatch: { bg: '#FFFFFF', ink: '#000000', accent: '#B0150B' },
  },
  {
    id: 'sepia',
    label: 'Sepia',
    description: 'Bajo nivel de luz azul, lectura prolongada',
    swatch: { bg: '#F4ECD9', ink: '#3B2E1E', accent: '#A8160C' },
  },
];

export const FONT_SCALES: { id: FontScale; label: string; px: number }[] = [
  { id: 'sm', label: 'S',  px: 13 },
  { id: 'md', label: 'M',  px: 14 },
  { id: 'lg', label: 'L',  px: 15 },
  { id: 'xl', label: 'XL', px: 17 },
];

interface ThemeState {
  theme: ThemeId;
  fontScale: FontScale;
  setTheme: (id: ThemeId) => void;
  setFontScale: (id: FontScale) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'default',
      fontScale: 'md',
      setTheme: (id) => set({ theme: id }),
      setFontScale: (id) => set({ fontScale: id }),
    }),
    {
      name: 'flowtex.theme',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** Apply the current theme + font-scale as data attributes on <html>. */
export function applyTheme(theme: ThemeId, fontScale: FontScale) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-font-scale', fontScale);
}
