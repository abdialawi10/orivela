# Calendly Integration Guide

## Overview

Kotae AI now integrates with Calendly to allow users to schedule appointments directly through conversations (phone, SMS, or email).

## Features

### 1. Automatic Scheduling Detection
- Detects user intent when they mention:
  - "schedule a call"
  - "book a demo"
  - "set up a meeting"
  - "talk to a human"
  - And 20+ other scheduling phrases

### 2. Calendly Link Sharing
- Automatically provides your public Calendly link when scheduling is requested
- Clickable link in SMS/email conversations
- Mentioned in voice calls (SMS sent separately)

### 3. Available Time Slots (Optional)
- If Calendly API is configured, shows 5 suggested available times
- Automatically formatted in user's timezone
- Updates based on your calendar availability

### 4. Timezone Detection
- Detects timezone from user messages (EST, PST, GMT, etc.)
- Falls back to business timezone if not detected
- Displays times in appropriate timezone

### 5. Follow-Up Messages
- Automatic confirmation messages
- Reminder generation (optional)
- Rescheduling assistance

## Setup Instructions

### Option 1: Simple Setup (Recommended)

**Just add your public Calendly link:**

1. Go to Settings in dashboard
2. Scroll to "Calendly Integration"
3. Enter your public Calendly link:
   ```
   https://calendly.com/yourusername/event
   ```
4. Select your timezone
5. Save

**That's it!** The AI will automatically share this link when users want to schedule.

### Option 2: Advanced Setup (With API)

**For suggested time slots:**

1. **Get Calendly API Key:**
   - Go to https://calendly.com/integrations/api_webhooks
   - Create a Personal Access Token
   - Copy the token

2. **Get Your User URI:**
   - Use Calendly API: `GET https://api.calendly.com/users/me`
   - Use the token from step 1
   - Copy your user URI

3. **Configure in Settings:**
   - Go to Settings → Calendly Integration
   - Enter your API Key
   - Enter your User URI
   - (Optional) Enter default Event Type URI
   - Add your public Calendly link
   - Select timezone
   - Save

## How It Works

### Detection Flow

1. **User says:** "I'd like to schedule a call"
2. **AI detects:** Scheduling intent automatically
3. **AI responds:** 
   - If Calendly link configured: Shares the link
   - If API configured: Shows 5 available time slots + link
   - Friendly, branded response in your tone

### Example Conversations

**SMS Example:**
```
Customer: "Can I schedule a demo?"
AI: "I'd be happy to help you schedule a demo! You can book a time that works for you here: https://calendly.com/you/demo"
```

**Voice Example:**
```
Customer: "I want to talk to someone about pricing"
AI: "Absolutely! I can help you schedule a consultation. I'll send you a link to book a time via text message. Please check your phone for the scheduling link."
```

**With Time Slots:**
```
Customer: "When can I book a call?"
AI: "Here are some available times:
1. Mon, Dec 18, 2:00 PM
2. Tue, Dec 19, 10:00 AM
3. Wed, Dec 20, 3:30 PM
...
Would you like to book one of these? Or choose any time: https://calendly.com/you/event"
```

## Configuration Options

### Settings Available

1. **Public Calendly Link** (Required for basic setup)
   - Your public scheduling page
   - Format: `https://calendly.com/username/event`

2. **Calendly API Key** (Optional)
   - For fetching available slots
   - Get from Calendly settings

3. **Calendly User URI** (Optional, needed with API)
   - Your Calendly user identifier
   - Format: `https://api.calendly.com/users/...`

4. **Event Type URI** (Optional)
   - Default event type to use
   - Leave blank to use first available

5. **Business Timezone**
   - Default timezone for displaying times
   - User timezone detection overrides when possible

## API Endpoints

### Get Availability
```
GET /api/calendly/availability?daysAhead=14&timezone=America/New_York
```

Returns:
```json
{
  "slots": ["Mon, Dec 18, 2:00 PM", ...],
  "rawSlots": [...],
  "calendlyLink": "https://calendly.com/..."
}
```

## Follow-Up Features

### Automatic Reminders

After a user schedules, you can send:
- Confirmation messages
- Reminder messages before appointment
- Rescheduling assistance

### Rescheduling Detection

The AI can detect when users want to reschedule:
- "I need to reschedule"
- "Can we change the time?"
- "That time doesn't work"

And provides:
- New Calendly link
- Alternative times if available
- Friendly assistance

## Branding & Tone

All scheduling messages:
- Use your configured business tone
- Include your business name
- Maintain conversational style
- Are friendly and professional
- Match your brand voice

## Privacy & Security

- Calendly API keys are encrypted
- User timezone is detected, not stored
- Scheduling data handled securely
- No sensitive information exposed

## Troubleshooting

### Link Not Appearing

**Issue:** Calendly link not showing in responses

**Solutions:**
- Check Settings → Calendly Integration
- Verify Calendly link is saved
- Ensure link format is correct
- Test scheduling intent detection

### Time Slots Not Showing

**Issue:** API configured but no slots appear

**Solutions:**
- Verify API key is correct
- Check User URI is correct
- Ensure event type has availability
- Check timezone settings
- Verify Calendly account has active events

### Timezone Issues

**Issue:** Times shown in wrong timezone

**Solutions:**
- Set business timezone in Settings
- AI will detect user timezone from messages
- Format: EST, PST, GMT, etc.
- Falls back to business timezone

## Best Practices

1. **Use Public Link** - Simplest setup, works immediately
2. **Set Timezone** - Ensures correct times for users
3. **Test Detection** - Try phrases like "schedule a call" to test
4. **Keep Link Updated** - Update if you change Calendly setup
5. **Monitor Conversations** - Check if scheduling is working well

## Example Setup

1. Create Calendly account
2. Set up event types (e.g., "15-minute call", "Demo")
3. Copy your public link: `https://calendly.com/johndoe/15min`
4. Add to Kotae AI Settings
5. Done! AI will share link automatically

---

**Questions?** Check conversation logs to see how scheduling is being handled, or test in the Playground.





