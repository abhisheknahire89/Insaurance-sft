import * as fs from 'fs';
import { ICD10_MASTER_DB, MedicalSpecialty } from '../data/icd10MasterDatabaseRaw';
import { ENRICHED_ICD_DB } from '../services/icdIntelligentLookup';

const db = ICD10_MASTER_DB.map((old, i) => {
    // Try to find matching enriched entry
    const enriched = ENRICHED_ICD_DB.find(e => e.icdCode === old.code);
    
    return {
        id: `${old.specialty.substring(0,4).toUpperCase()}-${String(i).padStart(3, '0')}`,
        specialty: old.specialty,
        subcategory: old.subcategory,
        condition_name: old.commonName || old.description,
        common_aliases: enriched ? [...(enriched.exactMatches || []), ...(enriched.synonyms || []), ...(enriched.commonMisspellings || [])] : [],
        hinglish_terms: enriched ? (enriched.hindiTerms || []) : [],
        icd_codes: {
            primary: {
                code: old.code,
                description: old.description,
                use_as_default: true
            },
            specific_variants: []
        },
        commonly_associated_codes: [],
        admission_criteria: enriched?.admissionCriteria || [],
        medical_necessity_keywords: enriched?.keywords || [],
        typical_los_days: old.typicalLOS,
        expected_procedures: old.procedureCodes || [],
        tpa_query_triggers: old.commonTPAQueries || [],
        documentation_must_include: old.mandatoryDocuments?.map(d => d.name) || [],
        india_specific_notes: old.specialNotes?.join(' ') || "",
        severity_markers: old.severityMarkers || [],
        must_not_miss_flags: old.mustNotMissFlags || [],
        admission_justification_template: old.admissionJustificationTemplate || "",
        pmjay_eligible: old.pmjayEligible,
        pmjay_hbp_code: old.pmjayHBPCode,
        pmjay_package_rate: old.pmjayPackageRate,
        ward_type: old.wardType,
        icu_probability: old.icuProbability,
        cost_estimate: old.costEstimate,
        // Legacy fields for backward compatibility
        code: old.code,
        commonName: old.commonName || old.description,
        icuProbability: old.icuProbability,
        typicalLOS: old.typicalLOS,
        commonTPAQueries: old.commonTPAQueries || [],
        mandatoryDocuments: old.mandatoryDocuments || []
    };
});

// The R69 fallback entry - ALWAYS include this
const R69_FALLBACK = {
  id: "FLOOR-001",
  specialty: "General Medicine" as MedicalSpecialty,
  subcategory: "General",
  condition_name: "Illness, unspecified",
  common_aliases: [],
  hinglish_terms: [],
  icd_codes: {
    primary: {
      code: "R69",
      description: "Illness, unspecified",
      use_as_default: true
    },
    specific_variants: []
  },
  commonly_associated_codes: [],
  admission_criteria: ["Requires investigation", "Observation needed"],
  medical_necessity_keywords: ["undiagnosed", "under evaluation", "investigation required"],
  typical_los_days: { min: 2, max: 5, average: 3 },
  expected_procedures: ["Basic investigations", "Specialist consultation"],
  tpa_query_triggers: ["Specific diagnosis should be updated once confirmed"],
  documentation_must_include: ["Working diagnosis", "Investigation plan"],
  india_specific_notes: "Use as temporary code. Update with specific ICD once diagnosis is confirmed.",
  severity_markers: [],
  must_not_miss_flags: [],
  admission_justification_template: "Patient presents with unspecified symptoms requiring inpatient investigation and management.",
  pmjay_eligible: false,
  pmjay_hbp_code: undefined,
  pmjay_package_rate: undefined,
  ward_type: "any" as "any",
  icu_probability: "low" as "low",
  cost_estimate: {
    generalWard: { min: 10000, max: 25000 },
    privateRoom: { min: 20000, max: 45000 },
    icu: { min: 45000, max: 90000 },
    daycare: null
  },
  // Legacy fields for R69
  code: "R69",
  commonName: "Illness, unspecified",
  icuProbability: "low" as "low",
  typicalLOS: { min: 2, max: 5, average: 3 },
  commonTPAQueries: ["Specific diagnosis should be updated once confirmed"],
  mandatoryDocuments: []
};

