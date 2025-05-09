'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingIndicator } from './LoadingIndicator';
import { sampleModels } from '../../data/sample-models';
import { Clock, Copy, Check } from 'lucide-react';
import { useTheme } from '../../contexts/themeContext';

interface ChatMessageProps {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    modelId?: string;
    isLoading?: boolean;
    loadingType?: 'text' | 'embedding' | 'audio';
    isFirstInGroup?: boolean;
    isLastInGroup?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
    id,
    text,
    sender,
    timestamp,
    modelId,
    isLoading = false,
    loadingType = 'text',
    isFirstInGroup = true,
    isLastInGroup = true
}) => {
    const { theme } = useTheme();
    const isUser = sender === 'user';
    const [copied, setCopied] = useState(false);

    const getModelColor = (modelId?: string): string => {
        if (!modelId) return '#888888';
        const model = sampleModels.find(m => m.id === modelId);
        return model?.color || '#888888';
    };

    const getModelName = (modelId?: string): string => {
        if (!modelId) return 'AI';
        const model = sampleModels.find(m => m.id === modelId);
        return model?.name || 'AI';
    };

    const getAssistantBubbleStyle = () => {
        switch (theme) {
            case 'midnight':
                return {
                    className: 'bg-gradient-to-br from-gray-900/80 to-gray-900/60 border-gray-800/30 text-gray-100',
                    style: {}
                };
            case 'dark':
                return {
                    className: 'bg-gradient-to-br from-gray-800/70 to-gray-800/40 border-gray-700/30 text-gray-100',
                    style: {}
                };
            case 'light':
            default:
                return {
                    className: 'bg-gradient-to-br from-white/70 to-white/40 border-gray-200/30 text-gray-900',
                    style: {}
                };
        }
    };

    const getUserMessageStyle = () => {
        switch (theme) {
            case 'midnight':
                return {
                    className: 'text-white',
                    style: {
                        background: `linear-gradient(135deg, var(--primary)70, var(--primary)90)`,
                        borderColor: 'var(--primary)'
                    }
                };
            case 'dark':
                return {
                    className: 'text-white',
                    style: {
                        background: `linear-gradient(135deg, var(--primary)70, var(--primary)90)`,
                        borderColor: 'var(--primary)'
                    }
                };
            case 'light':
            default:
                return {
                    className: 'text-gray-900',
                    style: {
                        background: `linear-gradient(135deg, var(--primary)30, var(--primary)50)`,
                        borderColor: 'var(--primary)',
                        color: '#000'
                    }
                };
        }
    };

    const handleCopyText = () => {
        if (text) {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <motion.div
                key={`loading-${id}`}
                className="flex justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="p-3 rounded-2xl"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--card-border)',
                        color: 'var(--foreground)',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                >
                    <LoadingIndicator
                        type={loadingType}
                        modelColor={modelId ? getModelColor(modelId) : undefined}
                    />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            key={id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <div className="max-w-[70%]">
                {isFirstInGroup && !isUser && modelId && (
                    <div className="flex items-center mb-1 gap-2 pl-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getModelColor(modelId) }}
                        />
                        <span className="text-xs opacity-70 font-medium" style={{ color: 'var(--foreground)' }}>
                            {getModelName(modelId)}
                        </span>
                    </div>
                )}

                <div className="group relative">
                    <div
                        className={`rounded-2xl px-4 py-2.5 shadow-lg backdrop-blur-md border
                        ${!isLastInGroup && isUser ? 'rounded-br-md' : ''}
                        ${!isLastInGroup && !isUser ? 'rounded-bl-md' : ''}
                        hover:shadow-xl transition-shadow duration-200
                        ${isUser ? getUserMessageStyle().className : getAssistantBubbleStyle().className}
                        `}
                        style={isUser ? getUserMessageStyle().style : getAssistantBubbleStyle().style}
                    >
                        <div className="whitespace-pre-wrap">{text}</div>
                    </div>

                    {/* Copy button that appears on hover */}
                    <AnimatePresence>
                        <motion.button
                            onClick={handleCopyText}
                            className={`absolute p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md 
                            ${isUser
                                    ? 'bg-white/90 hover:bg-white'
                                    : theme === 'light'
                                        ? 'bg-gray-100 hover:bg-white text-gray-700'
                                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            title="Copy message"
                            style={{
                                ...isUser ? { color: 'var(--primary)' } : {},
                                bottom: '-6px',
                                right: '-6px',
                                zIndex: 10,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
                            }}
                        >
                            {copied ? (
                                <Check className="w-3 h-3" />
                            ) : (
                                <Copy className="w-3 h-3" />
                            )}
                        </motion.button>
                    </AnimatePresence>
                </div>

                {isLastInGroup && (
                    <div className={`flex items-center mt-1 text-xs ${isUser ? 'justify-end pr-2' : 'pl-2'}`}
                        style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                        <Clock className="w-3 h-3 mr-1 opacity-70" />
                        <span>
                            {timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}; 