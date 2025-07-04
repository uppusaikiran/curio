'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { motion } from 'framer-motion';
import { searchEntities, getEntityTypes, isApiConfigured } from '@/lib/qlooService';
import { QlooEntityType, QlooEntity } from '@/types/qloo';
import axios from 'axios';
import ApiTroubleshooter from './ApiTroubleshooter';
import PreselectedTagsSelector, { SelectOption } from './PreselectedTagsSelector';

interface EntitySearchProps {
  onEntitySelect: (entity: QlooEntity) => void;
}

export default function EntitySearch({ onEntitySelect }: EntitySearchProps) {
  const [entityTypes, setEntityTypes] = useState<QlooEntityType[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<QlooEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<SelectOption[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch entity types on component mount
  useEffect(() => {
    async function fetchEntityTypes() {
      try {
        setError(null);
        setIsLoading(true);
        
        // Check if API is configured
        const apiKeyValue = process.env.NEXT_PUBLIC_QLOO_API_KEY;
        const apiUrl = process.env.NEXT_PUBLIC_QLOO_API_URL || 'https://hackathon.api.qloo.com';
        setApiKey(apiKeyValue || null);
        
        if (!apiKeyValue) {
          throw new Error('API key not configured. Please check your environment variables.');
        }
        
        // Try primary endpoint first
        try {
          const types = await getEntityTypes();
          if (types && types.length > 0) {
            setEntityTypes(types);
            
            // Auto-select the first entity type if available
            if (types.length > 0) {
              setSelectedType(types[0].id);
            }
            return;
          }
        } catch (primaryErr) {
          console.error('Primary entity types endpoint failed:', primaryErr);
          // Fall through to try alternative endpoint
        }
        
        // Try alternative endpoint
        try {
          console.log('Trying alternative entity types endpoint...');
          const response = await axios.get(`${apiUrl}/v2/entity-types`, {
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': apiKeyValue
            }
          });
          
          const types = response.data.results?.types || [];
          if (types && types.length > 0) {
            setEntityTypes(types);
            
            // Auto-select the first entity type if available
            if (types.length > 0) {
              setSelectedType(types[0].id);
            }
            return;
          }
        } catch (altErr) {
          console.error('Alternative entity types endpoint failed:', altErr);
          throw new Error('Both entity type endpoints failed. Please check your API key and connection.');
        }
      } catch (err: any) {
        console.error('Failed to load entity types:', err);
        setError(err.message || 'Failed to load entity types. Please check your API key and connection.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntityTypes();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!selectedType) return;
    
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    
    try {
      // Include selected tags in the search parameters
      const tagsString = selectedTags.map(tag => tag.value).join(',');
      
      // Ensure we have either a search query or tags selected
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery && !tagsString) {
        throw new Error('Please enter a search term or select tags to filter results');
      }
      
      // Build parameters object
      const params = {
        entityType: selectedType,
        query: trimmedQuery,
        tags: tagsString || undefined,
      };
      
      console.log('Searching with parameters:', params);
      
      // Perform the search
      const results = await searchEntities(selectedType, trimmedQuery, 10, tagsString || undefined);
      
      if (results.length === 0) {
        setError(`No results found for "${trimmedQuery}". Try a different search term or entity type.`);
      } else {
        setSearchResults(results);
      }
    } catch (err: any) {
      console.error('Search failed:', err);
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle entity type change
  const handleEntityTypeChange = (option: any) => {
    setSelectedType(option.value);
    setSearchResults([]);
  };

  // Create options for the dropdown
  const entityTypeOptions = entityTypes.map(type => ({
    value: type.id,
    label: type.name
  }));

  // Handle tag selection change
  const handleTagsChange = (tags: SelectOption[]) => {
    setSelectedTags(tags);
  };

  // Retry loading entity types
  const handleRetryEntityTypes = async () => {
    setEntityTypes([]);
    setSelectedType(null);
    setError(null);
    
    const apiKeyValue = process.env.NEXT_PUBLIC_QLOO_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_QLOO_API_URL || 'https://hackathon.api.qloo.com';
    
    setIsLoading(true);
    try {
      // Try direct API call to entity-types endpoint
      const response = await axios.get(`${apiUrl}/v2/entity-types`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKeyValue || ''
        }
      });
      
      const types = response.data.results?.types || [];
      setEntityTypes(types);
      
      if (types.length > 0) {
        setSelectedType(types[0].id);
      }
    } catch (err: any) {
      console.error('Retry failed:', err);
      setError(`Retry failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Entity Search</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          {error.includes('API key') && (
            <p className="mt-2 text-sm">
              Make sure you have set NEXT_PUBLIC_QLOO_API_KEY in your .env.local file.
            </p>
          )}
          <button 
            onClick={handleRetryEntityTypes}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-2 rounded"
          >
            Retry
          </button>
        </div>
      )}
      
      {!error && !isLoading && entityTypes.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          No entity types found. This might be an API configuration issue.
          <button 
            onClick={handleRetryEntityTypes}
            className="ml-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-1 px-2 rounded"
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Entity Type</label>
        <Select
          options={entityTypeOptions}
          onChange={handleEntityTypeChange}
          value={entityTypeOptions.find(option => option.value === selectedType)}
          isDisabled={isLoading || entityTypes.length === 0}
          placeholder={isLoading ? "Loading entity types..." : entityTypes.length === 0 ? "No entity types available" : "Select entity type"}
          className="basic-single"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Search Query</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter search terms..."
          className="w-full p-2 border border-gray-300 rounded"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
        </button>
        
        {showAdvancedFilters && (
          <div className="mt-2 p-3 border rounded border-gray-200">
            <PreselectedTagsSelector 
              onTagsChange={handleTagsChange} 
              filterParam="filter.tags"
              label="Filter by Tags"
            />
            <p className="mt-2 text-xs text-gray-500">
              Select tags to filter search results. These are prepopulated tags that don't require API permission.
            </p>
          </div>
        )}
      </div>
      
      <button
        onClick={handleSearch}
        disabled={isLoading || !selectedType || (!searchQuery.trim() && selectedTags.length === 0)}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
      
      <div className="text-xs text-gray-500 mt-2">
        {searchQuery.trim() && selectedType ? 
          `Searching for "${searchQuery.trim()}" in ${entityTypeOptions.find(opt => opt.value === selectedType)?.label || selectedType}` : 
          'Enter a search term or select tags to filter results'}
        {selectedTags.length > 0 && ' with selected tags'}
      </div>
      
      {searchResults.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Results</h3>
          <div className="space-y-2">
            {searchResults.map((entity, index) => (
              <motion.div
                key={entity.entity_id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => onEntitySelect(entity)}
              >
                <div className="font-medium">{entity.name}</div>
                {entity.type && <div className="text-sm text-gray-500">{entity.type}</div>}
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* API Troubleshooter */}
      <ApiTroubleshooter />
    </div>
  );
} 