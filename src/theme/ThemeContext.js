import { createContext, useContext, useMemo } from 'react';

import { createStyles } from '../styles';

const ThemeContext = createContext(null);

export function ThemeProvider({ children, theme }) {
  const value = useMemo(
    () => ({
      theme,
      styles: createStyles(theme),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useAppTheme mora biti pozvan unutar ThemeProvider-a.');
  }

  return value;
}
