'use client';

import React, { useState } from 'react';
import { AIModel } from '../../types/ai';
import { useTheme } from '../../contexts/themeContext';
import { ChevronDown, Paperclip, Search, Brain, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompactModelSelector } from './CompactModelSelector';

interface UnifiedInputBarProps {
    availableModels: AIModel[];
    selectedModel: AIModel | null;
    onModelSelected: (model: AIModel) => void;
    onUserInput: (input: string) => void;
    isLoading: boolean;
    themeColor?: string;
}

export const UnifiedInputBar: React.FC<UnifiedInputBarProps> = ({
    availableModels,
    selectedModel,
    onModelSelected,
    onUserInput,
    isLoading,
}) => {
    const [input, setInput] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const { isDarkTheme } = useTheme();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !selectedModel) return;
        onUserInput(input.trim());
        setInput('');
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const buttonClass = `p-2 rounded-full transition-colors duration-150 
        ${isDarkTheme
            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`;

    const modelDisplayName = selectedModel ? selectedModel.name : 'Select Model';
    const modelColor = selectedModel?.color || '#888888';

    // Animation variants
    const collapsedVariants = {
        hidden: {
            opacity: 0,
            y: -5,
            transition: {
                duration: 0.15
            }
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.2
            }
        },
        exit: {
            opacity: 0,
            y: -5,
            transition: {
                duration: 0.15
            }
        }
    };

    return (
        <div className="relative w-full">
            <AnimatePresence mode="wait">
                {isExpanded ? (
                    <CompactModelSelector
                        key="model-selector"
                        availableModels={availableModels}
                        selectedModel={selectedModel}
                        onModelSelected={onModelSelected}
                        onClose={toggleExpanded}
                    />
                ) : (
                    <motion.form
                        key="collapsed"
                        variants={collapsedVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-2 p-2 rounded-xl shadow-md"
                        style={{
                            backgroundColor: 'var(--input-bg)',
                            border: '1px solid var(--input-border)'
                        }}
                    >
                        {/* Only show input and send button if a model is selected */}
                        {selectedModel ? (
                            <>
                                {/* Full-width input at the top */}
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={`Message ${selectedModel.name}...`}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2.5 text-sm rounded-md bg-transparent focus:outline-none disabled:opacity-60"
                                    style={{
                                        color: 'var(--foreground)',
                                        backgroundColor: 'transparent'
                                    }}
                                />

                                {/* Bottom row with all buttons */}
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <button type="button" className={buttonClass}>
                                            <Paperclip size={18} />
                                        </button>

                                        {/* Model selection button */}
                                        <button
                                            type="button"
                                            onClick={toggleExpanded}
                                            className={`flex items-center p-2 rounded-md transition-colors duration-150 ${isDarkTheme ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50'}`}
                                            style={{
                                                color: 'var(--foreground)'
                                            }}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full mr-1.5 flex-shrink-0"
                                                style={{ backgroundColor: modelColor ? `${modelColor}4D` : '#8888884D' }}
                                            />
                                            <span className="text-sm font-medium truncate">
                                                {modelDisplayName}
                                            </span>
                                            <ChevronDown size={16} className={`ml-1 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''} transition-transform`} />
                                        </button>

                                        <button type="button" className={`${buttonClass} flex items-center gap-1 pr-3`}>
                                            <Search size={18} />
                                            <span className="text-sm">DeepSearch</span>
                                            <ChevronDown size={16} />
                                        </button>
                                        <button type="button" className={`${buttonClass} flex items-center gap-1 pr-3`}>
                                            <Brain size={18} />
                                            <span className="text-sm">Think</span>
                                        </button>
                                    </div>

                                    {/* Send button with hover and loading animations */}
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading || !input.trim()}
                                        className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 mr-1 mb-1"
                                        style={{
                                            backgroundColor: selectedModel?.color ? `${selectedModel.color}40` : 'var(--primary)',
                                            color: '#fff',
                                            opacity: isLoading || !input.trim() ? 0.5 : 1
                                        }}
                                        whileHover={{
                                            scale: isLoading || !input.trim() ? 1 : 1.1,
                                            backgroundColor: selectedModel?.color
                                                ? `${selectedModel.color}70`
                                                : 'var(--primary-hover)'
                                        }}
                                    >
                                        {isLoading ? (
                                            <motion.div
                                                className="absolute inset-0 rounded-full"
                                                style={{
                                                    border: `2px solid ${selectedModel?.color || 'var(--primary)'}`,
                                                    borderTopColor: 'transparent',
                                                    borderRightColor: 'transparent',
                                                }}
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                        ) : null}
                                        <Send size={18} />
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            // When no model is selected, show a message to select one
                            <>
                                {/* Model selection button for when no model is selected */}
                                <button
                                    type="button"
                                    onClick={toggleExpanded}
                                    className={`flex items-center p-2 rounded-md transition-colors duration-150 mr-auto ${isDarkTheme ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50'}`}
                                    style={{
                                        color: 'var(--foreground)'
                                    }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full mr-1.5 flex-shrink-0"
                                        style={{ backgroundColor: modelColor ? `${modelColor}4D` : '#8888884D' }}
                                    />
                                    <span className="text-sm font-medium truncate">
                                        {modelDisplayName}
                                    </span>
                                    <ChevronDown size={16} className={`ml-1 flex-shrink-0 opacity-60 ${isExpanded ? 'rotate-180' : ''} transition-transform`} />
                                </button>

                                <div className="flex-1 flex justify-center">
                                    <span className="text-sm opacity-60">
                                        Select a model to start chatting
                                    </span>
                                </div>
                            </>
                        )}
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}; 