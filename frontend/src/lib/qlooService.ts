import axios from 'axios';
import { QlooEntityType, QlooEntity, QlooTrendingEntity, QlooInsight, QlooAnalysisResult, QlooTagType } from '@/types/qloo';

// Use environment variables for API credentials
const QLOO_API_BASE_URL = process.env.NEXT_PUBLIC_QLOO_API_URL || 'https://hackathon.api.qloo.com';
const QLOO_API_KEY = process.env.NEXT_PUBLIC_QLOO_API_KEY;

// Create axios instance for Qloo API
const qlooApi = axios.create({
  baseURL: QLOO_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': QLOO_API_KEY
  }
});

// Predefined tags for use when API access is limited
const predefinedTags: Record<string, any[]> = {
  // Common genre tags for media
  'urn:tag:genre:media': [
    { id: 'urn:tag:genre:media:action', name: 'Action', type: 'urn:tag:genre:media' },
    { id: 'urn:tag:genre:media:comedy', name: 'Comedy', type: 'urn:tag:genre:media' },
    { id: 'urn:tag:genre:media:drama', name: 'Drama', type: 'urn:tag:genre:media' },
    { id: 'urn:tag:genre:media:thriller', name: 'Thriller', type: 'urn:tag:genre:media' },
    { id: 'urn:tag:genre:media:sci_fi', name: 'Sci-Fi', type: 'urn:tag:genre:media' },
    { id: 'urn:tag:genre:media:horror', name: 'Horror', type: 'urn:tag:genre:media' },
    { id: 'urn:tag:genre:media:fantasy', name: 'Fantasy', type: 'urn:tag:genre:media' },
    { id: 'urn:tag:genre:media:documentary', name: 'Documentary', type: 'urn:tag:genre:media' },
    { id: 'urn:tag:genre:media:animation', name: 'Animation', type: 'urn:tag:genre:media' },
    { id: 'urn:tag:genre:media:popular', name: 'Popular', type: 'urn:tag:genre:media' }
  ],
  // Restaurant/cuisine tags
  'urn:tag:genre:restaurant': [
    { id: 'urn:tag:genre:restaurant:Italian', name: 'Italian', type: 'urn:tag:genre:restaurant' },
    { id: 'urn:tag:genre:restaurant:Chinese', name: 'Chinese', type: 'urn:tag:genre:restaurant' },
    { id: 'urn:tag:genre:restaurant:Mexican', name: 'Mexican', type: 'urn:tag:genre:restaurant' },
    { id: 'urn:tag:genre:restaurant:Japanese', name: 'Japanese', type: 'urn:tag:genre:restaurant' },
    { id: 'urn:tag:genre:restaurant:American', name: 'American', type: 'urn:tag:genre:restaurant' },
    { id: 'urn:tag:genre:restaurant:French', name: 'French', type: 'urn:tag:genre:restaurant' },
    { id: 'urn:tag:genre:restaurant:Indian', name: 'Indian', type: 'urn:tag:genre:restaurant' },
    { id: 'urn:tag:genre:restaurant:Thai', name: 'Thai', type: 'urn:tag:genre:restaurant' }
  ],
  // Music genre tags
  'urn:tag:genre:music': [
    { id: 'urn:tag:genre:music:rock', name: 'Rock', type: 'urn:tag:genre:music' },
    { id: 'urn:tag:genre:music:pop', name: 'Pop', type: 'urn:tag:genre:music' },
    { id: 'urn:tag:genre:music:hip_hop', name: 'Hip Hop', type: 'urn:tag:genre:music' },
    { id: 'urn:tag:genre:music:electronic', name: 'Electronic', type: 'urn:tag:genre:music' },
    { id: 'urn:tag:genre:music:jazz', name: 'Jazz', type: 'urn:tag:genre:music' },
    { id: 'urn:tag:genre:music:classical', name: 'Classical', type: 'urn:tag:genre:music' },
    { id: 'urn:tag:genre:music:country', name: 'Country', type: 'urn:tag:genre:music' },
    { id: 'urn:tag:genre:music:r_and_b', name: 'R&B', type: 'urn:tag:genre:music' }
  ],
  // Book genre tags
  'urn:tag:genre:book': [
    { id: 'urn:tag:genre:book:fiction', name: 'Fiction', type: 'urn:tag:genre:book' },
    { id: 'urn:tag:genre:book:non_fiction', name: 'Non-Fiction', type: 'urn:tag:genre:book' },
    { id: 'urn:tag:genre:book:sci_fi', name: 'Science Fiction', type: 'urn:tag:genre:book' },
    { id: 'urn:tag:genre:book:fantasy', name: 'Fantasy', type: 'urn:tag:genre:book' },
    { id: 'urn:tag:genre:book:mystery', name: 'Mystery', type: 'urn:tag:genre:book' },
    { id: 'urn:tag:genre:book:thriller', name: 'Thriller', type: 'urn:tag:genre:book' },
    { id: 'urn:tag:genre:book:romance', name: 'Romance', type: 'urn:tag:genre:book' },
    { id: 'urn:tag:genre:book:biography', name: 'Biography', type: 'urn:tag:genre:book' }
  ],
  // Default tags for fallback
  'default': [
    { id: 'urn:tag:genre:media:popular', name: 'Popular Media', type: 'urn:tag:genre:media' },
    { id: 'urn:tag:genre:music:popular', name: 'Popular Music', type: 'urn:tag:genre:music' },
    { id: 'urn:tag:genre:restaurant:popular', name: 'Popular Restaurants', type: 'urn:tag:genre:restaurant' },
    { id: 'urn:tag:genre:book:popular', name: 'Popular Books', type: 'urn:tag:genre:book' }
  ]
};

