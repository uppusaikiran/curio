'use client';

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

export type Response = {
  text: string;
  audioUrl: string | null;
};

export type ConversationEntry = {
  userAudioUrl: string;
  aiResponse: Response;
};

// State interface
export interface AppState {
  // State
  isRecording: boolean;
  isProcessing: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  lastResponse: Response | null;
  conversationHistory: ConversationEntry[];
  
  // Actions
  setIsRecording: (isRecording: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setAudioBlob: (blob: Blob | null) => void;
  setAudioUrl: (url: string | null) => void;
  setLastResponse: (response: Response | null) => void;
  addToHistory: (entry: ConversationEntry) => void;
  resetAudio: () => void;
  clearConversation: () => void;
}

// Create store
export const useAppStore = create<AppState>((set) => ({
  // Initial state
  isRecording: false,
  isProcessing: false,
  audioBlob: null,
  audioUrl: null,
  lastResponse: null,
  conversationHistory: [],
  
  // Actions
  setIsRecording: (isRecording) => set({ isRecording }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setAudioBlob: (blob) => set({ audioBlob: blob }),
  setAudioUrl: (url) => set({ audioUrl: url }),
  setLastResponse: (response) => set({ lastResponse: response }),
  addToHistory: (entry) => set((state) => ({
    conversationHistory: [...state.conversationHistory, entry]
  })),
  resetAudio: () => set({ audioBlob: null, audioUrl: null }),
  clearConversation: () => set({ conversationHistory: [], lastResponse: null }),
}));

// Selector hooks with proper typing
export const useRecordingState = () => {
  return useAppStore(
    useShallow((state) => ({
      isRecording: state.isRecording,
      setIsRecording: state.setIsRecording
    }))
  );
};

export const useProcessingState = () => {
  return useAppStore(
    useShallow((state) => ({
      isProcessing: state.isProcessing,
      setIsProcessing: state.setIsProcessing
    }))
  );
};

export const useAudioState = () => {
  return useAppStore(
    useShallow((state) => ({
      audioBlob: state.audioBlob,
      audioUrl: state.audioUrl,
      setAudioBlob: state.setAudioBlob,
      setAudioUrl: state.setAudioUrl,
      resetAudio: state.resetAudio
    }))
  );
};

export const useConversationState = () => {
  return useAppStore(
    useShallow((state) => ({
      lastResponse: state.lastResponse,
      conversationHistory: state.conversationHistory,
      setLastResponse: state.setLastResponse,
      addToHistory: state.addToHistory,
      clearConversation: state.clearConversation
    }))
  );
}; 