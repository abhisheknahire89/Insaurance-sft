/**
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

export const ICD10_DATABASE: ICD10Condition[] = [
  {
    "id": "RESP-000",
    "specialty": "Respiratory",
    "subcategory": "Respiratory Infections",
    "condition_name": "Community Acquired Pneumonia (CAP)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "J18.9",
        "description": "Pneumonia, unspecified organism",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 4,
      "max": 10,
      "average": 6
    },
    "expected_procedures": [
      "96.04",
      "93.90"
    ],
    "tpa_query_triggers": [
      "Why was hospitalization required instead of OPD treatment?",
      "Please provide SpO2 readings on admission and trend",
      "Submit blood culture and sensitivity report",
      "Provide daily progress notes showing active treatment",
      "Justify length of stay beyond 5 days",
      "Submit repeat chest X-ray report"
    ],
    "documentation_must_include": [
      "Chest X-Ray — Admission Film + Radiologist Report",
      "Complete Blood Count with Differential",
      "CRP or ESR",
      "SpO2 Monitoring Chart (admission value mandatory)",
      "Discharge Summary with day-wise progress",
      "Nursing Charts — Vitals, Temperature, I/O",
      "Antibiotic Administration Chart",
      "Arterial Blood Gas Report"
    ],
    "india_specific_notes": "CURB-65 score ≥2 is standard threshold for inpatient admission — document score explicitly Failed prior oral antibiotic therapy is a strong hospitalization justification — document drug name and duration Uncontrolled diabetes as comorbidity directly increases severity and LOS",
    "severity_markers": [
      "SpO2 <94%",
      "RR >24/min",
      "HR >100/min",
      "CRP >100",
      "TLC >15000",
      "Bilateral infiltrates",
      "CURB-65 ≥2"
    ],
    "must_not_miss_flags": [
      "Pulmonary TB",
      "Lung malignancy",
      "COVID-19 pneumonia",
      "Pulmonary embolism"
    ],
    "admission_justification_template": "Patient presents with community-acquired pneumonia (ICD-10: J18.9) with SpO2 {spo2}% on room air, RR {rr}/min, and temperature {temp}°F. CURB-65 score of {curb65} indicates {severity} severity requiring inpatient management. Prior outpatient antibiotic therapy ({prior_treatment}) failed to produce clinical improvement. Hypoxia requiring supplemental oxygen cannot be safely managed in the outpatient setting.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1023",
    "pmjay_package_rate": 8400,
    "ward_type": "any",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 25000,
        "max": 60000
      },
      "privateRoom": {
        "min": 50000,
        "max": 120000
      },
      "icu": {
        "min": 80000,
        "max": 200000
      },
      "daycare": null
    },
    "code": "J18.9",
    "commonName": "Community Acquired Pneumonia (CAP)",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 4,
      "max": 10,
      "average": 6
    },
    "commonTPAQueries": [
      "Why was hospitalization required instead of OPD treatment?",
      "Please provide SpO2 readings on admission and trend",
      "Submit blood culture and sensitivity report",
      "Provide daily progress notes showing active treatment",
      "Justify length of stay beyond 5 days",
      "Submit repeat chest X-ray report"
    ],
    "mandatoryDocuments": [
      {
        "id": "cxr_admission",
        "name": "Chest X-Ray — Admission Film + Radiologist Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Radiological evidence of pneumonia not provided"
      },
      {
        "id": "cbc_admission",
        "name": "Complete Blood Count with Differential",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Hematological evidence of infection not documented"
      },
      {
        "id": "crp_esr",
        "name": "CRP or ESR",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Inflammatory markers not provided"
      },
      {
        "id": "spo2_chart",
        "name": "SpO2 Monitoring Chart (admission value mandatory)",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Oxygen saturation at admission not documented — hospitalization necessity unclear"
      },
      {
        "id": "discharge_summary",
        "name": "Discharge Summary with day-wise progress",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Discharge summary missing or insufficient"
      },
      {
        "id": "nursing_charts",
        "name": "Nursing Charts — Vitals, Temperature, I/O",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "No objective clinical monitoring documented"
      },
      {
        "id": "antibiotic_chart",
        "name": "Antibiotic Administration Chart",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "IV antibiotic therapy not documented"
      },
      {
        "id": "abg",
        "name": "Arterial Blood Gas Report",
        "category": "investigation",
        "mandatory": false,
        "whenRequired": "if SpO2 <94% at any point",
        "tpaQueryIfMissing": "Severity of hypoxia not objectively documented"
      }
    ]
  },
  {
    "id": "RESP-001",
    "specialty": "Respiratory",
    "subcategory": "Respiratory Infections",
    "condition_name": "Bacterial Pneumonia",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "J15.9",
        "description": "Bacterial pneumonia, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 5,
      "max": 10,
      "average": 6
    },
    "expected_procedures": [
      "96.04",
      "93.90"
    ],
    "tpa_query_triggers": [
      "Submit sputum culture report",
      "Provide daily vital charts including temperature",
      "Justify IV antibiotic selection"
    ],
    "documentation_must_include": [
      "Chest X-Ray / CT Chest",
      "CBC indicating leukocytosis"
    ],
    "india_specific_notes": "Sputum culture often required for antibiotic justification",
    "severity_markers": [
      "SpO2 <92%",
      "Hypotension",
      "Altered mental status"
    ],
    "must_not_miss_flags": [
      "Sepsis",
      "Empyema"
    ],
    "admission_justification_template": "Patient presents with Bacterial Pneumonia (J15.9). Vitals: SpO2 {spo2}%, RR {rr}. Chest X-ray shows {findings}. Clinical severity warrants inpatient management and IV antibiotics.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1023",
    "pmjay_package_rate": 15000,
    "ward_type": "any",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 30000,
        "max": 70000
      },
      "privateRoom": {
        "min": 60000,
        "max": 140000
      },
      "icu": {
        "min": 100000,
        "max": 250000
      },
      "daycare": null
    },
    "code": "J15.9",
    "commonName": "Bacterial Pneumonia",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 5,
      "max": 10,
      "average": 6
    },
    "commonTPAQueries": [
      "Submit sputum culture report",
      "Provide daily vital charts including temperature",
      "Justify IV antibiotic selection"
    ],
    "mandatoryDocuments": [
      {
        "id": "cxr_pneumonia",
        "name": "Chest X-Ray / CT Chest",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "cbc_pneumonia",
        "name": "CBC indicating leukocytosis",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GENE-002",
    "specialty": "General Medicine",
    "subcategory": "Gastrointestinal Infections",
    "condition_name": "Acute Gastroenteritis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "A09",
        "description": "Infectious gastroenteritis and colitis, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [
      "99.18"
    ],
    "tpa_query_triggers": [
      "Was OPD rehydration attempted before admission?",
      "Provide serum electrolytes showing dehydration severity",
      "Was patient able to tolerate oral fluids?",
      "Justify hospitalization for gastroenteritis"
    ],
    "documentation_must_include": [
      "Serum Electrolytes (Na, K, Cl, Bicarbonate)",
      "Renal Function Tests (Creatinine, BUN)",
      "Input/Output Chart",
      "Stool Routine and Microscopy"
    ],
    "india_specific_notes": "TPAs routinely question gastroenteritis admissions — document failed oral rehydration explicitly Electrolyte imbalance is the primary hospitalization justification Pediatric and elderly patients have stronger justification for admission",
    "severity_markers": [
      "Na <130 mEq/L",
      "K <3.0 mEq/L",
      "Creatinine elevated",
      "HR >100",
      "Skin turgor reduced",
      "Unable to tolerate oral fluids",
      "Passage >10 stools/day"
    ],
    "must_not_miss_flags": [
      "Acute appendicitis",
      "Intestinal obstruction",
      "Inflammatory bowel disease flare",
      "Typhoid fever"
    ],
    "admission_justification_template": "Patient presents with acute gastroenteritis with {vomiting_frequency} vomiting episodes and {stool_frequency} loose stools over {duration}. Serum sodium {sodium} mEq/L and potassium {potassium} mEq/L indicate {severity} dehydration. Patient unable to tolerate oral rehydration. IV fluid resuscitation and electrolyte correction required in monitored inpatient setting.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1041",
    "pmjay_package_rate": 4500,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 8000,
        "max": 25000
      },
      "privateRoom": {
        "min": 15000,
        "max": 45000
      },
      "icu": {
        "min": 40000,
        "max": 90000
      },
      "daycare": null
    },
    "code": "A09",
    "commonName": "Acute Gastroenteritis",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "Was OPD rehydration attempted before admission?",
      "Provide serum electrolytes showing dehydration severity",
      "Was patient able to tolerate oral fluids?",
      "Justify hospitalization for gastroenteritis"
    ],
    "mandatoryDocuments": [
      {
        "id": "electrolytes",
        "name": "Serum Electrolytes (Na, K, Cl, Bicarbonate)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Dehydration severity not biochemically documented"
      },
      {
        "id": "rft",
        "name": "Renal Function Tests (Creatinine, BUN)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Renal impact of dehydration not assessed"
      },
      {
        "id": "io_chart",
        "name": "Input/Output Chart",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Fluid deficit not documented"
      },
      {
        "id": "stool_routine",
        "name": "Stool Routine and Microscopy",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Infectious etiology not investigated"
      }
    ]
  },
  {
    "id": "GENE-003",
    "specialty": "General Medicine",
    "subcategory": "Endocrine & Metabolic",
    "condition_name": "Uncontrolled Type 2 Diabetes / Diabetic Hyperglycemia",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "E11.65",
        "description": "Type 2 diabetes mellitus with hyperglycemia",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "expected_procedures": [
      "99.18",
      "99.17"
    ],
    "tpa_query_triggers": [
      "Was this a new diagnosis or known diabetic?",
      "What was the precipitating factor for decompensation?",
      "Provide HbA1c report",
      "Was DKA or HHS ruled out?",
      "Submit serial blood glucose charts"
    ],
    "documentation_must_include": [
      "Serial Blood Sugar Log (minimum 4 readings/day)",
      "HbA1c",
      "Urine Ketones / Urine R/M",
      "Serum Electrolytes",
      "Renal Function Tests"
    ],
    "india_specific_notes": "Admission justified only if: DKA/HHS present, or precipitating illness present (infection, MI), or home insulin management clearly failed Document the reason for decompensation — infection, dietary non-compliance, missed doses Comorbid infections must be separately documented and coded",
    "severity_markers": [
      "FBS >400 mg/dL",
      "Urine ketones positive",
      "pH <7.3",
      "Bicarbonate <18",
      "Altered sensorium",
      "HbA1c >12%"
    ],
    "must_not_miss_flags": [
      "DKA",
      "Hyperosmolar hyperglycemic state (HHS)",
      "Hypoglycemia",
      "Sepsis precipitating hyperglycemia"
    ],
    "admission_justification_template": "Patient with known Type 2 diabetes presents with blood glucose {bsl} mg/dL with urine ketones {ketones}. {precipitating_factor}. HbA1c {hba1c}% indicating long-term poor control. IV insulin infusion and electrolyte correction required in monitored setting. Home insulin dose adjustment insufficient given current glycemic instability.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1089",
    "pmjay_package_rate": 5200,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 12000,
        "max": 35000
      },
      "privateRoom": {
        "min": 22000,
        "max": 65000
      },
      "icu": {
        "min": 50000,
        "max": 120000
      },
      "daycare": null
    },
    "code": "E11.65",
    "commonName": "Uncontrolled Type 2 Diabetes / Diabetic Hyperglycemia",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "commonTPAQueries": [
      "Was this a new diagnosis or known diabetic?",
      "What was the precipitating factor for decompensation?",
      "Provide HbA1c report",
      "Was DKA or HHS ruled out?",
      "Submit serial blood glucose charts"
    ],
    "mandatoryDocuments": [
      {
        "id": "serial_bsl",
        "name": "Serial Blood Sugar Log (minimum 4 readings/day)",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Glycemic instability not documented"
      },
      {
        "id": "hba1c",
        "name": "HbA1c",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Long-term control not assessed"
      },
      {
        "id": "urine_ketones",
        "name": "Urine Ketones / Urine R/M",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "DKA not ruled out"
      },
      {
        "id": "electrolytes_dm",
        "name": "Serum Electrolytes",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Metabolic status not documented"
      },
      {
        "id": "rft_dm",
        "name": "Renal Function Tests",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Diabetic nephropathy impact not assessed"
      }
    ]
  },
  {
    "id": "GENE-004",
    "specialty": "General Medicine",
    "subcategory": "Tropical Infections",
    "condition_name": "Typhoid / Enteric Fever",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "A01.00",
        "description": "Typhoid fever, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 7,
      "max": 14,
      "average": 10
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Widal test alone is insufficient — submit blood culture",
      "Provide day-wise fever chart",
      "Justify LOS beyond 7 days"
    ],
    "documentation_must_include": [
      "Widal Test Report",
      "Blood Culture (gold standard)",
      "Temperature Chart (daily step-ladder pattern)",
      "Liver Function Tests",
      "CBC (relative lymphocytosis / thrombocytopenia)"
    ],
    "india_specific_notes": "Blood culture is diagnostic gold standard — collect before starting antibiotics LOS typically 10-14 days — document clinical milestones for each day",
    "severity_markers": [
      "Platelet count <80,000",
      "Hepatomegaly",
      "Splenomegaly",
      "Intestinal perforation signs",
      "Altered sensorium"
    ],
    "must_not_miss_flags": [
      "Intestinal perforation",
      "Typhoid hepatitis",
      "Malaria co-infection",
      "Meningitis"
    ],
    "admission_justification_template": "Patient presents with 7-day history of step-ladder fever, relative bradycardia, and toxemia consistent with enteric fever. Widal test positive (O:{widal_o}, H:{widal_h}). Blood culture sent. TLC {tlc} with relative lymphocytosis. Platelet count {platelets}. IV antibiotics and close monitoring for complications (intestinal perforation, hepatitis, thrombocytopenia) required in inpatient setting.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1044",
    "pmjay_package_rate": 7200,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 20000,
        "max": 55000
      },
      "privateRoom": {
        "min": 35000,
        "max": 90000
      },
      "icu": {
        "min": 70000,
        "max": 150000
      },
      "daycare": null
    },
    "code": "A01.00",
    "commonName": "Typhoid / Enteric Fever",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 7,
      "max": 14,
      "average": 10
    },
    "commonTPAQueries": [
      "Widal test alone is insufficient — submit blood culture",
      "Provide day-wise fever chart",
      "Justify LOS beyond 7 days"
    ],
    "mandatoryDocuments": [
      {
        "id": "widal",
        "name": "Widal Test Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Serological evidence not provided"
      },
      {
        "id": "blood_culture_typhoid",
        "name": "Blood Culture (gold standard)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Bacteriological confirmation absent — Widal alone insufficient"
      },
      {
        "id": "fever_chart",
        "name": "Temperature Chart (daily step-ladder pattern)",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Classic fever pattern not documented"
      },
      {
        "id": "lft_typhoid",
        "name": "Liver Function Tests",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Hepatic involvement not assessed"
      },
      {
        "id": "cbc_typhoid",
        "name": "CBC (relative lymphocytosis / thrombocytopenia)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Hematological features not documented"
      }
    ]
  },
  {
    "id": "GENE-005",
    "specialty": "General Medicine",
    "subcategory": "Tropical Infections",
    "condition_name": "Dengue Fever",
    "common_aliases": [
      "dengue fever",
      "classical dengue",
      "dengue",
      "breakbone fever",
      "dengu",
      "dengue fever"
    ],
    "hinglish_terms": [
      "dengu bukhar",
      "haddi tod bukhar"
    ],
    "icd_codes": {
      "primary": {
        "code": "A90",
        "description": "Dengue fever [classical dengue]",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [
      "Platelet count < 50,000",
      "Bleeding manifestations"
    ],
    "medical_necessity_keywords": [
      "dengue",
      "dengue ns1",
      "platelets",
      "thrombocytopenia"
    ],
    "typical_los_days": {
      "min": 4,
      "max": 9,
      "average": 6
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "NS1 antigen or IgM ELISA confirmation required",
      "Provide twice-daily platelet count chart",
      "Submit dengue warning signs documentation",
      "Was platelet transfusion given? Provide indication and consent"
    ],
    "documentation_must_include": [
      "NS1 Antigen Test OR Dengue IgM ELISA",
      "Serial Platelet Count (minimum twice daily)",
      "CBC with Hematocrit",
      "Liver Function Tests (SGOT/SGPT)"
    ],
    "india_specific_notes": "Serial platelet counts are mandatory for TPA — missing these is #1 dengue claim rejection reason Document warning signs explicitly: abdominal pain, persistent vomiting, bleeding",
    "severity_markers": [
      "Platelet <20,000",
      "Hematocrit rise >20%",
      "Plasma leakage signs",
      "Bleeding manifestations",
      "Shock",
      "Hepatomegaly"
    ],
    "must_not_miss_flags": [
      "Dengue hemorrhagic fever",
      "Dengue shock syndrome",
      "Malaria co-infection",
      "Leptospirosis"
    ],
    "admission_justification_template": "Patient presents with acute febrile illness consistent with dengue fever confirmed by {dengue_test}. Platelet count {platelets} with declining trend. Dengue warning signs present: {warning_signs}. Serial platelet monitoring and IV fluid management required in inpatient setting to prevent dengue hemorrhagic fever and shock syndrome.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1046",
    "pmjay_package_rate": 6800,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 18000,
        "max": 50000
      },
      "privateRoom": {
        "min": 30000,
        "max": 85000
      },
      "icu": {
        "min": 65000,
        "max": 160000
      },
      "daycare": null
    },
    "code": "A90",
    "commonName": "Dengue Fever",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 4,
      "max": 9,
      "average": 6
    },
    "commonTPAQueries": [
      "NS1 antigen or IgM ELISA confirmation required",
      "Provide twice-daily platelet count chart",
      "Submit dengue warning signs documentation",
      "Was platelet transfusion given? Provide indication and consent"
    ],
    "mandatoryDocuments": [
      {
        "id": "ns1_dengue",
        "name": "NS1 Antigen Test OR Dengue IgM ELISA",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Dengue diagnosis not serologically confirmed"
      },
      {
        "id": "serial_platelets",
        "name": "Serial Platelet Count (minimum twice daily)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Thrombocytopenia trend not documented — transfusion indication unclear"
      },
      {
        "id": "cbc_dengue",
        "name": "CBC with Hematocrit",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Hemoconcentration not assessed"
      },
      {
        "id": "lft_dengue",
        "name": "Liver Function Tests (SGOT/SGPT)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Dengue hepatitis not evaluated"
      }
    ]
  },
  {
    "id": "GENE-006",
    "specialty": "General Medicine",
    "subcategory": "Tropical Infections",
    "condition_name": "Malaria",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "B54",
        "description": "Unspecified malaria",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 5
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Submit peripheral smear report (MP/PS)",
      "Malaria Rapid Diagnostic Test (RDT) result",
      "Was IV artesunate or quinine given?",
      "Daily temperature and parasite clearance chart"
    ],
    "documentation_must_include": [
      "Peripheral Smear for Malarial Parasite (MP/PS)",
      "Rapid Diagnostic Test (RDT) for Malaria",
      "CBC with Platelet Count",
      "Liver Function Tests"
    ],
    "india_specific_notes": "Cerebral malaria (Pf) is medical emergency — document GCS score Vividly document parasite density if high",
    "severity_markers": [
      "Parasitemia >2%",
      "Altered sensorium (Cerebral Malaria)",
      "Jaundice (TLC >20000)",
      "Platelet <50,000",
      "Creatinine >3.0",
      "Hb <7 g/dL"
    ],
    "must_not_miss_flags": [
      "Cerebral malaria",
      "Degue co-infection",
      "Blackwater fever"
    ],
    "admission_justification_template": "Patient presents with high-grade fever with chills and rigor. MP/PS confirms {malaria_species} malaria. {cerebral_malaria_flag}. Platelet count {platelets}, Hb {hb}. IV Artesunate therapy and monitoring for complications required in inpatient setting.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1045",
    "pmjay_package_rate": 6500,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 15000,
        "max": 40000
      },
      "privateRoom": {
        "min": 25000,
        "max": 70000
      },
      "icu": {
        "min": 50000,
        "max": 120000
      },
      "daycare": null
    },
    "code": "B54",
    "commonName": "Malaria",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 5
    },
    "commonTPAQueries": [
      "Submit peripheral smear report (MP/PS)",
      "Malaria Rapid Diagnostic Test (RDT) result",
      "Was IV artesunate or quinine given?",
      "Daily temperature and parasite clearance chart"
    ],
    "mandatoryDocuments": [
      {
        "id": "mp_ps",
        "name": "Peripheral Smear for Malarial Parasite (MP/PS)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Microscopic confirmation of malaria not provided"
      },
      {
        "id": "rdt_malaria",
        "name": "Rapid Diagnostic Test (RDT) for Malaria",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Rapid antigen record not provided"
      },
      {
        "id": "cbc_malaria",
        "name": "CBC with Platelet Count",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Anemia and thrombocytopenia not assessed"
      },
      {
        "id": "lft_malaria",
        "name": "Liver Function Tests",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Malarial hepatitis not evaluated"
      }
    ]
  },
  {
    "id": "GENE-007",
    "specialty": "General Medicine",
    "subcategory": "Urogenital Infections",
    "condition_name": "Urinary Tract Infection (UTI)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "N39.0",
        "description": "Urinary tract infection, site not specified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Urine R/M showing pus cells",
      "Urine culture and sensitivity report",
      "Was IV antibiotic required?",
      "RFT to rule out pyelonephritis"
    ],
    "documentation_must_include": [
      "Urine Routine and Microscopy",
      "Urine Culture and Sensitivity",
      "Renal Function Tests"
    ],
    "india_specific_notes": "Complicated UTI (diabetes, elderly, male, pregnancy) has stronger admission justification",
    "severity_markers": [
      "Fever >102F",
      "Rigor/Chills",
      "Flank pain",
      "Obstruction on USG",
      "Creatinine elevation"
    ],
    "must_not_miss_flags": [
      "Pyelonephritis",
      "Perinephric abscess",
      "Urosepsis"
    ],
    "admission_justification_template": "Patient presents with fever, dysuria, and flank pain. Urine R/M shows {pus_cells} pus cells. {urosepsis_flag}. Patient unable to tolerate oral antibiotics. Inpatient management with IV antibiotics and investigation of predisposing factor required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1065",
    "pmjay_package_rate": 4800,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 10000,
        "max": 30000
      },
      "privateRoom": {
        "min": 20000,
        "max": 55000
      },
      "icu": {
        "min": 45000,
        "max": 100000
      },
      "daycare": null
    },
    "code": "N39.0",
    "commonName": "Urinary Tract Infection (UTI)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "Urine R/M showing pus cells",
      "Urine culture and sensitivity report",
      "Was IV antibiotic required?",
      "RFT to rule out pyelonephritis"
    ],
    "mandatoryDocuments": [
      {
        "id": "urine_rm",
        "name": "Urine Routine and Microscopy",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Pus cells and bacteriuria not documented"
      },
      {
        "id": "urine_culture",
        "name": "Urine Culture and Sensitivity",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Organism identification and sensitivity not provided"
      },
      {
        "id": "rft_uti",
        "name": "Renal Function Tests",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Renal function status not assessed"
      }
    ]
  },
  {
    "id": "NEUR-008",
    "specialty": "Neurology",
    "subcategory": "Infectious Diseases",
    "condition_name": "Acute Meningitis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "G03.9",
        "description": "Meningitis, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 7,
      "max": 21,
      "average": 12
    },
    "expected_procedures": [
      "03.31"
    ],
    "tpa_query_triggers": [
      "CSF analysis report (biochemistry, cytology, culture)",
      "CT/MRI brain prior to LP",
      "Neurological status (GCS) trend",
      "Was IV dexamethasone given?"
    ],
    "documentation_must_include": [
      "CSF Analysis (Protein, Glucose, Cells, Gram Stain)",
      "CT Brain (Pre-Lumbar Puncture)",
      "CBC with Differential"
    ],
    "india_specific_notes": "Lumbar puncture (LP) is diagnostic — if not done, provide justification (e.g., raised ICP)",
    "severity_markers": [
      "GCS <10",
      "Seizures",
      "Cranial nerve palsy",
      "Papilledema",
      "Hypoglycorrhachia"
    ],
    "must_not_miss_flags": [
      "Brain abscess",
      "Tuberculous meningitis",
      "Encephalitis",
      "SAH"
    ],
    "admission_justification_template": "Patient presents with fever, headache, and neck stiffness. GCS {gcs}. CSF analysis shows {csf_cells} cells, glucose {csf_glucose}. {meningeal_signs}. Emergency IV antibiotics, steroids, and ICU monitoring required to prevent neurological sequelae.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "NS-1021",
    "pmjay_package_rate": 15000,
    "ward_type": "icu",
    "icu_probability": "high",
    "cost_estimate": {
      "generalWard": {
        "min": 50000,
        "max": 150000
      },
      "privateRoom": {
        "min": 80000,
        "max": 250000
      },
      "icu": {
        "min": 150000,
        "max": 500000
      },
      "daycare": null
    },
    "code": "G03.9",
    "commonName": "Acute Meningitis",
    "icuProbability": "high",
    "typicalLOS": {
      "min": 7,
      "max": 21,
      "average": 12
    },
    "commonTPAQueries": [
      "CSF analysis report (biochemistry, cytology, culture)",
      "CT/MRI brain prior to LP",
      "Neurological status (GCS) trend",
      "Was IV dexamethasone given?"
    ],
    "mandatoryDocuments": [
      {
        "id": "csf_analysis",
        "name": "CSF Analysis (Protein, Glucose, Cells, Gram Stain)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Gold standard diagnostic evidence absent"
      },
      {
        "id": "ct_brain_meningitis",
        "name": "CT Brain (Pre-Lumbar Puncture)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Safety clearane for LP not documented"
      },
      {
        "id": "cbc_meningitis",
        "name": "CBC with Differential",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GENE-009",
    "specialty": "General Medicine",
    "subcategory": "Systemic Infection",
    "condition_name": "Sepsis / Septicemia",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "A41.9",
        "description": "Sepsis, unspecified organism",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 5,
      "max": 15,
      "average": 10
    },
    "expected_procedures": [
      "99.18"
    ],
    "tpa_query_triggers": [
      "Submit SOFA/qSOFA score",
      "Serum lactate levels mandatory",
      "Primary source of infection evidence",
      "Vasopressor requirement and duration"
    ],
    "documentation_must_include": [
      "Serum Lactate Level",
      "Blood Cultures (two sets preferred)",
      "SOFA Score Documentation"
    ],
    "india_specific_notes": "Septic Shock is code red — document vasopressor doses and MAP hourly",
    "severity_markers": [
      "Lactate >2.0",
      "MAP <65",
      "Bilirubin >2.0",
      "Creatinine >2.0",
      "Platelet <100000",
      "PaO2/FiO2 <300"
    ],
    "must_not_miss_flags": [
      "Source of sepsis (Abscess, Perforation)",
      "Anaphylactic shock",
      "Endocrine crisis"
    ],
    "admission_justification_template": "Patient presents with SIRS criteria, altered mental status, and hypotension. qSOFA score {qsofa}. Serum lactate {lactate}. Primary source identified as {source}. {septic_shock_flag}. Emergency fluid resuscitation, IV broad-spectrum antibiotics, and ICU management required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1025",
    "pmjay_package_rate": 18000,
    "ward_type": "icu",
    "icu_probability": "high",
    "cost_estimate": {
      "generalWard": {
        "min": 60000,
        "max": 150000
      },
      "privateRoom": {
        "min": 100000,
        "max": 300000
      },
      "icu": {
        "min": 180000,
        "max": 600000
      },
      "daycare": null
    },
    "code": "A41.9",
    "commonName": "Sepsis / Septicemia",
    "icuProbability": "high",
    "typicalLOS": {
      "min": 5,
      "max": 15,
      "average": 10
    },
    "commonTPAQueries": [
      "Submit SOFA/qSOFA score",
      "Serum lactate levels mandatory",
      "Primary source of infection evidence",
      "Vasopressor requirement and duration"
    ],
    "mandatoryDocuments": [
      {
        "id": "serum_lactate",
        "name": "Serum Lactate Level",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Tissue hypoperfusion severity not documented"
      },
      {
        "id": "blood_culture_sepsis",
        "name": "Blood Cultures (two sets preferred)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Pathogen search not documented"
      },
      {
        "id": "sofa_score",
        "name": "SOFA Score Documentation",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Objective organ dysfunction not quantified"
      }
    ]
  },
  {
    "id": "GENE-010",
    "specialty": "General Medicine",
    "subcategory": "Hematology",
    "condition_name": "Severe Anemia / Blood Transfusion Required",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "D64.9",
        "description": "Anemia, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [
      "99.04"
    ],
    "tpa_query_triggers": [
      "Submit full blood count and Hb levels",
      "Indication for blood transfusion documentation",
      "Consent for transfusion",
      "Search for cause of anemia (Iron/B12/Bleed)"
    ],
    "documentation_must_include": [
      "CBC with Hb and Indices",
      "Blood Transfusion Consent",
      "Iron Profile / B12 level"
    ],
    "india_specific_notes": "Hb <7 is standard threshold for transfusion — document clinical compromise (breathlessness, pallor)",
    "severity_markers": [
      "Hb <7 g/dL",
      "Active bleeding",
      "Heart failure from anemia",
      "Pancytopenia"
    ],
    "must_not_miss_flags": [
      "Internal hemorrhage",
      "Hemolysis",
      "Malignancy"
    ],
    "admission_justification_template": "Patient presents with severe pallor and breathlessness. Hb {hb} g/dL. Indices show {indices}. {active_bleed_flag}. Indication for Packed Red Cell Transfusion met. Inpatient monitoring of transfusion and investigation for primary cause required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1121",
    "pmjay_package_rate": 4500,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 12000,
        "max": 35000
      },
      "privateRoom": {
        "min": 25000,
        "max": 65000
      },
      "icu": {
        "min": 50000,
        "max": 120000
      },
      "daycare": {
        "min": 8000,
        "max": 20000
      }
    },
    "code": "D64.9",
    "commonName": "Severe Anemia / Blood Transfusion Required",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "Submit full blood count and Hb levels",
      "Indication for blood transfusion documentation",
      "Consent for transfusion",
      "Search for cause of anemia (Iron/B12/Bleed)"
    ],
    "mandatoryDocuments": [
      {
        "id": "cbc_hb",
        "name": "CBC with Hb and Indices",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Severity of anemia not documented"
      },
      {
        "id": "bt_consent",
        "name": "Blood Transfusion Consent",
        "category": "clinical",
        "mandatory": true,
        "whenRequired": "if transfusion given",
        "tpaQueryIfMissing": ""
      },
      {
        "id": "iron_profile",
        "name": "Iron Profile / B12 level",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Etiology workup not performed"
      }
    ]
  },
  {
    "id": "GENE-011",
    "specialty": "General Medicine",
    "subcategory": "Nephrology",
    "condition_name": "Chronic Kidney Disease (CKD)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "N18.9",
        "description": "Chronic kidney disease, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "expected_procedures": [
      "39.95"
    ],
    "tpa_query_triggers": [
      "Known CKD stage with USG evidence",
      "Is dialysis required? Submit creatinine/potassium",
      "Primary cause workup (Diabetes/Hypertension)",
      "Was temporary catheter inserted?"
    ],
    "documentation_must_include": [
      "Renal Function Tests (Creatinine, Urea)",
      "USG KUB (CMD changes evidence)",
      "Serum Electrolytes (especially Potassium)"
    ],
    "india_specific_notes": "GFR calculation is preferred by TPAs for staging — document it",
    "severity_markers": [
      "Creatinine >8",
      "Potassium >6.5",
      "Fluid overload / Pulm Edema",
      "Uremic encephalopathy",
      "Stage 5 GFR <15"
    ],
    "must_not_miss_flags": [
      "Acute on Chronic Renal Failure",
      "Obstructive Uropathy",
      "Secondary Hyperparathyroidism"
    ],
    "admission_justification_template": "Patient with known CKD Stage {stage} presents with {acute_decompensation}. Creatinine {creatinine}, Potassium {potassium}. GFR {gfr}. {dialysis_indication}. Inpatient management with electrolyte correction, fluid optimization, and emergency hemodialysis required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1061",
    "pmjay_package_rate": 12000,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 20000,
        "max": 55000
      },
      "privateRoom": {
        "min": 35000,
        "max": 95000
      },
      "icu": {
        "min": 70000,
        "max": 180000
      },
      "daycare": {
        "min": 5000,
        "max": 12000
      }
    },
    "code": "N18.9",
    "commonName": "Chronic Kidney Disease (CKD)",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "commonTPAQueries": [
      "Known CKD stage with USG evidence",
      "Is dialysis required? Submit creatinine/potassium",
      "Primary cause workup (Diabetes/Hypertension)",
      "Was temporary catheter inserted?"
    ],
    "mandatoryDocuments": [
      {
        "id": "rft_ckd",
        "name": "Renal Function Tests (Creatinine, Urea)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Renal failure severity not documented"
      },
      {
        "id": "usg_ckd",
        "name": "USG KUB (CMD changes evidence)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Chronic nature not radiologically corroborated"
      },
      {
        "id": "electrolytes_ckd",
        "name": "Serum Electrolytes (especially Potassium)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GAST-012",
    "specialty": "Gastroenterology",
    "subcategory": "Hepatology",
    "condition_name": "Liver Cirrhosis / Chronic Liver Disease",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K74.6",
        "description": "Other and unspecified cirrhosis of liver",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 4,
      "max": 10,
      "average": 7
    },
    "expected_procedures": [
      "42.33",
      "54.91"
    ],
    "tpa_query_triggers": [
      "Child-Pugh score or MELD score",
      "Submit USG/CT evidence of cirrhosis",
      "Evidence of portal hypertension (Varices/Ascites)",
      "Evidence of hepatic encephalopathy"
    ],
    "documentation_must_include": [
      "Liver Function Tests (Albumin, Bilirubin, INR)",
      "USG Abdomen (Liver morphology, Portal vein)",
      "Ascitic Fluid Analysis (if tap done)"
    ],
    "india_specific_notes": "Document Child-Pugh Score (A/B/C) to justify admission",
    "severity_markers": [
      "INR >1.7",
      "Bilirubin >3.0",
      "Albumin <2.5",
      "Hematemesis",
      "Encephalopathy Grade II-IV",
      "SBP suspicion"
    ],
    "must_not_miss_flags": [
      "HCC (Hepatocellular Carcinoma)",
      "Hepatorenal syndrome",
      "Variceal bleed"
    ],
    "admission_justification_template": "Patient with known cirrhosis presents with {decompensation_type}. Child-Pugh Score {score} (Class {class}). Bilirubin {bil}, Albumin {alb}, INR {inr}. {ascites_flag}. Management of decompensated liver disease, including IV antibiotics for SBP / encephalopathy management required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1051",
    "pmjay_package_rate": 11000,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 25000,
        "max": 65000
      },
      "privateRoom": {
        "min": 45000,
        "max": 120000
      },
      "icu": {
        "min": 90000,
        "max": 250000
      },
      "daycare": null
    },
    "code": "K74.6",
    "commonName": "Liver Cirrhosis / Chronic Liver Disease",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 4,
      "max": 10,
      "average": 7
    },
    "commonTPAQueries": [
      "Child-Pugh score or MELD score",
      "Submit USG/CT evidence of cirrhosis",
      "Evidence of portal hypertension (Varices/Ascites)",
      "Evidence of hepatic encephalopathy"
    ],
    "mandatoryDocuments": [
      {
        "id": "lft_cirrhosis",
        "name": "Liver Function Tests (Albumin, Bilirubin, INR)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Liver synthetic function not assessed"
      },
      {
        "id": "usg_liver",
        "name": "USG Abdomen (Liver morphology, Portal vein)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Cirrhosis not radiologically documented"
      },
      {
        "id": "ascitic_tap",
        "name": "Ascitic Fluid Analysis (if tap done)",
        "category": "investigation",
        "mandatory": false,
        "whenRequired": "if ascitic tap done",
        "tpaQueryIfMissing": "Spontaneous bacterial peritonitis not ruled out"
      }
    ]
  },
  {
    "id": "GENE-013",
    "specialty": "General Medicine",
    "subcategory": "Endocrinology",
    "condition_name": "Severe Hypothyroidism / Myxedema",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "E03.9",
        "description": "Hypothyroidism, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "TSH and Free T4 levels mandatory",
      "Clinical symptoms (Altered sensorium/Hypothermia)",
      "Why was OPD dose escalation not feasible?"
    ],
    "documentation_must_include": [
      "Thyroid Function Tests (fT4, TSH)"
    ],
    "india_specific_notes": "Myxedema Coma is extremely rare but high severity — document vitals carefully",
    "severity_markers": [
      "TSH >100",
      "Free T4 undetectable",
      "Altered sensorium",
      "Bradycardia <50",
      "Hypothermia",
      "Myxedema coma"
    ],
    "must_not_miss_flags": [
      "Pituitary disease",
      "Hashimoto encephalopathy",
      "Adrenal insufficiency co-existence"
    ],
    "admission_justification_template": "Patient presents with severe lethargy, bradycardia, and {symptoms}. TSH {tsh}, fT4 {ft4}. {severely_hypothyroid_flag}. Inpatient monitoring for thyroxine replacement and management of precipitating factor required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1081",
    "pmjay_package_rate": 3500,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 8000,
        "max": 20000
      },
      "privateRoom": {
        "min": 15000,
        "max": 40000
      },
      "icu": {
        "min": 40000,
        "max": 90000
      },
      "daycare": null
    },
    "code": "E03.9",
    "commonName": "Severe Hypothyroidism / Myxedema",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "TSH and Free T4 levels mandatory",
      "Clinical symptoms (Altered sensorium/Hypothermia)",
      "Why was OPD dose escalation not feasible?"
    ],
    "mandatoryDocuments": [
      {
        "id": "tft_results",
        "name": "Thyroid Function Tests (fT4, TSH)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Biochemical evidence of thyroid state absent"
      }
    ]
  },
  {
    "id": "GENE-014",
    "specialty": "General Medicine",
    "subcategory": "Tropical Infections",
    "condition_name": "Leptospirosis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "A27.9",
        "description": "Leptospirosis, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 4,
      "max": 10,
      "average": 6
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Leptospira IgM ELISA or MAT report",
      "Daily RFT trend (Creatinine/Urea)",
      "Clinical symptoms (Conjunctival suffusion/Muscle pain)",
      "Was IV penicillin or ceftriaxone given?"
    ],
    "documentation_must_include": [
      "Leptospira IgM ELISA",
      "Renal Function Tests",
      "Liver Function Tests"
    ],
    "india_specific_notes": "Weil's syndrome (Triad of Jaundice, Renal Failure, Hemorrhage) is a high-severity indicator",
    "severity_markers": [
      "Creatinine >3.0",
      "Bilirubin >5.0 (Weil's disease)",
      "Pulmonary hemorrhage",
      "Platelet <50000",
      "Oliguria"
    ],
    "must_not_miss_flags": [
      "Dengue",
      "Hantavirus",
      "Hepatitis E",
      "Sepsis"
    ],
    "admission_justification_template": "Patient presents with high-grade fever, muscle pain, and conjunctival suffusion. Leptospira IgM is {igm_status}. {weils_flag}. Creatinine {creatinine}, Bilirubin {bilirubin}. Inpatient management with IV antibiotics and monitoring for renal/pulmonary complications required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1049",
    "pmjay_package_rate": 8500,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 20000,
        "max": 50000
      },
      "privateRoom": {
        "min": 35000,
        "max": 80000
      },
      "icu": {
        "min": 70000,
        "max": 180000
      },
      "daycare": null
    },
    "code": "A27.9",
    "commonName": "Leptospirosis",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 4,
      "max": 10,
      "average": 6
    },
    "commonTPAQueries": [
      "Leptospira IgM ELISA or MAT report",
      "Daily RFT trend (Creatinine/Urea)",
      "Clinical symptoms (Conjunctival suffusion/Muscle pain)",
      "Was IV penicillin or ceftriaxone given?"
    ],
    "mandatoryDocuments": [
      {
        "id": "lepto_igm",
        "name": "Leptospira IgM ELISA",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Serological confirmation of leptospirosis not provided"
      },
      {
        "id": "rft_lepto",
        "name": "Renal Function Tests",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Renal impairment not documented"
      },
      {
        "id": "lft_lepto",
        "name": "Liver Function Tests",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Liver involvement not assessed"
      }
    ]
  },
  {
    "id": "GENE-015",
    "specialty": "General Medicine",
    "subcategory": "Tropical Infections",
    "condition_name": "Scrub Typhus",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "A75.3",
        "description": "Typhus fever due to Rickettsia tsutsugamushi",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 4,
      "max": 8,
      "average": 5
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Scrub Typhus IgM report",
      "Presence of Eschar",
      "Evidence of multi-organ involvement",
      "Was IV Doxycycline or Azithromycin started?"
    ],
    "documentation_must_include": [
      "Scrub Typhus IgM ELISA",
      "CBC with Platelet Count",
      "Liver Function Tests"
    ],
    "india_specific_notes": "Detection of Eschar is nearly diagnostic — document its location (axilla, groin)",
    "severity_markers": [
      "ARDS / Pulse oximetry <90%",
      "Encephalopathy",
      "Creatinine >2.0",
      "SGOT/SGPT >500",
      "Platelet <50000"
    ],
    "must_not_miss_flags": [
      "Dengue",
      "Leptospirosis",
      "Malaria"
    ],
    "admission_justification_template": "Patient presents with high-grade fever, headache, and {eschar_present}. Scrub Typhus IgM is {igm_status}. {organ_involvement}. {hypoxia_flag}. IV antibiotics and inpatient monitoring for multi-organ dysfunction syndrome required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1050",
    "pmjay_package_rate": 7500,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 18000,
        "max": 45000
      },
      "privateRoom": {
        "min": 30000,
        "max": 75000
      },
      "icu": {
        "min": 65000,
        "max": 150000
      },
      "daycare": null
    },
    "code": "A75.3",
    "commonName": "Scrub Typhus",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 4,
      "max": 8,
      "average": 5
    },
    "commonTPAQueries": [
      "Scrub Typhus IgM report",
      "Presence of Eschar",
      "Evidence of multi-organ involvement",
      "Was IV Doxycycline or Azithromycin started?"
    ],
    "mandatoryDocuments": [
      {
        "id": "scrub_igm",
        "name": "Scrub Typhus IgM ELISA",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Serological evidence of scrub typhus not provided"
      },
      {
        "id": "cbc_scrub",
        "name": "CBC with Platelet Count",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "lft_scrub",
        "name": "Liver Function Tests",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GENE-016",
    "specialty": "General Medicine",
    "subcategory": "Hepatology",
    "condition_name": "Acute Viral Hepatitis A",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "B15.9",
        "description": "Hepatitis A without hepatic coma",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Hepatitis A IgM (HAV IgM) report",
      "Bilirubin level and trend",
      "Evidence of coagulopathy (INR)",
      "Able to tolerate oral feeds?"
    ],
    "documentation_must_include": [
      "HAV IgM ELISA",
      "LFT with Bilirubin fractions",
      "PT/INR"
    ],
    "india_specific_notes": "Inability to tolerate oral feeds is the primary justification for admission in mild cases",
    "severity_markers": [
      "INR >1.5",
      "Bilirubin >10",
      "Vomiting / Unable to eat",
      "Altered sensorium"
    ],
    "must_not_miss_flags": [
      "Fulminant hepatic failure",
      "Hepatitis E co-infection",
      "Drug-induced Liver Injury"
    ],
    "admission_justification_template": "Patient presents with jaundice, vomiting, and extreme weakness. HAV IgM is {igm_status}. Bilirubin {bil}, INR {inr}. {vomiting_status}. Inpatient management with IV fluids, supportive care, and monitoring for hepatic failure required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1053",
    "pmjay_package_rate": 5000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 12000,
        "max": 30000
      },
      "privateRoom": {
        "min": 20000,
        "max": 50000
      },
      "icu": {
        "min": 50000,
        "max": 120000
      },
      "daycare": null
    },
    "code": "B15.9",
    "commonName": "Acute Viral Hepatitis A",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "commonTPAQueries": [
      "Hepatitis A IgM (HAV IgM) report",
      "Bilirubin level and trend",
      "Evidence of coagulopathy (INR)",
      "Able to tolerate oral feeds?"
    ],
    "mandatoryDocuments": [
      {
        "id": "hav_igm",
        "name": "HAV IgM ELISA",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Etiological confirmation not provided"
      },
      {
        "id": "lft_hav",
        "name": "LFT with Bilirubin fractions",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Severity of hepatitis not documented"
      },
      {
        "id": "inr_hav",
        "name": "PT/INR",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Coagulopathy not assessed"
      }
    ]
  },
  {
    "id": "GAST-017",
    "specialty": "Gastroenterology",
    "subcategory": "Upper GI",
    "condition_name": "Peptic Ulcer Disease (PUD)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K27.9",
        "description": "Peptic ulcer, site unspecified, unspecified as acute or chronic, without hemorrhage or perforation",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [
      "44.13"
    ],
    "tpa_query_triggers": [
      "Upper GI Endoscopy report",
      "Evidence of H. pylori infection",
      "Was IV PPI required?"
    ],
    "documentation_must_include": [
      "Upper GI Endoscopy (UGIE) Report",
      "H. pylori Test (RUT / Stal Ag)"
    ],
    "india_specific_notes": "Document failed response to oral PPIs to justify admission for IV therapy",
    "severity_markers": [
      "Severe pain unresponsive to OPD meds",
      "Recent hematemesis",
      "Unable to eat",
      "Large ulcer >2cm"
    ],
    "must_not_miss_flags": [
      "Gastric malignancy",
      "Perforated Viscus",
      "Myocardial Infarction"
    ],
    "admission_justification_template": "Patient presents with severe epigastric pain and {vomiting}. UGIE confirms {ulcer_site} ulcer, Forrest Grade {grade}. {h_pylori_status}. Inpatient management with IV PPIs and monitoring for complications required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "GS-1011",
    "pmjay_package_rate": 6000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 15000,
        "max": 35000
      },
      "privateRoom": {
        "min": 25000,
        "max": 60000
      },
      "icu": {
        "min": 50000,
        "max": 120000
      },
      "daycare": {
        "min": 8000,
        "max": 15000
      }
    },
    "code": "K27.9",
    "commonName": "Peptic Ulcer Disease (PUD)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "Upper GI Endoscopy report",
      "Evidence of H. pylori infection",
      "Was IV PPI required?"
    ],
    "mandatoryDocuments": [
      {
        "id": "ugie_report",
        "name": "Upper GI Endoscopy (UGIE) Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Visual confirmation of ulcer not provided"
      },
      {
        "id": "h_pylori",
        "name": "H. pylori Test (RUT / Stal Ag)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Etiology investigation not documented"
      }
    ]
  },
  {
    "id": "GENE-018",
    "specialty": "General Medicine",
    "subcategory": "Nephrology",
    "condition_name": "Acute Kidney Injury (AKI)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "N17.9",
        "description": "Acute kidney failure, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 10,
      "average": 5
    },
    "expected_procedures": [
      "39.95"
    ],
    "tpa_query_triggers": [
      "Creatinine trend (Baseline vs Admission)",
      "Precipitating factor (Dehydration/Drugs/Infection)",
      "Daily urine output chart",
      "Is dialysis required?"
    ],
    "documentation_must_include": [
      "Serial Renal Function Tests",
      "Hourly / Daily Intake-Output Chart",
      "USG KUB (to rule out obstruction)"
    ],
    "india_specific_notes": "Document the AKI stage (KDIGO 1/2/3) explicitly",
    "severity_markers": [
      "Creatinine increase >3x baseline",
      "Potassium >6.0",
      "Urine output <0.5ml/kg/h for 12h",
      "Uremic symptoms",
      "Pulm Edema"
    ],
    "must_not_miss_flags": [
      "Rapidly progressive GN",
      "Obstructive Uropathy",
      "Ethylene glycol poisoning"
    ],
    "admission_justification_template": "Patient presents with oliguria and {precipitating_event}. Creatinine risen from {baseline} to {admission}. KDIGO Stage {stage}. {potassium_flag}. USG shows {usg_findings}. Inpatient fluid management, metabolic correction, and monitoring for dialysis requirement required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1062",
    "pmjay_package_rate": 10000,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 18000,
        "max": 45000
      },
      "privateRoom": {
        "min": 30000,
        "max": 80000
      },
      "icu": {
        "min": 60000,
        "max": 150000
      },
      "daycare": null
    },
    "code": "N17.9",
    "commonName": "Acute Kidney Injury (AKI)",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 3,
      "max": 10,
      "average": 5
    },
    "commonTPAQueries": [
      "Creatinine trend (Baseline vs Admission)",
      "Precipitating factor (Dehydration/Drugs/Infection)",
      "Daily urine output chart",
      "Is dialysis required?"
    ],
    "mandatoryDocuments": [
      {
        "id": "rft_aki",
        "name": "Serial Renal Function Tests",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Creatinine trend not documented"
      },
      {
        "id": "io_aki",
        "name": "Hourly / Daily Intake-Output Chart",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Oliguria not documented"
      },
      {
        "id": "usg_aki",
        "name": "USG KUB (to rule out obstruction)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Post-renal cause not excluded"
      }
    ]
  },
  {
    "id": "GENE-019",
    "specialty": "General Medicine",
    "subcategory": "Metabolic",
    "condition_name": "Hyponatremia / Low Sodium",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "E87.1",
        "description": "Hypo-osmolality and hyponatremia",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 6,
      "average": 4
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Sodium levels at admission and trend",
      "Symptoms (Confusion/Seizures/Vomiting)",
      "Etiology (SIADH/Dehydration/Drugs)",
      "Urine sodium and osmolality"
    ],
    "documentation_must_include": [
      "Serial Serum Sodium Levels",
      "Urine Sodium and Osmolality"
    ],
    "india_specific_notes": "Warning: Central Pontine Myelinolysis risk — document correction rate carefully (<8-10 mEq/24h)",
    "severity_markers": [
      "Sodium <120",
      "Seizures",
      "Altered Sensorium",
      "Severe vomiting"
    ],
    "must_not_miss_flags": [
      "Adrenal insufficiency",
      "SIADH from malignancy",
      "Hypothyroidism"
    ],
    "admission_justification_template": "Patient presents with {symptoms}. Serum sodium {na} mEq/L. {seizure_flag}. Urine Na {u_na}. Inpatient management with controlled salt correction, etiology workup, and neurological monitoring required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1087",
    "pmjay_package_rate": 4000,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 12000,
        "max": 35000
      },
      "privateRoom": {
        "min": 22000,
        "max": 60000
      },
      "icu": {
        "min": 50000,
        "max": 130000
      },
      "daycare": null
    },
    "code": "E87.1",
    "commonName": "Hyponatremia / Low Sodium",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 2,
      "max": 6,
      "average": 4
    },
    "commonTPAQueries": [
      "Sodium levels at admission and trend",
      "Symptoms (Confusion/Seizures/Vomiting)",
      "Etiology (SIADH/Dehydration/Drugs)",
      "Urine sodium and osmolality"
    ],
    "mandatoryDocuments": [
      {
        "id": "serial_na",
        "name": "Serial Serum Sodium Levels",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Correction rate and safety not documented"
      },
      {
        "id": "urine_na",
        "name": "Urine Sodium and Osmolality",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Etiological workup not provided"
      }
    ]
  },
  {
    "id": "GENE-020",
    "specialty": "General Medicine",
    "subcategory": "Endocrinology",
    "condition_name": "Hyperthyroidism / Thyroid Storm",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "E05.9",
        "description": "Thyrotoxicosis, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 7,
      "average": 4
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "TSH and free T4 reports",
      "Tachycardia / Arrhythmia (ECG)",
      "Was thyroid storm score calculated?"
    ],
    "documentation_must_include": [
      "Thyroid Function Tests (fT4, TSH)",
      "ECG (to check for AF/Tachycardia)"
    ],
    "india_specific_notes": "Thyroid storm is a clinical emergency — use Burch-Wartofsky score to justify ICU",
    "severity_markers": [
      "Burch-Wartofsky score >45",
      "Atrial fibrillation",
      "High fever >103F",
      "Congestive Heart Failure"
    ],
    "must_not_miss_flags": [
      "Amiodarone induced thyrotoxicosis",
      "Graves disease",
      "Toxic multinodular goiter"
    ],
    "admission_justification_template": "Patient presents with severe palpitations, tremors, and {jaundice_fever}. TSH {tsh}, fT4 {ft4}. ECG shows {arrhythmia_status}. Burch-Wartofsky score {score}. Inpatient stabilization, rate control, and monitoring for thyroid storm required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1082",
    "pmjay_package_rate": 4200,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 15000,
        "max": 40000
      },
      "privateRoom": {
        "min": 25000,
        "max": 75000
      },
      "icu": {
        "min": 60000,
        "max": 150000
      },
      "daycare": null
    },
    "code": "E05.9",
    "commonName": "Hyperthyroidism / Thyroid Storm",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 7,
      "average": 4
    },
    "commonTPAQueries": [
      "TSH and free T4 reports",
      "Tachycardia / Arrhythmia (ECG)",
      "Was thyroid storm score calculated?"
    ],
    "mandatoryDocuments": [
      {
        "id": "tft_hyper",
        "name": "Thyroid Function Tests (fT4, TSH)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "ecg_hyper",
        "name": "ECG (to check for AF/Tachycardia)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GENE-021",
    "specialty": "General Medicine",
    "subcategory": "Rheumatology",
    "condition_name": "Rheumatoid Arthritis (Acute Flare)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "M06.9",
        "description": "Rheumatoid arthritis, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "RA Factor and Anti-CCP reports",
      "ESR/CRP to document active inflammation",
      "Was IV steroid / biologic required?",
      "Joint involvement details"
    ],
    "documentation_must_include": [
      "RA Factor + Anti-CCP",
      "CRP and ESR"
    ],
    "india_specific_notes": "Admission justified by \"Acute Flare with inability to perform daily activities\"",
    "severity_markers": [
      "Severe polyarthritis with functional loss",
      "Systemic involvement (Lung/Vasculitis)",
      "Uncontrolled pain on oral meds"
    ],
    "must_not_miss_flags": [
      "Septic arthritis",
      "Fibromyalgia",
      "Gout"
    ],
    "admission_justification_template": "Patient presents with acute flare of Rheumatoid Arthritis with {joint_count} joints involved. Anti-CCP {ccp}, CRP {crp}. Patient unable to mobilize/perform ADLs. Inpatient management with IV pulse therapy, pain management, and stabilization required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1101",
    "pmjay_package_rate": 11000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 15000,
        "max": 45000
      },
      "privateRoom": {
        "min": 25000,
        "max": 75000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 10000,
        "max": 25000
      }
    },
    "code": "M06.9",
    "commonName": "Rheumatoid Arthritis (Acute Flare)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "commonTPAQueries": [
      "RA Factor and Anti-CCP reports",
      "ESR/CRP to document active inflammation",
      "Was IV steroid / biologic required?",
      "Joint involvement details"
    ],
    "mandatoryDocuments": [
      {
        "id": "ra_anti_ccp",
        "name": "RA Factor + Anti-CCP",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Diagnostic confirmation of RA absent"
      },
      {
        "id": "crp_ra",
        "name": "CRP and ESR",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Disease activity not documented"
      }
    ]
  },
  {
    "id": "GENE-022",
    "specialty": "General Medicine",
    "subcategory": "Rheumatology",
    "condition_name": "Systemic Lupus Erythematosus (SLE / Lupus)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "M32.9",
        "description": "Systemic lupus erythematosus, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 4,
      "max": 12,
      "average": 7
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "ANA and Anti-dsDNA reports",
      "Evidence of organ involvement (Renal/Lung)",
      "Was IV pulse steroid required?"
    ],
    "documentation_must_include": [
      "ANA (IF method) and Anti-dsDNA",
      "C3 and C4 Levels"
    ],
    "india_specific_notes": "Lupus flare with organ involvement highly justifies ICU admission",
    "severity_markers": [
      "Lupus Nephritis",
      "Cerebritis",
      "Hemolytic Anemia",
      "Pulmonary Hemorrhage"
    ],
    "must_not_miss_flags": [
      "Infection mimicking lupus flare",
      "TMA",
      "Drug induced lupus"
    ],
    "admission_justification_template": "Patient presents with acute SLE flare involving {organs}. Anti-dsDNA {dsdna}, C3 {c3}, C4 {c4}. {renal_involvement_flag}. Inpatient management with IV pulse steroids, immunosuppression titration, and monitoring for organ failure required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1102",
    "pmjay_package_rate": 15000,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 25000,
        "max": 70000
      },
      "privateRoom": {
        "min": 45000,
        "max": 130000
      },
      "icu": {
        "min": 90000,
        "max": 250000
      },
      "daycare": null
    },
    "code": "M32.9",
    "commonName": "Systemic Lupus Erythematosus (SLE / Lupus)",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 4,
      "max": 12,
      "average": 7
    },
    "commonTPAQueries": [
      "ANA and Anti-dsDNA reports",
      "Evidence of organ involvement (Renal/Lung)",
      "Was IV pulse steroid required?"
    ],
    "mandatoryDocuments": [
      {
        "id": "ana_dsdna",
        "name": "ANA (IF method) and Anti-dsDNA",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Serological confirmation of SLE absent"
      },
      {
        "id": "complement_levels",
        "name": "C3 and C4 Levels",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Disease activity markers not provided"
      }
    ]
  },
  {
    "id": "GENE-023",
    "specialty": "General Medicine",
    "subcategory": "Rheumatology",
    "condition_name": "Sjogren Syndrome",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "M35.0",
        "description": "Sicca syndrome [Sjogren]",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Anti-Ro/SSA and Anti-La/SSB reports",
      "Schirmer test result",
      "Evidence of extraglandular involvement"
    ],
    "documentation_must_include": [
      "Anti-Ro (SSA) and Anti-La (SSB)"
    ],
    "india_specific_notes": "Most Sjogrens patients are OPD — admission only for severe systemic flare",
    "severity_markers": [
      "Vasculitis",
      "Interstitial Lung Disease",
      "Lymphoma secondary to Sjogrens"
    ],
    "must_not_miss_flags": [
      "Lymphoma",
      "RA association",
      "SLE association"
    ],
    "admission_justification_template": "Patient presents with severe sicca symptoms and {extraglandular_symptoms}. SSA {ssa}, SSB {ssb}. Inpatient workup and management of systemic manifestations required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1103",
    "pmjay_package_rate": 8000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 10000,
        "max": 25000
      },
      "privateRoom": {
        "min": 18000,
        "max": 45000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 5000,
        "max": 12000
      }
    },
    "code": "M35.0",
    "commonName": "Sjogren Syndrome",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "Anti-Ro/SSA and Anti-La/SSB reports",
      "Schirmer test result",
      "Evidence of extraglandular involvement"
    ],
    "mandatoryDocuments": [
      {
        "id": "ssa_ssb",
        "name": "Anti-Ro (SSA) and Anti-La (SSB)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GENE-024",
    "specialty": "General Medicine",
    "subcategory": "Metabolic Bone",
    "condition_name": "Severe Osteoporosis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "M81.0",
        "description": "Age-related osteoporosis without current pathological fracture",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "DEXA Scan report with T-score",
      "Was IV Zoledronic acid / Denosumab given?",
      "Previous fracture history"
    ],
    "documentation_must_include": [
      "DEXA Scan Report (Spine & Hip)"
    ],
    "india_specific_notes": "IV Bisphosphonate administration is usually a Daycare procedure",
    "severity_markers": [
      "T-score < -3.5",
      "Multiple fragility fractures",
      "Failure of oral bisphosphonates"
    ],
    "must_not_miss_flags": [
      "Multiple Myeloma",
      "Hyperparathyroidism",
      "Malabsorption"
    ],
    "admission_justification_template": "Patient with severe osteoporosis (T-score {tscore}) and {fracture_history}. Inpatient / Daycare admission for IV bisphosphonate therapy and metabolic workup required.",
    "pmjay_eligible": false,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 8000,
        "max": 20000
      },
      "privateRoom": {
        "min": 15000,
        "max": 35000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 10000,
        "max": 25000
      }
    },
    "code": "M81.0",
    "commonName": "Severe Osteoporosis",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "commonTPAQueries": [
      "DEXA Scan report with T-score",
      "Was IV Zoledronic acid / Denosumab given?",
      "Previous fracture history"
    ],
    "mandatoryDocuments": [
      {
        "id": "dexa_report",
        "name": "DEXA Scan Report (Spine & Hip)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "T-score evidence absent"
      }
    ]
  },
  {
    "id": "GENE-025",
    "specialty": "General Medicine",
    "subcategory": "Nutritional",
    "condition_name": "Vitamin B12 Deficiency",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "E53.8",
        "description": "Deficiency of other specified B group vitamins",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Serum B12 level",
      "Clinical symptoms (Neuropathy/Anemia)",
      "Why was oral therapy insufficient?"
    ],
    "documentation_must_include": [
      "Serum Vitamin B12 level"
    ],
    "india_specific_notes": "Neurological involvement strongly justifies IV / IM replacement under monitoring",
    "severity_markers": [
      "Subacute Combined Degeneration of Cord",
      "Megaloblastic Anemia (Hb <7)",
      "Pancytopenia"
    ],
    "must_not_miss_flags": [
      "Pernicious Anemia",
      "Gastric Atrophy",
      "Celiac Disease"
    ],
    "admission_justification_template": "Patient presents with {neuropathy_symptoms} and severe B12 deficiency (Level {level} pg/mL). Inpatient monitoring for intensive replacement and neurological assessment required.",
    "pmjay_eligible": false,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 5000,
        "max": 12000
      },
      "privateRoom": {
        "min": 10000,
        "max": 25000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 3000,
        "max": 8000
      }
    },
    "code": "E53.8",
    "commonName": "Vitamin B12 Deficiency",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "commonTPAQueries": [
      "Serum B12 level",
      "Clinical symptoms (Neuropathy/Anemia)",
      "Why was oral therapy insufficient?"
    ],
    "mandatoryDocuments": [
      {
        "id": "b12_level",
        "name": "Serum Vitamin B12 level",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GENE-026",
    "specialty": "General Medicine",
    "subcategory": "Nutritional",
    "condition_name": "Severe Vitamin D Deficiency",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "E55.9",
        "description": "Vitamin D deficiency, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 2,
      "average": 1
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Serum 25-OH Vitamin D level",
      "Associated Calcium imbalance"
    ],
    "documentation_must_include": [
      "Serum Vitamin D level"
    ],
    "india_specific_notes": "Admission only if severe bone pain or tetany present",
    "severity_markers": [
      "Hypocalcemic tetany",
      "Osteomalacia",
      "Levels <5 ng/mL"
    ],
    "must_not_miss_flags": [
      "Hyperparathyroidism",
      "Malabsorption",
      "Renal disease"
    ],
    "admission_justification_template": "Patient presents with {symptoms} associated with severe Vitamin D deficiency (Level {level} ng/mL). Inpatient stabilization and high-dose replacement required.",
    "pmjay_eligible": false,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 3000,
        "max": 8000
      },
      "privateRoom": {
        "min": 6000,
        "max": 15000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 2000,
        "max": 5000
      }
    },
    "code": "E55.9",
    "commonName": "Severe Vitamin D Deficiency",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 2,
      "average": 1
    },
    "commonTPAQueries": [
      "Serum 25-OH Vitamin D level",
      "Associated Calcium imbalance"
    ],
    "mandatoryDocuments": [
      {
        "id": "vitd_level",
        "name": "Serum Vitamin D level",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GENE-027",
    "specialty": "General Medicine",
    "subcategory": "Electrolyte Imbalance",
    "condition_name": "Hypokalemia / Low Potassium",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "E87.6",
        "description": "Hypokalemia",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Potassium levels at admission and trend",
      "ECG changes (U-waves/T-wave flattening)",
      "Etiology (Diuretics/Vomiting)"
    ],
    "documentation_must_include": [
      "Serial Serum Potassium Levels",
      "ECG showing hypokalemic changes"
    ],
    "india_specific_notes": "Severe hypokalemia requires central line IV correction — justifies ICU",
    "severity_markers": [
      "Potassium <2.5",
      "Muscle paralysis",
      "Arrhythmias",
      "T-wave inversion / U-waves"
    ],
    "must_not_miss_flags": [
      "Periodic Paralysis",
      "Hyperaldosteronism",
      "Hypomagnesemia association"
    ],
    "admission_justification_template": "Patient presents with muscle weakness and palpitations. Serum potassium {k} mEq/L. ECG shows {ecg_changes}. {paralysis_flag}. Inpatient management with controlled IV potassium replacement and cardiac monitoring required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1088",
    "pmjay_package_rate": 3800,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 12000,
        "max": 35000
      },
      "privateRoom": {
        "min": 22000,
        "max": 55000
      },
      "icu": {
        "min": 50000,
        "max": 120000
      },
      "daycare": null
    },
    "code": "E87.6",
    "commonName": "Hypokalemia / Low Potassium",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "Potassium levels at admission and trend",
      "ECG changes (U-waves/T-wave flattening)",
      "Etiology (Diuretics/Vomiting)"
    ],
    "mandatoryDocuments": [
      {
        "id": "serial_k",
        "name": "Serial Serum Potassium Levels",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "ecg_k",
        "name": "ECG showing hypokalemic changes",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GENE-028",
    "specialty": "General Medicine",
    "subcategory": "Electrolyte Imbalance",
    "condition_name": "Hyperkalemia / High Potassium",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "E87.5",
        "description": "Hyperkalemia",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Potassium level and ECG changes",
      "Renal status (CKD/AKI)",
      "Was dialysis required for correction?"
    ],
    "documentation_must_include": [
      "Serial Potassium Levels",
      "ECG showing peaked T-waves"
    ],
    "india_specific_notes": "Hyperkalemia is or \"Potassium >6.5\" is a medical emergency requiring ICU",
    "severity_markers": [
      "Potassium >6.5",
      "Peaked T-waves / Wide QRS",
      "Brdycardia",
      "Muscle weakness"
    ],
    "must_not_miss_flags": [
      "Crush injury (Rhabdomyolysis)",
      "Tumor Lysis Syndrome",
      "Adrenal Crisis"
    ],
    "admission_justification_template": "Patient presents with ECG abnormalities and elevated potassium (Level {k} mEq/L). {renal_status}. {ecg_finding}. Emergency insulin-dextrose, calcium gluconate, and monitoring required in intensive setting.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1090",
    "pmjay_package_rate": 4000,
    "ward_type": "general",
    "icu_probability": "high",
    "cost_estimate": {
      "generalWard": {
        "min": 15000,
        "max": 40000
      },
      "privateRoom": {
        "min": 25000,
        "max": 65000
      },
      "icu": {
        "min": 60000,
        "max": 150000
      },
      "daycare": null
    },
    "code": "E87.5",
    "commonName": "Hyperkalemia / High Potassium",
    "icuProbability": "high",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "Potassium level and ECG changes",
      "Renal status (CKD/AKI)",
      "Was dialysis required for correction?"
    ],
    "mandatoryDocuments": [
      {
        "id": "serial_k_high",
        "name": "Serial Potassium Levels",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "ecg_k_high",
        "name": "ECG showing peaked T-waves",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GENE-029",
    "specialty": "General Medicine",
    "subcategory": "Allergy",
    "condition_name": "Anaphylaxis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "T78.2",
        "description": "Anaphylactic shock, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Evidence of hypotension / airway compromise",
      "Was Adrenaline given?",
      "Known allergen documentation"
    ],
    "documentation_must_include": [
      "Emergency Room Vitals Chart (BP, HR, RR)",
      "Medication Log showing Adrenaline/Epi use"
    ],
    "india_specific_notes": "Always document time of allergen exposure and onset of symptoms",
    "severity_markers": [
      "Hypotension (SBP <90)",
      "Stridor / Laryngeal edema",
      "Bronchospasm",
      "Syncope",
      "Biphasic reaction risk"
    ],
    "must_not_miss_flags": [
      "Vasovagal syncope",
      "Panic attack",
      "Asthmatic attack"
    ],
    "admission_justification_template": "Patient presents with acute onset {hypotension_stridor} following {allergen} exposure. {adrenaline_given}. {biphasic_risk}. Inpatient ICU monitoring for late-phase reaction and stabilization required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1111",
    "pmjay_package_rate": 9000,
    "ward_type": "icu",
    "icu_probability": "high",
    "cost_estimate": {
      "generalWard": {
        "min": 20000,
        "max": 50000
      },
      "privateRoom": {
        "min": 35000,
        "max": 90000
      },
      "icu": {
        "min": 80000,
        "max": 200000
      },
      "daycare": null
    },
    "code": "T78.2",
    "commonName": "Anaphylaxis",
    "icuProbability": "high",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "Evidence of hypotension / airway compromise",
      "Was Adrenaline given?",
      "Known allergen documentation"
    ],
    "mandatoryDocuments": [
      {
        "id": "vitals_record",
        "name": "Emergency Room Vitals Chart (BP, HR, RR)",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Hemodynamic instability not documented"
      },
      {
        "id": "adrenaline_log",
        "name": "Medication Log showing Adrenaline/Epi use",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Severity index (Adrenaline requirement) absent"
      }
    ]
  },
  {
    "id": "GENE-030",
    "specialty": "General Medicine",
    "subcategory": "Allergy",
    "condition_name": "Drug Allergy / Severe Reaction",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "Z88.9",
        "description": "Personal history of allergy to unspecified drugs, medicaments and biological substances",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Suspected drug name",
      "Type of reaction (Rash/Angioedema/Stevens-Johnson)",
      "Was IV steroid / antihistamine required?"
    ],
    "documentation_must_include": [
      "Skin Lesion Documentation"
    ],
    "india_specific_notes": "SJS/TEN (Stevens-Johnson Syndrome) are high-rejection-risk if severity not vividly described",
    "severity_markers": [
      "Mucosal involvement",
      "Skin peeling (Nikolsky sign)",
      "Fever + Diffuse rash",
      "Angioedema"
    ],
    "must_not_miss_flags": [
      "SJS / TEN (Life threatening)",
      "DRESS syndrome",
      "Erythema Multiforme"
    ],
    "admission_justification_template": "Patient presents with severe {reaction_type} following {drug_name}. {mucosal_involvement_flag}. {target_lesions}. Inpatient management with IV steroids and monitoring for systemic toxicity/SJS required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1112",
    "pmjay_package_rate": 7500,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 15000,
        "max": 40000
      },
      "privateRoom": {
        "min": 25000,
        "max": 70000
      },
      "icu": {
        "min": 60000,
        "max": 150000
      },
      "daycare": null
    },
    "code": "Z88.9",
    "commonName": "Drug Allergy / Severe Reaction",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "Suspected drug name",
      "Type of reaction (Rash/Angioedema/Stevens-Johnson)",
      "Was IV steroid / antihistamine required?"
    ],
    "mandatoryDocuments": [
      {
        "id": "rash_photo",
        "name": "Skin Lesion Documentation",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-031",
    "specialty": "Cardiology",
    "subcategory": "Acute Coronary Syndromes",
    "condition_name": "Heart Attack / Acute MI",
    "common_aliases": [
      "acute myocardial infarction",
      "myocardial infarction",
      "ami",
      "heart attack",
      "cardiac infarction",
      "coronary thrombosis",
      "heartattack",
      "mi"
    ],
    "hinglish_terms": [
      "dil ka daura",
      "heart fail hona",
      "seene mein dard"
    ],
    "icd_codes": {
      "primary": {
        "code": "I21.9",
        "description": "Acute myocardial infarction, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [
      "ECG changes",
      "Elevated cardiac enzymes",
      "Severe angina"
    ],
    "medical_necessity_keywords": [
      "heart attack",
      "stemi",
      "nstemi",
      "chest pain",
      "trop t",
      "troponin",
      "ecg st elevation"
    ],
    "typical_los_days": {
      "min": 4,
      "max": 10,
      "average": 6
    },
    "expected_procedures": [
      "00.66",
      "36.01",
      "36.02"
    ],
    "tpa_query_triggers": [
      "Submit serial ECG reports (admission, 6h, 24h)",
      "Troponin I or T levels with timestamps",
      "Echocardiography report",
      "Coronary angiography report if done",
      "Thrombolysis consent and drug details if given"
    ],
    "documentation_must_include": [
      "Serial ECGs — Admission, 6h, 24h, Discharge",
      "Serial Troponin I or T with timestamps",
      "Echocardiography Report (2D Echo)",
      "Coronary Angiography Report",
      "PCI Procedure Note + Stent Details",
      "Stent Sticker / Invoice (original)"
    ],
    "india_specific_notes": "Stent sticker is absolutely mandatory when PCI done — original physical sticker must be attached to claim Thrombolysis: document consent, drug used, dose, time of administration, TIMI flow post-lysis",
    "severity_markers": [
      "STEMI on ECG",
      "Troponin >99th percentile",
      "EF <40%",
      "Cardiogenic shock",
      "Complete heart block",
      "VT/VF"
    ],
    "must_not_miss_flags": [
      "Aortic dissection",
      "Pulmonary embolism",
      "Pericarditis",
      "GERD mimicking cardiac pain"
    ],
    "admission_justification_template": "Patient presents with acute onset chest pain with radiation to {radiation_site} for {duration}. ECG shows {ecg_findings}. Troponin {troponin_value} at {troponin_time} — {times} upper limit of normal. Clinical presentation consistent with acute {stemi_nstemi}. Emergency coronary intervention / medical management required in CCU setting.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1001",
    "pmjay_package_rate": 38000,
    "ward_type": "icu",
    "icu_probability": "high",
    "cost_estimate": {
      "generalWard": {
        "min": 80000,
        "max": 200000
      },
      "privateRoom": {
        "min": 150000,
        "max": 400000
      },
      "icu": {
        "min": 200000,
        "max": 600000
      },
      "daycare": null
    },
    "code": "I21.9",
    "commonName": "Heart Attack / Acute MI",
    "icuProbability": "high",
    "typicalLOS": {
      "min": 4,
      "max": 10,
      "average": 6
    },
    "commonTPAQueries": [
      "Submit serial ECG reports (admission, 6h, 24h)",
      "Troponin I or T levels with timestamps",
      "Echocardiography report",
      "Coronary angiography report if done",
      "Thrombolysis consent and drug details if given"
    ],
    "mandatoryDocuments": [
      {
        "id": "ecg_serial",
        "name": "Serial ECGs — Admission, 6h, 24h, Discharge",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Dynamic ECG changes not documented"
      },
      {
        "id": "troponin_serial",
        "name": "Serial Troponin I or T with timestamps",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Biochemical evidence of myocardial injury absent"
      },
      {
        "id": "echo",
        "name": "Echocardiography Report (2D Echo)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Ventricular function not assessed — standard of care"
      },
      {
        "id": "cath_report",
        "name": "Coronary Angiography Report",
        "category": "operative",
        "mandatory": false,
        "whenRequired": "if CAG done",
        "tpaQueryIfMissing": "Coronary anatomy not documented"
      },
      {
        "id": "pci_report",
        "name": "PCI Procedure Note + Stent Details",
        "category": "operative",
        "mandatory": false,
        "whenRequired": "if PCI done",
        "tpaQueryIfMissing": "Intervention details not documented"
      },
      {
        "id": "stent_sticker",
        "name": "Stent Sticker / Invoice (original)",
        "category": "implant",
        "mandatory": false,
        "whenRequired": "if stent implanted",
        "tpaQueryIfMissing": "Implant cost not verifiable without original sticker"
      }
    ]
  },
  {
    "id": "CARD-032",
    "specialty": "Cardiology",
    "subcategory": "Heart Failure",
    "condition_name": "Congestive Heart Failure / Acute Decompensated Heart Failure",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I50.9",
        "description": "Heart failure, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 5,
      "max": 12,
      "average": 7
    },
    "expected_procedures": [
      "99.18",
      "93.90"
    ],
    "tpa_query_triggers": [
      "Was this acute decompensation or chronic stable heart failure?",
      "Provide precipitating factor documentation",
      "Submit echocardiography with EF measurement",
      "BNP or NT-proBNP level",
      "Daily weight chart and diuresis response"
    ],
    "documentation_must_include": [
      "Echocardiography with EF Measurement",
      "BNP or NT-proBNP",
      "Chest X-Ray (pulmonary edema evidence)",
      "Daily Weight Chart and Fluid Balance"
    ],
    "india_specific_notes": "Document precipitating cause: new MI, arrhythmia, infection, medication non-compliance, dietary excess Daily weight is TPA-required evidence of active diuresis treatment",
    "severity_markers": [
      "EF <30%",
      "SpO2 <90%",
      "BNP >500",
      "Bilateral crepitations",
      "Pulmonary edema on CXR",
      "JVP elevated"
    ],
    "must_not_miss_flags": [
      "Acute MI as precipitant",
      "Pulmonary embolism",
      "Cardiac tamponade",
      "Severe valve disease"
    ],
    "admission_justification_template": "Patient with known heart failure (EF {ef}%) presents with acute decompensation precipitated by {precipitant}. BNP {bnp} pg/mL. SpO2 {spo2}% with bilateral crepitations and {edema_grade} pedal edema. Acute pulmonary edema on CXR. IV diuresis and hemodynamic monitoring required in inpatient setting.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1009",
    "pmjay_package_rate": 15000,
    "ward_type": "any",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 35000,
        "max": 90000
      },
      "privateRoom": {
        "min": 65000,
        "max": 170000
      },
      "icu": {
        "min": 100000,
        "max": 280000
      },
      "daycare": null
    },
    "code": "I50.9",
    "commonName": "Congestive Heart Failure / Acute Decompensated Heart Failure",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 5,
      "max": 12,
      "average": 7
    },
    "commonTPAQueries": [
      "Was this acute decompensation or chronic stable heart failure?",
      "Provide precipitating factor documentation",
      "Submit echocardiography with EF measurement",
      "BNP or NT-proBNP level",
      "Daily weight chart and diuresis response"
    ],
    "mandatoryDocuments": [
      {
        "id": "echo_hf",
        "name": "Echocardiography with EF Measurement",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Ventricular function and HF classification not documented"
      },
      {
        "id": "bnp",
        "name": "BNP or NT-proBNP",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Biochemical severity of heart failure not established"
      },
      {
        "id": "cxr_hf",
        "name": "Chest X-Ray (pulmonary edema evidence)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Radiological evidence of congestion not provided"
      },
      {
        "id": "daily_weight",
        "name": "Daily Weight Chart and Fluid Balance",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Response to diuresis not documented"
      }
    ]
  },
  {
    "id": "CARD-033",
    "specialty": "Cardiology",
    "subcategory": "Arrhythmias",
    "condition_name": "Atrial Fibrillation (AF)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I48.91",
        "description": "Unspecified atrial fibrillation",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [
      "99.61",
      "99.62"
    ],
    "tpa_query_triggers": [
      "Was this new-onset or paroxysmal AF?",
      "Submit 12-lead ECG confirming AF",
      "Thyroid function test (TSH)",
      "Echo to assess structural heart disease",
      "If cardioversion done, submit consent and defibrillator record"
    ],
    "documentation_must_include": [
      "12-Lead ECG Confirming Atrial Fibrillation",
      "Echocardiography (LA size, valve assessment)",
      "Thyroid Function Tests (TSH)"
    ],
    "india_specific_notes": "New onset AF within 48h has cardioversion option — this justifies emergency admission strongly Anticoagulation initiation also justifies admission for monitoring",
    "severity_markers": [
      "Rapid ventricular rate >150",
      "Hemodynamic compromise",
      "New AF <48h duration",
      "Pre-excitation on ECG"
    ],
    "must_not_miss_flags": [
      "Wolff-Parkinson-White syndrome",
      "AF with acute MI",
      "Thyrotoxicosis"
    ],
    "admission_justification_template": "Patient presents with {new_chronic} atrial fibrillation with ventricular rate {hr}/min. {symptoms}. 12-lead ECG confirms irregularly irregular rhythm consistent with AF. {cardioversion_indication}. Inpatient rate control, anticoagulation initiation, and monitoring for thromboembolic risk required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1015",
    "pmjay_package_rate": 12000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 20000,
        "max": 60000
      },
      "privateRoom": {
        "min": 35000,
        "max": 110000
      },
      "icu": {
        "min": 55000,
        "max": 130000
      },
      "daycare": null
    },
    "code": "I48.91",
    "commonName": "Atrial Fibrillation (AF)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "Was this new-onset or paroxysmal AF?",
      "Submit 12-lead ECG confirming AF",
      "Thyroid function test (TSH)",
      "Echo to assess structural heart disease",
      "If cardioversion done, submit consent and defibrillator record"
    ],
    "mandatoryDocuments": [
      {
        "id": "ecg_af",
        "name": "12-Lead ECG Confirming Atrial Fibrillation",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Arrhythmia not electrocardiographically confirmed"
      },
      {
        "id": "echo_af",
        "name": "Echocardiography (LA size, valve assessment)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Structural etiology not investigated"
      },
      {
        "id": "tft",
        "name": "Thyroid Function Tests (TSH)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Thyroid etiology not excluded"
      }
    ]
  },
  {
    "id": "CARD-034",
    "specialty": "Cardiology",
    "subcategory": "Acute Coronary Syndromes",
    "condition_name": "Unstable Angina (UA)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I20.0",
        "description": "Unstable angina",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "expected_procedures": [
      "00.66"
    ],
    "tpa_query_triggers": [
      "Submit serial ECGs and Troponin levels",
      "GRACE score or TIMI score",
      "Documentation of dynamic ST-T changes",
      "Coronary Angiogram report"
    ],
    "documentation_must_include": [
      "Serial ECGs showing dynamic changes",
      "Serial Troponin I/T (negative results)"
    ],
    "india_specific_notes": "Unstable Angina is defined by typical chest pain with negative enzymes but dynamic ECG or high clinical risk",
    "severity_markers": [
      "Prolonged rest pain >20 min",
      "ST depression >0.5mm",
      "Dynamic T-wave inversion",
      "Hypotension during pain"
    ],
    "must_not_miss_flags": [
      "NSTEMI",
      "Aortic dissection",
      "Esophageal rupture"
    ],
    "admission_justification_template": "Patient presents with crescendo angina / rest pain for {duration}. Serial ECGs show {ecg_changes}. Troponin {trop_level} (Negative). {high_risk_features}. Inpatient stabilization with antiplatelets, anticoagulants, and early invasive strategy (CAG) required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1002",
    "pmjay_package_rate": 18000,
    "ward_type": "icu",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 40000,
        "max": 100000
      },
      "privateRoom": {
        "min": 70000,
        "max": 180000
      },
      "icu": {
        "min": 120000,
        "max": 300000
      },
      "daycare": null
    },
    "code": "I20.0",
    "commonName": "Unstable Angina (UA)",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "commonTPAQueries": [
      "Submit serial ECGs and Troponin levels",
      "GRACE score or TIMI score",
      "Documentation of dynamic ST-T changes",
      "Coronary Angiogram report"
    ],
    "mandatoryDocuments": [
      {
        "id": "ua_ecg",
        "name": "Serial ECGs showing dynamic changes",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "ua_trop",
        "name": "Serial Troponin I/T (negative results)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-035",
    "specialty": "Cardiology",
    "subcategory": "Valvular Heart Disease",
    "condition_name": "Rheumatic Heart Disease (RHD)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I09.9",
        "description": "Rheumatic heart disease, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 4,
      "max": 10,
      "average": 6
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Echo report confirming valvular lesions",
      "History of Rheumatic Fever",
      "ASO Titre results"
    ],
    "documentation_must_include": [
      "Detailed 2D Echo Report"
    ],
    "india_specific_notes": "Secondary prophylaxis (Penicillin) documentation is important for TPA",
    "severity_markers": [
      "Severe MS/MR/AS/AR",
      "Pulmonary Hypertension",
      "Atrial Fibrillation",
      "Heart Failure"
    ],
    "must_not_miss_flags": [
      "Infective Endocarditis",
      "Atrial Myxoma",
      "Anemia aggravating RHD"
    ],
    "admission_justification_template": "Patient with known RHD presents with {symptoms}. 2D Echo shows {valve_findings} with {pht_status}. {af_status}. Inpatient management for cardiac optimization and {intervention_plan} required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1010",
    "pmjay_package_rate": 12000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 25000,
        "max": 65000
      },
      "privateRoom": {
        "min": 45000,
        "max": 120000
      },
      "icu": {
        "min": 90000,
        "max": 200000
      },
      "daycare": null
    },
    "code": "I09.9",
    "commonName": "Rheumatic Heart Disease (RHD)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 4,
      "max": 10,
      "average": 6
    },
    "commonTPAQueries": [
      "Echo report confirming valvular lesions",
      "History of Rheumatic Fever",
      "ASO Titre results"
    ],
    "mandatoryDocuments": [
      {
        "id": "echo_rhd",
        "name": "Detailed 2D Echo Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-036",
    "specialty": "Cardiology",
    "subcategory": "Valvular Heart Disease",
    "condition_name": "Mitral Stenosis (MS)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I05.0",
        "description": "Mitral stenosis",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 5
    },
    "expected_procedures": [
      "35.12",
      "35.23"
    ],
    "tpa_query_triggers": [
      "Mitral valve area (MVA) on Echo",
      "Wilkins score for BMV fitness",
      "Presence of LA clot (TEE report)",
      "Gradient across mitral valve"
    ],
    "documentation_must_include": [
      "2D Echo with MVA and Gradients",
      "Transesophagel Echo (TEE) to rule out LA clot"
    ],
    "india_specific_notes": "BMV (Balloon Mitral Valvotomy) is a common intervention for severe MS",
    "severity_markers": [
      "MVA <1.0 cm2",
      "Mean gradient >10 mmHg",
      "Severe PASP >50",
      "New AF"
    ],
    "must_not_miss_flags": [
      "Mitral Regurgitation co-existence",
      "LA Myxoma",
      "Thromboembolism"
    ],
    "admission_justification_template": "Patient presents with NYHA Class {class} dyspnea. Echo shows Severe Mitral Stenosis with MVA {mva} cm2 and mean gradient {gradient} mmHg. Wilkins score {score}. {la_clot_status}. Inpatient admission for {intervention_type} required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1011",
    "pmjay_package_rate": 100000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 80000,
        "max": 180000
      },
      "privateRoom": {
        "min": 140000,
        "max": 300000
      },
      "icu": {
        "min": 180000,
        "max": 400000
      },
      "daycare": null
    },
    "code": "I05.0",
    "commonName": "Mitral Stenosis (MS)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 5
    },
    "commonTPAQueries": [
      "Mitral valve area (MVA) on Echo",
      "Wilkins score for BMV fitness",
      "Presence of LA clot (TEE report)",
      "Gradient across mitral valve"
    ],
    "mandatoryDocuments": [
      {
        "id": "echo_ms",
        "name": "2D Echo with MVA and Gradients",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "tee_clot",
        "name": "Transesophagel Echo (TEE) to rule out LA clot",
        "category": "investigation",
        "mandatory": true,
        "whenRequired": "if BMV planned",
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-037",
    "specialty": "Cardiology",
    "subcategory": "Valvular Heart Disease",
    "condition_name": "Aortic Stenosis (AS)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I35.0",
        "description": "Nonrheumatic aortic (valve) stenosis",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 5,
      "max": 12,
      "average": 7
    },
    "expected_procedures": [
      "35.21",
      "35.22"
    ],
    "tpa_query_triggers": [
      "Aortic valve area (AVA) and Peak gradient",
      "Symptoms: Angina, Syncope, Dyspnea (Triad)",
      "LV function (EF%)",
      "Valve morphology (Bicuspid vs Senile)"
    ],
    "documentation_must_include": [
      "Echo with AVA, Vmax, and Mean Gradient"
    ],
    "india_specific_notes": "Symptomatic severe AS has high 2-year mortality — prioritize pre-auth",
    "severity_markers": [
      "AVA <1.0 cm2 / Indexed <0.6",
      "Vmax >4.0 m/s",
      "Mean gradient >40 mmHg",
      "EF <50%"
    ],
    "must_not_miss_flags": [
      "Bicuspid aortic valve with root dilation",
      "Aortic Coarctation",
      "Sub-valvular stenosis"
    ],
    "admission_justification_template": "Patient presents with classic triad of {triad_symptoms}. Echo shows Severe Aortic Stenosis with AVA {ava} cm2, Vmax {vmax} m/s, and Mean Gradient {gradient} mmHg. EF {ef}%. Inpatient admission for {avr_intervention} required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1013",
    "pmjay_package_rate": 150000,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 150000,
        "max": 350000
      },
      "privateRoom": {
        "min": 250000,
        "max": 550000
      },
      "icu": {
        "min": 300000,
        "max": 800000
      },
      "daycare": null
    },
    "code": "I35.0",
    "commonName": "Aortic Stenosis (AS)",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 5,
      "max": 12,
      "average": 7
    },
    "commonTPAQueries": [
      "Aortic valve area (AVA) and Peak gradient",
      "Symptoms: Angina, Syncope, Dyspnea (Triad)",
      "LV function (EF%)",
      "Valve morphology (Bicuspid vs Senile)"
    ],
    "mandatoryDocuments": [
      {
        "id": "echo_as",
        "name": "Echo with AVA, Vmax, and Mean Gradient",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-038",
    "specialty": "Cardiology",
    "subcategory": "Arrhythmias",
    "condition_name": "Supraventricular Tachycardia (SVT)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I47.1",
        "description": "Supraventricular tachycardia",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "expected_procedures": [
      "37.34"
    ],
    "tpa_query_triggers": [
      "ECG showing narrow complex tachycardia",
      "Was Adenosine or DC shock required?",
      "EP study results if done"
    ],
    "documentation_must_include": [
      "ECG showing SVT rhythm"
    ],
    "india_specific_notes": "RF Ablation is the definitive treatment — usually daycare",
    "severity_markers": [
      "HR >180",
      "Hypotension / Syncope",
      "Angina during SVT",
      "Failure of vagal maneuvers"
    ],
    "must_not_miss_flags": [
      "Atrial Flutter",
      "AVNRT",
      "WPW Syndrome"
    ],
    "admission_justification_template": "Patient presents with acute palpitations and pulse {hr}/min. ECG confirms {svt_type}. {adenosine_response}. {instability_flag}. Inpatient acute management / Daycare RF ablation required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1016",
    "pmjay_package_rate": 8500,
    "ward_type": "icu",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 15000,
        "max": 40000
      },
      "privateRoom": {
        "min": 25000,
        "max": 70000
      },
      "icu": {
        "min": 50000,
        "max": 130000
      },
      "daycare": {
        "min": 35000,
        "max": 90000
      }
    },
    "code": "I47.1",
    "commonName": "Supraventricular Tachycardia (SVT)",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "commonTPAQueries": [
      "ECG showing narrow complex tachycardia",
      "Was Adenosine or DC shock required?",
      "EP study results if done"
    ],
    "mandatoryDocuments": [
      {
        "id": "svt_ecg",
        "name": "ECG showing SVT rhythm",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-039",
    "specialty": "Cardiology",
    "subcategory": "Arrhythmias",
    "condition_name": "Complete Heart Block (CHB) / Third Degree AV Block",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I44.2",
        "description": "Atrioventricular block, complete",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 5
    },
    "expected_procedures": [
      "37.83"
    ],
    "tpa_query_triggers": [
      "ECG showing AV dissociation",
      "Symptoms: Syncope (Stokes-Adams attacks)",
      "Was temporary pacemaker (TPM) inserted?",
      "Permanent pacemaker (PPI) indication and sticker"
    ],
    "documentation_must_include": [
      "ECG showing Complete Heart Block",
      "Pacemaker / Lead Stickers (Original)"
    ],
    "india_specific_notes": "CHB is a life-threatening emergency — TPM should be done immediately if unstable",
    "severity_markers": [
      "Heart rate <30",
      "Syncope",
      "Wide QRS escape",
      "Heart failure"
    ],
    "must_not_miss_flags": [
      "Acute MI causing CHB",
      "Hyperkalemia",
      "Lyme disease"
    ],
    "admission_justification_template": "Patient presents with syncope and bradycardia (HR {hr}/min). ECG confirms Complete Heart Block with AV dissociation. {tpm_inserted}. Emergency inpatient management and Permanent Pacemaker Implantation (PPI) required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1017",
    "pmjay_package_rate": 60000,
    "ward_type": "icu",
    "icu_probability": "high",
    "cost_estimate": {
      "generalWard": {
        "min": 100000,
        "max": 250000
      },
      "privateRoom": {
        "min": 180000,
        "max": 450000
      },
      "icu": {
        "min": 250000,
        "max": 600000
      },
      "daycare": null
    },
    "code": "I44.2",
    "commonName": "Complete Heart Block (CHB) / Third Degree AV Block",
    "icuProbability": "high",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 5
    },
    "commonTPAQueries": [
      "ECG showing AV dissociation",
      "Symptoms: Syncope (Stokes-Adams attacks)",
      "Was temporary pacemaker (TPM) inserted?",
      "Permanent pacemaker (PPI) indication and sticker"
    ],
    "mandatoryDocuments": [
      {
        "id": "chb_ecg",
        "name": "ECG showing Complete Heart Block",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "pacemaker_sticker",
        "name": "Pacemaker / Lead Stickers (Original)",
        "category": "implant",
        "mandatory": true,
        "whenRequired": "if PPI done",
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-040",
    "specialty": "Cardiology",
    "subcategory": "Valvular / Infectious",
    "condition_name": "Infective Endocarditis (IE)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I33.0",
        "description": "Acute and subacute infective endocarditis",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 14,
      "max": 42,
      "average": 21
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Modified Duke Criteria documentation",
      "Echo evidence of vegetation",
      "Blood culture results (3 sets)",
      "Justification for long LOS (4-6 weeks antibiotics)"
    ],
    "documentation_must_include": [
      "2D / TEE Echo showing vegetations",
      "Multiple Blood Cultures (at least 3)"
    ],
    "india_specific_notes": "Inpatient stay is long due to mandatory IV antibiotic course (2-6 weeks)",
    "severity_markers": [
      "New valvular regurgitation",
      "Embolic phenomena (Stroke/Splenic)",
      "Heart failure",
      "Abscess on Echo",
      "Large vegetation >10mm"
    ],
    "must_not_miss_flags": [
      "Fungal endocarditis",
      "Culture negative IE",
      "Marantic endocarditis"
    ],
    "admission_justification_template": "Patient presents with Prolonged fever, new murmur, and {embolic_signs}. Echo shows {veg_size} vegetation on {valve}. Blood cultures positive for {organism}. Duke criteria met. Inpatient long-term IV antibiotic therapy and monitoring for complications required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1018",
    "pmjay_package_rate": 18000,
    "ward_type": "any",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 60000,
        "max": 180000
      },
      "privateRoom": {
        "min": 120000,
        "max": 350000
      },
      "icu": {
        "min": 250000,
        "max": 700000
      },
      "daycare": null
    },
    "code": "I33.0",
    "commonName": "Infective Endocarditis (IE)",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 14,
      "max": 42,
      "average": 21
    },
    "commonTPAQueries": [
      "Modified Duke Criteria documentation",
      "Echo evidence of vegetation",
      "Blood culture results (3 sets)",
      "Justification for long LOS (4-6 weeks antibiotics)"
    ],
    "mandatoryDocuments": [
      {
        "id": "echo_veg",
        "name": "2D / TEE Echo showing vegetations",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "blood_culture_ie",
        "name": "Multiple Blood Cultures (at least 3)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-041",
    "specialty": "Cardiology",
    "subcategory": "Pericardial Disease",
    "condition_name": "Pericardial Effusion / Cardiac Tamponade",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I31.3",
        "description": "Pericardial effusion (noninflammatory)",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 10,
      "average": 5
    },
    "expected_procedures": [
      "37.0"
    ],
    "tpa_query_triggers": [
      "Echo evidence of effusion size",
      "Signs of tamponade (RA/RV collapse)",
      "Pericardial fluid analysis report",
      "Cause workup (TB/Malignancy)"
    ],
    "documentation_must_include": [
      "2D Echo sizing effusion (mm)"
    ],
    "india_specific_notes": "Cardiac Tamponade is a surgical emergency requiring pericardiocentesis",
    "severity_markers": [
      "Pulsus paradoxus",
      "RA/RV diastolic collapse",
      "LVPapillary motion",
      "Beck's Triad (Hypotension, JVD, Muffled heart sounds)"
    ],
    "must_not_miss_flags": [
      "TB Pericarditis",
      "Uremic effusion",
      "Post-MI pericarditis"
    ],
    "admission_justification_template": "Patient presents with dyspnea, muffled heart sounds, and BP {bp}. Echo shows {effusion_size} mm global pericardial effusion with {tamponade_signs}. Emergency pericardiocentesis and inpatient monitoring required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1019",
    "pmjay_package_rate": 14000,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 30000,
        "max": 80000
      },
      "privateRoom": {
        "min": 55000,
        "max": 150000
      },
      "icu": {
        "min": 100000,
        "max": 300000
      },
      "daycare": null
    },
    "code": "I31.3",
    "commonName": "Pericardial Effusion / Cardiac Tamponade",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 3,
      "max": 10,
      "average": 5
    },
    "commonTPAQueries": [
      "Echo evidence of effusion size",
      "Signs of tamponade (RA/RV collapse)",
      "Pericardial fluid analysis report",
      "Cause workup (TB/Malignancy)"
    ],
    "mandatoryDocuments": [
      {
        "id": "echo_effusion",
        "name": "2D Echo sizing effusion (mm)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-042",
    "specialty": "Cardiology",
    "subcategory": "Pulmonary Circulation",
    "condition_name": "Pulmonary Hypertension (PAH)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I27.20",
        "description": "Pulmonary arterial hypertension, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Echo PASP value",
      "Right heart catheterization (RHC) data",
      "Primary vs Secondary cause evidence"
    ],
    "documentation_must_include": [
      "Echo with PASP and RV function"
    ],
    "india_specific_notes": "Document WHO functional class to justify admission for optimization",
    "severity_markers": [
      "PASP >70 mmHg",
      "RV failure / Dilated RA",
      "Syncope",
      "NYHA Class IV"
    ],
    "must_not_miss_flags": [
      "CTPE (Chronic Thromboembolic PH)",
      "Congenital Heart Disease",
      "Interstital Lung Disease"
    ],
    "admission_justification_template": "Patient presents with severe dyspnea and syncope. Echo shows PASP {pasp} mmHg with {rv_status}. Functional Class {class}. Inpatient workup for etiology and pulmonary vasodilator titration required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1020",
    "pmjay_package_rate": 11000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 25000,
        "max": 60000
      },
      "privateRoom": {
        "min": 45000,
        "max": 110000
      },
      "icu": {
        "min": 80000,
        "max": 200000
      },
      "daycare": null
    },
    "code": "I27.20",
    "commonName": "Pulmonary Hypertension (PAH)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "commonTPAQueries": [
      "Echo PASP value",
      "Right heart catheterization (RHC) data",
      "Primary vs Secondary cause evidence"
    ],
    "mandatoryDocuments": [
      {
        "id": "echo_pasp",
        "name": "Echo with PASP and RV function",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-043",
    "specialty": "Cardiology",
    "subcategory": "Venous Disease",
    "condition_name": "Deep Vein Thrombosis (DVT)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I82.40",
        "description": "Acute embolism and thrombosis of unspecified deep veins of lower extremity",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Venous Doppler report confirming thrombus",
      "Well's Score documentation",
      "Was IVC filter required?"
    ],
    "documentation_must_include": [
      "Venous Color Doppler (Lower Limb)"
    ],
    "india_specific_notes": "Inpatient admission is primarily for stabilization on anticoagulation and monitoring for PE",
    "severity_markers": [
      "Proximal DVT (Iliac/Femoral)",
      "Phlegmasia cerulea dolens",
      "High risk of Pulmonary Embolism"
    ],
    "must_not_miss_flags": [
      "Pulmonary Embolism",
      "Cellulitis mimicking DVT",
      "Ruptured Baker's cyst"
    ],
    "admission_justification_template": "Patient presents with unilateral limb swelling and pain for {duration}. Venous Doppler confirms {prox_distal} DVT in {vein_name}. Well's score {score}. Inpatient anticoagulation, limb elevation, and monitoring for pulmonary embolism required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1021",
    "pmjay_package_rate": 9500,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 20000,
        "max": 50000
      },
      "privateRoom": {
        "min": 35000,
        "max": 90000
      },
      "icu": {
        "min": 70000,
        "max": 150000
      },
      "daycare": null
    },
    "code": "I82.40",
    "commonName": "Deep Vein Thrombosis (DVT)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "commonTPAQueries": [
      "Venous Doppler report confirming thrombus",
      "Well's Score documentation",
      "Was IVC filter required?"
    ],
    "mandatoryDocuments": [
      {
        "id": "venous_doppler",
        "name": "Venous Color Doppler (Lower Limb)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "SURG-044",
    "specialty": "Surgery",
    "subcategory": "Venous Disease",
    "condition_name": "Varicose Veins",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I83.9",
        "description": "Varicose veins of lower extremities without ulcer or inflammation",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "expected_procedures": [
      "38.59"
    ],
    "tpa_query_triggers": [
      "Venous Doppler report showing reflux",
      "CEAP classification documentation",
      "Was laser/RFA used? Sticker mandatory",
      "Functional disability assessment"
    ],
    "documentation_must_include": [
      "Venous Doppler with Reflux study"
    ],
    "india_specific_notes": "EVLT (Endovenous Laser Therapy) is the preferred modern procedure — usually daycare",
    "severity_markers": [
      "CEAP Class C4-C6 (Skin changes/Ulcer)",
      "Recurrent superficial thrombophlebitis",
      "Severe aching pain affecting work"
    ],
    "must_not_miss_flags": [
      "Deep Vein Thrombosis",
      "Arterial insufficiency",
      "Lymphedema"
    ],
    "admission_justification_template": "Patient presents with symptomatic varicose veins (CEAP Class {class}). Doppler confirms reflux in {vein}. Failed conservative management (compression). {skin_changes_flag}. Inpatient / Daycare surgical intervention with {procedure_name} required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "GS-1029",
    "pmjay_package_rate": 15000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 25000,
        "max": 60000
      },
      "privateRoom": {
        "min": 40000,
        "max": 100000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 20000,
        "max": 50000
      }
    },
    "code": "I83.9",
    "commonName": "Varicose Veins",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "commonTPAQueries": [
      "Venous Doppler report showing reflux",
      "CEAP classification documentation",
      "Was laser/RFA used? Sticker mandatory",
      "Functional disability assessment"
    ],
    "mandatoryDocuments": [
      {
        "id": "doppler_vv",
        "name": "Venous Doppler with Reflux study",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-045",
    "specialty": "Cardiology",
    "subcategory": "Cardiomyopathies",
    "condition_name": "Dilated Cardiomyopathy (DCM)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I42.0",
        "description": "Dilated cardiomyopathy",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 4,
      "max": 10,
      "average": 6
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Echo reporting LV dilation and low EF%",
      "Is ischemic etiology ruled out (CAG)?",
      "BNP/NT-proBNP levels"
    ],
    "documentation_must_include": [
      "Detailed Echo with LV volumes and EF"
    ],
    "india_specific_notes": "Document optimization of GDMT (Guideline Directed Medical Therapy)",
    "severity_markers": [
      "EF <25%",
      "Moderate to Severe MR",
      "Frequent VT/PVCs",
      "NYHA Class IV"
    ],
    "must_not_miss_flags": [
      "Ischemic cardiomyopathy",
      "Peripartum cardiomyopathy",
      "Alcoholic cardiomyopathy"
    ],
    "admission_justification_template": "Patient with known DCM presents with {acute_failure_symptoms}. Echo shows LV dilation (LVEDD {lvedd} mm) and EF {ef}%. {arrhythmia_status}. Inpatient management with IV diuresis, GDMT optimization, and monitoring required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1022",
    "pmjay_package_rate": 12000,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 35000,
        "max": 90000
      },
      "privateRoom": {
        "min": 60000,
        "max": 170000
      },
      "icu": {
        "min": 100000,
        "max": 300000
      },
      "daycare": null
    },
    "code": "I42.0",
    "commonName": "Dilated Cardiomyopathy (DCM)",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 4,
      "max": 10,
      "average": 6
    },
    "commonTPAQueries": [
      "Echo reporting LV dilation and low EF%",
      "Is ischemic etiology ruled out (CAG)?",
      "BNP/NT-proBNP levels"
    ],
    "mandatoryDocuments": [
      {
        "id": "echo_dcm",
        "name": "Detailed Echo with LV volumes and EF",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-046",
    "specialty": "Cardiology",
    "subcategory": "Cardiomyopathies",
    "condition_name": "Hypertrophic Cardiomyopathy (HCM / HOCM)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I42.1",
        "description": "Obstructive hypertrophic cardiomyopathy",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 4,
      "max": 10,
      "average": 6
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Echo with Septal wall thickness (mm)",
      "LVOT gradient measurement",
      "SAM (Systolic Anterior Motion) of mitral valve",
      "Sudden Cardiac Death (SCD) risk assessment"
    ],
    "documentation_must_include": [
      "Detailed Echo with septal thickness and LVOT gradient"
    ],
    "india_specific_notes": "High SCD risk justifies ICD implantation — requires separate pre-auth",
    "severity_markers": [
      "Septal thickness >30mm",
      "LVOT gradient >50 mmHg",
      "Syncope",
      "Non-sustained VT"
    ],
    "must_not_miss_flags": [
      "Athlete's heart",
      "Hypertensive hypertrophy",
      "Amyloidosis"
    ],
    "admission_justification_template": "Patient presents with angina and syncope. Echo shows HOCM with septal thickness {thickness} mm and LVOT gradient {gradient} mmHg. {sam_present}. Inpatient stabilization, beta-blocker titration, and ICD risk assessment required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1023",
    "pmjay_package_rate": 13000,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 40000,
        "max": 100000
      },
      "privateRoom": {
        "min": 70000,
        "max": 180000
      },
      "icu": {
        "min": 120000,
        "max": 300000
      },
      "daycare": null
    },
    "code": "I42.1",
    "commonName": "Hypertrophic Cardiomyopathy (HCM / HOCM)",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 4,
      "max": 10,
      "average": 6
    },
    "commonTPAQueries": [
      "Echo with Septal wall thickness (mm)",
      "LVOT gradient measurement",
      "SAM (Systolic Anterior Motion) of mitral valve",
      "Sudden Cardiac Death (SCD) risk assessment"
    ],
    "mandatoryDocuments": [
      {
        "id": "echo_hocm",
        "name": "Detailed Echo with septal thickness and LVOT gradient",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-047",
    "specialty": "Cardiology",
    "subcategory": "Inflammatory Heart Disease",
    "condition_name": "Acute Myocarditis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I40.9",
        "description": "Acute myocarditis, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 5,
      "max": 14,
      "average": 8
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Troponin levels (often very high)",
      "Echo showing global hypokinesia",
      "Viral markers / Cause workup",
      "Cardiac MRI results"
    ],
    "documentation_must_include": [
      "Serial Troponin I/T with timestamps",
      "Echo showing global hypokinesia"
    ],
    "india_specific_notes": "Fulminant myocarditis may require Mechanical Circulatory Support (ECMO/IABP)",
    "severity_markers": [
      "Fulminant failure / Shock",
      "Ventricular arrhythmias",
      "EF <35%",
      "High degree AV block"
    ],
    "must_not_miss_flags": [
      "Acute Myocardial Infarction",
      "Giant cell myocarditis",
      "Thyroid crisis"
    ],
    "admission_justification_template": "Patient presents with acute chest pain and dyspnea after viral prodrome. Troponin {trop} (Significant elevation). Echo shows global hypokinesia with EF {ef}%. {shock_status}. Emergency inpatient management for myocarditis and monitoring for heart failure/arrhythmia required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1024",
    "pmjay_package_rate": 15000,
    "ward_type": "icu",
    "icu_probability": "high",
    "cost_estimate": {
      "generalWard": {
        "min": 50000,
        "max": 120000
      },
      "privateRoom": {
        "min": 80000,
        "max": 220000
      },
      "icu": {
        "min": 150000,
        "max": 450000
      },
      "daycare": null
    },
    "code": "I40.9",
    "commonName": "Acute Myocarditis",
    "icuProbability": "high",
    "typicalLOS": {
      "min": 5,
      "max": 14,
      "average": 8
    },
    "commonTPAQueries": [
      "Troponin levels (often very high)",
      "Echo showing global hypokinesia",
      "Viral markers / Cause workup",
      "Cardiac MRI results"
    ],
    "mandatoryDocuments": [
      {
        "id": "trop_myo",
        "name": "Serial Troponin I/T with timestamps",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "echo_myo",
        "name": "Echo showing global hypokinesia",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-048",
    "specialty": "Cardiology",
    "subcategory": "Pericardial Disease",
    "condition_name": "Constrictive Pericarditis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I31.1",
        "description": "Chronic constrictive pericarditis",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 7,
      "max": 15,
      "average": 10
    },
    "expected_procedures": [
      "37.12"
    ],
    "tpa_query_triggers": [
      "Echo with Respiratory variation (>25%)",
      "CT/MRI showing pericardial thickening",
      "Evidence of right heart failure",
      "Pathology for TB if suspected"
    ],
    "documentation_must_include": [
      "Echo with Doppler / Tissue Doppler features",
      "CT Chest showing thickened / calcified pericardium"
    ],
    "india_specific_notes": "Pericardiectomy is standard of care for symptomatic constriction",
    "severity_markers": [
      "NYHA Class IV failure",
      "Severe Ascites",
      "Cardiac Cirrhosis",
      "Respiratory variation in Mitral flow"
    ],
    "must_not_miss_flags": [
      "Restrictive Cardiomyopathy (main DD)",
      "TB Chest",
      "Post-radiation pericarditis"
    ],
    "admission_justification_template": "Patient presents with progressive right heart failure and ascites. Echo/CT confirms chronic constrictive pericarditis with pericardial thickness {thickness} mm. {tubercular_suspicion}. Inpatient admission for Pericardiectomy and post-operative management required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1025",
    "pmjay_package_rate": 80000,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 100000,
        "max": 250000
      },
      "privateRoom": {
        "min": 180000,
        "max": 400000
      },
      "icu": {
        "min": 250000,
        "max": 600000
      },
      "daycare": null
    },
    "code": "I31.1",
    "commonName": "Constrictive Pericarditis",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 7,
      "max": 15,
      "average": 10
    },
    "commonTPAQueries": [
      "Echo with Respiratory variation (>25%)",
      "CT/MRI showing pericardial thickening",
      "Evidence of right heart failure",
      "Pathology for TB if suspected"
    ],
    "mandatoryDocuments": [
      {
        "id": "echo_constriction",
        "name": "Echo with Doppler / Tissue Doppler features",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "ct_pericardium",
        "name": "CT Chest showing thickened / calcified pericardium",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "SURG-049",
    "specialty": "Surgery",
    "subcategory": "Aortic Disease",
    "condition_name": "Abdominal Aortic Aneurysm (AAA)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I71.4",
        "description": "Abdominal aortic aneurysm, without rupture",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 5,
      "max": 10,
      "average": 7
    },
    "expected_procedures": [
      "38.44",
      "39.71"
    ],
    "tpa_query_triggers": [
      "CT Angiogram with Aneurysm size (cm)",
      "Is size >5.5cm (Male) or >5.0cm (Female)?",
      "Rate of expansion (>0.5cm in 6 months)",
      "Stent-graft details if EVAR done"
    ],
    "documentation_must_include": [
      "CT Angiogram with multiplanar reconstructions"
    ],
    "india_specific_notes": "EVAR (Endovascular Aneurysm Repair) is high-cost due to expensive stent-grafts",
    "severity_markers": [
      "Size >5.5cm",
      "Symptomatic AAA (Back pain)",
      "Rapid expansion",
      "Contained leak signs"
    ],
    "must_not_miss_flags": [
      "Ruptured AAA (Emergency)",
      "Infected (Mycotic) aneurysm",
      "Inflammatory AAA"
    ],
    "admission_justification_template": "Patient with known AAA presents with {symptoms}. CT Angiogram shows aneurysm size {size} cm. {expansion_rate}. {leak_signs}. Inpatient admission for {repair_type} (Open/EVAR) and monitoring required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1026",
    "pmjay_package_rate": 150000,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 150000,
        "max": 400000
      },
      "privateRoom": {
        "min": 250000,
        "max": 600000
      },
      "icu": {
        "min": 350000,
        "max": 900000
      },
      "daycare": null
    },
    "code": "I71.4",
    "commonName": "Abdominal Aortic Aneurysm (AAA)",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 5,
      "max": 10,
      "average": 7
    },
    "commonTPAQueries": [
      "CT Angiogram with Aneurysm size (cm)",
      "Is size >5.5cm (Male) or >5.0cm (Female)?",
      "Rate of expansion (>0.5cm in 6 months)",
      "Stent-graft details if EVAR done"
    ],
    "mandatoryDocuments": [
      {
        "id": "cta_aaa",
        "name": "CT Angiogram with multiplanar reconstructions",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "SURG-050",
    "specialty": "Surgery",
    "subcategory": "Aortic Disease",
    "condition_name": "Aortic Dissection (Stanford Type A / B)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I71.0",
        "description": "Dissection of aorta, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 7,
      "max": 21,
      "average": 12
    },
    "expected_procedures": [
      "38.45",
      "39.73"
    ],
    "tpa_query_triggers": [
      "CT Angiogram confirming dissection flap",
      "Stanford Classification (A or B)",
      "Involvement of major branches (Renal/Mesenteric)",
      "Organ ischemia signs"
    ],
    "documentation_must_include": [
      "CT Angiogram showing primary entry tear and flap"
    ],
    "india_specific_notes": "Stanford Type A requires immediate open cardiac surgery —Stanford Type B is often managed medically",
    "severity_markers": [
      "Stanford Type A (Surgical Emergency)",
      "Stanford Type B with organ malperfusion",
      "Aortic Rupture / Hemopericardium",
      "Uncontrolled HTN"
    ],
    "must_not_miss_flags": [
      "Acute Myocardial Infarction",
      "Pulmonary Embolism",
      "Stroke"
    ],
    "admission_justification_template": "Patient presents with \"tearing\" chest/back pain and BP {bp}. CT Angiogram confirms Stanford Type {type} Aortic Dissection. {branch_involvement}. {malperfusion_signs}. Emergency inpatient ICU management and {surgical_plan} required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1027",
    "pmjay_package_rate": 200000,
    "ward_type": "icu",
    "icu_probability": "high",
    "cost_estimate": {
      "generalWard": {
        "min": 250000,
        "max": 600000
      },
      "privateRoom": {
        "min": 400000,
        "max": 1000000
      },
      "icu": {
        "min": 500000,
        "max": 1500000
      },
      "daycare": null
    },
    "code": "I71.0",
    "commonName": "Aortic Dissection (Stanford Type A / B)",
    "icuProbability": "high",
    "typicalLOS": {
      "min": 7,
      "max": 21,
      "average": 12
    },
    "commonTPAQueries": [
      "CT Angiogram confirming dissection flap",
      "Stanford Classification (A or B)",
      "Involvement of major branches (Renal/Mesenteric)",
      "Organ ischemia signs"
    ],
    "mandatoryDocuments": [
      {
        "id": "cta_dissection",
        "name": "CT Angiogram showing primary entry tear and flap",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-051",
    "specialty": "Cardiology",
    "subcategory": "Arrhythmias",
    "condition_name": "Atrial Flutter",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I48.92",
        "description": "Unspecified atrial flutter",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [
      "37.34"
    ],
    "tpa_query_triggers": [
      "ECG showing \"saw-tooth\" waves",
      "Atrial rate vs Ventricular rate",
      "Was DC cardioversion done?",
      "Indication for RF ablation"
    ],
    "documentation_must_include": [
      "ECG showing Saw-tooth flutter waves"
    ],
    "india_specific_notes": "RF ablation of CTI (Cavo-Tricuspid Isthmus) is definitive cure",
    "severity_markers": [
      "1:1 Conduction / HR >250",
      "Hypotension",
      "Heart Failure",
      "New onset <48h"
    ],
    "must_not_miss_flags": [
      "Atrial Fibrillation",
      "SVT",
      "Ventricular Tachycardia"
    ],
    "admission_justification_template": "Patient presents with tachycardia and palpitations. ECG confirms Atrial Flutter with {conduction_ratio} conduction and pulse {hr}/min. {instability_flag}. Inpatient rate/rhythm control and {plan_ablation} required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1028",
    "pmjay_package_rate": 10000,
    "ward_type": "icu",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 20000,
        "max": 50000
      },
      "privateRoom": {
        "min": 35000,
        "max": 90000
      },
      "icu": {
        "min": 60000,
        "max": 150000
      },
      "daycare": {
        "min": 40000,
        "max": 100000
      }
    },
    "code": "I48.92",
    "commonName": "Atrial Flutter",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "ECG showing \"saw-tooth\" waves",
      "Atrial rate vs Ventricular rate",
      "Was DC cardioversion done?",
      "Indication for RF ablation"
    ],
    "mandatoryDocuments": [
      {
        "id": "flutter_ecg",
        "name": "ECG showing Saw-tooth flutter waves",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-052",
    "specialty": "Cardiology",
    "subcategory": "Arrhythmias",
    "condition_name": "Wolff-Parkinson-White (WPW) Syndrome",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I45.6",
        "description": "Pre-excitation syndrome",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 4,
      "average": 2
    },
    "expected_procedures": [
      "37.34"
    ],
    "tpa_query_triggers": [
      "ECG showing Delta wave and short PR interval",
      "History of SVT or syncope",
      "EP study and Ablation report"
    ],
    "documentation_must_include": [
      "ECG showing pre-excitation (Delta wave)"
    ],
    "india_specific_notes": "WPW with AF is a medical emergency — avoid AV nodal blockers (Verapamil/Digoxin)",
    "severity_markers": [
      "WPW with Atrial Fibrillation (Emergency)",
      "Delta-wave HR >250",
      "Syncope",
      "Short R-R interval <250ms"
    ],
    "must_not_miss_flags": [
      "SVT",
      "Ebstein Anomaly",
      "HOCM association"
    ],
    "admission_justification_template": "Patient presents with {symptoms}. ECG shows short PR interval and Delta waves consistent with WPW syndrome. {tachycardia_type}. Inpatient EP study and accessory pathway ablation required to prevent life-threatening arrhythmias.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1029",
    "pmjay_package_rate": 12000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 20000,
        "max": 50000
      },
      "privateRoom": {
        "min": 35000,
        "max": 90000
      },
      "icu": {
        "min": 60000,
        "max": 150000
      },
      "daycare": {
        "min": 50000,
        "max": 120000
      }
    },
    "code": "I45.6",
    "commonName": "Wolff-Parkinson-White (WPW) Syndrome",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 4,
      "average": 2
    },
    "commonTPAQueries": [
      "ECG showing Delta wave and short PR interval",
      "History of SVT or syncope",
      "EP study and Ablation report"
    ],
    "mandatoryDocuments": [
      {
        "id": "delta_wave_ecg",
        "name": "ECG showing pre-excitation (Delta wave)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "CARD-053",
    "specialty": "Cardiology",
    "subcategory": "Arrhythmias",
    "condition_name": "Sick Sinus Syndrome (SSS)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I49.5",
        "description": "Sick sinus syndrome",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 5
    },
    "expected_procedures": [
      "37.83"
    ],
    "tpa_query_triggers": [
      "Evidence of sinus pauses / brady-tachy syndrome",
      "Correlation of symptoms with heart rate",
      "Holter Monitor report",
      "Pacemaker indication"
    ],
    "documentation_must_include": [
      "24-hour Holter Monitor showing pauses / chronotropic incompetence"
    ],
    "india_specific_notes": "Pacemaker (PPI) is the standard treatment for symptomatic SSS",
    "severity_markers": [
      "Sinus pauses >3 seconds",
      "Symptomatic bradycardia",
      "Tachy-Brady syndrome",
      "Syncope"
    ],
    "must_not_miss_flags": [
      "Drug-induced bradycardia",
      "Hypothyroidism",
      "Hyperkalemia"
    ],
    "admission_justification_template": "Patient presents with syncope and dizziness. Holter shows sinus pauses of {pause_duration} seconds and {tachy_brady_flag}. Diagnosis consistent with Sick Sinus Syndrome. Inpatient admission for PPI required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "CT-1030",
    "pmjay_package_rate": 60000,
    "ward_type": "icu",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 100000,
        "max": 250000
      },
      "privateRoom": {
        "min": 180000,
        "max": 450000
      },
      "icu": {
        "min": 250000,
        "max": 600000
      },
      "daycare": null
    },
    "code": "I49.5",
    "commonName": "Sick Sinus Syndrome (SSS)",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 5
    },
    "commonTPAQueries": [
      "Evidence of sinus pauses / brady-tachy syndrome",
      "Correlation of symptoms with heart rate",
      "Holter Monitor report",
      "Pacemaker indication"
    ],
    "mandatoryDocuments": [
      {
        "id": "holter_sss",
        "name": "24-hour Holter Monitor showing pauses / chronotropic incompetence",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "SURG-054",
    "specialty": "Surgery",
    "subcategory": "Hepatobiliary",
    "condition_name": "Cholelithiasis / Gallstones",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K80.20",
        "description": "Calculus of gallbladder without cholecystitis",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 6,
      "average": 4
    },
    "expected_procedures": [
      "51.23",
      "51.22"
    ],
    "tpa_query_triggers": [
      "USG abdomen confirming gallstones mandatory",
      "Pre-operative fitness assessment",
      "Was acute cholecystitis or jaundice present? Submit LFT",
      "OT notes and laparoscopy/open surgery details",
      "If converted from lap to open — document reason"
    ],
    "documentation_must_include": [
      "USG Abdomen — Gallstone Confirmation Report",
      "Liver Function Tests",
      "Pre-Operative Fitness Certificate",
      "Operation Theatre Notes",
      "Anaesthesia Notes"
    ],
    "india_specific_notes": "Symptomatic cholelithiasis (biliary colic) has clear surgical indication Laparoscopic cholecystectomy is standard — open conversion must be documented with reason",
    "severity_markers": [
      "Acute cholecystitis",
      "CBD dilation >8mm",
      "Jaundice",
      "Fever + RUQ pain + Jaundice (Charcots triad)"
    ],
    "must_not_miss_flags": [
      "Cholangitis",
      "CBD stones",
      "Gallbladder carcinoma",
      "Hepatitis"
    ],
    "admission_justification_template": "Patient with symptomatic cholelithiasis confirmed on USG abdomen showing {stone_details}. {symptoms}. Elective laparoscopic cholecystectomy indicated for {indication}. Pre-operative workup completed. Surgical intervention required to prevent complications of acute cholecystitis, pancreatitis, or CBD obstruction.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "SG-1024",
    "pmjay_package_rate": 22000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 45000,
        "max": 90000
      },
      "privateRoom": {
        "min": 70000,
        "max": 150000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": null
    },
    "code": "K80.20",
    "commonName": "Cholelithiasis / Gallstones",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 6,
      "average": 4
    },
    "commonTPAQueries": [
      "USG abdomen confirming gallstones mandatory",
      "Pre-operative fitness assessment",
      "Was acute cholecystitis or jaundice present? Submit LFT",
      "OT notes and laparoscopy/open surgery details",
      "If converted from lap to open — document reason"
    ],
    "mandatoryDocuments": [
      {
        "id": "usg_gb",
        "name": "USG Abdomen — Gallstone Confirmation Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Radiological confirmation of cholelithiasis not provided"
      },
      {
        "id": "lft",
        "name": "Liver Function Tests",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Biliary obstruction not assessed"
      },
      {
        "id": "preop_fitness",
        "name": "Pre-Operative Fitness Certificate",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Surgical fitness not documented"
      },
      {
        "id": "ot_notes",
        "name": "Operation Theatre Notes",
        "category": "operative",
        "mandatory": true,
        "tpaQueryIfMissing": "Surgical procedure details not provided"
      },
      {
        "id": "anaesthesia_notes",
        "name": "Anaesthesia Notes",
        "category": "operative",
        "mandatory": true,
        "tpaQueryIfMissing": "Anaesthesia type and events not documented"
      }
    ]
  },
  {
    "id": "GAST-055",
    "specialty": "Gastroenterology",
    "subcategory": "Pancreatic",
    "condition_name": "Acute Pancreatitis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K85.9",
        "description": "Acute pancreatitis, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 5,
      "max": 21,
      "average": 8
    },
    "expected_procedures": [
      "52.09",
      "99.18"
    ],
    "tpa_query_triggers": [
      "Serum amylase and lipase values mandatory",
      "CT abdomen / CECT for severity grading",
      "APACHE-II or Ranson score documentation",
      "Daily fluid balance — pancreatitis requires aggressive resuscitation",
      "Justify ICU admission with clinical parameters"
    ],
    "documentation_must_include": [
      "Serum Amylase and Lipase (>3x upper limit)",
      "CT Abdomen with Contrast (CECT) — Severity Grade",
      "Daily Fluid Balance Chart",
      "USG Abdomen (etiology — gallstones, CBD)"
    ],
    "india_specific_notes": "CECT abdomen is both diagnostic and required by TPA for severity grading Alcoholic pancreatitis — some TPAs may query alcohol history",
    "severity_markers": [
      "Amylase >3x ULN",
      "CECT grade D/E",
      "Ranson score ≥3",
      "Organ failure",
      "Infected necrosis"
    ],
    "must_not_miss_flags": [
      "Mesenteric ischemia",
      "Perforated peptic ulcer",
      "Biliary obstruction"
    ],
    "admission_justification_template": "Patient presents with acute pancreatitis — serum amylase {amylase} U/L ({x}x upper limit of normal) with severe epigastric pain and vomiting. CECT abdomen confirms {severity} acute pancreatitis (CT Severity Index: {ctsi}). {organ_failure}. Aggressive IV fluid resuscitation, bowel rest, and close monitoring for complications (necrosis, pseudocyst, organ failure) required in inpatient setting.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "GS-1018",
    "pmjay_package_rate": 18000,
    "ward_type": "any",
    "icu_probability": "high",
    "cost_estimate": {
      "generalWard": {
        "min": 40000,
        "max": 120000
      },
      "privateRoom": {
        "min": 70000,
        "max": 220000
      },
      "icu": {
        "min": 120000,
        "max": 400000
      },
      "daycare": null
    },
    "code": "K85.9",
    "commonName": "Acute Pancreatitis",
    "icuProbability": "high",
    "typicalLOS": {
      "min": 5,
      "max": 21,
      "average": 8
    },
    "commonTPAQueries": [
      "Serum amylase and lipase values mandatory",
      "CT abdomen / CECT for severity grading",
      "APACHE-II or Ranson score documentation",
      "Daily fluid balance — pancreatitis requires aggressive resuscitation",
      "Justify ICU admission with clinical parameters"
    ],
    "mandatoryDocuments": [
      {
        "id": "amylase_lipase",
        "name": "Serum Amylase and Lipase (>3x upper limit)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Biochemical diagnosis not established"
      },
      {
        "id": "cect_abdomen",
        "name": "CT Abdomen with Contrast (CECT) — Severity Grade",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Severity of pancreatitis not radiologically graded — CT Severity Index required"
      },
      {
        "id": "fluid_balance",
        "name": "Daily Fluid Balance Chart",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Fluid resuscitation volume and response not documented"
      },
      {
        "id": "usg_pancreatitis",
        "name": "USG Abdomen (etiology — gallstones, CBD)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Etiology investigation not documented"
      }
    ]
  },
  {
    "id": "SURG-056",
    "specialty": "Surgery",
    "subcategory": "Colorectal",
    "condition_name": "Acute Diverticulitis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K57.30",
        "description": "Diverticulosis of large intestine without perforation or abscess",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 4,
      "max": 8,
      "average": 5
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "CT abdomen confirming diverticulitis required",
      "Was abscess or perforation present?"
    ],
    "documentation_must_include": [
      "CT Abdomen (Hinchey grading)",
      "CBC with TLC"
    ],
    "india_specific_notes": "CT abdomen is mandatory for confirming diverticulitis — clinical diagnosis alone insufficient for TPA",
    "severity_markers": [
      "Perforation on CT",
      "Fecal peritonitis",
      "TLC >18,000",
      "Pericolic abscess"
    ],
    "must_not_miss_flags": [
      "Colorectal carcinoma",
      "Ischemic colitis",
      "Crohn's disease"
    ],
    "admission_justification_template": "Patient presents with left iliac fossa pain, fever, and leukocytosis. CT abdomen confirms acute diverticulitis (Hinchey Grade {grade}) with {complications}. IV antibiotics and bowel rest required in inpatient setting.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "GS-1033",
    "pmjay_package_rate": 9800,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 25000,
        "max": 65000
      },
      "privateRoom": {
        "min": 45000,
        "max": 110000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": null
    },
    "code": "K57.30",
    "commonName": "Acute Diverticulitis",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 4,
      "max": 8,
      "average": 5
    },
    "commonTPAQueries": [
      "CT abdomen confirming diverticulitis required",
      "Was abscess or perforation present?"
    ],
    "mandatoryDocuments": [
      {
        "id": "ct_diverticulitis",
        "name": "CT Abdomen (Hinchey grading)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Radiological confirmation required"
      },
      {
        "id": "cbc_diverticulitis",
        "name": "CBC with TLC",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Infection severity not hematologically documented"
      }
    ]
  },
  {
    "id": "GAST-057",
    "specialty": "Gastroenterology",
    "subcategory": "Hepatology",
    "condition_name": "Variceal Bleed (Hematemesis)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I85.01",
        "description": "Esophageal varices with bleeding",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 5,
      "max": 12,
      "average": 7
    },
    "expected_procedures": [
      "42.33"
    ],
    "tpa_query_triggers": [
      "Upper GI Endoscopy report showing variceal bleed",
      "Was EVL (Banding) done? Sticker mandatory",
      "Hb level at admission and trend",
      "Child-Pugh Score"
    ],
    "documentation_must_include": [
      "Emergency Endoscopy Report with intervention details",
      "Endoscopic Banding (EVL) Sticker (Original)"
    ],
    "india_specific_notes": "Octreotide/Terlipressin administration should be vividly documented",
    "severity_markers": [
      "Active spurting on endoscopy",
      "Shock (BP <90)",
      "Hb <7",
      "Child-Pugh Class C",
      "Hepatic Encephalopathy"
    ],
    "must_not_miss_flags": [
      "Peptic Ulcer Bleed",
      "Dieulafoy Lesion",
      "Gastric Antral Vascular Ectasia"
    ],
    "admission_justification_template": "Patient presents with massive hematemesis and melena. BP {bp}, HR {hr}. Hb {hb}. Endoscopy confirms {grade} esophageal varices with {bleeding_status}. {evl_performed}. Emergency ICU management, IV vasoactive drugs, and monitoring for re-bleed required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1052",
    "pmjay_package_rate": 15000,
    "ward_type": "icu",
    "icu_probability": "high",
    "cost_estimate": {
      "generalWard": {
        "min": 40000,
        "max": 100000
      },
      "privateRoom": {
        "min": 70000,
        "max": 180000
      },
      "icu": {
        "min": 120000,
        "max": 350000
      },
      "daycare": null
    },
    "code": "I85.01",
    "commonName": "Variceal Bleed (Hematemesis)",
    "icuProbability": "high",
    "typicalLOS": {
      "min": 5,
      "max": 12,
      "average": 7
    },
    "commonTPAQueries": [
      "Upper GI Endoscopy report showing variceal bleed",
      "Was EVL (Banding) done? Sticker mandatory",
      "Hb level at admission and trend",
      "Child-Pugh Score"
    ],
    "mandatoryDocuments": [
      {
        "id": "endoscopy_bleed",
        "name": "Emergency Endoscopy Report with intervention details",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "evl_sticker",
        "name": "Endoscopic Banding (EVL) Sticker (Original)",
        "category": "implant",
        "mandatory": true,
        "whenRequired": "if EVL done",
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GAST-058",
    "specialty": "Gastroenterology",
    "subcategory": "Upper GI",
    "condition_name": "GERD / Acid Reflux",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K21.0",
        "description": "Gastro-esophageal reflux disease with esophagitis",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "expected_procedures": [
      "44.13"
    ],
    "tpa_query_triggers": [
      "Endoscopy report showing esophagitis (LA Grade)",
      "Why was OPD management insufficient?",
      "Previous treatment history"
    ],
    "documentation_must_include": [
      "Upper GI Endoscopy Report"
    ],
    "india_specific_notes": "LA Grade A/B esophagitis is almost always considered OPD by TPAs",
    "severity_markers": [
      "LA Grade C/D Esophagitis",
      "Barrett's Esophagus",
      "Stricture formation",
      "Severe dysphagia"
    ],
    "must_not_miss_flags": [
      "Eosinophilic Esophagitis",
      "Esophageal Cancer",
      "Coronary Artery Disease"
    ],
    "admission_justification_template": "Patient presents with severe retrosternal burning and {dysphagia}. Endoscopy shows LA Grade {grade} esophagitis. {barretts_flag}. Inpatient / Daycare management for dose escalation and monitoring required.",
    "pmjay_eligible": false,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 10000,
        "max": 25000
      },
      "privateRoom": {
        "min": 18000,
        "max": 45000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 8000,
        "max": 15000
      }
    },
    "code": "K21.0",
    "commonName": "GERD / Acid Reflux",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "commonTPAQueries": [
      "Endoscopy report showing esophagitis (LA Grade)",
      "Why was OPD management insufficient?",
      "Previous treatment history"
    ],
    "mandatoryDocuments": [
      {
        "id": "endo_gerd",
        "name": "Upper GI Endoscopy Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GAST-059",
    "specialty": "Gastroenterology",
    "subcategory": "Esophageal",
    "condition_name": "Achalasia Cardia",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K22.0",
        "description": "Achalasia of cardia",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "expected_procedures": [
      "42.7"
    ],
    "tpa_query_triggers": [
      "Barium Swallow showing \"Bird-beak\" appearance",
      "High-Resolution Manometry (HRM) data",
      "Endoscopy showing dilated esophagus"
    ],
    "documentation_must_include": [
      "High Resolution Manometry Report",
      "Barium Swallow X-ray films"
    ],
    "india_specific_notes": "POEM (Per-Oral Endoscopic Myotomy) is a modern high-cost intervention",
    "severity_markers": [
      "Sigmoid Esophagus",
      "Weight loss >10%",
      "Recurrent aspiration pneumonia",
      "Eckardt Score >6"
    ],
    "must_not_miss_flags": [
      "Pseudoachalasia (Malignancy)",
      "Chagas Disease"
    ],
    "admission_justification_template": "Patient presents with progressive dysphagia and regurgitation. Barium swallow shows bird-beak appearance. Manometry confirms Type {type} Achalasia. Eckardt score {score}. Inpatient admission for {procedure_type} (Heller's / POEM) required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "GS-1012",
    "pmjay_package_rate": 15000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 40000,
        "max": 100000
      },
      "privateRoom": {
        "min": 70000,
        "max": 180000
      },
      "icu": {
        "min": 100000,
        "max": 250000
      },
      "daycare": null
    },
    "code": "K22.0",
    "commonName": "Achalasia Cardia",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "commonTPAQueries": [
      "Barium Swallow showing \"Bird-beak\" appearance",
      "High-Resolution Manometry (HRM) data",
      "Endoscopy showing dilated esophagus"
    ],
    "mandatoryDocuments": [
      {
        "id": "hrm_report",
        "name": "High Resolution Manometry Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "barium_swallow",
        "name": "Barium Swallow X-ray films",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GAST-060",
    "specialty": "Gastroenterology",
    "subcategory": "IBD",
    "condition_name": "Crohn's Disease",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K50.9",
        "description": "Crohn's disease, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 4,
      "max": 12,
      "average": 7
    },
    "expected_procedures": [
      "45.23"
    ],
    "tpa_query_triggers": [
      "Colonoscopy/Enteroscopy report with biopsies",
      "CT/MRI Enterography results",
      "Was biologic (Infliximab) used? Expense justification",
      "Fecal Calprotectin levels"
    ],
    "documentation_must_include": [
      "Colonoscopy Report with Histopathology",
      "CT Enterography Report"
    ],
    "india_specific_notes": "TB vs Crohn's is a common TPA query — document why TB was ruled out",
    "severity_markers": [
      "Stricture / Obstruction",
      "Fistulizing disease",
      "Weight loss >15%",
      "Abscess formation",
      "Anemia (Hb <8)"
    ],
    "must_not_miss_flags": [
      "Intestinal TB (main DD in India)",
      "Lymphoma",
      "Behcet's Disease"
    ],
    "admission_justification_template": "Patient presents with acute flare of Crohn's disease including abdominal pain and {stool_frequency} stools/day. CTE shows {involvement_area}. Biopsy confirms Crohn's. {fistula_status}. Inpatient management with IV steroids / biologics and monitoring for obstruction required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1054",
    "pmjay_package_rate": 12000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 30000,
        "max": 80000
      },
      "privateRoom": {
        "min": 55000,
        "max": 150000
      },
      "icu": {
        "min": 100000,
        "max": 250000
      },
      "daycare": {
        "min": 15000,
        "max": 40000
      }
    },
    "code": "K50.9",
    "commonName": "Crohn's Disease",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 4,
      "max": 12,
      "average": 7
    },
    "commonTPAQueries": [
      "Colonoscopy/Enteroscopy report with biopsies",
      "CT/MRI Enterography results",
      "Was biologic (Infliximab) used? Expense justification",
      "Fecal Calprotectin levels"
    ],
    "mandatoryDocuments": [
      {
        "id": "colonoscopy_ibi",
        "name": "Colonoscopy Report with Histopathology",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "cte_report",
        "name": "CT Enterography Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GAST-061",
    "specialty": "Gastroenterology",
    "subcategory": "IBD",
    "condition_name": "Ulcerative Colitis (UC)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K51.9",
        "description": "Ulcerative colitis, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 4,
      "max": 12,
      "average": 7
    },
    "expected_procedures": [
      "45.23"
    ],
    "tpa_query_triggers": [
      "Colonoscopy with Mayo Score / UCEIS score",
      "Number of bloody stools per day",
      "CRP/Albumin levels",
      "Is Toxic Megacolon ruled out?"
    ],
    "documentation_must_include": [
      "Colonoscopy with biopsy and Mayo Score"
    ],
    "india_specific_notes": "Truelove and Witts criteria should be used to justify admission for severe UC",
    "severity_markers": [
      "Bloody stools >6/day",
      "Tachycardia / Fever",
      "Albumin <3.0",
      "Toxic Megacolon (Diameter >6cm)"
    ],
    "must_not_miss_flags": [
      "CMV Colitis",
      "C. difficile infection",
      "Ischemic Colitis"
    ],
    "admission_justification_template": "Patient presents with severe UC flare (Mayo Score {score}). Bloody stools {count}/day. Albumin {alb}, CRP {crp}. {megacolon_flag}. Inpatient management with IV steroids, hydration, and surgical backup for toxic megacolon monitoring required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1055",
    "pmjay_package_rate": 12000,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 30000,
        "max": 80000
      },
      "privateRoom": {
        "min": 55000,
        "max": 150000
      },
      "icu": {
        "min": 100000,
        "max": 300000
      },
      "daycare": {
        "min": 15000,
        "max": 40000
      }
    },
    "code": "K51.9",
    "commonName": "Ulcerative Colitis (UC)",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 4,
      "max": 12,
      "average": 7
    },
    "commonTPAQueries": [
      "Colonoscopy with Mayo Score / UCEIS score",
      "Number of bloody stools per day",
      "CRP/Albumin levels",
      "Is Toxic Megacolon ruled out?"
    ],
    "mandatoryDocuments": [
      {
        "id": "colonoscopy_uc",
        "name": "Colonoscopy with biopsy and Mayo Score",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GAST-062",
    "specialty": "Gastroenterology",
    "subcategory": "Upper GI",
    "condition_name": "Gastritis / Erosive Gastritis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K29.7",
        "description": "Gastritis, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "expected_procedures": [
      "44.13"
    ],
    "tpa_query_triggers": [
      "Endoscopy confirming erosions",
      "Cause (NSAIDs/Alcohol/Stress)",
      "Severity of pain"
    ],
    "documentation_must_include": [
      "Upper GI Endoscopy Report"
    ],
    "india_specific_notes": "Only erosive gastritis with bleeding or severe dehydration justifies admission",
    "severity_markers": [
      "Hematemesis / Melena",
      "Erosive gastritis with multiple bleeds",
      "Intractible vomiting"
    ],
    "must_not_miss_flags": [
      "Peptic Ulcer",
      "Gastric Cancer",
      "Pancreatitis"
    ],
    "admission_justification_template": "Patient presents with severe epigastric pain and {vomiting}. Endoscopy confirms erosive gastritis with {bleeding_points}. Inpatient / Daycare management for IV PPIs and stabilization required.",
    "pmjay_eligible": false,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 8000,
        "max": 20000
      },
      "privateRoom": {
        "min": 15000,
        "max": 35000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 6000,
        "max": 12000
      }
    },
    "code": "K29.7",
    "commonName": "Gastritis / Erosive Gastritis",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "commonTPAQueries": [
      "Endoscopy confirming erosions",
      "Cause (NSAIDs/Alcohol/Stress)",
      "Severity of pain"
    ],
    "mandatoryDocuments": [
      {
        "id": "endo_gastritis",
        "name": "Upper GI Endoscopy Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GAST-063",
    "specialty": "Gastroenterology",
    "subcategory": "Functional GI",
    "condition_name": "Irritable Bowel Syndrome (IBS)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K58.9",
        "description": "Irritable bowel syndrome without diarrhea",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 2,
      "average": 1
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Rome IV criteria documentation",
      "Why was admission required for functional disorder?",
      "Warning signs Rule-out"
    ],
    "documentation_must_include": [],
    "india_specific_notes": "TPA will almost certainly reject an IBS admission unless other complications exist",
    "severity_markers": [
      "Severe disability / Inability to work",
      "Association with severe psych distress"
    ],
    "must_not_miss_flags": [
      "IBD",
      "Colorectal Cancer",
      "Celiac Disease"
    ],
    "admission_justification_template": "Patient presents with severe chronic abdominal pain and {symptoms} consistent with IBS. Inpatient workup to rule out organic disease and stabilize severe functional symptoms required.",
    "pmjay_eligible": false,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 5000,
        "max": 12000
      },
      "privateRoom": {
        "min": 10000,
        "max": 25000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": null
    },
    "code": "K58.9",
    "commonName": "Irritable Bowel Syndrome (IBS)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 2,
      "average": 1
    },
    "commonTPAQueries": [
      "Rome IV criteria documentation",
      "Why was admission required for functional disorder?",
      "Warning signs Rule-out"
    ],
    "mandatoryDocuments": []
  },
  {
    "id": "GAST-064",
    "specialty": "Gastroenterology",
    "subcategory": "Functional GI",
    "condition_name": "Functional Dyspepsia",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K30",
        "description": "Functional dyspepsia",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 2,
      "average": 1
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Endoscopy report (must be normal)",
      "Psychological assessment"
    ],
    "documentation_must_include": [
      "Upper GI Endoscopy Report (Normal)"
    ],
    "india_specific_notes": "Dyspepsia is a diagnosis of exclusion — document exclusion of organic disease",
    "severity_markers": [],
    "must_not_miss_flags": [
      "Gastric cancer",
      "Gallstones",
      "Pancreatic cancer"
    ],
    "admission_justification_template": "Patient presents with chronic epigastric fullness and pain. Negative endoscopy and USG suggests functional dyspepsia. Inpatient management for symptom control and lifestyle counseling required.",
    "pmjay_eligible": false,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 5000,
        "max": 12000
      },
      "privateRoom": {
        "min": 10000,
        "max": 25000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": null
    },
    "code": "K30",
    "commonName": "Functional Dyspepsia",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 2,
      "average": 1
    },
    "commonTPAQueries": [
      "Endoscopy report (must be normal)",
      "Psychological assessment"
    ],
    "mandatoryDocuments": [
      {
        "id": "endo_dyspepsia",
        "name": "Upper GI Endoscopy Report (Normal)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GAST-065",
    "specialty": "Gastroenterology",
    "subcategory": "Malabsorption",
    "condition_name": "Celiac Disease / Gluten Enteropathy",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K90.0",
        "description": "Celiac disease",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [
      "45.13"
    ],
    "tpa_query_triggers": [
      "Anti-tTG IgA levels",
      "D2 Biopsy showing Marsh grading",
      "Clinical symptoms (Diarrhea/Weight loss)"
    ],
    "documentation_must_include": [
      "Anti-tTG IgA Serology",
      "Duodenal (D2) Biopsy History Report"
    ],
    "india_specific_notes": "Celiac Crisis with severe electrolyte imbalance is an emergency admission",
    "severity_markers": [
      "Marsh 3b/3c",
      "Severe malnutrition / BMI <15",
      "Hypocalcemic tetany",
      "Celiac Crisis"
    ],
    "must_not_miss_flags": [
      "Intestinal Lymphoma",
      "Tropical Sprue",
      "Crohn's Disease"
    ],
    "admission_justification_template": "Patient presents with chronic malabsorption diarrhea and extreme weakness. Anti-tTG {ttg}. Biopsy shows Marsh {grade}. {malnutrition_status}. Inpatient management for metabolic correction and dietary stabilization required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1056",
    "pmjay_package_rate": 8500,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 15000,
        "max": 40000
      },
      "privateRoom": {
        "min": 25000,
        "max": 70000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 10000,
        "max": 25000
      }
    },
    "code": "K90.0",
    "commonName": "Celiac Disease / Gluten Enteropathy",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "Anti-tTG IgA levels",
      "D2 Biopsy showing Marsh grading",
      "Clinical symptoms (Diarrhea/Weight loss)"
    ],
    "mandatoryDocuments": [
      {
        "id": "ttg_report",
        "name": "Anti-tTG IgA Serology",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "d2_biopsy",
        "name": "Duodenal (D2) Biopsy History Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "GAST-066",
    "specialty": "Gastroenterology",
    "subcategory": "Hepatology",
    "condition_name": "Hepatic Encephalopathy / Liver Failure",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K72.9",
        "description": "Hepatic failure, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 5,
      "max": 14,
      "average": 8
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "West Haven Grade of Encephalopathy",
      "Serum Ammonia levels",
      "Precipitating factor (Infection/Bleed/Constipation)",
      "Liver failure timeline (Acute vs Chronic)"
    ],
    "documentation_must_include": [
      "Serum Ammonia Level",
      "LFT and Coagulation profile"
    ],
    "india_specific_notes": "Lactulose and Rifaximin therapy should be documented",
    "severity_markers": [
      "Grade III/IV Encephalopathy (Coma)",
      "INR >2.5",
      "Hypoglycemia",
      "Cerebral Edema"
    ],
    "must_not_miss_flags": [
      "Intracranial Hemorrhage",
      "Wernicke Encephalopathy",
      "Meningitis"
    ],
    "admission_justification_template": "Patient presents with altered sensorium and jaundice. Grade {grade} Hepatic Encephalopathy. Precipitating factor: {factor}. Ammonia {ammonia}. {coagulopathy_flag}. Emergency ICU management and monitoring for liver failure required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "MD-1057",
    "pmjay_package_rate": 15000,
    "ward_type": "icu",
    "icu_probability": "high",
    "cost_estimate": {
      "generalWard": {
        "min": 50000,
        "max": 120000
      },
      "privateRoom": {
        "min": 80000,
        "max": 220000
      },
      "icu": {
        "min": 150000,
        "max": 450000
      },
      "daycare": null
    },
    "code": "K72.9",
    "commonName": "Hepatic Encephalopathy / Liver Failure",
    "icuProbability": "high",
    "typicalLOS": {
      "min": 5,
      "max": 14,
      "average": 8
    },
    "commonTPAQueries": [
      "West Haven Grade of Encephalopathy",
      "Serum Ammonia levels",
      "Precipitating factor (Infection/Bleed/Constipation)",
      "Liver failure timeline (Acute vs Chronic)"
    ],
    "mandatoryDocuments": [
      {
        "id": "ammonia_level",
        "name": "Serum Ammonia Level",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "lft_failure",
        "name": "LFT and Coagulation profile",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "ORTH-067",
    "specialty": "Orthopedics",
    "subcategory": "Fractures — Lower Limb",
    "condition_name": "Hip Fracture / Neck of Femur Fracture",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "S72.001A",
        "description": "Fracture of unspecified part of neck of right femur, initial encounter",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 7,
      "max": 14,
      "average": 9
    },
    "expected_procedures": [
      "81.52",
      "79.35",
      "81.51"
    ],
    "tpa_query_triggers": [
      "X-ray pelvis and hip confirming fracture",
      "Implant stickers mandatory — original physical stickers required",
      "OT notes with implant details (company, model, size)",
      "Pre-operative fitness — especially for elderly patients",
      "Post-operative X-ray showing implant position"
    ],
    "documentation_must_include": [
      "X-Ray Pelvis with Hip (AP and Lateral views)",
      "Implant Sticker — Original Physical Sticker (not photocopy)",
      "Implant Invoice from Supplier",
      "Operation Theatre Notes with Implant Details",
      "Pre-Operative ECG (especially >60 years)",
      "Post-Operative X-Ray Showing Implant Position"
    ],
    "india_specific_notes": "Implant sticker is the single most common rejection reason for orthopedic claims — it MUST be the original physical sticker attached to the claim form, not a photocopy or printout Implant cost often exceeds package rate — pre-authorize implant separately",
    "severity_markers": [
      "Displaced fracture",
      "Intracapsular vs extracapsular",
      "Garden classification",
      "AO/OTA classification",
      "Vascular compromise"
    ],
    "must_not_miss_flags": [
      "Pathological fracture (malignancy)",
      "Avascular necrosis of femoral head"
    ],
    "admission_justification_template": "Patient presents with {mechanism} resulting in {fracture_type} hip fracture confirmed on X-ray (Garden Grade {grade} / AO Type {ao_type}). Surgical intervention with {implant_type} required. Pre-operative workup completed. Risk of avascular necrosis, non-union, and permanent disability without surgical fixation. Inpatient management, surgical fixation, and post-operative rehabilitation required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "OR-1008",
    "pmjay_package_rate": 45000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 80000,
        "max": 200000
      },
      "privateRoom": {
        "min": 140000,
        "max": 350000
      },
      "icu": {
        "min": 200000,
        "max": 450000
      },
      "daycare": null
    },
    "code": "S72.001A",
    "commonName": "Hip Fracture / Neck of Femur Fracture",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 7,
      "max": 14,
      "average": 9
    },
    "commonTPAQueries": [
      "X-ray pelvis and hip confirming fracture",
      "Implant stickers mandatory — original physical stickers required",
      "OT notes with implant details (company, model, size)",
      "Pre-operative fitness — especially for elderly patients",
      "Post-operative X-ray showing implant position"
    ],
    "mandatoryDocuments": [
      {
        "id": "xray_hip",
        "name": "X-Ray Pelvis with Hip (AP and Lateral views)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Fracture not radiologically confirmed"
      },
      {
        "id": "implant_sticker_hip",
        "name": "Implant Sticker — Original Physical Sticker (not photocopy)",
        "category": "implant",
        "mandatory": true,
        "whenRequired": "if PFNA nail, DHS, or prosthesis used",
        "tpaQueryIfMissing": "Implant identity and cost cannot be verified without original manufacturer sticker"
      },
      {
        "id": "implant_invoice",
        "name": "Implant Invoice from Supplier",
        "category": "implant",
        "mandatory": true,
        "whenRequired": "if implant used",
        "tpaQueryIfMissing": "Cost of implant not verifiable"
      },
      {
        "id": "ot_notes_hip",
        "name": "Operation Theatre Notes with Implant Details",
        "category": "operative",
        "mandatory": true,
        "tpaQueryIfMissing": "Surgical procedure and implant specifications not documented"
      },
      {
        "id": "preop_ecg",
        "name": "Pre-Operative ECG (especially >60 years)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Pre-operative cardiac clearance not documented"
      },
      {
        "id": "postop_xray",
        "name": "Post-Operative X-Ray Showing Implant Position",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Surgical outcome not radiologically confirmed"
      }
    ]
  },
  {
    "id": "ORTH-068",
    "specialty": "Orthopedics",
    "subcategory": "Joint Replacement",
    "condition_name": "Total Knee Replacement (TKR) / Knee Osteoarthritis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "M17.11",
        "description": "Primary osteoarthritis, right knee",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 5,
      "max": 8,
      "average": 6
    },
    "expected_procedures": [
      "81.54"
    ],
    "tpa_query_triggers": [
      "X-ray knee standing (weight-bearing) confirming grade 3-4 OA",
      "Implant stickers — both femoral and tibial components",
      "Conservative treatment failure documentation",
      "Functional disability assessment",
      "Pre-operative fitness for elective surgery"
    ],
    "documentation_must_include": [
      "X-Ray Knee — Standing Weight-Bearing AP View (both knees)",
      "Documentation of Failed Conservative Treatment (physio, injections, medications — minimum 6 months)",
      "Implant Stickers — ALL Components (femoral, tibial, patella, polyethylene insert)",
      "OT Notes with Implant Details"
    ],
    "india_specific_notes": "Weight-bearing X-ray is non-negotiable — many hospitals submit supine films which TPAs reject Document exactly what conservative treatment was tried and for how long All implant components need individual stickers — including polyethylene insert which is often missed",
    "severity_markers": [
      "Kellgren-Lawrence Grade 3-4",
      "Bone-on-bone appearance",
      "Severe functional limitation",
      "Failed conservative treatment"
    ],
    "must_not_miss_flags": [
      "Septic arthritis",
      "Knee malignancy",
      "Inflammatory arthritis"
    ],
    "admission_justification_template": "Patient with Kellgren-Lawrence Grade {kl_grade} bilateral knee osteoarthritis (right worse than left). Weight-bearing X-ray shows {xray_findings}. Failed conservative management including {conservative_treatment} for {duration} with no functional improvement. Severe functional limitation — {functional_status}. Total knee replacement indicated for pain relief and functional restoration.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "OR-1022",
    "pmjay_package_rate": 80000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 180000,
        "max": 400000
      },
      "privateRoom": {
        "min": 280000,
        "max": 650000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": null
    },
    "code": "M17.11",
    "commonName": "Total Knee Replacement (TKR) / Knee Osteoarthritis",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 5,
      "max": 8,
      "average": 6
    },
    "commonTPAQueries": [
      "X-ray knee standing (weight-bearing) confirming grade 3-4 OA",
      "Implant stickers — both femoral and tibial components",
      "Conservative treatment failure documentation",
      "Functional disability assessment",
      "Pre-operative fitness for elective surgery"
    ],
    "mandatoryDocuments": [
      {
        "id": "xray_knee_wt",
        "name": "X-Ray Knee — Standing Weight-Bearing AP View (both knees)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Arthritis grading requires weight-bearing film — non-weight-bearing X-ray is insufficient for TKR justification"
      },
      {
        "id": "conservative_failure",
        "name": "Documentation of Failed Conservative Treatment (physio, injections, medications — minimum 6 months)",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Surgical intervention unjustified without evidence of failed conservative management"
      },
      {
        "id": "implant_stickers_tkr",
        "name": "Implant Stickers — ALL Components (femoral, tibial, patella, polyethylene insert)",
        "category": "implant",
        "mandatory": true,
        "tpaQueryIfMissing": "All prosthesis components must have original stickers"
      },
      {
        "id": "ot_notes_tkr",
        "name": "OT Notes with Implant Details",
        "category": "operative",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "ORTH-069",
    "specialty": "Orthopedics",
    "subcategory": "Spine",
    "condition_name": "Lumbar Disc Disease / PIVD",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "M54.5",
        "description": "Low back pain",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "expected_procedures": [
      "80.51",
      "81.08"
    ],
    "tpa_query_triggers": [
      "MRI lumbar spine confirming disc herniation",
      "Neurological deficit documented by neurosurgeon",
      "Was conservative treatment tried?",
      "Justify inpatient vs OPD physiotherapy"
    ],
    "documentation_must_include": [
      "MRI Lumbar Spine Report",
      "Neurological Examination — Power, Sensation, Reflexes"
    ],
    "india_specific_notes": "Cauda equina syndrome is a surgical emergency — escalate immediately Mechanical back pain without neurological deficit is very high rejection risk",
    "severity_markers": [
      "Foot drop",
      "Bladder/bowel dysfunction (cauda equina)",
      "Grade 4-5 motor weakness",
      "Dermatomal sensory loss"
    ],
    "must_not_miss_flags": [
      "Cauda equina syndrome (surgical emergency)",
      "Spinal malignancy / metastasis",
      "Spinal infection (discitis, TB spine)"
    ],
    "admission_justification_template": "Patient presents with {symptom_duration} history of back pain with {radiation_pattern}. MRI lumbar spine shows {mri_findings} at {level}. Neurological examination demonstrates {neurological_findings}. {cauda_equina_flag}. {conservative_treatment_failed}. Inpatient pain management and {surgical_plan} required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "OR-1031",
    "pmjay_package_rate": 11000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 15000,
        "max": 50000
      },
      "privateRoom": {
        "min": 25000,
        "max": 90000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": null
    },
    "code": "M54.5",
    "commonName": "Lumbar Disc Disease / PIVD",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "commonTPAQueries": [
      "MRI lumbar spine confirming disc herniation",
      "Neurological deficit documented by neurosurgeon",
      "Was conservative treatment tried?",
      "Justify inpatient vs OPD physiotherapy"
    ],
    "mandatoryDocuments": [
      {
        "id": "mri_lumbar",
        "name": "MRI Lumbar Spine Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Disc herniation level and nerve compression not documented without MRI"
      },
      {
        "id": "neuro_exam",
        "name": "Neurological Examination — Power, Sensation, Reflexes",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Neurological deficit not formally assessed — hospitalization justification unclear"
      }
    ]
  },
  {
    "id": "ORTH-070",
    "specialty": "Orthopedics",
    "subcategory": "Knee / Sports Injury",
    "condition_name": "ACL Tear",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "S83.51",
        "description": "Tear of anterior cruciate ligament",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [
      "81.45"
    ],
    "tpa_query_triggers": [
      "MRI Knee report movies and description",
      "Clinical Laxity signs (Lachman / Drawer tests)",
      "Was Meniscus also torn?",
      "Implant (Screw/Endobutton) stickers"
    ],
    "documentation_must_include": [
      "MRI Knee Report showing Full Thickness ACL Tear"
    ],
    "india_specific_notes": "Arthroscopic ACL reconstruction is the gold standard — stickers for interface screws/endobuttons are vital",
    "severity_markers": [
      "Full thickness tear",
      "Pivot shift positive",
      "Multiple ligament injury (MCL/LCL)",
      "Tibial spine avulsion"
    ],
    "must_not_miss_flags": [
      "Meniscal bucket handle tear",
      "Segond fracture",
      "Nerve injury"
    ],
    "admission_justification_template": "Patient presents with acute knee injury and instability. MRI confirms Complete ACL Tear. {clinical_laxity_signs}. Failed conservative management. Inpatient / Daycare Arthroscopic ACL Reconstruction required for restoration of stability.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "OR-1021",
    "pmjay_package_rate": 15000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 60000,
        "max": 120000
      },
      "privateRoom": {
        "min": 90000,
        "max": 180000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 50000,
        "max": 100000
      }
    },
    "code": "S83.51",
    "commonName": "ACL Tear",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "MRI Knee report movies and description",
      "Clinical Laxity signs (Lachman / Drawer tests)",
      "Was Meniscus also torn?",
      "Implant (Screw/Endobutton) stickers"
    ],
    "mandatoryDocuments": [
      {
        "id": "mri_acl",
        "name": "MRI Knee Report showing Full Thickness ACL Tear",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "ORTH-071",
    "specialty": "Orthopedics",
    "subcategory": "Knee",
    "condition_name": "Meniscal Tear",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "M23.20",
        "description": "Derangement of unspecified meniscus due to old tear or injury",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "expected_procedures": [
      "80.6"
    ],
    "tpa_query_triggers": [
      "MRI Knee report",
      "Locking or buckling symptoms",
      "Joint line tenderness documentation",
      "Was meniscal repair or partial meniscectomy done?"
    ],
    "documentation_must_include": [
      "MRI Knee Report"
    ],
    "india_specific_notes": "Meniscal repair stickers (if used) are mandatory for reimbursement",
    "severity_markers": [
      "Locked Knee (Inability to extend)",
      "Bucket handle tear",
      "Displaced fragment"
    ],
    "must_not_miss_flags": [
      "Loose body",
      "OCD (Osteochondritis Dissecans)",
      "Plica syndrome"
    ],
    "admission_justification_template": "Patient presents with knee pain and {locking_symptoms}. MRI confirms {tear_type} meniscal tear. {locked_knee_flag}. Inpatient / Daycare arthroscopic {procedure_name} required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "OR-1025",
    "pmjay_package_rate": 11000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 35000,
        "max": 80000
      },
      "privateRoom": {
        "min": 55000,
        "max": 130000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 30000,
        "max": 70000
      }
    },
    "code": "M23.20",
    "commonName": "Meniscal Tear",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "commonTPAQueries": [
      "MRI Knee report",
      "Locking or buckling symptoms",
      "Joint line tenderness documentation",
      "Was meniscal repair or partial meniscectomy done?"
    ],
    "mandatoryDocuments": [
      {
        "id": "mri_meniscus",
        "name": "MRI Knee Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "ORTH-072",
    "specialty": "Orthopedics",
    "subcategory": "Spine",
    "condition_name": "Cervical Spondylosis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "M47.812",
        "description": "Spondylosis without myelopathy or radiculopathy, cervical region",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "X-ray/MRI evidence of osteophytes/stenosis",
      "Severity of neck pain / vertigo",
      "Is there myelopathy? (Gait/Dexterity)"
    ],
    "documentation_must_include": [
      "MRI Cervical Spine Report"
    ],
    "india_specific_notes": "Conservative management should be emphasized for simple spondylosis",
    "severity_markers": [
      "Gait instability (Myelopathy)",
      "Hoffmann positive",
      "Clonus",
      "Wasting of hand intrinsics"
    ],
    "must_not_miss_flags": [
      "Cervical Disc Prolapse",
      "Syringomyelia",
      "Multiple Sclerosis"
    ],
    "admission_justification_template": "Patient presents with chronic severe neck pain and {myelopathy_signs}. MRI confirms cervical spondylosis at {level} with {stenosis_type}. Inpatient stabilization and {management_plan} required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "OR-1011",
    "pmjay_package_rate": 12000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 20000,
        "max": 50000
      },
      "privateRoom": {
        "min": 35000,
        "max": 90000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 15000,
        "max": 35000
      }
    },
    "code": "M47.812",
    "commonName": "Cervical Spondylosis",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "X-ray/MRI evidence of osteophytes/stenosis",
      "Severity of neck pain / vertigo",
      "Is there myelopathy? (Gait/Dexterity)"
    ],
    "mandatoryDocuments": [
      {
        "id": "mri_cervical",
        "name": "MRI Cervical Spine Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "ORTH-073",
    "specialty": "Orthopedics",
    "subcategory": "Shoulder",
    "condition_name": "Frozen Shoulder",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "M75.00",
        "description": "Adhesive capsulitis of unspecified shoulder",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "expected_procedures": [
      "80.41"
    ],
    "tpa_query_triggers": [
      "Range of Motion (ROM) measurements",
      "Diabetes status (high association)",
      "Was MUA (Manipulation under Anesthesia) done?"
    ],
    "documentation_must_include": [
      "Passive vs Active ROM range documentation"
    ],
    "india_specific_notes": "MUA or Arthroscopic capsular release are common surgical indications",
    "severity_markers": [
      "ROM < 30 degrees abduction",
      "Night pain preventing sleep",
      "Failure of 3 months physio"
    ],
    "must_not_miss_flags": [
      "Rotator cuff tear",
      "Calcific tendonitis",
      "Pancoast tumor"
    ],
    "admission_justification_template": "Patient presents with progressive shoulder stiffness and pain. Abduction limited to {degrees} degrees. {diabetes_flag}. Failed 3 months of physiotherapy. Inpatient / Daycare MUA or capsular release required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "OR-1022",
    "pmjay_package_rate": 9000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 25000,
        "max": 60000
      },
      "privateRoom": {
        "min": 45000,
        "max": 100000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 20000,
        "max": 50000
      }
    },
    "code": "M75.00",
    "commonName": "Frozen Shoulder",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "commonTPAQueries": [
      "Range of Motion (ROM) measurements",
      "Diabetes status (high association)",
      "Was MUA (Manipulation under Anesthesia) done?"
    ],
    "mandatoryDocuments": [
      {
        "id": "rom_record",
        "name": "Passive vs Active ROM range documentation",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "ORTH-074",
    "specialty": "Orthopedics",
    "subcategory": "Hand / Nerve",
    "condition_name": "Carpal Tunnel Syndrome (CTS)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "G56.00",
        "description": "Carpal tunnel syndrome, unspecified upper limb",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 2,
      "average": 1
    },
    "expected_procedures": [
      "04.43"
    ],
    "tpa_query_triggers": [
      "NCV (Nerve Conduction Velocity) report",
      "Tinel and Phalen test results",
      "Presence of thenar wasting"
    ],
    "documentation_must_include": [
      "NCV Median Nerve study report"
    ],
    "india_specific_notes": "Carpal tunnel release is a classic daycare procedure",
    "severity_markers": [
      "Thenar muscle atrophy",
      "Persistent numbness",
      "Absent sensory response on NCV"
    ],
    "must_not_miss_flags": [
      "Cervical Radiculopathy",
      "Pronator Syndrome",
      "Diabetic Neuropathy"
    ],
    "admission_justification_template": "Patient presents with classic numbness in median nerve distribution. NCV confirms {severity} carpal tunnel syndrome. {thenar_wasting}. Inpatient / Daycare carpal tunnel release required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "OR-1023",
    "pmjay_package_rate": 8500,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 15000,
        "max": 35000
      },
      "privateRoom": {
        "min": 25000,
        "max": 60000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 12000,
        "max": 30000
      }
    },
    "code": "G56.00",
    "commonName": "Carpal Tunnel Syndrome (CTS)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 2,
      "average": 1
    },
    "commonTPAQueries": [
      "NCV (Nerve Conduction Velocity) report",
      "Tinel and Phalen test results",
      "Presence of thenar wasting"
    ],
    "mandatoryDocuments": [
      {
        "id": "ncv_cts",
        "name": "NCV Median Nerve study report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "ORTH-075",
    "specialty": "Orthopedics",
    "subcategory": "Trauma",
    "condition_name": "Ankle Fracture (Bimalleolar / Trimalleolar)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "S82.899A",
        "description": "Other fracture of unspecified lower leg, initial encounter for closed fracture",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 5
    },
    "expected_procedures": [
      "79.36"
    ],
    "tpa_query_triggers": [
      "X-ray AP/Lat/Mortise views",
      "Medullary vs Cortical involvement",
      "Implant stickers for plates/screws"
    ],
    "documentation_must_include": [
      "X-ray Ankle films (minimum 2 views)",
      "Ortho Implant Stickers (Original)"
    ],
    "india_specific_notes": "Always document syndesmotic stability after ORIF",
    "severity_markers": [
      "Trimalleolar fracture",
      "Talar shift / Syndesmotic injury",
      "Open fracture (Gustilo-Anderson)",
      "Malleolar skin tenting"
    ],
    "must_not_miss_flags": [
      "Syndesmotic injury",
      "Maisonneuve fracture (high fibula)",
      "Compartment syndrome"
    ],
    "admission_justification_template": "Patient presents with acute ankle trauma and deformity. X-ray shows {fx_type} fracture. {instability_feature}. Inpatient ORIF with plate and screws and stabilization required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "OR-1028",
    "pmjay_package_rate": 35000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 50000,
        "max": 120000
      },
      "privateRoom": {
        "min": 80000,
        "max": 180000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": null
    },
    "code": "S82.899A",
    "commonName": "Ankle Fracture (Bimalleolar / Trimalleolar)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 5
    },
    "commonTPAQueries": [
      "X-ray AP/Lat/Mortise views",
      "Medullary vs Cortical involvement",
      "Implant stickers for plates/screws"
    ],
    "mandatoryDocuments": [
      {
        "id": "xray_ankle_fx",
        "name": "X-ray Ankle films (minimum 2 views)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "plate_screw_sticker",
        "name": "Ortho Implant Stickers (Original)",
        "category": "implant",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "ORTH-076",
    "specialty": "Orthopedics",
    "subcategory": "Trauma",
    "condition_name": "Colles Fracture / Distal Radius FX",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "S52.501A",
        "description": "Unspecified fracture of the lower end of right radius, initial encounter for closed fracture",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 4,
      "average": 2
    },
    "expected_procedures": [
      "79.32"
    ],
    "tpa_query_triggers": [
      "X-ray wrist films",
      "Joint surfaces involvement (Intra-articular)",
      "Was manipulation done or plating?"
    ],
    "documentation_must_include": [
      "X-ray Wrist AP/Lat"
    ],
    "india_specific_notes": "Dorsal tilt >10 deg usually justifies surgical ORIF",
    "severity_markers": [
      "Intra-articular extension",
      "Comminution",
      "Ulnar styloid fracture",
      "Radial shortening >3mm"
    ],
    "must_not_miss_flags": [
      "Scaphoid fracture",
      "DRUJ instability",
      "Median nerve compression"
    ],
    "admission_justification_template": "Patient presents with wrist deformity after fall. X-ray confirms {fx_position} distal radius fracture with {articular_involvement}. Inpatient ORIF or manipulation under anesthesia required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "OR-1030",
    "pmjay_package_rate": 18000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 30000,
        "max": 70000
      },
      "privateRoom": {
        "min": 50000,
        "max": 120000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 25000,
        "max": 60000
      }
    },
    "code": "S52.501A",
    "commonName": "Colles Fracture / Distal Radius FX",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 4,
      "average": 2
    },
    "commonTPAQueries": [
      "X-ray wrist films",
      "Joint surfaces involvement (Intra-articular)",
      "Was manipulation done or plating?"
    ],
    "mandatoryDocuments": [
      {
        "id": "xray_wrist_fx",
        "name": "X-ray Wrist AP/Lat",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "ORTH-077",
    "specialty": "Orthopedics",
    "subcategory": "Hand",
    "condition_name": "Trigger Finger",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "M65.30",
        "description": "Trigger finger, unspecified finger",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 1,
      "average": 1
    },
    "expected_procedures": [
      "82.01"
    ],
    "tpa_query_triggers": [
      "Clinical examination findings (nodule)",
      "Failed steroid injection history"
    ],
    "documentation_must_include": [],
    "india_specific_notes": "Trigger release is almost always a daycare procedure",
    "severity_markers": [
      "Locked finger",
      "Severe pain clicking"
    ],
    "must_not_miss_flags": [
      "Flexor tenosynovitis (Infectious)",
      "Dupuytren contracture"
    ],
    "admission_justification_template": "Patient presents with painful clicking and locking of {finger}. Failed conservative management. Daycare surgical release of A1 pulley required.",
    "pmjay_eligible": false,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 10000,
        "max": 20000
      },
      "privateRoom": {
        "min": 18000,
        "max": 35000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 8000,
        "max": 15000
      }
    },
    "code": "M65.30",
    "commonName": "Trigger Finger",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 1,
      "average": 1
    },
    "commonTPAQueries": [
      "Clinical examination findings (nodule)",
      "Failed steroid injection history"
    ],
    "mandatoryDocuments": []
  },
  {
    "id": "ORTH-078",
    "specialty": "Orthopedics",
    "subcategory": "Foot / Ankle",
    "condition_name": "Plantar Fasciitis / Heel Spur",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "M72.2",
        "description": "Plantar fascial fibromatosis",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 1,
      "average": 1
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "X-ray showing heel spur",
      "Clinical focal tenderness"
    ],
    "documentation_must_include": [
      "X-ray Calcaneum (Lat)"
    ],
    "india_specific_notes": "Admission only for ESWT or recalcitrant cases requiring surgical release",
    "severity_markers": [
      "Severe disability",
      "Failure of 6 months physio/inserts"
    ],
    "must_not_miss_flags": [
      "Calcaneal stress fracture",
      "Tarsal tunnel syndrome",
      "Baxter nerve impingement"
    ],
    "admission_justification_template": "Patient presents with severe heel pain. X-ray shows {spur_status}. Inpatient / Daycare management for {procedure_name} required.",
    "pmjay_eligible": false,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 5000,
        "max": 12000
      },
      "privateRoom": {
        "min": 10000,
        "max": 20000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 3000,
        "max": 8000
      }
    },
    "code": "M72.2",
    "commonName": "Plantar Fasciitis / Heel Spur",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 1,
      "average": 1
    },
    "commonTPAQueries": [
      "X-ray showing heel spur",
      "Clinical focal tenderness"
    ],
    "mandatoryDocuments": [
      {
        "id": "xray_heel",
        "name": "X-ray Calcaneum (Lat)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "ORTH-079",
    "specialty": "Orthopedics",
    "subcategory": "Elbow",
    "condition_name": "Tennis Elbow",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "M77.1",
        "description": "Lateral epicondylitis",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 1,
      "average": 1
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Pain location (Lateral epicondyle)",
      "Impact on ADLs"
    ],
    "documentation_must_include": [],
    "india_specific_notes": "Usually treated with PRP or steroid injections in OPD",
    "severity_markers": [],
    "must_not_miss_flags": [
      "Radial tunnel syndrome",
      "Cervical radiculopathy",
      "Posterior interosseous nerve palsy"
    ],
    "admission_justification_template": "Patient presents with severe lateral elbow pain. Diagnosis of Tennis Elbow confirmed. Inpatient / Daycare management for {treatment} required.",
    "pmjay_eligible": false,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 5000,
        "max": 12000
      },
      "privateRoom": {
        "min": 10000,
        "max": 20000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 3000,
        "max": 8000
      }
    },
    "code": "M77.1",
    "commonName": "Tennis Elbow",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 1,
      "average": 1
    },
    "commonTPAQueries": [
      "Pain location (Lateral epicondyle)",
      "Impact on ADLs"
    ],
    "mandatoryDocuments": []
  },
  {
    "id": "NEUR-080",
    "specialty": "Neurology",
    "subcategory": "Stroke",
    "condition_name": "Ischemic Stroke",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "I63.9",
        "description": "Cerebral infarction, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 7,
      "max": 21,
      "average": 10
    },
    "expected_procedures": [
      "99.10"
    ],
    "tpa_query_triggers": [
      "MRI/CT brain confirming infarction",
      "Time of symptom onset — crucial for thrombolysis window",
      "NIHSS score at admission",
      "Was tPA thrombolysis given? Consent + drug details",
      "Rehabilitation plan documentation"
    ],
    "documentation_must_include": [
      "CT Brain (non-contrast) — Admission",
      "MRI Brain with DWI (diffusion weighted imaging)",
      "NIHSS Score Documentation",
      "ECG (AF as cardioembolic cause)",
      "Echocardiography (cardioembolic workup)"
    ],
    "india_specific_notes": "Time of symptom onset is legally critical — document precisely Thrombolysis window: <4.5 hours from symptom onset to needle time — document both times exactly",
    "severity_markers": [
      "NIHSS >15",
      "Large vessel occlusion",
      "Hemorrhagic transformation",
      "Malignant MCA syndrome",
      "Dysphagia/aspiration risk"
    ],
    "must_not_miss_flags": [
      "Hemorrhagic stroke",
      "Todd's paralysis post-seizure",
      "Hypertensive encephalopathy",
      "Brain tumor"
    ],
    "admission_justification_template": "Patient presents with sudden onset {neurological_deficits} at {onset_time}. CT brain excludes hemorrhage. MRI DWI confirms {infarct_location} ischemic infarct. NIHSS score {nihss}. {thrombolysis_statement}. Stroke unit admission required for monitoring, secondary prevention initiation, dysphagia assessment, and rehabilitation planning.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "NS-1001",
    "pmjay_package_rate": 28000,
    "ward_type": "icu",
    "icu_probability": "high",
    "cost_estimate": {
      "generalWard": {
        "min": 60000,
        "max": 180000
      },
      "privateRoom": {
        "min": 110000,
        "max": 350000
      },
      "icu": {
        "min": 180000,
        "max": 500000
      },
      "daycare": null
    },
    "code": "I63.9",
    "commonName": "Ischemic Stroke",
    "icuProbability": "high",
    "typicalLOS": {
      "min": 7,
      "max": 21,
      "average": 10
    },
    "commonTPAQueries": [
      "MRI/CT brain confirming infarction",
      "Time of symptom onset — crucial for thrombolysis window",
      "NIHSS score at admission",
      "Was tPA thrombolysis given? Consent + drug details",
      "Rehabilitation plan documentation"
    ],
    "mandatoryDocuments": [
      {
        "id": "ct_brain",
        "name": "CT Brain (non-contrast) — Admission",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Hemorrhage vs ischemia not differentiated"
      },
      {
        "id": "mri_brain",
        "name": "MRI Brain with DWI (diffusion weighted imaging)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Infarct confirmation and extent not documented"
      },
      {
        "id": "nihss",
        "name": "NIHSS Score Documentation",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Stroke severity not objectively quantified"
      },
      {
        "id": "ecg_stroke",
        "name": "ECG (AF as cardioembolic cause)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Cardioembolic etiology not investigated"
      },
      {
        "id": "echo_stroke",
        "name": "Echocardiography (cardioembolic workup)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "NEUR-081",
    "specialty": "Neurology",
    "subcategory": "Seizure Disorders",
    "condition_name": "Seizure Disorder / Epilepsy",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "G40.909",
        "description": "Epilepsy, unspecified, not intractable",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Was this first seizure or breakthrough seizure?",
      "EEG report",
      "CT/MRI brain to rule out structural cause",
      "Drug levels if on anti-epileptics",
      "Justify inpatient management for known epileptic"
    ],
    "documentation_must_include": [
      "CT Brain (structural etiology)",
      "EEG Report",
      "Anti-Epileptic Drug Level (if on medication)"
    ],
    "india_specific_notes": "Status epilepticus is medical emergency — document seizure duration exactly First seizure in adult requires full workup — this strongly justifies admission",
    "severity_markers": [
      "Status epilepticus (>5 min or recurrent)",
      "Post-ictal paralysis",
      "First seizure in adult",
      "Focal onset seizure",
      "New structural lesion"
    ],
    "must_not_miss_flags": [
      "Brain tumor",
      "Meningitis/encephalitis",
      "Metabolic cause (hypoglycemia, hyponatremia)",
      "Drug withdrawal"
    ],
    "admission_justification_template": "Patient presents with {first_recurrent} generalized tonic-clonic seizure lasting {duration}. {status_epilepticus}. CT brain shows {ct_findings}. EEG shows {eeg_findings}. AED drug level {drug_level}. {etiology}. Inpatient monitoring, investigation for precipitating cause, and AED optimization required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "NS-1015",
    "pmjay_package_rate": 9000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 15000,
        "max": 45000
      },
      "privateRoom": {
        "min": 25000,
        "max": 80000
      },
      "icu": {
        "min": 50000,
        "max": 150000
      },
      "daycare": null
    },
    "code": "G40.909",
    "commonName": "Seizure Disorder / Epilepsy",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "Was this first seizure or breakthrough seizure?",
      "EEG report",
      "CT/MRI brain to rule out structural cause",
      "Drug levels if on anti-epileptics",
      "Justify inpatient management for known epileptic"
    ],
    "mandatoryDocuments": [
      {
        "id": "ct_brain_seizure",
        "name": "CT Brain (structural etiology)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Secondary cause of seizure not excluded"
      },
      {
        "id": "eeg",
        "name": "EEG Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Electrophysiological evidence not documented"
      },
      {
        "id": "drug_levels",
        "name": "Anti-Epileptic Drug Level (if on medication)",
        "category": "investigation",
        "mandatory": false,
        "whenRequired": "if on anti-epileptics",
        "tpaQueryIfMissing": "Sub-therapeutic levels not documented — compliance cannot be assessed"
      }
    ]
  },
  {
    "id": "NEUR-082",
    "specialty": "Neurology",
    "subcategory": "Infection",
    "condition_name": "Meningitis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "G03.9",
        "description": "Meningitis, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 7,
      "max": 21,
      "average": 14
    },
    "expected_procedures": [
      "03.31"
    ],
    "tpa_query_triggers": [
      "CSF (Cerebrospinal Fluid) analysis report",
      "CT/MRI brain results",
      "Clinical signs of meningeal irritation (Kernig/Brudzinski)",
      "Fever and headache duration"
    ],
    "documentation_must_include": [
      "CSF Analysis (Cytology, Bio-chem, Culture)"
    ],
    "india_specific_notes": "CSF analysis is the diagnostic gold standard — always include CSF culture results when available",
    "severity_markers": [
      "Altered sensorium",
      "Seizures",
      "Cranial nerve palsies",
      "Septic shock"
    ],
    "must_not_miss_flags": [
      "Encephalitis",
      "Brain abscess",
      "Cryptococcal meningitis (HIV)"
    ],
    "admission_justification_template": "Patient presents with fever, headache, and signs of meningeal irritation. CSF shows {pleocytosis} and {glucose_level}. {neurological_deficit}. Emergency inpatient ICU management and IV antibiotics/antivirals required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "NS-1002",
    "pmjay_package_rate": 18000,
    "ward_type": "icu",
    "icu_probability": "high",
    "cost_estimate": {
      "generalWard": {
        "min": 40000,
        "max": 100000
      },
      "privateRoom": {
        "min": 70000,
        "max": 180000
      },
      "icu": {
        "min": 150000,
        "max": 400000
      },
      "daycare": null
    },
    "code": "G03.9",
    "commonName": "Meningitis",
    "icuProbability": "high",
    "typicalLOS": {
      "min": 7,
      "max": 21,
      "average": 14
    },
    "commonTPAQueries": [
      "CSF (Cerebrospinal Fluid) analysis report",
      "CT/MRI brain results",
      "Clinical signs of meningeal irritation (Kernig/Brudzinski)",
      "Fever and headache duration"
    ],
    "mandatoryDocuments": [
      {
        "id": "csf_report",
        "name": "CSF Analysis (Cytology, Bio-chem, Culture)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "NEUR-083",
    "specialty": "Neurology",
    "subcategory": "Demyelinating",
    "condition_name": "Multiple Sclerosis (MS)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "G35",
        "description": "Multiple sclerosis",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 10,
      "average": 5
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "MRI Brain/Spine showing demyelinating plaques",
      "CSF Oligoclonal bands results",
      "VEP (Visual Evoked Potential) report",
      "McDonals criteria fulfillment"
    ],
    "documentation_must_include": [
      "MRI Brain and Spine Reports"
    ],
    "india_specific_notes": "Admission usually for high-dose pulse steroid therapy",
    "severity_markers": [
      "Acute relapse (optic neuritis/transverse myelitis)",
      "EDSS score progression",
      "New gadolinium-enhancing lesions"
    ],
    "must_not_miss_flags": [
      "Neuromyelitis Optica (NMO)",
      "ADEM",
      "Spinal cord tumor"
    ],
    "admission_justification_template": "Patient presents with acute neurological deficit suggestive of MS relapse. MRI confirms new demyelinating plaques at {level}. Inpatient high-dose pulse steroid therapy and stabilization required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "NS-1005",
    "pmjay_package_rate": 15000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 30000,
        "max": 80000
      },
      "privateRoom": {
        "min": 50000,
        "max": 150000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 20000,
        "max": 60000
      }
    },
    "code": "G35",
    "commonName": "Multiple Sclerosis (MS)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 10,
      "average": 5
    },
    "commonTPAQueries": [
      "MRI Brain/Spine showing demyelinating plaques",
      "CSF Oligoclonal bands results",
      "VEP (Visual Evoked Potential) report",
      "McDonals criteria fulfillment"
    ],
    "mandatoryDocuments": [
      {
        "id": "mri_demyelination",
        "name": "MRI Brain and Spine Reports",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "NEUR-084",
    "specialty": "Neurology",
    "subcategory": "Movement Disorders",
    "condition_name": "Parkinson's Disease",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "G20",
        "description": "Parkinson's disease",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 7,
      "average": 4
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Justify inpatient admission for chronic disease",
      "Presence of falls / swallowing difficulty",
      "Drug induced parkinsonism ruling out"
    ],
    "documentation_must_include": [],
    "india_specific_notes": "Inpatient care justified during medication titration \"off\" periods or complications like falls/aspiration",
    "severity_markers": [
      "Frequent falls",
      "Aspiration pneumonia risk",
      "Freezing of gait",
      "Dementia complication"
    ],
    "must_not_miss_flags": [
      "Progressive Supranuclear Palsy (PSP)",
      "Normal Pressure Hydrocephalus (NPH)",
      "Drug induced parkinsonism"
    ],
    "admission_justification_template": "Patient with advanced Parkinson's disease presents with {complication_type}. {swallowing_status}. {falls_history}. Inpatient management for medication optimization and complication stabilization required.",
    "pmjay_eligible": false,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 20000,
        "max": 50000
      },
      "privateRoom": {
        "min": 35000,
        "max": 90000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": null
    },
    "code": "G20",
    "commonName": "Parkinson's Disease",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 7,
      "average": 4
    },
    "commonTPAQueries": [
      "Justify inpatient admission for chronic disease",
      "Presence of falls / swallowing difficulty",
      "Drug induced parkinsonism ruling out"
    ],
    "mandatoryDocuments": []
  },
  {
    "id": "NEUR-085",
    "specialty": "Neurology",
    "subcategory": "Peripheral Nerve",
    "condition_name": "GBS",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "G61.0",
        "description": "Guillain-Barré syndrome",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 7,
      "max": 30,
      "average": 14
    },
    "expected_procedures": [
      "99.71"
    ],
    "tpa_query_triggers": [
      "NCV (Nerve Conduction Velocity) report",
      "CSF albuminocytologic dissociation",
      "Presence of respiratory distress (vital capacity)",
      "Justify IVIg vs Plasmapheresis"
    ],
    "documentation_must_include": [
      "NCV Study showing demyelinating neuropathy",
      "CSF Analysis (Albuminocytologic dissociation)"
    ],
    "india_specific_notes": "IVIg cost is often very high — document weight and dose calculation precisely",
    "severity_markers": [
      "Respiratory muscle weakness",
      "Bulbar palsy",
      "Rapidly ascending paralysis",
      "Autonomic instability"
    ],
    "must_not_miss_flags": [
      "Acute spinal cord compression",
      "Transverse myelitis",
      "Hypokalemic paralysis"
    ],
    "admission_justification_template": "Patient presents with rapidly ascending motor paralysis and {respiratory_status}. NCV and CSF confirm GBS. High risk of respiratory failure. Emergency ICU admission for {specific_treatment} (IVIg/Plasmapheresis) required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "NS-1010",
    "pmjay_package_rate": 150000,
    "ward_type": "icu",
    "icu_probability": "high",
    "cost_estimate": {
      "generalWard": {
        "min": 50000,
        "max": 150000
      },
      "privateRoom": {
        "min": 80000,
        "max": 250000
      },
      "icu": {
        "min": 200000,
        "max": 800000
      },
      "daycare": null
    },
    "code": "G61.0",
    "commonName": "GBS",
    "icuProbability": "high",
    "typicalLOS": {
      "min": 7,
      "max": 30,
      "average": 14
    },
    "commonTPAQueries": [
      "NCV (Nerve Conduction Velocity) report",
      "CSF albuminocytologic dissociation",
      "Presence of respiratory distress (vital capacity)",
      "Justify IVIg vs Plasmapheresis"
    ],
    "mandatoryDocuments": [
      {
        "id": "ncv_gbs",
        "name": "NCV Study showing demyelinating neuropathy",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "csf_gbs",
        "name": "CSF Analysis (Albuminocytologic dissociation)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "NEUR-086",
    "specialty": "Neurology",
    "subcategory": "Neuromuscular",
    "condition_name": "Myasthenia Gravis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "G70.00",
        "description": "Myasthenia gravis without (acute) exacerbation",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 15,
      "average": 7
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Anti-AChR antibody levels",
      "RNST (Repetitive Nerve Stimulation Test) report",
      "Ice pack test or Tensilon test result",
      "CT Chest for Thymoma"
    ],
    "documentation_must_include": [
      "RNST Report"
    ],
    "india_specific_notes": "Myasthenic crisis requires emergency ICU admission and possibly plasmapheresis",
    "severity_markers": [
      "Myasthenic crisis (Respiratory failure)",
      "Bulbar involvement",
      "Generalized weakness"
    ],
    "must_not_miss_flags": [
      "Cholinergic crisis",
      "Botulism",
      "Lambert-Eaton Syndrome"
    ],
    "admission_justification_template": "Patient with known MG presents with {symptoms} suggestive of {crisis_status}. {respiratory_effort}. RNST confirms neuromuscular junction defect. Inpatient / ICU management and therapy optimization required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "NS-1011",
    "pmjay_package_rate": 18000,
    "ward_type": "icu",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 30000,
        "max": 80000
      },
      "privateRoom": {
        "min": 50000,
        "max": 150000
      },
      "icu": {
        "min": 100000,
        "max": 300000
      },
      "daycare": null
    },
    "code": "G70.00",
    "commonName": "Myasthenia Gravis",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 3,
      "max": 15,
      "average": 7
    },
    "commonTPAQueries": [
      "Anti-AChR antibody levels",
      "RNST (Repetitive Nerve Stimulation Test) report",
      "Ice pack test or Tensilon test result",
      "CT Chest for Thymoma"
    ],
    "mandatoryDocuments": [
      {
        "id": "rnst_report",
        "name": "RNST Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "UROL-087",
    "specialty": "Urology",
    "subcategory": "Urolithiasis",
    "condition_name": "Kidney Stone / Renal Calculus",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "N20.0",
        "description": "Calculus of kidney",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [
      "98.51",
      "56.0",
      "55.04"
    ],
    "tpa_query_triggers": [
      "USG KUB or CT KUB confirming stone",
      "Stone size — determines OPD vs inpatient ESWL",
      "Was ureteric obstruction or infection present?",
      "Renal function tests",
      "Urine culture if infection suspected"
    ],
    "documentation_must_include": [
      "USG KUB (Kidney, Ureter, Bladder)",
      "NCCT KUB (Non-Contrast CT) — preferred for ureteric stones",
      "Renal Function Tests (Creatinine, BUN)",
      "Urine Routine, Microscopy, and Culture"
    ],
    "india_specific_notes": "Stone >10mm or symptomatic obstruction justifies intervention Infected obstructed kidney (pyonephrosis) is urological emergency — document fever + obstruction combination",
    "severity_markers": [
      "Obstructive uropathy",
      "Infected obstructed kidney",
      "Bilateral obstruction",
      "Solitary kidney",
      "Acute kidney injury"
    ],
    "must_not_miss_flags": [
      "Pyelonephritis",
      "Urosepsis",
      "Aortic aneurysm mimicking renal colic"
    ],
    "admission_justification_template": "Patient presents with renal colic with USG/CT confirming {stone_location} calculus of {stone_size}mm. {hydronephrosis_grade} hydronephrosis with {obstruction_degree} obstruction. Creatinine {creatinine}. {infection_status}. {intervention_planned} required in inpatient setting for {indication}.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "UR-1003",
    "pmjay_package_rate": 15000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 20000,
        "max": 60000
      },
      "privateRoom": {
        "min": 35000,
        "max": 100000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 30000,
        "max": 70000
      }
    },
    "code": "N20.0",
    "commonName": "Kidney Stone / Renal Calculus",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "USG KUB or CT KUB confirming stone",
      "Stone size — determines OPD vs inpatient ESWL",
      "Was ureteric obstruction or infection present?",
      "Renal function tests",
      "Urine culture if infection suspected"
    ],
    "mandatoryDocuments": [
      {
        "id": "usg_kub",
        "name": "USG KUB (Kidney, Ureter, Bladder)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Stone not radiologically confirmed"
      },
      {
        "id": "ct_kub",
        "name": "NCCT KUB (Non-Contrast CT) — preferred for ureteric stones",
        "category": "investigation",
        "mandatory": false,
        "whenRequired": "if ureteric stone suspected and USG inconclusive",
        "tpaQueryIfMissing": "Ureteric stone not definitively confirmed"
      },
      {
        "id": "rft_stone",
        "name": "Renal Function Tests (Creatinine, BUN)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Obstructive nephropathy not assessed"
      },
      {
        "id": "urine_culture_stone",
        "name": "Urine Routine, Microscopy, and Culture",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Concurrent UTI not excluded"
      }
    ]
  },
  {
    "id": "UROL-088",
    "specialty": "Urology",
    "subcategory": "Prostate",
    "condition_name": "BPH (Enlarged Prostate)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "N40.1",
        "description": "Benign prostatic hyperplasia with lower urinary tract symptoms",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "expected_procedures": [
      "60.29"
    ],
    "tpa_query_triggers": [
      "USG showing Prostate volume",
      "PVR (Post-void residual) volume",
      "IPSS (International Prostate Symptom Score)",
      "PSA (Prostate Specific Antigen) to rule out malignancy",
      "Uroflowmetry report"
    ],
    "documentation_must_include": [
      "USG Pelvis showing Prostate Volume and PVR",
      "PSA Report"
    ],
    "india_specific_notes": "TURP (Transurethral Resection of Prostate) is the standard surgical intervention",
    "severity_markers": [
      "Prostate volume >50cc",
      "PVR >100ml",
      "Acute urinary retention",
      "Recurrent UTIs",
      "Hematuria"
    ],
    "must_not_miss_flags": [
      "Prostate Cancer",
      "Urethral stricture",
      "Neurogenic bladder"
    ],
    "admission_justification_template": "Patient presents with severe LUTS. USG shows prostate volume {volume}cc and PVR {pvr}ml. PSA {psa}. {retention_status}. Inpatient TURP and stabilization required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "UR-1005",
    "pmjay_package_rate": 18000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 40000,
        "max": 80000
      },
      "privateRoom": {
        "min": 70000,
        "max": 150000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": null
    },
    "code": "N40.1",
    "commonName": "BPH (Enlarged Prostate)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "commonTPAQueries": [
      "USG showing Prostate volume",
      "PVR (Post-void residual) volume",
      "IPSS (International Prostate Symptom Score)",
      "PSA (Prostate Specific Antigen) to rule out malignancy",
      "Uroflowmetry report"
    ],
    "mandatoryDocuments": [
      {
        "id": "prostate_usg",
        "name": "USG Pelvis showing Prostate Volume and PVR",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "psa_report",
        "name": "PSA Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "UROL-089",
    "specialty": "Urology",
    "subcategory": "Infection",
    "condition_name": "Acute Pyelonephritis (Kidney Infection)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "N10",
        "description": "Acute tubulo-interstitial nephritis",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 5
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "Urine culture and sensitivity",
      "USG KUB ruling out obstruction/stones",
      "WBC count and CRP",
      "Fever chart"
    ],
    "documentation_must_include": [
      "Urine Culture & Sensitivity Report",
      "USG KUB Report"
    ],
    "india_specific_notes": "Pyelo in diabetics is very high risk — document blood sugar control",
    "severity_markers": [
      "High fever / Chills",
      "Flank pain",
      "Urosepsis signs",
      "Diabetes co-morbidity",
      "Solitary kidney"
    ],
    "must_not_miss_flags": [
      "Perinephric abscess",
      "Renal papillary necrosis",
      "Emphysematous pyelonephritis (Emergency)"
    ],
    "admission_justification_template": "Patient presents with high fever, chills, and flank pain. Urine culture shows {organism}. WBC {wbc}. {sepsis_status}. Inpatient IV antibiotics and monitoring required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "UR-1010",
    "pmjay_package_rate": 9000,
    "ward_type": "any",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 15000,
        "max": 40000
      },
      "privateRoom": {
        "min": 30000,
        "max": 80000
      },
      "icu": {
        "min": 60000,
        "max": 150000
      },
      "daycare": null
    },
    "code": "N10",
    "commonName": "Acute Pyelonephritis (Kidney Infection)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 5
    },
    "commonTPAQueries": [
      "Urine culture and sensitivity",
      "USG KUB ruling out obstruction/stones",
      "WBC count and CRP",
      "Fever chart"
    ],
    "mandatoryDocuments": [
      {
        "id": "urine_culture_pyelo",
        "name": "Urine Culture & Sensitivity Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "usg_kub_pyelo",
        "name": "USG KUB Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "UROL-090",
    "specialty": "Urology",
    "subcategory": "Scrotal",
    "condition_name": "Hydrocele",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "N43.3",
        "description": "Hydrocele, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "expected_procedures": [
      "61.2"
    ],
    "tpa_query_triggers": [
      "USG Scrotum confirming hydrocele",
      "Was it congenital or acquired?",
      "Impact on daily activities"
    ],
    "documentation_must_include": [
      "USG Scrotum Report"
    ],
    "india_specific_notes": "Lord's plication or Jaboulay's procedure are standard techniques",
    "severity_markers": [
      "Large size causing discomfort",
      "Infected hydrocele (Pyocele)",
      "Associated hernia"
    ],
    "must_not_miss_flags": [
      "Testicular Tumor",
      "Epididymitis",
      "Torsion"
    ],
    "admission_justification_template": "Patient presents with progressive scrotal swelling. USG confirms large hydrocele. {complaints}. Inpatient / Daycare eversion of sac (Hydrocelectomy) required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "UR-1015",
    "pmjay_package_rate": 7500,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 15000,
        "max": 35000
      },
      "privateRoom": {
        "min": 25000,
        "max": 60000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 12000,
        "max": 25000
      }
    },
    "code": "N43.3",
    "commonName": "Hydrocele",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "commonTPAQueries": [
      "USG Scrotum confirming hydrocele",
      "Was it congenital or acquired?",
      "Impact on daily activities"
    ],
    "mandatoryDocuments": [
      {
        "id": "usg_scrotum",
        "name": "USG Scrotum Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "UROL-091",
    "specialty": "Urology",
    "subcategory": "Penile",
    "condition_name": "Phimosis",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "N47.1",
        "description": "Phimosis",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 1,
      "average": 1
    },
    "expected_procedures": [
      "64.0"
    ],
    "tpa_query_triggers": [
      "Grade of phimosis",
      "History of recurrent balanitis",
      "Difficulty in voiding"
    ],
    "documentation_must_include": [],
    "india_specific_notes": "Document recurrent infections to justify surgery to TPA",
    "severity_markers": [
      "Recurrent balanoposthitis",
      "Paraphimosis history",
      "Balantis xerotica obliterans (BXO)"
    ],
    "must_not_miss_flags": [
      "Penile Cancer",
      "Paraphimosis (Emergency)"
    ],
    "admission_justification_template": "Patient presents with severe phimosis and history of {recurrent_infections}. {voiding_difficulty}. Inpatient / Daycare circumcision required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "UR-1016",
    "pmjay_package_rate": 5000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 10000,
        "max": 25000
      },
      "privateRoom": {
        "min": 18000,
        "max": 40000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 8000,
        "max": 18000
      }
    },
    "code": "N47.1",
    "commonName": "Phimosis",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 1,
      "average": 1
    },
    "commonTPAQueries": [
      "Grade of phimosis",
      "History of recurrent balanitis",
      "Difficulty in voiding"
    ],
    "mandatoryDocuments": []
  },
  {
    "id": "OBST-092",
    "specialty": "Obstetrics & Gynecology",
    "subcategory": "Obstetric Procedures",
    "condition_name": "Caesarean Section (LSCS)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "O82",
        "description": "Encounter for cesarean delivery without indication",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 5,
      "average": 4
    },
    "expected_procedures": [
      "74.1",
      "74.99"
    ],
    "tpa_query_triggers": [
      "What was the indication for LSCS vs normal delivery?",
      "Antenatal records from beginning of pregnancy",
      "Baby birth record and weight",
      "Blood group of mother and baby",
      "OT notes with documented LSCS indication"
    ],
    "documentation_must_include": [
      "Antenatal Case Notes (complete pregnancy follow-up)",
      "LSCS Indication Documentation in OT Notes",
      "Baby Birth Record (weight, APGAR, date/time)",
      "Blood Group — Mother and Baby",
      "Obstetric USG Reports (dating, anomaly, growth)"
    ],
    "india_specific_notes": "LSCS indication is the most scrutinized OB claim — document it explicitly and unambiguously in OT notes Previous LSCS is a valid indication — mention scar count PPH: document blood loss estimation and management steps",
    "severity_markers": [
      "Fetal distress on CTG",
      "Placenta previa",
      "Abruptio placentae",
      "Failed progress of labour",
      "Previous LSCS"
    ],
    "must_not_miss_flags": [
      "PPH (Post-Partum Hemorrhage)",
      "Uterine rupture",
      "Shoulder dystocia"
    ],
    "admission_justification_template": "Patient at {gestational_age} weeks gestation admitted for LSCS. Indication: {lscs_indication}. {prior_lscs}. {maternal_complications}. Fetal status: {fetal_status}. Emergency/elective LSCS performed under {anaesthesia} anaesthesia. Baby delivered — weight {baby_weight}g, APGAR {apgar_1}/{apgar_5}.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "OB-1011",
    "pmjay_package_rate": 9000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 35000,
        "max": 90000
      },
      "privateRoom": {
        "min": 60000,
        "max": 180000
      },
      "icu": {
        "min": 100000,
        "max": 250000
      },
      "daycare": null
    },
    "code": "O82",
    "commonName": "Caesarean Section (LSCS)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 5,
      "average": 4
    },
    "commonTPAQueries": [
      "What was the indication for LSCS vs normal delivery?",
      "Antenatal records from beginning of pregnancy",
      "Baby birth record and weight",
      "Blood group of mother and baby",
      "OT notes with documented LSCS indication"
    ],
    "mandatoryDocuments": [
      {
        "id": "antenatal_records",
        "name": "Antenatal Case Notes (complete pregnancy follow-up)",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Pregnancy complications history not documented"
      },
      {
        "id": "lscs_indication",
        "name": "LSCS Indication Documentation in OT Notes",
        "category": "operative",
        "mandatory": true,
        "tpaQueryIfMissing": "Surgical indication not documented — LSCS may be classified as elective by TPA"
      },
      {
        "id": "baby_details",
        "name": "Baby Birth Record (weight, APGAR, date/time)",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Delivery outcome not documented"
      },
      {
        "id": "blood_group",
        "name": "Blood Group — Mother and Baby",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Rh incompatibility not assessed"
      },
      {
        "id": "usg_obstetric",
        "name": "Obstetric USG Reports (dating, anomaly, growth)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Fetal wellbeing and placental assessment not documented"
      }
    ]
  },
  {
    "id": "OBST-093",
    "specialty": "Obstetrics & Gynecology",
    "subcategory": "Gynecological Surgery",
    "condition_name": "Ovarian Cyst (with Torsion / Surgery)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "N83.20",
        "description": "Unspecified ovarian cysts",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [
      "65.29",
      "65.25"
    ],
    "tpa_query_triggers": [
      "USG pelvis confirming cyst with size",
      "CA-125 if malignancy suspected",
      "Was torsion or rupture present? Emergency vs elective",
      "Histopathology report post-surgery"
    ],
    "documentation_must_include": [
      "USG Pelvis (TV/TA) with Cyst Characteristics",
      "CA-125 (if malignancy features on USG)",
      "Histopathology Report of Specimen",
      "OT Notes (approach — laparoscopic or open)"
    ],
    "india_specific_notes": "Torsion is surgical emergency — time of symptom onset to surgery must be documented",
    "severity_markers": [
      "Torsion signs (acute onset pain, nausea)",
      "Rupture with haemoperitoneum",
      "Size >10cm",
      "Complex/septated features",
      "Rapidly growing"
    ],
    "must_not_miss_flags": [
      "Ovarian malignancy",
      "Ectopic pregnancy",
      "Appendicitis"
    ],
    "admission_justification_template": "Patient presents with {symptoms} with USG pelvis confirming {cyst_type} ovarian cyst of {size}cm on {side} ovary. {torsion_features}. {malignancy_risk}. Surgical intervention (laparoscopic cystectomy/oophorectomy) indicated for {indication}.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "GY-1009",
    "pmjay_package_rate": 13000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 30000,
        "max": 80000
      },
      "privateRoom": {
        "min": 55000,
        "max": 150000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 25000,
        "max": 60000
      }
    },
    "code": "N83.20",
    "commonName": "Ovarian Cyst (with Torsion / Surgery)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "USG pelvis confirming cyst with size",
      "CA-125 if malignancy suspected",
      "Was torsion or rupture present? Emergency vs elective",
      "Histopathology report post-surgery"
    ],
    "mandatoryDocuments": [
      {
        "id": "usg_pelvis",
        "name": "USG Pelvis (TV/TA) with Cyst Characteristics",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Cyst confirmation and malignancy risk not documented"
      },
      {
        "id": "ca125",
        "name": "CA-125 (if malignancy features on USG)",
        "category": "investigation",
        "mandatory": false,
        "whenRequired": "if complex cyst features",
        "tpaQueryIfMissing": "Malignancy risk not assessed"
      },
      {
        "id": "hpe_ovary",
        "name": "Histopathology Report of Specimen",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Nature of cyst not confirmed post-surgery"
      },
      {
        "id": "ot_notes_ovary",
        "name": "OT Notes (approach — laparoscopic or open)",
        "category": "operative",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "OBST-094",
    "specialty": "Obstetrics & Gynecology",
    "subcategory": "Gynecological Surgery",
    "condition_name": "Uterine Fibroids (Hysterectomy)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "D25.9",
        "description": "Leiomyoma of uterus, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "expected_procedures": [
      "68.4",
      "68.3"
    ],
    "tpa_query_triggers": [
      "USG/MRI showing fibroid size and location",
      "Hemoglobin levels (anemia due to heavy bleeding)",
      "Pressure symptoms (bladder/rectum)",
      "Failed conservative (medication) therapy"
    ],
    "documentation_must_include": [
      "USG Pelvis showing size and number of fibroids",
      "Hemoglobin Report"
    ],
    "india_specific_notes": "Laparoscopic Hysterectomy (TLH) costs are usually 30-50% higher than open",
    "severity_markers": [
      "Large size >10cm",
      "Severe anemia (Hb <8)",
      "Pressure symptoms on ureter",
      "Rapid growth (Malignancy risk)",
      "Submucosal location"
    ],
    "must_not_miss_flags": [
      "Uterine Sarcoma",
      "Adenomyosis",
      "Endometrial hyperplasia"
    ],
    "admission_justification_template": "Patient presents with heavy menstrual bleeding and pressure symptoms. USG shows {fibroid_count} fibroids, largest {size}cm. Hb {hb}. {conservative_failed}. Inpatient {procedure_type} required for definitive management.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "GY-1001",
    "pmjay_package_rate": 20000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 40000,
        "max": 100000
      },
      "privateRoom": {
        "min": 70000,
        "max": 200000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": null
    },
    "code": "D25.9",
    "commonName": "Uterine Fibroids (Hysterectomy)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "commonTPAQueries": [
      "USG/MRI showing fibroid size and location",
      "Hemoglobin levels (anemia due to heavy bleeding)",
      "Pressure symptoms (bladder/rectum)",
      "Failed conservative (medication) therapy"
    ],
    "mandatoryDocuments": [
      {
        "id": "usg_fibroid",
        "name": "USG Pelvis showing size and number of fibroids",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "hb_fibroid",
        "name": "Hemoglobin Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "OBST-095",
    "specialty": "Obstetrics & Gynecology",
    "subcategory": "Obstetric Emergencies",
    "condition_name": "Ectopic Pregnancy",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "O00.9",
        "description": "Ectopic pregnancy, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [
      "66.01",
      "66.02"
    ],
    "tpa_query_triggers": [
      "USG showing adnexal mass and empty uterus",
      "Beta-hCG levels",
      "Presence of free fluid (hemoperitoneum)",
      "Clinical status (BP/Pulse)"
    ],
    "documentation_must_include": [
      "USG Pelvis confirming Ectopic Gestation",
      "Serial Beta-hCG levels"
    ],
    "india_specific_notes": "Ruptured ectopic is a life-threatening emergency — document time of diagnosis to surgery",
    "severity_markers": [
      "Ruptured ectopic",
      "Hemoperitoneum",
      "Hypovolemic shock",
      "Beta-hCG >5000"
    ],
    "must_not_miss_flags": [
      "Appendicitis",
      "Ovarian torsion",
      "Ruptured corpus luteum cyst"
    ],
    "admission_justification_template": "Patient presents with acute abdominal pain and positive pregnancy test. USG confirms {location} ectopic pregnancy with {rupture_status}. Beta-hCG {bhcg}. {shock_signs}. Emergency inpatient surgical management (Salpingectomy) required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "OB-1005",
    "pmjay_package_rate": 15000,
    "ward_type": "general",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 35000,
        "max": 80000
      },
      "privateRoom": {
        "min": 60000,
        "max": 150000
      },
      "icu": {
        "min": 100000,
        "max": 250000
      },
      "daycare": null
    },
    "code": "O00.9",
    "commonName": "Ectopic Pregnancy",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "USG showing adnexal mass and empty uterus",
      "Beta-hCG levels",
      "Presence of free fluid (hemoperitoneum)",
      "Clinical status (BP/Pulse)"
    ],
    "mandatoryDocuments": [
      {
        "id": "usg_ectopic",
        "name": "USG Pelvis confirming Ectopic Gestation",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      },
      {
        "id": "bhcg_report",
        "name": "Serial Beta-hCG levels",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "OBST-096",
    "specialty": "Obstetrics & Gynecology",
    "subcategory": "Infection",
    "condition_name": "PID (Pelvic Inflammatory Disease)",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "N73.9",
        "description": "Female pelvic inflammatory disease, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [],
    "tpa_query_triggers": [
      "USG findings (Free fluid, TO mass)",
      "Cervical motion tenderness documentation",
      "High vaginal swab (HVS) results",
      "WBC count and fever"
    ],
    "documentation_must_include": [
      "USG Pelvis Report"
    ],
    "india_specific_notes": "Admission justified if outpatient antibiotics fail or if TO abscess suspected",
    "severity_markers": [
      "Tubo-ovarian (TO) abscess",
      "High fever >102F",
      "Unable to tolerate oral intake",
      "Pregnancy complication",
      "Severe peritoneal signs"
    ],
    "must_not_miss_flags": [
      "Ectopic pregnancy",
      "Appendicitis",
      "Endometriosis exacerbation"
    ],
    "admission_justification_template": "Patient presents with severe pelvic pain and fever. Examination shows {tenderness_type}. USG shows {usg_findings}. {abscess_flag}. Inpatient IV antibiotics and stabilization required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "GY-1015",
    "pmjay_package_rate": 8000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 15000,
        "max": 35000
      },
      "privateRoom": {
        "min": 25000,
        "max": 60000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": null
    },
    "code": "N73.9",
    "commonName": "PID (Pelvic Inflammatory Disease)",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "USG findings (Free fluid, TO mass)",
      "Cervical motion tenderness documentation",
      "High vaginal swab (HVS) results",
      "WBC count and fever"
    ],
    "mandatoryDocuments": [
      {
        "id": "usg_pid",
        "name": "USG Pelvis Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "RESP-097",
    "specialty": "Respiratory",
    "subcategory": "Obstructive Airway Disease",
    "condition_name": "COPD Exacerbation",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "J44.1",
        "description": "Chronic obstructive pulmonary disease with acute exacerbation",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 4,
      "max": 10,
      "average": 6
    },
    "expected_procedures": [
      "96.72"
    ],
    "tpa_query_triggers": [
      "Spirometry confirming COPD diagnosis",
      "ABG report with pH, pCO2, pO2",
      "Was NIV/BiPAP required?",
      "Previous COPD admissions and current GOLD stage"
    ],
    "documentation_must_include": [
      "Spirometry Report (baseline FEV1/FVC ratio)",
      "Arterial Blood Gas Report",
      "Chest X-Ray (hyperinflation, infiltrates)",
      "NIV/BiPAP Usage Record with Settings"
    ],
    "india_specific_notes": "Spirometry is the diagnostic gold standard — without it, TPAs may question the COPD diagnosis itself Document GOLD stage explicitly in the pre-auth",
    "severity_markers": [
      "pH <7.35",
      "pCO2 >50",
      "SpO2 <88%",
      "GOLD Stage 3-4",
      "Use of accessory muscles",
      "Cyanosis"
    ],
    "must_not_miss_flags": [
      "Pneumothorax",
      "Pulmonary embolism",
      "Cardiac failure as precipitant",
      "Pneumonia"
    ],
    "admission_justification_template": "Known COPD patient (GOLD Stage {gold_stage}, FEV1 {fev1}% predicted) presents with acute exacerbation precipitated by {precipitant}. SpO2 {spo2}% on room air, RR {rr}/min. ABG shows pH {ph}, pCO2 {pco2}. {niv_statement}. Bronchodilator nebulization, systemic corticosteroids, antibiotics, and {niv_statement} required in inpatient setting.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "RS-1007",
    "pmjay_package_rate": 10500,
    "ward_type": "any",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 25000,
        "max": 70000
      },
      "privateRoom": {
        "min": 45000,
        "max": 130000
      },
      "icu": {
        "min": 80000,
        "max": 220000
      },
      "daycare": null
    },
    "code": "J44.1",
    "commonName": "COPD Exacerbation",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 4,
      "max": 10,
      "average": 6
    },
    "commonTPAQueries": [
      "Spirometry confirming COPD diagnosis",
      "ABG report with pH, pCO2, pO2",
      "Was NIV/BiPAP required?",
      "Previous COPD admissions and current GOLD stage"
    ],
    "mandatoryDocuments": [
      {
        "id": "spirometry",
        "name": "Spirometry Report (baseline FEV1/FVC ratio)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "COPD diagnosis not pulmonary function test confirmed — GOLD stage cannot be determined"
      },
      {
        "id": "abg_copd",
        "name": "Arterial Blood Gas Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Type 2 respiratory failure / hypercapnia not documented"
      },
      {
        "id": "cxr_copd",
        "name": "Chest X-Ray (hyperinflation, infiltrates)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Precipitating cause not investigated"
      },
      {
        "id": "niv_record",
        "name": "NIV/BiPAP Usage Record with Settings",
        "category": "clinical",
        "mandatory": false,
        "whenRequired": "if NIV used",
        "tpaQueryIfMissing": "NIV usage and response not documented"
      }
    ]
  },
  {
    "id": "RESP-098",
    "specialty": "Respiratory",
    "subcategory": "Obstructive Airway Disease",
    "condition_name": "Acute Severe Asthma / Status Asthmaticus",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "J45.51",
        "description": "Severe persistent asthma with acute exacerbation",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "expected_procedures": [
      "93.91",
      "96.72"
    ],
    "tpa_query_triggers": [
      "PEFR at admission (pre-bronchodilator)",
      "SpO2 and ABG if severe",
      "Was IV magnesium or aminophylline required?",
      "Previous asthma admissions in 12 months"
    ],
    "documentation_must_include": [
      "Peak Flow (PEFR) — Pre and Post Bronchodilator",
      "SpO2 Monitoring Record"
    ],
    "india_specific_notes": "Document British Thoracic Society severity classification (moderate/severe/life-threatening) explicitly PEFR is the objective severity marker — document it",
    "severity_markers": [
      "PEFR <33% predicted",
      "SpO2 <92%",
      "Silent chest",
      "Unable to speak in sentences",
      "HR >120",
      "RR >30"
    ],
    "must_not_miss_flags": [
      "Foreign body aspiration",
      "Vocal cord dysfunction",
      "Anaphylaxis",
      "Pulmonary embolism"
    ],
    "admission_justification_template": "Patient presents with severe asthma exacerbation. PEFR {pefr}% predicted ({pefr_absolute} L/min). SpO2 {spo2}% on {o2_delivery}. BTS Classification: {bts_severity}. {iv_medications}. Multiple nebulizations in {location} without adequate response. Inpatient IV bronchodilator therapy and respiratory monitoring required.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "RS-1009",
    "pmjay_package_rate": 9200,
    "ward_type": "any",
    "icu_probability": "moderate",
    "cost_estimate": {
      "generalWard": {
        "min": 20000,
        "max": 55000
      },
      "privateRoom": {
        "min": 35000,
        "max": 100000
      },
      "icu": {
        "min": 70000,
        "max": 180000
      },
      "daycare": null
    },
    "code": "J45.51",
    "commonName": "Acute Severe Asthma / Status Asthmaticus",
    "icuProbability": "moderate",
    "typicalLOS": {
      "min": 3,
      "max": 7,
      "average": 4
    },
    "commonTPAQueries": [
      "PEFR at admission (pre-bronchodilator)",
      "SpO2 and ABG if severe",
      "Was IV magnesium or aminophylline required?",
      "Previous asthma admissions in 12 months"
    ],
    "mandatoryDocuments": [
      {
        "id": "pefr",
        "name": "Peak Flow (PEFR) — Pre and Post Bronchodilator",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Objective severity of asthma attack not documented"
      },
      {
        "id": "spo2_asthma",
        "name": "SpO2 Monitoring Record",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Hypoxemia severity not documented"
      }
    ]
  },
  {
    "id": "SURG-099",
    "specialty": "Surgery",
    "subcategory": "Abdominal Emergency",
    "condition_name": "Acute Appendicitis",
    "common_aliases": [
      "acute appendicitis",
      "appendicitis acute",
      "acute appendicitis unspecified",
      "inflamed appendix",
      "appendix infection",
      "appendiceal inflammation",
      "appendisitis",
      "apendisitis",
      "appendecitis",
      "apendicitis"
    ],
    "hinglish_terms": [
      "appendix mein sujan",
      "appendix ki bimari",
      "pet ke right side mein dard appendix",
      "अपेंडिक्स में सूजन"
    ],
    "icd_codes": {
      "primary": {
        "code": "K35.80",
        "description": "Acute appendicitis without abscess",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [
      "Alvarado >=7",
      "USG confirmed",
      "peritonitis signs"
    ],
    "medical_necessity_keywords": [
      "appendix",
      "rif pain",
      "right iliac fossa",
      "mcburney",
      "rebound tenderness",
      "appendicectomy"
    ],
    "typical_los_days": {
      "min": 3,
      "max": 6,
      "average": 4
    },
    "expected_procedures": [
      "47.01",
      "47.09"
    ],
    "tpa_query_triggers": [
      "USG abdomen for appendix visualization",
      "Alvarado score or clinical diagnosis documentation",
      "Histopathology of appendix specimen",
      "Was laparoscopic or open approach used?"
    ],
    "documentation_must_include": [
      "USG Abdomen (appendix visualization attempt)",
      "CBC (TLC and differential for leukocytosis)",
      "Histopathology Report of Appendix Specimen",
      "OT Notes (findings — gangrenous / perforated / simple)"
    ],
    "india_specific_notes": "Histopathology is mandatory — a claim can be challenged if appendix was normal histologically Document Alvarado score at admission for clinical decision justification",
    "severity_markers": [
      "Alvarado score ≥7",
      "Perforated appendix",
      "Peritonitis",
      "TLC >18,000",
      "Appendix >6mm with periappendiceal fat stranding"
    ],
    "must_not_miss_flags": [
      "Ovarian pathology (females)",
      "Meckel's diverticulum",
      "Mesenteric adenitis",
      "Crohn's disease"
    ],
    "admission_justification_template": "Patient presents with classical features of acute appendicitis: right iliac fossa pain, nausea, fever, and guarding. Alvarado score {alvarado}. TLC {tlc} with neutrophilia. USG shows {usg_findings}. Emergency appendicectomy (laparoscopic/open) performed. Intraoperative findings: {io_findings}. Histopathology confirms {hpe_result}.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "SG-1001",
    "pmjay_package_rate": 18500,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 30000,
        "max": 75000
      },
      "privateRoom": {
        "min": 55000,
        "max": 140000
      },
      "icu": {
        "min": 80000,
        "max": 200000
      },
      "daycare": null
    },
    "code": "K35.80",
    "commonName": "Acute Appendicitis",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 6,
      "average": 4
    },
    "commonTPAQueries": [
      "USG abdomen for appendix visualization",
      "Alvarado score or clinical diagnosis documentation",
      "Histopathology of appendix specimen",
      "Was laparoscopic or open approach used?"
    ],
    "mandatoryDocuments": [
      {
        "id": "usg_appendix",
        "name": "USG Abdomen (appendix visualization attempt)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Radiological workup not performed"
      },
      {
        "id": "cbc_appendix",
        "name": "CBC (TLC and differential for leukocytosis)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Inflammatory response not hematologically documented"
      },
      {
        "id": "hpe_appendix",
        "name": "Histopathology Report of Appendix Specimen",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Appendicitis not histologically confirmed — surgical necessity questioned"
      },
      {
        "id": "ot_notes_appendix",
        "name": "OT Notes (findings — gangrenous / perforated / simple)",
        "category": "operative",
        "mandatory": true,
        "tpaQueryIfMissing": "Intraoperative findings not documented"
      }
    ]
  },
  {
    "id": "SURG-100",
    "specialty": "Surgery",
    "subcategory": "Hernia Surgery",
    "condition_name": "Inguinal Hernia Repair",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "K40.30",
        "description": "Unilateral inguinal hernia, without obstruction or gangrene",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "expected_procedures": [
      "53.00",
      "53.01"
    ],
    "tpa_query_triggers": [
      "Was this obstructed / strangulated or simple hernia?",
      "Mesh used? Provide mesh sticker/invoice",
      "Was emergency or elective surgery?",
      "Clinical examination findings (reducible vs irreducible)"
    ],
    "documentation_must_include": [
      "Clinical Examination Note (hernia type, reducibility)",
      "Mesh Invoice / Sticker (if mesh used)",
      "OT Notes"
    ],
    "india_specific_notes": "Obstructed/strangulated hernia is emergency — document onset of obstruction and time to surgery Laparoscopic vs open approach should be documented",
    "severity_markers": [
      "Obstruction",
      "Strangulation",
      "Irreducibility",
      "Richter's hernia"
    ],
    "must_not_miss_flags": [
      "Strangulated hernia (surgical emergency)",
      "Femoral hernia (higher strangulation risk)",
      "Lymph node / lipoma mimicking hernia"
    ],
    "admission_justification_template": "Patient presents with {hernia_type} inguinal hernia, {reducibility}. {obstruction_strangulation}. Surgical repair indicated for {indication}. {mesh_plan}. {approach} hernia repair performed.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "SG-1005",
    "pmjay_package_rate": 12000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 20000,
        "max": 55000
      },
      "privateRoom": {
        "min": 35000,
        "max": 95000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 18000,
        "max": 45000
      }
    },
    "code": "K40.30",
    "commonName": "Inguinal Hernia Repair",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 3,
      "average": 2
    },
    "commonTPAQueries": [
      "Was this obstructed / strangulated or simple hernia?",
      "Mesh used? Provide mesh sticker/invoice",
      "Was emergency or elective surgery?",
      "Clinical examination findings (reducible vs irreducible)"
    ],
    "mandatoryDocuments": [
      {
        "id": "clinical_hernia",
        "name": "Clinical Examination Note (hernia type, reducibility)",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Hernia characteristics not clinically documented"
      },
      {
        "id": "mesh_sticker",
        "name": "Mesh Invoice / Sticker (if mesh used)",
        "category": "implant",
        "mandatory": false,
        "whenRequired": "if synthetic mesh used",
        "tpaQueryIfMissing": "Mesh cost not verifiable"
      },
      {
        "id": "ot_notes_hernia",
        "name": "OT Notes",
        "category": "operative",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "ONCO-101",
    "specialty": "Oncology",
    "subcategory": "Solid Tumors — Breast",
    "condition_name": "Breast Cancer",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "C50.919",
        "description": "Malignant neoplasm of unspecified site of unspecified female breast",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 3,
      "max": 8,
      "average": 5
    },
    "expected_procedures": [
      "85.43",
      "85.48",
      "85.36"
    ],
    "tpa_query_triggers": [
      "Histopathology confirming malignancy",
      "Staging workup (CT chest/abdomen/pelvis, bone scan)",
      "FNAC or core biopsy report",
      "Tumour markers (CA 15-3, CEA)",
      "Multidisciplinary team (MDT) treatment plan"
    ],
    "documentation_must_include": [
      "Core Biopsy or FNAC Report with ER/PR/HER2 status",
      "Mammography + USG Breast (BIRADS classification)",
      "CT Chest/Abdomen/Pelvis (staging)",
      "MDT Meeting Minutes / Treatment Plan",
      "OT Notes with Margin Status"
    ],
    "india_specific_notes": "ER/PR/HER2 receptor status is required by TPA to assess chemotherapy/targeted therapy need All oncology claims require MDT documentation — this is standard TPA requirement",
    "severity_markers": [
      "Stage III-IV",
      "HER2 positive",
      "Triple negative",
      "Inflammatory breast cancer",
      "Lymph node involvement"
    ],
    "must_not_miss_flags": [
      "Phyllodes tumour",
      "Metastatic disease from other primary",
      "Lymphoma"
    ],
    "admission_justification_template": "Patient with histologically confirmed {histology} breast carcinoma, {er_pr_her2} status, Stage {stage}. MDT recommendation: {mdt_plan}. {surgery_type} performed as part of multimodality treatment plan. Complete staging workup done confirming {staging_findings}.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "OC-1003",
    "pmjay_package_rate": 55000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 80000,
        "max": 250000
      },
      "privateRoom": {
        "min": 150000,
        "max": 450000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": null
    },
    "code": "C50.919",
    "commonName": "Breast Cancer",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 3,
      "max": 8,
      "average": 5
    },
    "commonTPAQueries": [
      "Histopathology confirming malignancy",
      "Staging workup (CT chest/abdomen/pelvis, bone scan)",
      "FNAC or core biopsy report",
      "Tumour markers (CA 15-3, CEA)",
      "Multidisciplinary team (MDT) treatment plan"
    ],
    "mandatoryDocuments": [
      {
        "id": "biopsy_breast",
        "name": "Core Biopsy or FNAC Report with ER/PR/HER2 status",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Malignancy not histologically confirmed — surgical necessity questioned"
      },
      {
        "id": "mammo_usg",
        "name": "Mammography + USG Breast (BIRADS classification)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Radiological staging not documented"
      },
      {
        "id": "staging_ct",
        "name": "CT Chest/Abdomen/Pelvis (staging)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Distant metastasis not assessed — stage undetermined"
      },
      {
        "id": "mdt_plan",
        "name": "MDT Meeting Minutes / Treatment Plan",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Treatment not evidence-based multidisciplinary decision"
      },
      {
        "id": "ot_notes_breast",
        "name": "OT Notes with Margin Status",
        "category": "operative",
        "mandatory": true,
        "tpaQueryIfMissing": ""
      }
    ]
  },
  {
    "id": "ONCO-102",
    "specialty": "Oncology",
    "subcategory": "Cancer Treatment",
    "condition_name": "Chemotherapy Administration",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "Z51.11",
        "description": "Encounter for antineoplastic chemotherapy",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [],
    "medical_necessity_keywords": [],
    "typical_los_days": {
      "min": 1,
      "max": 5,
      "average": 2
    },
    "expected_procedures": [
      "99.25"
    ],
    "tpa_query_triggers": [
      "Oncologist prescription with cycle number and regimen",
      "Primary cancer diagnosis and histopathology",
      "Pre-chemo CBC, LFT, RFT clearance",
      "Drug invoice — branded vs generic",
      "Pre-authorization for each chemotherapy cycle"
    ],
    "documentation_must_include": [
      "Oncologist Prescription with Cycle, Regimen, BSA Calculation",
      "Primary Cancer Histopathology Report",
      "Pre-Chemotherapy Labs (CBC, LFT, RFT, ECHO if anthracycline)",
      "Chemotherapy Drug Invoice (with batch number)"
    ],
    "india_specific_notes": "Pre-authorization must be renewed for each chemotherapy cycle — one PA for multiple cycles is insufficient for most TPAs BSA-based dosing calculation must be documented by oncologist",
    "severity_markers": [
      "Febrile neutropenia",
      "Grade 3-4 toxicity",
      "Dose reduction required"
    ],
    "must_not_miss_flags": [
      "Febrile neutropenia (oncological emergency)",
      "Drug toxicity",
      "Disease progression on current regimen"
    ],
    "admission_justification_template": "Patient with {primary_cancer} on cycle {cycle_number} of {regimen} chemotherapy. BSA {bsa} m², doses: {drug_doses}. Pre-chemotherapy labs within acceptable range: {lab_summary}. Chemotherapy administered as per MDT protocol. {cycle_rationale}.",
    "pmjay_eligible": true,
    "pmjay_hbp_code": "OC-1021",
    "pmjay_package_rate": 35000,
    "ward_type": "general",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 30000,
        "max": 150000
      },
      "privateRoom": {
        "min": 55000,
        "max": 280000
      },
      "icu": {
        "min": 0,
        "max": 0
      },
      "daycare": {
        "min": 25000,
        "max": 120000
      }
    },
    "code": "Z51.11",
    "commonName": "Chemotherapy Administration",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 1,
      "max": 5,
      "average": 2
    },
    "commonTPAQueries": [
      "Oncologist prescription with cycle number and regimen",
      "Primary cancer diagnosis and histopathology",
      "Pre-chemo CBC, LFT, RFT clearance",
      "Drug invoice — branded vs generic",
      "Pre-authorization for each chemotherapy cycle"
    ],
    "mandatoryDocuments": [
      {
        "id": "onco_prescription",
        "name": "Oncologist Prescription with Cycle, Regimen, BSA Calculation",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Chemotherapy not physician-prescribed with dosing rationale"
      },
      {
        "id": "primary_ca_diagnosis",
        "name": "Primary Cancer Histopathology Report",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Underlying malignancy not confirmed"
      },
      {
        "id": "pre_chemo_labs",
        "name": "Pre-Chemotherapy Labs (CBC, LFT, RFT, ECHO if anthracycline)",
        "category": "investigation",
        "mandatory": true,
        "tpaQueryIfMissing": "Organ function clearance for chemotherapy not documented"
      },
      {
        "id": "drug_invoice_chemo",
        "name": "Chemotherapy Drug Invoice (with batch number)",
        "category": "clinical",
        "mandatory": true,
        "tpaQueryIfMissing": "Drug cost not verifiable"
      }
    ]
  },
  {
    "id": "FLOOR-001",
    "specialty": "General Medicine",
    "subcategory": "General",
    "condition_name": "Illness, unspecified",
    "common_aliases": [],
    "hinglish_terms": [],
    "icd_codes": {
      "primary": {
        "code": "R69",
        "description": "Illness, unspecified",
        "use_as_default": true
      },
      "specific_variants": []
    },
    "commonly_associated_codes": [],
    "admission_criteria": [
      "Requires investigation",
      "Observation needed"
    ],
    "medical_necessity_keywords": [
      "undiagnosed",
      "under evaluation",
      "investigation required"
    ],
    "typical_los_days": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "expected_procedures": [
      "Basic investigations",
      "Specialist consultation"
    ],
    "tpa_query_triggers": [
      "Specific diagnosis should be updated once confirmed"
    ],
    "documentation_must_include": [
      "Working diagnosis",
      "Investigation plan"
    ],
    "india_specific_notes": "Use as temporary code. Update with specific ICD once diagnosis is confirmed.",
    "severity_markers": [],
    "must_not_miss_flags": [],
    "admission_justification_template": "Patient presents with unspecified symptoms requiring inpatient investigation and management.",
    "pmjay_eligible": false,
    "ward_type": "any",
    "icu_probability": "low",
    "cost_estimate": {
      "generalWard": {
        "min": 10000,
        "max": 25000
      },
      "privateRoom": {
        "min": 20000,
        "max": 45000
      },
      "icu": {
        "min": 45000,
        "max": 90000
      },
      "daycare": null
    },
    "code": "R69",
    "commonName": "Illness, unspecified",
    "icuProbability": "low",
    "typicalLOS": {
      "min": 2,
      "max": 5,
      "average": 3
    },
    "commonTPAQueries": [
      "Specific diagnosis should be updated once confirmed"
    ],
    "mandatoryDocuments": []
  }
];

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
      return `[${condition.icd_codes.primary.code}] ${condition.condition_name}
  Terms: ${allTerms.slice(0, 15).join(', ')}
  Variants: ${condition.icd_codes.specific_variants.map(v => `${v.code} (${v.use_when})`).join('; ') || 'None'}`;
    })
    .join('\n\n');
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
      warningMessage: `"${cleaned}" is a category code. Indian TPAs require a billable subcategory code. Recommended: ${condition.icd_codes.primary.code} — ${condition.icd_codes.primary.description}`
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

