'use client';

import { useState } from 'react';
import TrendingEntities from '@/components/discovery/TrendingEntities';
import EntitySearch from '@/components/discovery/EntitySearch';
import InsightsQueryBuilder from './InsightsQueryBuilder';
import InsightsResults from './InsightsResults';
import { QlooEntity, QlooInsight } from '@/types/qloo';
import { getInsights } from '@/lib/qlooService';
import { Button } from '@/components/ui/button';

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
      setInsights(results);
    } catch (error) {
      setErrorInsights('Failed to fetch insights. Please try again.');
      console.error(error);
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
            <TrendingEntities />
          </div>
        </div>
      </div>
    </div>
  );
} 