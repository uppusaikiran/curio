'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X, RefreshCw, PhoneCall, AlertTriangle, Video } from 'lucide-react';

interface TavusVideoAIProps {
  className?: string;
  replicaId: string;
  personaId: string;
  apiKey: string;
}

export default function TavusVideoAI({ 
  className = '', 
  replicaId, 
  personaId, 
  apiKey 
}: TavusVideoAIProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);

  // DEBUG: Log component mount
  useEffect(() => {
    console.log('TavusVideoAI component mounted', { replicaId, personaId, apiKey: apiKey ? 'set' : 'not set' });
  }, [replicaId, personaId, apiKey]);

  // Fetch existing conversations on mount
  useEffect(() => {
    if (isOpen && apiKey) {
      fetchConversations();
    }
  }, [isOpen, apiKey]);

  // Fetch existing conversations
  const fetchConversations = async () => {
    if (!apiKey) {
      setError("API key is not provided");
      return;
    }
    
    try {
      const response = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch conversations: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fetched conversations:', data);
      setConversations(data.conversations || []);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(`Failed to fetch existing conversations: ${err.message}`);
    }
  };

  // Delete all existing conversations
  const deleteAllConversations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Process each conversation and delete it if it has a valid ID
      for (const conversation of conversations) {
        if (conversation && conversation.id) {
          try {
            console.log(`Deleting conversation: ${conversation.id}`);
            const response = await fetch(`https://tavusapi.com/v2/conversations/${conversation.id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
              }
            });
            
            if (!response.ok) {
              console.warn(`Failed to delete conversation ${conversation.id}: ${response.status}`);
            }
          } catch (err) {
            console.warn(`Error during deletion of conversation ${conversation.id}:`, err);
            // Continue with next conversation even if one fails
          }
        }
      }
      
      // Clear the local conversations array
      setConversations([]);
      setActiveConversationId(null);
      setVideoUrl(null);
      setIsCallActive(false);
    } catch (err: any) {
      console.error('Error deleting conversations:', err);
      setError(`Failed to delete conversations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create a new conversation
  const createNewConversation = async () => {
    if (!apiKey || !replicaId || !personaId) {
      setError("Missing required configuration: API key, replica ID, or persona ID");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        replica_id: replicaId,
        persona_id: personaId,
        // Add required properties based on the API documentation
        properties: {
          max_call_duration: 3600,
          participant_absent_timeout: 300,
          enable_recording: false
        }
      };
      
      console.log('Creating conversation with payload:', payload);
      
      const response = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API error response:', errorData);
        throw new Error(`Failed to create conversation: ${response.status} - ${errorData}`);
      }
      
      const data = await response.json();
      console.log('Conversation created:', data);
      setActiveConversationId(data.conversation_id);
      
      // Add the new conversation to the list
      setConversations(prevConversations => [...prevConversations, data]);
      
      // Store the conversation_url from the API response
      setVideoUrl(data.conversation_url);
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      setError(`Failed to create conversation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Start fresh - delete all conversations and create a new one
  const startFresh = async () => {
    try {
      await deleteAllConversations();
      await createNewConversation();
    } catch (err: any) {
      console.error('Error in startFresh:', err);
      setError(`Error refreshing conversations: ${err.message}`);
      setLoading(false);
    }
  };

  // Join the current conversation
  const joinConversation = () => {
    setIsCallActive(true);
  };

  // End the current call
  const endCall = () => {
    setIsCallActive(false);
  };

  // Toggle the widget open/closed
  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsCallActive(false);
    }
  };

  // Open conversation in a new tab
  const openInNewTab = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

  // Show API key configuration screen
  const showConfigScreen = () => {
    // If no API key, show a demo with static image
    setVideoUrl('/curio_video_ai_screenshot.png');
  };

  // Render the closed state (just the button)
  if (!isOpen) {
    return (
      <div className={`fixed right-4 top-20 z-50 ${className}`}>
        <Button 
          onClick={toggleWidget}
          className="rounded-full w-20 h-20 bg-qloo-teal hover:bg-qloo-teal/90 text-qloo-black shadow-lg"
          aria-label="Open Curio Video Chat"
        >
          <Video size={40} />
        </Button>
      </div>
    );
  }

  // Render the open widget
  return (
    <div className={`fixed right-4 top-20 z-50 ${className}`}>
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg w-120 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-medium text-lg">Curio Video Chat</h3>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10"
              onClick={startFresh} 
              disabled={loading || !apiKey}
              title="Reset Conversations"
              aria-label="Reset Conversations"
            >
              <RefreshCw size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10"
              onClick={toggleWidget}
              aria-label="Close Curio Video Chat"
            >
              <X size={20} />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          {/* Error message */}
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4 text-sm overflow-auto max-h-32">
              {error}
            </div>
          )}
          
          {/* API Key missing warning */}
          {!apiKey && (
            <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4 text-sm">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 mr-2 flex-shrink-0" />
                <p className="text-base">
                  Tavus API key is not configured. Add <code>NEXT_PUBLIC_TAVUS_API_KEY</code> to your <code>.env.local</code> file.
                </p>
              </div>
              <div className="mt-3 flex justify-center">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={showConfigScreen}
                  className="text-base py-2 px-4"
                >
                  Show Demo Preview
                </Button>
              </div>
            </div>
          )}
          
          {/* Video display */}
          {videoUrl ? (
            <>
              <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                {isCallActive ? (
                  // Embedded conversation iframe
                  <iframe 
                    src={videoUrl}
                    className="w-full h-full border-0"
                    allow="camera; microphone; autoplay; display-capture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  // Preview image before joining
                  <>
                    <Image 
                      src="/curio_video_ai_screenshot.png" 
                      alt="Video AI Preview" 
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Button 
                        onClick={joinConversation}
                        className="bg-green-500 hover:bg-green-600 text-white py-3 px-6"
                        size="lg"
                      >
                        <PhoneCall size={20} className="mr-2" /> Join Call
                      </Button>
                    </div>
                  </>
                )}
              </div>
              
              {/* Call controls */}
              <div className="mt-4 flex justify-between">
                {isCallActive ? (
                  <Button 
                    onClick={endCall}
                    variant="destructive"
                    size="lg"
                    className="w-full py-3"
                  >
                    End Call
                  </Button>
                ) : (
                  <Button
                    onClick={openInNewTab}
                    variant="outline"
                    size="lg"
                    className="w-full py-3"
                    disabled={!videoUrl.startsWith('http')}
                  >
                    Open in New Tab
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center min-h-[240px]">
              {loading ? (
                <div className="animate-spin h-10 w-10 border-4 border-qloo-teal border-t-transparent rounded-full" />
              ) : (
                <Button 
                  onClick={createNewConversation} 
                  disabled={loading || !apiKey}
                  size="lg"
                  className="py-6 px-8 text-lg"
                >
                  Start Curio Chat
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 