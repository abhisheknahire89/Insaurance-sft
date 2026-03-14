/**
 * ICD-10 Intelligent Lookup Service
 * 7-Layer matching with strict confidence thresholds
 * Unknown/rare conditions MUST return R69
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ICDEntry {
  icdCode: string;
  icdDescription: string;
  specialty?: string;
  category?: string;
  isEmergency?: boolean;
  exactMatches?: string[];
  synonyms?: string[];
  hindiTerms?: string[];
  commonMisspellings?: string[];
  keywords?: string[];
  abbreviations?: string[];
  typicalSymptoms?: string[];
  relatedFindings?: string[];
  notToBeConfusedWith?: string[];
  admissionCriteria?: string[];
  typicalLOS?: { ward: number; icu: number };
  tpaQueryTriggers?: string[];
  pmjayEligible?: boolean;
}

export type MatchLayer = 
  | 'EXACT'
  | 'SYNONYM'
  | 'HINDI'
  | 'MISSPELLING'
  | 'KEYWORD'
  | 'FUZZY'
  | 'SYMPTOM_CLUSTER'
  | 'FLOOR';

export interface MatchResult {
  icdCode: string;
  icdDescription: string;
  confidence: number;
  matchLayer: MatchLayer;
  matchedOn: string;
  isFloorCode: boolean;
  reasoning: string;
  alternativeCodes?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS & DATABASE
// ═══════════════════════════════════════════════════════════════════════════

const ICD_FLOOR_CODE = 'R69';
const ICD_FLOOR_DESCRIPTION = 'Illness, unspecified';

// STRICT THRESHOLDS — These prevent false positives
const THRESHOLDS = {
  EXACT_MATCH: 98,           // Must be exact
  SYNONYM_MATCH: 88,         // Known synonyms only
  HINDI_MATCH: 82,           // Hindi/Hinglish terms
  MISSPELLING_MATCH: 80,     // Known misspellings only
  KEYWORD_MIN_MATCHES: 3,    // Must match at least 3 keywords
  KEYWORD_CONFIDENCE: 72,    // Keyword match confidence
  FUZZY_SIMILARITY: 85,      // STRICT: Must be 85%+ similar (was too loose before)
  SYMPTOM_CLUSTER_MIN: 4,    // Must match at least 4 symptoms
  ACCEPTANCE_THRESHOLD: 70,  // Below this = R69
};

export const ENRICHED_ICD_DB: ICDEntry[] = [
  {
    icdCode: "K35.80",
    icdDescription: "Acute appendicitis, unspecified",
    specialty: "General Surgery",
    category: "Digestive System",
    isEmergency: true,
    exactMatches: ["acute appendicitis", "appendicitis acute", "acute appendicitis unspecified"],
    synonyms: ["inflamed appendix", "appendix infection", "appendiceal inflammation"],
    hindiTerms: ["appendix mein sujan", "appendix ki bimari", "pet ke right side mein dard appendix", "अपेंडिक्स में सूजन"],
    commonMisspellings: ["appendisitis", "apendisitis", "appendecitis", "apendicitis"],
    keywords: ["appendix", "rif pain", "right iliac fossa", "mcburney", "rebound tenderness", "appendicectomy"],
    abbreviations: ["acute app", "app"],
    typicalSymptoms: ["right lower abdominal pain", "fever", "vomiting", "nausea"],
    relatedFindings: ["mcburney point tenderness", "rebound tenderness", "wbc elevated"],
    notToBeConfusedWith: ["appendicular mass", "appendicular abscess", "chronic appendicitis"],
    admissionCriteria: ["Alvarado >=7", "USG confirmed", "peritonitis signs"],
    typicalLOS: { ward: 3, icu: 0 },
    tpaQueryTriggers: ["USG report missing", "WBC count missing"],
    pmjayEligible: true,
  },
  {
    icdCode: "I21.9",
    icdDescription: "Acute myocardial infarction, unspecified",
    specialty: "Cardiology",
    category: "Cardiovascular",
    isEmergency: true,
    exactMatches: ["acute myocardial infarction", "myocardial infarction", "ami"],
    synonyms: ["heart attack", "cardiac infarction", "coronary thrombosis"],
    hindiTerms: ["dil ka daura", "heart fail hona", "seene mein dard"],
    commonMisspellings: ["heartattack", "mi"],
    keywords: ["heart attack", "stemi", "nstemi", "chest pain", "trop t", "troponin", "ecg st elevation"],
    abbreviations: ["mi", "ami", "stemi", "nstemi"],
    typicalSymptoms: ["chest pain", "sweating", "dizziness", "shortness of breath", "left arm pain"],
    relatedFindings: ["st elevation", "t wave inversion", "elevated troponin"],
    notToBeConfusedWith: ["angina pectoris", "chest wall pain", "gerd"],
    admissionCriteria: ["ECG changes", "Elevated cardiac enzymes", "Severe angina"],
    typicalLOS: { ward: 3, icu: 2 },
    tpaQueryTriggers: ["ECG report missing", "Cardiac markers missing"],
    pmjayEligible: true,
  },
  {
    icdCode: "A90",
    icdDescription: "Dengue fever [classical dengue]",
    specialty: "General Medicine",
    category: "Infectious Disease",
    isEmergency: true,
    exactMatches: ["dengue fever", "classical dengue", "dengue"],
    synonyms: ["breakbone fever"],
    hindiTerms: ["dengu bukhar", "haddi tod bukhar"],
    commonMisspellings: ["dengu", "dengue fever"],
    keywords: ["dengue", "dengue ns1", "platelets", "thrombocytopenia"],
    abbreviations: ["df", "dhf"],
    typicalSymptoms: ["high grade fever", "retro-orbital pain", "severe myalgia", "bone pain", "rash"],
    relatedFindings: ["thrombocytopenia", "leukopenia", "elevated liver enzymes"],
    notToBeConfusedWith: ["malaria", "typhoid", "chikungunya"],
    admissionCriteria: ["Platelet count < 50,000", "Bleeding manifestations"],
    typicalLOS: { ward: 5, icu: 0 },
    tpaQueryTriggers: ["NS1/IgM missing", "Serial CBC reports missing"],
    pmjayEligible: true,
  }
];

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

function floorResult(reasoning: string): MatchResult {
  return {
    icdCode: ICD_FLOOR_CODE,
    icdDescription: ICD_FLOOR_DESCRIPTION,
    confidence: 0,
    matchLayer: 'FLOOR',
    matchedOn: '',
    isFloorCode: true,
    reasoning
  };
}

function isInvalidInput(text: string): boolean {
  if (!text || text.trim().length < 2) return true;
  
  // Test data patterns — return R69 immediately
  const testPatterns = [
    /^test\s*(case|data|patient)?/i,
    /^xyz/i,
    /^abc\d*$/i,
    /^sample/i,
    /^dummy/i,
    /^patient\s*\d/i,
    /^case\s*\d/i,
    /^demo/i,
    /^fake/i,
    /^null$/i,
    /^n\/?a$/i,
    /^none$/i,
    /^unknown$/i,
    /^\d+$/,  // Just numbers
  ];
  
  if (testPatterns.some(p => p.test(text.trim()))) return true;
  
  return false;
}

/**
 * Levenshtein distance calculation
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  if (m === 0) return n;
  if (n === 0) return m;
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  
  return dp[m][n];
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalize(str1);
  const s2 = normalize(str2);
  
  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;
  
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 100;
  
  const distance = levenshteinDistance(s1, s2);
  return Math.round((1 - distance / maxLen) * 100);
}

/**
 * Check if diagnosis contains words that indicate it's rare/unknown
 * These should trigger immediate R69
 */
