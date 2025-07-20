import { memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ContentCopy,
  Person,
  SmartToy,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = memo<MessageBubbleProps>(({ message }) => {
  const { darkMode } = useSelector((state: RootState) => state.settings);
  
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        px: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          maxWidth: '80%',
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isUser ? 'primary.main' : 'secondary.main',
            color: 'white',
            flexShrink: 0,
          }}
        >
          {isUser ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
        </Box>

        <Paper
          elevation={3}
          sx={(theme) => ({
            p: 2,
            background: isUser
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              : theme.palette.background.paper,
            color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
            borderRadius: 3,
            position: 'relative',
            boxShadow: 3,
            '&:hover .copy-button': {
              opacity: 1,
            },
          })}
        >
          {isAssistant ? (
            <ReactMarkdown
              urlTransform={uri => uri}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  
                  if (!inline && language) {
                    return (
                      <Box sx={{ position: 'relative' }}>
                        <SyntaxHighlighter
                          style={darkMode ? oneDark : oneLight}
                          language={language}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                        <Tooltip title="Copy code">
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(String(children))}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(0,0,0,0.1)',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.2)',
                              },
                            }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    );
                  }
                  
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
          )}

          <Tooltip title="Copy message">
            <IconButton
              className="copy-button"
              size="small"
              onClick={() => handleCopy(message.content)}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                opacity: 0,
                transition: 'opacity 0.2s',
                bgcolor: 'rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.2)',
                },
              }}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>

          {message.tokens && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                opacity: 0.7,
                fontSize: '0.75rem',
              }}
            >
              {message.tokens} tokens
              {message.cost && ` • $${message.cost.toFixed(4)}`}
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
});

MessageBubble.displayName = 'MessageBubble';