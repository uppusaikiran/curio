# Curio - Cultural Intelligence Assistant

<div align="center">
  <img src="frontend/public/curio_logo.png" alt="Curio Logo" width="200">
  <p><strong>Discover connections across music, film, dining, fashion, and more with Qloo's Taste AI™</strong></p>
</div>

## Overview

Curio is a comprehensive cultural intelligence platform that leverages multiple AI technologies to help users discover connections across various domains of culture and taste. By integrating Qloo's Taste AI™, Perplexity's knowledge engine, Tavus Video AI, and ElevenLabs voice technology, Curio provides personalized recommendations, trend analysis, and interactive assistance for exploring cultural connections.

## Features

- **Cultural Assistant**: Interactive AI assistant that provides personalized insights and recommendations based on user interests across multiple domains
- **Entity Discovery**: Search and explore entities across movies, music, books, restaurants, and more
- **Trend Analysis**: Visualize and understand cultural trends and connections
- **Cross-Domain Recommendations**: Get recommendations that span multiple domains based on your taste profile
- **Interactive AI Interfaces**:
  - **Tavus Video AI**: Video-based AI assistant for interactive visual conversations
  - **ElevenLabs Voice AI**: Voice-based conversational interface for hands-free interaction
- **Cultural Insights Dashboard**: Data visualizations showing connections, audience demographics, and trend analysis
- **Multi-Modal Interactions**: Text, voice, and video interfaces for a comprehensive user experience

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **Data Visualization**: D3.js
- **UI Components**: Custom components with Radix UI primitives
- **AI Integrations**:
  - Tavus Video AI
  - ElevenLabs Voice AI
  - Perplexity AI

### Backend
- **Framework**: Fastify with TypeScript
- **Database**: SQLite with Prisma ORM
- **API**: RESTful endpoints with CORS support
- **Authentication**: JWT-based auth

### External APIs
- **Qloo API**: Cultural taste graph and recommendations engine
- **Perplexity API**: Knowledge base and cultural insights
- **Tavus API**: Video AI for interactive conversations
- **ElevenLabs API**: Voice AI for conversational interface

## Architecture

The project follows a modern full-stack architecture with:

1. **Next.js Frontend**:
   - Server and client components
   - API routes for secure data fetching
   - Modular component structure

2. **Fastify Backend**:
   - Microservice architecture
   - Service-oriented design pattern
   - Middleware for authentication and request processing

3. **Database**:
   - Prisma ORM for type-safe database operations
   - User management and persistent data storage

4. **External API Integration**:
   - Wrapper services for consistent API access
   - Error handling and fallback strategies

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- API keys for:
  - Qloo API
  - Perplexity API (optional)
  - Tavus API (optional)
  - ElevenLabs API (optional)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   
Create a `.env.local` file in the `frontend` directory:

```
# Qloo API Configuration
NEXT_PUBLIC_QLOO_API_URL=https://hackathon.api.qloo.com
NEXT_PUBLIC_QLOO_API_KEY=your_qloo_api_key_here

# Optional API Keys
NEXT_PUBLIC_PERPLEXITY_API_KEY=your_perplexity_api_key_here
NEXT_PUBLIC_TAVUS_API_KEY=your_tavus_api_key_here
```

4. Start the frontend development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   
Create a `.env` file in the `backend` directory:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_jwt_secret_here
QLOO_API_KEY=your_qloo_api_key_here
```

4. Initialize the database:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Start the backend development server:
```bash
npm run dev
```

## Modules and Components

### Cultural Assistant
The core cultural assistant that integrates data from multiple sources to provide personalized insights:

- CulturalAssistant.tsx: Main component for cultural recommendations
- CrossCategoryAffinity.tsx: Visualizes connections across different cultural domains
- TrendAnalysisChart.tsx: Displays trending patterns in cultural data

### Discovery Tools
Components for finding and exploring cultural entities:

- EntitySearch.tsx: Search interface for finding cultural entities
- RelatedEntities.tsx: Shows entities connected to the current selection
- TrendingEntities.tsx: Displays currently trending content
- CrossDomainRecommendations.tsx: Recommends content across different domains

### Visualization Tools
Data visualization components for insights:

- WordCloudVisualization.tsx: Visual representation of related concepts
- GeoVisualization.tsx: Geographic mapping of cultural trends
- AudienceDemographics.tsx: Demographic breakdowns for cultural content

### AI Interface Components
Interactive AI components:

- TavusVideoAI.tsx: Video-based AI assistant interface
- ElevenLabsConvai.tsx: Voice-based conversational AI interface
- Conversation.tsx: Text-based conversational interface

## Configuration Details

### Tavus Video AI Setup
For detailed setup instructions for the Tavus Video AI component, see [TAVUS_SETUP.md](frontend/TAVUS_SETUP.md).

### Supabase Setup
For detailed setup instructions for Supabase authentication, see [SUPABASE_SETUP.md](frontend/SUPABASE_SETUP.md).

## License

This project is proprietary software. All rights reserved.

## Acknowledgments

- Qloo API for providing the cultural taste graph
- Perplexity AI for knowledge base capabilities
- Tavus for video AI technology
- ElevenLabs for voice AI technology 