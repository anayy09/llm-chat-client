import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Skeleton,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Send,
  Mic,
  MicOff,
  Stop,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { MessageBubble } from './MessageBubble';
import { useChat } from '../hooks/useChat';
import { useSpeech } from '../hooks/useSpeech';

export const ChatWindow: React.FC = () => {
  const { activeChat, chats, isLoading } = useSelector((state: RootState) => state.chat);
  const { apiKey } = useSelector((state: RootState) => state.settings);
  
  const [input, setInput] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { sendMessage, stopGeneration } = useChat();
  const { isRecording, isTranscribing, startRecording, stopRecording } = useSpeech();

  const currentChat = chats.find(c => c.id === activeChat);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !apiKey) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
    if (e.key === 'ArrowUp' && input === '' && currentChat?.messages.length) {
      const lastUserMessage = [...currentChat.messages]
        .reverse()
        .find(m => m.role === 'user');
      if (lastUserMessage) {
        setInput(lastUserMessage.content);
      }
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      try {
        const transcription = await stopRecording();
        setInput(prev => prev + transcription);
        inputRef.current?.focus();
      } catch (error) {
        console.error('Transcription failed:', error);
      }
    } else {
      await startRecording();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (!apiKey) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h5" color="text.secondary">
          Welcome to LLM Chat
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please set your API key in settings to get started
        </Typography>
      </Box>
    );
  }

  if (!currentChat) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select a chat or create a new one
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Messages */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 2,
        }}
      >
        {currentChat.messages.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2,
              px: 4,
            }}
          >
            <Typography variant="h5" color="text.secondary">
              Start a conversation
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              Ask me anything! I'm powered by {currentChat.model}
            </Typography>
          </Box>
        ) : (
          <>
            {currentChat.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <Box sx={{ px: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'secondary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography variant="caption" color="white">AI</Typography>
                  </Box>
                  <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="40%" />
                  </Paper>
                </Box>
              </Box>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Fab
          size="small"
          onClick={scrollToBottom}
          sx={{
            position: 'absolute',
            bottom: 100,
            right: 24,
            zIndex: 1,
          }}
        >
          <KeyboardArrowDown />
        </Fab>
      )}

      {/* Input */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          m: 2,
          mt: 0,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end',
          }}
        >
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Ctrl+Enter to send, ↑ to edit last)"
            disabled={isLoading}
            variant="outlined"
            size="small"
          />
          
          <Tooltip title={isRecording ? 'Stop recording' : 'Voice input'}>
            <IconButton
              onClick={handleVoiceInput}
              disabled={isTranscribing}
              color={isRecording ? 'error' : 'default'}
            >
              {isRecording ? <MicOff /> : <Mic />}
            </IconButton>
          </Tooltip>

          {isLoading ? (
            <Tooltip title="Stop generation">
              <IconButton onClick={stopGeneration} color="error">
                <Stop />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Send message (Ctrl+Enter)">
              <IconButton
                type="submit"
                disabled={!input.trim() || !apiKey}
                color="primary"
              >
                <Send />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        {isTranscribing && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Transcribing audio...
          </Typography>
        )}
      </Paper>
    </Box>
  );
};