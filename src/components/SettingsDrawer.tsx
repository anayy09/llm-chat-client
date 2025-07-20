import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { updateSettings, setApiKey } from '../store/settingsSlice';
import { AVAILABLE_MODELS } from '../lib/models';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setApiKey(event.target.value));
  };

  const handleModelChange = (event: any) => {
    dispatch(updateSettings({ model: event.target.value }));
  };

  const handleTemperatureChange = (_: Event, value: number | number[]) => {
    dispatch(updateSettings({ temperature: value as number }));
  };

  const handleMaxTokensChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      dispatch(updateSettings({ maxTokens: value }));
    }
  };

  const handleCacheToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateSettings({ enableCache: event.target.checked }));
  };

  const handleReset = () => {
    dispatch(updateSettings({
      model: 'llama-3.1-70b-instruct',
      temperature: 0.7,
      maxTokens: 1000,
      enableCache: false,
    }));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          maxWidth: '90vw',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Settings
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* API Key */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Configuration
          </Typography>
          
          <TextField
            fullWidth
            label="API Key"
            type="password"
            value={settings.apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your API key"
            helperText="Your API key for accessing the LiteLLM proxy"
            sx={{ mb: 2 }}
          />

          {!settings.apiKey && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please enter your API key to start chatting
            </Alert>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Model Settings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Model Settings
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Model</InputLabel>
            <Select
              value={settings.model}
              label="Model"
              onChange={handleModelChange}
            >
              {AVAILABLE_MODELS.map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>
              Temperature: {settings.temperature}
            </Typography>
            <Slider
              value={settings.temperature}
              onChange={handleTemperatureChange}
              min={0}
              max={2}
              step={0.1}
              marks={[
                { value: 0, label: '0' },
                { value: 1, label: '1' },
                { value: 2, label: '2' },
              ]}
            />
            <Typography variant="caption" color="text.secondary">
              Lower values make output more focused, higher values more creative
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Max Tokens"
            type="number"
            value={settings.maxTokens}
            onChange={handleMaxTokensChange}
            inputProps={{ min: 1, max: 4000 }}
            helperText="Maximum number of tokens to generate"
            sx={{ mb: 2 }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Performance Settings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Performance
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.enableCache}
                onChange={handleCacheToggle}
              />
            }
            label="Enable Caching"
          />
          <Typography variant="caption" color="text.secondary" display="block">
            Cache responses to improve speed and reduce costs
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            fullWidth
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            onClick={onClose}
            fullWidth
          >
            Done
          </Button>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary">
            Settings are automatically saved locally
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};