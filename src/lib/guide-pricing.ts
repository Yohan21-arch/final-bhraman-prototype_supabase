import { OFFICIAL_ASI_RATES } from "@/data/tour-guides";
import type { PriceRatingTier } from "@/types";

export interface EstimateOptions {
  groupSize: number; // 1 to 40
  duration: "halfDay" | "fullDay";
  foreignLanguage: boolean;
  metroConveyance: boolean;
  outstation: boolean;
}

export interface EstimateResult {
  baseFee: number;
  languageFee: number;
  metroConveyanceFee: number;
  outstationFee: number;
  totalOfficialFee: number;
  tipRange: [number, number];
  totalWithTipEstimated: [number, number];
  perPersonCost: number;
  priceRatingTier: PriceRatingTier;
  tierLabel: string;
  notes: string[];
}

export function calculateGuideFee(options: EstimateOptions): EstimateResult {
  const { groupSize, duration, foreignLanguage, metroConveyance, outstation } = options;

  let baseFee = 2050;
  let tierLabel = "1 - 5 Persons";

  if (groupSize <= 5) {
    baseFee = duration === "halfDay" ? 2050 : 2500;
    tierLabel = "Small Group (1-5 Persons)";
  } else if (groupSize <= 14) {
    baseFee = duration === "halfDay" ? 2500 : 3250;
    tierLabel = "Medium Group (6-14 Persons)";
  } else {
    baseFee = duration === "halfDay" ? 3350 : 4350;
    tierLabel = "Large Group (15-40 Persons)";
  }

  const languageFee = foreignLanguage
    ? duration === "halfDay"
      ? OFFICIAL_ASI_RATES.allowances.foreignLanguageHalfDay
      : OFFICIAL_ASI_RATES.allowances.foreignLanguageFullDay
    : 0;

  const metroConveyanceFee = metroConveyance ? OFFICIAL_ASI_RATES.allowances.metroConveyanceEarlyLate : 0;
  const outstationFee = outstation ? OFFICIAL_ASI_RATES.allowances.outstationExcursionPerDay : 0;

  const totalOfficialFee = baseFee + languageFee + metroConveyanceFee + outstationFee;

  // Customary 10% - 15% tipping or standard ₹500 - ₹1000
  const tipMin = Math.max(500, Math.round((totalOfficialFee * 0.1) / 50) * 50);
  const tipMax = Math.max(1000, Math.round((totalOfficialFee * 0.18) / 50) * 50);

  const perPerson = Math.round(totalOfficialFee / Math.max(1, groupSize));

  let priceRatingTier: PriceRatingTier = "$$";
  if (totalOfficialFee < 2000) priceRatingTier = "$";
  else if (totalOfficialFee <= 3500) priceRatingTier = "$$";
  else if (totalOfficialFee <= 6000) priceRatingTier = "$$$";
  else priceRatingTier = "$$$$";

  const notes: string[] = [
    `Official Tariff governed by TGFI & IATO Accord (2023-2025).`,
    `Valid for Ministry of Tourism & ASI approved licensed guides.`,
    `Excludes monument entrance tickets and monument camera fees.`,
  ];

  if (foreignLanguage) {
    notes.push(`Includes official foreign language allowance for certified foreign language guides.`);
  }

  return {
    baseFee,
    languageFee,
    metroConveyanceFee,
    outstationFee,
    totalOfficialFee,
    tipRange: [tipMin, tipMax],
    totalWithTipEstimated: [totalOfficialFee + tipMin, totalOfficialFee + tipMax],
    perPersonCost: perPerson,
    priceRatingTier,
    tierLabel,
    notes,
  };
}