// Helper function to get predefined tags for a tag type
const getPredefinedTags = (tagType: string, query: string = '') => {
  // Get exact match if available
  if (predefinedTags[tagType]) {
    const tags = predefinedTags[tagType];
    
    // Filter by query if provided
    if (query && query.trim() !== '') {
      const lowercaseQuery = query.toLowerCase().trim();
      return tags.filter(tag => 
        tag.name.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    return tags;
  }
  
  // Try to find a parent category match
  const potentialParentKeys = Object.keys(predefinedTags)
    .filter(key => tagType.startsWith(key))
    .sort((a, b) => b.length - a.length); // Sort by longest match first
  
  if (potentialParentKeys.length > 0) {
    const tags = predefinedTags[potentialParentKeys[0]];
    
    // Filter by query if provided
    if (query && query.trim() !== '') {
      const lowercaseQuery = query.toLowerCase().trim();
      return tags.filter(tag => 
        tag.name.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    return tags;
  }
  
  // Fallback to default tags
  return predefinedTags.default;
};

// Helper function to convert params object to URL query string
const buildQueryString = (params: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) return '';
  
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Helper function to get headers for API requests
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Api-Key': QLOO_API_KEY
  };
}

/**
 * Get insights based on various parameters
 * 
 * @param params Object containing filter and signal parameters
 * @returns Array of insight entities
 */
export async function getInsights(params: Record<string, any> = {}): Promise<QlooInsight[]> {
  try {
    const queryString = buildQueryString(params);
    const response = await qlooApi.get(`/v2/insights/${queryString}`);
    return response.data.results?.entities || [];
  } catch (error) {
    console.error('Error fetching insights:', error);
    throw error;
  }
}

/**
 * Search for entities by type and query
 * 
 * @param entityType The type of entity to search for (e.g., "urn:entity:movie")
 * @param query Search query string
 * @param limit Maximum number of results to return
 * @param tags Optional comma-separated tag IDs to filter results
 * @returns Array of matching entities
 */
export async function searchEntities(
  entityType: string, 
  query: string,
  limit: number = 10,
  tags?: string
): Promise<QlooEntity[]> {
  try {
    // Check if API is configured
    if (!isApiConfigured()) {
      throw new Error('API key not configured. Please check your environment variables.');
    }
    
    console.log(`Searching for ${entityType} entities matching "${query}"`);
    
    // Format entity type correctly
    let formattedEntityType = entityType;
    if (!formattedEntityType.startsWith('urn:entity:')) {
      formattedEntityType = `urn:entity:${formattedEntityType}`;
    }
    
    // First try direct search using the query parameter
    try {
      const directSearchParams: Record<string, any> = {
        'filter.type': formattedEntityType,
        'q': query,
        'take': limit * 2 // Request more to ensure we get enough results
      };
      
      // Add tags parameter if provided
      if (tags) {
        directSearchParams['filter.tags'] = tags;
      }
      
      console.log('Trying direct search with query parameter:', directSearchParams);
      
      const response = await qlooApi.get(`/v2/entities`, { 
        params: directSearchParams
      });
      
      if (response.data?.success && response.data.results?.entities?.length > 0) {
        console.log(`Direct search found ${response.data.results.entities.length} results`);
        return response.data.results.entities.slice(0, limit);
      }
    } catch (error) {
      console.log('Direct search failed, falling back to genre-based search');
    }
    
    // According to the API docs, we need at least one valid filter or signal parameter
    // Use provided tags if available, otherwise fall back to documented examples
    let tagsToUse: string[] = [];
    
    if (tags) {
      // Use the provided tags
      tagsToUse = tags.split(',');
    } else {
      // Fall back to documented valid tags from examples
      tagsToUse = [
        'urn:tag:genre:media:comedy',
        'urn:tag:genre:media:drama',
        'urn:tag:genre:media:action',
        'urn:tag:genre:media:thriller',
        'urn:tag:genre:media:sci_fi',
        'urn:tag:genre:media:horror'
      ];
    }
    
    let allEntities: QlooEntity[] = [];
    
    // Try each tag to gather results
    for (const tag of tagsToUse) {
      try {
        const params: Record<string, any> = {
          'filter.type': formattedEntityType,
          'filter.tags': tag,
          'take': 50
        };
        
        console.log(`Trying with tag: ${tag}`);
        const response = await qlooApi.get(`/v2/insights`, { 
          params
        });
        
        if (response.data?.results?.entities) {
          const newEntities = response.data.results.entities;
          
          // Add only entities we don't already have (based on entity_id)
          const existingIds = new Set(allEntities.map((e: any) => e.entity_id));
          const uniqueNewEntities = newEntities.filter((e: any) => !existingIds.has(e.entity_id));
          
          allEntities = [...allEntities, ...uniqueNewEntities];
          console.log(`Found ${uniqueNewEntities.length} new entities with tag ${tag}`);
          
          // If we have enough results, we can stop trying more tags
          if (allEntities.length >= 100) {
            break;
          }
        }
      } catch (error) {
        console.error(`Request with tag ${tag} failed:`, error);
        // Continue to the next tag
      }
    }
    
    // Client-side filtering based on the search query
    if (query && query.trim() !== '') {
      const cleanQuery = query.trim().toLowerCase();
      const searchTerms = cleanQuery.split(' ');
      
      console.log(`Client-side filtering with terms: ${searchTerms.join(', ')}`);
      
      // Strict filtering - require at least one search term to be present
      const filteredEntities = allEntities.filter((entity: any) => {
        // Check name
        const name = (entity.name || '').toLowerCase();
        
        // Check description
        const description = (entity.properties?.description || '').toLowerCase();
        
        // Check alternative names
        const akas = entity.properties?.akas || [];
        const altNames = akas.map((aka: any) => aka.value?.toLowerCase() || '');
        
        // Match if any search term is found in name, description, or alternative names
        return searchTerms.some(term => 
          term.trim() !== '' && (
            name.includes(term) || 
            description.includes(term) || 
            altNames.some((altName: string) => altName.includes(term))
          )
        );
      });
      
      // Sort by relevance (exact matches first)
      filteredEntities.sort((a: any, b: any) => {
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        
        // Exact matches first
        if (aName === cleanQuery && bName !== cleanQuery) return -1;
        if (bName === cleanQuery && aName !== cleanQuery) return 1;
        
        // Then matches that start with the query
        if (aName.startsWith(cleanQuery) && !bName.startsWith(cleanQuery)) return -1;
        if (bName.startsWith(cleanQuery) && !aName.startsWith(cleanQuery)) return 1;
        
        // Count how many search terms match each entity name
        const aTermMatches = searchTerms.filter(term => aName.includes(term)).length;
        const bTermMatches = searchTerms.filter(term => bName.includes(term)).length;
        
        if (aTermMatches > bTermMatches) return -1;
        if (bTermMatches > aTermMatches) return 1;
        
        // Then partial matches
        if (aName.includes(cleanQuery) && !bName.includes(cleanQuery)) return -1;
        if (bName.includes(cleanQuery) && !aName.includes(cleanQuery)) return 1;
        
        // Then by popularity if available
        if (a.popularity && b.popularity) {
          return b.popularity - a.popularity;
        }
        
        return 0;
      });
      
      console.log(`Filtered to ${filteredEntities.length} entities that match query "${cleanQuery}"`);
      return filteredEntities.slice(0, limit);
    }
    
    // If no query provided, return all entities up to the limit
    return allEntities.slice(0, limit);
    
  } catch (error) {
    console.error("All entity search attempts failed:", error);
    return [];
  }
}

/**
 * Get entity types supported by the API
 * 
 * @returns Array of entity types
 */
export async function getEntityTypes(): Promise<QlooEntityType[]> {
  try {
    // Check if API is configured
    if (!isApiConfigured()) {
      throw new Error('API key not configured. Please check your environment variables.');
    }
    
    // Return hardcoded list of common entity types from the documentation
    // since the entity-types endpoints are not working correctly
    const commonEntityTypes = [
      {
        id: 'urn:entity:movie',
        name: 'Movie'
      },
      {
        id: 'urn:entity:tv_show',
        name: 'TV Show'
      },
      {
        id: 'urn:entity:music_artist',
        name: 'Music Artist'
      },
      {
        id: 'urn:entity:music_album',
        name: 'Music Album'
      },
      {
        id: 'urn:entity:music_track',
        name: 'Music Track'
      },
      {
        id: 'urn:entity:book',
        name: 'Book'
      },
      {
        id: 'urn:entity:restaurant',
        name: 'Restaurant'
      },
      {
        id: 'urn:entity:podcast',
        name: 'Podcast'
      },
      {
        id: 'urn:entity:video_game',
        name: 'Video Game'
      },
      {
        id: 'urn:entity:hotel',
        name: 'Hotel'
      }
    ];
    
    console.log('Using pre-defined entity types list since API endpoints are not available');
    return commonEntityTypes;
  } catch (error) {
    console.error('Error fetching entity types:', error);
    // Return hardcoded list even on error to ensure functionality
    return [
      {
        id: 'urn:entity:movie',
        name: 'Movie'
      },
      {
        id: 'urn:entity:tv_show',
        name: 'TV Show'
      },
      {
        id: 'urn:entity:music_artist',
        name: 'Music Artist'
      }
    ];
  }
}

/**
 * Get trending entities (improved version with more signal options)
 * 
 * @param params Object containing filter parameters and signal options
 * @returns Array of trending entities
 */
export async function getTrendingEntitiesV2(params: {
  entity_type: string;
  limit?: number;
  signal_entity_id?: string;
  signal_tag?: string;
  include_tags?: boolean;
  include_properties?: boolean;
  include_popularity?: boolean;
  filters?: Record<string, any>;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}) {
  try {
    // Use insights endpoint for trending
    const insightsParams: Record<string, any> = {};
    
    // Add entity type filter
    insightsParams['filter.type'] = params.entity_type;
    
    // Add pagination/limit
    if (params.limit) {
      insightsParams.take = params.limit;
    }
    
    // Set up filters if provided
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        insightsParams[`filter.${key}`] = value;
      });
    }
    
    // Add signal parameter (required by the API)
    if (params.signal_entity_id) {
      // Check if this is a UUID format
      const isUuid = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(params.signal_entity_id);
      
      // Format entity ID properly
      let formattedEntityId = params.signal_entity_id;
      
      // Handle entity ID formatting
      if (isUuid) {
        // For UUID format, use it directly
        formattedEntityId = params.signal_entity_id;
      } else if (formattedEntityId.startsWith('urn:entity:')) {
        // If it already has the full URN prefix, use as is
        formattedEntityId = params.signal_entity_id;
      } else if (formattedEntityId.includes(':')) {
        // If it has a type prefix but not the full URN, add it
        formattedEntityId = `urn:entity:${params.signal_entity_id}`;
      } else {
        // Add full URN prefix with type
        formattedEntityId = `urn:entity:${params.entity_type}:${params.signal_entity_id}`;
      }
      
      // Add the formatted entity ID to the params
      insightsParams['signal.interests.entities'] = formattedEntityId;
    } else if (params.signal_tag) {
      // If a tag is provided, use it
      insightsParams['signal.interests.tags'] = params.signal_tag;
    } else {
      // Use a tag signal instead of entity ID to avoid validation errors
      // Common tags that should exist across different entity types
      const tagMap: Record<string, string> = {
        'urn:entity:movie': 'urn:tag:genre:media:action',
        'urn:entity:tv_show': 'urn:tag:genre:media:drama',
        'urn:entity:book': 'urn:tag:genre:media:fiction',
        'urn:entity:music_artist': 'urn:tag:genre:music:pop',
        'urn:entity:music_album': 'urn:tag:genre:music:rock',
        'urn:entity:music_track': 'urn:tag:genre:music:hip_hop',
        'urn:entity:podcast': 'urn:tag:genre:podcast:true_crime',
        'urn:entity:video_game': 'urn:tag:genre:game:action',
        'urn:entity:restaurant': 'urn:tag:cuisine:food:italian',
        'urn:entity:hotel': 'urn:tag:amenity:hotel:pool'
      };
      
      // Use a default tag based on entity type, or a generic tag if not found
      insightsParams['signal.interests.tags'] = tagMap[params.entity_type] || 'urn:tag:genre:media:popular';
    }
    
    // Include rich data if requested
    if (params.include_tags) {
      insightsParams['include.tags'] = true;
    }
    
    if (params.include_properties) {
      insightsParams['include.properties'] = true;
    }
    
    if (params.include_popularity) {
      insightsParams['include.popularity'] = true;
    }
    
    // Add sorting if provided
    if (params.sort_by) {
      insightsParams['sort.by'] = params.sort_by;
      if (params.sort_order) {
        insightsParams['sort.order'] = params.sort_order;
      }
    }
    
    console.log('Trending entities API params:', insightsParams);
    const queryString = buildQueryString(insightsParams);
    const response = await qlooApi.get(`/v2/insights${queryString}`);
    
    if (response.data?.results?.entities) {
      return response.data.results.entities;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching trending entities:', error);
    throw error;
  }
}

