# Sacred Living Planner

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import the GitHub repo
4. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` — from your Supabase project settings
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project settings
5. Deploy!

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
