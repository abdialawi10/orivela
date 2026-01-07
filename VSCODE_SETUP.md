# VSCode Setup Guide for AnswerAI

This guide will help you set up the project in VSCode and get it running.

## Prerequisites

### 1. Install Node.js (if not already installed)

**Check if you have Node.js:**
```bash
node --version
npm --version
```

**If not installed:**
- Download from: https://nodejs.org/
- Install **LTS version** (recommended: v18 or v20)
- After installation, restart VSCode

### 2. Install PostgreSQL (if not already installed)

**Option A: Local PostgreSQL**
- **macOS**: Install via Homebrew: `brew install postgresql@14`
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **Linux**: `sudo apt-get install postgresql` (Ubuntu/Debian)

**Option B: Use Cloud Database (Recommended for beginners)**
- **Neon** (Free): https://neon.tech (no local install needed!)
- **Supabase** (Free): https://supabase.com
- You'll just need the connection string

## Step-by-Step Setup

### 1. Install Project Dependencies

Open terminal in VSCode:
- Press `` Ctrl+` `` (backtick) or `` Cmd+` `` on Mac
- Or go to: **Terminal** → **New Terminal**

Run:
```bash
npm install
```

This will install all dependencies from `package.json`.

**Expected output:** Should complete without errors. Takes 1-2 minutes.

### 2. Set Up Environment Variables

1. In VSCode, create a new file in the root directory called `.env`
   - Right-click in explorer → New File → name it `.env`

2. Copy the contents from `.env.example` (if it exists) or use this template:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/answerai?schema=public"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-proj-your-key-here"

# Twilio
TWILIO_ACCOUNT_SID="ACyour-sid-here"
TWILIO_AUTH_TOKEN="your-token-here"
TWILIO_PHONE_NUMBER="+1234567890"

# SendGrid
SENDGRID_API_KEY="SG.your-key-here"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```

3. Fill in all the values (see `API_KEYS_GUIDE.md` for where to get them)

4. **Important**: Make sure `.env` is in `.gitignore` (it should be already)

### 3. Set Up Database

**If using local PostgreSQL:**

1. Create a database:
```bash
createdb answerai
```

Or using psql:
```bash
psql -U postgres
CREATE DATABASE answerai;
\q
```

2. Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/answerai?schema=public"
```

**If using cloud database (Neon/Supabase):**
- Just copy the connection string they provide into `DATABASE_URL`

### 4. Generate Prisma Client

```bash
npm run db:generate
```

This generates the Prisma client based on the schema.

### 5. Push Database Schema

```bash
npm run db:push
```

This creates all the tables in your database.

### 6. Seed the Database

```bash
npm run db:seed
```

This creates:
- Admin user (email: `admin@answerai.com`, password: `admin123`)
- Default business settings
- Sample FAQ items

### 7. Run the Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - ready started server on 0.0.0.0:3000
```

### 8. Open in Browser

Go to: http://localhost:3000

You should be redirected to the login page.

**Login credentials:**
- Email: `admin@answerai.com`
- Password: `admin123`

## Recommended VSCode Extensions

Install these for a better development experience:

### Essential Extensions

1. **Prisma** (by Prisma)
   - Syntax highlighting for `.prisma` files
   - Auto-formatting
   - Install: Search "Prisma" in Extensions (Ctrl+Shift+X)

2. **ES7+ React/Redux/React-Native snippets**
   - Code snippets for React/Next.js
   - Install: Search "ES7+ React"

3. **Tailwind CSS IntelliSense**
   - Autocomplete for Tailwind classes
   - Install: Search "Tailwind CSS IntelliSense"

4. **ESLint**
   - Linting and error checking
   - Install: Search "ESLint"

5. **Prettier - Code formatter**
   - Auto-formatting code
   - Install: Search "Prettier"

6. **Thunder Client** (or REST Client)
   - Test API endpoints directly in VSCode
   - Install: Search "Thunder Client"

### Optional but Helpful

- **GitLens** - Enhanced Git capabilities
- **Error Lens** - Inline error highlighting
- **Auto Rename Tag** - Automatically rename paired HTML/JSX tags
- **Path Intellisense** - Autocomplete file paths
- **TypeScript Vue Plugin** - Better TypeScript support

## VSCode Settings (Optional)

Create `.vscode/settings.json` in your project root for project-specific settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

## Troubleshooting

### "command not found: npm"

**Solution:** 
- Make sure Node.js is installed
- Restart VSCode after installing Node.js
- Check if Node.js is in your PATH: `which node` (Mac/Linux) or `where node` (Windows)

### "Cannot find module 'next'"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection errors

**Solution:**
- Check if PostgreSQL is running: `pg_isready` (Mac/Linux)
- Verify `DATABASE_URL` in `.env` is correct
- For cloud databases, check firewall/network settings

### Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port:
npm run dev -- -p 3001
```

### Prisma Client errors

**Solution:**
```bash
npm run db:generate
```

Then restart the dev server.

### TypeScript errors

**Solution:**
- Make sure all dependencies are installed: `npm install`
- Restart VSCode TypeScript server: 
  - Open command palette (Ctrl+Shift+P / Cmd+Shift+P)
  - Type: "TypeScript: Restart TS Server"

## Quick Start Checklist

- [ ] Node.js installed (v18+)
- [ ] PostgreSQL set up (local or cloud)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with all keys
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Database seeded (`npm run db:seed`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can log in with admin credentials

## Useful VSCode Shortcuts

- `` Ctrl+` `` / `` Cmd+` `` - Toggle terminal
- `Ctrl+Shift+P` / `Cmd+Shift+P` - Command palette
- `Ctrl+P` / `Cmd+P` - Quick file open
- `F5` - Start debugging
- `Ctrl+C` / `Cmd+C` in terminal - Stop running process

## Next Steps

Once everything is running:

1. **Test the app**: Log in and explore the dashboard
2. **Test playground**: Go to `/playground` to test SMS/email
3. **Configure Twilio**: Set up webhooks for voice/SMS (see README.md)
4. **Add knowledge base items**: Go to `/knowledge-base`
5. **Customize settings**: Go to `/settings`

## Getting Help

If you encounter issues:

1. Check the error message in the terminal
2. Check browser console (F12)
3. Verify all environment variables are set
4. Ensure database is accessible
5. Try restarting the dev server

For more details, see:
- `README.md` - Full project documentation
- `API_KEYS_GUIDE.md` - Where to get all API keys
- `QUICKSTART.md` - Quick setup guide








