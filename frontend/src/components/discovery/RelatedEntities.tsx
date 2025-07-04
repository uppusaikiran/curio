'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getInsights } from '@/lib/qlooService';
import { QlooEntity, QlooInsight } from '@/types/qloo';

interface RelatedEntitiesProps {
  entity: QlooEntity | null;
  onEntitySelect: (entity: QlooEntity) => void;
}

export default function RelatedEntities({ entity, onEntitySelect }: RelatedEntitiesProps) {
  const [insights, setInsights] = useState<QlooInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entity) return;
    
    const fetchInsights = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getInsights({
          'filter.type': entity.type,
          'signal.interests.entities': entity.entity_id
        });
        setInsights(response);
      } catch (error) {
        console.error('Error fetching insights:', error);
        setError('Failed to load related entities. Please check your API key and connection.');
        setInsights([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInsights();
  }, [entity]);

  // Extract unique categories from insights
  const categories = React.useMemo(() => {
    if (!insights.length) return [];
    const categorySet = new Set<string>();
    
    insights.forEach(insight => {
      if (insight.type) {
        categorySet.add(insight.type);
      }
    });
    
    return Array.from(categorySet);
  }, [insights]);

  // Filter insights by selected category
  const filteredInsights = React.useMemo(() => {
    if (!selectedCategory) return insights;
    return insights.filter(insight => insight.type === selectedCategory);
  }, [insights, selectedCategory]);

  // Generate a color for each entity type
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      movie: 'bg-qloo-yellow/20 text-qloo-black',
      book: 'bg-qloo-teal/20 text-qloo-black',
      artist: 'bg-blue-100 text-blue-800',
      tv_show: 'bg-purple-100 text-purple-800',
      restaurant: 'bg-red-100 text-red-800',
      default: 'bg-gray-100 text-gray-800'
    };
    
    return typeColors[type] || typeColors.default;
  };

  // If no entity is selected, show message
  if (!entity) {
    return <div>Select an entity to view related items</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-muted/30 rounded-lg p-6 border border-qloo-yellow/20 h-full"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <span className="w-10 h-10 rounded-full bg-qloo-yellow flex items-center justify-center text-qloo-black mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </span>
        Related to {entity.name}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 border-b border-qloo-yellow/20 pb-4">
          <button
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              !selectedCategory ? 'bg-qloo-yellow text-qloo-black' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedCategory === category ? 'bg-qloo-yellow text-qloo-black' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading related entities...</div>
        </div>
      ) : filteredInsights.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredInsights.map((insight) => (
            <motion.div
              key={insight.entity_id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-background rounded-md p-4 cursor-pointer border border-qloo-yellow/10 hover:border-qloo-yellow transition-colors"
              onClick={() => onEntitySelect(insight)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium truncate pr-2">{insight.name}</h3>
                <span className="text-xs font-semibold bg-qloo-yellow/80 text-qloo-black px-2 py-1 rounded-full">
                  {Math.round((insight.score || 0) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(insight.type)}`}>
                  {insight.type}
                </span>
                {insight.subtype && (
                  <span className="text-xs text-muted-foreground">
                    {insight.subtype}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">No related entities found.</p>
        </div>
      )}
      
      {/* Description */}
      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          Discover items related to {entity.name} based on Qloo's cultural intelligence. 
          Click on any item to explore it further.
        </p>
      </div>
    </motion.div>
  );
} 