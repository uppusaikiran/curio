import axios from 'axios';

// Environment variables should be properly set up in your project
const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;

const perplexityApi = axios.create({
  baseURL: 'https://api.perplexity.ai',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
  }
});

/**
 * Get a response from Perplexity based on a prompt and context
 * @param prompt The user's prompt/question
 * @param context Additional context to inform the response
 * @returns Perplexity's response text
 */
export async function getPerplexityResponse(prompt: string, context: string) {
  try {
    const response = await perplexityApi.post('/chat/completions', {
      model: "sonar",
      messages: [
        {
          role: "system",
          content: `You are a cultural insights specialist who understands the connections between different domains of taste. 
          You provide thoughtful analysis of cultural preferences and can make connections between different entities.
          Format your responses using Markdown for better readability. Use headings, bullet points, and other formatting to organize your insights.
          When mentioning entities, concepts, or references, always include properly formatted Markdown links to relevant sources or additional information.
          For example, use [Entity Name](https://relevant-url.com) format for links.
          Include references at the end of your response when appropriate.
          ${context}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting response from Perplexity:', error);
    throw error;
  }
}

/**
 * Get cultural context insights about an entity using Perplexity API
 * @param entityType The type of entity (movie, music, etc.)
 * @param entityName The name of the entity
 * @returns Cultural context information about the entity
 */
export async function getCulturalContext(entityType: string, entityName: string) {
  try {
    const response = await perplexityApi.post('/chat/completions', {
      model: "sonar",
      messages: [
        {
          role: "system",
          content: "You are a cultural insights expert. Provide concise, factual information about cultural entities."
        },
        {
          role: "user",
          content: `Provide cultural context about this ${entityType}: "${entityName}". Include: 
          1. Cultural significance 
          2. Historical context 
          3. Related cultural movements or trends 
          4. Interesting facts that help understand its place in culture
          Format as JSON with these keys: culturalSignificance, historicalContext, relatedTrends, interestingFacts`
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });
    
    // Parse the JSON from the response text
    const content = response.data.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON from Perplexity response:", content);
      return {
        culturalSignificance: "Information not available",
        historicalContext: "Information not available",
        relatedTrends: "Information not available",
        interestingFacts: "Information not available"
      };
    }
  } catch (error) {
    console.error('Error fetching cultural context from Perplexity:', error);
    throw error;
  }
}

/**
 * Get cross-domain recommendations based on an entity using Perplexity API
 * @param entityType The type of source entity
 * @param entityName The name of the source entity
 * @param targetDomain The target domain for recommendations
 * @returns Recommendations in the target domain
 */
export async function getCrossDomainRecommendations(entityType: string, entityName: string, targetDomain: string) {
  try {
    const response = await perplexityApi.post('/chat/completions', {
      model: "sonar",
      messages: [
        {
          role: "system",
          content: "You are a cultural recommendation expert who understands connections across different domains of taste."
        },
        {
          role: "user",
          content: `If someone enjoys this ${entityType}: "${entityName}", recommend 5 items in the domain of ${targetDomain} they might also enjoy. Explain the cultural connection between each recommendation and the original ${entityType}.
          Format as JSON array with objects containing: name, description, connection`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });
    
    // Parse the JSON from the response text
    const content = response.data.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON from Perplexity response:", content);
      return [];
    }
  } catch (error) {
    console.error('Error fetching cross-domain recommendations from Perplexity:', error);
    throw error;
  }
}

/**
 * Generate cultural insights about trends identified in Qloo data
 * @param trend The trend description or data
 * @returns Analysis of the cultural trend
 */
export async function analyzeCulturalTrend(trend: string) {
  try {
    const response = await perplexityApi.post('/chat/completions', {
      model: "sonar",
      messages: [
        {
          role: "system",
          content: "You are a cultural trend analyst who provides insightful analysis of emerging cultural patterns."
        },
        {
          role: "user",
          content: `Analyze this cultural trend: "${trend}". Explain:
          1. Why this trend is emerging now
          2. What cultural factors are driving it
          3. How it connects to other domains of culture
          4. Predictions for how this trend might evolve
          Format as JSON with these keys: analysis, culturalFactors, connections, predictions`
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });
    
    // Parse the JSON from the response text
    const content = response.data.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON from Perplexity response:", content);
      return {
        analysis: "Analysis not available",
        culturalFactors: "Information not available",
        connections: "Information not available",
        predictions: "Information not available"
      };
    }
  } catch (error) {
    console.error('Error analyzing cultural trend with Perplexity:', error);
    throw error;
  }
}

export default {
  getPerplexityResponse,
  getCulturalContext,
  getCrossDomainRecommendations,
  analyzeCulturalTrend
}; 