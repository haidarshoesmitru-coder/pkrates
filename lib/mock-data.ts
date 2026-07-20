import type {
  GoldCityRate,
  SilverCityRate,
  CurrencyRate,
  FuelPrice,
  PrizeBondDraw,
  Mover,
  CategoryCard,
  TrendDirection,
} from "@/types";

export const lastUpdated = "Today, 4:12 PM PKT";

export const goldRates: GoldCityRate[] = [
  {
    city: "Karachi",
    karat24: 285500,
    karat22: 261708,
    karat21: 249813,
    karat18: 214125,
    changeAmount: 1500,
    changePercent: 0.53,
    trend: "up",
    sparkline: [279200, 280100, 281400, 280900, 282600, 284000, 285500],
  },
  {
    city: "Lahore",
    karat24: 285600,
    karat22: 261800,
    karat21: 249900,
    karat18: 214200,
    changeAmount: 1500,
    changePercent: 0.53,
    trend: "up",
    sparkline: [279300, 280200, 281500, 281000, 282700, 284100, 285600],
  },
  {
    city: "Islamabad",
    karat24: 285550,
    karat22: 261754,
    karat21: 249856,
    karat18: 214163,
    changeAmount: 1500,
    changePercent: 0.53,
    trend: "up",
    sparkline: [279250, 280150, 281450, 280950, 282650, 284050, 285550],
  },
  {
    city: "Peshawar",
    karat24: 285700,
    karat22: 261892,
    karat21: 249988,
    karat18: 214275,
    changeAmount: 1600,
    changePercent: 0.56,
    trend: "up",
    sparkline: [279100, 280000, 281200, 280800, 282500, 284100, 285700],
  },
  {
    city: "Quetta",
    karat24: 285450,
    karat22: 261662,
    karat21: 249769,
    karat18: 214088,
    changeAmount: 1450,
    changePercent: 0.51,
    trend: "up",
    sparkline: [279000, 279900, 281100, 280700, 282400, 284000, 285450],
  },
];

/** Multi-range historical series for gold 24K, keyed by city — powers the 1D/7D/1M/1Y toggle. */
export const goldHistoryByRange: Record<string, Record<"1D" | "7D" | "1M" | "1Y", number[]>> = {
  Karachi: {
    "1D": [284200, 284500, 284300, 284800, 285100, 284900, 285500],
    "7D": [279200, 280100, 281400, 280900, 282600, 284000, 285500],
    "1M": [271400, 273800, 276200, 274900, 278600, 281300, 285500],
    "1Y": [214800, 228400, 241200, 236700, 258900, 271600, 285500],
  },
  Lahore: {
    "1D": [284300, 284600, 284400, 284900, 285200, 285000, 285600],
    "7D": [279300, 280200, 281500, 281000, 282700, 284100, 285600],
    "1M": [271500, 273900, 276300, 275000, 278700, 281400, 285600],
    "1Y": [214900, 228500, 241300, 236800, 259000, 271700, 285600],
  },
  Islamabad: {
    "1D": [284250, 284550, 284350, 284850, 285150, 284950, 285550],
    "7D": [279250, 280150, 281450, 280950, 282650, 284050, 285550],
    "1M": [271450, 273850, 276250, 274950, 278650, 281350, 285550],
    "1Y": [214850, 228450, 241250, 236750, 258950, 271650, 285550],
  },
  Peshawar: {
    "1D": [284400, 284700, 284450, 285000, 285300, 285100, 285700],
    "7D": [279100, 280000, 281200, 280800, 282500, 284100, 285700],
    "1M": [271300, 273700, 276100, 274800, 278500, 281200, 285700],
    "1Y": [214700, 228300, 241100, 236600, 258800, 271500, 285700],
  },
  Quetta: {
    "1D": [284150, 284450, 284250, 284750, 285050, 284850, 285450],
    "7D": [279000, 279900, 281100, 280700, 282400, 284000, 285450],
    "1M": [271200, 273600, 276000, 274700, 278400, 281100, 285450],
    "1Y": [214600, 228200, 241000, 236500, 258700, 271400, 285450],
  },
};

