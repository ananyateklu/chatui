'use client';

import React from 'react';
import { useTheme } from '../contexts/themeContext';
import { Sun, Moon, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    const getIcon = () => {
        switch (theme) {
            case 'light':
                return <Sun size={18} />;
            case 'dark':
                return <Moon size={18} />;
            case 'midnight':
                return <Palette size={18} />;
            default:
                return <Sun size={18} />;
        }
    };

    const getLabel = () => {
        switch (theme) {
            case 'light':
                return 'Light';
            case 'dark':
                return 'Dark';
            case 'midnight':
                return 'Midnight';
            default:
                return 'Theme';
        }
    };

    const getNextTheme = () => {
        switch (theme) {
            case 'light':
                return 'dark';
            case 'dark':
                return 'midnight';
            case 'midnight':
                return 'light';
            default:
                return 'light';
        }
    };

    // Get theme-specific styles
    const getThemeStyles = () => {
        switch (theme) {
            case 'light':
                return {
                    bg: 'rgba(0, 0, 0, 0.05)',
                    text: '#1a1a1a',
                    hover: 'rgba(0, 0, 0, 0.08)'
                };
            case 'dark':
                return {
                    bg: 'rgba(255, 255, 255, 0.1)',
                    text: '#f1f1f1',
                    hover: 'rgba(255, 255, 255, 0.15)'
                };
            case 'midnight':
                return {
                    bg: 'rgba(79, 70, 229, 0.15)',
                    text: '#f1f1f1',
                    hover: 'rgba(79, 70, 229, 0.25)'
                };
            default:
                return {
                    bg: 'rgba(0, 0, 0, 0.05)',
                    text: '#1a1a1a',
                    hover: 'rgba(0, 0, 0, 0.08)'
                };
        }
    };

    const styles = getThemeStyles();

    return (
        <motion.button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors duration-200"
            style={{
                backgroundColor: styles.bg,
                color: styles.text
            }}
            whileHover={{
                scale: 1.05,
                backgroundColor: styles.hover
            }}
            whileTap={{ scale: 0.95 }}
            title={`Switch to ${getNextTheme()} theme`}
        >
            {getIcon()}
            <span className="text-sm">{getLabel()}</span>
        </motion.button>
    );
}; 