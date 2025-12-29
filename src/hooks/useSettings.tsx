import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SettingsContextType {
  showDayOfWeek: boolean;
  setShowDayOfWeek: (value: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (value: 'light' | 'dark') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showDayOfWeek, setShowDayOfWeek] = useState(() => {
    const saved = localStorage.getItem('showDayOfWeek');
    return saved ? JSON.parse(saved) : true;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('showDayOfWeek', JSON.stringify(showDayOfWeek));
  }, [showDayOfWeek]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <SettingsContext.Provider value={{ showDayOfWeek, setShowDayOfWeek, theme, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
