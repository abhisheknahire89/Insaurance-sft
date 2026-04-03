import { InsuranceCase, SeverityResult, tracked } from '../types/InsuranceCase';

/**
 * Calculates severity based on vitals and diagnosis.
 */
export async function computeSeverity(
  insuranceCase: InsuranceCase
): Promise<SeverityResult | null> {
  const vitals = insuranceCase.clinical.vitals;
  const sysBP = vitals.systolic?.value;
  const spo2 = vitals.spo2?.value;
  
  // Basic scoring logic prioritizing parsed vital integers
  let score = 0;
  let level: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
  const redFlags: string[] = [];
  
  if (sysBP && sysBP < 90) {
    score += 3;
    redFlags.push('Hypotension (SysBP < 90)');
  }
  
  if (spo2 && spo2 < 93) {
    score += 3;
    redFlags.push('Hypoxia (SpO2 < 93%)');
  }
  
  if (score >= 5) level = 'Critical';
  else if (score >= 3) level = 'High';
  else if (score >= 1) level = 'Moderate';

  // Manual override if ICU is requested in admission
  const roomCat = insuranceCase.admission.roomCategory?.value;
  if (roomCat === 'ICU' && level === 'Low') {
    level = 'High';
  }

  return {
    overallLevel: tracked(level, 'computed'),
    overallScore: tracked(score, 'computed'),
    phenoIntensity: tracked(score, 'computed'),
    urgencyQuotient: tracked(score, 'computed'),
    deteriorationVelocity: tracked(0, 'computed'),
    icuRequired: tracked(level === 'Critical' || level === 'High', 'computed'),
    redFlags: tracked(redFlags, 'computed')
  };
}