/**
 * Get trending entities from the Qloo API
 */
export async function getTrendingEntities(params: {
  entity_type?: string;
  limit?: number;
  period?: string;
} = {}): Promise<QlooTrendingEntity[]> {
  try {
    // Use the V2 implementation with proper defaults
    return getTrendingEntitiesV2({
      entity_type: params.entity_type || 'urn:entity:movie', // Provide a default entity_type
      limit: params.limit,
      include_tags: true,
      include_properties: true,
      include_popularity: true
    });
  } catch (error) {
    console.error('Error in getTrendingEntities:', error);
    throw error;
  }
}

/**
 * Get analysis for an entity
 * 
 * @param params Object containing entity type and ID
 * @returns Analysis result for the entity
 */
export async function getAnalysis(params: {
  entity_type: string;
  entity_value: string;
  subtype?: string;
  entity_name?: string; // Optional name for fallback
  tags?: any[]; // Optional tags for fallback
}): Promise<QlooAnalysisResult> {
  try {
    // Validate API configuration first
    if (!isApiConfigured()) {
      throw new Error('API key not configured. Please check your environment variables.');
    }

    // Format entity ID properly - ensure we don't double-format
    let entityValue = params.entity_value;
    const originalEntityId = entityValue;
    
    // Log the original entity parameters
    console.log('Entity analysis request:', {
      type: params.entity_type,
      value: entityValue,
      subtype: params.subtype,
      name: params.entity_name
    });
    
    // Format entity ID if needed
    if (!entityValue.startsWith('urn:entity:')) {
      // If it already has a type prefix but not the full URN
      if (entityValue.includes(':')) {
        entityValue = `urn:entity:${entityValue}`;
      } else {
        // If it has no prefix at all
        const entityType = params.subtype || params.entity_type;
        // Make sure we're not double-adding the entity type prefix
        if (entityType.startsWith('urn:entity:')) {
          entityValue = `${entityType}:${entityValue}`;
        } else {
          entityValue = `urn:entity:${entityType}:${entityValue}`;
        }
      }
    }
    
    // Ensure we don't have malformed URNs with double colons
    entityValue = entityValue.replace(/::+/g, ':');
    
    console.log('Using formatted entity ID:', entityValue);
    
    // Check if this is a UUID format
    const isUuid = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(originalEntityId);
    
    // Try multiple approaches to get the entity details
    let entity, tags, relatedEntities;
    let succeeded = false;
    let lastError: Error | null = null;
    let partialSuccess = false;
    
    // Approach 1: Try the /v2/entities endpoint with filter.id or /v2/analysis for UUIDs
    try {
      // For UUIDs, prefer direct entity lookup
      if (isUuid) {
        console.log('Using UUID approach for entity lookup');
        const requestParams: Record<string, any> = {
          'entity_ids': [originalEntityId],
          'include.tags': true
        };

        console.log('Trying approach 1A: /v2/analysis with entity_ids', requestParams);
        
        const response = await qlooApi.get('/v2/analysis', {
          params: requestParams
        });
        
        if (response.data?.success && response.data.results?.entities && response.data.results.entities.length > 0) {
          entity = response.data.results.entities[0];
          tags = response.data.results.tags || [];
          succeeded = true;
          console.log('Approach 1A succeeded');
        }
      } else {
        // For non-UUIDs, use filter.id approach
        const requestParams: Record<string, any> = {
          'filter.id': entityValue,
          'include.tags': true
        };

        const queryString = buildQueryString(requestParams);
        console.log('Trying approach 1B: /v2/entities with filter.id', requestParams);
        
        const response = await qlooApi.get(`/v2/entities${queryString}`);
        
        if (response.data?.success) {
          // Handle both single entity response and entities array response
          entity = response.data.results?.entity;
          if (!entity && response.data.results?.entities && response.data.results.entities.length > 0) {
            entity = response.data.results.entities[0];
          }
          
          if (entity) {
            tags = response.data.results.tags || [];
            succeeded = true;
            console.log('Approach 1B succeeded');
          }
        }
      }
    } catch (err: any) {
      console.log('Approach 1 failed:', err);
      lastError = new Error(err.message || 'Unknown error in approach 1');
    }
    
    // Approach 2: Try to get the entity via search (by name)
    if (!succeeded && params.entity_name) {
      try {
        console.log('Trying approach 2: search by name', params.entity_name);
        
        // Make sure we're using the correct entity type format for search
        let searchEntityType = params.entity_type;
        if (searchEntityType.startsWith('urn:entity:')) {
          searchEntityType = searchEntityType.replace('urn:entity:', '');
        }
        
        const searchResults = await searchEntities(searchEntityType, params.entity_name);
        
        if (searchResults && searchResults.length > 0) {
          console.log('Found entity via search:', searchResults[0].entity_id);
          
          // Use the found entity directly
          entity = searchResults[0];
          partialSuccess = true;
          
          // Try to get tags for this entity via insights
          const tagParams: Record<string, any> = {
            'filter.type': params.entity_type,
            'signal.interests.entities': entity.entity_id,
            'include.tags': true
          };
          
          try {
            const tagsResponse = await qlooApi.get(`/v2/insights${buildQueryString(tagParams)}`);
            tags = tagsResponse.data?.results?.tags || [];
            succeeded = true;
          } catch (err: any) {
            console.log('Failed to get tags for search result entity');
            tags = [];
          }
          
          console.log('Approach 2 succeeded');
        }
      } catch (err: any) {
        console.log('Approach 2 failed:', err);
        lastError = new Error(err.message || 'Unknown error in approach 2');
      }
    }
    
    // Approach 3: Fallback to trending entities
    if (!succeeded && !partialSuccess) {
      try {
        console.log('Trying approach 3: fallback to trending entities');
        const trending = await getTrendingEntitiesV2({
          entity_type: params.entity_type,
          limit: 1
        });
        
        if (trending && trending.length > 0) {
          console.log('Using trending entity as fallback:', trending[0].entity_id);
          
          entity = trending[0];
          tags = entity.tags || [];
          succeeded = true;
          console.log('Approach 3 succeeded (fallback)');
        }
      } catch (err: any) {
        console.log('Approach 3 failed:', err);
        lastError = new Error(err.message || 'Unknown error in approach 3');
      }
    }
    
    if (!succeeded && !partialSuccess) {
      throw new Error(`Entity not found in Qloo database. ${lastError?.message || ''}`);
    }

    // Now get related entities (if we have an entity)
    if (entity) {
      try {
        const relatedParams: Record<string, any> = {
          'filter.type': params.subtype || params.entity_type,
          'signal.interests.entities': entity.entity_id || entityValue,
          'include.tags': true,
          take: 10
        };

        const relatedQueryString = buildQueryString(relatedParams);
        const relatedResponse = await qlooApi.get(`/v2/insights${relatedQueryString}`);

        relatedEntities = relatedResponse.data?.results?.entities || [];
      } catch (err) {
        console.log('Failed to get related entities:', err);
        relatedEntities = [];
      }
    } else {
      relatedEntities = [];
    }

    // Return the complete analysis result
    return {
      entity,
      tags: tags || [],
      related_entities: relatedEntities || []
    };
  } catch (error: any) {
    console.error('Error getting entity analysis:', error);
    
    // Try to return a partial result if we have an entity ID and name
    if (params.entity_name) {
      try {
        // Create a minimal entity from the available data
        const minimalEntity: QlooEntity = {
          name: params.entity_name,
          entity_id: params.entity_value,
          type: params.entity_type,
          subtype: params.subtype || params.entity_type,
          properties: {
            description: 'Description not available. Entity details could not be fully retrieved.'
          },
          tags: params.tags || []
        };
        
        console.log('Returning minimal entity data as fallback:', minimalEntity);
        
        return {
          entity: minimalEntity,
          tags: params.tags || [],
          related_entities: []
        };
      } catch (fallbackError) {
        console.error('Failed to create fallback entity:', fallbackError);
      }
    }
    
    // If all else fails, throw the original error
    if (error.response?.status === 404 || error.message?.includes('Entity not found')) {
      // Throw a specific error for entity not found cases
      throw new Error(`Entity not found in Qloo database. ${error.message}`);
    } else {
      // For other errors
      throw new Error(`Failed to load entity analysis. ${error.message}`);
    }
  }
}

