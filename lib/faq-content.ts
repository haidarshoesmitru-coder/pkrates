export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Static, editorial FAQ/SEO content. Deliberately written without
 * hardcoded rates or dates — a rate/date baked into this prose goes
 * stale the moment it's written and directly contradicts the site's
 * own promise to never show a fake/outdated number. Every answer
 * that would otherwise need a live figure points to the table above
 * instead.
 */

export const goldFAQs: FAQItem[] = [
  { question: "What is today's gold rate in Pakistan?", answer: "Today's 24K gold rate for Karachi and other major cities is shown live in the table above, verified against city Sarafa Association boards. Rates are shown per tola, per 10 grams, and per gram for 24K, 22K, 21K, and 18K gold." },
  { question: "How often are gold rates updated?", answer: "Gold rates are checked and updated multiple times a day, verified against city Sarafa Association boards, especially during periods of price volatility." },
  { question: "Why do gold rates differ by city?", answer: "Local Sarafa Associations set rates independently based on regional demand, dealer margins, and logistics, which is why Karachi, Lahore, Islamabad, Peshawar, and Quetta can show slightly different figures on the same day." },
  { question: "What's the difference between 24K, 22K, 21K, and 18K gold?", answer: "The karat number reflects gold purity — 24K is nearly pure gold (99.9%), while 22K, 21K, and 18K contain progressively more alloy metals for durability, which is why their rates are proportionally lower." },
];

export const currencyFAQs: FAQItem[] = [
  { question: "What is the USD to PKR rate today?", answer: "Today's interbank and open market USD/PKR buy and sell rates are shown live in the table above." },
  { question: "What's the difference between interbank and open market rates?", answer: "The interbank rate is set through State Bank of Pakistan-regulated bank-to-bank trading and is used for official transactions. The open market rate is what licensed exchange companies offer walk-in customers, and it usually carries a small premium." },
  { question: "Which rate should I use for sending remittances?", answer: "Most remittance services reference the interbank rate as a baseline, but the rate you actually receive depends on your specific provider — always confirm the exact rate before transferring." },
  { question: "How often do currency rates change?", answer: "Interbank rates are typically refreshed once or twice daily, while open market rates can move several times a day depending on demand." },
];

export const petrolFAQs: FAQItem[] = [
  { question: "What is the current petrol price in Pakistan?", answer: "The current petrol price, along with the OGRA notification it's effective from, is shown live in the table above." },
  { question: "When does the petrol price change next?", answer: "As of mid-2026, OGRA revises petrol and diesel prices daily based on a rolling international oil price average, rather than the twice-monthly schedule used previously — check the page above for today's effective price." },
  { question: "Who sets petrol prices in Pakistan?", answer: "The Oil and Gas Regulatory Authority (OGRA) determines and notifies official fuel prices, which PKRates publishes directly from the government notification." },
  { question: "What is the difference between petrol and high speed diesel prices?", answer: "Petrol and High Speed Diesel are priced and revised separately by OGRA based on differing international product costs, government levies, and local demand." },
];

export const cryptoFAQs: FAQItem[] = [
  { question: "What is Bitcoin's price in PKR today?", answer: "Bitcoin's live PKR price, converted from the current USD rate using the latest interbank USD/PKR rate, is shown in the table above and updates automatically through the day." },
  { question: "How is the PKR price of crypto calculated?", answer: "PKRates converts the live USD price from major exchanges into PKR using the latest interbank USD/PKR rate at the time of the price snapshot." },
  { question: "How often are crypto prices updated?", answer: "Crypto prices update automatically several times a day, reflecting the fast-moving nature of digital asset markets." },
  { question: "Is cryptocurrency trading legal in Pakistan?", answer: "Cryptocurrency's regulatory status in Pakistan has evolved over time — PKRates provides price information only and does not offer trading, custody, or legal advice." },
];

export const prizeBondFAQs: FAQItem[] = [
  { question: "When is the next prize bond draw?", answer: "The next scheduled draw for each denomination, and its city, is shown in the calendar above." },
  { question: "How do I check if my prize bond number won?", answer: "Use the bond number search on this page to check your number against published draw results by denomination and draw date." },
  { question: "How often are prize bond draws held?", answer: "Each denomination has its own draw cycle, generally held about every three months, on a rotating schedule of cities across Pakistan." },
  { question: "Who publishes official prize bond draw results?", answer: "The National Savings organization, under the State Bank of Pakistan, conducts and publishes official prize bond draw results, which PKRates sources directly." },
];

export const cementFAQs: FAQItem[] = [
  { question: "What is the current cement price per bag?", answer: "Cement prices vary by brand and city — see the full brand-by-city breakdown above for today's rates." },
  { question: "Why do cement prices vary between brands?", answer: "Manufacturing cost, transport distance, dealer margins, and brand positioning all contribute to price differences between cement brands in the same city." },
  { question: "How often do cement rates change?", answer: "Cement rates are checked with dealer networks daily to a few times a week — less frequently than gold or currency, since input costs move more gradually." },
  { question: "Are these cement prices wholesale or retail?", answer: "PKRates publishes retail dealer prices per bag, verified through city-wise dealer networks, reflecting what a typical buyer would pay." },
];

export const steelFAQs: FAQItem[] = [
  { question: "What is today's steel/saria rate in Pakistan?", answer: "Grade 60 and Grade 40 saria rates by city are shown live in the table above, with per-maund pricing also available for smaller-quantity buyers." },
  { question: "What's the difference between Grade 40 and Grade 60 steel?", answer: "Grade 60 has higher tensile strength than Grade 40 and is more commonly used in modern reinforced concrete construction, which is reflected in its typically higher price." },
  { question: "How is steel priced — per maund or per ton?", answer: "Steel/saria is quoted both per maund (traditional local unit) and per ton (40 maunds) — PKRates shows both so you can compare however your supplier quotes it." },
  { question: "How often do steel rates change?", answer: "Steel rates are checked with Steel Melters and Re-Rolling Mills Association contacts daily to a few times a week, reflecting raw material and demand shifts." },
];

export const silverFAQs: FAQItem[] = [
  { question: "What is today's silver (chandi) rate in Pakistan?", answer: "Today's 999 fine and 925 sterling silver rates by city are shown live in the table above. Rates are shown per tola, per 10 grams, and per gram." },
  { question: "How often are silver rates updated?", answer: "Silver rates are checked and updated multiple times a day by the same city Sarafa Associations that verify gold rates, especially during periods of price volatility." },
  { question: "What's the difference between 999 fine and 925 sterling silver?", answer: "999 fine silver is nearly pure silver (99.9%), while 925 sterling silver contains about 92.5% silver alloyed with other metals for added durability, which is why its rate is proportionally lower." },
  { question: "Why do silver rates differ by city?", answer: "Local Sarafa Associations set rates independently based on regional demand, dealer margins, and logistics — the same dynamic that causes gold rates to vary slightly between Karachi, Lahore, Islamabad, Peshawar, and Quetta." },
];