/** "vs yesterday / vs last week / vs last month" comparison, distinct from the live intraday delta. */
export const goldComparison = {
  vsYesterday: { amount: 1500, percent: 0.53 },
  vsLastWeek: { amount: 6300, percent: 2.26 },
  vsLastMonth: { amount: 14100, percent: 5.2 },
};

export interface SentimentSignal {
  category: string;
  mood: "bullish" | "bearish" | "neutral" | "volatile";
  score: number; // 0-100, higher = more bullish/active
  note: string;
}

export const marketSentiment: SentimentSignal[] = [
  { category: "Gold", mood: "bullish", score: 78, note: "6 straight days of gains" },
  { category: "Currency", mood: "neutral", score: 52, note: "PKR holding steady vs USD" },
  { category: "Petrol", mood: "bullish", score: 64, note: "Up after last OGRA revision" },
  { category: "Crypto", mood: "volatile", score: 71, note: "BTC swung 3.8% in 24h" },
  { category: "Steel", mood: "bearish", score: 34, note: "Cooling demand this week" },
];

/** Composite score (0-100) driving the homepage's overall Market Mood gauge. */
export const overallSentimentScore = 64;

export const socialProof = [
  { value: "50,000+", label: "Daily active users" },
  { value: "500K+", label: "Rate checks this month" },
  { value: "7", label: "Verified institutional sources" },
  { value: "< 5 min", label: "Average data freshness" },
];



export const currencyRates: CurrencyRate[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", interbankBuy: 278.20, interbankSell: 278.80, openBuy: 278.90, openSell: 279.60, changePercent: 0.12, trend: "up" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪", interbankBuy: 75.65, interbankSell: 75.95, openBuy: 76.10, openSell: 76.55, changePercent: 0.08, trend: "up" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", interbankBuy: 354.40, interbankSell: 355.30, openBuy: 355.80, openSell: 357.10, changePercent: -0.21, trend: "down" },
  { code: "EUR", name: "Euro", flag: "🇪🇺", interbankBuy: 302.15, interbankSell: 302.95, openBuy: 303.40, openSell: 304.60, changePercent: 0.05, trend: "flat" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦", interbankBuy: 74.10, interbankSell: 74.40, openBuy: 74.55, openSell: 74.95, changePercent: 0.10, trend: "up" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳", interbankBuy: 38.55, interbankSell: 38.80, openBuy: 38.90, openSell: 39.20, changePercent: -0.04, trend: "down" },
];

export const fuelPrices: FuelPrice[] = [
  {
    type: "Petrol (Motor Spirit)",
    pricePerLiter: 272.50,
    changeAmount: 4.10,
    changePercent: 1.53,
    trend: "up",
    effectiveFrom: "16 Jul 2026",
    nextReviewEstimate: "1 Aug 2026",
  },
  {
    type: "High Speed Diesel",
    pricePerLiter: 278.90,
    changeAmount: -2.30,
    changePercent: -0.82,
    trend: "down",
    effectiveFrom: "16 Jul 2026",
    nextReviewEstimate: "1 Aug 2026",
  },
  {
    type: "Kerosene Oil",
    pricePerLiter: 189.60,
    changeAmount: 0,
    changePercent: 0,
    trend: "flat",
    effectiveFrom: "16 Jul 2026",
    nextReviewEstimate: "1 Aug 2026",
  },
];

export const prizeBondDraws: PrizeBondDraw[] = [
  { denomination: "Rs. 40,000", drawNumber: 112, city: "Multan", date: "1 Sep 2026", status: "upcoming" },
  { denomination: "Rs. 25,000", drawNumber: 98, city: "Lahore", date: "15 Aug 2026", status: "upcoming" },
  { denomination: "Rs. 15,000", drawNumber: 104, city: "Karachi", date: "1 Aug 2026", status: "upcoming" },
  { denomination: "Rs. 750", drawNumber: 121, city: "Peshawar", date: "16 Jul 2026", status: "completed", firstPrize: "Rs. 1,500,000" },
];