/**
 * Compare two entities
 * 
 * @param entity1Type Type of first entity
 * @param entity1Id ID of first entity
 * @param entity2Type Type of second entity
 * @param entity2Id ID of second entity
 * @returns Comparison data between the two entities
 */
export async function compareEntities(
  entity1Type: string, 
  entity1Id: string,
  entity2Type: string,
  entity2Id: string
) {
  try {
    const params = {
      'entity1.type': entity1Type,
      'entity1.id': entity1Id,
      'entity2.type': entity2Type,
      'entity2.id': entity2Id
    };
    
    const queryString = buildQueryString(params);
    const response = await qlooApi.get(`/v2/compare/${queryString}`);
    return response.data.results?.comparison || {};
  } catch (error) {
    console.error('Error comparing entities:', error);
    throw error;
  }
}

/**
 * Get recommendations based on entity or user
 * 
 * @param params Object containing recommendation parameters
 * @returns Array of recommendations
 */
export async function getRecommendations(params: {
  entity_type?: string;
  entity_value?: string;
  user_id?: string;
  limit?: number;
  filters?: Record<string, any>;
  subtype?: string;
}) {
  try {
    // Validate API configuration first
    if (!isApiConfigured()) {
      throw new Error('API key not configured. Please check your environment variables.');
    }
    
    if (!params.entity_type || !params.entity_value) {
      throw new Error('Entity type and value are required for recommendations');
    }
    
    // Format entity ID properly - ensure we don't double-format
    let entityValue = params.entity_value;
    
    // Log the original entity parameters
    console.log('Recommendations request:', {
      type: params.entity_type,
      value: entityValue,
      subtype: params.subtype
    });
    
    // Format entity ID if needed
    if (!entityValue.startsWith('urn:entity:')) {
      // If it already has a type prefix but not the full URN
      if (entityValue.includes(':')) {
        entityValue = `urn:entity:${entityValue}`;
      } else {
        // If it has no prefix at all
        const entityType = params.subtype || params.entity_type;
        entityValue = `urn:entity:${entityType}:${entityValue}`;
      }
    }
    
    // Use insights endpoint for recommendations
    const requestParams: Record<string, any> = {};
    
    // Add pagination/limit
    if (params.limit) {
      requestParams.take = params.limit;
    }
    
    // Set up filters if provided
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        requestParams[`filter.${key}`] = value;
      });
    }
    
    // Add filter for entity type if subtype is provided
    if (params.subtype) {
      requestParams['filter.type'] = params.subtype;
    } else if (params.entity_type) {
      requestParams['filter.type'] = params.entity_type;
    }
    
    // Add signal parameter (required by the API)
    requestParams['signal.interests.entities'] = entityValue;
    
    // Include tags in response
    requestParams['include.tags'] = true;
    
    console.log('Making recommendations request with params:', requestParams);
    
    // Make the API request
    const queryString = buildQueryString(requestParams);
    const response = await qlooApi.get(`/v2/insights${queryString}`);
    
    if (!response.data?.success) {
      throw new Error('Failed to get recommendations from API');
    }
    
    return response.data?.results?.entities || [];
  } catch (error: any) {
    console.error('Error getting recommendations:', error);
    throw new Error(`Failed to load recommendations: ${error.message}`);
  }
}

