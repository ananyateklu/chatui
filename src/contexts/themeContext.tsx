'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type ThemeType = 'light' | 'dark' | 'midnight';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    toggleTheme: () => void;
    isDarkTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeType>('midnight');

    // Check if we're in a browser environment and use stored preference if available
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as ThemeType | null;
        if (storedTheme && ['light', 'dark', 'midnight'].includes(storedTheme)) {
            setTheme(storedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            setTheme('light');
        }
    }, []);

    // Store theme preference when it changes
    useEffect(() => {
        localStorage.setItem('theme', theme);

        // Apply theme class to document root for global CSS variables
        document.documentElement.classList.remove('light-theme', 'dark-theme', 'midnight-theme');
        document.documentElement.classList.add(`${theme}-theme`);
    }, [theme]);

    // Toggle between themes in sequence: light -> dark -> midnight -> light
    const toggleTheme = () => {
        setTheme(prevTheme => {
            if (prevTheme === 'light') return 'dark';
            if (prevTheme === 'dark') return 'midnight';
            return 'light';
        });
    };

    // Helper to determine if current theme is dark
    const isDarkTheme = theme === 'dark' || theme === 'midnight';

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDarkTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}; 