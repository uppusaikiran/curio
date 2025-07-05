'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QlooEntity } from '@/types/qloo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getEntityTypes } from '@/lib/qlooService';
import { generateTasteProfile, TasteProfile } from '@/lib/culturalToolsService';

interface CulturalTasteProfileBuilderProps {
  selectedEntities: QlooEntity[];
}

type EntityType = {
  id: string;
  name: string;
}

export default function CulturalTasteProfileBuilder({ selectedEntities }: CulturalTasteProfileBuilderProps) {
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Fetch entity types on component mount
  useEffect(() => {
    const fetchEntityTypes = async () => {
      try {
        const types = await getEntityTypes();
        const formattedTypes = types.map((type: any) => ({
          id: type.id || type.type,
          name: type.name || type.type.replace('urn:entity:', '')
        }));
        setEntityTypes(formattedTypes);
      } catch (err) {
        console.error('Error fetching entity types:', err);
      }
    };
    
    fetchEntityTypes();
  }, []);

  // Generate taste profile based on selected entities
  const handleGenerateTasteProfile = async () => {
    if (selectedEntities.length === 0) {
      setError("Please select at least three cultural interests to generate a profile");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Use the service to generate a taste profile
      const profile = await generateTasteProfile(selectedEntities);
      setTasteProfile(profile);
      setIsGenerating(false);
      setActiveTab('overview');
    } catch (err) {
      console.error('Error generating taste profile:', err);
      setError('Failed to generate your taste profile. Please try again.');
      setIsGenerating(false);
    }
  };

  // Calculate the domain distribution of selected entities
  const getDomainDistribution = () => {
    const domains: Record<string, number> = {};
    
    selectedEntities.forEach(entity => {
      const domain = entity.type.replace('urn:entity:', '');
      domains[domain] = (domains[domain] || 0) + 1;
    });
    
    return Object.entries(domains).map(([domain, count]) => ({
      domain,
      count,
      percentage: Math.round((count / selectedEntities.length) * 100)
    }));
  };

  return (
    <div className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20">
      <h2 className="text-xl font-semibold mb-4">Cultural Taste Profile</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Analyze your cultural preferences to create a comprehensive taste profile.
        Our AI combines Qloo's cultural intelligence with advanced language models to understand your unique taste patterns.
      </p>
      
      {/* Selected Entities Summary */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">Your Selected Interests ({selectedEntities.length})</h3>
        
        {selectedEntities.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedEntities.slice(0, 10).map((entity) => (
                <Badge key={entity.entity_id} variant="outline" className="bg-qloo-teal/10 border-qloo-teal/30">
                  {entity.name}
                </Badge>
              ))}
              {selectedEntities.length > 10 && (
                <Badge variant="outline" className="bg-muted/50">
                  +{selectedEntities.length - 10} more
                </Badge>
              )}
            </div>
            
            {/* Domain Distribution */}
            {selectedEntities.length >= 3 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Domain Distribution</h4>
                <div className="space-y-2">
                  {getDomainDistribution().map(({ domain, count, percentage }) => (
                    <div key={domain} className="flex items-center">
                      <span className="text-xs w-20">{domain}</span>
                      <div className="flex-1 mx-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-qloo-teal" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Generate Button */}
            <Button
              onClick={handleGenerateTasteProfile}
              disabled={isGenerating || selectedEntities.length < 3}
              className="w-full bg-qloo-teal hover:bg-qloo-teal/90 text-qloo-black"
            >
              {isGenerating ? 'Analyzing your taste profile...' : 'Generate Taste Profile'}
            </Button>
            
            {selectedEntities.length < 3 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Please select at least 3 interests to generate a taste profile.
              </p>
            )}
            
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </>
        ) : (
          <div className="text-center py-8 border border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground">
              Please select at least three cultural interests to generate a taste profile.
            </p>
          </div>
        )}
      </div>
      
      {/* Taste Profile Results */}
      {tasteProfile && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 border border-qloo-teal/30 rounded-lg overflow-hidden"
        >
          <div className="bg-qloo-teal/10 p-4 border-b border-qloo-teal/20">
            <h3 className="text-xl font-bold">Your Cultural Taste Profile</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Based on analysis of {selectedEntities.length} selected interests across {getDomainDistribution().length} domains.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="p-4">
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium mb-2">Taste Personality</h4>
                  <p className="text-sm">{tasteProfile.personality}</p>
                </div>
                
                <div>
                  <h4 className="text-md font-medium mb-2">Primary Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {tasteProfile.primaryGenres.map((genre, index) => (
                      <Badge key={index} className="bg-qloo-teal/20 text-foreground border-none">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium mb-2">Cultural Affinity</h4>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Era:</span>
                      <span className="text-sm">{tasteProfile.culturalAffinity.era}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Movement:</span>
                      <span className="text-sm">{tasteProfile.culturalAffinity.movement}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {tasteProfile.culturalAffinity.description}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="attributes" className="p-4">
              <h4 className="text-md font-medium mb-4">Taste Attributes</h4>
              <div className="space-y-4">
                {tasteProfile.tasteAttributes.map((attribute) => (
                  <div key={attribute.name} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{attribute.name}</span>
                      <span className="text-sm">{Math.round(attribute.score * 100)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-qloo-teal" 
                        style={{ width: `${attribute.score * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="recommendations" className="p-4">
              <div className="space-y-6">
                {tasteProfile.recommendations.map((rec) => (
                  <div key={rec.domain}>
                    <h4 className="text-md font-medium mb-2">{rec.domain} Recommendations</h4>
                    <ul className="space-y-2">
                      {rec.items.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-qloo-teal/20 text-qloo-teal text-xs mr-2 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-medium mb-2">Cultural Connections</h4>
                  <p className="text-sm">
                    Your selections show strong connections between seemingly disparate domains,
                    suggesting you appreciate cultural works that bridge traditional boundaries.
                    There's a notable pattern of interest in content that combines intellectual depth
                    with emotional resonance.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-md font-medium mb-2">Emerging Interests</h4>
                  <p className="text-sm">
                    Based on your current taste profile, you might enjoy exploring:
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li className="text-sm">• Contemporary magical realism literature</li>
                    <li className="text-sm">• Fusion cuisine combining Eastern and Western traditions</li>
                    <li className="text-sm">• Independent games with narrative focus</li>
                    <li className="text-sm">• Architectural design with sustainable elements</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="bg-muted/50 p-4 border-t border-muted">
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm">
                Save Profile
              </Button>
              <Button variant="outline" size="sm">
                Share
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 