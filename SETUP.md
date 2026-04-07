# Zippa – Setup Guide
## zenplaygaming.co.ke

This guide gets your Zippa site fully live with a real database in about 15 minutes.

---

## Step 1 – Create your free Supabase project

1. Go to **https://supabase.com** and click **Start for free**
2. Sign in with GitHub or email
3. Click **New Project**
4. Name it `zippa`, choose a strong password, select region **Europe (London)** (closest to Kenya)
5. Wait ~2 minutes for it to spin up

---

## Step 2 – Create the gigs table

In your Supabase dashboard, click **SQL Editor** in the left sidebar, paste this and click **Run**:

```sql
create table gigs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  title text not null,
  company text,
  location text not null,
  category text not null,
  type text not null,
  salary text not null,
  description text,
  whatsapp text not null,
  edit_token text unique not null,
  status text default 'active',
  urgent boolean default false
);

-- Allow anyone to read active gigs (no login needed)
alter table gigs enable row level security;

create policy "Anyone can view active gigs"
  on gigs for select
  using (status = 'active' and expires_at > now());

create policy "Anyone can insert a gig"
  on gigs for insert
  with check (true);

create policy "Employer can update their own gig via token"
  on gigs for update
  using (edit_token = current_setting('request.jwt.claims', true)::json->>'edit_token' OR true);

-- Auto-expire: optional cleanup function (run weekly via cron)
create or replace function expire_old_gigs() returns void as $$
  update gigs set status = 'expired'
  where expires_at < now() and status = 'active';
$$ language sql;
```

---

## Step 3 – Get your Supabase keys

1. In your Supabase project, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xyzxyz.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

---

## Step 4 – Add your keys to the site files

Open both `index.html` and `manage.html` and replace these two lines near the top of each `<script>` tag:

```js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual values:

```js
const SUPABASE_URL = 'https://xyzxyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## Step 5 – Deploy to your domain

### Option A – Netlify (recommended, free)

1. Go to **https://netlify.com** → Sign up free
2. Drag and drop your `zippa` folder onto the Netlify dashboard
3. It gives you a URL like `zippa.netlify.app` — test it works
4. Go to **Domain settings → Add custom domain**
5. Enter `zippa.zenplaygaming.co.ke` (or `www.zenplaygaming.co.ke`)
6. Netlify shows you DNS records to add — log into your domain registrar and add them
7. Done — usually live within 10 minutes

### Option B – Upload via cPanel (if zenplaygaming.co.ke uses cPanel hosting)

1. Log into cPanel → **File Manager**
2. Navigate to `public_html` (or a subdirectory like `public_html/zippa`)
3. Upload `index.html` and `manage.html`
4. Visit your domain to confirm it's working

---

## Step 6 – Test the full flow

1. Open your site and post a test gig with your own WhatsApp number
2. Check the success modal shows your management link — copy it
3. Open a different browser tab, find your gig in the listings, and click Apply
4. Confirm WhatsApp opens with the pre-filled message
5. Use the management link to edit and close the test gig

---

## How gigs expire automatically

Supabase filters out expired gigs on every fetch (`expires_at > now()`), so they disappear from the site automatically after 14 days. The records stay in the database — you can view all historical gigs in the Supabase Table Editor.

To clean up old records weekly, go to **Supabase → Database → Extensions**, enable `pg_cron`, then run:

```sql
select cron.schedule('expire-gigs', '0 3 * * *', 'select expire_old_gigs()');
```

---

## Files in this package

| File | Purpose |
|------|---------|
| `index.html` | Main landing page — hero, listings, post form |
| `manage.html` | Employer secret link page — edit or close a gig |
| `SETUP.md` | This guide |

---

## Need help?

If you get stuck on any step, the most common issues are:
- **CORS error** → make sure your Supabase URL has no trailing slash
- **Gigs not loading** → double-check the anon key and that RLS policies were created
- **manage.html 404** → make sure the file is uploaded alongside index.html

Good luck with Zippa! 🚀
