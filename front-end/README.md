# AI Healthcare Assistant - Frontend

React frontend for the AI Healthcare Assistant application.

## Features

- 💬 **Symptom Checker**: Text-based symptom analysis
- 📷 **Image Analysis**: Multimodal analysis with image upload
- 🎨 **Beautiful UI**: Modern, responsive design with Tailwind CSS
- ⚡ **Fast & Responsive**: Built with Vite for optimal performance
- 🔄 **State Management**: Custom hooks for clean state handling
- ✅ **Error Handling**: Comprehensive error and validation handling

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API URL**
   - Copy `.env.example` to `.env`
   - Update `VITE_API_BASE_URL` if your backend runs on a different port
   - Default: `http://localhost:5000/api`

3. **Start Development Server**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3001`

## Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Project Structure

```
client/
├── src/
│   ├── components/      # React components
│   │   ├── Chat.jsx
│   │   ├── ImageAnalysis.jsx
│   │   └── ResultCard.jsx
│   ├── hooks/          # Custom React hooks
│   │   ├── useChat.js
│   │   └── useImageAnalysis.js
│   ├── services/       # API services
│   │   └── api.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── package.json
└── vite.config.js
```

## API Integration

The frontend connects to the Express backend at:
- **Base URL**: `http://localhost:5000/api` (configurable via `.env`)
- **Endpoints**:
  - `POST /chat` - Symptom analysis
  - `POST /analyze-image` - Image analysis with symptoms

## Technologies

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
