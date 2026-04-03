import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  accentColor: string;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const accentColors = [
  { name: 'Electric Blue', value: '#00d4ff', key: 'accent.electric_blue' },
  { name: 'Neon Green', value: '#39ff6e', key: 'accent.neon_green' },
  { name: 'Royal Gold', value: '#ffd700', key: 'accent.royal_gold' },
  { name: 'Vibrant Rose', value: '#ff4d7d', key: 'accent.vibrant_rose' },
  { name: 'Deep Violet', value: '#8b5cf6', key: 'accent.deep_violet' },
  { name: 'Sunset Orange', value: '#f59e0b', key: 'accent.sunset_orange' },
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('rsd-theme');
    return (saved as Theme) || 'dark';
  });

  const [accentColor, setAccentColorState] = useState(() => {
    const saved = localStorage.getItem('rsd-accent');
    return saved || '#00d4ff';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('rsd-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--accent', accentColor);
    localStorage.setItem('rsd-accent', accentColor);
    
    // Also update secondary accent colors based on the primary one
    // For simplicity, we'll just set a slightly darker version or use the same for now
    root.style.setProperty('--accent-muted', `${accentColor}33`); // 20% opacity
  }, [accentColor]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const setAccentColor = (color: string) => setAccentColorState(color);
  const toggleTheme = () => setThemeState(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccentColor, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
