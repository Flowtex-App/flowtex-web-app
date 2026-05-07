import { useEffect, type ReactNode } from 'react';
import { applyTheme, useThemeStore } from './theme.store';

interface Props {
  children: ReactNode;
}

export function ThemeProvider({ children }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const fontScale = useThemeStore((s) => s.fontScale);

  useEffect(() => {
    applyTheme(theme, fontScale);
  }, [theme, fontScale]);

  return <>{children}</>;
}
