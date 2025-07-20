# LLM Chat Client

A modern, feature-rich chat client for LLM models with streaming responses, voice input, analytics, and more. The UI now features a refreshed design with softer colors and a floating action button for quickly creating new conversations.

## Features

- 🚀 **Streaming responses** with real-time token display
- 🎤 **Voice input** with Whisper transcription
- 📊 **Analytics dashboard** with cost tracking and performance metrics
- 🎨 **Dark/Light mode** with Material-UI theming
- 💾 **Local storage** for chat history and settings
- 📱 **Mobile-responsive** design with gesture support
- ⌨️ **Keyboard shortcuts** for power users
- 🔄 **Caching support** for improved performance
- 📈 **Cost tracking** with budget monitoring
- 🎯 **Model switching** with temperature and token controls

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Environment Variables
Create a `.env` file:
```env
VITE_API_BASE_URL=https://api.ai.it.ufl.edu
```

### 3. Start Development Server
```bash
pnpm dev
```

## Environment Variables

- `VITE_API_BASE_URL` - Base URL for the LiteLLM proxy (default: https://api.ai.it.ufl.edu)

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm type-check` - Run TypeScript type checking

## Deployment

### Netlify (Recommended)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/llm-chat-client)

1. Connect your GitHub repository
2. Set build command: `pnpm build`
3. Set publish directory: `dist`
4. Deploy!

### Manual Deployment

```bash
pnpm build
# Upload the `dist` folder to your hosting provider
```

## Usage

1. **Set API Key**: Open settings and enter your LiteLLM API key
2. **Create Chat**: Click "New Chat" to start a conversation
3. **Select Model**: Choose from available models in settings
4. **Voice Input**: Click the microphone icon to record audio
5. **Analytics**: Toggle the right sidebar to view usage statistics

## Keyboard Shortcuts

- `Ctrl/Cmd + Enter` - Send message
- `↑` - Edit last message (when input is empty)
- `Ctrl/Cmd + K` - Command palette (planned)
- `Esc` - Close sidebars/modals

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Redux Toolkit
- **UI Framework**: Material-UI v5
- **Styling**: Emotion (sx prop)
- **API Client**: OpenAI SDK with custom LiteLLM wrapper
- **Storage**: localStorage for persistence

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details