/**
 * Get audiences for an entity
 * 
 * @param entityType Type of entity
 * @param entityId ID of entity
 * @param limit Maximum number of results
 * @returns Array of audiences
 */
export async function getAudiences(entityType: string, entityId: string, limit: number = 10) {
  try {
    const params = {
      'filter.type': entityType,
      'filter.id': entityId,
      take: limit
    };
    
    const queryString = buildQueryString(params);
    const response = await qlooApi.get(`/v2/audiences/${queryString}`);
    return response.data.results?.audiences || [];
  } catch (error) {
    console.error('Error fetching audiences:', error);
    throw error;
  }
}

/**
 * Get tag types supported by the API
 * 
 * @returns Array of tag types
 */
export async function getTagTypes(): Promise<QlooTagType[]> {
  try {
    const response = await qlooApi.get('/v2/tags/types');
    if (response.data?.results?.types) {
      return response.data.results.types;
    }
  } catch (error) {
    console.warn('Primary /v2/tags/types endpoint failed, falling back to hardcoded list:', error);
  }

  // Fallback to a hardcoded list if the endpoint fails or returns no data
  return [
    { id: 'urn:tag:genre', name: 'Genre' },
    { id: 'urn:tag:interest', name: 'Interest' },
    { id: 'urn:tag:profession', name: 'Profession' },
    { id: 'urn:tag:media', name: 'Media' },
    { id: 'urn:tag:brand', name: 'Brand' },
  ];
}

