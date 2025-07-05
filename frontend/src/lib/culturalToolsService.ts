import { QlooEntity } from '@/types/qloo';
import { getEntityDetails, getInsights, getAnalysis } from '@/lib/qlooService';
import { getPerplexityResponse } from '@/lib/perplexityService';

// Types for the Cultural Journey Planner
export type Location = {
  name: string;
  country: string;
}

export type JourneyPlan = {
  title: string;
  description: string;
  itinerary: string;
  highlights: string[];
  culturalConnections: string;
  localCuisine: string[];
  accommodationSuggestions: {
    name: string;
    description: string;
    culturalRelevance: string;
  }[];
  localEvents?: string[];
  transportationTips?: string;
  budget?: {
    category: string;
    estimate: string;
    notes: string;
  }[];
}

// Types for the Cultural Taste Profile Builder
export type TasteProfile = {
  primaryGenres: string[];
  tasteAttributes: {
    name: string;
    score: number;
  }[];
  culturalAffinity: {
    era: string;
    movement: string;
    description: string;
  };
  recommendations: {
    domain: string;
    items: string[];
  }[];
  personality: string;
}

// Types for the Cultural Content Creator
export type ContentType = 'film' | 'book' | 'music' | 'podcast' | 'game' | 'art';

export type ContentIdea = {
  title: string;
  description: string;
  culturalReferences: string[];
  targetAudience: string;
  uniqueSellingPoints: string[];
  marketPotential: string;
}

// Types for the Cultural Compatibility Matcher
export type CompatibilityProfile = {
  name: string;
  compatibility: number;
  sharedInterests: string[];
  complementaryInterests: string[];
  compatibilityReason: string;
  avatar: string;
}

/**
 * Generate a cultural journey plan based on selected entities and location
 * @param selectedEntities The user's selected cultural entities
 * @param location The selected destination
 * @param journeyDuration The duration of the journey in days
 * @returns A personalized journey plan
 */
