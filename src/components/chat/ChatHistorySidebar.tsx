import React from 'react';
import { Conversation } from '../../types/ai';
import { PlusCircle, MessageSquare, ChevronLeft } from 'lucide-react';

interface ChatHistorySidebarProps {
    conversations: Conversation[];
    activeConversationId: string | null;
    onLoadConversation: (conversationId: string) => void;
    onNewConversation: () => void;
    onToggleSidebar: () => void;
    // TODO: Add onDeleteConversation if we implement deletion UI
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
    conversations,
    activeConversationId,
    onLoadConversation,
    onNewConversation,
    onToggleSidebar,
}) => {
    const sortedConversations = [...conversations].sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

    return (
        <div className="w-64 p-4 space-y-4 flex flex-col h-full relative"
            style={{
                backgroundColor: 'var(--sidebar-bg)',
                borderRight: '1px solid var(--sidebar-border)',
                zIndex: 50 // Add a high z-index to ensure it appears above everything
            }}
        >
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                    Chat History
                </h2>
                <button
                    onClick={onToggleSidebar}
                    title="Close sidebar"
                    className="p-1 rounded-full transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <ChevronLeft size={18} />
                </button>
            </div>

            <button
                onClick={onNewConversation}
                className="flex items-center justify-center w-full p-2 rounded-md text-sm font-medium transition-colors"
                style={{
                    backgroundColor: 'var(--primary-accent)',
                    color: 'var(--primary-accent-foreground)',
                    border: '1px solid var(--primary-accent-border)'
                }}
                hover-style={{
                    backgroundColor: 'var(--primary-accent-hover)'
                }}
            >
                <PlusCircle size={18} className="mr-2" />
                New Chat
            </button>

            <h2 className="text-xs font-semibold uppercase tracking-wider mt-4" style={{ color: 'var(--muted-foreground)' }}>
                Recent Chats
            </h2>

            {sortedConversations.length === 0 && (
                <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                    No chat history yet.
                </p>
            )}

            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar-thin">
                {sortedConversations.map((conv) => (
                    <button
                        key={conv.id}
                        onClick={() => onLoadConversation(conv.id)}
                        title={conv.title}
                        className={`w-full text-left p-2 rounded-md text-sm truncate transition-colors flex items-center 
                            ${conv.id === activeConversationId
                                ? 'font-semibold'
                                : 'font-normal'}
                        `}
                        style={{
                            backgroundColor: conv.id === activeConversationId ? 'var(--active-conversation-bg)' : 'transparent',
                            color: conv.id === activeConversationId ? 'var(--active-conversation-foreground)' : 'var(--foreground)',
                        }}
                        // Add hover style for better UX
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = conv.id === activeConversationId ? 'var(--active-conversation-bg)' : 'var(--hover-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = conv.id === activeConversationId ? 'var(--active-conversation-bg)' : 'transparent'}
                    >
                        <MessageSquare size={16} className="mr-2 flex-shrink-0 opacity-70" />
                        <span className="truncate">{conv.title || 'Untitled Chat'}</span>
                    </button>
                ))}
            </div>
            {/* TODO: Add a footer for settings or user profile if needed */}
        </div>
    );
}; 