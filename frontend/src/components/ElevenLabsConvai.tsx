'use client';

import React, { useEffect, useRef } from 'react';

interface ElevenLabsConvaiProps {
  agentId: string;
  className?: string;
}

export default function ElevenLabsConvai({ agentId, className = '' }: ElevenLabsConvaiProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the elevenlabs-convai element
    const convaiElement = document.createElement('elevenlabs-convai');
    convaiElement.setAttribute('agent-id', agentId);

    // Clear container and append the element
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(convaiElement);

    // Add custom styles to the ElevenLabs widget when it's loaded
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Try to find and style the widget's elements
          const shadowRoot = containerRef.current?.querySelector('elevenlabs-convai')?.shadowRoot;
          if (shadowRoot) {
            // Insert custom styles into the shadow DOM
            const style = document.createElement('style');
            style.textContent = `
              :host {
                --convai-primary-color: var(--qloo-teal, #10B981) !important;
                --convai-secondary-color: var(--qloo-yellow, #F59E0B) !important;
              }
              .convai-container {
                border-radius: 12px !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
                max-width: 100% !important;
              }
            `;
            shadowRoot.appendChild(style);
          }
        }
      });
    });

    // Start observing the container for changes
    observer.observe(containerRef.current, { childList: true, subtree: true });

    // Clean up the observer when component unmounts
    return () => {
      observer.disconnect();
    };
  }, [agentId]);

  return (
    <div 
      ref={containerRef} 
      className={`elevenlabs-convai-container w-full max-w-md ${className}`}
      style={{
        minHeight: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    />
  );
} 