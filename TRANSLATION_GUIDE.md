# Live Translation Feature Guide

AnswerAI now supports **live translation** - the AI automatically detects the language of incoming messages and responds in the same language!

## How It Works

1. **Automatic Language Detection**: When a user sends a message (via phone, SMS, or email), the system automatically detects the language using AI.

2. **Multilingual Responses**: The AI responds in the detected language, maintaining the same tone and style as configured.

3. **Language Persistence**: Once a language is detected for a conversation, subsequent messages in that conversation will maintain that language.

4. **Supported Languages**: Currently supports 20 languages including English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi, Somali, and more.

## Supported Languages

- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇮🇹 Italian (it)
- 🇵🇹 Portuguese (pt)
- 🇷🇺 Russian (ru)
- 🇨🇳 Chinese (zh)
- 🇯🇵 Japanese (ja)
- 🇰🇷 Korean (ko)
- 🇸🇦 Arabic (ar)
- 🇮🇳 Hindi (hi)
- 🇳🇱 Dutch (nl)
- 🇵🇱 Polish (pl)
- 🇹🇷 Turkish (tr)
- 🇻🇳 Vietnamese (vi)
- 🇹🇭 Thai (th)
- 🇮🇩 Indonesian (id)
- 🇸🇴 Somali (so)

## Features

### Automatic Detection

- Detects language from the first message
- Updates if user switches languages mid-conversation
- Falls back to English if language can't be determined

### Context-Aware

- Maintains conversation context across languages
- Knowledge base responses are translated appropriately
- Business information (hours, services) is translated

### Smart Translation

- Uses GPT-4 for high-quality translations
- Preserves tone and style
- Handles technical terms appropriately
- Maintains formality level

## Technical Implementation

### Database Changes

- Added `language` field to `Conversation` model
- Stores ISO 639-1 language code (e.g., "en", "es", "fr")
- Defaults to "en" (English)

### API Changes

- All conversation endpoints now detect language
- AI responses include language information
- Conversation language is updated automatically

### How to Update Database

After pulling the code, run:

```bash
# Generate Prisma client with new schema
npm run db:generate

# Push schema changes to database
npm run db:push
```

## Usage Examples

### Phone Call

1. User calls and speaks in Spanish: "Hola, necesito ayuda"
2. System detects: Spanish
3. AI responds in Spanish: "Hola! ¿En qué puedo ayudarte hoy?"

### SMS

1. User texts in French: "Bonjour, quels sont vos horaires?"
2. System detects: French
3. AI responds in French: "Bonjour! Nous sommes ouverts..."

### Email

1. User emails in German: "Guten Tag, ich habe eine Frage"
2. System detects: German
3. AI responds in German: "Guten Tag! Gerne helfe ich Ihnen..."

## Configuration

### Default Language

- Defaults to English if no language is detected
- Can be changed in conversation settings (future feature)

### Language Detection Sensitivity

- Minimum text length: 10 characters for reliable detection
- Short messages may default to conversation's current language

## Testing

### Using Playground

1. Go to `/playground` in the dashboard
2. Send a message in any supported language
3. See the AI respond in the same language

### Using SMS/Phone

1. Send SMS or call in a different language
2. System automatically detects and responds
3. Check conversation logs to see detected language

## Limitations

1. **Language Detection Accuracy**:

   - Very short messages (< 10 chars) may not detect accurately
   - Mixed languages in one message may default to dominant language

2. **Translation Quality**:

   - Quality depends on OpenAI GPT-4
   - Technical terms may need manual review
   - Cultural nuances may vary

3. **Knowledge Base**:

   - Knowledge base content is in the language it was entered
   - Responses are translated, but original KB content remains

4. **Cost**:
   - Language detection uses OpenAI API (small cost per detection)
   - Translation uses OpenAI API (cost per translation)
   - Typical cost: ~$0.001-0.002 per message

## Future Enhancements

Potential future improvements:

- Manual language selection in UI
- Per-contact language preferences
- Language-specific knowledge bases
- Multi-language FAQ support
- Language statistics dashboard

## Troubleshooting

### Language Not Detected Correctly

- **Issue**: Wrong language detected
- **Solution**: System learns from conversation context. If first message is unclear, subsequent messages will refine detection.

### Translation Quality Issues

- **Issue**: Translation seems off
- **Solution**: Ensure business tone/settings are clear. GPT-4 generally handles translations well, but complex technical content may need review.

### Performance Concerns

- **Issue**: Slower responses with translation
- **Solution**: Language detection adds ~200-500ms. Translation is typically fast with GPT-4. Consider caching for frequently used phrases.

## Code Structure

Key files:

- `lib/translation.ts` - Language detection and translation utilities
- `lib/ai.ts` - Updated AI response generation with language support
- `app/api/ai/respond/route.ts` - API endpoint with language detection
- `app/api/twilio/*/route.ts` - Twilio endpoints with language detection
- `prisma/schema.prisma` - Database schema with language field

## Questions?

For issues or questions about translation:

1. Check conversation logs to see detected language
2. Verify OpenAI API key is set and working
3. Check API response times
4. Review error logs for translation failures
