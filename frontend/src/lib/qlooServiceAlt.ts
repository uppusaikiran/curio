import axios from 'axios';
import { QlooEntityType } from '@/types/qloo';

// Use environment variables for API credentials
const API_BASE_URL = process.env.NEXT_PUBLIC_QLOO_API_URL || 'https://hackathon.api.qloo.com';
const API_KEY = process.env.NEXT_PUBLIC_QLOO_API_KEY;

// Check if required environment variables are set
const isConfigured = () => {
  return Boolean(API_KEY);
};

// Create a client with the API key header
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': API_KEY
  }
});

/**
 * Get insights with proper parameter validation
 * Ensures that at least one valid signal or filter is included
 */
export const getInsights = async (params: Record<string, any> = {}) => {
  // Validate parameters
  if (!params['filter.type']) {
    throw new Error('filter.type is required');
  }

  // Ensure at least one additional parameter beyond filter.type
  // Check if there's at least one valid signal or filter parameter
  const hasValidSignalOrFilter = Object.keys(params).some(key => 
    (key !== 'filter.type' && (
      key.startsWith('filter.') || 
      key.startsWith('signal.') ||
      key === 'trending'
    ))
  );

  // If no valid signal or filter, add a default one
  if (!hasValidSignalOrFilter) {
    // Based on the entity type, add a sensible default parameter
    const entityType = params['filter.type'];
    
    // Different defaults for different entity types
    if (entityType.includes('movie') || entityType.includes('tv_show')) {
      // For movies/TV, use a popular genre tag
      params['filter.tags'] = 'urn:tag:genre:media:popular';
    } else if (entityType.includes('music')) {
      // For music, use a popular music tag
      params['filter.tags'] = 'urn:tag:genre:music:popular';
    } else {
      // For everything else, request popular items
      params['filter.popularity.min'] = '0.5';
    }
    
    console.log('Added default parameter to satisfy API requirements');
  }

  try {
    // Convert params object to URL query string
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString());
      }
    });

    // Make the API call
    const response = await apiClient.get(`/v2/insights?${queryString.toString()}`);
    return response.data.results || { entities: [] };
  } catch (error) {
    console.error('Error in getInsights:', error);
    throw error;
  }
};

/**
 * Get trending entities with proper parameter validation
 */
export const getTrendingEntities = async (params: {
  entity_type: string,
  limit?: number,
  include_tags?: boolean,
  include_properties?: boolean
} = { entity_type: 'urn:entity:movie' }) => {
  try {
    // Convert to insights API parameters
    const apiParams: Record<string, any> = {
      'filter.type': params.entity_type,
      'trending': 'true'  // Critical parameter to ensure we get trending entities
    };
    
    // Add optional parameters
    if (params.limit) apiParams.take = params.limit;
    if (params.include_tags) apiParams['include.tags'] = 'true';
    if (params.include_properties) apiParams['include.properties'] = 'true';
    
    // Make the API call using getInsights which ensures valid parameters
    const result = await getInsights(apiParams);
    return result.entities || [];
  } catch (error) {
    console.error('Error in getTrendingEntities:', error);
    throw error;
  }
};

// Export utilities
export const qlooServiceAlt = {
  getInsights,
  getTrendingEntities,
  isConfigured
};

export default qlooServiceAlt; 