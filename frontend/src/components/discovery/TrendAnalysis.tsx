import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyzeCulturalTrend } from '@/lib/perplexityService';
import { QlooTrendingEntity } from '@/types/qloo';

interface TrendAnalysisProps {
  trend: QlooTrendingEntity;
}

interface TrendAnalysisData {
  analysis: string;
  culturalFactors: string;
  connections: string;
  predictions: string;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ trend }) => {
  const [analysisData, setAnalysisData] = useState<TrendAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchAnalysis = async () => {
    if (!trend) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Pass the entity name and type as a single string for analysis
      const trendString = `${trend.type}: ${trend.name} (Trend score: ${trend.trend_score})`;
      const data = await analyzeCulturalTrend(trendString);
      setAnalysisData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze trend. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trend) {
      fetchAnalysis();
    }
  }, [trend]);

  if (!trend) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md mb-4"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Cultural Trend Analysis</h3>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-blue-500 hover:text-blue-700"
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 py-4">{error}</div>
      ) : analysisData ? (
        <div>
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Why This Is Trending</h4>
            <p className="text-gray-600 dark:text-gray-400">{analysisData.analysis}</p>
          </div>
          
          {expanded && (
            <>
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Cultural Factors</h4>
                <p className="text-gray-600 dark:text-gray-400">{analysisData.culturalFactors}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Cultural Connections</h4>
                <p className="text-gray-600 dark:text-gray-400">{analysisData.connections}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Future Predictions</h4>
                <p className="text-gray-600 dark:text-gray-400">{analysisData.predictions}</p>
              </div>
            </>
          )}
          
          <button 
            onClick={fetchAnalysis}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Refresh Analysis
          </button>
        </div>
      ) : (
        <div className="py-4 text-center">
          <button 
            onClick={fetchAnalysis}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Analyze This Trend
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default TrendAnalysis; 