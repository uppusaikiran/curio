'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QlooEntity } from '@/types/qloo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateJourneyPlan, Location, JourneyPlan } from '@/lib/culturalToolsService';

interface CulturalJourneyPlannerProps {
  selectedEntities: QlooEntity[];
}

export default function CulturalJourneyPlanner({ selectedEntities }: CulturalJourneyPlannerProps) {
  const [locations, setLocations] = useState<Location[]>([
    { name: 'New York', country: 'USA' },
    { name: 'Tokyo', country: 'Japan' },
    { name: 'Paris', country: 'France' },
    { name: 'London', country: 'UK' },
    { name: 'Berlin', country: 'Germany' },
  ]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [journeyDuration, setJourneyDuration] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [journeyPlan, setJourneyPlan] = useState<JourneyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to generate a journey plan based on selected entities and location
  const handleGenerateJourneyPlan = async () => {
    if (!selectedLocation || selectedEntities.length === 0) {
      setError("Please select both a location and at least one cultural interest");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Use the service to generate a journey plan
      const plan = await generateJourneyPlan(selectedEntities, selectedLocation, journeyDuration);
      setJourneyPlan(plan);
      setIsGenerating(false);
    } catch (err) {
      console.error('Error generating journey plan:', err);
      setError('Failed to generate your journey plan. Please try again.');
      setIsGenerating(false);
    }
  };

  // Add a custom location
  const addCustomLocation = () => {
    const locationName = prompt('Enter city name:');
    const countryName = prompt('Enter country name:');
    
    if (locationName && countryName) {
      const newLocation = { name: locationName, country: countryName };
      setLocations([...locations, newLocation]);
      setSelectedLocation(newLocation);
    }
  };

  return (
    <div className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20">
      <h2 className="text-xl font-semibold mb-4">Cultural Journey Planner</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Create a personalized travel itinerary based on your cultural interests and preferences.
        Our AI combines your taste profile with cultural intelligence to design unique experiences.
      </p>
      
      {selectedEntities.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-muted-foreground/30 rounded-lg">
          <p className="text-muted-foreground">
            Please select at least one cultural interest to generate a journey plan.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Location Selection */}
          <div>
            <h3 className="text-md font-medium mb-3">Select a Destination</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {locations.map((location) => (
                <button
                  key={`${location.name}-${location.country}`}
                  onClick={() => setSelectedLocation(location)}
                  className={`p-3 text-sm rounded-md border transition-colors ${
                    selectedLocation === location
                      ? 'border-qloo-teal bg-qloo-teal/10'
                      : 'border-muted-foreground/20 hover:border-qloo-teal/50'
                  }`}
                >
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-muted-foreground">{location.country}</div>
                </button>
              ))}
              <button
                onClick={addCustomLocation}
                className="p-3 text-sm rounded-md border border-dashed border-muted-foreground/30 hover:border-qloo-teal/50 flex items-center justify-center"
              >
                <span>+ Add Location</span>
              </button>
            </div>
          </div>
          
          {/* Duration Selection */}
          <div>
            <h3 className="text-md font-medium mb-3">Journey Duration</h3>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 5, 7, 10].map((days) => (
                <button
                  key={days}
                  onClick={() => setJourneyDuration(days)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    journeyDuration === days
                      ? 'bg-qloo-teal text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {days} {days === 1 ? 'day' : 'days'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Generate Button */}
          <div className="pt-4">
            <Button
              onClick={handleGenerateJourneyPlan}
              disabled={isGenerating || !selectedLocation || selectedEntities.length === 0}
              className="w-full bg-qloo-teal hover:bg-qloo-teal/90 text-qloo-black"
            >
              {isGenerating ? 'Generating your journey...' : 'Generate Cultural Journey'}
            </Button>
            
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>
          
          {/* Journey Plan Results */}
          {journeyPlan && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 border border-qloo-teal/30 rounded-lg overflow-hidden"
            >
              <div className="bg-qloo-teal/10 p-4 border-b border-qloo-teal/20">
                <h3 className="text-xl font-bold">{journeyPlan.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{journeyPlan.description}</p>
              </div>
              
              <Tabs defaultValue="itinerary" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                  <TabsTrigger value="highlights">Highlights</TabsTrigger>
                  <TabsTrigger value="connections">Cultural Connections</TabsTrigger>
                </TabsList>
                
                <TabsContent value="itinerary" className="p-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {journeyPlan.itinerary}
                    </ReactMarkdown>
                  </div>
                </TabsContent>
                
                <TabsContent value="highlights" className="p-4">
                  <ul className="space-y-2">
                    {journeyPlan.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-qloo-teal/20 text-qloo-teal text-xs mr-2 mt-0.5">
                          ✓
                        </span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                
                <TabsContent value="connections" className="p-4">
                  <p className="text-sm">{journeyPlan.culturalConnections}</p>
                </TabsContent>
              </Tabs>
              
              <div className="bg-muted/50 p-4 border-t border-muted">
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm">
                    Save Journey
                  </Button>
                  <Button variant="outline" size="sm">
                    Share
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
} 