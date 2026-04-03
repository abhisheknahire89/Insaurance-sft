import { InsuranceCase, CostResult, tracked } from '../types/InsuranceCase';

/**
 * Calculates a cost estimate and handles length of stay logically based on room assignment.
 */
export async function computeCost(
  insuranceCase: InsuranceCase
): Promise<CostResult | null> {
  const roomCat = insuranceCase.admission.roomCategory?.value;
  const icdTier = insuranceCase.computed?.icd?.tier?.value;

  // Base parameters
  let wardDays = 0;
  let icuDays = 0;
  let totalDays = 3; 
  let totalEstimate = 50000;

  if (roomCat === 'ICU') {
    icuDays = 3;
    wardDays = 2; // Step down ward stay
    totalDays = 5;
    totalEstimate = 250000;
  } else {
    wardDays = 3;
    totalDays = 3;
  }

  // Adjust by tier if ICD mapped
  if (icdTier === 1) {
    totalEstimate += 150000; // E.g., for PCI/STEMI
  }

  // Generate breakdown
  const breakdown = {
    roomRent: tracked(wardDays * 5000, 'computed'),
    nursingCharges: tracked(totalDays * 1500, 'computed'),
    icuCharges: tracked(icuDays * 15000, 'computed'),
    otCharges: tracked(totalEstimate * 0.3, 'computed'),
    surgeonFee: tracked(totalEstimate * 0.2, 'computed'),
    anesthetistFee: tracked(totalEstimate * 0.05, 'computed'),
    consultantFee: tracked(totalDays * 1500, 'computed'),
    investigations: tracked(15000, 'computed'),
    medicines: tracked(25000, 'computed'),
    consumables: tracked(5000, 'computed'),
    implants: tracked(icdTier === 1 ? 100000 : 0, 'computed'), // E.g. Stent
    miscellaneous: tracked(2000, 'computed'),
  };

  return {
    totalEstimate: tracked(totalEstimate, 'computed'),
    claimedAmount: tracked(totalEstimate, 'computed'),
    breakdown,
    los: {
      totalDays: tracked(totalDays, 'computed'),
      wardDays: tracked(wardDays, 'computed'),
      icuDays: tracked(icuDays, 'computed'),
    }
  };
}