/**
 * Search for tags by type and query string
 * 
 * @param tagType The type of tag to search for
 * @param query Search query string
 * @param limit Maximum number of results to return
 * @returns Array of matching tags
 */
export async function searchTags(tagType: string, query: string, limit: number = 10) {
  try {
    // First try API call
    try {
      const response = await qlooApi.get('/v2/tags', {
        params: {
          'filter.type': tagType,
          'q': query,
          'take': limit
        }
      });
      
      if (response.data?.success && 
          response.data.results?.tags && 
          response.data.results.tags.length > 0) {
        return response.data.results.tags;
      }
    } catch (error) {
      console.log('API tag search failed, falling back to predefined tags');
    }
    
    // Fallback to predefined tags when API fails or returns no results
    console.log(`Using predefined tags for type: ${tagType}`);
    const predefinedResults = getPredefinedTags(tagType, query);
    return predefinedResults.slice(0, limit);
  } catch (error) {
    console.error("Error searching tags:", error);
    // Fallback to predefined tags on any error
    return getPredefinedTags(tagType, query).slice(0, limit);
  }
}

/**
 * Get audience types supported by the API
 * 
 * @returns Array of audience types
 */
export async function getAudienceTypes() {
  try {
    const response = await qlooApi.get('/v2/audience-types');
    return response.data.results?.types || [];
  } catch (error) {
    console.error('Error fetching audience types:', error);
    throw error;
  }
}

