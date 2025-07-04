'use client';

import { useState } from 'react';
import { QlooInsight, QlooEntity } from '@/types/qloo';
import Image from 'next/image';
import EntityDetails from './EntityDetails';
import { getEntityDetails } from '@/lib/qlooService';

interface InsightsResultsProps {
  insights: QlooInsight[];
  isLoading: boolean;
  error: string | null;
}

// Extended insight interface to handle additional properties that might be present
interface ExtendedInsight extends QlooInsight {
  disambiguation?: string;
  query?: {
    affinity?: number;
    measurements?: Record<string, number>;
  };
}

export default function InsightsResults({ insights, isLoading, error }: InsightsResultsProps) {
  // Use null as initial state to prevent hydration mismatch
  const [selectedEntity, setSelectedEntity] = useState<QlooEntity | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  if (isLoading) {
    return <div className="text-center p-8">Loading insights...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (!insights || insights.length === 0) {
    return <div className="text-center p-8 text-muted-foreground">No insights to display. Try a different query.</div>;
  }

  const handleEntityClick = async (insight: ExtendedInsight) => {
    if (selectedEntity?.entity_id === insight.entity_id) {
      // Clicking the same entity again - close the details
      setSelectedEntity(null);
      return;
    }

    setLoadingDetails(true);
    setDetailsError(null);
    try {
      // Fetch detailed entity information
      const entityDetails = await getEntityDetails(
        insight.type, 
        insight.entity_id,
        true, // include popularity
        true, // include tags
        true  // include metrics
      );
      setSelectedEntity(entityDetails);
    } catch (err: any) {
      console.error('Failed to fetch entity details:', err);
      // Log the error but don't show it to the user if it's a "not found" error
      if (err.message?.includes('Entity not found') || err.response?.status === 404) {
        console.log('Entity not found in Qloo database:', insight.entity_id);
        // Don't set error message for the user
      } else {
        // For other types of errors, we can set the error message
        setDetailsError(`Failed to load entity analysis. ${err.message || 'Unknown error occurred'}`);
      }
      // Still set the basic insight data as a fallback
      setSelectedEntity(insight as unknown as QlooEntity);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Insights Results</h3>
      
      {/* Selected Entity Details */}
      {loadingDetails && (
        <div className="text-center py-4">Loading entity details...</div>
      )}
      
      {detailsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          <p>{detailsError}</p>
          <div className="mt-2">
            <button 
              onClick={() => setDetailsError(null)} 
              className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-1 px-2 rounded text-xs"
            >
              Dismiss
            </button>
            <button 
              onClick={() => handleEntityClick(selectedEntity as unknown as ExtendedInsight)} 
              className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-1 px-2 rounded text-xs ml-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {selectedEntity && !loadingDetails && (
        <div className="mb-6">
          <EntityDetails entity={selectedEntity} />
          <div className="mt-4 text-center">
            <button 
              onClick={() => setSelectedEntity(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close details
            </button>
          </div>
        </div>
      )}
      
      {/* Insights Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affinity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {insights.map((insight) => {
              // Cast to extended type for additional properties
              const extendedInsight = insight as ExtendedInsight;
              
              // Ensure image URL is properly handled
              const imageUrl = extendedInsight.properties?.image?.url || 
                (extendedInsight.properties?.image as any)?.url || 
                extendedInsight.properties?.image_url || 
                '/placeholder.png';
              
              return (
                <tr 
                  key={insight.entity_id} 
                  className={selectedEntity?.entity_id === insight.entity_id ? 'bg-blue-50' : 'hover:bg-gray-50 cursor-pointer'}
                  onClick={() => handleEntityClick(extendedInsight)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Image 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={imageUrl}
                          alt={insight.name}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{insight.name}</div>
                        {extendedInsight.disambiguation && (
                          <div className="text-xs text-gray-500">{extendedInsight.disambiguation}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {insight.subtype 
                        ? insight.subtype.replace('urn:entity:', '')
                        : insight.type.replace('urn:entity:', '')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {extendedInsight.query?.affinity !== undefined 
                        ? (extendedInsight.query.affinity * 100).toFixed(1) + '%'
                        : insight.score !== undefined 
                          ? insight.score.toFixed(4) 
                          : 'N/A'
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEntityClick(extendedInsight);
                      }}
                    >
                      {selectedEntity?.entity_id === insight.entity_id ? 'Hide details' : 'View details'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 