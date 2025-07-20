import { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add,
  Settings,
  Analytics,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { toggleRightSidebar } from '../store/settingsSlice';
import { createChat } from '../store/chatSlice';
import { ChatWindow } from '../components/ChatWindow';
import { Sidebar } from '../components/Sidebar';
import { SettingsDrawer } from '../components/SettingsDrawer';
import { AnalyticsSidebar } from '../components/AnalyticsSidebar';

const DRAWER_WIDTH = 280;

export const Home: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const { rightSidebarOpen, model } = useSelector((state: RootState) => state.settings);
  const { activeChat, chats } = useSelector((state: RootState) => state.chat);
  
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const currentChat = chats.find(c => c.id === activeChat);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        // Command palette - could implement search/commands
        console.log('Command palette triggered');
      }
      
      if (event.key === 'Escape') {
        setLeftSidebarOpen(false);
        setSettingsOpen(false);
        dispatch(toggleRightSidebar());
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Left Sidebar */}
      <Sidebar
        open={leftSidebarOpen}
        onClose={() => setLeftSidebarOpen(false)}
        onSettingsOpen={() => setSettingsOpen(true)}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: { sm: `${DRAWER_WIDTH}px` },
          mr: rightSidebarOpen ? '400px' : 0,
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={(theme) => ({
            ml: { sm: `${DRAWER_WIDTH}px` },
            mr: rightSidebarOpen ? '400px' : 0,
            width: {
              sm: rightSidebarOpen
                ? `calc(100% - ${DRAWER_WIDTH}px - 400px)`
                : `calc(100% - ${DRAWER_WIDTH}px)`,
            },
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          })}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setLeftSidebarOpen(true)}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <IconButton
              color="inherit"
              aria-label="new chat"
              onClick={() => dispatch(createChat({ model }))}
              sx={{ mr: 1 }}
            >
              <Add />
            </IconButton>
            
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {currentChat ? currentChat.title : 'LLM Chat Client'}
            </Typography>

            <IconButton
              color="inherit"
              onClick={() => setSettingsOpen(true)}
              sx={{ mr: 1 }}
            >
              <Settings />
            </IconButton>

            <IconButton
              color="inherit"
              onClick={() => dispatch(toggleRightSidebar())}
            >
              <Analytics />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Chat Window */}
        <Box
          sx={{
            flexGrow: 1,
            mt: '64px', // AppBar height
            overflow: 'hidden',
          }}
        >
          <ChatWindow />
        </Box>
      </Box>

      {/* Settings Drawer */}
      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Analytics Sidebar */}
      <AnalyticsSidebar
        open={rightSidebarOpen}
        onClose={() => dispatch(toggleRightSidebar())}
      />
    </Box>
  );
};