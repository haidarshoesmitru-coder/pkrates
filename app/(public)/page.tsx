import { HeroSection } from "@/components/home/hero-section";
import { SocialProofBar } from "@/components/home/social-proof-bar";
import { TickerStrip } from "@/components/home/ticker-strip";
import { MarketOverview } from "@/components/home/market-overview";
import { MarketSentimentSection } from "@/components/home/market-sentiment-section";
import { GoldSection } from "@/components/home/gold-section";
import { CurrencySection } from "@/components/home/currency-section";
import { PetrolSection } from "@/components/home/petrol-section";
import { PrizeBondSection } from "@/components/home/prize-bond-section";
import { MoversSection } from "@/components/home/movers-section";
import { CategoryGrid } from "@/components/home/category-grid";
import { TrustSection } from "@/components/home/trust-section";
import { NewsletterSection } from "@/components/home/newsletter-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SocialProofBar />
      <TickerStrip />
      <MarketOverview />
      <MarketSentimentSection />
      <GoldSection />
      <CurrencySection />
      <PetrolSection />
      <PrizeBondSection />
      <MoversSection />
      <CategoryGrid />
      <TrustSection />
      <NewsletterSection />
    </>
  );
}
