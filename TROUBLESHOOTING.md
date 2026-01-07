# Troubleshooting Guide

## Login Issues

### Can't Login with admin@answerai.com

**Problem:** Getting "Invalid email or password" error

**Solutions:**

1. **Check if database is seeded:**
   ```bash
   npm run db:seed
   ```

2. **Reset admin user (if seed fails):**
   ```bash
   npm run db:reset-admin
   ```

3. **Verify database connection:**
   - Check `.env` file has correct `DATABASE_URL`
   - Test connection: `psql $DATABASE_URL` (if using PostgreSQL)

4. **Check if user exists in database:**
   - Open Prisma Studio: `npx prisma studio`
   - Go to `User` table
   - Check if `admin@answerai.com` exists

5. **Verify password:**
   - Default password is: `admin123`
   - Make sure no extra spaces in email/password fields

### Database Connection Errors

**Problem:** "Can't reach database server" or connection errors

**Solutions:**

1. **Local PostgreSQL:**
   - Check if PostgreSQL is running: `pg_isready`
   - Start PostgreSQL if needed:
     - Mac: `brew services start postgresql@14`
     - Linux: `sudo systemctl start postgresql`
     - Windows: Check Services panel

2. **Cloud Database (Neon, Supabase, etc.):**
   - Verify `DATABASE_URL` is correct
   - Check if database is paused (some free tiers pause after inactivity)
   - Verify network/firewall settings

3. **Connection String Format:**
   ```
   postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
   ```

### Prisma Client Errors

**Problem:** "PrismaClient is not initialized" or schema errors

**Solutions:**

1. **Regenerate Prisma client:**
   ```bash
   npm run db:generate
   ```

2. **Push schema to database:**
   ```bash
   npm run db:push
   ```

3. **Restart dev server** after Prisma changes

### NextAuth Session Errors

**Problem:** "getServerSession is not a function" or session errors

**Solutions:**

1. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Check NEXTAUTH_SECRET:**
   - Make sure it's set in `.env`
   - Generate new one: `openssl rand -base64 32`

3. **Restart dev server**

### Common Issues Checklist

- [ ] Database is running (local) or accessible (cloud)
- [ ] `DATABASE_URL` is correct in `.env`
- [ ] Prisma schema is pushed: `npm run db:push`
- [ ] Admin user exists: `npm run db:seed` or `npm run db:reset-admin`
- [ ] Using correct credentials: `admin@answerai.com` / `admin123`
- [ ] No extra spaces in email/password when logging in
- [ ] Dev server restarted after changes
- [ ] `.env` file exists and has all required variables

### Still Having Issues?

1. **Check terminal/console for errors**
2. **Check browser console (F12) for client-side errors**
3. **Verify all environment variables are set**
4. **Try resetting admin user:** `npm run db:reset-admin`
5. **Check database directly** with Prisma Studio: `npx prisma studio`







