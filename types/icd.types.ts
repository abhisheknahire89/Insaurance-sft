/**
 * ICD-10 Database Type Definitions
 * Aivana Health Intelligence System
 */

// ═══════════════════════════════════════════════════════════════════════════
// TIER 1: Enriched Condition (Full Metadata)
// ═══════════════════════════════════════════════════════════════════════════

export interface CostEstimate {
  roomRent: number;
  nursing: number;
  icuCharges: number;
  otCharges: number;
  surgeonFee: number;
  anesthetistFee: number;
  consultantFee: number;
  investigations: number;
  medicines: number;
  consumables: number;
  implants: number;
}

export interface ICDCodeVariant {
  code: string;
  description: string;
  use_when: string;
}

export interface Tier1Condition {
  id: string;
  specialty: string;
  condition_name: string;
  
  common_aliases: string[];
  hinglish_terms: string[];
  medical_necessity_keywords: string[];
  
  icd_codes: {
    primary: {
      code: string;
      description: string;
    };
    variants: ICDCodeVariant[];
  };
  
  admission_criteria: string[];
  typical_los: {
    ward: number;
    icu: number;
  };
  
  cost_estimate: CostEstimate;
  room_category_default: 'General Ward' | 'Semi-Private' | 'Private' | 'ICU';
  
  tpa_query_triggers: string[];
  documentation_required: string[];
  clinical_severity_markers: string[];
  special_considerations: string[];
  
  pmjay_eligible: boolean;
  pmjay_package_code?: string;
  pmjay_package_rate?: number;
  
  is_surgical: boolean;
  is_emergency_typically: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER 2: Extended Condition (Basic Metadata)
// ═══════════════════════════════════════════════════════════════════════════

export interface Tier2Condition {
  code: string;
  description: string;
  match_terms: string[];
  specialty: string;
  is_surgical: boolean;
  typical_los_days: number;
  is_emergency: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER 3: Basic ICD Reference
// ═══════════════════════════════════════════════════════════════════════════

export interface Tier3Code {
  code: string;
  description: string;
  category: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Lookup Result
// ═══════════════════════════════════════════════════════════════════════════

export interface ICDLookupResult {
  code: string;
  description: string;
  tier: 1 | 2 | 3 | 'FLOOR';
  confidence: number;
  has_full_metadata: boolean;
  condition_data?: Tier1Condition;
  reasoning: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Hindi Medical Terms Dictionary
// ═══════════════════════════════════════════════════════════════════════════

export interface HindiTermMapping {
  english: string;
  hindi_terms: string[];
  devanagari?: string[];
}
