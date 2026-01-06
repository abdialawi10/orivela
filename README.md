# AnswerAI

An AI assistant that answers phone calls, SMS texts, and emails for small businesses. Built with Next.js 14, TypeScript, Prisma, OpenAI, Twilio, and SendGrid.

## Features

- **Phone Agent**: Handles inbound calls via Twilio, conducts multi-turn conversations, answers FAQs, and escalates when needed
- **SMS Agent**: Manages SMS conversations with context per phone number
- **Email Assistant**: Generates email replies (MVP: compose/draft functionality)
- **Admin Dashboard**: 
  - Business settings configuration
  - Knowledge base management (FAQs and documents)
  - Conversation logs and analytics
  - Test playground for SMS/email simulation

## Tech Stack

- **Frontend/Backend**: Next.js 14+ (App Router), TypeScript
- **UI**: Tailwind CSS + shadcn/ui components
- **Authentication**: NextAuth.js (Credentials provider)
- **Database**: PostgreSQL + Prisma ORM
- **AI**: OpenAI (GPT-4 Turbo)
- **Voice + SMS**: Twilio (Voice webhooks, SMS webhooks)
- **Email**: SendGrid

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key
- Twilio account (for voice/SMS)
- SendGrid account (for email)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/answerai?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# Twilio
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# SendGrid
SENDGRID_API_KEY="SG.your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (or run migrations)
npm run db:push

# Seed the database with default admin user and business settings
npm run db:seed
```

Default admin credentials:
- Email: `admin@answerai.com`
- Password: `admin123`

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and log in with the default credentials.

## Twilio Webhook Configuration

### Voice Webhook

1. In your Twilio Console, go to Phone Numbers → Manage → Active numbers
2. Click on your Twilio phone number
3. Under "Voice & Fax" section, set:
   - **A CALL COMES IN**: `https://yourdomain.com/api/twilio/voice`
   - Use HTTP POST

### SMS Webhook

1. In the same phone number configuration:
2. Under "Messaging" section, set:
   - **A MESSAGE COMES IN**: `https://yourdomain.com/api/twilio/sms`
   - Use HTTP POST

### Local Testing with ngrok

For local development, use ngrok to expose your local server:

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000
```

Use the ngrok URL (e.g., `https://abc123.ngrok.io`) for your Twilio webhooks:
- Voice: `https://abc123.ngrok.io/api/twilio/voice`
- SMS: `https://abc123.ngrok.io/api/twilio/sms`

## Testing

### Test Phone Call Flow

1. Call your Twilio phone number
2. The AI will greet you and ask how it can help
3. Speak naturally - the AI will respond
4. Try asking:
   - "What are your business hours?"
   - "I need help with pricing"
   - "I want to speak with a human" (triggers escalation)

### Test SMS Flow

1. Send an SMS to your Twilio phone number
2. The AI will respond based on the message
3. Continue the conversation - context is maintained

### Test Playground

1. Navigate to `/playground` in the dashboard
2. Use the SMS Simulation tab to test SMS conversations
3. Use the Email Draft tab to generate email replies

## Project Structure

```
answerAI/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── ai/           # AI response endpoint
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── conversations/ # Conversation API
│   │   ├── email/        # Email sending
│   │   ├── knowledge-base/ # KB CRUD
│   │   ├── settings/     # Business settings
│   │   └── twilio/       # Twilio webhooks
│   ├── conversations/     # Conversation pages
│   ├── dashboard/        # Dashboard page
│   ├── knowledge-base/   # KB management
│   ├── login/            # Login page
│   ├── playground/       # Test playground
│   └── settings/         # Settings page
├── components/           # React components
│   ├── dashboard/        # Dashboard components
│   ├── providers/        # Context providers
│   └── ui/              # shadcn/ui components
├── lib/                  # Utilities
│   ├── ai.ts            # OpenAI integration
│   ├── auth.ts          # NextAuth config
│   ├── db-utils.ts      # Database helpers
│   ├── kb-utils.ts      # Knowledge base search
│   └── prisma.ts        # Prisma client
├── prisma/              # Prisma schema and migrations
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
└── types/               # TypeScript types
```

## Key Features Explained

### AI Behavior

- Uses OpenAI GPT-4 Turbo for natural conversations
- Incorporates business settings (hours, services, tone)
- Searches knowledge base for relevant answers
- Escalates when keywords are detected (representative, refund, lawsuit, etc.)
- Respects business hours logic

### Knowledge Base

- Supports FAQs (question/answer pairs)
- Supports long-form documents
- Simple keyword-based search (can be enhanced with full-text search)

### Conversation Management

- Stores all messages with context
- Tracks conversation status (OPEN, RESOLVED, ESCALATED)
- Generates summaries for completed conversations
- Filters by channel (VOICE, SMS, EMAIL)

## Production Considerations

Before deploying to production:

1. **Security**:
   - Change default admin password
   - Use strong NEXTAUTH_SECRET
   - Implement Twilio signature verification for webhooks
   - Add rate limiting

2. **Database**:
   - Use connection pooling
   - Set up regular backups
   - Consider read replicas for analytics

3. **Performance**:
   - Add caching for knowledge base searches
   - Implement message pagination
   - Consider vector database for better KB search

4. **Email Notifications**:
   - Implement escalation email notifications
   - Set up email templates

5. **Monitoring**:
   - Add error tracking (Sentry, etc.)
   - Monitor API usage and costs
   - Set up logging

## License

MIT

## Support

For issues and questions, please open an issue on the repository.






