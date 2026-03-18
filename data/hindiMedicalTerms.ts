import { HindiTermMapping } from '../types/icd.types';

/**
 * Hindi/Hinglish Medical Vocabulary
 * Maps English medical terms to Hindi equivalents
 */

export const HINDI_MEDICAL_TERMS: HindiTermMapping[] = [
  // Body Parts
  { english: "heart", hindi_terms: ["dil", "hriday"], devanagari: ["दिल", "हृदय"] },
  { english: "lung", hindi_terms: ["phephda", "phephdon", "lungs"], devanagari: ["फेफड़ा", "फेफड़े"] },
  { english: "liver", hindi_terms: ["jigar", "liver", "yakrit"], devanagari: ["जिगर", "यकृत"] },
  { english: "kidney", hindi_terms: ["gurda", "kidney", "gurdey"], devanagari: ["गुर्दा", "गुर्दे"] },
  { english: "brain", hindi_terms: ["dimag", "brain", "mastishk"], devanagari: ["दिमाग", "मस्तिष्क"] },
  { english: "stomach", hindi_terms: ["pet", "stomach", "udhar"], devanagari: ["पेट"] },
  { english: "intestine", hindi_terms: ["aant", "intestine", "antra"], devanagari: ["आंत"] },
  { english: "bone", hindi_terms: ["haddi", "bone", "asthi"], devanagari: ["हड्डी"] },
  { english: "blood", hindi_terms: ["khoon", "blood", "rakt"], devanagari: ["खून", "रक्त"] },
  { english: "uterus", hindi_terms: ["bacchedani", "garbhashay", "uterus"], devanagari: ["बच्चेदानी", "गर्भाशय"] },
  
  // Symptoms
  { english: "fever", hindi_terms: ["bukhar", "tav", "jwara"], devanagari: ["बुखार", "ज्वर"] },
  { english: "pain", hindi_terms: ["dard", "takleef", "peeda"], devanagari: ["दर्द", "पीड़ा"] },
  { english: "cough", hindi_terms: ["khansi", "khasi"], devanagari: ["खांसी"] },
  { english: "vomiting", hindi_terms: ["ulti", "vaman"], devanagari: ["उल्टी"] },
  { english: "diarrhea", hindi_terms: ["dast", "loose motion", "atisaar"], devanagari: ["दस्त"] },
  { english: "breathlessness", hindi_terms: ["saans phoolna", "saans nahi aa rahi", "saans mein takleef"], devanagari: ["सांस फूलना"] },
  { english: "swelling", hindi_terms: ["sujan", "sooj", "shotha"], devanagari: ["सूजन"] },
  { english: "weakness", hindi_terms: ["kamzori", "weakness", "durbalta"], devanagari: ["कमज़ोरी"] },
  { english: "headache", hindi_terms: ["sir dard", "sar dard"], devanagari: ["सिर दर्द"] },
  { english: "chest pain", hindi_terms: ["seene mein dard", "chhati mein dard"], devanagari: ["सीने में दर्द", "छाती में दर्द"] },
  { english: "abdominal pain", hindi_terms: ["pet mein dard", "pet dard"], devanagari: ["पेट में दर्द"] },
  { english: "bleeding", hindi_terms: ["khoon behna", "bleeding", "raktasrav"], devanagari: ["खून बहना"] },
  { english: "jaundice", hindi_terms: ["peeliya", "piliya", "kamla"], devanagari: ["पीलिया"] },
  { english: "seizures", hindi_terms: ["daure", "fits", "mirgi"], devanagari: ["दौरे", "मिर्गी"] },
  { english: "paralysis", hindi_terms: ["lakwa", "paralysis", "pakshaghat"], devanagari: ["लकवा", "पक्षाघात"] },
  
  // Conditions
  { english: "heart attack", hindi_terms: ["dil ka daura", "heart attack"], devanagari: ["दिल का दौरा"] },
  { english: "stroke", hindi_terms: ["brain stroke", "lakwa", "dimag mein khoon ka thakka"], devanagari: ["ब्रेन स्ट्रोक", "लकवा"] },
  { english: "diabetes", hindi_terms: ["sugar", "madhumeh", "sugar ki bimari"], devanagari: ["शुगर", "मधुमेह"] },
  { english: "hypertension", hindi_terms: ["BP", "high BP", "ucch raktchap"], devanagari: ["हाई बीपी", "उच्च रक्तचाप"] },
  { english: "asthma", hindi_terms: ["dama", "asthma", "saans ki bimari"], devanagari: ["दमा"] },
  { english: "tuberculosis", hindi_terms: ["TB", "tapedik", "kshay rog"], devanagari: ["टीबी", "क्षय रोग"] },
  { english: "pneumonia", hindi_terms: ["nimoniya", "lungs mein infection"], devanagari: ["निमोनिया"] },
  { english: "appendicitis", hindi_terms: ["appendix", "appendix mein sujan"], devanagari: ["अपेंडिक्स में सूजन"] },
  { english: "kidney stone", hindi_terms: ["gurde ki pathri", "kidney stone"], devanagari: ["गुर्दे की पथरी"] },
  { english: "gallstone", hindi_terms: ["pittashay ki pathri", "gallstone"], devanagari: ["पित्ताशय की पथरी"] },
  
  // Pregnancy Related
  { english: "pregnancy", hindi_terms: ["pregnancy", "garbhavastha", "pet se hai"], devanagari: ["गर्भावस्था"] },
  { english: "delivery", hindi_terms: ["delivery", "prasav", "bachcha hona"], devanagari: ["प्रसव", "डिलीवरी"] },
  { english: "cesarean", hindi_terms: ["cesarean", "operation se delivery", "LSCS"], devanagari: ["सिजेरियन"] },
  { english: "miscarriage", hindi_terms: ["miscarriage", "garbhpat", "pet gir gaya"], devanagari: ["गर्भपात"] },
  
  // Medical Actions
  { english: "operation", hindi_terms: ["operation", "surgery", "shalya chikitsa"], devanagari: ["ऑपरेशन"] },
  { english: "injection", hindi_terms: ["injection", "sui", "teeka"], devanagari: ["इंजेक्शन", "सुई"] },
  { english: "medicine", hindi_terms: ["dawai", "medicine", "aushadhi"], devanagari: ["दवाई"] },
  { english: "admission", hindi_terms: ["bharti", "admission", "hospital mein dakhil"], devanagari: ["भर्ती"] },
  { english: "discharge", hindi_terms: ["chutti", "discharge", "ghar jaana"], devanagari: ["छुट्टी"] },
  
  // Emergency Terms
  { english: "emergency", hindi_terms: ["emergency", "atyawashyak", "turant"], devanagari: ["इमरजेंसी"] },
  { english: "critical", hindi_terms: ["critical", "gambhir", "serious"], devanagari: ["गंभीर"] },
  { english: "unconscious", hindi_terms: ["behosh", "unconscious", "hosh nahi"], devanagari: ["बेहोश"] },
  { english: "accident", hindi_terms: ["accident", "hadsa", "durghatna"], devanagari: ["एक्सीडेंट", "दुर्घटना"] }
];

// Helper function to get Hindi terms for English word
export function getHindiTerms(englishTerm: string): string[] {
  const normalizedTerm = englishTerm.toLowerCase();
  
  for (const mapping of HINDI_MEDICAL_TERMS) {
    if (mapping.english.toLowerCase() === normalizedTerm ||
        mapping.hindi_terms.some(h => h.toLowerCase() === normalizedTerm)) {
      return mapping.hindi_terms;
    }
  }
  
  return [];
}

// Helper to check if a term is Hindi medical term
export function isHindiMedicalTerm(term: string): boolean {
  const normalizedTerm = term.toLowerCase();
  
  return HINDI_MEDICAL_TERMS.some(mapping =>
    mapping.hindi_terms.some(h => h.toLowerCase() === normalizedTerm)
  );
}