export const biggestMovers: Mover[] = [
  { category: "Gold", label: "Gold 24K — Peshawar", sublabel: "Per tola", changePercent: 0.56, changeAmount: "+Rs 1,600", trend: "up" },
  { category: "Crypto", label: "Bitcoin (BTC)", sublabel: "Priced in PKR", changePercent: 3.82, changeAmount: "+Rs 890,400", trend: "up" },
  { category: "Steel", label: "Grade 60 Saria — Karachi", sublabel: "Per ton", changePercent: -2.14, changeAmount: "-Rs 5,200", trend: "down" },
  { category: "Currency", label: "GBP / PKR", sublabel: "Interbank sell", changePercent: -0.21, changeAmount: "-Rs 0.75", trend: "down" },
  { category: "Cement", label: "Lucky Cement — Lahore", sublabel: "Per 50kg bag", changePercent: 1.42, changeAmount: "+Rs 22", trend: "up" },
  { category: "Crypto", label: "Ethereum (ETH)", sublabel: "Priced in PKR", changePercent: -1.68, changeAmount: "-Rs 14,900", trend: "down" },
];

export const categories: CategoryCard[] = [
  { slug: "gold", title: "Gold Rates", description: "24K, 22K, 21K & 18K — city-wise, updated through the day.", headlineValue: "285,500", headlineLabel: "Rs / tola · 24K Karachi", trend: "up", icon: "coins" },
  { slug: "silver", title: "Silver Rates", description: "999 Fine & 925 Sterling — city-wise, updated through the day.", headlineValue: "3,350", headlineLabel: "Rs / tola · 999 Fine, Karachi", trend: "up", icon: "gem" },
  { slug: "currency", title: "Currency Rates", description: "Interbank & open market — buy/sell for 15+ currencies.", headlineValue: "278.80", headlineLabel: "USD / PKR · Interbank sell", trend: "up", icon: "banknote" },
  { slug: "petrol", title: "Petrol Prices", description: "Official OGRA-notified fuel prices, with change history.", headlineValue: "272.50", headlineLabel: "Rs / litre · Petrol", trend: "up", icon: "fuel" },
  { slug: "crypto", title: "Crypto Prices", description: "Top coins priced live in PKR and USD.", headlineValue: "24.2M", headlineLabel: "Rs · Bitcoin (BTC)", trend: "up", icon: "bitcoin" },
  { slug: "prize-bonds", title: "Prize Bonds", description: "Draw results, schedules and bond number search.", headlineValue: "1 Sep", headlineLabel: "Next draw · Rs 40,000", trend: "flat", icon: "ticket" },
  { slug: "cement", title: "Cement Rates", description: "Per-bag pricing across major brands and cities.", headlineValue: "1,570", headlineLabel: "Rs / bag · Lucky, Lahore", trend: "up", icon: "package" },
  { slug: "steel", title: "Steel / Saria Rates", description: "Grade-wise pricing per maund and per ton.", headlineValue: "268,400", headlineLabel: "Rs / ton · Grade 60, Karachi", trend: "down", icon: "layers" },
];

export const trustSources = [
  { name: "Karachi Sarafa Association", role: "Gold & silver rate verification" },
  { name: "State Bank of Pakistan", role: "Interbank currency data" },
  { name: "OGRA", role: "Official fuel price notifications" },
  { name: "National Savings", role: "Prize bond draw results" },
  { name: "Licensed Exchange Companies", role: "Open market currency rates" },
];

// =========================================================
// v1.4 additions — category-page data (cement/steel/crypto
// listings, comparison strips, FAQ content per domain)
// =========================================================

export interface CementCityRate {
  brand: string;
  city: string;
  pricePerBag: number;
  changePercent: number;
  trend: TrendDirection;
  sparkline: number[];
}