db.push(R69_FALLBACK);

const newFileContent = `/**
 * ICD-10 Master Database for Indian Hospital Pre-Authorization
 * Single source of truth for all ICD code lookups
 */

export type MedicalSpecialty = 
  | 'General Medicine'
  | 'Cardiology'
  | 'Respiratory'
  | 'Gastroenterology'
  | 'Orthopedics'
  | 'Neurology'
  | 'Urology'
  | 'Obstetrics & Gynecology'
  | 'Surgery'
  | 'Oncology';

export interface ICD10Condition {
  id: string;
  specialty: string;
  subcategory: string;
  condition_name: string;
  common_aliases: string[];
  hinglish_terms: string[];
  icd_codes: {
    primary: {
      code: string;
      description: string;
      use_as_default: boolean;
    };
    specific_variants: Array<{
      code: string;
      description: string;
      use_when: string;
    }>;
  };
  commonly_associated_codes: Array<{
    code: string;
    description: string;
    relationship: string;
  }>;
  admission_criteria: string[];
  medical_necessity_keywords: string[];
  typical_los_days: { min: number; max: number; average: number };
  expected_procedures: string[];
  tpa_query_triggers: string[];
  documentation_must_include: string[];
  india_specific_notes: string;
  severity_markers: string[];
  must_not_miss_flags: string[];
  admission_justification_template: string;
  pmjay_eligible: boolean;
  pmjay_hbp_code?: string;
  pmjay_package_rate?: number;
  ward_type: 'general' | 'semi_private' | 'private' | 'icu' | 'any';
  icu_probability: 'low' | 'moderate' | 'high';
  cost_estimate: {
    generalWard: { min: number; max: number };
    privateRoom: { min: number; max: number };
    icu: { min: number; max: number };
    daycare: { min: number; max: number } | null;
  };
  // Legacy fields for backward compatibility
  code: string;
  commonName: string;
  icuProbability: 'low' | 'moderate' | 'high';
  typicalLOS: { min: number; max: number; average: number };
  commonTPAQueries: string[];
  mandatoryDocuments: any[];
}

export const ICD10_DATABASE: ICD10Condition[] = ${JSON.stringify(db, null, 2)};

export function getConditionByCode(code: string): ICD10Condition | undefined {
  const cleaned = code.trim().toUpperCase();
  return ICD10_DATABASE.find(c => 
    c.icd_codes.primary.code === cleaned ||
    c.icd_codes.specific_variants.some(v => v.code === cleaned)
  );
}

export function getR69Fallback(): ICD10Condition {
  return ICD10_DATABASE.find(c => c.id === "FLOOR-001") as ICD10Condition;
}

export function getAllMatchTerms(condition: ICD10Condition): string[] {
  return [
    condition.condition_name.toLowerCase(),
    ...condition.common_aliases.map(a => a.toLowerCase()),
    ...condition.hinglish_terms.map(t => t.toLowerCase()),
    ...condition.medical_necessity_keywords.map(k => k.toLowerCase())
  ];
}

export function formatDatabaseForGemini(): string {
  return ICD10_DATABASE
    .filter(c => c.id !== "FLOOR-001") 
    .map(condition => {
      const allTerms = getAllMatchTerms(condition);
      return \`[\${condition.icd_codes.primary.code}] \${condition.condition_name}
  Terms: \${allTerms.slice(0, 15).join(', ')}
  Variants: \${condition.icd_codes.specific_variants.map(v => \`\${v.code} (\${v.use_when})\`).join('; ') || 'None'}\`;
    })
    .join('\\n\\n');
}

// Backward-compatibility helpers
export const searchConditions = (query: string) => {
    const q = query.toLowerCase();
    return ICD10_DATABASE.filter(c => 
        c.condition_name.toLowerCase().includes(q) || 
        c.icd_codes.primary.code.includes(q.toUpperCase()) ||
        c.common_aliases.some(a => a.toLowerCase().includes(q))
    );
};

export const predictTPAQueries = (icd10Code: string): string[] => {
  const condition = getConditionByCode(icd10Code);
  return condition?.tpa_query_triggers || [];
};

export const getSeverityMarkers = (icd10Code: string): string[] => {
  const condition = getConditionByCode(icd10Code);
  return condition?.severity_markers || [];
};

export const getSpecialNotes = (icd10Code: string): string[] => {
  const condition = getConditionByCode(icd10Code);
  return condition?.india_specific_notes ? [condition.india_specific_notes] : [];
};

export const getAdmissionJustificationTemplate = (icd10Code: string): string => {
  const condition = getConditionByCode(icd10Code);
  return condition?.admission_justification_template || '';
};

export const isPMJAYEligible = (icd10Code: string): { eligible: boolean; hbpCode?: string; packageRate?: number } => {
  const condition = getConditionByCode(icd10Code);
  if (!condition) return { eligible: false };
  return {
    eligible: condition.pmjay_eligible,
    hbpCode: condition.pmjay_hbp_code,
    packageRate: condition.pmjay_package_rate
  };
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
    return { isValid: false, isBillable: false, originalCode: '', suggestedCode: '', suggestedDescription: '', warningMessage: null };
  }

  const condition = getConditionByCode(cleaned);
  const hasDecimal = cleaned.includes('.');
  
  if (condition && !hasDecimal && condition.icd_codes.primary.code.includes('.')) {
    return {
      isValid: true,
      isBillable: false,
      originalCode: cleaned,
      suggestedCode: condition.icd_codes.primary.code,
      suggestedDescription: condition.icd_codes.primary.description,
      warningMessage: \`"\${cleaned}" is a category code. Indian TPAs require a billable subcategory code. Recommended: \${condition.icd_codes.primary.code} — \${condition.icd_codes.primary.description}\`
    };
  }

  return {
    isValid: !!condition,
    isBillable: hasDecimal,
    originalCode: cleaned,
    suggestedCode: condition?.icd_codes.primary.code || cleaned,
    suggestedDescription: condition?.icd_codes.primary.description || '',
    warningMessage: condition ? (hasDecimal ? null : "Category code entered. Billable code preferred.") : "ICD-10 code not found in master database."
  };
};

export const getConditionByName = (name: string): ICD10Condition | undefined => {
  const lower = name.toLowerCase();
  return ICD10_DATABASE.find(c => 
    c.condition_name.toLowerCase() === lower || 
    c.common_aliases.some(a => a.toLowerCase() === lower) ||
    c.commonName.toLowerCase() === lower
  );
};

export const getDocumentChecklist = (icd10Code: string, type: 'cashless' | 'reimbursement' = 'cashless') => {
  const condition = getConditionByCode(icd10Code);
  const docs = condition?.documentation_must_include || [];
  
  return {
    mandatory: docs.map(d => ({ name: d, type: 'Mandatory' })),
    recommended: [],
    reimbursementExtra: type === 'reimbursement' ? [{ name: 'Cancelled Cheque', type: 'Required' }] : []
  };
};

export const estimateCost = (icd10Code: string, roomCategory: string, stayDays: number = 3) => {
  const condition = getConditionByCode(icd10Code);
  const baseRange = condition?.cost_estimate.generalWard || { min: 15000, max: 35000 };
  
  // Return structure matching old estimateCost
  return {
    average: baseRange.max * 0.8, // Approximation
    max: baseRange.max,
    breakdown: {
      roomCharges: baseRange.min * 0.4,
      consultantFees: baseRange.min * 0.2,
      investigations: baseRange.min * 0.2,
      medicines: baseRange.min * 0.1,
      procedures: 0,
      nursing: baseRange.min * 0.05,
      miscellaneous: baseRange.min * 0.05
    }
  };
};

`;

console.log('Writing to output file...');
fs.writeFileSync('data/icd10MasterDatabaseMerged.ts', newFileContent);
console.log('Conversion successful. Output to data/icd10MasterDatabaseMerged.ts');
