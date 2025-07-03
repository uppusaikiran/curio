'use client';

import { Container } from '@/components/ui/container';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center bg-background">
        <Container className="py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6">
              About <span className="text-primary">Curio</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Curio is an AI voice assistant designed to provide meaningful, natural conversations through advanced speech recognition and natural language processing.
            </p>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  We're building the next generation of AI assistants that can understand context, remember conversations, and provide genuinely helpful responses. Our goal is to make AI interactions feel more human and less robotic.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
                <p className="text-muted-foreground mb-4">
                  Curio uses cutting-edge speech recognition to convert your voice into text, processes your requests using advanced language models, and responds with natural-sounding speech.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <h3 className="font-medium mb-2">Voice Recognition</h3>
                    <p className="text-sm text-muted-foreground">High-accuracy speech-to-text conversion that understands various accents and speaking styles.</p>
                  </div>
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <h3 className="font-medium mb-2">AI Processing</h3>
                    <p className="text-sm text-muted-foreground">Advanced language models that understand context and generate meaningful responses.</p>
                  </div>
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <h3 className="font-medium mb-2">Natural Speech</h3>
                    <p className="text-sm text-muted-foreground">Text-to-speech technology that sounds natural and expressive.</p>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Privacy & Security</h2>
                <p className="text-muted-foreground">
                  Your privacy is our priority. All conversations are encrypted, and you have full control over your data. We never sell or share your personal information with third parties.
                </p>
              </section>
            </div>
            
            <div className="mt-12 flex justify-center">
              <Link href="/">
                <Button size="lg">Try Curio Now</Button>
              </Link>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
} 