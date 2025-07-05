# Curio Frontend

This is the frontend application for Curio, a discovery platform that leverages the Qloo API for cultural recommendations and insights.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Qloo API key (for discovery features)
- Tavus API key (for video AI assistant)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Configure environment variables:

Create a `.env.local` file in the `frontend` directory with the following content:

```
# Qloo API Configuration
NEXT_PUBLIC_QLOO_API_URL=https://hackathon.api.qloo.com
NEXT_PUBLIC_QLOO_API_KEY=your_qloo_api_key_here

# Tavus API Configuration
NEXT_PUBLIC_TAVUS_API_KEY=your_tavus_api_key_here
```

Replace `your_qloo_api_key_here` with your actual Qloo API key and `your_tavus_api_key_here` with your Tavus API key.

4. Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Features

- Entity search across multiple domains (movies, TV shows, books, music, etc.)
- Trending content discovery
- Detailed entity analysis with tags, audiences, and cultural context
- Related entity recommendations
- Tavus Video AI assistant for interactive conversations

## Tavus Video AI Component

The Tavus Video AI component provides an interactive video assistant that appears on the left side of the application. It uses the Tavus API to create and manage video conversations.

### Features

- Interactive video assistant widget
- Conversation management (create, delete)
- Automatically cleans up old conversations to avoid reaching limits
- Visual feedback for loading and error states

### Configuration

To configure the Tavus Video AI component:

1. Set your Tavus API key in `.env.local`:
   ```
   NEXT_PUBLIC_TAVUS_API_KEY=your_tavus_api_key_here
   ```

2. To customize the replica or persona used by the assistant, update the component properties in `app/layout.tsx`:
   ```tsx
   <TavusVideoAI 
     replicaId="your_replica_id"
     personaId="your_persona_id"
     apiKey={process.env.NEXT_PUBLIC_TAVUS_API_KEY || ''}
   />
   ```

For more details about setting up the Tavus Video AI component, see [TAVUS_SETUP.md](./TAVUS_SETUP.md).

## Entity Search Component

The Entity Search component allows users to search for entities in the Qloo database. It uses the Qloo API to fetch entity types and search for entities by name.

### Troubleshooting API Issues

If you encounter issues with the Entity Search component, such as "Failed to load entity types", here are some common solutions:

1. **Check API Key**: Ensure your Qloo API key is correctly set in `.env.local`:
   ```
   NEXT_PUBLIC_QLOO_API_URL=https://hackathon.api.qloo.com
   NEXT_PUBLIC_QLOO_API_KEY=your_api_key_here
   ```

2. **Use the API Troubleshooter**: The Entity Search component includes an API Troubleshooter that can help diagnose connection issues. Click "Show API Troubleshooter" at the bottom of the component to test your connection.

3. **Visit the API Test Page**: For more detailed testing, visit the `/api-test` page in the application.

4. **Check Endpoint Compatibility**: The component tries multiple endpoints and authentication methods to ensure compatibility with different Qloo API versions.

5. **Restart Development Server**: After updating your environment variables, restart the development server with `npm run dev`.

## Troubleshooting

### API Authentication Errors

If you see 401 Unauthorized errors when accessing the discovery features:

1. Make sure you've created the `.env.local` file with the correct API key
2. Restart the development server after adding or modifying environment variables
3. Verify that your API key is active and properly formatted

### No Mock Data

This application requires a valid Qloo API key to function. All mock data fallbacks have been removed to ensure consistent behavior across development and production environments.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Qloo API Documentation](https://docs.qloo.com)
