'use client';

import React, { useState, useMemo } from 'react';
import { AIModel } from '../../types/ai';
import { useTheme } from '../../contexts/themeContext';
import { ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

// Model option component for the expanded selector
const ModelOption: React.FC<{
    model: AIModel;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ model, isSelected, onSelect }) => {
    const { isDarkTheme } = useTheme();

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            onClick={onSelect}
            className={`flex items-center px-3 py-1.5 rounded-full transition-colors duration-150
                ${isSelected
                    ? (isDarkTheme
                        ? 'bg-gray-700/80 text-white'
                        : 'bg-gray-200 text-gray-900')
                    : (isDarkTheme
                        ? 'hover:bg-gray-700/50 text-gray-300 border border-gray-700'
                        : 'hover:bg-gray-200/70 text-gray-700 border border-gray-200')
                }
            `}
        >
            <div
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: model.color || '#888888' }}
            />
            <span className="text-sm whitespace-nowrap">{model.name}</span>
        </motion.button>
    );
};

// Filter button component
const FilterButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => {
    const { isDarkTheme } = useTheme();

    return (
        <button
            onClick={onClick}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors duration-150
                ${isActive
                    ? (isDarkTheme
                        ? 'bg-[#4c9959]/90 text-white'
                        : 'bg-[#4c9959] text-white')
                    : (isDarkTheme
                        ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/80'
                        : 'bg-gray-200/70 text-gray-700 hover:bg-gray-200')
                }
            `}
        >
            {label}
        </button>
    );
};

interface CompactModelSelectorProps {
    availableModels: AIModel[];
    selectedModel: AIModel | null;
    onModelSelected: (model: AIModel) => void;
    onClose: () => void;
}

export const CompactModelSelector: React.FC<CompactModelSelectorProps> = ({
    availableModels,
    selectedModel,
    onModelSelected,
    onClose,
}) => {
    const { isDarkTheme } = useTheme();
    const [modelFilterInput, setModelFilterInput] = useState('');

    // New filter states
    const [activeProviders, setActiveProviders] = useState<string[]>([]);
    const [activeTypes, setActiveTypes] = useState<string[]>([]);
    const [showReasoningOnly, setShowReasoningOnly] = useState(false);

    // Extract unique model providers
    const uniqueProviders = useMemo(() => {
        const providers = availableModels.map(model => model.provider);
        return [...new Set(providers)].map(p => p.charAt(0).toUpperCase() + p.slice(1));
    }, [availableModels]);

    // Define model types (these would ideally come from your data model)
    const modelTypes = ["Chat", "Image", "Audio", "Embedding"];

    // Toggle provider filter
    const toggleProviderFilter = (provider: string) => {
        setActiveProviders(prev =>
            prev.includes(provider)
                ? prev.filter(p => p !== provider)
                : [...prev, provider]
        );
    };

    // Toggle type filter
    const toggleTypeFilter = (type: string) => {
        setActiveTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    // Toggle reasoning models
    const toggleReasoningFilter = () => {
        setShowReasoningOnly(prev => !prev);
    };

    // Group models by provider
    const groupedModels = useMemo(() => {
        return availableModels.reduce((acc, model) => {
            const provider = model.provider.charAt(0).toUpperCase() + model.provider.slice(1);
            if (!acc[provider]) acc[provider] = [];
            acc[provider].push(model);
            return acc;
        }, {} as Record<string, AIModel[]>);
    }, [availableModels]);

    const filteredGroupedModels = useMemo(() => {
        // Start with the basic text search filter
        const result: Record<string, AIModel[]> = {};
        const lowercasedFilter = modelFilterInput.toLowerCase();

        for (const provider in groupedModels) {
            let filteredProviderModels = groupedModels[provider];

            // Apply text search filter
            if (modelFilterInput.trim()) {
                filteredProviderModels = filteredProviderModels.filter(model =>
                    model.name.toLowerCase().includes(lowercasedFilter) ||
                    model.provider.toLowerCase().includes(lowercasedFilter)
                );
            }

            // Apply provider filter
            if (activeProviders.length > 0) {
                if (!activeProviders.includes(provider)) {
                    continue; // Skip this provider
                }
            }

            // Apply type filter (assuming model has a 'type' or 'category' property)
            if (activeTypes.length > 0) {
                filteredProviderModels = filteredProviderModels.filter(model => {
                    // Use category from AIModel definition
                    return activeTypes.some(type => model.category.toLowerCase() === type.toLowerCase());
                });
            }

            // Apply reasoning filter (assuming model has a 'capabilities' array)
            if (showReasoningOnly) {
                filteredProviderModels = filteredProviderModels.filter(model => {
                    // Use the isReasoner property from the AIModel interface
                    return model.isReasoner;
                });
            }

            if (filteredProviderModels.length > 0) {
                result[provider] = filteredProviderModels;
            }
        }
        return result;
    }, [groupedModels, modelFilterInput, activeProviders, activeTypes, showReasoningOnly]);

    // Animation variants
    const expandedVariants = {
        hidden: {
            opacity: 0,
            scale: 0.98,
            y: 10,
            transition: {
                duration: 0.15,
                ease: "easeInOut"
            }
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.2,
                ease: "easeOut",
                staggerChildren: 0.05,
                when: "beforeChildren"
            }
        },
        exit: {
            opacity: 0,
            scale: 0.98,
            y: 10,
            transition: {
                duration: 0.15,
                ease: "easeInOut"
            }
        }
    };

    const handleModelChange = (model: AIModel) => {
        onModelSelected(model);
        onClose();
    };

    // Get theme-appropriate color for section labels
    const getLabelStyle = () => {
        return {
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            fontWeight: 600
        };
    };

    return (
        <motion.div
            key="expanded"
            variants={expandedVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-0 left-0 right-0 rounded-xl shadow-lg p-4 z-10"
            style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--card-border)'
            }}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium" style={{ color: 'var(--foreground)' }}>
                    Select a model
                </h3>
                <button
                    onClick={onClose}
                    className={`p-2 rounded-full ${isDarkTheme ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/70'}`}
                    style={{ color: 'var(--foreground)' }}
                >
                    <ArrowUp size={18} />
                </button>
            </div>

            {/* Filter buttons section */}
            <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                    <div className="text-xs mr-2 self-center" style={getLabelStyle()}>
                        Provider:
                    </div>
                    <FilterButton
                        label="All"
                        isActive={activeProviders.length === 0}
                        onClick={() => setActiveProviders([])}
                    />
                    {uniqueProviders.map(provider => (
                        <FilterButton
                            key={provider}
                            label={provider}
                            isActive={activeProviders.includes(provider)}
                            onClick={() => toggleProviderFilter(provider)}
                        />
                    ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                    <div className="text-xs mr-2 self-center" style={getLabelStyle()}>
                        Type:
                    </div>
                    <FilterButton
                        label="All"
                        isActive={activeTypes.length === 0}
                        onClick={() => setActiveTypes([])}
                    />
                    {modelTypes.map(type => (
                        <FilterButton
                            key={type}
                            label={type}
                            isActive={activeTypes.includes(type)}
                            onClick={() => toggleTypeFilter(type)}
                        />
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    <div className="text-xs mr-2 self-center" style={getLabelStyle()}>
                        Capability:
                    </div>
                    <FilterButton
                        label="Reasoning"
                        isActive={showReasoningOnly}
                        onClick={toggleReasoningFilter}
                    />
                </div>
            </div>

            <div className="mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                {Object.keys(filteredGroupedModels).length === 0 && (
                    <div className="text-sm text-center py-4" style={{ color: isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}>
                        No models found with the selected filters.
                    </div>
                )}
                {Object.entries(filteredGroupedModels).map(([provider, models]) => (
                    <motion.div
                        key={provider}
                        className="mb-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="text-xs mb-2" style={getLabelStyle()}>
                            {provider}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {models.map(model => (
                                <ModelOption
                                    key={model.id}
                                    model={model}
                                    isSelected={selectedModel?.id === model.id}
                                    onSelect={() => handleModelChange(model)}
                                />
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={modelFilterInput}
                    onChange={(e) => setModelFilterInput(e.target.value)}
                    placeholder="Search for a model..."
                    className="flex-1 py-2.5 px-3 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{
                        backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        color: 'var(--foreground)'
                    }}
                />
                <button
                    type="button"
                    disabled={!selectedModel}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${!selectedModel ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                        backgroundColor: selectedModel?.color ? `${selectedModel.color}40` : 'var(--primary)',
                        color: isDarkTheme ? 'white' : 'black'
                    }}
                    onClick={onClose}
                >
                    <ArrowUp size={20} />
                </button>
            </div>
        </motion.div>
    );
}; 