/**
 * Get detailed information about a specific entity
 * 
 * @param entityType Type of entity (e.g., "urn:entity:movie")
 * @param entityId ID of the entity
 * @param includePopularity Whether to include popularity (default: true)
 * @param includeTags Whether to include tags (default: true)
 * @param includeMetrics Whether to include audience metrics (default: true)
 * @returns Detailed entity information
 */
export async function getEntityDetails(
  entityType: string,
  entityId: string,
  includePopularity: boolean = true,
  includeTags: boolean = true,
  includeMetrics: boolean = true
): Promise<QlooEntity> {
  try {
    // Format entity ID properly if needed
    let formattedEntityId = entityId;
    
    // Extract just the UUID if it's in a URN format
    if (formattedEntityId.includes('urn:entity:')) {
      // Extract the UUID part from the URN
      const parts = formattedEntityId.split(':');
      formattedEntityId = parts[parts.length - 1];
    }
    
    const params: Record<string, any> = {
      'filter.id': formattedEntityId
    };
    
    // Add entity type filter
    if (entityType) {
      params['filter.type'] = entityType;
    }
    
    if (includePopularity) {
      params['include.popularity'] = true;
    }
    
    if (includeTags) {
      params['include.tags'] = true;
    }
    
    if (includeMetrics) {
      params['include.metrics'] = 'audience_growth';
    }
    
    console.log('Getting entity details with params:', params);
    const queryString = buildQueryString(params);
    
    try {
      const response = await qlooApi.get(`/v2/entities${queryString}`);
      
      // Handle both single entity response and entities array response
      let entity = response.data.results?.entity;
      
      if (!entity && response.data.results?.entities && response.data.results.entities.length > 0) {
        entity = response.data.results.entities[0];
      }
      
      if (!entity) {
        console.error('Entity not found:', entityId, entityType);
        throw new Error(`Entity not found in Qloo's database`);
      }
      
      // If the entity has properties but doesn't have certain expected fields, ensure they're at least initialized
      if (entity && entity.properties) {
        // Ensure image structure exists
        if (!entity.properties.image) {
          entity.properties.image = { url: '' };
        }
        
        // Ensure description exists
        if (!entity.properties.description) {
          entity.properties.description = '';
        }
      }
      
      return entity;
    } catch (apiError: any) {
      // Handle API-specific errors
      if (apiError.response?.status === 404) {
        throw new Error(`Entity not found in Qloo's database`);
      } else if (apiError.response?.status === 403) {
        throw new Error(`You don't have permission to access this entity. Please check your API key permissions.`);
      } else if (apiError.response?.status === 401) {
        throw new Error(`Authentication failed. Please check your API key.`);
      } else if (apiError.response?.status === 429) {
        throw new Error(`API rate limit exceeded. Please try again later.`);
      }
      
      // Re-throw the original error if it doesn't match any of our specific cases
      throw apiError;
    }
  } catch (error: any) {
    console.error('Error fetching entity details:', error);
    throw error;
  }
}

/**
 * Find entities by external ID from services like Netflix, IMDb, etc.
 * 
 * @param service External service name (e.g., "netflix", "imdb")
 * @param serviceId ID of the entity in the external service
 * @param limit Maximum number of results to return
 * @returns Array of matching entities
 */
export async function findByExternalId(
  service: string,
  serviceId: string,
  limit: number = 1
) {
  try {
    const params: Record<string, any> = {
      [`filter.external.${service}`]: serviceId,
      take: limit
    };
    
    const queryString = buildQueryString(params);
    const response = await qlooApi.get(`/v2/entities${queryString}`);
    return response.data.results?.entities || [];
  } catch (error) {
    console.error(`Error finding entity by ${service} ID:`, error);
    throw error;
  }
}

/**
 * Get rating information for an entity from various sources
 * 
 * @param entityType Type of entity
 * @param entityId ID of entity
 * @returns Object with ratings from different sources
 */
export async function getEntityRatings(entityType: string, entityId: string) {
  try {
    const entity = await getEntityDetails(entityType, entityId);
    
    if (!entity.external) {
      return {};
    }
    
    // Extract ratings from external sources
    const ratings: Record<string, any> = {};
    
    if (entity.external.imdb && entity.external.imdb[0]?.user_rating) {
      ratings.imdb = {
        score: entity.external.imdb[0].user_rating,
        count: entity.external.imdb[0].user_rating_count
      };
    }
    
    if (entity.external.metacritic && entity.external.metacritic[0]) {
      const metacritic = entity.external.metacritic[0];
      ratings.metacritic = {
        criticScore: metacritic.critic_rating,
        userScore: metacritic.user_rating
      };
    }
    
    if (entity.external.rottentomatoes && entity.external.rottentomatoes[0]) {
      const rt = entity.external.rottentomatoes[0];
      ratings.rottenTomatoes = {
        criticScore: rt.critic_rating,
        criticCount: rt.critic_rating_count,
        userScore: rt.user_rating,
        userCount: rt.user_rating_count
      };
    }
    
    return ratings;
  } catch (error) {
    console.error('Error fetching entity ratings:', error);
    throw error;
  }
}

