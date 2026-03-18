import { validateICDCode as newValidate } from './icdLookupService';

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
  const result = newValidate(code);
  return {
    code: result.code,
    description: result.description,
    isValid: result.tier !== 'FLOOR',
    source: result.tier !== 'FLOOR' ? 'DATABASE' : 'FALLBACK'
  };
}
