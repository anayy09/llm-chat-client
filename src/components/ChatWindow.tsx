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
  Image as ImageIcon,
  ScatterPlot,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { MessageBubble } from './MessageBubble';
import { useChat } from '../hooks/useChat';
import { useSpeech } from '../hooks/useSpeech';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useEmbedding } from '../hooks/useEmbedding';
import { addMessage, setLoading } from '../store/chatSlice';
import type { Message } from '../types';

export const ChatWindow: React.FC = () => {
  const { activeChat, chats, isLoading } = useSelector((state: RootState) => state.chat);
  const { apiKey } = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();
  
  const [input, setInput] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { sendMessage, stopGeneration } = useChat();
  const { isRecording, isTranscribing, startRecording, stopRecording } = useSpeech();
  const generateImage = useImageGeneration();
  const createEmbedding = useEmbedding();

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

  const handleImageGeneration = async () => {
    if (!input.trim() || !activeChat) return;
    const prompt = input.trim();
    setInput('');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };
    dispatch(addMessage({ chatId: activeChat, message: userMessage }));

    try {
      dispatch(setLoading(true));
      const url = await generateImage(prompt);
      const assistant: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `![${prompt}](${url})`,
        timestamp: Date.now(),
      };
      dispatch(addMessage({ chatId: activeChat, message: assistant }));
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleEmbedding = async () => {
    if (!input.trim() || !activeChat) return;
    const text = input.trim();
    setInput('');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    dispatch(addMessage({ chatId: activeChat, message: userMessage }));

    try {
      dispatch(setLoading(true));
      const vector = await createEmbedding(text);
      const assistant: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Embedding: ${JSON.stringify(vector)}`,
        timestamp: Date.now(),
      };
      dispatch(addMessage({ chatId: activeChat, message: assistant }));
    } catch (error) {
      console.error('Embedding failed:', error);
    } finally {
      dispatch(setLoading(false));
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
        elevation={4}
        sx={(theme) => ({
          p: 2,
          m: 2,
          mt: 0,
          borderRadius: 3,
          backdropFilter: 'blur(6px)',
          background: `linear-gradient(135deg, ${theme.palette.background.paper}80 0%, ${theme.palette.background.paper}CC 100%)`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        })}
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
            placeholder="Send a message…"
            disabled={isLoading}
            variant="filled"
            // size="medium"
            InputProps={{ disableUnderline: true }}
            sx={(theme) => ({
              '& .MuiFilledInput-root': {
                padding: '8px 12px',
                background:
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(90deg, #fff 0%, #f3f4f6 100%)'
                    : 'linear-gradient(90deg, #1e1e1e 0%, #2a2a2a 100%)',
                borderRadius: 2,
              },
            })}
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

          <Tooltip title="Generate image">
            <IconButton onClick={handleImageGeneration} disabled={!input.trim() || !apiKey}>
              <ImageIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Create embedding">
            <IconButton onClick={handleEmbedding} disabled={!input.trim() || !apiKey}>
              <ScatterPlot />
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