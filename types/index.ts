export type TrendDirection = "up" | "down" | "flat";

export interface RatePoint {
  label: string;
  value: number;
}

export interface GoldCityRate {
  city: string;
  karat24: number;
  karat22: number;
  karat21: number;
  karat18: number;
  changeAmount: number;
  changePercent: number;
  trend: TrendDirection;
  sparkline: number[];
}

export interface CurrencyRate {
  code: string;
  name: string;
  flag: string;
  interbankBuy: number;
  interbankSell: number;
  openBuy: number;
  openSell: number;
  changePercent: number;
  trend: TrendDirection;
}

export interface FuelPrice {
  type: string;
  pricePerLiter: number;
  changeAmount: number;
  changePercent: number;
  trend: TrendDirection;
  effectiveFrom: string;
  nextReviewEstimate: string;
}

export interface PrizeBondDraw {
  denomination: string;
  drawNumber: number;
  city: string;
  date: string;
  status: "upcoming" | "completed";
  firstPrize?: string;
}

export interface Mover {
  category: "Gold" | "Currency" | "Crypto" | "Cement" | "Steel";
  label: string;
  sublabel: string;
  changePercent: number;
  changeAmount: string;
  trend: TrendDirection;
}

export interface CategoryCard {
  slug: string;
  title: string;
  description: string;
  headlineValue: string;
  headlineLabel: string;
  trend: TrendDirection;
  icon: string;
}
