-- =========================================================
-- 20261122210000_posts.sql
-- News & Blog sections (Haidar's instruction, 22 Nov 2026).
-- One `posts` table serves both: post_type = 'news' | 'blog'.
-- Public pages (/news, /blog) read published rows via the anon
-- key (RLS policy below). All writes go through the admin panel
-- via the service-role client (lib/data/posts.ts), same pattern
-- as every other admin write in this project.
--
-- Idempotent: safe to run more than once (table uses IF NOT
-- EXISTS, policy is dropped/recreated, seeds use ON CONFLICT).
-- =========================================================

create table if not exists posts (
    id uuid primary key default uuid_generate_v4(),
    post_type text not null check (post_type in ('news', 'blog')),
    slug text unique not null,
    title text not null,
    excerpt text,
    body text not null default '',
    status text not null default 'draft' check (status in ('draft', 'published')),
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists posts_type_status_idx on posts (post_type, status, published_at desc);

alter table posts enable row level security;

drop policy if exists "posts_public_read_published" on posts;
create policy "posts_public_read_published"
    on posts for select
    to anon, authenticated
    using (status = 'published');
-- No insert/update/delete policies: writes are service-role only.

-- =========================================================
-- Seed content (first blog guides + 22 Nov 2026 rates news).
-- Every figure below is from a named source already published
-- on the site; nothing here is invented.
-- =========================================================

insert into posts (post_type, slug, title, excerpt, body, status, published_at) values
(
  'blog',
  'how-to-check-todays-gold-rate-in-pakistan',
  'How to Check Today''s Gold Rate in Pakistan',
  'Gold is quoted per tola and per 10 grams, in 24K, 22K, 21K and 18K. Here is how to read the board and check the rate before you buy or sell.',
  'Gold in Pakistan is priced by weight and purity. The two weights you will see most often are the tola (11.66 grams) and 10 grams. The purity is shown in karats: 24K is pure gold, while 22K, 21K and 18K contain a smaller share of gold mixed with other metals — which is why their rates are lower.

## Where the rate comes from

The daily gold board is set by the All Pakistan Sarafa Gems & Jewellers Association (APSGJA) together with city Sarafa associations such as Karachi, Lahore, Islamabad, Peshawar and Quetta. PKRates publishes the board rate for each karat with its source and the time it was updated, so you can see exactly which board a figure came from.

## How to check the rate

Open the Gold page on PKRates and pick your city. You will see the per-tola rate for 24K, 22K, 21K and 18K. If a shop quotes you per 10 grams, divide the tola rate by 1.166 to convert, or compare against the 10-gram figure on the board.

## Before you buy or sell

Jewellery prices also include making charges (mazdoori) and wastage, which are separate from the gold rate itself. Always confirm the day''s board rate, the karat and the weight with your jeweller before finalising a deal, and ask for the rate to be written on your receipt.',
  'published',
  '2026-11-22T14:00:00+05:00'
),
(
  'blog',
  'how-to-check-your-prize-bond-number',
  'How to Check Your Prize Bond Number',
  'Prize bond draws are held by National Savings on a fixed schedule. Here is how draws, prize tiers and number checking work.',
  'Prize bonds are issued by National Savings Pakistan in several denominations, including Rs 100, Rs 200, Rs 750, Rs 1,500, Rs 7,500, Rs 15,000 and Rs 25,000. Each denomination has its own draw schedule, held in different cities through the year.

## How a draw works

On the draw date, winning numbers are announced in prize tiers: one first prize, a small number of second prizes, and a large number of third prizes. The prize amounts depend on the denomination. A bond wins only if its full six-digit number matches a winning number in that draw.

## How to check your number

Open the Prize Bonds page on PKRates, select the denomination and draw, and enter your six-digit bond number in the search box. If your number is among the winners, the page shows the prize tier and amount. You can also compare your number against the published winners list for the draw.

## If you have won

Keep the original bond safe — a photocopy is not enough to claim. Prize claims are processed through National Savings centres and designated bank branches, and tax rules apply to prize amounts. Always verify the result against the official National Savings list before travelling to claim.',
  'published',
  '2026-11-22T14:05:00+05:00'
),
(
  'blog',
  'interbank-vs-open-market-dollar-rate',
  'Interbank vs Open Market Dollar Rate — What''s the Difference?',
  'Two dollar rates are quoted in Pakistan every day. Here is what each one means and which one applies to you.',
  'Every working day, two different US dollar rates are quoted in Pakistan: the interbank rate and the open market rate. They are close to each other, but they are not the same thing.

## The interbank rate

The interbank rate is the rate at which banks trade dollars with each other. The State Bank of Pakistan publishes the official interbank closing (revaluation) rate each working day. Banks also publish their own TT (telegraphic transfer) buying and selling rates — for example, the National Bank of Pakistan issues a daily TT sheet. Remittances, imports and bank conversions are generally priced off interbank-based rates.

## The open market rate

The open market rate is the cash rate at exchange companies and money changers. It is usually a little higher than the interbank rate, because it reflects cash demand and the exchange company''s margin. If you are buying or selling physical dollar notes, the open market rate is the one that applies to you.

## Which rate should you watch?

If money is moving through a bank — remittance, TT, or a foreign-currency account — watch the interbank and bank TT rates. If you are exchanging cash notes, watch the open market rate. PKRates shows both, each labelled with its source, so you never have to guess which number you are looking at.',
  'published',
  '2026-11-22T14:10:00+05:00'
),
(
  'news',
  'gold-24k-rs-376336-silver-rs-4600-22-nov-2026',
  'Gold 24K at Rs 376,336 per tola, silver 999 at Rs 4,600',
  'The Sarafa board holds gold at Rs 376,336 per tola for 24K, with 999 fine silver at Rs 4,600 per tola.',
  'Gold is trading at Rs 376,336 per tola for 24 karat on the Sarafa board, with 22K at Rs 344,975, 21K at Rs 329,294 and 18K at Rs 282,252 per tola.

Silver 999 fine is at Rs 4,600 per tola, and 925 sterling at Rs 4,259 per tola.

Rates are published on PKRates for Karachi, Lahore, Islamabad, Peshawar, Quetta and nine other cities, sourced from the city Sarafa Associations. Confirm the live board rate with your dealer before buying or selling.',
  'published',
  '2026-11-22T14:15:00+05:00'
),
(
  'news',
  'dollar-nbp-tt-27690-sbp-closing-27651-22-nov-2026',
  'Dollar: NBP TT selling 276.90, SBP interbank closing 276.51',
  'The National Bank TT sheet (20 Nov) quotes the dollar at 276.90 selling / 276.40 buying; the State Bank interbank closing is 276.51.',
  'The National Bank of Pakistan TT sheet dated 20 November 2026 quotes the US dollar at Rs 276.90 (TT selling) and Rs 276.40 (TT buying), a mid rate of Rs 276.65.

The State Bank of Pakistan interbank closing rate for 20 November is Rs 276.51, essentially unchanged from the previous working day.

Banks and exchange companies apply their own margins over these reference rates. The next NBP sheet and SBP closing rate are due on the next working day.',
  'published',
  '2026-11-22T14:20:00+05:00'
),
(
  'news',
  'petrol-rs-322-diesel-rs-357-ogra-21-nov-2026',
  'Petrol at Rs 322, diesel at Rs 357 per litre under OGRA prices',
  'OGRA-notified prices effective 21 November 2026: petrol Rs 322.00 and high-speed diesel Rs 357.00 per litre.',
  'Petrol is priced at Rs 322.00 per litre and high-speed diesel at Rs 357.00 per litre under the Oil and Gas Regulatory Authority (OGRA) notification effective 21 November 2026.

Kerosene oil is at Rs 273.22 per litre, and the maximum consumer price of LPG is Rs 294.08 per kilogram under the OGRA notification effective 1 November 2026.

Fuel prices are revised by OGRA notification; PKRates updates this page whenever a new notification is issued.',
  'published',
  '2026-11-22T14:25:00+05:00'
),
(
  'news',
  'prize-bond-draws-16-nov-2026-results',
  'Prize bond draws held 16 Nov: Rs 1,500 #108 Hyderabad, Rs 100 #56 Faisalabad',
  'National Savings held the Rs 1,500 draw #108 in Hyderabad and the Rs 100 draw #56 in Faisalabad on 16 November 2026. Check your number on PKRates.',
  'National Savings held two prize bond draws on 16 November 2026: the Rs 1,500 denomination draw #108 in Hyderabad, and the Rs 100 denomination draw #56 in Faisalabad.

Winning numbers for the first and second prize tiers of both draws are published on the PKRates Prize Bonds page, where you can also search your six-digit bond number to check whether it has won.

If your number has won, keep the original bond safe and claim through a National Savings centre or designated bank branch.',
  'published',
  '2026-11-22T14:30:00+05:00'
)
on conflict (slug) do nothing;
