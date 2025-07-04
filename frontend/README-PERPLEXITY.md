# Perplexity & Qloo API Integration

This project integrates Perplexity API with Qloo's Taste AI to provide enhanced cultural context and cross-domain recommendations.

## Features Added

1. **Cultural Context Analysis**: Provides in-depth cultural significance, historical context, related trends, and interesting facts about entities discovered through Qloo.

2. **Cross-Domain Recommendations**: Suggests items from different domains (music, movies, books, etc.) based on a user's preferences in one domain.

3. **Cultural Trend Analysis**: Analyzes trending entities to explain why they're trending, what cultural factors are driving the trend, and how the trend might evolve.

## Setup Instructions

1. Create a `.env.local` file in the frontend directory with your API keys:

```
# Qloo API Configuration
NEXT_PUBLIC_QLOO_API_URL=https://hackathon.api.qloo.com
NEXT_PUBLIC_QLOO_API_KEY=your_qloo_api_key_here

# Perplexity API Configuration
NEXT_PUBLIC_PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

2. Replace the placeholder values with your actual API keys:
   - `your_qloo_api_key_here` with your Qloo API key
   - `your_perplexity_api_key_here` with your Perplexity API key

3. Restart your development server to ensure the environment variables are loaded:

```bash
npm run dev
```

## How to Use the New Features

### Cultural Context Analysis
1. Search for an entity in the discovery page
2. Select an entity from the search results
3. In the entity analysis view, click on the "Cultural Context" tab
4. The system will fetch and display cultural insights about the selected entity

### Cross-Domain Recommendations
1. Search for and select an entity you like
2. In the entity analysis view, click on the "Cross-Domain" tab
3. Select a target domain (e.g., music, movies, books)
4. The system will generate recommendations in that domain based on your selected entity

### Cultural Trend Analysis
1. Go to the Trending Entities section
2. Click on a trending entity
3. Click "Analyze This Trend" to get cultural insights about why it's trending
4. Click "Show More" to see additional details about cultural factors, connections, and predictions

## Troubleshooting

### API Key Issues
- Ensure your API keys are correctly set in the `.env.local` file
- Make sure the environment variable names are exactly as shown above
- Restart your development server after adding or changing API keys

### 400 Bad Request Errors
- The Perplexity API requires specific model names. This implementation uses `sonar-small-online`
- Check the browser console for detailed error messages
- Verify that your API key has access to the models being used

### JSON Parsing Errors
- The implementation includes error handling for JSON parsing issues
- If you see "Information not available" in the UI, check the browser console for parsing errors
- The API responses are expected to be in JSON format

## Implementation Details

The integration consists of:

1. **API Services**:
   - `qlooService.ts`: Service for making API calls to Qloo's Taste AI API
   - `perplexityService.ts`: Service for making API calls to Perplexity with three main functions:
     - `getCulturalContext`: Gets detailed cultural information about entities
     - `getCrossDomainRecommendations`: Provides recommendations across different domains
     - `analyzeCulturalTrend`: Analyzes cultural trends and their significance

2. **New Components**:
   - `CulturalContext.tsx`: Displays cultural significance, historical context, related trends, and interesting facts
   - `CrossDomainRecommendations.tsx`: Shows recommendations across different domains based on user preferences
   - `TrendAnalysis.tsx`: Provides analysis of trending entities and cultural factors

3. **Integration Points**:
   - Added to `EntityAnalysis.tsx` as new tabs
   - Added to `TrendingEntities.tsx` for trend analysis

## Future Enhancements

Potential future improvements include:

1. Caching API responses to reduce API calls and improve performance
2. Adding more detailed cultural analysis with historical timelines
3. Creating a visual graph of cultural connections across domains
4. Implementing user feedback mechanisms to improve recommendations
5. Adding batch analysis for multiple entities at once 