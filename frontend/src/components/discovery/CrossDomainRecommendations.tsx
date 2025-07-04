import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCrossDomainRecommendations } from '@/lib/perplexityService';

interface CrossDomainRecommendationsProps {
  entityType: string;
  entityName: string;
}

interface Recommendation {
  name: string;
  description: string;
  connection: string;
}

const DOMAIN_OPTIONS = [
  'music', 'movies', 'books', 'tv shows', 'restaurants', 
  'travel destinations', 'fashion', 'art', 'podcasts'
];

const CrossDomainRecommendations: React.FC<CrossDomainRecommendationsProps> = ({ entityType, entityName }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  // Filter out the current entity type from domain options
  const filteredDomains = DOMAIN_OPTIONS.filter(domain => 
    !domain.toLowerCase().includes(entityType.toLowerCase())
  );

  useEffect(() => {
    // Set a default domain if none selected
    if (!selectedDomain && filteredDomains.length > 0) {
      setSelectedDomain(filteredDomains[0]);
    }
  }, [filteredDomains, selectedDomain]);

  const handleDomainChange = async (domain: string) => {
    setSelectedDomain(domain);
    await fetchRecommendations(domain);
  };

  const fetchRecommendations = async (domain: string) => {
    if (!entityType || !entityName || !domain) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCrossDomainRecommendations(entityType, entityName, domain);
      setRecommendations(data);
    } catch (err) {
      setError('Failed to fetch recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDomain) {
      fetchRecommendations(selectedDomain);
    }
  }, [entityType, entityName]); // Deliberately not including selectedDomain to avoid double fetching

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-6"
    >
      <h3 className="text-xl font-semibold mb-4">Cross-Domain Recommendations</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          If you like this {entityType}, you might also enjoy these:
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {filteredDomains.map(domain => (
            <button
              key={domain}
              onClick={() => handleDomainChange(domain)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedDomain === domain
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {domain.charAt(0).toUpperCase() + domain.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No recommendations available. Try a different domain.</p>
          ) : (
            recommendations.map((rec, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <h4 className="font-medium text-blue-600 dark:text-blue-400">{rec.name}</h4>
                <p className="mt-1 text-gray-700 dark:text-gray-300">{rec.description}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Connection:</span> {rec.connection}
                </p>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
};

export default CrossDomainRecommendations; 