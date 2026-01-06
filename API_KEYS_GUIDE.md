# API Keys & Credentials Guide

This guide explains all the API keys and credentials you need for AnswerAI and where to get them.

## Required Credentials

### 1. Database Connection (PostgreSQL)

**Variable:** `DATABASE_URL`

**Format:**
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public
```

**Where to get it:**
- **Local PostgreSQL**: If installed locally, use:
  - Username: Your PostgreSQL username (often `postgres`)
  - Password: Your PostgreSQL password
  - Host: `localhost`
  - Port: `5432` (default)
  - Database: Create one (e.g., `answerai`)
  
  Example: `postgresql://postgres:yourpassword@localhost:5432/answerai?schema=public`

- **Cloud Providers:**
  - **Neon**: https://neon.tech (Free tier available)
  - **Supabase**: https://supabase.com (Free tier available)
  - **Railway**: https://railway.app (Free tier available)
  - **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
  - **AWS RDS**: https://aws.amazon.com/rds/postgresql/
  - **Google Cloud SQL**: https://cloud.google.com/sql/docs/postgres

**Steps for Neon (Recommended for free):**
1. Go to https://neon.tech
2. Sign up for free account
3. Create a new project
4. Copy the connection string from the dashboard
5. It will look like: `postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

---

### 2. NextAuth Secret

**Variable:** `NEXTAUTH_SECRET`

**What it is:** A random string used to encrypt JWT tokens and session cookies.

**How to generate:**
```bash
openssl rand -base64 32
```

Or use an online generator, or any random 32+ character string.

**Example:**
```
aBc123XyZ456DeF789GhI012JkL345MnO678PqR
```

**Note:** Keep this secret! Don't commit it to git.

---

### 3. OpenAI API Key

**Variable:** `OPENAI_API_KEY`

**Where to get it:**
1. Go to https://platform.openai.com
2. Sign up or log in
3. Navigate to **API Keys** section: https://platform.openai.com/api-keys
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-...`)
6. **Important:** Save it immediately - you can't view it again!

**Pricing:**
- Uses GPT-4 Turbo (charged per token)
- Check pricing: https://openai.com/pricing
- Monitor usage in the dashboard

**Free tier:** OpenAI offers $5 free credit for new accounts (with limitations).

**Example format:**
```
sk-proj-abc123xyz456def789ghi012jkl345mno678pqr901stu234vwx567
```

---

### 4. Twilio Account SID

**Variable:** `TWILIO_ACCOUNT_SID`

**Where to get it:**
1. Go to https://www.twilio.com
2. Sign up for a free account
3. After signing up, you'll see your Account SID on the dashboard
4. Or go to: https://console.twilio.com/
5. It's visible on the main dashboard (starts with `AC...`)

**Example format:**
```
ACa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

### 5. Twilio Auth Token

**Variable:** `TWILIO_AUTH_TOKEN`

**Where to get it:**
1. Same as above - Twilio Console: https://console.twilio.com/
2. Click on the "eye" icon 👁️ next to "Auth Token" to reveal it
3. Copy the token (it's a long random string)

**Important:** 
- Keep this secret!
- You can regenerate it if needed (but will need to update everywhere)

**Example format:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7
```

---

### 6. Twilio Phone Number

**Variable:** `TWILIO_PHONE_NUMBER`

**Where to get it:**
1. In Twilio Console: https://console.twilio.com/
2. Go to **Phone Numbers** → **Manage** → **Buy a number**
3. Select a number with Voice and SMS capabilities
4. Choose a country/area code
5. For testing, you can use a Twilio trial number (free but limited)
6. Copy the phone number in E.164 format (e.g., `+1234567890`)

**Free tier:**
- Twilio trial account includes a free phone number for testing
- Trial numbers can only call/text verified numbers
- To use with any number, upgrade to paid account

**Example format:**
```
+1234567890
```

**Note:** Include the `+` sign and country code.

---

### 7. SendGrid API Key

**Variable:** `SENDGRID_API_KEY`

**Where to get it:**
1. Go to https://sendgrid.com
2. Sign up for a free account
3. After verifying your email, go to **Settings** → **API Keys**
4. Click **"Create API Key"**
5. Give it a name (e.g., "AnswerAI")
6. Select **"Full Access"** or **"Restricted Access"** (choose Mail Send permissions)
7. Copy the API key (starts with `SG....`)

**Important:** 
- Copy it immediately - you can't view it again!
- If you lose it, create a new one

**Free tier:**
- SendGrid Free tier: 100 emails/day forever

**Example format:**
```
SG.abc123xyz456def789ghi012jkl345mno678pqr901stu234vwx567yza890
```

---

### 8. SendGrid From Email

**Variable:** `SENDGRID_FROM_EMAIL`

**What it is:** The email address that will appear as the sender.

**Requirements:**
1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. You need to verify a sender:
   - **Single Sender Verification** (for testing):
     - Go to **Settings** → **Sender Authentication** → **Verify a Single Sender**
     - Enter your email address
     - Verify via the email sent to you
   - **Domain Authentication** (for production):
     - Add DNS records to your domain
     - Better for production use

**Example format:**
```
noreply@yourdomain.com
```
or
```
support@yourdomain.com
```

**Note:** For testing, you can use your personal email (after verification).

---

## Complete .env File Example

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/answerai?schema=public"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-proj-your-openai-api-key-here"

# Twilio
TWILIO_ACCOUNT_SID="ACyour-twilio-account-sid-here"
TWILIO_AUTH_TOKEN="your-twilio-auth-token-here"
TWILIO_PHONE_NUMBER="+1234567890"

# SendGrid
SENDGRID_API_KEY="SG.your-sendgrid-api-key-here"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```

---

## Quick Setup Checklist

- [ ] Set up PostgreSQL database (local or cloud)
- [ ] Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] Get OpenAI API key from https://platform.openai.com/api-keys
- [ ] Create Twilio account and get Account SID, Auth Token, and Phone Number
- [ ] Create SendGrid account, get API key, and verify sender email
- [ ] Create `.env` file with all values
- [ ] Never commit `.env` to git!

---

## Cost Estimates (Free Tiers Available)

- **PostgreSQL**: Free tiers available (Neon, Supabase)
- **OpenAI**: $5 free credit for new accounts
- **Twilio**: Free trial (limited to verified numbers)
- **SendGrid**: Free tier (100 emails/day)

**Total to start:** $0 (with free tiers, limited usage)

---

## Security Best Practices

1. **Never commit `.env` to git** - it's already in `.gitignore`
2. **Use different keys for development and production**
3. **Rotate keys periodically**
4. **Use environment-specific secrets in production** (Vercel, Railway, etc. have built-in secret management)
5. **Restrict API key permissions when possible** (SendGrid allows this)

---

## Troubleshooting

**OpenAI errors:**
- Check you have credits/usage available
- Verify API key format (starts with `sk-`)
- Check rate limits

**Twilio errors:**
- Verify Account SID and Auth Token match
- Ensure phone number is in E.164 format (`+1234567890`)
- Check trial account limitations

**SendGrid errors:**
- Verify sender email is authenticated
- Check API key has Mail Send permissions
- Verify API key format (starts with `SG.`)

**Database errors:**
- Check connection string format
- Verify database exists
- Check firewall/network access for cloud databases
