# Qloo API Integration

This document provides information on how to set up and use the Qloo API integration in the Curio application.

## Setup

1. Sign up for a Qloo API account at [https://docs.qloo.com/reference/api-onboarding](https://docs.qloo.com/reference/api-onboarding)
2. Get your API key from the Qloo dashboard
3. Create or update your `.env.local` file in the `frontend` directory with the following variables:

```
NEXT_PUBLIC_QLOO_API_URL=https://hackathon.api.qloo.com
NEXT_PUBLIC_QLOO_API_KEY=your_api_key_here
```

4. Restart your development server

## API Structure

The Qloo API is structured around several key endpoints:

- `/v2/entity-types` - Get supported entity types
- `/v2/tag-types` - Get supported tag types
- `/v2/audience-types` - Get supported audience types
- `/v2/search` - Search for entities
- `/v2/insights` - Get insights and recommendations
- `/v2/trending` - Get trending entities
- `/v2/analysis` - Analyze an entity
- `/v2/compare` - Compare two entities
- `/v2/tags/search` - Search for tags

## Authentication

The Qloo API uses an API key for authentication. The key should be passed in the `X-Api-Key` header with each request.

```javascript
const headers = {
  'Content-Type': 'application/json',
  'X-Api-Key': process.env.NEXT_PUBLIC_QLOO_API_KEY
};
```

## Usage Examples

### Get Entity Types

```javascript
import { getEntityTypes } from '@/lib/qlooService';

// In an async function
const entityTypes = await getEntityTypes();
console.log(entityTypes);
```

### Search for Entities

```javascript
import { searchEntities } from '@/lib/qlooService';

// In an async function
const movieResults = await searchEntities('urn:entity:movie', 'star wars', 5);
console.log(movieResults);
```

### Get Insights/Recommendations

```javascript
import { getInsights } from '@/lib/qlooService';

// In an async function
const params = {
  'signal.interests.entities': 'urn:entity:movie:star-wars',
  'filter.type': 'urn:entity:movie',
  'take': 5
};
const recommendations = await getInsights(params);
console.log(recommendations);
```

### Get Trending Entities

```javascript
import { getTrendingEntities } from '@/lib/qlooService';

// In an async function
const trendingMovies = await getTrendingEntities({
  entity_type: 'urn:entity:movie',
  limit: 10
});
console.log(trendingMovies);
```

## Parameter Structure

The Qloo API uses a structured parameter format:

### Filter Parameters

Filter parameters narrow down results:

```javascript
{
  'filter.type': 'urn:entity:movie',
  'filter.tags': 'urn:tag:genre:media:comedy',
  'filter.popularity.min': 0.5
}
```

### Signal Parameters

Signal parameters influence recommendations:

```javascript
{
  'signal.interests.entities': 'urn:entity:movie:star-wars',
  'signal.demographics.age.min': 25,
  'signal.demographics.age.max': 40
}
```

### Output Parameters

Output parameters control pagination and result format:

```javascript
{
  'take': 10,
  'page': 1,
  'sort_by': 'affinity'
}
```

## Testing

You can test the API connection and various endpoints using the API Test page at `/api-test`. This page allows you to:

1. Verify your API connection
2. Test different endpoints
3. Try various parameter combinations
4. View the raw API responses

## Troubleshooting

If you encounter issues with the API:

1. Check that your API key is correctly set in `.env.local`
2. Verify that the API URL is correct
3. Ensure you're using the correct header format (`X-Api-Key`)
4. Check the browser console for CORS or network errors
5. Use the `/api-test` page to diagnose specific endpoint issues

## Documentation

For more detailed information on the Qloo API, refer to the official documentation:

- [API Overview](https://docs.qloo.com/reference/api-overview)
- [Parameter Reference](https://docs.qloo.com/reference/parameters)
- [Insights API Deep Dive](https://docs.qloo.com/reference/insights-api-deep-dive) 