export interface ICDEntry {
  icdCode: string;
  icdDescription: string;
  specialty: string;
  category: string;
  isEmergency: boolean;
  exactMatches: string[];
  synonyms: string[];
  hindiTerms: string[];
  commonMisspellings: string[];
  keywords: string[];
  abbreviations: string[];
  typicalSymptoms: string[];
  relatedFindings: string[];
  notToBeConfusedWith: string[];
  admissionCriteria: string[];
  typicalLOS: { ward: number; icu: number };
  tpaQueryTriggers: string[];
  pmjayEligible: boolean;
}

export type MatchLayer = 
  | 'EXACT'           
  | 'SYNONYM'         
  | 'HINDI'           
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

const CONFIDENCE_THRESHOLDS = {
  EXACT: 95,
  SYNONYM: 85,
  HINDI: 80,
  KEYWORD: 70,
  FUZZY: 60,
  SYMPTOM_CLUSTER: 50,
  FLOOR: 0,
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

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b(the|a|an|of|in|with|and|or)\b/g, '')
    .trim();
}

function isInvalidInput(text: string): boolean {
  if (!text || text.trim().length < 2) return true;
  const testPatterns = [/^test/i, /^xyz/i, /^abc/i, /^sample/i, /^dummy/i, /^patient\s*\d/i, /^case\s*\d/i];
  if (testPatterns.some(p => p.test(text))) return true;
  const vowelRatio = (text.match(/[aeiouAEIOU]/g) || []).length / text.length;
  if (vowelRatio < 0.1 && text.length > 5) return true;
  return false;
}

function floorResult(reasoning: string): MatchResult {
  return {
    icdCode: "R69",
    icdDescription: "Illness, unspecified",
    confidence: 0,
    matchLayer: 'FLOOR',
    matchedOn: "",
    isFloorCode: true,
    reasoning
  };
}

function levenshteinDistance(a: string, b: string): number {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}

function calculateSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 100;
  const distance = levenshteinDistance(str1, str2);
  return Math.round((1 - distance / maxLen) * 100);
}

