'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

export interface AvatarProps {
  className?: string;
  isListening?: boolean;
  isProcessing?: boolean;
}

export default function Avatar({ 
  className,
  isListening = false,
  isProcessing = false
}: AvatarProps) {
  const [animationState, setAnimationState] = useState<'idle' | 'listening' | 'processing'>('idle');
  
  // Update animation state based on props
  useEffect(() => {
    if (isProcessing) {
      setAnimationState('processing');
    } else if (isListening) {
      setAnimationState('listening');
    } else {
      setAnimationState('idle');
    }
  }, [isListening, isProcessing]);
  
  return (
    <div className={cn(
      "relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40",
      className
    )}>
      {/* Base circle */}
      <div className="absolute inset-0 rounded-full bg-qloo-yellow/10"></div>
      
      {/* Animated circles based on state */}
      {animationState === 'listening' && (
        <>
          <div className="absolute inset-0 rounded-full bg-qloo-yellow/20 animate-ping-slow"></div>
          <div className="absolute inset-2 rounded-full bg-qloo-teal/20 animate-ping-fast"></div>
        </>
      )}
      
      {animationState === 'processing' && (
        <>
          <div className="absolute inset-0 rounded-full bg-qloo-teal/20 animate-pulse"></div>
          <div className="absolute h-16 w-16 rounded-full bg-qloo-yellow/20 animate-bounce"></div>
        </>
      )}
      
      {/* Inner circle with gradient background */}
      <div 
        className="relative z-10 flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-full shadow-lg overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--qloo-yellow) 0%, var(--qloo-teal) 100%)'
        }}
      >
        <div className="absolute inset-0.5 rounded-full bg-background flex items-center justify-center">
          <Globe className="h-12 w-12 md:h-16 md:w-16 text-qloo-yellow" />
        </div>
      </div>
    </div>
  );
} 