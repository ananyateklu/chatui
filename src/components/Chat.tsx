'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UnifiedInputBar } from './chat/UnifiedInputBar';
import { AIModel, Message, Conversation } from '../types/ai';
import { sampleModels } from '../data/sample-models';
import { ThemeToggle } from './ThemeToggle';
import { ChatMessage } from './chat/ChatMessage';
import { Calendar, Menu } from 'lucide-react';
import { useTheme } from '../contexts/themeContext';
import { ChatHistorySidebar } from './chat/ChatHistorySidebar';

const LOCAL_STORAGE_KEY = 'chatHistory';

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

    const [savedConversations, setSavedConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Function to toggle sidebar visibility
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Load conversations from cache on initial mount
    useEffect(() => {
        // TODO: Implement database loading logic here if DB is configured
        const cachedConversations = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cachedConversations) {
            try {
                const parsedConversations: Conversation[] = JSON.parse(cachedConversations).map((conv: Conversation) => ({
                    ...conv,
                    lastActivity: new Date(conv.lastActivity), // Ensure dates are Date objects
                    messages: conv.messages.map(msg => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp) // Ensure dates are Date objects
                    }))
                }));
                setSavedConversations(parsedConversations);
                if (parsedConversations.length > 0) {
                    // Load the most recent conversation by default
                    const sortedConversations = [...parsedConversations].sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
                    startNewOrLoadExistingConversation(sortedConversations[0].id);
                } else {
                    startNewConversation();
                }
            } catch (error) {
                console.error("Failed to parse conversations from localStorage", error);
                localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
                startNewConversation();
            }
        } else {
            startNewConversation();
        }
    }, []);

    // Save active conversation to cache when messages or model change
    useEffect(() => {
        if (activeConversationId && messages.length > 0) {
            const activeConvIndex = savedConversations.findIndex(conv => conv.id === activeConversationId);
            const updatedConversation: Conversation = {
                id: activeConversationId,
                title: messages[0].text.substring(0, 30) + (messages[0].text.length > 30 ? '...' : ''),
                messages: messages,
                lastActivity: new Date(),
                modelId: selectedModel?.id,
            };

            let newSavedConversations;
            if (activeConvIndex > -1) {
                newSavedConversations = [...savedConversations];
                newSavedConversations[activeConvIndex] = updatedConversation;
            } else {
                newSavedConversations = [...savedConversations, updatedConversation];
            }
            // TODO: Implement database saving logic here if DB is configured
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSavedConversations));
            setSavedConversations(newSavedConversations);
        } else if (activeConversationId && messages.length === 0 && savedConversations.some(c => c.id === activeConversationId)) {
            // If an active conversation has its messages cleared (e.g. user wants to abandon it), remove it
            const newSavedConversations = savedConversations.filter(conv => conv.id !== activeConversationId);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSavedConversations));
            setSavedConversations(newSavedConversations);
            // Potentially start a new conversation or load another one
            if (newSavedConversations.length > 0) {
                const sortedConversations = [...newSavedConversations].sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
                startNewOrLoadExistingConversation(sortedConversations[0].id);
            } else {
                startNewConversation();
            }
        }
    }, [messages, selectedModel, activeConversationId]);

    const startNewConversation = () => {
        const newId = `conv-${Date.now().toString()}`;
        setActiveConversationId(newId);
        setMessages([]);
        setHasChatStarted(false); // Reset chat started state
        // Don't save an empty conversation immediately, it will be saved on first message
        return newId;
    };

    const startNewOrLoadExistingConversation = (conversationId: string | null) => {
        if (conversationId) {
            const conversationToLoad = savedConversations.find(conv => conv.id === conversationId);
            if (conversationToLoad) {
                setActiveConversationId(conversationToLoad.id);
                setMessages(conversationToLoad.messages);
                const modelForConv = sampleModels.find(m => m.id === conversationToLoad.modelId) || selectedModel;
                setSelectedModel(modelForConv);
                setHasChatStarted(conversationToLoad.messages.length > 0);
            } else {
                // If somehow the ID is invalid, start a new one
                startNewConversation();
            }
        } else {
            startNewConversation();
        }
    };

    // Set hasChatStarted to true when first message is sent or conversation loaded
    useEffect(() => {
        if (messages.length > 0 && !hasChatStarted) {
            setHasChatStarted(true);
        } else if (messages.length === 0 && hasChatStarted) {
            // This case might occur if a conversation is cleared or a new one started
            // setHasChatStarted(false); // Handled by startNewConversation
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

        const currentActiveConvId = activeConversationId;
        // If no active conversation, or if current active conversation has no messages (is new and unsaved)
        if (!currentActiveConvId || !savedConversations.find(c => c.id === currentActiveConvId)) {
            // This ensures a new conversation is properly initialized before adding messages to it
            // and will be persisted by the useEffect hook.
        }

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
        setMessages(prevMessages => [...prevMessages, newMessage]);

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
        <div className="flex h-screen" style={{ backgroundColor: 'var(--background)' }}>
            {/* Chat History Sidebar - Conditionally rendered */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0, marginRight: 0 }}
                        animate={{ width: 256, opacity: 1, marginRight: 0 }} // 256px is w-64
                        exit={{ width: 0, opacity: 0, marginRight: -16 }} // marginRight to avoid layout shift on exit
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex-shrink-0"
                    >
                        <ChatHistorySidebar
                            conversations={savedConversations}
                            activeConversationId={activeConversationId}
                            onLoadConversation={startNewOrLoadExistingConversation}
                            onNewConversation={startNewConversation}
                            onToggleSidebar={toggleSidebar} // Pass the toggle function
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Area container */}
            <div className="flex flex-col flex-1 h-full min-w-0"> {/* Added min-w-0 for flexbox to not overflow */}
                {/* Chat header */}
                <div className="flex justify-between items-center p-4 shadow-sm"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderBottom: '1px solid var(--card-border)'
                    }}>
                    <div className="flex items-center">
                        {!isSidebarOpen && (
                            <motion.button
                                onClick={toggleSidebar}
                                className="p-2 mr-2 rounded-full transition-colors"
                                style={{
                                    color: 'var(--foreground)',
                                    backgroundColor: 'var(--card-bg)'
                                }}
                                whileHover={{ backgroundColor: 'var(--hover-bg)' }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Menu size={20} />
                            </motion.button>
                        )}
                        <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Chat UI</h1>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Message area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.length === 0 && !isLoading ? (
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
                            style={{ zIndex: 10 }}
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
        </div>
    );
} 