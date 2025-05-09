'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UnifiedInputBar } from './chat/UnifiedInputBar';
import { AIModel } from '../types/ai';
import { sampleModels } from '../data/sample-models';
import { ThemeToggle } from './ThemeToggle';
import { ChatMessage } from './chat/ChatMessage';
import { Calendar } from 'lucide-react';
import { useTheme } from '../contexts/themeContext';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    modelId?: string;
    processingType?: 'text' | 'embedding' | 'audio';
};

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedModel, setSelectedModel] = useState<AIModel | null>(() => {
        // Default to GPT-4o as the selected model
        return sampleModels.find(model => model.id === 'gpt-4o') || null;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [hasChatStarted, setHasChatStarted] = useState(false);
    const [loadingType, setLoadingType] = useState<'text' | 'embedding' | 'audio'>('text');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    // Set hasChatStarted to true when first message is sent
    useEffect(() => {
        if (messages.length > 0 && !hasChatStarted) {
            setHasChatStarted(true);
        }
    }, [messages, hasChatStarted]);

    // Auto-scroll to the bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    const handleModelSelected = (model: AIModel) => {
        setSelectedModel(model);
    };

    const handleUserInput = (input: string) => {
        if (!input.trim() || !selectedModel) return;

        // Determine loading type based on input text for demo purposes
        let processingType: 'text' | 'embedding' | 'audio' = 'text';

        if (input.toLowerCase().includes('embed') || input.toLowerCase().includes('vector')) {
            processingType = 'embedding';
            setLoadingType('embedding');
        } else if (input.toLowerCase().includes('audio') || input.toLowerCase().includes('sound') || input.toLowerCase().includes('speak')) {
            processingType = 'audio';
            setLoadingType('audio');
        } else {
            processingType = 'text';
            setLoadingType('text');
        }

        // Set loading state
        setIsLoading(true);

        // Create a new user message
        const newMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date(),
            processingType,
        };

        // Add it to the messages array
        setMessages([...messages, newMessage]);

        // For demo purposes, simulate an assistant response
        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: getResponseBasedOnType(input, processingType, selectedModel.name),
                sender: 'assistant',
                timestamp: new Date(),
                modelId: selectedModel.id,
                processingType,
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
        }, 3000); // Longer delay to show the loading animation
    };

    const getResponseBasedOnType = (input: string, type: 'text' | 'embedding' | 'audio', modelName: string): string => {
        switch (type) {
            case 'embedding':
                return `I've generated vector embeddings for your input. The embedding has 1536 dimensions and has been optimized for semantic search.\n\nYour query: "${input}" has been processed successfully.`;
            case 'audio':
                return `I've generated audio for your text. The audio file is 12 seconds long and has been generated using a realistic voice model.\n\nAudio content: "${input}"`;
            default:
                return `${modelName} response: ${input}`;
        }
    };

    // Format date nicely
    const formatDate = (date: Date): string => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    // Group messages by sender
    const groupedMessages = useMemo(() => {
        const groups: Message[][] = [];
        let currentGroup: Message[] = [];

        messages.forEach((message, index) => {
            const prevMessage = messages[index - 1];

            // Start a new group if:
            // 1. This is the first message
            // 2. The sender changes
            // 3. More than 5 minutes have passed since the last message
            // 4. The date changes
            if (
                !prevMessage ||
                prevMessage.sender !== message.sender ||
                message.timestamp.getTime() - prevMessage.timestamp.getTime() > 5 * 60 * 1000 ||
                message.timestamp.toDateString() !== prevMessage.timestamp.toDateString()
            ) {
                if (currentGroup.length > 0) {
                    groups.push(currentGroup);
                }
                currentGroup = [message];
            } else {
                currentGroup.push(message);
            }
        });

        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }

        return groups;
    }, [messages]);

    return (
        <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--background)' }}>
            {/* Chat header */}
            <div className="flex justify-between items-center p-4 shadow-sm"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderBottom: '1px solid var(--card-border)'
                }}>
                <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Chat UI</h1>
                <ThemeToggle />
            </div>

            {/* Message area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                        {selectedModel ? 'Send a message to start a conversation...' : 'Select a model to begin...'}
                    </div>
                ) : (
                    <>
                        {groupedMessages.map((group, groupIndex) => {
                            const date = new Date(group[0].timestamp);
                            const showDateDivider = groupIndex === 0 ||
                                new Date(groupedMessages[groupIndex - 1][0].timestamp).toDateString() !== date.toDateString();

                            return (
                                <div key={`group-${groupIndex}`} className="space-y-3">
                                    {showDateDivider && (
                                        <div className="flex justify-center my-4">
                                            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm shadow-sm"
                                                style={{
                                                    backgroundColor: theme === 'light' ? 'rgba(244, 245, 246, 0.9)' : 'rgba(40, 44, 52, 0.8)',
                                                    color: 'var(--foreground)',
                                                    border: '1px solid var(--card-border)'
                                                }}>
                                                <Calendar size={14} className="opacity-70" />
                                                <span>{formatDate(date)}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        {group.map((message, messageIndex) => (
                                            <ChatMessage
                                                key={message.id}
                                                id={message.id}
                                                text={message.text}
                                                sender={message.sender}
                                                timestamp={message.timestamp}
                                                modelId={message.modelId}
                                                isFirstInGroup={messageIndex === 0}
                                                isLastInGroup={messageIndex === group.length - 1}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
                {isLoading && selectedModel && (
                    <ChatMessage
                        id="loading"
                        text=""
                        sender="assistant"
                        timestamp={new Date()}
                        modelId={selectedModel.id}
                        isLoading={true}
                        loadingType={loadingType}
                    />
                )}
            </div>

            {/* Input area - Conditionally positioned */}
            <AnimatePresence mode="wait">
                {!hasChatStarted ? (
                    // Centered input with smaller width before chat starts
                    <motion.div
                        key="centered-input"
                        className="flex flex-col justify-center items-center absolute left-0 right-0 bottom-0 top-0 pointer-events-none"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="mb-6 text-center pointer-events-auto"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                                Welcome to Chat UI
                            </h2>
                            <p className="text-lg opacity-80 max-w-2xl mx-auto" style={{ color: 'var(--foreground)' }}>
                                {selectedModel ? `Start your conversation with ${selectedModel.name}` : 'Select a model to begin chatting'}
                            </p>
                        </motion.div>
                        <div className="w-full max-w-2xl px-6 pointer-events-auto">
                            <UnifiedInputBar
                                availableModels={sampleModels}
                                selectedModel={selectedModel}
                                onModelSelected={handleModelSelected}
                                onUserInput={handleUserInput}
                                isLoading={isLoading}
                            />
                        </div>
                    </motion.div>
                ) : (
                    // Full-width input at the bottom after chat has started
                    <motion.div
                        key="bottom-input"
                        className="p-4"
                        style={{
                            backgroundColor: 'var(--background)',
                            borderTop: '1px solid var(--card-border)'
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <UnifiedInputBar
                            availableModels={sampleModels}
                            selectedModel={selectedModel}
                            onModelSelected={handleModelSelected}
                            onUserInput={handleUserInput}
                            isLoading={isLoading}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 