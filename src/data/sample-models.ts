import { AIModel } from '../types/ai';

export const sampleModels: AIModel[] = [
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        category: 'chat',
        description: 'The latest GPT-4 model with improved capabilities',
        isConfigured: true,
        isReasoner: true,
        color: '#6a44d9',
        endpoint: 'chat',
        size: 'xl'
    },
    {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        category: 'chat',
        description: 'Faster and more economical model with good capabilities',
        isConfigured: true,
        isReasoner: false,
        color: '#19c37d',
        endpoint: 'chat',
        size: 'l'
    },
    {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        category: 'chat',
        description: 'Most powerful Claude model with excellent reasoning',
        isConfigured: true,
        isReasoner: true,
        color: '#e37e40',
        endpoint: 'chat',
        size: 'xl'
    },
    {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: 'anthropic',
        category: 'chat',
        description: 'Balanced Claude model',
        isConfigured: true,
        isReasoner: true,
        color: '#e37e40',
        endpoint: 'chat',
        size: 'l'
    },
    {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        category: 'chat',
        description: 'Fast and efficient Claude model',
        isConfigured: true,
        isReasoner: false,
        color: '#e37e40',
        endpoint: 'chat',
        size: 'm'
    },
    {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'gemini',
        category: 'chat',
        description: 'Google\'s advanced multimodal model',
        isConfigured: true,
        isReasoner: true,
        color: '#4285f4',
        endpoint: 'chat',
        size: 'l'
    },
    {
        id: 'gemini-flash',
        name: 'Gemini Flash',
        provider: 'gemini',
        category: 'chat',
        description: 'Fast and efficient Gemini model',
        isConfigured: true,
        isReasoner: false,
        color: '#4285f4',
        endpoint: 'chat',
        size: 'm'
    },
    {
        id: 'grok-1',
        name: 'Grok-1',
        provider: 'grok',
        category: 'chat',
        description: 'xAI\'s conversational AI model',
        isConfigured: true,
        isReasoner: true,
        color: '#ff0080',
        endpoint: 'chat',
        size: 'l'
    },
    {
        id: 'mistral-medium',
        name: 'Mistral Medium',
        provider: 'ollama',
        category: 'chat',
        description: 'Balanced open source model with great capabilities',
        isConfigured: true,
        isReasoner: false,
        color: '#5a66d1',
        endpoint: 'chat',
        size: 'm'
    },
    {
        id: 'llama3-8b',
        name: 'Llama 3 8B',
        provider: 'ollama',
        category: 'chat',
        description: 'Meta\'s 8B parameter open source model',
        isConfigured: true,
        isReasoner: false,
        color: '#5a66d1',
        endpoint: 'chat',
        size: 'm'
    },
    {
        id: 'llava',
        name: 'LLaVA',
        provider: 'ollama',
        category: 'image',
        description: 'Multimodal model for processing images',
        isConfigured: true,
        isReasoner: false,
        color: '#5a66d1',
        endpoint: 'images',
        size: 'l'
    },
    {
        id: 'pplx-online',
        name: 'Perplexity Online',
        provider: 'perplexity',
        category: 'search',
        description: 'Model with real-time web search capabilities',
        isConfigured: true,
        isReasoner: true,
        color: '#00bfff',
        endpoint: 'search',
        size: 'l'
    }
]; 