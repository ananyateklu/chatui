'use client';

import React from 'react';
import { Bot, Hash, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/themeContext';

interface LoadingIndicatorProps {
    type?: 'text' | 'embedding' | 'audio';
    modelColor?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
    type = 'text',
    modelColor
}) => {
    const { theme } = useTheme();

    // Use the model color or fall back to the theme's primary color
    const themeColor = modelColor || 'var(--primary)';

    const renderLoadingContent = () => {
        switch (type) {
            case 'text':
                return (
                    <div className="space-y-2">
                        {/* Animated typing dots */}
                        <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4" style={{ color: themeColor }} />
                            <span className="text-sm font-medium">Generating response</span>
                            <motion.div
                                className="flex gap-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                            >
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: themeColor }}
                                    />
                                ))}
                            </motion.div>
                        </div>

                        {/* Animated placeholder lines */}
                        <div className={`space-y-2 p-3 rounded-2xl`}
                            style={{
                                backgroundColor: theme === 'light'
                                    ? 'rgba(240, 240, 240, 0.6)'
                                    : theme === 'dark'
                                        ? 'rgba(50, 50, 50, 0.6)'
                                        : 'rgba(30, 30, 30, 0.6)',
                                border: '1px solid var(--card-border)'
                            }}>
                            {[...Array(2)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="h-1.5 rounded"
                                    style={{
                                        backgroundColor: themeColor,
                                        opacity: 0.7
                                    }}
                                    initial={{ width: "0%" }}
                                    animate={{ width: ["0%", "100%", "100%", "0%"] }}
                                    transition={{
                                        duration: 2,
                                        times: [0, 0.4, 0.6, 1],
                                        repeat: Infinity,
                                        delay: i * 0.3
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                );

            case 'embedding':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4" style={{ color: themeColor }} />
                            <span className="text-sm font-medium">Processing data</span>
                        </div>

                        {/* Animated vector visualization */}
                        <motion.div
                            className={`h-12 flex items-end gap-px p-2 rounded-2xl`}
                            style={{
                                backgroundColor: theme === 'light'
                                    ? 'rgba(240, 240, 240, 0.6)'
                                    : theme === 'dark'
                                        ? 'rgba(50, 50, 50, 0.6)'
                                        : 'rgba(30, 30, 30, 0.6)',
                                border: '1px solid var(--card-border)'
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {[...Array(30)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="flex-1"
                                    style={{
                                        backgroundColor: themeColor,
                                        opacity: 0.7
                                    }}
                                    initial={{ height: "0%" }}
                                    animate={{
                                        height: ["0%", "100%", "50%", "80%", "20%"],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.04
                                    }}
                                />
                            ))}
                        </motion.div>
                    </div>
                );

            case 'audio':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Music className="w-4 h-4" style={{ color: themeColor }} />
                            <span className="text-sm font-medium">Generating audio</span>
                        </div>

                        {/* Animated waveform */}
                        <div className={`h-8 flex items-center gap-1 p-2 rounded-2xl`}
                            style={{
                                backgroundColor: theme === 'light'
                                    ? 'rgba(240, 240, 240, 0.6)'
                                    : theme === 'dark'
                                        ? 'rgba(50, 50, 50, 0.6)'
                                        : 'rgba(30, 30, 30, 0.6)',
                                border: '1px solid var(--card-border)'
                            }}>
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1 rounded-full"
                                    style={{
                                        backgroundColor: themeColor,
                                        opacity: 0.7
                                    }}
                                    initial={{ height: "20%" }}
                                    animate={{
                                        height: ["20%", "90%", "20%"]
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        delay: i * 0.05
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="py-1">
            {renderLoadingContent()}
        </div>
    );
}; 