export async function generateJourneyPlan(
  selectedEntities: QlooEntity[],
  location: Location,
  journeyDuration: number
): Promise<JourneyPlan> {
  try {
    // Extract entity information for the prompt
    const entityInfo = await Promise.all(
      selectedEntities.map(async (entity) => {
        try {
          const details = await getEntityDetails(entity.type, entity.entity_id);
          
          // Get additional insights for this entity if possible
          let relatedEntities: string[] = [];
          try {
            const analysis = await getAnalysis({
              entity_type: entity.type,
              entity_value: entity.entity_id,
              entity_name: entity.name
            });
            if (analysis && analysis.related_entities) {
              relatedEntities = analysis.related_entities.slice(0, 3).map(e => e.name);
            }
          } catch (insightError) {
            console.log('Could not fetch additional insights:', insightError);
          }
          
          return {
            name: entity.name,
            type: entity.type.replace('urn:entity:', ''),
            tags: details.tags || [],
            description: details.properties?.description || '',
            relatedEntities
          };
        } catch (error) {
          console.error(`Error fetching details for ${entity.name}:`, error);
          return {
            name: entity.name,
            type: entity.type.replace('urn:entity:', ''),
            tags: [],
            description: '',
            relatedEntities: [] as string[]
          };
        }
      })
    );

    // Create a prompt for the LLM with more detailed instructions
    const prompt = `Create a personalized ${journeyDuration}-day cultural journey plan for ${location.name}, ${location.country} based on these cultural interests: 
    ${entityInfo.map(e => `${e.name} (${e.type}${e.description ? ': ' + e.description.substring(0, 100) + '...' : ''})`)
      .join('; ')}. 
    
    Include:
    1. A catchy title for the journey that reflects the user's taste profile
    2. A brief but compelling description of the journey (2-3 sentences)
    3. A detailed day-by-day itinerary with morning, afternoon, and evening activities that specifically connect to the user's cultural interests
    4. 5-7 highlights of the journey that showcase unique experiences
    5. A thoughtful explanation of how the journey connects to the user's cultural interests
    6. 3-5 local cuisine recommendations that align with the user's taste profile
    7. 2-3 accommodation suggestions with descriptions and cultural relevance
    8. Local events or seasonal activities if applicable
    9. Transportation tips for getting around the destination
    10. Budget estimates for different categories (accommodations, food, activities, etc.)
    
    For each activity in the itinerary:
    - Be specific about venues, neighborhoods, and experiences
    - Explain the cultural significance and connection to the user's interests
    - Include practical details like opening hours, reservation needs, etc. when relevant
    - Suggest alternatives for weather or availability issues
    
    Format as JSON with these keys: 
    - title
    - description
    - itinerary (markdown format with detailed day plans)
    - highlights (array)
    - culturalConnections (detailed paragraph)
    - localCuisine (array of food recommendations)
    - accommodationSuggestions (array of objects with name, description, culturalRelevance)
    - localEvents (array, optional)
    - transportationTips (string, optional)
    - budget (array of objects with category, estimate, notes)`;

    // Context for the LLM with more specific guidance
    const context = `You are a cultural travel expert creating personalized journey plans.
    The user has expressed interest in these cultural entities: ${entityInfo.map(e => e.name).join(', ')}.
    
    Related entities that might inform your recommendations include: ${entityInfo.flatMap(e => e.relatedEntities).join(', ')}
    
    Create an authentic, immersive cultural experience in ${location.name} that connects to these interests.
    Include specific locations, activities, and cultural experiences that would be meaningful based on their taste profile.
    The itinerary should be realistic for a ${journeyDuration}-day trip.
    
    Focus on creating a journey that feels personalized and tailored specifically to this user's unique interests.
    Include hidden gems and local experiences that tourists might miss.
    
    Consider the following when crafting the journey:
    - Balance between popular attractions and off-the-beaten-path experiences
    - Pacing appropriate for the duration (not too rushed or too slow)
    - Logical geographic flow to minimize travel time
    - Variety of activities (museums, performances, workshops, nature, food, etc.)
    - Opportunities for both structured activities and free exploration
    - Cultural significance of each recommendation and its connection to the user's interests`;

    // Get response from LLM
    const response = await getPerplexityResponse(prompt, context);
    
    // Parse the JSON response
    try {
      // Extract JSON from the response (handling potential markdown formatting)
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                        response.match(/\{[\s\S]*\}/);
      
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
      const journeyPlan = JSON.parse(jsonStr);
      
      return {
        title: journeyPlan.title || `${location.name} Cultural Journey`,
        description: journeyPlan.description || `A ${journeyDuration}-day cultural journey through ${location.name}`,
        itinerary: journeyPlan.itinerary || `## Day 1\n- Explore ${location.name}`,
        highlights: journeyPlan.highlights || ["Personalized cultural experiences"],
        culturalConnections: journeyPlan.culturalConnections || `This journey connects to your interests in ${entityInfo.map(e => e.name).join(', ')}`,
        localCuisine: journeyPlan.localCuisine || ["Local specialties based on your taste profile"],
        accommodationSuggestions: journeyPlan.accommodationSuggestions || [
          {
            name: "Culturally relevant accommodation",
            description: "A place that reflects your interests",
            culturalRelevance: "Connected to your taste profile"
          }
        ],
        localEvents: journeyPlan.localEvents,
        transportationTips: journeyPlan.transportationTips,
        budget: journeyPlan.budget
      };
    } catch (error) {
      console.error("Failed to parse journey plan JSON:", error);
      // Return a fallback plan
      return {
        title: `${location.name} Cultural Journey`,
        description: `A personalized ${journeyDuration}-day journey through ${location.name}, ${location.country} based on your cultural interests.`,
        itinerary: `
## Day 1: Immersion
- Morning: Visit the ${location.name} Museum of Modern Art
- Afternoon: Explore the historic district with a guided tour
- Evening: Dinner at a local restaurant known for cultural fusion cuisine

${journeyDuration > 1 ? `## Day 2: Exploration
- Morning: Workshop or class related to your interests
- Afternoon: Visit to specialty shops and local artisans
- Evening: Live performance or cultural event` : ''}

${journeyDuration > 2 ? `## Day 3: Connection
- Morning: Meet with local experts in your interest areas
- Afternoon: Visit to hidden gems off the tourist path
- Evening: Farewell dinner with cultural significance` : ''}
        `,
        highlights: [
          "Exclusive access to private collections",
          "Meeting with local artists and creators",
          "Customized experiences based on your specific interests",
          "Authentic cultural immersion beyond typical tourist experiences"
        ],
        culturalConnections: `Your interest in ${entityInfo.map(e => e.name).join(', ')} connects deeply with ${location.name}'s cultural scene.`,
        localCuisine: [
          `${location.name}'s signature dishes`,
          "Local specialties that align with your taste preferences",
          "Hidden gem restaurants favored by locals"
        ],
        accommodationSuggestions: [
          {
            name: "Boutique Hotel in Cultural District",
            description: "A charming hotel in the heart of the cultural district with unique design elements.",
            culturalRelevance: "Located near major cultural attractions and designed with local artistic influences."
          },
          {
            name: "Artist Residency Guesthouse",
            description: "A guesthouse that doubles as an artist residency program.",
            culturalRelevance: "Opportunity to interact with local and international artists in an intimate setting."
          }
        ]
      };
    }
  } catch (error) {
    console.error('Error generating journey plan:', error);
    throw error;
  }
}

