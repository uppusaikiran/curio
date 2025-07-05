'use client';

import { Container } from './container';
import Link from 'next/link';
import { Globe, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from './button';
import { useTheme } from '@/providers/ThemeProvider';

export function Footer() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background py-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-qloo-yellow" />
              <span className="font-bold text-2xl">
                <span className="gradient-text">Curio</span>
              </span>
              <span className="bg-qloo-teal text-qloo-black text-xs px-2 py-1 rounded-full">Taste AI™</span>
            </div>
            <p className="text-muted-foreground">
              Curio is an AI voice assistant designed to provide meaningful, natural conversations through advanced speech recognition and natural language processing.
            </p>
            <div className="flex space-x-4">
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Github className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Twitter className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Linkedin className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="mailto:info@example.com">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Mail className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* How It Works Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">How It Works</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="bg-qloo-yellow/20 p-2 rounded-full mt-1">
                  <span className="text-xs font-bold text-qloo-yellow">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Voice Recognition</h4>
                  <p className="text-sm text-muted-foreground">High-accuracy speech-to-text conversion that understands various accents and speaking styles.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-qloo-teal/20 p-2 rounded-full mt-1">
                  <span className="text-xs font-bold text-qloo-teal">2</span>
                </div>
                <div>
                  <h4 className="font-medium">AI Processing</h4>
                  <p className="text-sm text-muted-foreground">Advanced language models that understand context and generate meaningful responses.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="bg-qloo-yellow/20 p-2 rounded-full mt-1">
                  <span className="text-xs font-bold text-qloo-yellow">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Natural Speech</h4>
                  <p className="text-sm text-muted-foreground">Text-to-speech technology that sounds natural and expressive.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link href="/discover" className="text-muted-foreground hover:text-foreground transition-colors">Discover</Link>
              <Link href="/cultural-assistant" className="text-muted-foreground hover:text-foreground transition-colors">Cultural Assistant</Link>
              <Link href="/cultural-tools" className="text-muted-foreground hover:text-foreground transition-colors">Taste Explorer</Link>
              <Link href="/signin" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">Sign Up</Link>
              <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
            </div>
            
            <div className="pt-4 mt-4 border-t border-border/40">
              <h4 className="font-medium mb-2">Privacy & Security</h4>
              <p className="text-sm text-muted-foreground">
                Your privacy is our priority. All conversations are encrypted, and you have full control over your data.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Curio. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
} 