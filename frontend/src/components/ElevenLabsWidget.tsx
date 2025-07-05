'use client';

import React from 'react';
import Script from 'next/script';
import ElevenLabsConvai from './ElevenLabsConvai';

export default function ElevenLabsWidget() {
  // This is the agent ID for the Curio assistant
  const agentId = "agent_01jzdph785fsgvcraz9rcsgj0y";
  
  return (
    <>
      <Script 
        src="https://unpkg.com/@elevenlabs/convai-widget-embed" 
        strategy="afterInteractive"
      />
      <div className="fixed bottom-4 right-4 z-40">
        <ElevenLabsConvai 
          agentId={agentId}
          className="elevenlabs-global-widget"
        />
      </div>
    </>
  );
} 