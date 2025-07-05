'use client';

import { useState } from 'react';
import { QlooEntity } from '@/types/qloo';
import Image from 'next/image';

interface EntityDetailsProps {
  entity: QlooEntity | null;
}

// Interface for API error responses
interface ApiErrorResponse {
  error: {
    reason: string;
    message: string;
    code: number;
    request_id: string;
  };
}

export default function EntityDetails({ entity }: EntityDetailsProps) {
  const [activeTab, setActiveTab] = useState('info');
  
  if (!entity) {
    return null;
  }

  // Check if the entity is actually an error response
  if ((entity as any)?.error) {
    const errorData = (entity as unknown as ApiErrorResponse).error;
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
            <h3 className="text-lg font-medium">{errorData.reason}</h3>
            <p className="mt-2">{errorData.message}</p>
            {errorData.request_id && (
              <p className="text-xs mt-2">Request ID: {errorData.request_id}</p>
            )}
          </div>
          <div className="mt-4">
            <p className="text-gray-600">
              Unable to retrieve complete entity details. This could be due to:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600">
              <li>API permission restrictions</li>
              <li>Rate limiting on the API</li>
              <li>The entity may have been removed or is unavailable</li>
              <li>Your API key may not have access to this specific entity</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = entity.properties?.image?.url || 
                  (entity.properties?.image as any)?.url || 
                  '/placeholder.png';
                  
  const formattedType = entity.subtype ? 
    entity.subtype.replace('urn:entity:', '') : 
    entity.type.replace('urn:entity:', '');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.toLocaleString('en-US', { month: 'long' });
      const day = date.getDate();
      return `${month} ${day}, ${year}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Image column */}
        <div className="md:w-1/3 p-4 flex items-center justify-center bg-gray-50">
          <div className="relative h-72 w-full">
            <Image 
              src={imageUrl} 
              alt={entity.name}
              fill
              className="object-cover rounded-md"
            />
          </div>
        </div>
        
        {/* Content column */}
        <div className="md:w-2/3 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">{entity.name}</h2>
              <p className="text-gray-600">{formattedType} {entity.properties?.release_year && `(${entity.properties.release_year})`}</p>
              {entity.disambiguation && <p className="text-sm text-gray-500">{entity.disambiguation}</p>}
            </div>
            {entity.popularity !== undefined && (
              <div className="flex items-center">
                <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  Popularity: {(entity.popularity * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
          
          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8">
              <button 
                onClick={() => setActiveTab('info')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info' 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Basic Info
              </button>
              <button 
                onClick={() => setActiveTab('properties')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'properties' 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Properties
              </button>
              <button 
                onClick={() => setActiveTab('tags')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tags' 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tags
              </button>
              <button 
                onClick={() => setActiveTab('external')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'external' 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                External Data
              </button>
            </nav>
          </div>
          
          {/* Tab content */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {entity.properties?.description && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Description</h3>
                  <p className="mt-1 text-gray-600">{entity.properties.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {entity.properties?.release_date && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Release Date</h4>
                    <p>{formatDate(entity.properties.release_date)}</p>
                  </div>
                )}
                
                {entity.properties?.duration && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                    <p>{entity.properties.duration} minutes</p>
                  </div>
                )}
                
                {entity.properties?.content_rating && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Content Rating</h4>
                    <p>{entity.properties.content_rating}</p>
                  </div>
                )}
                
                {entity.query?.measurements?.audience_growth !== undefined && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Audience Growth</h4>
                    <p className={`${entity.query.measurements.audience_growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(entity.query.measurements.audience_growth * 100).toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
              
              {entity.properties?.production_companies && entity.properties.production_companies.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Production Companies</h4>
                  <p>{entity.properties.production_companies.join(', ')}</p>
                </div>
              )}
              
              {entity.properties?.release_country && entity.properties.release_country.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Release Countries</h4>
                  <p>{entity.properties.release_country.join(', ')}</p>
                </div>
              )}
              
              {entity.properties?.filming_location && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Filming Location</h4>
                  <p>{entity.properties.filming_location}</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'properties' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">All Properties</h3>
              
              {entity.properties?.akas && entity.properties.akas.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Alternative Titles</h4>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-gray-600">
                    {entity.properties.akas.slice(0, 8).map((aka, index) => (
                      <li key={index}>
                        {aka.value} <span className="text-xs text-gray-400">({aka.languages.join(', ')})</span>
                      </li>
                    ))}
                    {entity.properties.akas.length > 8 && (
                      <li className="text-gray-400">+ {entity.properties.akas.length - 8} more</li>
                    )}
                  </ul>
                </div>
              )}
              
              {entity.properties?.websites && entity.properties.websites.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Websites</h4>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-blue-600">
                    {entity.properties.websites.map((website, index) => (
                      <li key={index}>
                        <a href={website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {website}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {entity.properties?.short_descriptions && entity.properties.short_descriptions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Short Descriptions</h4>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-gray-600">
                    {entity.properties.short_descriptions.slice(0, 5).map((desc, index) => (
                      <li key={index}>
                        {desc.value} <span className="text-xs text-gray-400">({desc.languages.join(', ')})</span>
                      </li>
                    ))}
                    {entity.properties.short_descriptions.length > 5 && (
                      <li className="text-gray-400">+ {entity.properties.short_descriptions.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
              
              {/* Add other complex property types as needed */}
            </div>
          )}
          
          {activeTab === 'tags' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Tags</h3>
              
              {!entity.tags || entity.tags.length === 0 ? (
                <p className="text-gray-500">No tags available for this entity</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {entity.tags.map((tag) => (
                    <span 
                      key={tag.id}
                      className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
                      title={tag.type}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'external' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">External Data</h3>
              
              {!entity.external || Object.keys(entity.external).length === 0 ? (
                <p className="text-gray-500">No external data available for this entity</p>
              ) : (
                <div className="space-y-4">
                  {entity.external.imdb && entity.external.imdb.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">IMDb</h4>
                      <div className="mt-1 text-gray-600">
                        <p>ID: {entity.external.imdb[0].id}</p>
                        {entity.external.imdb[0].user_rating && (
                          <p>Rating: {entity.external.imdb[0].user_rating} / 10 
                            {entity.external.imdb[0].user_rating_count && 
                              ` (${entity.external.imdb[0].user_rating_count.toLocaleString()} votes)`}
                          </p>
                        )}
                        <p className="mt-1">
                          <a 
                            href={`https://www.imdb.com/title/${entity.external.imdb[0].id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View on IMDb
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {entity.external.rottentomatoes && entity.external.rottentomatoes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Rotten Tomatoes</h4>
                      <div className="mt-1 text-gray-600">
                        <p>ID: {entity.external.rottentomatoes[0].id}</p>
                        {entity.external.rottentomatoes[0].critic_rating && (
                          <p>Critic Score: {entity.external.rottentomatoes[0].critic_rating}
                            {entity.external.rottentomatoes[0].critic_rating_count && 
                              ` (${entity.external.rottentomatoes[0].critic_rating_count} reviews)`}
                          </p>
                        )}
                        {entity.external.rottentomatoes[0].user_rating && (
                          <p>Audience Score: {entity.external.rottentomatoes[0].user_rating}
                            {entity.external.rottentomatoes[0].user_rating_count && 
                              ` (${entity.external.rottentomatoes[0].user_rating_count} ratings)`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {entity.external.metacritic && entity.external.metacritic.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Metacritic</h4>
                      <div className="mt-1 text-gray-600">
                        <p>ID: {entity.external.metacritic[0].id}</p>
                        {entity.external.metacritic[0].critic_rating !== undefined && (
                          <p>Critic Score: {entity.external.metacritic[0].critic_rating} / 100</p>
                        )}
                        {entity.external.metacritic[0].user_rating !== undefined && (
                          <p>User Score: {entity.external.metacritic[0].user_rating} / 10</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {entity.external.netflix && entity.external.netflix.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Netflix</h4>
                      <p className="mt-1 text-gray-600">ID: {entity.external.netflix[0].id}</p>
                    </div>
                  )}
                  
                  {/* Add other external data sources as needed */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 