# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Re:verce is a Japanese web application for creating and sharing memories. It features:
- Memory posts with text and image uploads
- AI chat functionality (using OpenAI API)
- Mobile-optimized interface with swipe navigation
- Three main sections: memory, chat, and present

## Key Commands

### Development
- `npm start` - Start the Express server on port 3000
- `npm install` - Install all dependencies

Note: No linting, testing, or build commands are currently configured. The project runs directly with Node.js.

## Architecture

### Backend Structure
- **server.js**: Express server handling:
  - POST /post - Create memory posts with text/image
  - GET /posts - Retrieve all posts
  - Static file serving from public/
  - File uploads via Multer to public/uploads/

### Frontend Structure
- **public/index.html**: Main application UI with three swipeable panels
- **public/main.js**: Core application logic for posts and UI interactions
- **public/style.css**: Mobile-first responsive styles
- **public/vision_chat.js**: Additional chat functionality

### Data Storage
- **posts.json**: File-based storage for all posts (auto-created)
- **public/uploads/**: User-uploaded images

### AI Integration
- **AI_Chat/**: Separate module with OpenAI integration
  - Uses GPT-3.5-turbo with friendly Japanese personality
  - Requires VITE_OPENAI_API_KEY environment variable

## Important Considerations

1. **Language**: All UI text and user-facing content is in Japanese
2. **Module System**: Uses CommonJS (not ES modules) for server code
3. **Environment Variables**: 
   - AI chat requires .env file with VITE_OPENAI_API_KEY
   - Use dotenv package for server-side env vars
4. **File Uploads**: Images saved with timestamp filenames in public/uploads/
5. **No Authentication**: Currently no user system implemented

## Common Tasks

### Adding New Features
1. For server endpoints: Add routes to server.js
2. For UI changes: Modify public/index.html and public/main.js
3. For styling: Update public/style.css (mobile-first approach)

### Working with Posts
- Posts stored in posts.json with structure: `{ id, text, image, timestamp }`
- Images referenced by filename only (served from /uploads/)
- Posts displayed in reverse chronological order

### Integrating AI Chat
The AI chat module is currently separate. To integrate:
1. Import functionality from AI_Chat/API.js
2. Ensure environment variables are properly configured
3. Note: AI_Chat uses ES modules (import.meta.env) while main app uses CommonJS