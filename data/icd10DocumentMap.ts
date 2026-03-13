export const ICD10_DOCUMENT_REQUIREMENTS: Record<string, string[]> = {
  // Common sample mapping, can be expanded later
  'default': ['Discharge Summary', 'Final Hospital Bill', 'Payment Receipt', 'Pharmacy Bills'],
  'A00': ['Stool Culture Report', 'Discharge Summary', 'Final Hospital Bill'],
  'I21': ['ECG', 'Cardiac Enzymes (Troponin)', 'Angiogram Report', 'Discharge Summary'],
  'J44': ['Chest X-Ray', 'ABG Report', 'PFT (if available)', 'Discharge Summary'],
};

export const getRequiredDocuments = (icd10Code: string): string[] => {
  const prefix = icd10Code.substring(0, 3).toUpperCase();
  return ICD10_DOCUMENT_REQUIREMENTS[prefix] || ICD10_DOCUMENT_REQUIREMENTS['default'];
};

// ICD-10 category to default billable code mapping
// These are the most common 3-char codes that get incorrectly submitted
const ICD10_CATEGORY_DEFAULTS: Record<string, { billable: string; description: string }> = {
  'J15': { billable: 'J15.9', description: 'Unspecified bacterial pneumonia' },
  'J18': { billable: 'J18.9', description: 'Pneumonia, unspecified organism (CAP)' },
  'I21': { billable: 'I21.9', description: 'Acute myocardial infarction, unspecified' },
  'K80': { billable: 'K80.20', description: 'Calculus of gallbladder without cholecystitis' },
  'N20': { billable: 'N20.0', description: 'Calculus of kidney' },
  'S72': { billable: 'S72.001A', description: 'Fracture of unspecified part of neck of right femur' },
  'G43': { billable: 'G43.909', description: 'Migraine, unspecified, not intractable' },
  'E11': { billable: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
  'A09': { billable: 'A09', description: 'Infectious gastroenteritis and colitis, unspecified' }, // A09 is billable
  'J44': { billable: 'J44.1', description: 'COPD with acute exacerbation' },
  'I50': { billable: 'I50.9', description: 'Heart failure, unspecified' },
  'N18': { billable: 'N18.9', description: 'Chronic kidney disease, unspecified' },
  'J06': { billable: 'J06.9', description: 'Acute upper respiratory infection, unspecified' },
  'K35': { billable: 'K35.80', description: 'Acute appendicitis without abscess' },
  'I63': { billable: 'I63.9', description: 'Cerebral infarction, unspecified' },
};

export interface ICD10ValidationResult {
  isValid: boolean;
  isBillable: boolean;
  originalCode: string;
  suggestedCode: string;
  suggestedDescription: string;
  warningMessage: string | null;
}

export const validateAndSuggestICD10 = (code: string): ICD10ValidationResult => {
  const cleaned = code.trim().toUpperCase();
  
  if (!cleaned) {
    return {
      isValid: false,
      isBillable: false,
      originalCode: '',
      suggestedCode: '',
      suggestedDescription: '',
      warningMessage: null
    };
  }

  // Check minimum length — billable codes are at minimum 3 chars for some,
  // but Indian TPA standard requires the decimal form (e.g., J18.9)
  const hasDecimal = cleaned.includes('.');
  const baseCode = cleaned.split('.')[0];
  
  // Check if it's a known category-only code
  if (ICD10_CATEGORY_DEFAULTS[baseCode] && !hasDecimal) {
    const suggestion = ICD10_CATEGORY_DEFAULTS[baseCode];
    return {
      isValid: true,
      isBillable: false,
      originalCode: cleaned,
      suggestedCode: suggestion.billable,
      suggestedDescription: suggestion.description,
      warningMessage: `"${cleaned}" is a category code. Indian TPAs require a billable subcategory code. Recommended: ${suggestion.billable} — ${suggestion.description}`
    };
  }
  
  // Code looks billable
  return {
    isValid: true,
    isBillable: true,
    originalCode: cleaned,
    suggestedCode: cleaned,
    suggestedDescription: '',
    warningMessage: null
  };
};
