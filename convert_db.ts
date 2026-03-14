import * as fs from 'fs';
import { ICD10_MASTER_DB } from './data/icd10MasterDatabase';
import { ENRICHED_ICD_DB } from './services/icdIntelligentLookup';

const db = ICD10_MASTER_DB.map((old, i) => {
    // Try to find matching enriched entry
    const enriched = ENRICHED_ICD_DB.find(e => e.icdCode === old.code);
    
    return {
        id: `${old.specialty.substring(0,4).toUpperCase()}-${String(i).padStart(3, '0')}`,
        specialty: old.specialty,
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
        pmjay_eligible: old.pmjayEligible
    };
});

// The R69 fallback entry - ALWAYS include this
const R69_FALLBACK = {
  id: "FLOOR-001",
  specialty: "General",
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
  pmjay_eligible: false
};

db.push(R69_FALLBACK);

const newFileContent = `/**
 * ICD-10 Master Database for Indian Hospital Pre-Authorization
 * Single source of truth for all ICD code lookups
 */

export interface ICD10Condition {
  id: string;
  specialty: string;
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
  pmjay_eligible: boolean;
}

export const ICD10_DATABASE: ICD10Condition[] = ${JSON.stringify(db, null, 2)};

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
    .filter(c => c.id !== "FLOOR-001") // Exclude R69 from search list
    .map(condition => {
      const allTerms = getAllMatchTerms(condition);
      return \`[\${condition.icd_codes.primary.code}] \${condition.condition_name}
  Terms: \${allTerms.slice(0, 15).join(', ')}
  Variants: \${condition.icd_codes.specific_variants.map(v => \`\${v.code} (\${v.use_when})\`).join('; ') || 'None'}\`;
    })
    .join('\\n\\n');
}

export function getConditionByCode(code: string): ICD10Condition | undefined {
  return ICD10_DATABASE.find(c => 
    c.icd_codes.primary.code === code ||
    c.icd_codes.specific_variants.some(v => v.code === code)
  );
}

export function getR69Fallback(): ICD10Condition {
  return ICD10_DATABASE.find(c => c.id === "FLOOR-001") as ICD10Condition;
}
`;

fs.writeFileSync('data/newICD10Database.ts', newFileContent);
console.log('Conversion successful. Output to data/newICD10Database.ts');
