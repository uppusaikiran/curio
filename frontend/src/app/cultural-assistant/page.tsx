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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6 text-center">
              <span className="gradient-text">Cultural</span> Assistant
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-center">
              Experience the fusion of Qloo's cultural intelligence with advanced language models. 
              Get personalized recommendations and insights based on your interests and cultural context.
            </p>
            <CulturalAssistant />
          </div>
        </Container>
      </main>
    </>
  );
} 