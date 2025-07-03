'use client';

import { Container } from '@/components/ui/container';
import Header from '@/components/Header';
import Avatar from '@/components/Avatar';
import Conversation from '@/components/Conversation';
import { useRecordingState, useProcessingState, useConversationState } from '@/lib/store';
import dynamic from 'next/dynamic';
import { useAuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Dynamically import AudioRecorder with no SSR to prevent "Worker is not defined" error
const AudioRecorder = dynamic(
  () => import('@/components/AudioRecorder'),
  { ssr: false }
);

export default function Home() {
  const { isRecording } = useRecordingState();
  const { isProcessing } = useProcessingState();
  const { lastResponse, conversationHistory } = useConversationState();
  const { isAuthenticated, loading } = useAuthContext();

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center bg-background">
        <Container className="py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6 text-center">
              <span className="gradient-text">Curio</span> - Cultural Intelligence Assistant
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 text-center">
              Powered by Qloo's Taste AI™ - Discover connections across music, film, dining, fashion, and more.
            </p>

            {loading ? (
              <div className="w-full flex justify-center py-12">
                <div className="animate-pulse">Loading...</div>
              </div>
            ) : isAuthenticated ? (
              // Authenticated content
              <>
                {/* Avatar Section */}
                <div className="w-full flex justify-center mb-8">
                  <Avatar 
                    isListening={isRecording} 
                    isProcessing={isProcessing}
                  />
                </div>

                {/* Conversation History */}
                <div className="w-full bg-muted/30 p-6 rounded-lg mb-8">
                  <Conversation 
                    history={conversationHistory}
                    lastResponse={lastResponse}
                  />
                </div>

                {/* Audio Controls */}
                <div className="w-full flex justify-center mt-8">
                  <AudioRecorder />
                </div>
              </>
            ) : (
              // Unauthenticated content
              <div className="flex flex-col items-center gap-8 py-8">
                <div className="text-center max-w-2xl">
                  <h2 className="text-2xl font-semibold mb-4">Discover Your Cultural Connections</h2>
                  <p className="text-muted-foreground mb-6">
                    Curio uses Qloo's Taste AI™ to understand the intricate connections between your interests.
                    Discover new music, films, books, restaurants, and more based on your unique taste profile.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/signin">
                      <Button className="bg-qloo-yellow text-qloo-black hover:bg-qloo-yellow/90">Sign In</Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="outline" className="border-qloo-teal text-foreground hover:bg-qloo-teal/10">Create Account</Button>
                    </Link>
                  </div>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full">
                  <div className="bg-muted/30 p-6 rounded-lg border border-qloo-yellow/20">
                    <h3 className="text-xl font-medium mb-3 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-qloo-yellow flex items-center justify-center text-qloo-black mr-2">1</span>
                      Cross-Domain Recommendations
                    </h3>
                    <p className="text-muted-foreground">
                      Discover connections between music, movies, books, podcasts, restaurants, fashion, and travel based on your unique taste profile.
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20">
                    <h3 className="text-xl font-medium mb-3 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-qloo-teal flex items-center justify-center text-qloo-black mr-2">2</span>
                      Voice-Powered Cultural Assistant
                    </h3>
                    <p className="text-muted-foreground">
                      Ask questions naturally and get personalized recommendations that respect your privacy while understanding your preferences.
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 p-6 rounded-lg border border-qloo-teal/20">
                    <h3 className="text-xl font-medium mb-3 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-qloo-teal flex items-center justify-center text-qloo-black mr-2">3</span>
                      Taste Analysis
                    </h3>
                    <p className="text-muted-foreground">
                      Understand why you like what you like with deep cultural intelligence that reveals the patterns behind your preferences.
                    </p>
                  </div>
                  
                  <div className="bg-muted/30 p-6 rounded-lg border border-qloo-yellow/20">
                    <h3 className="text-xl font-medium mb-3 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-qloo-yellow flex items-center justify-center text-qloo-black mr-2">4</span>
                      Privacy-First Design
                    </h3>
                    <p className="text-muted-foreground">
                      Enjoy personalized recommendations without compromising your privacy, powered by Qloo's anonymous cultural intelligence.
                    </p>
                  </div>
                </div>

                {/* Qloo Hackathon Banner */}
                <div className="w-full mt-8 bg-gradient-to-r from-qloo-yellow/10 to-qloo-teal/10 p-6 rounded-lg border border-qloo-yellow/20">
                  <h3 className="text-xl font-medium mb-2">Qloo LLM Hackathon Entry</h3>
                  <p className="text-muted-foreground">
                    This project is part of the Qloo LLM Hackathon, exploring the integration of large language models with Qloo's Taste AI™ API to create more personalized, culturally-aware experiences.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Container>
      </main>
    </>
  );
}
