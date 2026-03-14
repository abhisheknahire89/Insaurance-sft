import { ICD10_DATABASE, getR69Fallback } from '../data/icd10MasterDatabase';

/**
 * Simple validation: Verify the code exists in our database
 * If not, return R69
 */
export function validateICDCode(code: string): {
  code: string;
  description: string;
  isValid: boolean;
  source: 'DATABASE' | 'FALLBACK';
} {
  // Check if code exists in database
  for (const condition of ICD10_DATABASE) {
    if (condition.icd_codes.primary.code === code) {
      return {
        code: condition.icd_codes.primary.code,
        description: condition.icd_codes.primary.description,
        isValid: true,
        source: 'DATABASE'
      };
    }
    
    for (const variant of condition.icd_codes.specific_variants) {
      if (variant.code === code) {
        return {
          code: variant.code,
          description: variant.description,
          isValid: true,
          source: 'DATABASE'
        };
      }
    }
  }
  
  // Code not found — return R69
  const fallback = getR69Fallback();
  console.warn(`[ICD Validation] Code ${code} not in database. Using R69 fallback.`);
  
  return {
    code: fallback.icd_codes.primary.code,
    description: fallback.icd_codes.primary.description,
    isValid: false,
    source: 'FALLBACK'
  };
}
