'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QlooEntity } from '@/types/qloo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyzeCompatibility, CompatibilityProfile } from '@/lib/culturalToolsService';

interface CulturalCompatibilityMatcherProps {
  selectedEntities: QlooEntity[];
}

export default function CulturalCompatibilityMatcher({ selectedEntities }: CulturalCompatibilityMatcherProps) {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [compatibilityProfiles, setCompatibilityProfiles] = useState<CompatibilityProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [matchType, setMatchType] = useState<'friend' | 'partner' | 'colleague'>('friend');

  // Function to analyze cultural compatibility
  const handleAnalyzeCompatibility = async () => {
    if (selectedEntities.length < 3) {
      setError("Please select at least three cultural interests for accurate matching");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Use the service to analyze compatibility
      const profiles = await analyzeCompatibility(selectedEntities, matchType);
      setCompatibilityProfiles(profiles);
      setIsAnalyzing(false);
    } catch (err) {
      console.error('Error analyzing compatibility:', err);
      setError('Failed to analyze cultural compatibility. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20">
      <h2 className="text-xl font-semibold mb-4">Cultural Compatibility Matcher</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Find people with compatible cultural tastes based on your preferences.
        Our AI analyzes cultural patterns to identify meaningful connections beyond surface-level matching.
      </p>
      
      {/* Match Type Selection */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">I'm Looking For:</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setMatchType('friend')}
            className={`p-3 text-sm rounded-md border transition-colors ${
              matchType === 'friend'
                ? 'border-qloo-teal bg-qloo-teal/10'
                : 'border-muted-foreground/20 hover:border-qloo-teal/50'
            }`}
          >
            Friends
          </button>
          <button
            onClick={() => setMatchType('partner')}
            className={`p-3 text-sm rounded-md border transition-colors ${
              matchType === 'partner'
                ? 'border-qloo-teal bg-qloo-teal/10'
                : 'border-muted-foreground/20 hover:border-qloo-teal/50'
            }`}
          >
            Partners
          </button>
          <button
            onClick={() => setMatchType('colleague')}
            className={`p-3 text-sm rounded-md border transition-colors ${
              matchType === 'colleague'
                ? 'border-qloo-teal bg-qloo-teal/10'
                : 'border-muted-foreground/20 hover:border-qloo-teal/50'
            }`}
          >
            Colleagues
          </button>
        </div>
      </div>
      
      {/* Selected Interests */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">Your Cultural Interests ({selectedEntities.length})</h3>
        
        {selectedEntities.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedEntities.map((entity) => (
              <Badge key={entity.entity_id} variant="outline" className="bg-qloo-teal/10 border-qloo-teal/30">
                {entity.name}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground">
              Please select cultural interests to find compatible matches.
            </p>
          </div>
        )}
        
        {selectedEntities.length > 0 && selectedEntities.length < 3 && (
          <p className="text-xs text-muted-foreground mt-2">
            Select at least 3 interests for more accurate matching.
          </p>
        )}
      </div>
      
      {/* Analyze Button */}
      <div className="mb-8">
        <Button
          onClick={handleAnalyzeCompatibility}
          disabled={isAnalyzing || selectedEntities.length < 3}
          className="w-full bg-qloo-teal hover:bg-qloo-teal/90 text-qloo-black"
        >
          {isAnalyzing ? 'Finding compatible matches...' : 'Find Compatible Matches'}
        </Button>
        
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
      
      {/* Compatibility Results */}
      {compatibilityProfiles.length > 0 && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold mb-4">Your Top Cultural Matches</h3>
          
          <div className="space-y-4">
            {compatibilityProfiles.map((profile, index) => (
              <div 
                key={index}
                className="border border-qloo-teal/30 rounded-lg overflow-hidden"
              >
                <div className="bg-qloo-teal/10 p-4 border-b border-qloo-teal/20 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                      <img 
                        src={profile.avatar} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{profile.name}</h4>
                      <div className="flex items-center">
                        <div className="h-2 w-20 bg-muted rounded-full overflow-hidden mr-2">
                          <div 
                            className="h-full bg-qloo-teal" 
                            style={{ width: `${profile.compatibility * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(profile.compatibility * 100)}% Compatible
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full mb-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="shared">Shared Interests</TabsTrigger>
                      <TabsTrigger value="complementary">Complementary</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="p-2">
                      <p className="text-sm">{profile.compatibilityReason}</p>
                    </TabsContent>
                    
                    <TabsContent value="shared" className="p-2">
                      <h5 className="text-sm font-medium mb-2">Shared Cultural Interests</h5>
                      <div className="flex flex-wrap gap-2">
                        {profile.sharedInterests.map((interest, i) => (
                          <Badge key={i} className="bg-qloo-teal/20 text-foreground border-none">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="complementary" className="p-2">
                      <h5 className="text-sm font-medium mb-2">Complementary Interests</h5>
                      <div className="flex flex-wrap gap-2">
                        {profile.complementaryInterests.map((interest, i) => (
                          <Badge key={i} className="bg-muted/50 text-foreground border-none">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        These interests complement your cultural taste profile and could expand your horizons.
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
                
                <div className="bg-muted/50 p-4 border-t border-muted flex justify-between">
                  <Button variant="outline" size="sm">
                    View Full Profile
                  </Button>
                  <Button variant="outline" size="sm" className="bg-qloo-teal/10 border-qloo-teal hover:bg-qloo-teal/20">
                    Connect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
} 