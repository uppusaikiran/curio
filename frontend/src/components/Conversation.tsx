'use client';

import { useEffect, useRef } from 'react';
import { type Response, type ConversationEntry } from '@/lib/store';

interface ConversationProps {
  history: ConversationEntry[];
  lastResponse: Response | null;
}

export default function Conversation({ history, lastResponse }: ConversationProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, lastResponse]);

  return (
    <div className="w-full max-h-[50vh] overflow-y-auto rounded-lg bg-background/50 p-4 shadow-sm border">
      {history.length === 0 && !lastResponse ? (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <p className="text-muted-foreground">
            Start a conversation by recording your voice.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Conversation history */}
          {history.map((entry, index) => (
            <div key={index} className="space-y-4">
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm text-foreground">
                    {entry.userAudioUrl ? (
                      <audio src={entry.userAudioUrl} controls className="max-w-full" />
                    ) : (
                      "Your audio message"
                    )}
                  </p>
                </div>
              </div>
              
              {/* AI response */}
              <div className="flex justify-start">
                <div className="bg-primary/20 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm text-foreground">{entry.aiResponse.text}</p>
                  {entry.aiResponse.audioUrl && (
                    <audio src={entry.aiResponse.audioUrl} controls className="mt-2 max-w-full" />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Latest response if not yet in history */}
          {lastResponse && (
            <div className="flex justify-start">
              <div className="bg-primary/20 rounded-lg p-3 max-w-[80%]">
                <p className="text-sm text-foreground">{lastResponse.text}</p>
                {lastResponse.audioUrl && (
                  <audio src={lastResponse.audioUrl} controls className="mt-2 max-w-full" />
                )}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
} 