import React from 'react';
import { Metadata } from 'next';
import CulturalAssistant from '@/components/cultural-assistant/CulturalAssistant';
import Header from '@/components/Header';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = {
  title: 'Cultural Assistant | Curio',
  description: 'Explore personalized recommendations powered by Qloo\'s cultural intelligence and LLM insights',
};

export default function CulturalAssistantPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center bg-background">
        <Container className="py-16">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6 text-center">
              <span className="gradient-text">Cultural</span> Assistant
            </h1>
            <p className="text-lg text-muted-foreground mb-4 text-center">
              Experience the fusion of Qloo's cultural intelligence with advanced language models. 
              Get personalized recommendations and insights based on your interests and cultural context.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <div className="bg-muted/30 p-4 rounded-lg border border-qloo-teal/20 text-center">
                <h3 className="text-lg font-medium mb-2">Entity Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Explore detailed cultural analysis of movies, music, books, and more using Qloo's comprehensive entity database.
                </p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg border border-qloo-teal/20 text-center">
                <h3 className="text-lg font-medium mb-2">Cultural Connections</h3>
                <p className="text-sm text-muted-foreground">
                  Discover how your interests connect across different domains with Qloo's cross-category affinity insights.
                </p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg border border-qloo-teal/20 text-center">
                <h3 className="text-lg font-medium mb-2">Smart Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized recommendations powered by Qloo's AI models that understand your unique taste profile.
                </p>
              </div>
            </div>
            
            <div className="bg-qloo-teal/10 p-6 rounded-lg border border-qloo-teal/20 mb-10">
              <h2 className="text-xl font-semibold mb-2 text-center">Powered by Qloo's Cultural Intelligence</h2>
              <p className="text-sm text-center mb-4">
                Qloo's AI models analyze over half a billion cultural entities across music, film, TV, books, podcasts, 
                restaurants, fashion, and more to provide uniquely personalized recommendations.
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-qloo-teal mr-2"></span>
                  <span>500M+ Entities</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-qloo-teal mr-2"></span>
                  <span>Cultural Metadata</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-qloo-teal mr-2"></span>
                  <span>Cross-Domain Insights</span>
                </div>
              </div>
            </div>
            
            <CulturalAssistant />
            
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-qloo-teal/20 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select Entities</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose movies, music, books, or other cultural entities that interest you
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-qloo-teal/20 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Explore Features</h3>
                  <p className="text-sm text-muted-foreground">
                    Ask questions, analyze entities, or discover personalized recommendations
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-qloo-teal/20 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Gain Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive AI-powered cultural insights based on Qloo's vast knowledge graph
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
} 