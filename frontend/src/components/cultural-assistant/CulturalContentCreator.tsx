'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QlooEntity } from '@/types/qloo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { generateContentIdeas, ContentType, ContentIdea } from '@/lib/culturalToolsService';

interface CulturalContentCreatorProps {
  selectedEntities: QlooEntity[];
}

export default function CulturalContentCreator({ selectedEntities }: CulturalContentCreatorProps) {
  const [selectedContentType, setSelectedContentType] = useState<ContentType>('film');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  const contentTypes: ContentType[] = ['film', 'book', 'music', 'podcast', 'game', 'art'];

  // Function to generate content ideas based on selected entities and content type
  const handleGenerateContentIdeas = async () => {
    if (selectedEntities.length === 0) {
      setError("Please select at least one cultural interest to generate content ideas");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Use the service to generate content ideas
      const ideas = await generateContentIdeas(selectedEntities, selectedContentType);
      setContentIdeas(ideas);
      setIsGenerating(false);
      setActiveTab(0);
    } catch (err) {
      console.error('Error generating content ideas:', err);
      setError('Failed to generate content ideas. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20">
      <h2 className="text-xl font-semibold mb-4">Cultural Content Creator</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Generate innovative content ideas based on cultural trends and audience preferences.
        Our AI analyzes cultural patterns to help creators develop concepts with strong market potential.
      </p>
      
      {/* Content Type Selection */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">Select Content Type</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {contentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedContentType(type)}
              className={`p-3 text-sm rounded-md border transition-colors ${
                selectedContentType === type
                  ? 'border-qloo-teal bg-qloo-teal/10'
                  : 'border-muted-foreground/20 hover:border-qloo-teal/50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Selected Interests */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">Selected Cultural Interests</h3>
        
        {selectedEntities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedEntities.map((entity) => (
              <Badge key={entity.entity_id} variant="outline" className="bg-qloo-teal/10 border-qloo-teal/30">
                {entity.name}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground">
              Please select at least one cultural interest to generate content ideas.
            </p>
          </div>
        )}
      </div>
      
      {/* Generate Button */}
      <div className="mb-8">
        <Button
          onClick={handleGenerateContentIdeas}
          disabled={isGenerating || selectedEntities.length === 0}
          className="w-full bg-qloo-teal hover:bg-qloo-teal/90 text-qloo-black"
        >
          {isGenerating ? 'Generating ideas...' : `Generate ${selectedContentType.charAt(0).toUpperCase() + selectedContentType.slice(1)} Ideas`}
        </Button>
        
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
      
      {/* Content Ideas Results */}
      {contentIdeas.length > 0 && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold mb-4">Content Ideas for {selectedContentType.charAt(0).toUpperCase() + selectedContentType.slice(1)}</h3>
          
          <Tabs 
            defaultValue="0" 
            value={activeTab.toString()} 
            onValueChange={(value) => setActiveTab(parseInt(value))}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full mb-4">
              {contentIdeas.map((_, index) => (
                <TabsTrigger key={index} value={index.toString()}>
                  Idea {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {contentIdeas.map((idea, index) => (
              <TabsContent key={index} value={index.toString()}>
                <div className="border border-qloo-teal/30 rounded-lg overflow-hidden">
                  <div className="bg-qloo-teal/10 p-4 border-b border-qloo-teal/20">
                    <h4 className="text-xl font-bold">{idea.title}</h4>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div>
                      <h5 className="text-sm font-medium mb-1">Concept</h5>
                      <p className="text-sm">{idea.description}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Cultural References</h5>
                      <div className="flex flex-wrap gap-2">
                        {idea.culturalReferences.map((ref, i) => (
                          <Badge key={i} className="bg-qloo-teal/20 text-foreground border-none">
                            {ref}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Target Audience</h5>
                      <p className="text-sm">{idea.targetAudience}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Unique Selling Points</h5>
                      <ul className="space-y-1">
                        {idea.uniqueSellingPoints.map((point, i) => (
                          <li key={i} className="text-sm flex items-start">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-qloo-teal/20 text-qloo-teal text-xs mr-2 mt-0.5">
                              {i + 1}
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Market Potential</h5>
                      <p className="text-sm">{idea.marketPotential}</p>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-4 border-t border-muted">
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm">
                        Save Idea
                      </Button>
                      <Button variant="outline" size="sm">
                        Refine Idea
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      )}
    </div>
  );
} 