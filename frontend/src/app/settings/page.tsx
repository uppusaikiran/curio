'use client';

import { Container } from '@/components/ui/container';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Trash2, Save, Volume2, Mic, Clock } from 'lucide-react';

export default function SettingsPage() {
  const { clearConversation } = useAppStore();
  const [voicePreference, setVoicePreference] = useState('female');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleSaveSettings = () => {
    // In a real app, this would save to backend/localStorage
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };
  
  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your conversation history? This cannot be undone.')) {
      clearConversation();
    }
  };

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center bg-background">
        <Container className="py-16">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter mb-8">
              Settings
            </h1>
            
            <div className="space-y-12">
              {/* Voice Settings */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-semibold">Voice Settings</h2>
                </div>
                
                <div className="bg-muted/30 p-6 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Assistant Voice</label>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant={voicePreference === 'female' ? 'default' : 'outline'} 
                        onClick={() => setVoicePreference('female')}
                      >
                        Female
                      </Button>
                      <Button 
                        variant={voicePreference === 'male' ? 'default' : 'outline'} 
                        onClick={() => setVoicePreference('male')}
                      >
                        Male
                      </Button>
                      <Button 
                        variant={voicePreference === 'neutral' ? 'default' : 'outline'} 
                        onClick={() => setVoicePreference('neutral')}
                      >
                        Neutral
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Voice Speed</label>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2" 
                      step="0.1" 
                      defaultValue="1" 
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Slower</span>
                      <span>Normal</span>
                      <span>Faster</span>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Recording Settings */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mic className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-semibold">Recording Settings</h2>
                </div>
                
                <div className="bg-muted/30 p-6 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Auto-send after silence</label>
                    <div className="flex items-center">
                      <input type="checkbox" id="auto-send" className="mr-2" />
                      <label htmlFor="auto-send" className="text-sm text-muted-foreground">Enable</label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Silence threshold (seconds)</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      step="0.5" 
                      defaultValue="2" 
                      className="w-full"
                      disabled
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1s</span>
                      <span>3s</span>
                      <span>5s</span>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Privacy Settings */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-semibold">History & Privacy</h2>
                </div>
                
                <div className="bg-muted/30 p-6 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Save conversation history</label>
                    <div className="flex items-center">
                      <input type="checkbox" id="save-history" className="mr-2" defaultChecked />
                      <label htmlFor="save-history" className="text-sm text-muted-foreground">Enable</label>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleClearHistory}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear Conversation History
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      This will permanently delete all your conversation history.
                    </p>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="mt-12 flex justify-end">
              <Button 
                onClick={handleSaveSettings} 
                className="flex items-center gap-2"
                size="lg"
              >
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
              
              {saveSuccess && (
                <div className="ml-4 text-green-500 flex items-center">
                  Settings saved successfully!
                </div>
              )}
            </div>
          </div>
        </Container>
      </main>
    </>
  );
} 