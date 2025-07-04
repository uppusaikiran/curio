'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { searchEntities, getTrendingEntities, getAnalysis, getRecommendations, getEntityTypes } from '@/lib/qlooService';
import perplexityService from '@/lib/perplexityService';
import { QlooEntity, QlooEntityType, QlooTrendingEntity, QlooAnalysisResult } from '@/types/qloo';
import EntitySearch from '@/components/discovery/EntitySearch';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type AssistantState = {
  loading: boolean;
  error: string | null;
  answer: string | null;
  context: string | null;
};

type AnalysisState = {
  loading: boolean;
  error: string | null;
  result: QlooAnalysisResult | null;
};

type RecommendationState = {
  loading: boolean;
  error: string | null;
  entities: QlooEntity[];
};

type TrendingState = {
  loading: boolean;
  error: string | null;
  entities: QlooTrendingEntity[];
};

export default function CulturalAssistant() {
  const [selectedEntities, setSelectedEntities] = useState<QlooEntity[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [assistantState, setAssistantState] = useState<AssistantState>({
    loading: false,
    error: null,
    answer: null,
    context: null,
  });
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    loading: false,
    error: null,
    result: null,
  });
  const [recommendationState, setRecommendationState] = useState<RecommendationState>({
    loading: false,
    error: null,
    entities: [],
  });
  const [trendingState, setTrendingState] = useState<TrendingState>({
    loading: false,
    error: null,
    entities: [],
  });
  const [entityTypes, setEntityTypes] = useState<QlooEntityType[]>([]);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('urn:entity:movie');
  const [activeTab, setActiveTab] = useState('assistant');
  
  // Load entity types on mount
  useEffect(() => {
    const loadEntityTypes = async () => {
      try {
        const types = await getEntityTypes();
        setEntityTypes(types);
      } catch (error) {
        console.error('Failed to load entity types:', error);
      }
    };
    
    loadEntityTypes();
    
    // Load trending entities on mount
    fetchTrendingEntities();
  }, []);
  
  // Handle entity selection
  const handleEntitySelect = (entity: QlooEntity) => {
    // Check if entity already exists in the array
    if (!selectedEntities.some(e => e.entity_id === entity.entity_id)) {
      setSelectedEntities(prev => [...prev, entity]);
      
      // If this is the first entity selected, analyze it automatically
      if (selectedEntities.length === 0) {
        analyzeEntity(entity);
      }
      
      // Get recommendations based on this entity
      fetchRecommendations(entity);
    }
  };

  // Remove an entity from selection
  const removeEntity = (entityId: string) => {
    setSelectedEntities(prev => prev.filter(e => e.entity_id !== entityId));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEntities.length === 0) {
      setAssistantState({
        ...assistantState,
        error: "Please select at least one entity to get cultural insights.",
        answer: null,
        context: null,
      });
      return;
    }
    
    if (!userQuestion.trim()) {
      setAssistantState({
        ...assistantState,
        error: "Please enter a question for the assistant.",
        answer: null,
        context: null,
      });
      return;
    }
    
    setAssistantState({
      ...assistantState,
      loading: true,
      error: null,
      answer: null,
      context: null,
    });
    
    try {
      // Build cultural context from selected entities
      const entityDescriptions = selectedEntities.map(entity => 
        `${entity.name} (${entity.type}${entity.subtype ? `, ${entity.subtype}` : ''})`
      ).join(', ');
      
      // Create a prompt that combines Qloo insights with the user question
      const prompt = `Based on cultural insights for ${entityDescriptions}, ${userQuestion}`;
      const context = `The user is interested in the following entities: ${entityDescriptions}. 
        These entities represent cultural tastes and preferences from the Qloo API.
        You should use this cultural context to provide insights that connect these interests in meaningful ways.
        Format your response using Markdown for better readability.`;
      
      // Get response from Perplexity
      const response = await perplexityService.getPerplexityResponse(prompt, context);
      
      setAssistantState({
        loading: false,
        error: null,
        answer: response,
        context: context
      });
      
      // Switch to the assistant tab to show the answer
      setActiveTab('assistant');
      
    } catch (error: any) {
      setAssistantState({
        loading: false,
        error: `Error: ${error.message || 'Failed to get response'}`,
        answer: null,
        context: null
      });
    }
  };
  
  // Analyze an entity using Qloo's analysis API
  const analyzeEntity = async (entity: QlooEntity) => {
    setAnalysisState({
      loading: true,
      error: null,
      result: null
    });
    
    try {
      const analysis = await getAnalysis({
        entity_type: entity.type,
        entity_value: entity.entity_id,
        entity_name: entity.name,
        subtype: entity.subtype
      });
      
      setAnalysisState({
        loading: false,
        error: null,
        result: analysis
      });
    } catch (error: any) {
      setAnalysisState({
        loading: false,
        error: `Analysis error: ${error.message || 'Failed to analyze entity'}`,
        result: null
      });
    }
  };
  
  // Fetch recommendations based on selected entity
  const fetchRecommendations = async (entity: QlooEntity) => {
    setRecommendationState({
      loading: true,
      error: null,
      entities: []
    });
    
    try {
      const recommendations = await getRecommendations({
        entity_type: entity.type,
        entity_value: entity.entity_id,
        limit: 5
      });
      
      setRecommendationState({
        loading: false,
        error: null,
        entities: recommendations
      });
    } catch (error: any) {
      setRecommendationState({
        loading: false,
        error: `Recommendation error: ${error.message || 'Failed to get recommendations'}`,
        entities: []
      });
    }
  };
  
  // Fetch trending entities
  const fetchTrendingEntities = async () => {
    setTrendingState({
      loading: true,
      error: null,
      entities: []
    });
    
    try {
      const trending = await getTrendingEntities({
        entity_type: selectedEntityType,
        limit: 10
      });
      
      setTrendingState({
        loading: false,
        error: null,
        entities: trending
      });
    } catch (error: any) {
      setTrendingState({
        loading: false,
        error: `Trending error: ${error.message || 'Failed to get trending entities'}`,
        entities: []
      });
    }
  };
  
  // Handle entity type change for trending entities
  const handleEntityTypeChange = (type: string) => {
    setSelectedEntityType(type);
    
    // Fetch trending entities for the new type
    setTrendingState(prev => ({
      ...prev,
      loading: true
    }));
    
    getTrendingEntities({
      entity_type: type,
      limit: 10
    })
      .then(entities => {
        setTrendingState({
          loading: false,
          error: null,
          entities
        });
      })
      .catch(error => {
        setTrendingState({
          loading: false,
          error: `Error: ${error.message || 'Failed to get trending entities'}`,
          entities: []
        });
      });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left column: Entity selection */}
      <div className="md:col-span-1">
        <div className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20 h-full">
          <h2 className="text-xl font-semibold mb-4">Select Interests</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Search and select entities that represent your interests. The cultural assistant
            will use Qloo's cultural intelligence to provide insights based on these selections.
          </p>
          
          <div className="mb-6">
            <EntitySearch onEntitySelect={handleEntitySelect} />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Selected Entities</h3>
            {selectedEntities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No entities selected yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedEntities.map(entity => (
                  <span 
                    key={entity.entity_id} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-qloo-teal/20 text-qloo-teal"
                  >
                    {entity.name}
                    <button 
                      onClick={() => removeEntity(entity.entity_id)} 
                      className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-qloo-teal/30"
                    >
                      <span className="sr-only">Remove</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Trending Entities Section */}
          <div className="mt-8">
            <h3 className="text-sm font-medium mb-2">Trending in Culture</h3>
            <div className="mb-2">
              <select 
                className="w-full p-2 rounded-md border border-input bg-background text-sm"
                value={selectedEntityType}
                onChange={(e) => handleEntityTypeChange(e.target.value)}
              >
                {entityTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            {trendingState.loading ? (
              <p className="text-sm text-muted-foreground">Loading trending entities...</p>
            ) : trendingState.error ? (
              <p className="text-sm text-red-500">{trendingState.error}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {trendingState.entities.map(entity => (
                  <Badge 
                    key={entity.entity_id}
                    variant="outline"
                    className="cursor-pointer hover:bg-qloo-teal/20 hover:text-qloo-teal transition-colors"
                    onClick={() => {
                      const fullEntity: QlooEntity = {
                        name: entity.name,
                        entity_id: entity.entity_id,
                        type: entity.type,
                        subtype: entity.subtype,
                        properties: entity.properties,
                        tags: entity.tags
                      };
                      handleEntitySelect(fullEntity);
                    }}
                  >
                    {entity.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right column: Question and answer */}
      <div className="md:col-span-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="assistant">Assistant</TabsTrigger>
            <TabsTrigger value="analysis">Entity Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assistant">
            <motion.div 
              className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4">Ask the Cultural Assistant</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Ask a question about your selected interests, and the assistant will provide
                insights using Qloo's cultural intelligence combined with advanced language models.
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <textarea
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="What connects these interests? What else might I enjoy? What cultural patterns do you see?"
                    className="w-full p-3 rounded-md border border-input bg-background"
                    rows={3}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={assistantState.loading}
                  className="w-full py-2 px-4 bg-qloo-teal text-qloo-black font-medium rounded-md hover:bg-qloo-teal/90 transition-colors disabled:opacity-50"
                >
                  {assistantState.loading ? 'Processing...' : 'Get Cultural Insights'}
                </button>
              </form>
            </motion.div>
            
            {assistantState.error && (
              <motion.div 
                className="bg-red-100/30 p-4 rounded-md border border-red-200 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-red-800">{assistantState.error}</p>
              </motion.div>
            )}
            
            {assistantState.answer && (
              <motion.div 
                className="bg-muted/30 p-6 rounded-lg border border-qloo-yellow/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center mb-4">
                  <span className="w-8 h-8 rounded-full bg-qloo-yellow flex items-center justify-center text-qloo-black mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                  </span>
                  <h3 className="text-lg font-medium">Cultural Insight</h3>
                </div>
                <div className="prose prose-sm dark:prose-invert prose-a:text-qloo-teal prose-a:no-underline hover:prose-a:underline prose-a:font-medium max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{assistantState.answer}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="analysis">
            <motion.div 
              className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4">Qloo Entity Analysis</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Detailed analysis of your selected entity, including associated tags, audiences, and related entities
                powered by Qloo's cultural intelligence.
              </p>
              
              {selectedEntities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Select an entity to see its analysis</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedEntities.map(entity => (
                      <Badge 
                        key={entity.entity_id}
                        variant={analysisState.result?.entity.entity_id === entity.entity_id ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => analyzeEntity(entity)}
                      >
                        {entity.name}
                      </Badge>
                    ))}
                  </div>
                  
                  {analysisState.loading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Analyzing entity...</p>
                    </div>
                  ) : analysisState.error ? (
                    <div className="bg-red-100/30 p-4 rounded-md border border-red-200">
                      <p className="text-red-800">{analysisState.error}</p>
                    </div>
                  ) : analysisState.result ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          {analysisState.result.entity.name}
                          {analysisState.result.entity.subtype && (
                            <span className="text-sm text-muted-foreground ml-2">
                              {analysisState.result.entity.subtype}
                            </span>
                          )}
                        </h3>
                        {analysisState.result.entity.properties?.description && (
                          <p className="text-sm text-muted-foreground">
                            {analysisState.result.entity.properties.description}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-md font-medium mb-2">Associated Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisState.result.tags.slice(0, 15).map(tag => (
                            <Badge 
                              key={tag.id}
                              variant="secondary"
                              className="bg-qloo-teal/10"
                            >
                              {tag.name} {tag.score && <span className="opacity-70">({Math.round(tag.score * 100)}%)</span>}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {analysisState.result.audiences && analysisState.result.audiences.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium mb-2">Key Audiences</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysisState.result.audiences.slice(0, 10).map(audience => (
                              <Badge 
                                key={audience.id}
                                variant="outline"
                              >
                                {audience.name} {audience.score && <span className="opacity-70">({Math.round(audience.score * 100)}%)</span>}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {analysisState.result.related_entities && analysisState.result.related_entities.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium mb-2">Related Entities</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysisState.result.related_entities.slice(0, 8).map(entity => (
                              <Badge 
                                key={entity.entity_id}
                                variant="secondary"
                                className="cursor-pointer hover:bg-qloo-teal/20"
                                onClick={() => handleEntitySelect(entity)}
                              >
                                {entity.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Click on an entity above to analyze it</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="recommendations">
            <motion.div 
              className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4">Qloo Recommendations</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Discover similar entities based on your selections, powered by Qloo's cultural intelligence.
              </p>
              
              {selectedEntities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Select an entity to see recommendations</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedEntities.map(entity => (
                      <Badge 
                        key={entity.entity_id}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => fetchRecommendations(entity)}
                      >
                        Based on: {entity.name}
                      </Badge>
                    ))}
                  </div>
                  
                  {recommendationState.loading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading recommendations...</p>
                    </div>
                  ) : recommendationState.error ? (
                    <div className="bg-red-100/30 p-4 rounded-md border border-red-200">
                      <p className="text-red-800">{recommendationState.error}</p>
                    </div>
                  ) : recommendationState.entities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recommendationState.entities.map(entity => (
                        <div 
                          key={entity.entity_id}
                          className="p-4 rounded-lg border border-qloo-teal/20 hover:border-qloo-teal/40 transition-colors cursor-pointer"
                          onClick={() => handleEntitySelect(entity)}
                        >
                          <h3 className="font-medium">{entity.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {entity.type.replace('urn:entity:', '')}
                            {entity.subtype && ` › ${entity.subtype}`}
                          </p>
                          {entity.properties?.description && (
                            <p className="text-sm mt-2 line-clamp-2">{entity.properties.description}</p>
                          )}
                          {entity.tags && entity.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entity.tags.slice(0, 3).map(tag => (
                                <span key={tag.id} className="text-xs px-2 py-0.5 bg-qloo-teal/10 rounded-full">
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No recommendations found. Try selecting a different entity.</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 