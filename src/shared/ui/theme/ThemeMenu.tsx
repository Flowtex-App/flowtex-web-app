import { useEffect, useRef, useState } from 'react';
import { Palette, Type, Check } from 'lucide-react';
import { useThemeStore, THEMES, FONT_SCALES, type ThemeId, type FontScale } from './theme.store';

export function ThemeMenu() {
  const { theme, fontScale, setTheme, setFontScale } = useThemeStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const themeMeta = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 rounded text-[12px] hover:bg-cream transition-colors"
        title={`Tema: ${themeMeta.label} · Letra: ${fontScale.toUpperCase()}`}
      >
        <span
          className="size-4 rounded border border-line-strong"
          style={{ background: themeMeta.swatch.accent }}
        />
        <Palette size={13} className="text-muted" />
        <span className="hidden md:inline font-mono text-[10px] uppercase tracking-widest text-muted">
          {fontScale}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+6px)] w-72 z-40 ftx-card overflow-hidden bg-paper"
          role="menu"
        >
          <div className="px-3 py-2 border-b border-line bg-cream">
            <div className="flex items-center gap-1.5 text-ink">
              <Palette size={12} />
              <span className="font-mono text-[10px] uppercase tracking-widest">
                Tema visual
              </span>
            </div>
          </div>

          <div className="px-2 py-2 grid grid-cols-2 gap-1.5">
            {THEMES.map((t) => {
              const active = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as ThemeId)}
                  className={[
                    'flex flex-col items-start gap-1 px-2 py-2 rounded border transition-colors text-left',
                    active
                      ? 'border-brand bg-brand-tint'
                      : 'border-line bg-paper hover:border-steel hover:bg-cream',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-1 w-full">
                    <span
                      className="size-3 rounded border border-line-strong"
                      style={{ background: t.swatch.bg }}
                    />
                    <span
                      className="size-3 rounded border border-line-strong"
                      style={{ background: t.swatch.ink }}
                    />
                    <span
                      className="size-3 rounded border border-line-strong"
                      style={{ background: t.swatch.accent }}
                    />
                    {active && <Check size={11} className="ml-auto text-brand" />}
                  </div>
                  <div className="text-[12px] font-medium text-ink leading-tight">
                    {t.label}
                  </div>
                  <div className="text-[10px] text-muted leading-tight">
                    {t.description}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-3 py-2 border-t border-line bg-cream">
            <div className="flex items-center gap-1.5 text-ink mb-1.5">
              <Type size={12} />
              <span className="font-mono text-[10px] uppercase tracking-widest">
                Tamaño de letra
              </span>
            </div>
            <div className="ftx-width-pill w-full">
              {FONT_SCALES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontScale(f.id as FontScale)}
                  className={['flex-1 !text-xs', fontScale === f.id ? 'is-active' : ''].join(' ')}
                  title={`${f.px}px`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 py-2 text-[10px] text-muted leading-snug border-t border-line">
            La preferencia se guarda en este navegador.
          </div>
        </div>
      )}
    </div>
  );
}