export const cementRates: CementCityRate[] = [
  { brand: "Lucky Cement", city: "Lahore", pricePerBag: 1570, changePercent: 1.42, trend: "up", sparkline: [1540, 1545, 1550, 1548, 1560, 1565, 1570] },
  { brand: "DG Cement", city: "Karachi", pricePerBag: 1545, changePercent: 0.65, trend: "up", sparkline: [1520, 1525, 1530, 1528, 1535, 1540, 1545] },
  { brand: "Bestway Cement", city: "Islamabad", pricePerBag: 1610, changePercent: -0.31, trend: "down", sparkline: [1620, 1618, 1615, 1617, 1612, 1614, 1610] },
  { brand: "Fauji Cement", city: "Peshawar", pricePerBag: 1495, changePercent: 0.20, trend: "up", sparkline: [1485, 1487, 1490, 1488, 1492, 1493, 1495] },
  { brand: "Maple Leaf Cement", city: "Quetta", pricePerBag: 1630, changePercent: 0.0, trend: "flat", sparkline: [1630, 1630, 1628, 1630, 1631, 1629, 1630] },
];

export interface SteelCityRate {
  grade: string;
  city: string;
  pricePerMaund: number;
  pricePerTon: number;
  changePercent: number;
  trend: TrendDirection;
  sparkline: number[];
}

export const steelRates: SteelCityRate[] = [
  { grade: "Grade 60", city: "Karachi", pricePerMaund: 10050, pricePerTon: 268400, changePercent: -2.14, trend: "down", sparkline: [274200, 273100, 271800, 272400, 270100, 269200, 268400] },
  { grade: "Grade 60", city: "Lahore", pricePerMaund: 9780, pricePerTon: 261100, changePercent: -1.65, trend: "down", sparkline: [266500, 265400, 264100, 264600, 262800, 262000, 261100] },
  { grade: "Grade 40", city: "Karachi", pricePerMaund: 9420, pricePerTon: 251400, changePercent: -1.02, trend: "down", sparkline: [255800, 255000, 254100, 254400, 252900, 252100, 251400] },
  { grade: "Grade 40", city: "Islamabad", pricePerMaund: 9510, pricePerTon: 253800, changePercent: 0.35, trend: "up", sparkline: [251900, 252200, 252600, 252400, 253000, 253400, 253800] },
];

export interface CryptoRate {
  symbol: string;
  name: string;
  priceUsd: number;
  pricePkr: number;
  changePercent: number;
  trend: TrendDirection;
  sparkline: number[];
}

export const cryptoRates: CryptoRate[] = [
  { symbol: "BTC", name: "Bitcoin", priceUsd: 87200, pricePkr: 24277600, changePercent: 3.82, trend: "up", sparkline: [22.1, 22.4, 22.9, 22.7, 23.3, 23.9, 24.2].map((v) => v * 1_000_000) },
  { symbol: "ETH", name: "Ethereum", priceUsd: 3120, pricePkr: 868944, changePercent: -1.68, trend: "down", sparkline: [890000, 885000, 878000, 882000, 872000, 870000, 868944] },
  { symbol: "USDT", name: "Tether", priceUsd: 1.00, pricePkr: 278.80, changePercent: 0.02, trend: "flat", sparkline: [278.2, 278.3, 278.5, 278.4, 278.6, 278.7, 278.8] },
  { symbol: "BNB", name: "BNB", priceUsd: 612, pricePkr: 170626, changePercent: 1.15, trend: "up", sparkline: [166200, 166800, 167500, 167200, 168400, 169500, 170626] },
  { symbol: "SOL", name: "Solana", priceUsd: 198, pricePkr: 55202, changePercent: 4.61, trend: "up", sparkline: [51200, 51900, 52800, 52400, 53600, 54400, 55202] },
  { symbol: "XRP", name: "XRP", priceUsd: 2.34, pricePkr: 652.39, changePercent: -0.85, trend: "down", sparkline: [662, 660, 657, 659, 655, 654, 652.39] },
];

// ---------------------------------------------------------
// Historical comparison strips (vs Yesterday / Last Week / Last Month)
// ---------------------------------------------------------
export const currencyComparison = {
  vsYesterday: { amount: "+Rs 0.35", percent: 0.12 },
  vsLastWeek: { amount: "+Rs 1.20", percent: 0.43 },
  vsLastMonth: { amount: "+Rs 3.85", percent: 1.40 },
};

