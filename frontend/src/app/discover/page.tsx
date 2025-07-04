'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import EntitySearch from '@/components/discovery/EntitySearch';
import EntityAnalysis from '@/components/discovery/EntityAnalysis';
import RelatedEntities from '@/components/discovery/RelatedEntities';
import TrendingEntities from '@/components/discovery/TrendingEntities';
import { QlooEntity } from '@/types/qloo';
import { Container } from '@/components/ui/container';
import Header from '@/components/Header';
import { isApiConfigured } from '@/lib/qlooService';
import Link from 'next/link';

export default function DiscoveryDashboard() {
  const [selectedEntity, setSelectedEntity] = useState<QlooEntity | null>(null);
  const apiConfigured = isApiConfigured();
  
  // Handle entity selection from any component
  const handleEntitySelect = (entity: QlooEntity) => {
    console.log('Selected entity:', entity);
    setSelectedEntity(entity);
    
    // Scroll to analysis section when an entity is selected
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        document.getElementById('entity-analysis')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };
  
  if (!apiConfigured) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>API Key Missing:</strong> You need to configure the Qloo API key to use this feature.
              </p>
              <p className="text-sm text-red-700 mt-2">
                Add a <code className="bg-red-100 px-1 py-0.5 rounded">.env.local</code> file to your project root with:
              </p>
              <pre className="bg-red-100 p-2 rounded mt-2 text-sm overflow-x-auto">
                NEXT_PUBLIC_QLOO_API_URL=https://hackathon.api.qloo.com<br />
                NEXT_PUBLIC_QLOO_API_KEY=your_api_key_here
              </pre>
              <p className="text-sm text-red-700 mt-2">
                Then restart the development server.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center bg-background">
        <Container className="py-16">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6">
                <span className="gradient-text">Explore Your</span> Cultural Universe
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Discover connections between your interests and explore new recommendations powered by Qloo's Taste AI™.
              </p>
            </motion.div>
            
            {/* Search Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <EntitySearch onEntitySelect={handleEntitySelect} />
            </motion.div>
            
            {/* Trending Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <TrendingEntities onEntitySelect={handleEntitySelect} />
            </motion.div>
            
            {/* Analysis Section */}
            {selectedEntity && (
              <motion.div
                id="entity-analysis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
              >
                <EntityAnalysis entity={selectedEntity} />
                <RelatedEntities entity={selectedEntity} onEntitySelect={handleEntitySelect} />
              </motion.div>
            )}
            
            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Discover More with Qloo API
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-muted/30 p-6 rounded-lg border border-qloo-yellow/20">
                  <h3 className="text-xl font-medium mb-3 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-qloo-yellow flex items-center justify-center text-qloo-black mr-2">1</span>
                    Location Insights
                  </h3>
                  <p className="text-muted-foreground">
                    Discover cultural preferences across different geographic regions and explore tastes that are popular in specific locations.
                  </p>
                </div>
                
                <div className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20">
                  <h3 className="text-xl font-medium mb-3 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-qloo-teal flex items-center justify-center text-qloo-black mr-2">2</span>
                    Audience Analysis
                  </h3>
                  <p className="text-muted-foreground">
                    Understand the demographic makeup of audiences interested in specific content, helping creators tailor their work to target markets.
                  </p>
                </div>
                
                <div className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20">
                  <h3 className="text-xl font-medium mb-3 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-qloo-teal flex items-center justify-center text-qloo-black mr-2">3</span>
                    Taste Analysis
                  </h3>
                  <p className="text-muted-foreground">
                    Dive deep into tag metadata and understand the nuanced connections between cultural preferences and individual taste profiles.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </main>
    </>
  );
} 