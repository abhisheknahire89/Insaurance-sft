/**
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

export const ICD10_DATABASE: ICD10Condition[] = [
  {
    "id": "RESP-000",
    "specialty": "Respiratory",
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
    "pmjay_eligible": true
  },
  {
    "id": "RESP-001",
    "specialty": "Respiratory",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-002",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-003",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-004",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-005",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-006",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-007",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "NEUR-008",
    "specialty": "Neurology",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-009",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-010",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-011",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GAST-012",
    "specialty": "Gastroenterology",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-013",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-014",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-015",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-016",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GAST-017",
    "specialty": "Gastroenterology",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-018",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-019",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-020",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-021",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-022",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-023",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-024",
    "specialty": "General Medicine",
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
    "pmjay_eligible": false
  },
  {
    "id": "GENE-025",
    "specialty": "General Medicine",
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
    "pmjay_eligible": false
  },
  {
    "id": "GENE-026",
    "specialty": "General Medicine",
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
    "pmjay_eligible": false
  },
  {
    "id": "GENE-027",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-028",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-029",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "GENE-030",
    "specialty": "General Medicine",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-031",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-032",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-033",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-034",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-035",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-036",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-037",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-038",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-039",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-040",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-041",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-042",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-043",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "SURG-044",
    "specialty": "Surgery",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-045",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-046",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-047",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-048",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "SURG-049",
    "specialty": "Surgery",
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
    "pmjay_eligible": true
  },
  {
    "id": "SURG-050",
    "specialty": "Surgery",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-051",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-052",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "CARD-053",
    "specialty": "Cardiology",
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
    "pmjay_eligible": true
  },
  {
    "id": "SURG-054",
    "specialty": "Surgery",
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
    "pmjay_eligible": true
  },
  {
    "id": "GAST-055",
    "specialty": "Gastroenterology",
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
    "pmjay_eligible": true
  },
  {
    "id": "SURG-056",
    "specialty": "Surgery",
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
    "pmjay_eligible": true
  },
  {
    "id": "GAST-057",
    "specialty": "Gastroenterology",
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
    "pmjay_eligible": true
  },
  {
    "id": "GAST-058",
    "specialty": "Gastroenterology",
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
    "pmjay_eligible": false
  },
  {
    "id": "GAST-059",
    "specialty": "Gastroenterology",
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
    "pmjay_eligible": true
  },
  {
    "id": "GAST-060",
    "specialty": "Gastroenterology",
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
    "pmjay_eligible": true
  },
  {
    "id": "GAST-061",
    "specialty": "Gastroenterology",
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
    "pmjay_eligible": true
  },
  {
    "id": "GAST-062",
    "specialty": "Gastroenterology",
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
    "pmjay_eligible": false
  },
  {
    "id": "GAST-063",
    "specialty": "Gastroenterology",
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
    "pmjay_eligible": false
  },
  {
    "id": "GAST-064",
    "specialty": "Gastroenterology",
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
    "pmjay_eligible": false
  },
  {
    "id": "GAST-065",
    "specialty": "Gastroenterology",
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
    "pmjay_eligible": true
  },
  {
    "id": "GAST-066",
    "specialty": "Gastroenterology",
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
    "pmjay_eligible": true
  },
  {
    "id": "ORTH-067",
    "specialty": "Orthopedics",
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
    "pmjay_eligible": true
  },
  {
    "id": "ORTH-068",
    "specialty": "Orthopedics",
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
    "pmjay_eligible": true
  },
  {
    "id": "ORTH-069",
    "specialty": "Orthopedics",
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
    "pmjay_eligible": true
  },
  {
    "id": "ORTH-070",
    "specialty": "Orthopedics",
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
    "pmjay_eligible": true
  },
  {
    "id": "ORTH-071",
    "specialty": "Orthopedics",
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
    "pmjay_eligible": true
  },
  {
    "id": "ORTH-072",
    "specialty": "Orthopedics",
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
    "pmjay_eligible": true
  },
  {
    "id": "ORTH-073",
    "specialty": "Orthopedics",
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
    "pmjay_eligible": true
  },
  {
    "id": "ORTH-074",
    "specialty": "Orthopedics",
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
    "pmjay_eligible": true
  },
  {
    "id": "ORTH-075",
    "specialty": "Orthopedics",
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
    "pmjay_eligible": true
  },
  {
    "id": "ORTH-076",
    "specialty": "Orthopedics",
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
    "pmjay_eligible": true
  },
  {
    "id": "ORTH-077",
    "specialty": "Orthopedics",
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
    "pmjay_eligible": false
  },
  {
    "id": "ORTH-078",
    "specialty": "Orthopedics",
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
    "pmjay_eligible": false
  },
  {
    "id": "ORTH-079",
    "specialty": "Orthopedics",
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
    "pmjay_eligible": false
  },
  {
    "id": "NEUR-080",
    "specialty": "Neurology",
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
    "pmjay_eligible": true
  },
  {
    "id": "NEUR-081",
    "specialty": "Neurology",
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
    "pmjay_eligible": true
  },
  {
    "id": "NEUR-082",
    "specialty": "Neurology",
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
    "pmjay_eligible": true
  },
  {
    "id": "NEUR-083",
    "specialty": "Neurology",
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
    "pmjay_eligible": true
  },
  {
    "id": "NEUR-084",
    "specialty": "Neurology",
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
    "pmjay_eligible": false
  },
  {
    "id": "NEUR-085",
    "specialty": "Neurology",
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
    "pmjay_eligible": true
  },
  {
    "id": "NEUR-086",
    "specialty": "Neurology",
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
    "pmjay_eligible": true
  },
  {
    "id": "UROL-087",
    "specialty": "Urology",
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
    "pmjay_eligible": true
  },
  {
    "id": "UROL-088",
    "specialty": "Urology",
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
    "pmjay_eligible": true
  },
  {
    "id": "UROL-089",
    "specialty": "Urology",
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
    "pmjay_eligible": true
  },
  {
    "id": "UROL-090",
    "specialty": "Urology",
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
    "pmjay_eligible": true
  },
  {
    "id": "UROL-091",
    "specialty": "Urology",
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
    "pmjay_eligible": true
  },
  {
    "id": "OBST-092",
    "specialty": "Obstetrics & Gynecology",
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
    "pmjay_eligible": true
  },
  {
    "id": "OBST-093",
    "specialty": "Obstetrics & Gynecology",
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
    "pmjay_eligible": true
  },
  {
    "id": "OBST-094",
    "specialty": "Obstetrics & Gynecology",
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
    "pmjay_eligible": true
  },
  {
    "id": "OBST-095",
    "specialty": "Obstetrics & Gynecology",
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
    "pmjay_eligible": true
  },
  {
    "id": "OBST-096",
    "specialty": "Obstetrics & Gynecology",
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
    "pmjay_eligible": true
  },
  {
    "id": "RESP-097",
    "specialty": "Respiratory",
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
    "pmjay_eligible": true
  },
  {
    "id": "RESP-098",
    "specialty": "Respiratory",
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
    "pmjay_eligible": true
  },
  {
    "id": "SURG-099",
    "specialty": "Surgery",
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
    "pmjay_eligible": true
  },
  {
    "id": "SURG-100",
    "specialty": "Surgery",
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
    "pmjay_eligible": true
  },
  {
    "id": "ONCO-101",
    "specialty": "Oncology",
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
    "pmjay_eligible": true
  },
  {
    "id": "ONCO-102",
    "specialty": "Oncology",
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
    "pmjay_eligible": true
  },
  {
    "id": "FLOOR-001",
    "specialty": "General",
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
    "pmjay_eligible": false
  }
];

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
      return `[${condition.icd_codes.primary.code}] ${condition.condition_name}
  Terms: ${allTerms.slice(0, 15).join(', ')}
  Variants: ${condition.icd_codes.specific_variants.map(v => `${v.code} (${v.use_when})`).join('; ') || 'None'}`;
    })
    .join('\n\n');
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

// Ensure the old exports still work to avoid breaking imports elsewhere
// Mapping the new database to the old interface methods
export const searchConditions = (query: string) => {
    // legacy mock return if anywhere calls this
    return ICD10_DATABASE.filter(c => c.condition_name.toLowerCase().includes(query.toLowerCase()));
};
// Add more shims as necessary if we really wiped out the old DB completely
