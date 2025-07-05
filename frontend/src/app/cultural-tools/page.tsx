'use client';

import React, { useState } from 'react';
import { Container } from "@/components/ui/container";
import Header from "@/components/Header";
import EntitySearch from '@/components/discovery/EntitySearch';
import { QlooEntity } from '@/types/qloo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import CulturalJourneyPlanner from '@/components/cultural-assistant/CulturalJourneyPlanner';
import CulturalTasteProfileBuilder from '@/components/cultural-assistant/CulturalTasteProfileBuilder';
import CulturalContentCreator from '@/components/cultural-assistant/CulturalContentCreator';
import CulturalCompatibilityMatcher from '@/components/cultural-assistant/CulturalCompatibilityMatcher';

export default function CulturalToolsPage() {
  const [selectedEntities, setSelectedEntities] = useState<QlooEntity[]>([]);
  const [activeTab, setActiveTab] = useState<string>('taste-profile');

  // Handle entity selection
  const handleEntitySelect = (entity: QlooEntity) => {
    // Check if entity is already selected
    if (!selectedEntities.some(e => e.entity_id === entity.entity_id)) {
      setSelectedEntities([...selectedEntities, entity]);
    }
  };

  // Remove a selected entity
  const removeEntity = (entityId: string) => {
    setSelectedEntities(selectedEntities.filter(entity => entity.entity_id !== entityId));
  };

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center bg-background">
        <Container className="py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6">
              <span className="gradient-text">Cultural</span> Tools
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Powerful tools that combine Qloo's Taste AI™ with advanced language models to provide
              unique cultural insights and personalized experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Left column: Entity selection */}
            <div className="md:col-span-1">
              <div className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Select Your Interests</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Search and select cultural entities that represent your interests. These selections
                  will be used across all tools to provide personalized insights.
                </p>
                
                <div className="mb-6">
                  <EntitySearch onEntitySelect={handleEntitySelect} />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Selected Entities ({selectedEntities.length})</h3>
                  {selectedEntities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedEntities.map((entity) => (
                        <Badge 
                          key={entity.entity_id} 
                          variant="outline" 
                          className="bg-qloo-teal/10 border-qloo-teal/30 flex items-center gap-1"
                        >
                          {entity.name}
                          <button 
                            onClick={() => removeEntity(entity.entity_id)}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border border-dashed border-muted-foreground/30 rounded-lg">
                      <p className="text-muted-foreground">
                        No entities selected yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right column: Tools */}
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="taste-profile">Taste Profile</TabsTrigger>
                  <TabsTrigger value="journey-planner">Journey Planner</TabsTrigger>
                  <TabsTrigger value="content-creator">Content Creator</TabsTrigger>
                  <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
                </TabsList>
                
                <TabsContent value="taste-profile">
                  <CulturalTasteProfileBuilder selectedEntities={selectedEntities} />
                </TabsContent>
                
                <TabsContent value="journey-planner">
                  <CulturalJourneyPlanner selectedEntities={selectedEntities} />
                </TabsContent>
                
                <TabsContent value="content-creator">
                  <CulturalContentCreator selectedEntities={selectedEntities} />
                </TabsContent>
                
                <TabsContent value="compatibility">
                  <CulturalCompatibilityMatcher selectedEntities={selectedEntities} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Feature highlights section */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Powered by Cultural Intelligence
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20">
                <h3 className="text-xl font-medium mb-3 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-qloo-teal flex items-center justify-center text-qloo-black mr-2">1</span>
                  Qloo's Taste AI™
                </h3>
                <p className="text-muted-foreground">
                  Our tools leverage Qloo's powerful API to understand the complex connections between different domains of taste, 
                  providing insights that go beyond simple recommendations.
                </p>
              </div>
              
              <div className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20">
                <h3 className="text-xl font-medium mb-3 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-qloo-teal flex items-center justify-center text-qloo-black mr-2">2</span>
                  Advanced Language Models
                </h3>
                <p className="text-muted-foreground">
                  By combining Qloo's cultural intelligence with state-of-the-art language models, we create tools that understand 
                  the nuanced connections between cultural preferences and provide personalized insights.
                </p>
              </div>
              
              <div className="bg-muted/30 p-6 rounded-lg border border-qloo-yellow/20">
                <h3 className="text-xl font-medium mb-3 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-qloo-yellow flex items-center justify-center text-qloo-black mr-2">3</span>
                  Cross-Domain Intelligence
                </h3>
                <p className="text-muted-foreground">
                  Discover connections between seemingly unrelated cultural domains, from music to cuisine, 
                  literature to travel, and understand how your preferences form a cohesive cultural identity.
                </p>
              </div>
              
              <div className="bg-muted/30 p-6 rounded-lg border border-qloo-yellow/20">
                <h3 className="text-xl font-medium mb-3 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-qloo-yellow flex items-center justify-center text-qloo-black mr-2">4</span>
                  Personalized Experiences
                </h3>
                <p className="text-muted-foreground">
                  From travel itineraries to content creation, our tools translate cultural intelligence into 
                  personalized experiences that align with your unique taste profile.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
} 