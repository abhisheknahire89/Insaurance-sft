import { ICD10_TIER1, getAllTier1SearchTerms, getTier1ConditionByCode } from '../data/icd10Tier1Enriched';
import { ICD10_TIER2, searchTier2 } from '../data/icd10Tier2Extended';
import { ICD10_TIER3 } from '../data/icd10Tier3Full';
import { ICDLookupResult, Tier1Condition } from '../types/icd.types';
import { extractDiagnosis } from './diagnosisExtractor';

/**
 * 3-Tier ICD-10 Lookup Service
 * Searches all tiers in order, returns best match
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const R69_FALLBACK: ICDLookupResult = {
  code: "R69",
  description: "Illness, unspecified",
  tier: 'FLOOR',
  confidence: 0,
  has_full_metadata: false,
  reasoning: "No confident match found in any tier. Using R69 as safe fallback."
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function normalize(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isGarbageInput(text: string): boolean {
  if (!text || text.trim().length < 2) return true;
  
  const garbagePatterns = [
    /^test\s*(case|data|patient)?$/i,
    /^xyz/i,
    /^abc\d*$/i,
    /^sample/i,
    /^dummy/i,
    /^patient\s*\d/i,
    /^case\s*\d/i,
    /^demo/i,
    /^n\/?a$/i,
    /^null$/i,
    /^none$/i,
    /^\d+$/
  ];
  
  return garbagePatterns.some(p => p.test(text.trim()));
}

function isRareGeneticCondition(diagnosis: string): boolean {
  const rarePatterns = [
    /syndrome\s+type\s+\d/i,
    /variant\s+(syndrome|type)/i,
    /pigmentosum/i,
    /congenital\s+\w+\s+deficiency/i,
    /hereditary\s+\w+\s+syndrome/i,
    /familial\s+\w+\s+disorder/i,
    /orphan\s+disease/i,
    /rare\s+(genetic|disease|condition)/i,
    /inborn\s+error/i,
    /chromosom(e|al)\s+\d/i,
    /mitochondrial\s+\w+\s+(disorder|cytopathy|myopathy)/i,
    /autosomal\s+(dominant|recessive)/i,
    /x-linked/i
  ];
  
  return rarePatterns.some(p => p.test(diagnosis));
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalize(str1);
  const s2 = normalize(str2);
  
  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;
  
  // Simple word overlap similarity
  const words1 = s1.split(/\s+/).filter(w => w.length >= 3);
  const words2 = s2.split(/\s+/).filter(w => w.length >= 3);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  let matches = 0;
  for (const w1 of words1) {
    if (words2.some(w2 => w1.includes(w2) || w2.includes(w1))) {
      matches++;
    }
  }
  
  return Math.round((matches / Math.max(words1.length, words2.length)) * 100);
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER SEARCH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function searchTier1(diagnosis: string, clinicalFindings: string = ''): { condition: Tier1Condition; confidence: number } | null {
  const normalizedDiagnosis = normalize(diagnosis);
  const normalizedFindings = normalize(clinicalFindings);
  const searchText = `${normalizedDiagnosis} ${normalizedFindings}`.trim();
  
  let bestMatch: { condition: Tier1Condition; confidence: number } | null = null;
  
  for (const condition of ICD10_TIER1) {
    // Skip the R69 fallback entry
    if (condition.id === "FLOOR-001") continue;
    
    const allTerms = getAllTier1SearchTerms(condition);
    
    // Exact match
    for (const term of allTerms) {
      if (normalizedDiagnosis === term) {
        if (!bestMatch || 98 > bestMatch.confidence) {
          bestMatch = { condition, confidence: 98 };
        }
      } else if (normalizedDiagnosis.includes(term) && term.length >= 8) {
        if (!bestMatch || 85 > bestMatch.confidence) {
          bestMatch = { condition, confidence: 85 };
        }
      } else if (term.includes(normalizedDiagnosis) && normalizedDiagnosis.length >= 8) {
        if (!bestMatch || 80 > bestMatch.confidence) {
          bestMatch = { condition, confidence: 80 };
        }
      }
    }
    
    // Fuzzy match if no exact match found
    if (!bestMatch) {
      for (const term of allTerms) {
        const similarity = calculateSimilarity(searchText, term);
        if (similarity >= 75) {
          if (!bestMatch || similarity > bestMatch.confidence) {
            bestMatch = { condition, confidence: similarity };
          }
        }
      }
    }
  }
  
  return bestMatch && bestMatch.confidence >= 70 ? bestMatch : null;
}

function searchTier2Conditions(diagnosis: string): { code: string; description: string; confidence: number } | null {
  const normalizedDiagnosis = normalize(diagnosis);
  
  for (const condition of ICD10_TIER2) {
    for (const term of condition.match_terms) {
      const normalizedTerm = normalize(term);
      
      if (normalizedDiagnosis === normalizedTerm) {
        return {
          code: condition.code,
          description: condition.description,
          confidence: 95
        };
      } else if (normalizedDiagnosis.includes(normalizedTerm) && normalizedTerm.length >= 8) {
        return {
          code: condition.code,
          description: condition.description,
          confidence: 85
        };
      } else if (normalizedTerm.includes(normalizedDiagnosis) && normalizedDiagnosis.length >= 8) {
        return {
          code: condition.code,
          description: condition.description,
          confidence: 80
        };
      }
    }
  }
  
  // Fuzzy match
  for (const condition of ICD10_TIER2) {
    for (const term of condition.match_terms) {
      const similarity = calculateSimilarity(diagnosis, term);
      if (similarity >= 80) {
        return {
          code: condition.code,
          description: condition.description,
          confidence: similarity
        };
      }
    }
  }
  
  return null;
}

function searchTier3Conditions(diagnosis: string): { code: string; description: string; confidence: number } | null {
  const normalizedDiagnosis = normalize(diagnosis);
  const diagnosisWords = normalizedDiagnosis.split(/\s+/).filter(w => w.length >= 4);
  
  let bestMatch: { code: string; description: string; score: number } | null = null;
  
  for (const entry of ICD10_TIER3) {
    const descLower = normalize(entry.description);
    
    // Word overlap matching
    const matchedWords = diagnosisWords.filter(word => descLower.includes(word));
    
    if (matchedWords.length >= 2) {
      const score = (matchedWords.length / diagnosisWords.length) * 100;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { code: entry.code, description: entry.description, score };
      }
    }
  }
  
  return bestMatch && bestMatch.score >= 75 
    ? { code: bestMatch.code, description: bestMatch.description, confidence: bestMatch.score }
    : null;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LOOKUP FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export function lookupICD(
  diagnosis: string,
  clinicalFindings: string = '',
  symptoms: string[] = []
): ICDLookupResult {
  
  const normalizedDiagnosis = normalize(diagnosis);
  
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 0: Garbage Detection
  // ─────────────────────────────────────────────────────────────────────────
  
  if (isGarbageInput(normalizedDiagnosis)) {
    return {
      ...R69_FALLBACK,
      reasoning: `Invalid or empty diagnosis input: "${diagnosis}"`
    };
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 0.5: Rare Genetic Condition Detection
  // ─────────────────────────────────────────────────────────────────────────
  
  if (isRareGeneticCondition(diagnosis)) {
    return {
      ...R69_FALLBACK,
      reasoning: `Detected rare/genetic condition pattern in "${diagnosis}". Using R69 as safe fallback. Doctor should assign specific ICD code.`
    };
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: Search Tier 1 (Enriched Database)
  // ─────────────────────────────────────────────────────────────────────────
  
  const tier1Match = searchTier1(diagnosis, clinicalFindings);
  
  if (tier1Match) {
    return {
      code: tier1Match.condition.icd_codes.primary.code,
      description: tier1Match.condition.icd_codes.primary.description,
      tier: 1,
      confidence: tier1Match.confidence,
      has_full_metadata: true,
      condition_data: tier1Match.condition,
      reasoning: `Tier 1 match: "${diagnosis}" matched "${tier1Match.condition.condition_name}" with ${tier1Match.confidence}% confidence`
    };
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: Search Tier 2 (Extended Database)
  // ─────────────────────────────────────────────────────────────────────────
  
  const tier2Match = searchTier2Conditions(diagnosis);
  
  if (tier2Match) {
    return {
      code: tier2Match.code,
      description: tier2Match.description,
      tier: 2,
      confidence: tier2Match.confidence,
      has_full_metadata: false,
      reasoning: `Tier 2 match: "${diagnosis}" matched "${tier2Match.description}" with ${tier2Match.confidence}% confidence`
    };
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3: Search Tier 3 (Full ICD-10 Reference)
  // ─────────────────────────────────────────────────────────────────────────
  
  const tier3Match = searchTier3Conditions(diagnosis);
  
  if (tier3Match) {
    return {
      code: tier3Match.code,
      description: tier3Match.description,
      tier: 3,
      confidence: tier3Match.confidence,
      has_full_metadata: false,
      reasoning: `Tier 3 match: "${diagnosis}" matched "${tier3Match.description}" with ${tier3Match.confidence}% confidence`
    };
  }
  
  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4: R69 Floor (True Unknown)
  // ─────────────────────────────────────────────────────────────────────────
  
  return {
    ...R69_FALLBACK,
    reasoning: `No confident match found in any tier for "${diagnosis}". This may be a rare condition or requires specialist coding.`
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTION (For post-Gemini check)
// ═══════════════════════════════════════════════════════════════════════════

export function validateICDCode(code: string): ICDLookupResult {
  if (!code) {
    return {
      ...R69_FALLBACK,
      reasoning: "Empty code provided. Using R69 fallback."
    };
  }
  
  const normalizedCode = code.toUpperCase().trim();

  // Specific Check for Cardiac Codes
  const CARDIAC_CODES = ['I21', 'I22', 'I23', 'I24', 'I25'];
  const isCardiacCode = CARDIAC_CODES.some(prefix => normalizedCode.startsWith(prefix));
  
  if (isCardiacCode) {
    // Map to specific STEMI/NSTEMI codes
    if (normalizedCode.startsWith('I21.0')) return { code: 'I21.0', description: 'STEMI of anterior wall', tier: 1, confidence: 100, has_full_metadata: false, reasoning: 'Direct cardiac mapping' };
    if (normalizedCode.startsWith('I21.1')) return { code: 'I21.1', description: 'STEMI of inferior wall', tier: 1, confidence: 100, has_full_metadata: false, reasoning: 'Direct cardiac mapping' };
    if (normalizedCode.startsWith('I21.2')) return { code: 'I21.2', description: 'STEMI of other sites', tier: 1, confidence: 100, has_full_metadata: false, reasoning: 'Direct cardiac mapping' };
    if (normalizedCode.startsWith('I21.3')) return { code: 'I21.3', description: 'STEMI, unspecified site', tier: 1, confidence: 100, has_full_metadata: false, reasoning: 'Direct cardiac mapping' };
    if (normalizedCode.startsWith('I21.4')) return { code: 'I21.4', description: 'NSTEMI', tier: 1, confidence: 100, has_full_metadata: false, reasoning: 'Direct cardiac mapping' };
    if (normalizedCode.startsWith('I21.9')) return { code: 'I21.9', description: 'AMI, unspecified', tier: 1, confidence: 100, has_full_metadata: false, reasoning: 'Direct cardiac mapping' };
    // Default cardiac
    return { code: 'I21.9', description: 'Acute myocardial infarction, unspecified', tier: 1, confidence: 100, has_full_metadata: false, reasoning: 'Direct cardiac mapping' };
  }

  // Check Tier 1
  const tier1Match = ICD10_TIER1.find(c => 
    c.icd_codes.primary.code === normalizedCode ||
    c.icd_codes.primary.code.startsWith(normalizedCode) ||
    normalizedCode.startsWith(c.icd_codes.primary.code.split('.')[0])
  );

  if (tier1Match) {
    return {
      code: tier1Match.icd_codes.primary.code,
      description: tier1Match.condition_name,
      tier: 1,
      confidence: 100,
      has_full_metadata: true,
      condition_data: tier1Match,
      reasoning: "Code validated in Tier 1 database"
    };
  }
  
  // Check Tier 2
  const tier2Match = ICD10_TIER2.find(c => c.code === normalizedCode);
  if (tier2Match) {
    return {
      code: tier2Match.code,
      description: tier2Match.description,
      tier: 2,
      confidence: 100,
      has_full_metadata: false,
      reasoning: "Code validated in Tier 2 database"
    };
  }
  
  // Check Tier 3
  const tier3Match = ICD10_TIER3.find(c => c.code === normalizedCode);
  if (tier3Match) {
    return {
      code: tier3Match.code,
      description: tier3Match.description,
      tier: 3,
      confidence: 100,
      has_full_metadata: false,
      reasoning: "Code validated in Tier 3 database"
    };
  }
  
  // Not found - return R69
  return {
    ...R69_FALLBACK,
    reasoning: `Code "${code}" not found in any database tier. Using R69 fallback.`
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// NEW: PREPROCESSING WRAPPER
// ═══════════════════════════════════════════════════════════════════════════

export async function lookupICDWithPreprocessing(
  clinicalText: string,
  skipPreprocessing: boolean = false
): Promise<ICDLookupResult> {
  
  // If input is already a clean term (< 6 words), skip preprocessing
  const wordCount = clinicalText.trim().split(/\s+/).length;
  
  if (skipPreprocessing || wordCount <= 5) {
    return lookupICD(clinicalText);
  }
  
  // Complex input: use Gemini to extract diagnosis first
  const extracted = await extractDiagnosis(clinicalText);
  
  console.log(`[ICD Lookup] Extracted "${extracted.primaryDiagnosis}" from "${clinicalText.substring(0, 50)}..."`);
  
  const result = lookupICD(extracted.primaryDiagnosis);
  
  // Enhance result with extraction metadata
  return {
    ...result,
    reasoning: `Extracted "${extracted.primaryDiagnosis}" (${Math.round(extracted.confidence * 100)}% confidence) from complex input. ${result.reasoning}`
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { normalize, isGarbageInput, isRareGeneticCondition, calculateSimilarity };