export const petrolComparison = {
  vsYesterday: { amount: "Rs 0.00", percent: 0 },
  vsLastWeek: { amount: "+Rs 4.10", percent: 1.53 },
  vsLastMonth: { amount: "+Rs 9.40", percent: 3.57 },
};

export const cryptoComparison = {
  vsYesterday: { amount: "+Rs 890,400", percent: 3.82 },
  vsLastWeek: { amount: "+Rs 1,980,000", percent: 8.87 },
  vsLastMonth: { amount: "+Rs 3,120,000", percent: 14.75 },
};

export const cementComparison = {
  vsYesterday: { amount: "+Rs 22", percent: 1.42 },
  vsLastWeek: { amount: "+Rs 35", percent: 2.28 },
  vsLastMonth: { amount: "+Rs 60", percent: 3.97 },
};

export const steelComparison = {
  vsYesterday: { amount: "-Rs 5,200", percent: -2.14 },
  vsLastWeek: { amount: "-Rs 9,800", percent: -3.52 },
  vsLastMonth: { amount: "-Rs 4,100", percent: -1.50 },
};

// ---------------------------------------------------------
// Prize Bonds: "recent draws" list stands in for a comparison
// table, since draws are discrete events rather than a
// continuous rate — see PKRates Data Architecture, Section 4.
// ---------------------------------------------------------
export const recentPrizeBondDraws = [
  { denomination: "Rs. 750", drawNumber: 121, city: "Peshawar", date: "16 Jul 2026", firstPrize: "Rs. 1,500,000" },
  { denomination: "Rs. 1,500", drawNumber: 96, city: "Karachi", date: "1 Jul 2026", firstPrize: "Rs. 3,000,000" },
  { denomination: "Rs. 200", drawNumber: 88, city: "Lahore", date: "16 Jun 2026", firstPrize: "Rs. 750,000" },
];

// ---------------------------------------------------------
// FAQ content per domain — SEO-friendly, answers the exact
// queries people search ("gold rate today", "USD to PKR", etc.)
// ---------------------------------------------------------
export const goldFAQs = [
  { question: "What is today's gold rate in Pakistan?", answer: "Today's 24K gold rate is Rs 285,500 per tola in Karachi, with minor city-wise variation. Rates are shown per tola, per 10 grams, and per gram for 24K, 22K, 21K, and 18K gold." },
  { question: "How often are gold rates updated?", answer: "Gold rates are checked and updated multiple times a day, verified against city Sarafa Association boards, especially during periods of price volatility." },
  { question: "Why do gold rates differ by city?", answer: "Local Sarafa Associations set rates independently based on regional demand, dealer margins, and logistics, which is why Karachi, Lahore, Islamabad, Peshawar, and Quetta can show slightly different figures on the same day." },
  { question: "What's the difference between 24K, 22K, 21K, and 18K gold?", answer: "The karat number reflects gold purity — 24K is nearly pure gold (99.9%), while 22K, 21K, and 18K contain progressively more alloy metals for durability, which is why their rates are proportionally lower." },
];

// ---------------------------------------------------------
// Silver (Chandi) — mirrors the Gold data shapes exactly
// (goldRates / goldHistoryByRange / goldComparison / goldFAQs),
// same city set, same per-tola/10g/gram convention.
// ---------------------------------------------------------
export const silverRates: SilverCityRate[] = [
  { city: "Karachi", fine999: 3350, sterling925: 3102, changeAmount: 18, changePercent: 0.54, trend: "up", sparkline: [3280, 3295, 3310, 3300, 3325, 3338, 3350] },
  { city: "Lahore", fine999: 3355, sterling925: 3107, changeAmount: 18, changePercent: 0.54, trend: "up", sparkline: [3285, 3300, 3315, 3305, 3330, 3343, 3355] },
  { city: "Islamabad", fine999: 3352, sterling925: 3104, changeAmount: 18, changePercent: 0.54, trend: "up", sparkline: [3282, 3297, 3312, 3302, 3327, 3340, 3352] },
  { city: "Peshawar", fine999: 3360, sterling925: 3111, changeAmount: 20, changePercent: 0.60, trend: "up", sparkline: [3278, 3294, 3308, 3298, 3324, 3341, 3360] },
  { city: "Quetta", fine999: 3345, sterling925: 3097, changeAmount: 17, changePercent: 0.51, trend: "up", sparkline: [3276, 3290, 3305, 3296, 3320, 3333, 3345] },
];