/**
 * Generate a cultural taste profile based on selected entities
 * @param selectedEntities The user's selected cultural entities
 * @returns A personalized taste profile
 */
export async function generateTasteProfile(
  selectedEntities: QlooEntity[]
): Promise<TasteProfile> {
  try {
    // Get Qloo insights for the selected entities
    const entityIds = selectedEntities.map(entity => entity.entity_id);
    const entityTypes = [...new Set(selectedEntities.map(entity => entity.type))];
    
    // Get insights from Qloo API
    const insights = await Promise.all(
      entityIds.map(async (id, index) => {
        try {
          const analysis = await getAnalysis({
            entity_type: selectedEntities[index].type,
            entity_value: id,
            entity_name: selectedEntities[index].name
          });
          return analysis;
        } catch (error) {
          console.error(`Error fetching analysis for entity ${id}:`, error);
          return null;
        }
      })
    );
    
    // Filter out null results
    const validInsights = insights.filter(insight => insight !== null);
    
    // Create a prompt for the LLM
    const prompt = `Create a comprehensive cultural taste profile based on these interests:
    ${selectedEntities.map(e => `${e.name} (${e.type.replace('urn:entity:', '')})`).join(', ')}.
    
    Include:
    1. 4-5 primary genres that represent their taste
    2. 5 taste attributes with scores from 0-1 (e.g., Innovative: 0.85)
    3. Cultural affinity (era, movement, and description)
    4. Recommendations in 3 different domains (books, music, film, etc.)
    5. A personality description based on their cultural taste
    
    Format as JSON with these keys: primaryGenres (array), tasteAttributes (array of objects with name and score), culturalAffinity (object with era, movement, description), recommendations (array of objects with domain and items), personality (string)`;

    // Context for the LLM with Qloo insights
    const context = `You are a cultural taste analyst creating a personalized taste profile.
    The user has expressed interest in these cultural entities: ${selectedEntities.map(e => e.name).join(', ')}.
    ${validInsights.length > 0 ? `Qloo's analysis provides these insights: ${JSON.stringify(validInsights.slice(0, 3))}` : ''}
    Create a comprehensive taste profile that captures their unique cultural preferences and makes meaningful connections across domains.`;

    // Get response from LLM
    const response = await getPerplexityResponse(prompt, context);
    
    // Parse the JSON response
    try {
      // Extract JSON from the response (handling potential markdown formatting)
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                        response.match(/\{[\s\S]*\}/);
      
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
      const tasteProfile = JSON.parse(jsonStr);
      
      return {
        primaryGenres: tasteProfile.primaryGenres || ['Contemporary', 'Eclectic'],
        tasteAttributes: tasteProfile.tasteAttributes || [
          { name: 'Innovative', score: 0.8 },
          { name: 'Intellectual', score: 0.7 }
        ],
        culturalAffinity: tasteProfile.culturalAffinity || {
          era: '2010s',
          movement: 'Contemporary',
          description: 'Your taste reflects modern cultural sensibilities.'
        },
        recommendations: tasteProfile.recommendations || [
          {
            domain: 'Books',
            items: ['The Overstory by Richard Powers']
          }
        ],
        personality: tasteProfile.personality || 'Your cultural taste suggests a thoughtful, curious personality.'
      };
    } catch (error) {
      console.error("Failed to parse taste profile JSON:", error);
      // Return a fallback profile
      return {
        primaryGenres: ['Contemporary', 'Eclectic', 'Innovative'],
        tasteAttributes: [
          { name: 'Innovative', score: 0.85 },
          { name: 'Intellectual', score: 0.78 },
          { name: 'Nostalgic', score: 0.65 },
          { name: 'Adventurous', score: 0.72 },
          { name: 'Sophisticated', score: 0.81 }
        ],
        culturalAffinity: {
          era: '2010s',
          movement: 'Post-Digital',
          description: 'Your taste profile reflects a preference for thoughtful, innovative content.'
        },
        recommendations: [
          {
            domain: 'Books',
            items: ['Cloud Atlas by David Mitchell', 'The Overstory by Richard Powers']
          },
          {
            domain: 'Music',
            items: ['Bon Iver', 'Japanese Breakfast']
          },
          {
            domain: 'Film',
            items: ['Everything Everywhere All at Once', 'Parasite']
          }
        ],
        personality: 'Your cultural taste profile suggests you are a thoughtful explorer who values authenticity and innovation.'
      };
    }
  } catch (error) {
    console.error('Error generating taste profile:', error);
    throw error;
  }
}

/**
 * Generate content ideas based on selected entities and content type
 * @param selectedEntities The user's selected cultural entities
 * @param contentType The type of content to generate ideas for
 * @returns A list of content ideas
 */
export async function generateContentIdeas(
  selectedEntities: QlooEntity[],
  contentType: ContentType
): Promise<ContentIdea[]> {
  try {
    // Extract entity information for the prompt
    const entityInfo = selectedEntities.map(entity => ({
      name: entity.name,
      type: entity.type.replace('urn:entity:', '')
    }));

    // Create a prompt for the LLM
    const prompt = `Generate 3 original ${contentType} ideas based on these cultural interests:
    ${entityInfo.map(e => `${e.name} (${e.type})`).join(', ')}.
    
    For each idea include:
    1. A catchy title
    2. A brief description of the concept
    3. 3 cultural references that inspired it
    4. Target audience description
    5. 3 unique selling points
    6. Market potential analysis
    
    Format as JSON array with objects containing: title, description, culturalReferences (array), targetAudience, uniqueSellingPoints (array), marketPotential`;

    // Context for the LLM
    const context = `You are a creative content strategist helping to develop ${contentType} ideas.
    The user has expressed interest in these cultural entities: ${entityInfo.map(e => e.name).join(', ')}.
    Create innovative, marketable ${contentType} concepts that connect to these interests while having commercial appeal.
    Focus on concepts with cross-cultural appeal that blend familiar elements with innovative approaches.`;

    // Get response from LLM
    const response = await getPerplexityResponse(prompt, context);
    
    // Parse the JSON response
    try {
      // Extract JSON from the response (handling potential markdown formatting)
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                        response.match(/\[[\s\S]*\]/);
      
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
      const contentIdeas = JSON.parse(jsonStr);
      
      return contentIdeas.map((idea: any) => ({
        title: idea.title || `Untitled ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Concept`,
        description: idea.description || `A ${contentType} concept inspired by your cultural interests.`,
        culturalReferences: idea.culturalReferences || [entityInfo[0]?.name || 'Contemporary culture'],
        targetAudience: idea.targetAudience || 'Cultural enthusiasts with diverse interests',
        uniqueSellingPoints: idea.uniqueSellingPoints || ['Innovative concept', 'Cultural relevance', 'Unique perspective'],
        marketPotential: idea.marketPotential || 'Moderate market potential with niche audience appeal'
      }));
    } catch (error) {
      console.error("Failed to parse content ideas JSON:", error);
      // Return fallback ideas
      return [
        {
          title: `The ${contentType === 'music' ? 'Sound' : 'Art'} of Cultural Fusion`,
          description: `A ${contentType} that explores the intersection of traditional and modern cultural elements.`,
          culturalReferences: [
            entityInfo[0]?.name || 'Contemporary art',
            'Global fusion movements',
            'Cross-cultural collaboration'
          ],
          targetAudience: 'Cultural enthusiasts aged 25-45 with interests in global perspectives.',
          uniqueSellingPoints: [
            'Unique blend of traditional and contemporary elements',
            'Authentic representation of cultural exchange',
            'Innovative approach to familiar themes'
          ],
          marketPotential: 'High potential in urban markets and cultural centers.'
        },
        {
          title: `Beyond Boundaries: A ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Journey`,
          description: `An immersive ${contentType} experience that takes audiences on a journey through different cultural landscapes.`,
          culturalReferences: [
            'Global storytelling traditions',
            entityInfo[1]?.name || 'Cultural heritage',
            'Contemporary global movements'
          ],
          targetAudience: 'Globally-minded individuals aged 18-65 with interests in cultural exploration.',
          uniqueSellingPoints: [
            'Universal themes with specific cultural contexts',
            'Emotionally resonant storytelling',
            'Visually/sonically distinctive approach'
          ],
          marketPotential: 'Strong crossover potential between mainstream and niche markets.'
        },
        {
          title: `The ${contentType === 'book' ? 'Chronicles' : 'Evolution'} of Cultural Identity`,
          description: `A thought-provoking ${contentType} that examines how cultural identity forms and transforms.`,
          culturalReferences: [
            'Identity formation theory',
            entityInfo[2]?.name || 'Cultural movements',
            'Contemporary social dynamics'
          ],
          targetAudience: 'Thoughtful consumers of culture aged 20-55 interested in cultural analysis.',
          uniqueSellingPoints: [
            'Fresh perspective on familiar themes',
            'Deeply researched cultural insights',
            'Accessible approach to complex ideas'
          ],
          marketPotential: 'Strong potential in educational markets and with culturally curious audiences.'
        }
      ];
    }
  } catch (error) {
    console.error('Error generating content ideas:', error);
    throw error;
  }
}

/**
 * Analyze cultural compatibility between the user and potential matches
 * @param selectedEntities The user's selected cultural entities
 * @param matchType The type of match to find (friend, partner, colleague)
 * @returns A list of compatible profiles
 */
export async function analyzeCompatibility(
  selectedEntities: QlooEntity[],
  matchType: 'friend' | 'partner' | 'colleague'
): Promise<CompatibilityProfile[]> {
  try {
    // Extract entity information for the prompt
    const entityInfo = selectedEntities.map(entity => ({
      name: entity.name,
      type: entity.type.replace('urn:entity:', '')
    }));

    // Create a prompt for the LLM
    const prompt = `Generate 3 compatible ${matchType} profiles based on these cultural interests:
    ${entityInfo.map(e => `${e.name} (${e.type})`).join(', ')}.
    
    For each profile include:
    1. A name
    2. A compatibility score between 0.7 and 0.95
    3. 3 shared interests with the user
    4. 3 complementary interests that would expand the user's horizons
    5. A detailed explanation of why they're compatible
    
    Format as JSON array with objects containing: name, compatibility (number), sharedInterests (array), complementaryInterests (array), compatibilityReason`;

    // Context for the LLM
    const context = `You are a cultural compatibility expert helping to find ${matchType}s with compatible tastes.
    The user has expressed interest in these cultural entities: ${entityInfo.map(e => e.name).join(', ')}.
    Create realistic profiles of people who would be compatible with the user based on shared cultural values and complementary interests.
    Focus on meaningful connections rather than surface-level similarities.`;

    // Get response from LLM
    const response = await getPerplexityResponse(prompt, context);
    
    // Parse the JSON response
    try {
      // Extract JSON from the response (handling potential markdown formatting)
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                        response.match(/\[[\s\S]*\]/);
      
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
      const profiles = JSON.parse(jsonStr);
      
      // Add random avatar URLs
      return profiles.map((profile: any, index: number) => ({
        name: profile.name || `Match ${index + 1}`,
        compatibility: profile.compatibility || (0.9 - (index * 0.05)),
        sharedInterests: profile.sharedInterests || [entityInfo[0]?.name || 'Contemporary culture'],
        complementaryInterests: profile.complementaryInterests || ['Classical music', 'Travel photography'],
        compatibilityReason: profile.compatibilityReason || 'You share similar cultural tastes with complementary interests.',
        avatar: `https://i.pravatar.cc/150?img=${10 + index}`
      }));
    } catch (error) {
      console.error("Failed to parse compatibility profiles JSON:", error);
      // Return fallback profiles
      return [
        {
          name: "Alex Chen",
          compatibility: 0.92,
          sharedInterests: [
            entityInfo[0]?.name || "Independent film",
            entityInfo[1]?.name || "Contemporary literature",
            "Experimental music"
          ],
          complementaryInterests: [
            "Architectural design",
            "Culinary innovation",
            "Documentary photography"
          ],
          compatibilityReason: "Alex shares your appreciation for thoughtful, innovative cultural experiences that challenge conventions while maintaining emotional depth.",
          avatar: "https://i.pravatar.cc/150?img=11"
        },
        {
          name: "Jordan Taylor",
          compatibility: 0.87,
          sharedInterests: [
            entityInfo[2]?.name || "Indie music",
            "Contemporary art",
            "International cuisine"
          ],
          complementaryInterests: [
            "Travel photography",
            "Literary fiction",
            "Independent games"
          ],
          compatibilityReason: "Jordan's cultural tastes complement yours with a shared appreciation for authenticity and emotional resonance.",
          avatar: "https://i.pravatar.cc/150?img=32"
        },
        {
          name: "Morgan Rivera",
          compatibility: 0.81,
          sharedInterests: [
            "Cultural documentaries",
            entityInfo[0]?.name || "Independent film",
            "Literary podcasts"
          ],
          complementaryInterests: [
            "Classical composition",
            "Visual arts",
            "Performance theater"
          ],
          compatibilityReason: "Morgan's cultural interests reflect a deep appreciation for artistic tradition while still embracing innovation.",
          avatar: "https://i.pravatar.cc/150?img=23"
        }
      ];
    }
  } catch (error) {
    console.error('Error analyzing compatibility:', error);
    throw error;
  }
} 