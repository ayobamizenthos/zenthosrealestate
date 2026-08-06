# Zenthos Real Estate

Property brokerage for Lagos. Buyers search and filter listings, save and
compare them, read the journal, and reach a broker on WhatsApp. Brokers publish
and manage listings, articles and area guides from an admin area.

**Live:** https://www.zenthosrealestate.com.ng

## Stack

- Next.js 16, TypeScript, Tailwind
- Supabase (Postgres, auth, realtime, storage policies)
- Cloudinary for property photography
- Vercel

## Local

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the Supabase, Cloudinary and
VAPID values.

## Scripts

```bash
npm run db:migrate    # apply supabase/migrations
npm run import -- "<folder>"   # publish a listing from a photo folder
npm run icons         # regenerate icons from the brand artwork
```
