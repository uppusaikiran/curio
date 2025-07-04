'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { searchEntities } from '@/lib/qlooService';
import perplexityService from '@/lib/perplexityService';
import { QlooEntity } from '@/types/qloo';
import EntitySearch from '@/components/discovery/EntitySearch';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type AssistantState = {
  loading: boolean;
  error: string | null;
  answer: string | null;
  context: string | null;
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
  
  // Handle entity selection
  const handleEntitySelect = (entity: QlooEntity) => {
    // Check if entity already exists in the array
    if (!selectedEntities.some(e => e.entity_id === entity.entity_id)) {
      setSelectedEntities(prev => [...prev, entity]);
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
      
    } catch (error: any) {
      setAssistantState({
        loading: false,
        error: `Error: ${error.message || 'Failed to get response'}`,
        answer: null,
        context: null
      });
    }
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
        </div>
      </div>
      
      {/* Right column: Question and answer */}
      <div className="md:col-span-2">
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
      </div>
    </div>
  );
} 