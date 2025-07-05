'use client';

import { useState } from 'react';
import EntitySearch from '@/components/discovery/EntitySearch';
import InsightsQueryBuilder from './InsightsQueryBuilder';
import InsightsResults from './InsightsResults';
import { QlooEntity, QlooInsight } from '@/types/qloo';
import { getInsights } from '@/lib/qlooService';
import { Button } from '@/components/ui/button';

// Interface for API error responses
interface ApiErrorResponse {
  error: {
    reason: string;
    message: string;
    code: number;
    request_id: string;
  };
}

export default function InsightsDashboard() {
  const [selectedEntity, setSelectedEntity] = useState<QlooEntity | null>(null);
  const [insights, setInsights] = useState<QlooInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [errorInsights, setErrorInsights] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<Record<string, any> | null>(null);

  const handleEntitySelect = (entity: QlooEntity) => {
    setSelectedEntity(entity);
    console.log('Entity selected in dashboard:', entity);
  };

  const handleQuerySubmit = async (params: Record<string, any>) => {
    setIsLoadingInsights(true);
    setErrorInsights(null);
    setLastQuery(params);
    
    try {
      const results = await getInsights({
        ...params,
        'include.tags': true,
        'include.popularity': true,
        'include.metrics': 'audience_growth',
      });
      
      // Check if the response is an error object
      if ((results as any)?.error) {
        const errorResponse = results as unknown as ApiErrorResponse;
        throw new Error(`${errorResponse.error.reason}: ${errorResponse.error.message} (Code: ${errorResponse.error.code})`);
      }
      
      setInsights(results);
    } catch (error: any) {
      console.error('Error fetching insights:', error);
      
      // Handle API error responses
      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        setErrorInsights(`${apiError.reason}: ${apiError.message}`);
      } 
      // Handle formatted error responses
      else if (error.error) {
        setErrorInsights(`${error.error.reason}: ${error.error.message}`);
      }
      // Handle standard error objects
      else if (error.message) {
        setErrorInsights(error.message);
      } 
      // Fallback error message
      else {
        setErrorInsights('Failed to fetch insights. Please try again later.');
      }
      
      setInsights([]);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleRefresh = () => {
    if (lastQuery) {
      handleQuerySubmit(lastQuery);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Insights Dashboard</h2>
        {insights.length > 0 && (
          <Button onClick={handleRefresh} size="sm" variant="outline" disabled={isLoadingInsights}>
            {isLoadingInsights ? 'Refreshing...' : 'Refresh Results'}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="space-y-8">
            <EntitySearch onEntitySelect={handleEntitySelect} />
            <InsightsQueryBuilder onQuerySubmit={handleQuerySubmit} isLoading={isLoadingInsights} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="space-y-8">
            <InsightsResults insights={insights} isLoading={isLoadingInsights} error={errorInsights} />
          </div>
        </div>
      </div>
    </div>
  );
} 