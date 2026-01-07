# Quick Start Guide

## Prerequisites Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database:**
   - Create a new PostgreSQL database
   - Update `DATABASE_URL` in `.env`

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in all required values:
     - `DATABASE_URL` - Your PostgreSQL connection string
     - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
     - `OPENAI_API_KEY` - From OpenAI dashboard
     - `TWILIO_ACCOUNT_SID` - From Twilio console
     - `TWILIO_AUTH_TOKEN` - From Twilio console
     - `TWILIO_PHONE_NUMBER` - Your Twilio phone number
     - `SENDGRID_API_KEY` - From SendGrid dashboard
     - `SENDGRID_FROM_EMAIL` - Your verified sender email

4. **Initialize database:**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Login:**
   - Go to http://localhost:3000
   - Email: `admin@answerai.com`
   - Password: `admin123`

## Testing Locally

### Test with Playground

1. Navigate to `/playground` in the dashboard
2. Use SMS Simulation to test conversations
3. Use Email Draft to generate replies

### Test with Twilio (requires ngrok)

1. Install ngrok: https://ngrok.com/download
2. Start ngrok: `ngrok http 3000`
3. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
4. In Twilio Console → Phone Numbers:
   - Set Voice webhook: `https://abc123.ngrok.io/api/twilio/voice`
   - Set SMS webhook: `https://abc123.ngrok.io/api/twilio/sms`
5. Call or text your Twilio number to test

## Common Issues

- **Database connection errors**: Check `DATABASE_URL` format
- **Prisma client errors**: Run `npm run db:generate`
- **Authentication errors**: Ensure `NEXTAUTH_SECRET` is set
- **OpenAI errors**: Check API key and account credits
- **Twilio errors**: Verify webhook URLs are publicly accessible (use ngrok for local)









