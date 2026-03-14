import { suggestICDCode, MatchResult } from './icdIntelligentLookup';

export interface GeminiICDResult {
  icd10Code: string;
  icd10Description: string;
  diagnosis: string;
}

export interface ValidatedICDResult {
  icdCode: string;
  icdDescription: string;
  source: 'GEMINI_CONFIRMED' | 'LOCAL_OVERRIDE' | 'FLOOR_FALLBACK';
  confidence: number;
  reasoning: string;
  matchResult: MatchResult;
}

export function validateAndFinalizeICD(
  geminiResult: GeminiICDResult,
  clinicalFindings: string = '',
  symptoms: string[] = []
): ValidatedICDResult {
  
  // Step 1: Run local matcher on the diagnosis text
  const localMatch = suggestICDCode(
    geminiResult.diagnosis,
    clinicalFindings,
    symptoms
  );
  
  // Step 2: Decision logic - LOCAL MATCHER IS THE FINAL ARBITER
  
  // CASE A: Local matcher says R69 (floor) → Gemini hallucinated or no safe match, use R69
  if (localMatch.isFloorCode) {
    console.warn(
      `[ICD Validation] Gemini suggested ${geminiResult.icd10Code || 'nothing'} but local matcher found no confident match. ` +
      `Overriding to R69. Diagnosis: "${geminiResult.diagnosis}"`
    );
    
    return {
      icdCode: 'R69',
      icdDescription: 'Illness, unspecified',
      source: 'FLOOR_FALLBACK',
      confidence: 0,
      reasoning: `Local matcher override to floor: ${localMatch.reasoning}`,
      matchResult: localMatch
    };
  }
  
  // CASE B: Local matcher found a different code with high confidence → Use local
  if (localMatch.icdCode !== geminiResult.icd10Code && localMatch.confidence >= 70) {
    console.warn(
      `[ICD Validation] Gemini suggested ${geminiResult.icd10Code || 'nothing'} but local matcher found ` +
      `${localMatch.icdCode} with ${localMatch.confidence}% confidence. Using local match.`
    );
    
    return {
      icdCode: localMatch.icdCode,
      icdDescription: localMatch.icdDescription,
      source: 'LOCAL_OVERRIDE',
      confidence: localMatch.confidence,
      reasoning: `Local matcher override: ${localMatch.reasoning}`,
      matchResult: localMatch
    };
  }
  
  // CASE C: Local matcher confirms Gemini's code → Use Gemini (validated)
  if (localMatch.icdCode === geminiResult.icd10Code) {
    return {
      icdCode: geminiResult.icd10Code,
      icdDescription: geminiResult.icd10Description || localMatch.icdDescription,
      source: 'GEMINI_CONFIRMED',
      confidence: localMatch.confidence,
      reasoning: `Gemini suggestion confirmed by local matcher (${localMatch.confidence}% confidence)`,
      matchResult: localMatch
    };
  }
  
  // CASE D: Local matcher found something but low confidence, and different from Gemini
  // Conservative approach: Use R69 rather than guess
  console.warn(
    `[ICD Validation] Ambiguous result. Gemini: ${geminiResult.icd10Code}, ` +
    `Local: ${localMatch.icdCode} (${localMatch.confidence}%). Using R69 for safety.`
  );
  
  return {
    icdCode: 'R69',
    icdDescription: 'Illness, unspecified',
    source: 'FLOOR_FALLBACK',
    confidence: 0,
    reasoning: `Ambiguous match between Gemini (${geminiResult.icd10Code}) and local matcher ` +
               `(${localMatch.icdCode} at ${localMatch.confidence}%). Using R69 for safety.`,
    matchResult: localMatch
  };
}
