'use client';

import { Button } from '@/components/ui/button';
import { Mic, Pause, Send, Loader2 } from 'lucide-react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { useRecordingState, useAudioState, useProcessingState, useConversationState } from '@/lib/store';
import { useEffect } from 'react';

export default function AudioRecorder() {
  const { isRecording, setIsRecording } = useRecordingState();
  const { audioUrl, setAudioBlob, setAudioUrl, resetAudio } = useAudioState();
  const { isProcessing, setIsProcessing } = useProcessingState();
  const { setLastResponse, addToHistory } = useConversationState();
  
  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl, blob) => {
      setAudioBlob(blob);
      setAudioUrl(blobUrl);
    },
  });

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleRecordToggle = () => {
    if (status === 'recording') {
      stopRecording();
      setIsRecording(false);
    } else {
      resetAudio();
      clearBlobUrl();
      startRecording();
      setIsRecording(true);
    }
  };

  const handleSendAudio = async () => {
    if (mediaBlobUrl) {
      // Simulate sending to backend and processing
      setIsProcessing(true);
      
      // Simulate a delay for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate receiving a response
      const mockResponse = {
        text: "I heard you! This is a simulated response from the AI assistant. In a real implementation, this would be generated based on your audio input.",
        audioUrl: null
      };
      
      // Update state with the response
      setLastResponse(mockResponse);
      addToHistory({
        userAudioUrl: mediaBlobUrl,
        aiResponse: mockResponse
      });
      
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <div className="flex items-center gap-4">
        {/* Recording Button */}
        <Button
          size="lg"
          variant={status === 'recording' ? 'destructive' : 'default'}
          className="h-16 w-16 rounded-full shadow-lg"
          onClick={handleRecordToggle}
          disabled={isProcessing}
        >
          {status === 'recording' ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>

        {/* Send Button - only show if we have recorded audio */}
        {mediaBlobUrl && !isProcessing && (
          <Button
            size="lg"
            className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
            onClick={handleSendAudio}
          >
            <Send className="h-8 w-8" />
          </Button>
        )}
        
        {/* Processing indicator */}
        {isProcessing && (
          <Button
            size="lg"
            variant="outline"
            className="h-16 w-16 rounded-full shadow-lg"
            disabled
          >
            <Loader2 className="h-8 w-8 animate-spin" />
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {isProcessing 
          ? 'Processing your message...' 
          : status === 'recording' 
            ? 'Click to stop recording' 
            : mediaBlobUrl 
              ? 'Click to send your message' 
              : 'Click to start recording'}
      </p>

      {/* Audio Playback - only show if we have recorded audio */}
      {mediaBlobUrl && (
        <div className="mt-4 w-full">
          <audio src={mediaBlobUrl} controls className="w-full" />
        </div>
      )}
    </div>
  );
} 