export const silverHistoryByRange: Record<string, Record<"1D" | "7D" | "1M" | "1Y", number[]>> = {
  Karachi: {
    "1D": [3330, 3335, 3332, 3340, 3345, 3342, 3350],
    "7D": [3280, 3295, 3310, 3300, 3325, 3338, 3350],
    "1M": [3180, 3210, 3245, 3225, 3270, 3305, 3350],
    "1Y": [2540, 2680, 2830, 2790, 3040, 3190, 3350],
  },
  Lahore: {
    "1D": [3335, 3340, 3337, 3345, 3350, 3347, 3355],
    "7D": [3285, 3300, 3315, 3305, 3330, 3343, 3355],
    "1M": [3185, 3215, 3250, 3230, 3275, 3310, 3355],
    "1Y": [2545, 2685, 2835, 2795, 3045, 3195, 3355],
  },
  Islamabad: {
    "1D": [3332, 3337, 3334, 3342, 3347, 3344, 3352],
    "7D": [3282, 3297, 3312, 3302, 3327, 3340, 3352],
    "1M": [3182, 3212, 3247, 3227, 3272, 3307, 3352],
    "1Y": [2542, 2682, 2832, 2792, 3042, 3192, 3352],
  },
  Peshawar: {
    "1D": [3340, 3346, 3341, 3350, 3355, 3350, 3360],
    "7D": [3278, 3294, 3308, 3298, 3324, 3341, 3360],
    "1M": [3178, 3208, 3243, 3223, 3268, 3303, 3360],
    "1Y": [2538, 2678, 2828, 2788, 3038, 3188, 3360],
  },
  Quetta: {
    "1D": [3325, 3330, 3327, 3335, 3340, 3337, 3345],
    "7D": [3276, 3290, 3305, 3296, 3320, 3333, 3345],
    "1M": [3176, 3206, 3241, 3221, 3266, 3301, 3345],
    "1Y": [2536, 2676, 2826, 2786, 3036, 3186, 3345],
  },
};

export const silverComparison = {
  vsYesterday: { amount: 18, percent: 0.54 },
  vsLastWeek: { amount: 70, percent: 2.13 },
  vsLastMonth: { amount: 170, percent: 5.35 },
};

export const silverFAQs = [
  { question: "What is today's silver (chandi) rate in Pakistan?", answer: "Today's 999 fine silver rate is Rs 3,350 per tola in Karachi, with minor city-wise variation. Rates are shown per tola, per 10 grams, and per gram for both 999 fine and 925 sterling silver." },
  { question: "How often are silver rates updated?", answer: "Silver rates are checked and updated multiple times a day by the same city Sarafa Associations that verify gold rates, especially during periods of price volatility." },
  { question: "What's the difference between 999 fine and 925 sterling silver?", answer: "999 fine silver is nearly pure silver (99.9%), while 925 sterling silver contains about 92.5% silver alloyed with other metals for added durability, which is why its rate is proportionally lower." },
  { question: "Why do silver rates differ by city?", answer: "Local Sarafa Associations set rates independently based on regional demand, dealer margins, and logistics — the same dynamic that causes gold rates to vary slightly between Karachi, Lahore, Islamabad, Peshawar, and Quetta." },
];

export const currencyFAQs = [
  { question: "What is the USD to PKR rate today?", answer: "The interbank USD/PKR sell rate is Rs 278.80 today, while the open market rate — what you'd typically get at an exchange counter — is Rs 279.60." },
  { question: "What's the difference between interbank and open market rates?", answer: "The interbank rate is set through State Bank of Pakistan-regulated bank-to-bank trading and is used for official transactions. The open market rate is what licensed exchange companies offer walk-in customers, and it usually carries a small premium." },
  { question: "Which rate should I use for sending remittances?", answer: "Most remittance services reference the interbank rate as a baseline, but the rate you actually receive depends on your specific provider — always confirm the exact rate before transferring." },
  { question: "How often do currency rates change?", answer: "Interbank rates are typically refreshed once or twice daily, while open market rates can move several times a day depending on demand." },
];

