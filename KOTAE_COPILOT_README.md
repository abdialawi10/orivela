# Kotae Copilot - Implementation Guide

## Overview

Kotae Copilot is a real-time AI assistant that helps users during live calls, meetings, and screen-based work. It provides live suggestions, talking points, and assistance without speaking on calls.

## Architecture

### Backend Components

1. **Database Models** (`prisma/schema.prisma`)
   - `CopilotSession` - Tracks active/ended sessions
   - `CopilotTranscript` - Stores transcribed audio
   - `CopilotSuggestion` - Stores AI-generated suggestions

2. **API Endpoints**
   - `POST /api/copilot/sessions` - Create new session
   - `GET /api/copilot/sessions` - List user sessions
   - `GET /api/copilot/sessions/[id]` - Get session details
   - `PATCH /api/copilot/sessions/[id]` - Update/end session
   - `POST /api/copilot/transcribe` - Send transcript, get suggestions
   - `GET /api/copilot/suggestions` - Get suggestions for session

3. **Core Library** (`lib/copilot.ts`)
   - `generateCopilotSuggestions()` - Real-time AI suggestions
   - `detectObjection()` - Detect objections in speech
   - `generatePostCallSummary()` - Post-call summary generation

### Frontend Components

1. **Main Copilot Page** (`app/copilot/page.tsx`)
   - Session management
   - Live suggestions display
   - Transcript view
   - Mode selection

2. **Sessions List** (`app/copilot/sessions/page.tsx`)
   - View all past sessions
   - Filter by status

3. **Session Detail** (`app/copilot/sessions/[id]/page.tsx`)
   - Full transcript
   - Summary and action items
   - Follow-up email draft
   - All suggestions

4. **Copilot Panel Component** (`components/copilot/copilot-panel.tsx`)
   - Side panel overlay
   - Live assistance cards
   - Minimal, non-distracting UI

### Browser Extension

1. **Manifest** (`browser-extension/manifest.json`)
   - Chrome extension configuration
   - Permissions for screen/audio access

2. **Content Script** (`browser-extension/content.js`)
   - Captures screen context
   - Detects app (Zoom, Meet, etc.)
   - Extracts page text

3. **Popup** (`browser-extension/popup.html/js`)
   - Extension UI
   - Start/stop copilot

## Setup Instructions

### 1. Database Migration

```bash
# Generate Prisma client with new models
npm run db:generate

# Push schema to database
npm run db:push
```

### 2. Install Browser Extension (Optional)

1. Open Chrome/Edge
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `browser-extension` folder

### 3. Start Using Copilot

1. Navigate to `/copilot` in dashboard
2. Select mode (Sales/Support/Meeting/Auto)
3. Click "Start Copilot"
4. Grant microphone permission when prompted
5. Start your call/meeting
6. View live suggestions in the panel

## Features

### Real-Time Suggestions

- **Suggested Response** - What to say next
- **Talking Point** - Key points to mention
- **Objection Detected** - When concerns are raised
- **Clarifying Question** - Questions to ask
- **Next Step** - Recommended actions

### Modes

- **Sales Mode** - Optimized for sales conversations
- **Support Mode** - Focused on problem-solving
- **Meeting Mode** - General meeting assistance
- **Auto Mode** - AI detects context automatically

### Post-Call Features

- Automatic summary generation
- Action items extraction
- Follow-up email draft
- Full transcript with timestamps

## Privacy & Permissions

### Required Permissions

- **Microphone** - For audio transcription
- **Screen Context** - For understanding what's on screen (optional)
- **Storage** - For session data

### Data Handling

- Raw audio is NOT stored
- Only transcripts are saved
- Screen context is text-only (no images/video)
- All data is encrypted in transit
- User can delete sessions anytime

## Usage Flow

1. **Start Session**
   - User clicks "Start Copilot"
   - Selects mode
   - Grants permissions

2. **During Call**
   - Audio is transcribed in real-time
   - Screen context is captured periodically
   - AI generates suggestions
   - Suggestions appear in side panel

3. **End Session**
   - User clicks "End Session"
   - AI generates summary
   - Action items extracted
   - Follow-up email created
   - Session saved to dashboard

## Technical Details

### Audio Transcription

- Uses Web Speech API (browser-native)
- Falls back to OpenAI Whisper if needed
- Real-time streaming transcription
- Speaker detection (user vs other)

### Screen Context

- Captures: App name, tab title, page text, URL
- Updates every 5 seconds
- Text-only (no screenshots)
- Limited to 2000 characters

### AI Reasoning

- Uses GPT-4 Turbo
- Maintains rolling context window
- Considers: Screen context, recent transcripts, mode
- Generates 1-3 suggestions per update

## Limitations (MVP)

- No video recording
- Browser extension required for screen context
- Web Speech API has browser limitations
- No auto-speak on calls
- No auto-send messages
- Basic objection detection

## Future Enhancements

- Desktop app (Electron/Tauri)
- Better audio capture (system audio)
- Video context (optional)
- Keyboard shortcuts
- Confidence scores
- Objection categorization
- Integration with calendar
- Meeting notes export

## Troubleshooting

### Microphone Not Working
- Check browser permissions
- Try different browser
- Check system microphone settings

### No Suggestions Appearing
- Check if session is active
- Verify audio is being captured
- Check browser console for errors
- Ensure OpenAI API key is set

### Screen Context Not Updating
- Install browser extension
- Grant extension permissions
- Refresh the page

## API Reference

### Create Session
```typescript
POST /api/copilot/sessions
Body: { mode: 'SALES' | 'SUPPORT' | 'MEETING' | 'AUTO', title?: string }
Response: { sessionId: string, status: string }
```

### Send Transcript
```typescript
POST /api/copilot/transcribe
Body: { sessionId: string, text: string, speaker?: string, screenContext?: object }
Response: { transcriptId: string, suggestions: Suggestion[], hasObjection: boolean }
```

### End Session
```typescript
PATCH /api/copilot/sessions/[id]
Body: { status: 'ENDED' }
Response: { summary: string, actionItems: string[], followUpEmail?: string }
```

## Security Notes

- All endpoints require authentication
- Sessions are user-scoped
- No cross-user data access
- Screen context is optional
- User can revoke permissions anytime

---

**Kotae Copilot** - Live AI assistance for calls & meetings