function isLikelyRareOrUnknown(diagnosis: string): boolean {
  const rareIndicators = [
    /syndrome\s+type\s+\d/i,           // "syndrome type 3B"
    /variant\s+(syndrome|type)/i,       // "variant syndrome"
    /pigmentosum/i,                     // Xeroderma pigmentosum
    /congenital\s+\w+\s+deficiency/i,   // Congenital X deficiency
    /hereditary\s+\w+\s+syndrome/i,     // Hereditary X syndrome
    /familial\s+\w+\s+disorder/i,       // Familial X disorder
    /orphan\s+disease/i,
    /rare\s+(genetic|disease|condition|disorder)/i,
    /inborn\s+error/i,
    /chromosom(e|al)\s+\d/i,            // Chromosome 21, etc.
    /mutation/i,
    /autosomal\s+(dominant|recessive)/i,
    /x-linked/i,
    /mitochondrial\s+\w+\s+disorder/i,
  ];
  
  return rareIndicators.some(pattern => pattern.test(diagnosis));
}

/**
 * Check if any "notToBeConfusedWith" entries match
 */
function isConfusionRisk(diagnosis: string, entry: ICDEntry): boolean {
  if (!entry.notToBeConfusedWith || entry.notToBeConfusedWith.length === 0) {
    return false;
  }
  
  const normalizedDiagnosis = normalize(diagnosis);
  
  return entry.notToBeConfusedWith.some(confusedTerm => {
    const normalizedConfused = normalize(confusedTerm);
    return normalizedDiagnosis.includes(normalizedConfused) ||
           calculateSimilarity(normalizedDiagnosis, normalizedConfused) >= 80;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN MATCHING FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export function suggestICDCode(
  diagnosisText: string,
  clinicalFindings: string = '',
  symptoms: string[] = [],
  icdDatabase: ICDEntry[] = ENRICHED_ICD_DB
): MatchResult {
  
  const database = icdDatabase.length > 0 ? icdDatabase : ENRICHED_ICD_DB;
  
  const normalizedDiagnosis = normalize(diagnosisText);
  
  // ═══════════════════════════════════════════════════════════════════════
  // LAYER 0: Input Validation — Garbage/Empty/Test Data → R69
  // ═══════════════════════════════════════════════════════════════════════
  
  if (isInvalidInput(normalizedDiagnosis)) {
    return floorResult(`Invalid or empty diagnosis input: "${diagnosisText}"`);
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // LAYER 0.5: Rare Disease Detection — Immediate R69
  // This is CRITICAL to prevent false matches on rare genetic conditions
  // ═══════════════════════════════════════════════════════════════════════
  
  if (isLikelyRareOrUnknown(diagnosisText)) {
    return floorResult(
      `Detected rare/genetic condition pattern in "${diagnosisText}". ` +
      `Using R69 (Illness, unspecified) as safe fallback. ` +
      `Doctor should assign specific ICD code for rare conditions.`
    );
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // LAYER 1: Exact Match (98% confidence)
  // Only matches if diagnosis text EXACTLY equals a known term
  // ═══════════════════════════════════════════════════════════════════════
  
  for (const entry of database) {
    const exactMatches = entry.exactMatches || [entry.icdDescription];
    
    for (const exact of exactMatches) {
      if (normalize(exact) === normalizedDiagnosis) {
        return {
          icdCode: entry.icdCode,
          icdDescription: entry.icdDescription,
          confidence: THRESHOLDS.EXACT_MATCH,
          matchLayer: 'EXACT',
          matchedOn: exact,
          isFloorCode: false,
          reasoning: `Exact match: "${diagnosisText}" = "${exact}"`
        };
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // LAYER 2: Synonym Match (88% confidence)
  // Must be a pre-defined synonym, not fuzzy
  // ═══════════════════════════════════════════════════════════════════════
  
  for (const entry of database) {
    if (!entry.synonyms || entry.synonyms.length === 0) continue;
    
    // Skip if this could be a confusion risk
    if (isConfusionRisk(diagnosisText, entry)) continue;
    
    for (const synonym of entry.synonyms) {
      const normalizedSynonym = normalize(synonym);
      
      // Must be exact match to synonym, or diagnosis contains full synonym
      if (normalizedDiagnosis === normalizedSynonym ||
          (normalizedSynonym.length >= 5 && normalizedDiagnosis.includes(normalizedSynonym))) {
        return {
          icdCode: entry.icdCode,
          icdDescription: entry.icdDescription,
          confidence: THRESHOLDS.SYNONYM_MATCH,
          matchLayer: 'SYNONYM',
          matchedOn: synonym,
          isFloorCode: false,
          reasoning: `Synonym match: "${diagnosisText}" matches synonym "${synonym}" for ${entry.icdDescription}`
        };
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // LAYER 3: Hindi/Hinglish Match (82% confidence)
  // ═══════════════════════════════════════════════════════════════════════
  
  for (const entry of database) {
    if (!entry.hindiTerms || entry.hindiTerms.length === 0) continue;
    
    for (const hindiTerm of entry.hindiTerms) {
      const normalizedHindi = normalize(hindiTerm);
      
      if (normalizedDiagnosis === normalizedHindi ||
          (normalizedHindi.length >= 5 && normalizedDiagnosis.includes(normalizedHindi))) {
        return {
          icdCode: entry.icdCode,
          icdDescription: entry.icdDescription,
          confidence: THRESHOLDS.HINDI_MATCH,
          matchLayer: 'HINDI',
          matchedOn: hindiTerm,
          isFloorCode: false,
          reasoning: `Hindi term match: "${diagnosisText}" matches "${hindiTerm}" for ${entry.icdDescription}`
        };
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // LAYER 4: Known Misspelling Match (80% confidence)
  // Only pre-defined common misspellings
  // ═══════════════════════════════════════════════════════════════════════
  
  for (const entry of database) {
    if (!entry.commonMisspellings || entry.commonMisspellings.length === 0) continue;
    
    for (const misspelling of entry.commonMisspellings) {
      if (normalize(misspelling) === normalizedDiagnosis) {
        return {
          icdCode: entry.icdCode,
          icdDescription: entry.icdDescription,
          confidence: THRESHOLDS.MISSPELLING_MATCH,
          matchLayer: 'MISSPELLING',
          matchedOn: misspelling,
          isFloorCode: false,
          reasoning: `Misspelling match: "${diagnosisText}" is known misspelling of ${entry.icdDescription}`
        };
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // LAYER 5: Keyword Match (72% confidence)
  // STRICT: Must match at least 3 specific keywords
  // ═══════════════════════════════════════════════════════════════════════
  
  const keywordResults: Array<{entry: ICDEntry; matchCount: number; matchedKeywords: string[]}> = [];
  const diagnosisWords = normalizedDiagnosis.split(/\s+/).filter(w => w.length >= 3);
  
  for (const entry of database) {
    if (!entry.keywords || entry.keywords.length === 0) continue;
    if (isConfusionRisk(diagnosisText, entry)) continue;
    
    const matchedKeywords: string[] = [];
    
    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalize(keyword);
      
      // Keyword must be at least 4 characters to count
      if (normalizedKeyword.length < 4) continue;
      
      // Check if any diagnosis word matches this keyword
      const hasMatch = diagnosisWords.some(word => 
        word === normalizedKeyword || 
        (word.length >= 5 && normalizedKeyword.length >= 5 && 
         (word.includes(normalizedKeyword) || normalizedKeyword.includes(word)))
      );
      
      if (hasMatch) {
        matchedKeywords.push(keyword);
      }
    }
    
    if (matchedKeywords.length >= THRESHOLDS.KEYWORD_MIN_MATCHES) {
      keywordResults.push({
        entry,
        matchCount: matchedKeywords.length,
        matchedKeywords
      });
    }
  }
  
  if (keywordResults.length > 0) {
    // Sort by match count descending
    keywordResults.sort((a, b) => b.matchCount - a.matchCount);
    const best = keywordResults[0];
    
    return {
      icdCode: best.entry.icdCode,
      icdDescription: best.entry.icdDescription,
      confidence: THRESHOLDS.KEYWORD_CONFIDENCE,
      matchLayer: 'KEYWORD',
      matchedOn: best.matchedKeywords.join(', '),
      isFloorCode: false,
      reasoning: `Keyword match: Found ${best.matchCount} keywords [${best.matchedKeywords.join(', ')}] for ${best.entry.icdDescription}`,
      alternativeCodes: keywordResults.slice(1, 4).map(r => r.entry.icdCode)
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // LAYER 6: Fuzzy Match (STRICT 85% similarity required)
  // Only against exactMatches and synonyms, not keywords
  // ═══════════════════════════════════════════════════════════════════════
  
  const fuzzyResults: Array<{entry: ICDEntry; similarity: number; matchedAgainst: string}> = [];
  
  for (const entry of database) {
    if (isConfusionRisk(diagnosisText, entry)) continue;
    
    // Only fuzzy match against exact terms and synonyms (not keywords!)
    const termsToMatch = [
      ...(entry.exactMatches || []),
      ...(entry.synonyms || []),
      entry.icdDescription
    ];
    
    for (const term of termsToMatch) {
      const similarity = calculateSimilarity(diagnosisText, term);
      
      if (similarity >= THRESHOLDS.FUZZY_SIMILARITY) {
        fuzzyResults.push({
          entry,
          similarity,
          matchedAgainst: term
        });
        break; // One match per entry is enough
      }
    }
  }
  
  if (fuzzyResults.length > 0) {
    fuzzyResults.sort((a, b) => b.similarity - a.similarity);
    const best = fuzzyResults[0];
    
    return {
      icdCode: best.entry.icdCode,
      icdDescription: best.entry.icdDescription,
      confidence: best.similarity,
      matchLayer: 'FUZZY',
      matchedOn: best.matchedAgainst,
      isFloorCode: false,
      reasoning: `Fuzzy match: "${diagnosisText}" is ${best.similarity}% similar to "${best.matchedAgainst}"`,
      alternativeCodes: fuzzyResults.slice(1, 4).map(r => r.entry.icdCode)
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // LAYER 7: Symptom Cluster Match (Only if clinical findings provided)
  // STRICT: Must match at least 4 symptoms
  // ═══════════════════════════════════════════════════════════════════════
  
  if ((symptoms && symptoms.length > 0) || clinicalFindings) {
    const allSymptoms = [
      ...symptoms,
      ...(clinicalFindings ? clinicalFindings.split(/[,;.]/).map(s => s.trim()) : [])
    ].filter(s => s.length >= 3);
    
    if (allSymptoms.length >= 2) {
      const symptomResults: Array<{entry: ICDEntry; matchCount: number; matchedSymptoms: string[]}> = [];
      
      for (const entry of database) {
        if (!entry.typicalSymptoms || entry.typicalSymptoms.length === 0) continue;
        if (isConfusionRisk(diagnosisText, entry)) continue;
        
        const matchedSymptoms: string[] = [];
        
        for (const symptom of allSymptoms) {
          const normalizedSymptom = normalize(symptom);
          
          const hasMatch = entry.typicalSymptoms.some(ts => {
            const normalizedTS = normalize(ts);
            return normalizedTS.includes(normalizedSymptom) || 
                   normalizedSymptom.includes(normalizedTS) ||
                   calculateSimilarity(normalizedSymptom, normalizedTS) >= 80;
          });
          
          if (hasMatch) {
            matchedSymptoms.push(symptom);
          }
        }
        
        if (matchedSymptoms.length >= THRESHOLDS.SYMPTOM_CLUSTER_MIN) {
          symptomResults.push({
            entry,
            matchCount: matchedSymptoms.length,
            matchedSymptoms
          });
        }
      }
      
      if (symptomResults.length > 0) {
        symptomResults.sort((a, b) => b.matchCount - a.matchCount);
        const best = symptomResults[0];
        
        // Symptom cluster match has lower confidence — doctor should confirm
        return {
          icdCode: best.entry.icdCode,
          icdDescription: best.entry.icdDescription,
          confidence: 65, // Lower confidence for symptom-only match
          matchLayer: 'SYMPTOM_CLUSTER',
          matchedOn: best.matchedSymptoms.join(', '),
          isFloorCode: false,
          reasoning: `Symptom cluster match: ${best.matchCount} symptoms [${best.matchedSymptoms.join(', ')}] suggest ${best.entry.icdDescription}. Doctor should confirm.`,
          alternativeCodes: symptomResults.slice(1, 4).map(r => r.entry.icdCode)
        };
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // LAYER 8: FLOOR — No confident match found → R69
  // This is the SAFE fallback. Better R69 than wrong code.
  // ═══════════════════════════════════════════════════════════════════════
  
  return floorResult(
    `No confident match found for "${diagnosisText}". ` +
    `This may be a rare condition, regional terminology, or requires specialist coding. ` +
    `Using R69 (Illness, unspecified) as safe fallback. Doctor should select specific ICD code.`
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { normalize, calculateSimilarity, isLikelyRareOrUnknown };
