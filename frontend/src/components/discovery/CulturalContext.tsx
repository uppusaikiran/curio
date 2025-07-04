import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCulturalContext } from '@/lib/perplexityService';

interface CulturalContextProps {
  entityType: string;
  entityName: string;
}

interface ContextData {
  culturalSignificance: string;
  historicalContext: string;
  relatedTrends: string;
  interestingFacts: string;
}

const CulturalContext: React.FC<CulturalContextProps> = ({ entityType, entityName }) => {
  const [contextData, setContextData] = useState<ContextData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCulturalContext = async () => {
      if (!entityType || !entityName) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getCulturalContext(entityType, entityName);
        setContextData(data);
      } catch (err) {
        setError('Failed to fetch cultural context');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCulturalContext();
  }, [entityType, entityName]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Cultural Context</h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Cultural Context</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!contextData) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6"
    >
      <h3 className="text-xl font-semibold mb-4">Cultural Context</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-blue-600 dark:text-blue-400">Cultural Significance</h4>
          <p className="mt-1 text-gray-700 dark:text-gray-300">{contextData.culturalSignificance}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-blue-600 dark:text-blue-400">Historical Context</h4>
          <p className="mt-1 text-gray-700 dark:text-gray-300">{contextData.historicalContext}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-blue-600 dark:text-blue-400">Related Trends</h4>
          <p className="mt-1 text-gray-700 dark:text-gray-300">{contextData.relatedTrends}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-blue-600 dark:text-blue-400">Interesting Facts</h4>
          <p className="mt-1 text-gray-700 dark:text-gray-300">{contextData.interestingFacts}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CulturalContext; 