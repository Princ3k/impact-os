# Impact OS

Track your work. Show your impact.

🌐 **Live at [getimpactos.com](https://getimpactos.com)**

## Overview

Impact OS is a modern work tracking and impact reporting tool that helps professionals document their daily work and generate AI-powered reports for weekly summaries and 1:1 meetings with managers.

### Key Features

- 📝 **Daily Work Logging** - Quick and easy entry creation with title, description, and date
- 📊 **AI-Powered Reports** - Generate professional weekly summaries and 1:1 prep documents using Google Gemini AI
- 🔐 **Secure Authentication** - User authentication powered by Supabase Auth
- 💾 **Cloud Database** - All data securely stored in Supabase PostgreSQL
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Google Gemini 2.0 Flash
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Deployment**: Vercel
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account
- A [Google AI Studio](https://aistudio.google.com) API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/impact-os.git
cd impact-os
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

4. Set up your Supabase database by running this SQL in the Supabase SQL Editor:

```sql
-- Create work_entries table
create table work_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  entry_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table work_entries enable row level security;

-- Create policies
create policy "Users can view their own entries"
  on work_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own entries"
  on work_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on work_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on work_entries for delete
  using (auth.uid() = user_id);

-- Create index for better query performance
create index work_entries_user_id_idx on work_entries(user_id);
create index work_entries_entry_date_idx on work_entries(entry_date);
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key | [Google AI Studio](https://aistudio.google.com/app/apikey) |

### Important Notes

- All variables use `NEXT_PUBLIC_` prefix because they're accessed client-side
- Never commit `.env.local` to version control
- For production (Vercel), add these in Project Settings → Environment Variables

## Project Structure

```
impact-os/
├── app/
│   ├── api/
│   │   └── generateReport/    # Gemini AI report generation endpoint
│   ├── auth/
│   │   └── callback/           # Supabase auth callback handler
│   ├── dashboard/              # Main dashboard with work entries
│   ├── login/                  # Login page
│   ├── report/
│   │   └── view/               # Report viewing page
│   ├── signup/                 # Signup page
│   ├── globals.css             # Global styles
│   └── layout.tsx              # Root layout with auth provider
├── components/
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── auth-context.tsx        # Authentication context provider
│   ├── supabase.ts             # Supabase client configuration
│   └── utils.ts                # Utility functions
├── types/
│   └── css.d.ts                # TypeScript CSS module declarations
└── public/                     # Static assets
```

## How It Works

### 1. Authentication Flow
- Users sign up or log in using Supabase Auth
- Session stored in cookies via AuthContext
- Protected routes redirect to login if not authenticated

### 2. Work Entry Management
- Users create daily work entries with title, description, and date
- All entries stored in Supabase with Row Level Security
- Each user can only access their own entries

### 3. AI Report Generation
- Select date range and report type (weekly summary or 1:1 prep)
- Entries sent to Gemini AI API with structured prompt
- AI generates formatted Markdown report with:
  - What I Worked On
  - Key Wins
  - Impact
  - Blockers (if any)
  - Next Steps

### 4. Report Formatting
- ReactMarkdown renders AI output with custom components
- Tailwind Typography plugin for prose styling
- Professional, readable format suitable for managers

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request

## Database Schema

### work_entries

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| title | text | Entry title |
| description | text | Entry description/details |
| entry_date | date | Date of work |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Last update time |

## Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ User data isolated per user_id
- ✅ Environment variables for sensitive keys
- ✅ Supabase Auth handles password hashing and session management
- ✅ API routes validate user authentication

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and not currently licensed for public use.

## Support

For issues or questions, please open an issue on GitHub.

---