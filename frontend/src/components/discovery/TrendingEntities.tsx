'use client';

import { useState, useEffect } from 'react';
import { 
  getTrendingEntitiesV2, 
  getAnalysis, 
  getRecommendations,
  isApiConfigured,
  getEntityDetails
} from '@/lib/qlooService';
import { QlooTrendingEntity, QlooEntity, QlooAnalysisResult } from '@/types/qloo';
import Image from 'next/image';
import { getEntityImage } from '@/lib/utils';

// Define a proper error type
interface EntityError {
  message: string;
  entity?: QlooTrendingEntity;
  details?: any;
}

export default function TrendingEntities({ onEntitySelect }: { onEntitySelect?: (entity: QlooTrendingEntity) => void }) {
  const [entities, setEntities] = useState<QlooTrendingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<EntityError | null>(null);
  const [entityType, setEntityType] = useState<string>('urn:entity:movie');
  const [period, setPeriod] = useState<string>('week');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<QlooTrendingEntity | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [entityDetails, setEntityDetails] = useState<QlooEntity | null>(null);
  const [analysisResult, setAnalysisResult] = useState<QlooAnalysisResult | null>(null);
  const [relatedEntities, setRelatedEntities] = useState<QlooEntity[] | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const entityTypeOptions = [
    { value: 'urn:entity:movie', label: 'Movies' },
    { value: 'urn:entity:tv_show', label: 'TV Shows' },
    { value: 'urn:entity:music_artist', label: 'Music Artists' },
    { value: 'urn:entity:book', label: 'Books' },
    { value: 'urn:entity:video_game', label: 'Video Games' }
  ];
  
  const periodOptions = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];
  
  useEffect(() => {
    async function fetchTrendingEntities() {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      setSelectedEntity(null);
      setEntityDetails(null);
      setRelatedEntities(null);
      
      try {
        // Check if API is configured properly
        if (!isApiConfigured()) {
          throw new Error('API key is missing. Please set NEXT_PUBLIC_QLOO_API_KEY in your environment variables.');
        }
        
        const result = await getTrendingEntitiesV2({
          entity_type: entityType,
          limit: 12,
          include_tags: true,
          include_properties: true,
          include_popularity: true,
          // Custom parameter for period handling via filters if needed
          filters: period ? { 'time_period': period } : undefined
        });
        
        console.log('Trending entities result:', result);
        
        if (!result || result.length === 0) {
          setError({
            message: 'No trending entities found. Try changing the entity type or time period.'
          });
        } else {
          setEntities(result);
        }
      } catch (err: any) {
        console.error('Error fetching trending entities:', err);
        setError({
          message: err.message,
          details: err.response?.data
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTrendingEntities();
  }, [entityType, period]);
  
  // Handle any errors detected on page load
  useEffect(() => {
    const checkApiConfiguration = async () => {
      const apiConfigured = await isApiConfigured();
      if (!apiConfigured) {
        setError({
          message: 'Qloo API is not configured. Please set your API key in the environment variables.'
        });
      }
    };
    
    checkApiConfiguration();
  }, []);
  
  const handleRefresh = () => {
    // Trigger a re-render by changing the entityType or period
    // This will cause the useEffect to run again
    const currentEntityType = entityType;
    setEntityType('');
    setTimeout(() => {
      setEntityType(currentEntityType);
    }, 10);
  };
  
  const handleEntitySelect = async (entity: QlooTrendingEntity) => {
    setSelectedEntity(entity);
    setLoadingDetails(true);
    setError(null); // Clear any previous errors
    setShowDebug(false); // Hide any previous debug info
    setEntityDetails(null);
    setAnalysisResult(null);
    setRelatedEntities(null);
    
    // Call the onEntitySelect prop if provided
    if (onEntitySelect) {
      onEntitySelect(entity);
    }
    
    try {
      console.log('Fetching details for entity:', JSON.stringify(entity, null, 2));
      
      if (!entity.entity_id) {
        throw new Error('Entity ID is missing');
      }
      
      // Check if this is a UUID format
      const isUuid = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(entity.entity_id);
      
      // Get entity details
      const details = await getEntityDetails(
        entity.subtype || entity.type || 'urn:entity:movie', 
        entity.entity_id
      );
      
      setEntityDetails(details);
      
      // Get entity analysis
      const analysis = await getAnalysis({
        entity_type: entity.subtype || entity.type || 'urn:entity:movie',
        entity_value: entity.entity_id,
        entity_name: entity.name // Provide name for fallback
      });
      
      setAnalysisResult(analysis);
      setRelatedEntities(analysis.related_entities || []);
      
      setLoadingDetails(false);
    } catch (error: any) {
      console.error('Error loading entity details:', error);
      setLoadingDetails(false);
      
      // Handle specific error types
      if (error.response?.status === 403) {
        setError({
          message: `Failed to load entity analysis. You don't have permission to access this entity. Please check your API key permissions.`,
          entity: entity,
          details: error.response?.data || error.message
        });
      } else if (error.response?.status === 404 || error.message?.includes('Entity not found in Qloo')) {
        // Only log to console, don't show to user
        console.log('Entity not found in Qloo database:', entity.entity_id);
        // Don't set error message for the user
      } else {
        setError({
          message: `Failed to load entity analysis. ${error.message || 'Unknown error occurred'}`,
          entity: entity,
          details: error.response?.data || error.message
        });
      }
    }
  };
  
  const handleRetry = async () => {
    // If we have a selected entity, try fetching details again
    if (selectedEntity) {
      await handleEntitySelect(selectedEntity);
    } else {
      // Otherwise refresh the entire list
      handleRefresh();
    }
  };
  
  const handleCloseDetails = () => {
    setSelectedEntity(null);
    setEntityDetails(null);
    setAnalysisResult(null);
    setRelatedEntities(null);
    setError(null);
  };
  
  const getEntityColor = (entity: QlooTrendingEntity) => {
    // Generate a consistent color based on entity name
    const name = entity.name || 'Unknown';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };
  
  const renderEntityCard = (entity: QlooTrendingEntity, index: number) => {
    const entityColor = getEntityColor(entity);
    
    return (
      <div 
        key={`${entity.entity_id || entity.name || index}`} 
        className="relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        onClick={() => handleEntitySelect(entity)}
        style={{ 
          background: `linear-gradient(to bottom, ${entityColor}, white)`,
        }}
      >
        <div className="relative h-48 overflow-hidden">
          {/* Entity image */}
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <img 
              src={getEntityImage(entity)} 
              alt={entity.name || 'Entity'} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Rank badge */}
          {entity.rank && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              #{entity.rank}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate">{entity.name || 'Unnamed Entity'}</h3>
          
          {entity.properties?.description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{entity.properties.description}</p>
          )}
          
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {entity.type?.split(':').pop()?.replace(/_/g, ' ') || 'Unknown Type'}
            </span>
            
            {entity.score && (
              <div className="flex items-center">
                <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium">{(entity.score * 10).toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderEntityList = (entity: QlooTrendingEntity, index: number) => {
    return (
      <div 
        key={`${entity.entity_id || entity.name || index}`} 
        className="flex border-b last:border-b-0 py-4 px-2 hover:bg-gray-50 cursor-pointer"
        onClick={() => handleEntitySelect(entity)}
      >
        <div className="flex-shrink-0 w-16 h-24 bg-gray-200 mr-4 overflow-hidden">
          <img 
            src={getEntityImage(entity)} 
            alt={entity.name || 'Entity'} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{entity.name || 'Unnamed Entity'}</h3>
            {entity.rank && (
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                #{entity.rank}
              </span>
            )}
          </div>
          
          {entity.properties?.description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{entity.properties.description}</p>
          )}
          
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {entity.type?.split(':').pop()?.replace(/_/g, ' ') || 'Unknown Type'}
            </span>
            
            {entity.score && (
              <div className="flex items-center">
                <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium">{(entity.score * 10).toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderEntityDetails = () => {
    if (!selectedEntity) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <div className="flex justify-end p-2">
            <button 
              onClick={handleCloseDetails}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {loadingDetails ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    {error.message}
                    {showDebug && debugInfo && (
                      <button 
                        onClick={() => setShowDebug(false)} 
                        className="text-xs ml-2 text-qloo-teal hover:text-qloo-teal/80"
                      >
                        (Hide Debug Info)
                      </button>
                    )}
                    {!showDebug && debugInfo && (
                      <button 
                        onClick={() => setShowDebug(true)} 
                        className="text-xs ml-2 text-qloo-teal hover:text-qloo-teal/80"
                      >
                        (Show Debug Info)
                      </button>
                    )}
                    <div className="mt-2 text-sm">
                      <button 
                        onClick={() => {
                          setLoading(true);
                          setError(null);
                          handleRefresh();
                        }}
                        className="text-qloo-teal hover:text-qloo-teal/80 underline mr-3"
                      >
                        Retry
                      </button>
                      <span className="text-muted-foreground">
                        {error.message.includes('API rate limit') && "API rate limits may reset after a few minutes."}
                        {error.message.includes('invalid entity ids') && "This may be due to incorrect entity ID formatting or API configuration."}
                        {!error.message.includes('API rate limit') && !error.message.includes('invalid entity ids') && 
                          "If the issue persists, check your API configuration or try again later."}
                      </span>
                    </div>
                    {showDebug && debugInfo && (
                      <div className="mt-4 p-3 bg-gray-100 rounded overflow-auto max-h-48 text-xs text-gray-800 font-mono">
                        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Still show basic entity info */}
              <div className="flex flex-col md:flex-row gap-6 mt-4">
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <div className="bg-gray-200 rounded-lg overflow-hidden aspect-[2/3]">
                    <img 
                      src={getEntityImage(selectedEntity)} 
                      alt={selectedEntity.name || 'Entity'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-2/3">
                  <h2 className="text-2xl font-bold">{selectedEntity.name}</h2>
                  
                  {selectedEntity.properties?.description && (
                    <p className="text-gray-600 mt-2">{selectedEntity.properties.description}</p>
                  )}
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {selectedEntity.type?.split(':').pop()?.replace(/_/g, ' ') || 'Unknown Type'}
                    </span>
                    
                    {selectedEntity.rank && (
                      <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                        Rank #{selectedEntity.rank}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Entity image */}
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <div className="bg-gray-200 rounded-lg overflow-hidden aspect-[2/3]">
                    <img 
                      src={getEntityImage(selectedEntity)} 
                      alt={selectedEntity.name || 'Entity'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Entity details */}
                <div className="w-full md:w-2/3">
                  <h2 className="text-2xl font-bold">{entityDetails?.name || selectedEntity.name}</h2>
                  
                  {(entityDetails?.properties?.description || selectedEntity.properties?.description) && (
                    <p className="text-gray-600 mt-2">{entityDetails?.properties?.description || selectedEntity.properties?.description}</p>
                  )}
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {(entityDetails?.subtype || selectedEntity.subtype || entityDetails?.type || selectedEntity.type || '')
                        .split(':').pop()?.replace(/_/g, ' ') || 'Unknown Type'}
                    </span>
                    
                    {selectedEntity.rank && (
                      <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                        Rank #{selectedEntity.rank}
                      </span>
                    )}
                    
                    {(entityDetails?.popularity || selectedEntity.score) && (
                      <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {((entityDetails?.popularity || selectedEntity.score || 0) * 10).toFixed(1)}
                      </span>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {analysisResult?.tags && analysisResult.tags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.tags.slice(0, 15).map((tag, index) => (
                          <span 
                            key={tag.id || index} 
                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                            style={{
                              opacity: 0.5 + (tag.score * 0.5), // Higher score = more opaque
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Audiences */}
                  {analysisResult?.audiences && analysisResult.audiences.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Target Audiences</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.audiences.slice(0, 8).map((audience, index) => (
                          <span 
                            key={audience.id || index} 
                            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                            style={{
                              opacity: 0.5 + (audience.score * 0.5), // Higher score = more opaque
                            }}
                          >
                            {audience.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Related entities */}
              {relatedEntities && relatedEntities.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">You may also like</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {relatedEntities.map((entity, index) => {
                      // Get image URL from entity properties or generate a placeholder
                      const imageUrl = entity.properties?.image?.url || 
                        `https://picsum.photos/seed/${encodeURIComponent(entity.entity_id || entity.name)}/200/300`;
                      
                      return (
                        <div 
                          key={entity.entity_id || index} 
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="h-32 bg-gray-200">
                            <img 
                              src={imageUrl}
                              alt={entity.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-2">
                            <h4 className="font-medium text-sm truncate">{entity.name}</h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
        <div className="font-bold text-2xl">{entityTypeOptions.find(o => o.value === entityType)?.label}</div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <select 
              value={entityType} 
              onChange={(e) => setEntityType(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              {entityTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-1 border border-gray-300 rounded-md">
            <button
              className={`px-2 py-1 text-xs rounded-l-md ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={`px-2 py-1 text-xs rounded-r-md ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          
          <button 
            className="bg-gray-100 hover:bg-gray-200 rounded-md p-1 text-sm"
            onClick={handleRefresh}
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <div className="text-center">
              <div className="inline-block animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
              <div>Loading trending {entityTypeOptions.find(o => o.value === entityType)?.label.toLowerCase()}...</div>
            </div>
          </div>
        )}
        
        {error && !selectedEntity && (
          <div className="border border-red-300 bg-red-50 rounded-md p-4 text-center">
            <div className="text-red-600 mb-2">{error.message}</div>
            <button 
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Retry
            </button>
            {showDebug && debugInfo && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-left overflow-auto max-h-60">
                <button 
                  onClick={() => setShowDebug(false)}
                  className="text-gray-500 hover:text-gray-700 text-xs underline mb-1 block"
                >
                  Hide Debug Info
                </button>
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
            {!showDebug && debugInfo && (
              <button 
                onClick={() => setShowDebug(true)}
                className="text-gray-500 hover:text-gray-700 text-xs underline mt-2 block mx-auto"
              >
                Show Debug Info
              </button>
            )}
          </div>
        )}
        
        {error && selectedEntity && (
          <div className="border border-red-300 bg-red-50 rounded-md p-4 text-center mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl font-bold">{selectedEntity.name}</div>
              <button 
                onClick={handleCloseDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="text-red-600 mb-4">{error.message}</div>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={handleRetry}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Retry
              </button>
              <button 
                onClick={handleCloseDetails}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors"
              >
                Go Back
              </button>
            </div>
            {showDebug && debugInfo && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-left overflow-auto max-h-60">
                <button 
                  onClick={() => setShowDebug(false)}
                  className="text-gray-500 hover:text-gray-700 text-xs underline mb-1 block"
                >
                  Hide Debug Info
                </button>
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
            {!showDebug && debugInfo && (
              <button 
                onClick={() => setShowDebug(true)}
                className="text-gray-500 hover:text-gray-700 text-xs underline mt-2 block mx-auto"
              >
                Show Debug Info
              </button>
            )}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : entities.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {entities.map((entity, index) => renderEntityCard(entity, index))}
              </div>
            ) : (
              <div className="border rounded-lg divide-y">
                {entities.map((entity, index) => renderEntityList(entity, index))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-500">No trending entities found.</p>
            <p className="text-sm text-gray-400 mt-1">Try changing the entity type or time period.</p>
            
            {debugInfo && (
              <div className="mt-4 text-left">
                <button 
                  onClick={() => setShowDebug(!showDebug)} 
                  className="text-xs underline text-gray-500"
                >
                  {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
                </button>
                
                {showDebug && (
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40 text-left">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
        
        {selectedEntity && renderEntityDetails()}
      </div>
    </div>
  );
} 