export const petrolFAQs = [
  { question: "What is the current petrol price in Pakistan?", answer: "The current petrol price is Rs 272.50 per litre, effective from the latest OGRA notification dated 16 Jul 2026." },
  { question: "When does the petrol price change next?", answer: "Petrol and diesel prices are typically revised twice a month, around the 1st and 16th, based on OGRA's official notification — the next review is expected around 1 Aug 2026." },
  { question: "Who sets petrol prices in Pakistan?", answer: "The Oil and Gas Regulatory Authority (OGRA) determines and notifies official fuel prices, which PKRates publishes directly from the government notification." },
  { question: "What is the difference between petrol and high speed diesel prices?", answer: "Petrol and High Speed Diesel are priced and revised separately by OGRA based on differing international product costs, government levies, and local demand." },
];

export const cryptoFAQs = [
  { question: "What is Bitcoin's price in PKR today?", answer: "Bitcoin (BTC) is trading at approximately Rs 24.2 million today, calculated by converting the live USD price using the current interbank USD/PKR rate." },
  { question: "How is the PKR price of crypto calculated?", answer: "PKRates converts the live USD price from major exchanges into PKR using the latest interbank USD/PKR rate at the time of the price snapshot." },
  { question: "How often are crypto prices updated?", answer: "Crypto prices update every few minutes, reflecting the fast-moving nature of digital asset markets." },
  { question: "Is cryptocurrency trading legal in Pakistan?", answer: "Cryptocurrency's regulatory status in Pakistan has evolved over time — PKRates provides price information only and does not offer trading, custody, or legal advice." },
];

export const prizeBondFAQs = [
  { question: "When is the next prize bond draw?", answer: "The next Rs. 40,000 prize bond draw is scheduled for 1 Sep 2026 in Multan. Check the full calendar above for other denominations." },
  { question: "How do I check if my prize bond number won?", answer: "Use the bond number search on this page to check your number against published draw results by denomination and draw date." },
  { question: "How often are prize bond draws held?", answer: "Each denomination has its own draw cycle, generally held about every three months, on a rotating schedule of cities across Pakistan." },
  { question: "Who publishes official prize bond draw results?", answer: "The National Savings organization, under the State Bank of Pakistan, conducts and publishes official prize bond draw results, which PKRates sources directly." },
];

export const cementFAQs = [
  { question: "What is the current cement price per bag?", answer: "Cement prices vary by brand and city — for example, Lucky Cement is around Rs 1,570 per 50kg bag in Lahore today. See the full brand-by-city breakdown above." },
  { question: "Why do cement prices vary between brands?", answer: "Manufacturing cost, transport distance, dealer margins, and brand positioning all contribute to price differences between cement brands in the same city." },
  { question: "How often do cement rates change?", answer: "Cement rates are checked with dealer networks daily to a few times a week — less frequently than gold or currency, since input costs move more gradually." },
  { question: "Are these cement prices wholesale or retail?", answer: "PKRates publishes retail dealer prices per bag, verified through city-wise dealer networks, reflecting what a typical buyer would pay." },
];

export const steelFAQs = [
  { question: "What is today's steel/saria rate in Pakistan?", answer: "Grade 60 saria is trading around Rs 268,400 per ton in Karachi today, with per-maund pricing also available for smaller-quantity buyers." },
  { question: "What's the difference between Grade 40 and Grade 60 steel?", answer: "Grade 60 has higher tensile strength than Grade 40 and is more commonly used in modern reinforced concrete construction, which is reflected in its typically higher price." },
  { question: "How is steel priced — per maund or per ton?", answer: "Steel/saria is quoted both per maund (traditional local unit) and per ton (40 maunds) — PKRates shows both so you can compare however your supplier quotes it." },
  { question: "How often do steel rates change?", answer: "Steel rates are checked with Steel Melters and Re-Rolling Mills Association contacts daily to a few times a week, reflecting raw material and demand shifts." },
];