function findKeywordMatches(diagnosis: string, database: ICDEntry[]) {
  const results = [];
  const diagnosisWords = diagnosis.split(/\s+/);
  
  for (const entry of database) {
    const allKeywords = [...(entry.keywords || []), ...(entry.abbreviations || []), ...(entry.typicalSymptoms || [])];
    const matchedKeywords = allKeywords.filter(kw => 
      diagnosisWords.some(word => 
        word.includes(normalize(kw)) || normalize(kw).includes(word)
      )
    );
    
    if (matchedKeywords.length > 0) {
      const score = Math.min(85, 60 + (matchedKeywords.length * 8));
      results.push({ entry, score, matchedKeywords });
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

function findFuzzyMatches(diagnosis: string, database: ICDEntry[]) {
  const results = [];
  for (const entry of database) {
    const allMatchableStrings = [
      ...(entry.exactMatches || []),
      ...(entry.synonyms || []),
      ...(entry.commonMisspellings || []),
      entry.icdDescription
    ];
    
    for (const matchString of allMatchableStrings) {
      const similarity = calculateSimilarity(diagnosis, normalize(matchString));
      if (similarity >= 60) {
        results.push({ entry, score: similarity, matchedAgainst: matchString });
        break; 
      }
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

function findSymptomClusterMatches(symptoms: string[], clinicalFindings: string, database: ICDEntry[]) {
  const results = [];
  const combinedClinicalText = normalize([...symptoms, clinicalFindings].join(' '));
  
  for (const entry of database) {
     const allIndications = [...(entry.typicalSymptoms || []), ...(entry.relatedFindings || [])];
     const matchedSymptoms = allIndications.filter(ind => combinedClinicalText.includes(normalize(ind)));
     
     if (matchedSymptoms.length > 0) {
         const score = Math.min(70, 50 + (matchedSymptoms.length * 5));
         results.push({ entry, score, matchedSymptoms });
     }
  }
  return results.sort((a, b) => b.score - a.score);
}

export function suggestICDCode(
  diagnosisText: string,
  clinicalFindings: string = '',
  symptoms: string[] = [],
  icdDatabase: ICDEntry[] = ENRICHED_ICD_DB
): MatchResult {
  
  const normalizedDiagnosis = normalize(diagnosisText);
  
  if (isInvalidInput(normalizedDiagnosis)) {
    return floorResult("Invalid or empty diagnosis input");
  }
  
  for (const entry of icdDatabase) {
    if (entry.exactMatches.some(exact => normalize(exact) === normalizedDiagnosis)) {
      return {
        icdCode: entry.icdCode,
        icdDescription: entry.icdDescription,
        confidence: CONFIDENCE_THRESHOLDS.EXACT,
        matchLayer: 'EXACT',
        matchedOn: diagnosisText,
        isFloorCode: false,
        reasoning: `Exact match found: "${diagnosisText}" matches database entry`
      };
    }
  }
  
  for (const entry of icdDatabase) {
    const synonymMatch = entry.synonyms.find(syn => 
      normalize(syn) === normalizedDiagnosis ||
      normalizedDiagnosis.includes(normalize(syn))
    );
    
    if (synonymMatch) {
      return {
        icdCode: entry.icdCode,
        icdDescription: entry.icdDescription,
        confidence: CONFIDENCE_THRESHOLDS.SYNONYM,
        matchLayer: 'SYNONYM',
        matchedOn: synonymMatch,
        isFloorCode: false,
        reasoning: `Synonym match: "${diagnosisText}" recognized as "${synonymMatch}" → ${entry.icdDescription}`
      };
    }
  }
  
  for (const entry of icdDatabase) {
    const hindiMatch = entry.hindiTerms.find(term =>
      normalize(term) === normalizedDiagnosis ||
      normalizedDiagnosis.includes(normalize(term))
    );
    
    if (hindiMatch) {
      return {
        icdCode: entry.icdCode,
        icdDescription: entry.icdDescription,
        confidence: CONFIDENCE_THRESHOLDS.HINDI,
        matchLayer: 'HINDI',
        matchedOn: hindiMatch,
        isFloorCode: false,
        reasoning: `Hindi/Hinglish term matched: "${diagnosisText}" → ${entry.icdDescription}`
      };
    }
  }
  
  const keywordMatches = findKeywordMatches(normalizedDiagnosis, icdDatabase);
  
  if (keywordMatches.length > 0 && keywordMatches[0].score >= CONFIDENCE_THRESHOLDS.KEYWORD) {
    const best = keywordMatches[0];
    return {
      icdCode: best.entry.icdCode,
      icdDescription: best.entry.icdDescription,
      confidence: best.score,
      matchLayer: 'KEYWORD',
      matchedOn: best.matchedKeywords.join(', '),
      isFloorCode: false,
      reasoning: `Keyword match: Found keywords [${best.matchedKeywords.join(', ')}] suggesting ${best.entry.icdDescription}`,
      alternativeCodes: keywordMatches.slice(1, 4).map(m => m.entry.icdCode)
    };
  }
  
  const fuzzyMatches = findFuzzyMatches(normalizedDiagnosis, icdDatabase);
  
  if (fuzzyMatches.length > 0 && fuzzyMatches[0].score >= CONFIDENCE_THRESHOLDS.FUZZY) {
    const best = fuzzyMatches[0];
    
    if (!best.entry.notToBeConfusedWith?.some(confused => normalizedDiagnosis.includes(normalize(confused)))) {
      return {
        icdCode: best.entry.icdCode,
        icdDescription: best.entry.icdDescription,
        confidence: best.score,
        matchLayer: 'FUZZY',
        matchedOn: best.matchedAgainst,
        isFloorCode: false,
        reasoning: `Fuzzy match: "${diagnosisText}" is similar to "${best.matchedAgainst}" (${best.score}% similarity)`,
        alternativeCodes: fuzzyMatches.slice(1, 4).map(m => m.entry.icdCode)
      };
    }
  }
  
  if (symptoms.length > 0 || clinicalFindings) {
    const symptomMatches = findSymptomClusterMatches(symptoms, clinicalFindings, icdDatabase);
    
    if (symptomMatches.length > 0 && symptomMatches[0].score >= CONFIDENCE_THRESHOLDS.SYMPTOM_CLUSTER) {
      const best = symptomMatches[0];
      return {
        icdCode: best.entry.icdCode,
        icdDescription: best.entry.icdDescription,
        confidence: best.score,
        matchLayer: 'SYMPTOM_CLUSTER',
        matchedOn: best.matchedSymptoms.join(', '),
        isFloorCode: false,
        reasoning: `Symptom cluster match: Clinical findings [${best.matchedSymptoms.join(', ')}] suggest ${best.entry.icdDescription}. Doctor should confirm.`,
        alternativeCodes: symptomMatches.slice(1, 4).map(m => m.entry.icdCode)
      };
    }
  }
  
  return floorResult(
    `No confident match found for "${diagnosisText}". ` +
    `This may be a rare condition, regional terminology, or requires specialist coding. ` +
    `Using R69 (Illness, unspecified) as safe fallback. Doctor should select specific code.`
  );
}