/**
 * Get alternative language titles for an entity
 * 
 * @param entityType Type of entity
 * @param entityId ID of entity
 * @returns Object with language codes as keys and titles as values
 */
export async function getEntityLanguageTitles(entityType: string, entityId: string) {
  try {
    const entity = await getEntityDetails(entityType, entityId);
    
    if (!entity.properties?.akas || entity.properties.akas.length === 0) {
      return {};
    }
    
    const languageTitles: Record<string, string[]> = {};
    
    entity.properties.akas.forEach((aka: any) => {
      if (aka.languages && aka.languages.length > 0 && aka.value) {
        aka.languages.forEach((lang: string) => {
          if (!languageTitles[lang]) {
            languageTitles[lang] = [];
          }
          
          if (!languageTitles[lang].includes(aka.value)) {
            languageTitles[lang].push(aka.value);
          }
        });
      }
    });
    
    return languageTitles;
  } catch (error) {
    console.error('Error fetching entity language titles:', error);
    throw error;
  }
}

/**
 * Get entities by streaming service availability
 * 
 * @param streamingService Streaming service name (e.g., "netflix", "hulu")
 * @param entityType Optional entity type filter (e.g., "urn:entity:movie")
 * @param limit Maximum number of results to return
 * @returns Array of entities available on the specified streaming service
 */
export async function getEntitiesByStreamingService(
  streamingService: string,
  entityType?: string,
  limit: number = 20
) {
  try {
    const tagId = `urn:tag:streaming_service:media:${streamingService.toLowerCase().replace(/\s+/g, '_')}`;
    
    const params: Record<string, any> = {
      'filter.tags': tagId,
      take: limit
    };
    
    if (entityType) {
      params['filter.type'] = entityType;
    }
    
    const queryString = buildQueryString(params);
    const response = await qlooApi.get(`/v2/entities/${queryString}`);
    return response.data.results?.entities || [];
  } catch (error) {
    console.error(`Error fetching entities by streaming service ${streamingService}:`, error);
    throw error;
  }
}

/**
 * Get entities by multiple tags (AND condition)
 * 
 * @param tagIds Array of tag IDs to filter by
 * @param entityType Optional entity type filter
 * @param limit Maximum number of results to return
 * @returns Array of entities matching all specified tags
 */
export async function getEntitiesByMultipleTags(
  tagIds: string[],
  entityType?: string,
  limit: number = 20
) {
  try {
    if (!tagIds || tagIds.length === 0) {
      throw new Error('At least one tag ID must be provided');
    }
    
    const params: Record<string, any> = {
      'filter.tags': tagIds.join(','),
      take: limit
    };
    
    if (entityType) {
      params['filter.type'] = entityType;
    }
    
    const queryString = buildQueryString(params);
    const response = await qlooApi.get(`/v2/entities/${queryString}`);
    return response.data.results?.entities || [];
  } catch (error) {
    console.error('Error fetching entities by multiple tags:', error);
    throw error;
  }
}

/**
 * Get audience growth trend for an entity
 * 
 * @param entityType Type of entity
 * @param entityId ID of entity
 * @returns Audience growth metric if available
 */
export async function getEntityAudienceGrowth(entityType: string, entityId: string) {
  try {
    const params: Record<string, any> = {
      'filter.type': entityType,
      'filter.id': entityId,
      'include.metrics': 'audience_growth'
    };
    
    const queryString = buildQueryString(params);
    const response = await qlooApi.get(`/v2/entities/${queryString}`);
    
    const entity = response.data.results?.entity;
    return entity?.query?.measurements?.audience_growth;
  } catch (error) {
    console.error('Error fetching entity audience growth:', error);
    throw error;
  }
}

/**
 * Helper function to check if API is properly configured
 * 
 * @returns Boolean indicating if API key is set
 */
export function isApiConfigured(): boolean {
  const isConfigured = !!QLOO_API_KEY;
  
  if (!isConfigured) {
    console.error(`
      ======================================
      QLOO API CONFIGURATION ERROR
      ======================================
      API key is missing. Please follow these steps:
      
      1. Create a .env.local file in your project root
      2. Add the following lines:
         NEXT_PUBLIC_QLOO_API_URL=https://hackathon.api.qloo.com
         NEXT_PUBLIC_QLOO_API_KEY=your_api_key_here
      
      3. Restart your development server
      
      If you don't have an API key, contact Qloo to request one.
      ======================================
    `);
  }
  
  return isConfigured;
}

export default {
  getInsights,
  getAnalysis,
  compareEntities,
  searchEntities,
  getTrendingEntitiesV2,
  getEntityTypes,
  getRecommendations,
  getAudiences,
  getTagTypes,
  searchTags,
  getAudienceTypes,
  isApiConfigured,
  getEntityDetails,
  findByExternalId,
  getEntityRatings,
  getEntityLanguageTitles,
  getEntitiesByStreamingService,
  getEntitiesByMultipleTags,
  getEntityAudienceGrowth
}; 