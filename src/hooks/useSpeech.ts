import { useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { createLiteLLMClient } from '../lib/litellm';

export const useSpeech = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const { apiKey } = useSelector((state: RootState) => state.settings);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, []);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || !apiKey) {
        reject(new Error('No recording in progress or API key missing'));
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          setIsTranscribing(true);
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          
          const client = createLiteLLMClient(apiKey);
          const transcription = await client.transcribeAudio(audioBlob);
          
          resolve(transcription);
        } catch (error) {
          reject(error);
        } finally {
          setIsTranscribing(false);
          setIsRecording(false);
          
          // Stop all tracks
          if (mediaRecorderRef.current?.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, [apiKey]);

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
  };
};