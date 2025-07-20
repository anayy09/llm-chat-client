import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add,
  Chat,
  Settings,
  MoreVert,
  Delete,
  Edit,
  Download,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { createChat, setActiveChat, deleteChat, loadChats } from '../store/chatSlice';
import { toggleDarkMode } from '../store/settingsSlice';
// import type { Chat } from '../types';

const DRAWER_WIDTH = 280;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onSettingsOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, onSettingsOpen }) => {
  const dispatch = useDispatch();
  const { chats, activeChat } = useSelector((state: RootState) => state.chat);
  const { model, darkMode } = useSelector((state: RootState) => state.settings);
  
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [renameDialog, setRenameDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleNewChat = () => {
    dispatch(createChat({ model }));
    onClose();
  };

  const handleChatSelect = (chatId: string) => {
    dispatch(setActiveChat(chatId));
    onClose();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, chatId: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedChatId(chatId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedChatId(null);
  };

  const handleRename = () => {
    const chat = chats.find(c => c.id === selectedChatId);
    if (chat) {
      setNewTitle(chat.title);
      setRenameDialog(true);
    }
    handleMenuClose();
  };

  const handleRenameConfirm = () => {
    // In a real app, you'd dispatch a rename action
    setRenameDialog(false);
    setNewTitle('');
  };

  const handleDelete = () => {
    if (selectedChatId) {
      dispatch(deleteChat(selectedChatId));
    }
    handleMenuClose();
  };

  const handleExport = () => {
    const chat = chats.find(c => c.id === selectedChatId);
    if (chat) {
      const dataStr = JSON.stringify(chat, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat-${chat.title.slice(0, 20)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
    handleMenuClose();
  };

  const handleExportAll = () => {
    const dataStr = JSON.stringify(chats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'all-chats.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Save chats to localStorage whenever chats change
  React.useEffect(() => {
    localStorage.setItem('llm-chats', JSON.stringify(chats));
  }, [chats]);

  // Load chats from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('llm-chats');
    if (saved) {
      try {
        const parsedChats = JSON.parse(saved);
        dispatch(loadChats(parsedChats));
      } catch (error) {
        console.error('Failed to load chats:', error);
      }
    }
  }, [dispatch]);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Add />}
          onClick={handleNewChat}
          sx={{ mb: 2 }}
        >
          New Chat
        </Button>
        
        <Typography variant="h6" gutterBottom>
          Conversations
        </Typography>
      </Box>

      <Divider />

      {/* Chat List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <List>
          {chats.map((chat) => (
            <ListItem key={chat.id} disablePadding>
              <ListItemButton
                selected={chat.id === activeChat}
                onClick={() => handleChatSelect(chat.id)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                }}
              >
                <Chat sx={{ mr: 2, fontSize: 20 }} />
                <ListItemText
                  primary={chat.title}
                  secondary={`${chat.messages.length} messages`}
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: { fontSize: '0.9rem' },
                  }}
                  secondaryTypographyProps={{
                    sx: { fontSize: '0.75rem' },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, chat.id)}
                  sx={{ ml: 1 }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExportAll}
          sx={{ mb: 1 }}
          size="small"
        >
          Export All
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Settings />}
            onClick={onSettingsOpen}
            size="small"
          >
            Settings
          </Button>
          
          <IconButton
            onClick={() => dispatch(toggleDarkMode())}
            size="small"
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRename}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Rename
        </MenuItem>
        <MenuItem onClick={handleExport}>
          <Download sx={{ mr: 1 }} fontSize="small" />
          Export
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Rename Dialog */}
      <Dialog open={renameDialog} onClose={() => setRenameDialog(false)}>
        <DialogTitle>Rename Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialog(false)}>Cancel</Button>
          <Button onClick={handleRenameConfirm} variant="contained">
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};