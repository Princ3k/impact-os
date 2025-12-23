# Impact OS — Quick Start (5 Minutes)

Get up and running in 5 minutes. This assumes you have Node.js installed.

---

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

---

## Step 2: Set Up Supabase (2 min)

1. **Create a project:** Go to [supabase.com](https://supabase.com) → New Project
2. **Run migration:**
   - Open Supabase dashboard → SQL Editor
   - Copy/paste contents from `supabase/migrations/001_initial_schema.sql`
   - Click Run
3. **Get credentials:**
   - Go to Settings → API
   - Copy Project URL and anon key

---

## Step 3: Set Up Gemini API (1 min)

1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Copy the key

---

## Step 4: Configure Environment (30 seconds)

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

---

## Step 5: Run! (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## What to Test

1. **Sign in** with your email → Check inbox for magic link
2. **Log an entry** → Add some work you did today
3. **View timeline** → See your entry listed
4. **Generate report** → Create a weekly summary

---

## Deploy to Vercel (Optional, 2 min)

```bash
npm install -g vercel
vercel
```

Add your environment variables when prompted.

---

## iOS App (Optional, 5 min)

Requires macOS with Xcode.

```bash
# First time only
npm run ios:setup

# Every time you want to test
npm run dev                  # In one terminal
npm run ios:sync && npm run ios:open  # In another terminal
```

Then click Run in Xcode.

---

## Troubleshooting

**Magic link not working?**
- Check spam folder
- Verify email provider is enabled in Supabase → Authentication → Providers

**Report generation failing?**
- Make sure you have entries from the last 7 days
- Check Gemini API key is correct
- Verify API quota isn't exceeded

**Build errors?**
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Clear browser cache

---

## Next Steps

✅ You're all set! Check out [SETUP.md](SETUP.md) for detailed deployment instructions.
