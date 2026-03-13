export interface DocumentRequirement {
  id: string;
  name: string;
  category: 'clinical' | 'administrative' | 'investigation' | 'operative' | 'implant';
  mandatory: boolean;
  whenRequired?: string;
  tpaQueryIfMissing: string;
}

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
  code: string;
  description: string;
  commonName: string;
  specialty: MedicalSpecialty;
  subcategory: string;
  typicalLOS: { min: number; max: number; average: number };
  admissionType: 'emergency' | 'elective' | 'both';
  wardType: 'general' | 'semi_private' | 'private' | 'icu' | 'any';
  icuProbability: 'low' | 'moderate' | 'high';
  surgeryRequired: boolean;
  procedureCodes: string[];
  costEstimate: {
    generalWard: { min: number; max: number };
    privateRoom: { min: number; max: number };
    icu: { min: number; max: number };
    daycare: { min: number; max: number } | null;
  };
  pmjayEligible: boolean;
  pmjayHBPCode?: string;
  pmjayPackageRate?: number;
  tpaRoomRentLimit?: string;
  daycareEligible: boolean;
  commonTPAQueries: string[];
  highRejectionRisk: boolean;
  rejectionReasons: string[];
  preAuthRequired: boolean;
  preAuthUrgency: 'routine' | 'urgent' | 'emergency';
  mandatoryDocuments: DocumentRequirement[];
  recommendedDocuments: DocumentRequirement[];
  specialNotes: string[];
  severityMarkers: string[];
  mustNotMissFlags: string[];
  admissionJustificationTemplate: string;
}

export const ICD10_MASTER_DB: ICD10Condition[] = [
  // ══════════════════════════════════════════════════════════════
  // SPECIALTY 1: GENERAL MEDICINE
  // ══════════════════════════════════════════════════════════════

  {
    code: 'J18.9',
    description: 'Pneumonia, unspecified organism',
    commonName: 'Community Acquired Pneumonia (CAP)',
    specialty: 'Respiratory',
    subcategory: 'Respiratory Infections',
    typicalLOS: { min: 4, max: 10, average: 6 },
    admissionType: 'emergency',
    wardType: 'any',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: ['96.04', '93.90'],
    costEstimate: {
      generalWard: { min: 25000, max: 60000 },
      privateRoom: { min: 50000, max: 120000 },
      icu: { min: 80000, max: 200000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1023',
    pmjayPackageRate: 8400,
    daycareEligible: false,
    commonTPAQueries: [
      'Why was hospitalization required instead of OPD treatment?',
      'Please provide SpO2 readings on admission and trend',
      'Submit blood culture and sensitivity report',
      'Provide daily progress notes showing active treatment',
      'Justify length of stay beyond 5 days',
      'Submit repeat chest X-ray report'
    ],
    highRejectionRisk: true,
    rejectionReasons: [
      'Mild pneumonia treated as OPD in other centers',
      'Missing SpO2 documentation',
      'No culture reports submitted'
    ],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'cxr_admission', name: 'Chest X-Ray — Admission Film + Radiologist Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Radiological evidence of pneumonia not provided' },
      { id: 'cbc_admission', name: 'Complete Blood Count with Differential', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Hematological evidence of infection not documented' },
      { id: 'crp_esr', name: 'CRP or ESR', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Inflammatory markers not provided' },
      { id: 'spo2_chart', name: 'SpO2 Monitoring Chart (admission value mandatory)', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Oxygen saturation at admission not documented — hospitalization necessity unclear' },
      { id: 'discharge_summary', name: 'Discharge Summary with day-wise progress', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Discharge summary missing or insufficient' },
      { id: 'nursing_charts', name: 'Nursing Charts — Vitals, Temperature, I/O', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'No objective clinical monitoring documented' },
      { id: 'antibiotic_chart', name: 'Antibiotic Administration Chart', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'IV antibiotic therapy not documented' },
      { id: 'abg', name: 'Arterial Blood Gas Report', category: 'investigation', mandatory: false, whenRequired: 'if SpO2 <94% at any point', tpaQueryIfMissing: 'Severity of hypoxia not objectively documented' }
    ],
    recommendedDocuments: [
      { id: 'blood_culture', name: 'Blood Culture and Sensitivity (if sent)', category: 'investigation', mandatory: false, tpaQueryIfMissing: 'Bacteriological evidence absent' },
      { id: 'sputum_culture', name: 'Sputum Culture (if sent)', category: 'investigation', mandatory: false, tpaQueryIfMissing: 'Organism identification not attempted' },
      { id: 'cxr_followup', name: 'Follow-up Chest X-Ray (at 48-72h)', category: 'investigation', mandatory: false, tpaQueryIfMissing: 'Treatment response not radiologically confirmed' },
      { id: 'procalcitonin', name: 'Procalcitonin (if done)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['SpO2 <94%', 'RR >24/min', 'HR >100/min', 'CRP >100', 'TLC >15000', 'Bilateral infiltrates', 'CURB-65 ≥2'],
    mustNotMissFlags: ['Pulmonary TB', 'Lung malignancy', 'COVID-19 pneumonia', 'Pulmonary embolism'],
    specialNotes: [
      'CURB-65 score ≥2 is standard threshold for inpatient admission — document score explicitly',
      'Failed prior oral antibiotic therapy is a strong hospitalization justification — document drug name and duration',
      'Uncontrolled diabetes as comorbidity directly increases severity and LOS'
    ],
    admissionJustificationTemplate: 'Patient presents with community-acquired pneumonia (ICD-10: J18.9) with SpO2 {spo2}% on room air, RR {rr}/min, and temperature {temp}°F. CURB-65 score of {curb65} indicates {severity} severity requiring inpatient management. Prior outpatient antibiotic therapy ({prior_treatment}) failed to produce clinical improvement. Hypoxia requiring supplemental oxygen cannot be safely managed in the outpatient setting.'
  },

  {
    code: 'A09',
    description: 'Infectious gastroenteritis and colitis, unspecified',
    commonName: 'Acute Gastroenteritis',
    specialty: 'General Medicine',
    subcategory: 'Gastrointestinal Infections',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: ['99.18'],
    costEstimate: {
      generalWard: { min: 8000, max: 25000 },
      privateRoom: { min: 15000, max: 45000 },
      icu: { min: 40000, max: 90000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1041',
    pmjayPackageRate: 4500,
    daycareEligible: false,
    commonTPAQueries: [
      'Was OPD rehydration attempted before admission?',
      'Provide serum electrolytes showing dehydration severity',
      'Was patient able to tolerate oral fluids?',
      'Justify hospitalization for gastroenteritis'
    ],
    highRejectionRisk: true,
    rejectionReasons: [
      'Considered OPD-treatable by TPAs in mild-moderate cases',
      'Missing electrolyte reports',
      'No documentation of failed oral rehydration',
      'Short LOS without clear clinical justification'
    ],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'electrolytes', name: 'Serum Electrolytes (Na, K, Cl, Bicarbonate)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Dehydration severity not biochemically documented' },
      { id: 'rft', name: 'Renal Function Tests (Creatinine, BUN)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Renal impact of dehydration not assessed' },
      { id: 'io_chart', name: 'Input/Output Chart', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Fluid deficit not documented' },
      { id: 'stool_routine', name: 'Stool Routine and Microscopy', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Infectious etiology not investigated' }
    ],
    recommendedDocuments: [
      { id: 'stool_culture', name: 'Stool Culture (if sent)', category: 'investigation', mandatory: false, tpaQueryIfMissing: 'Pathogen not identified' },
      { id: 'cbc', name: 'CBC to rule out systemic infection', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Na <130 mEq/L', 'K <3.0 mEq/L', 'Creatinine elevated', 'HR >100', 'Skin turgor reduced', 'Unable to tolerate oral fluids', 'Passage >10 stools/day'],
    mustNotMissFlags: ['Acute appendicitis', 'Intestinal obstruction', 'Inflammatory bowel disease flare', 'Typhoid fever'],
    specialNotes: [
      'TPAs routinely question gastroenteritis admissions — document failed oral rehydration explicitly',
      'Electrolyte imbalance is the primary hospitalization justification',
      'Pediatric and elderly patients have stronger justification for admission'
    ],
    admissionJustificationTemplate: 'Patient presents with acute gastroenteritis with {vomiting_frequency} vomiting episodes and {stool_frequency} loose stools over {duration}. Serum sodium {sodium} mEq/L and potassium {potassium} mEq/L indicate {severity} dehydration. Patient unable to tolerate oral rehydration. IV fluid resuscitation and electrolyte correction required in monitored inpatient setting.'
  },

  {
    code: 'E11.65',
    description: 'Type 2 diabetes mellitus with hyperglycemia',
    commonName: 'Uncontrolled Type 2 Diabetes / Diabetic Hyperglycemia',
    specialty: 'General Medicine',
    subcategory: 'Endocrine & Metabolic',
    typicalLOS: { min: 3, max: 7, average: 4 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: ['99.18', '99.17'],
    costEstimate: {
      generalWard: { min: 12000, max: 35000 },
      privateRoom: { min: 22000, max: 65000 },
      icu: { min: 50000, max: 120000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1089',
    pmjayPackageRate: 5200,
    daycareEligible: false,
    commonTPAQueries: [
      'Was this a new diagnosis or known diabetic?',
      'What was the precipitating factor for decompensation?',
      'Provide HbA1c report',
      'Was DKA or HHS ruled out?',
      'Submit serial blood glucose charts'
    ],
    highRejectionRisk: true,
    rejectionReasons: [
      'Considered OPD-manageable by TPAs',
      'Missing documentation of why home insulin adjustment was insufficient',
      'No evidence of acute complication'
    ],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'serial_bsl', name: 'Serial Blood Sugar Log (minimum 4 readings/day)', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Glycemic instability not documented' },
      { id: 'hba1c', name: 'HbA1c', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Long-term control not assessed' },
      { id: 'urine_ketones', name: 'Urine Ketones / Urine R/M', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'DKA not ruled out' },
      { id: 'electrolytes_dm', name: 'Serum Electrolytes', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Metabolic status not documented' },
      { id: 'rft_dm', name: 'Renal Function Tests', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Diabetic nephropathy impact not assessed' }
    ],
    recommendedDocuments: [
      { id: 'abg_dm', name: 'ABG (if DKA suspected)', category: 'investigation', mandatory: false, whenRequired: 'if pH concern or altered sensorium', tpaQueryIfMissing: 'Metabolic acidosis not evaluated' },
      { id: 'ecg_dm', name: 'ECG (cardiac risk in diabetes)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['FBS >400 mg/dL', 'Urine ketones positive', 'pH <7.3', 'Bicarbonate <18', 'Altered sensorium', 'HbA1c >12%'],
    mustNotMissFlags: ['DKA', 'Hyperosmolar hyperglycemic state (HHS)', 'Hypoglycemia', 'Sepsis precipitating hyperglycemia'],
    specialNotes: [
      'Admission justified only if: DKA/HHS present, or precipitating illness present (infection, MI), or home insulin management clearly failed',
      'Document the reason for decompensation — infection, dietary non-compliance, missed doses',
      'Comorbid infections must be separately documented and coded'
    ],
    admissionJustificationTemplate: 'Patient with known Type 2 diabetes presents with blood glucose {bsl} mg/dL with urine ketones {ketones}. {precipitating_factor}. HbA1c {hba1c}% indicating long-term poor control. IV insulin infusion and electrolyte correction required in monitored setting. Home insulin dose adjustment insufficient given current glycemic instability.'
  },

  {
    code: 'A01.00',
    description: 'Typhoid fever, unspecified',
    commonName: 'Typhoid / Enteric Fever',
    specialty: 'General Medicine',
    subcategory: 'Tropical Infections',
    typicalLOS: { min: 7, max: 14, average: 10 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 20000, max: 55000 },
      privateRoom: { min: 35000, max: 90000 },
      icu: { min: 70000, max: 150000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1044',
    pmjayPackageRate: 7200,
    daycareEligible: false,
    commonTPAQueries: [
      'Widal test alone is insufficient — submit blood culture',
      'Provide day-wise fever chart',
      'Justify LOS beyond 7 days'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Widal test not confirmatory', 'Missing blood culture'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'widal', name: 'Widal Test Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Serological evidence not provided' },
      { id: 'blood_culture_typhoid', name: 'Blood Culture (gold standard)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Bacteriological confirmation absent — Widal alone insufficient' },
      { id: 'fever_chart', name: 'Temperature Chart (daily step-ladder pattern)', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Classic fever pattern not documented' },
      { id: 'lft_typhoid', name: 'Liver Function Tests', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Hepatic involvement not assessed' },
      { id: 'cbc_typhoid', name: 'CBC (relative lymphocytosis / thrombocytopenia)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Hematological features not documented' }
    ],
    recommendedDocuments: [
      { id: 'typhidot', name: 'Typhidot / Typhi IgM (rapid test)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' },
      { id: 'usg_abdomen_typhoid', name: 'USG Abdomen (if complications suspected)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Platelet count <80,000', 'Hepatomegaly', 'Splenomegaly', 'Intestinal perforation signs', 'Altered sensorium'],
    mustNotMissFlags: ['Intestinal perforation', 'Typhoid hepatitis', 'Malaria co-infection', 'Meningitis'],
    specialNotes: ['Blood culture is diagnostic gold standard — collect before starting antibiotics', 'LOS typically 10-14 days — document clinical milestones for each day'],
    admissionJustificationTemplate: 'Patient presents with 7-day history of step-ladder fever, relative bradycardia, and toxemia consistent with enteric fever. Widal test positive (O:{widal_o}, H:{widal_h}). Blood culture sent. TLC {tlc} with relative lymphocytosis. Platelet count {platelets}. IV antibiotics and close monitoring for complications (intestinal perforation, hepatitis, thrombocytopenia) required in inpatient setting.'
  },

  {
    code: 'A90',
    description: 'Dengue fever [classical dengue]',
    commonName: 'Dengue Fever',
    specialty: 'General Medicine',
    subcategory: 'Tropical Infections',
    typicalLOS: { min: 4, max: 9, average: 6 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 18000, max: 50000 },
      privateRoom: { min: 30000, max: 85000 },
      icu: { min: 65000, max: 160000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1046',
    pmjayPackageRate: 6800,
    daycareEligible: false,
    commonTPAQueries: [
      'NS1 antigen or IgM ELISA confirmation required',
      'Provide twice-daily platelet count chart',
      'Submit dengue warning signs documentation',
      'Was platelet transfusion given? Provide indication and consent'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Missing NS1/IgM report', 'Platelet count not critically low', 'Missing serial platelet counts'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'ns1_dengue', name: 'NS1 Antigen Test OR Dengue IgM ELISA', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Dengue diagnosis not serologically confirmed' },
      { id: 'serial_platelets', name: 'Serial Platelet Count (minimum twice daily)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Thrombocytopenia trend not documented — transfusion indication unclear' },
      { id: 'cbc_dengue', name: 'CBC with Hematocrit', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Hemoconcentration not assessed' },
      { id: 'lft_dengue', name: 'Liver Function Tests (SGOT/SGPT)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Dengue hepatitis not evaluated' }
    ],
    recommendedDocuments: [
      { id: 'platelet_consent', name: 'Platelet Transfusion Consent + Indication Note', category: 'clinical', mandatory: false, whenRequired: 'if platelet transfusion given', tpaQueryIfMissing: 'Transfusion not clinically justified in documentation' },
      { id: 'usg_dengue', name: 'USG Abdomen (pleural effusion, ascites)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Platelet <20,000', 'Hematocrit rise >20%', 'Plasma leakage signs', 'Bleeding manifestations', 'Shock', 'Hepatomegaly'],
    mustNotMissFlags: ['Dengue hemorrhagic fever', 'Dengue shock syndrome', 'Malaria co-infection', 'Leptospirosis'],
    specialNotes: ['Serial platelet counts are mandatory for TPA — missing these is #1 dengue claim rejection reason', 'Document warning signs explicitly: abdominal pain, persistent vomiting, bleeding'],
    admissionJustificationTemplate: 'Patient presents with acute febrile illness consistent with dengue fever confirmed by {dengue_test}. Platelet count {platelets} with declining trend. Dengue warning signs present: {warning_signs}. Serial platelet monitoring and IV fluid management required in inpatient setting to prevent dengue hemorrhagic fever and shock syndrome.'
  },

  {
    code: 'B54',
    description: 'Unspecified malaria',
    commonName: 'Malaria',
    specialty: 'General Medicine',
    subcategory: 'Tropical Infections',
    typicalLOS: { min: 3, max: 7, average: 5 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 15000, max: 40000 },
      privateRoom: { min: 25000, max: 70000 },
      icu: { min: 50000, max: 120000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1045',
    pmjayPackageRate: 6500,
    daycareEligible: false,
    commonTPAQueries: [
      'Submit peripheral smear report (MP/PS)',
      'Malaria Rapid Diagnostic Test (RDT) result',
      'Was IV artesunate or quinine given?',
      'Daily temperature and parasite clearance chart'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Missing MP/PS confirmation', 'Mild malaria manageable on OPD basis'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'mp_ps', name: 'Peripheral Smear for Malarial Parasite (MP/PS)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Microscopic confirmation of malaria not provided' },
      { id: 'rdt_malaria', name: 'Rapid Diagnostic Test (RDT) for Malaria', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Rapid antigen record not provided' },
      { id: 'cbc_malaria', name: 'CBC with Platelet Count', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Anemia and thrombocytopenia not assessed' },
      { id: 'lft_malaria', name: 'Liver Function Tests', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Malarial hepatitis not evaluated' }
    ],
    recommendedDocuments: [
      { id: 'usg_malaria', name: 'USG Abdomen (Splenomegaly assessment)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Parasitemia >2%', 'Altered sensorium (Cerebral Malaria)', 'Jaundice (TLC >20000)', 'Platelet <50,000', 'Creatinine >3.0', 'Hb <7 g/dL'],
    mustNotMissFlags: ['Cerebral malaria', 'Degue co-infection', 'Blackwater fever'],
    specialNotes: ['Cerebral malaria (Pf) is medical emergency — document GCS score', 'Vividly document parasite density if high'],
    admissionJustificationTemplate: 'Patient presents with high-grade fever with chills and rigor. MP/PS confirms {malaria_species} malaria. {cerebral_malaria_flag}. Platelet count {platelets}, Hb {hb}. IV Artesunate therapy and monitoring for complications required in inpatient setting.'
  },

  {
    code: 'N39.0',
    description: 'Urinary tract infection, site not specified',
    commonName: 'Urinary Tract Infection (UTI)',
    specialty: 'General Medicine',
    subcategory: 'Urogenital Infections',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 10000, max: 30000 },
      privateRoom: { min: 20000, max: 55000 },
      icu: { min: 45000, max: 100000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1065',
    pmjayPackageRate: 4800,
    daycareEligible: false,
    commonTPAQueries: [
      'Urine R/M showing pus cells',
      'Urine culture and sensitivity report',
      'Was IV antibiotic required?',
      'RFT to rule out pyelonephritis'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Considered OPD manageable unless complicated', 'Missing culture report'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'urine_rm', name: 'Urine Routine and Microscopy', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Pus cells and bacteriuria not documented' },
      { id: 'urine_culture', name: 'Urine Culture and Sensitivity', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Organism identification and sensitivity not provided' },
      { id: 'rft_uti', name: 'Renal Function Tests', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Renal function status not assessed' }
    ],
    recommendedDocuments: [
      { id: 'usg_kub_uti', name: 'USG KUB (Kidney, Uretor, Bladder)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Fever >102F', 'Rigor/Chills', 'Flank pain', 'Obstruction on USG', 'Creatinine elevation'],
    mustNotMissFlags: ['Pyelonephritis', 'Perinephric abscess', 'Urosepsis'],
    specialNotes: ['Complicated UTI (diabetes, elderly, male, pregnancy) has stronger admission justification'],
    admissionJustificationTemplate: 'Patient presents with fever, dysuria, and flank pain. Urine R/M shows {pus_cells} pus cells. {urosepsis_flag}. Patient unable to tolerate oral antibiotics. Inpatient management with IV antibiotics and investigation of predisposing factor required.'
  },

  {
    code: 'G03.9',
    description: 'Meningitis, unspecified',
    commonName: 'Acute Meningitis',
    specialty: 'Neurology',
    subcategory: 'Infectious Diseases',
    typicalLOS: { min: 7, max: 21, average: 12 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'high',
    surgeryRequired: false,
    procedureCodes: ['03.31'],
    costEstimate: {
      generalWard: { min: 50000, max: 150000 },
      privateRoom: { min: 80000, max: 250000 },
      icu: { min: 150000, max: 500000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'NS-1021',
    pmjayPackageRate: 15000,
    daycareEligible: false,
    commonTPAQueries: [
      'CSF analysis report (biochemistry, cytology, culture)',
      'CT/MRI brain prior to LP',
      'Neurological status (GCS) trend',
      'Was IV dexamethasone given?'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Missing CSF report', 'GCS not documented'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'csf_analysis', name: 'CSF Analysis (Protein, Glucose, Cells, Gram Stain)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Gold standard diagnostic evidence absent' },
      { id: 'ct_brain_meningitis', name: 'CT Brain (Pre-Lumbar Puncture)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Safety clearane for LP not documented' },
      { id: 'cbc_meningitis', name: 'CBC with Differential', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'csf_pcr', name: 'CSF Multiplex PCR / BioFire', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['GCS <10', 'Seizures', 'Cranial nerve palsy', 'Papilledema', 'Hypoglycorrhachia'],
    mustNotMissFlags: ['Brain abscess', 'Tuberculous meningitis', 'Encephalitis', 'SAH'],
    specialNotes: ['Lumbar puncture (LP) is diagnostic — if not done, provide justification (e.g., raised ICP)'],
    admissionJustificationTemplate: 'Patient presents with fever, headache, and neck stiffness. GCS {gcs}. CSF analysis shows {csf_cells} cells, glucose {csf_glucose}. {meningeal_signs}. Emergency IV antibiotics, steroids, and ICU monitoring required to prevent neurological sequelae.'
  },

  {
    code: 'A41.9',
    description: 'Sepsis, unspecified organism',
    commonName: 'Sepsis / Septicemia',
    specialty: 'General Medicine',
    subcategory: 'Systemic Infection',
    typicalLOS: { min: 5, max: 15, average: 10 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'high',
    surgeryRequired: false,
    procedureCodes: ['99.18'],
    costEstimate: {
      generalWard: { min: 60000, max: 150000 },
      privateRoom: { min: 100000, max: 300000 },
      icu: { min: 180000, max: 600000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1025',
    pmjayPackageRate: 18000,
    daycareEligible: false,
    commonTPAQueries: [
      'Submit SOFA/qSOFA score',
      'Serum lactate levels mandatory',
      'Primary source of infection evidence',
      'Vasopressor requirement and duration'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Missing lactate report', 'SOFA score not documented'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'serum_lactate', name: 'Serum Lactate Level', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Tissue hypoperfusion severity not documented' },
      { id: 'blood_culture_sepsis', name: 'Blood Cultures (two sets preferred)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Pathogen search not documented' },
      { id: 'sofa_score', name: 'SOFA Score Documentation', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Objective organ dysfunction not quantified' }
    ],
    recommendedDocuments: [
      { id: 'procal_sepsis', name: 'Procalcitonin', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Lactate >2.0', 'MAP <65', 'Bilirubin >2.0', 'Creatinine >2.0', 'Platelet <100000', 'PaO2/FiO2 <300'],
    mustNotMissFlags: ['Source of sepsis (Abscess, Perforation)', 'Anaphylactic shock', 'Endocrine crisis'],
    specialNotes: ['Septic Shock is code red — document vasopressor doses and MAP hourly'],
    admissionJustificationTemplate: 'Patient presents with SIRS criteria, altered mental status, and hypotension. qSOFA score {qsofa}. Serum lactate {lactate}. Primary source identified as {source}. {septic_shock_flag}. Emergency fluid resuscitation, IV broad-spectrum antibiotics, and ICU management required.'
  },

  {
    code: 'D64.9',
    description: 'Anemia, unspecified',
    commonName: 'Severe Anemia / Blood Transfusion Required',
    specialty: 'General Medicine',
    subcategory: 'Hematology',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: ['99.04'],
    costEstimate: {
      generalWard: { min: 12000, max: 35000 },
      privateRoom: { min: 25000, max: 65000 },
      icu: { min: 50000, max: 120000 },
      daycare: { min: 8000, max: 20000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1121',
    pmjayPackageRate: 4500,
    daycareEligible: true,
    commonTPAQueries: [
      'Submit full blood count and Hb levels',
      'Indication for blood transfusion documentation',
      'Consent for transfusion',
      'Search for cause of anemia (Iron/B12/Bleed)'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Hb >7 without clinical compromise (OPD manageable)', 'Missing cause workup'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'cbc_hb', name: 'CBC with Hb and Indices', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Severity of anemia not documented' },
      { id: 'bt_consent', name: 'Blood Transfusion Consent', category: 'clinical', mandatory: true, whenRequired: 'if transfusion given', tpaQueryIfMissing: '' },
      { id: 'iron_profile', name: 'Iron Profile / B12 level', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Etiology workup not performed' }
    ],
    recommendedDocuments: [
      { id: 'stool_ob', name: 'Stool Occult Blood', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Hb <7 g/dL', 'Active bleeding', 'Heart failure from anemia', 'Pancytopenia'],
    mustNotMissFlags: ['Internal hemorrhage', 'Hemolysis', 'Malignancy'],
    specialNotes: ['Hb <7 is standard threshold for transfusion — document clinical compromise (breathlessness, pallor)'],
    admissionJustificationTemplate: 'Patient presents with severe pallor and breathlessness. Hb {hb} g/dL. Indices show {indices}. {active_bleed_flag}. Indication for Packed Red Cell Transfusion met. Inpatient monitoring of transfusion and investigation for primary cause required.'
  },

  {
    code: 'N18.9',
    description: 'Chronic kidney disease, unspecified',
    commonName: 'Chronic Kidney Disease (CKD)',
    specialty: 'General Medicine',
    subcategory: 'Nephrology',
    typicalLOS: { min: 3, max: 7, average: 4 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: ['39.95'],
    costEstimate: {
      generalWard: { min: 20000, max: 55000 },
      privateRoom: { min: 35000, max: 95000 },
      icu: { min: 70000, max: 180000 },
      daycare: { min: 5000, max: 12000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1061',
    pmjayPackageRate: 12000,
    daycareEligible: true,
    commonTPAQueries: [
      'Known CKD stage with USG evidence',
      'Is dialysis required? Submit creatinine/potassium',
      'Primary cause workup (Diabetes/Hypertension)',
      'Was temporary catheter inserted?'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Dialysis alone without acute illness often rejected as inpatient'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'rft_ckd', name: 'Renal Function Tests (Creatinine, Urea)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Renal failure severity not documented' },
      { id: 'usg_ckd', name: 'USG KUB (CMD changes evidence)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Chronic nature not radiologically corroborated' },
      { id: 'electrolytes_ckd', name: 'Serum Electrolytes (especially Potassium)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'dialysis_record', name: 'Dialysis Procedure Record', category: 'clinical', mandatory: false, whenRequired: 'if dialysis done', tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Creatinine >8', 'Potassium >6.5', 'Fluid overload / Pulm Edema', 'Uremic encephalopathy', 'Stage 5 GFR <15'],
    mustNotMissFlags: ['Acute on Chronic Renal Failure', 'Obstructive Uropathy', 'Secondary Hyperparathyroidism'],
    specialNotes: ['GFR calculation is preferred by TPAs for staging — document it'],
    admissionJustificationTemplate: 'Patient with known CKD Stage {stage} presents with {acute_decompensation}. Creatinine {creatinine}, Potassium {potassium}. GFR {gfr}. {dialysis_indication}. Inpatient management with electrolyte correction, fluid optimization, and emergency hemodialysis required.'
  },

  {
    code: 'K74.6',
    description: 'Other and unspecified cirrhosis of liver',
    commonName: 'Liver Cirrhosis / Chronic Liver Disease',
    specialty: 'Gastroenterology',
    subcategory: 'Hepatology',
    typicalLOS: { min: 4, max: 10, average: 7 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: ['42.33', '54.91'],
    costEstimate: {
      generalWard: { min: 25000, max: 65000 },
      privateRoom: { min: 45000, max: 120000 },
      icu: { min: 90000, max: 250000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1051',
    pmjayPackageRate: 11000,
    daycareEligible: false,
    commonTPAQueries: [
      'Child-Pugh score or MELD score',
      'Submit USG/CT evidence of cirrhosis',
      'Evidence of portal hypertension (Varices/Ascites)',
      'Evidence of hepatic encephalopathy'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Compensated cirrhosis without acute decompensation'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'lft_cirrhosis', name: 'Liver Function Tests (Albumin, Bilirubin, INR)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Liver synthetic function not assessed' },
      { id: 'usg_liver', name: 'USG Abdomen (Liver morphology, Portal vein)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Cirrhosis not radiologically documented' },
      { id: 'ascitic_tap', name: 'Ascitic Fluid Analysis (if tap done)', category: 'investigation', mandatory: false, whenRequired: 'if ascitic tap done', tpaQueryIfMissing: 'Spontaneous bacterial peritonitis not ruled out' }
    ],
    recommendedDocuments: [
      { id: 'endoscopy_liver', name: 'Upper GI Endoscopy (for varices screen)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['INR >1.7', 'Bilirubin >3.0', 'Albumin <2.5', 'Hematemesis', 'Encephalopathy Grade II-IV', 'SBP suspicion'],
    mustNotMissFlags: ['HCC (Hepatocellular Carcinoma)', 'Hepatorenal syndrome', 'Variceal bleed'],
    specialNotes: ['Document Child-Pugh Score (A/B/C) to justify admission'],
    admissionJustificationTemplate: 'Patient with known cirrhosis presents with {decompensation_type}. Child-Pugh Score {score} (Class {class}). Bilirubin {bil}, Albumin {alb}, INR {inr}. {ascites_flag}. Management of decompensated liver disease, including IV antibiotics for SBP / encephalopathy management required.'
  },

  {
    code: 'E03.9',
    description: 'Hypothyroidism, unspecified',
    commonName: 'Severe Hypothyroidism / Myxedema',
    specialty: 'General Medicine',
    subcategory: 'Endocrinology',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 8000, max: 20000 },
      privateRoom: { min: 15000, max: 40000 },
      icu: { min: 40000, max: 90000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1081',
    pmjayPackageRate: 3500,
    daycareEligible: false,
    commonTPAQueries: [
      'TSH and Free T4 levels mandatory',
      'Clinical symptoms (Altered sensorium/Hypothermia)',
      'Why was OPD dose escalation not feasible?'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Chronic hypothyroidism manageable on OPD basis'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'tft_results', name: 'Thyroid Function Tests (fT4, TSH)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Biochemical evidence of thyroid state absent' }
    ],
    recommendedDocuments: [
      { id: 'anti_tpo', name: 'Anti-TPO Antibodies', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['TSH >100', 'Free T4 undetectable', 'Altered sensorium', 'Bradycardia <50', 'Hypothermia', 'Myxedema coma'],
    mustNotMissFlags: ['Pituitary disease', 'Hashimoto encephalopathy', 'Adrenal insufficiency co-existence'],
    specialNotes: ['Myxedema Coma is extremely rare but high severity — document vitals carefully'],
    admissionJustificationTemplate: 'Patient presents with severe lethargy, bradycardia, and {symptoms}. TSH {tsh}, fT4 {ft4}. {severely_hypothyroid_flag}. Inpatient monitoring for thyroxine replacement and management of precipitating factor required.'
  },

  {
    code: 'A27.9',
    description: 'Leptospirosis, unspecified',
    commonName: 'Leptospirosis',
    specialty: 'General Medicine',
    subcategory: 'Tropical Infections',
    typicalLOS: { min: 4, max: 10, average: 6 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 20000, max: 50000 },
      privateRoom: { min: 35000, max: 80000 },
      icu: { min: 70000, max: 180000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1049',
    pmjayPackageRate: 8500,
    daycareEligible: false,
    commonTPAQueries: [
      'Leptospira IgM ELISA or MAT report',
      'Daily RFT trend (Creatinine/Urea)',
      'Clinical symptoms (Conjunctival suffusion/Muscle pain)',
      'Was IV penicillin or ceftriaxone given?'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Missing IgM confirmation'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'lepto_igm', name: 'Leptospira IgM ELISA', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Serological confirmation of leptospirosis not provided' },
      { id: 'rft_lepto', name: 'Renal Function Tests', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Renal impairment not documented' },
      { id: 'lft_lepto', name: 'Liver Function Tests', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Liver involvement not assessed' }
    ],
    recommendedDocuments: [
      { id: 'mat_lepto', name: 'Microscopic Agglutination Test (MAT)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Creatinine >3.0', 'Bilirubin >5.0 (Weil\'s disease)', 'Pulmonary hemorrhage', 'Platelet <50000', 'Oliguria'],
    mustNotMissFlags: ['Dengue', 'Hantavirus', 'Hepatitis E', 'Sepsis'],
    specialNotes: ['Weil\'s syndrome (Triad of Jaundice, Renal Failure, Hemorrhage) is a high-severity indicator'],
    admissionJustificationTemplate: 'Patient presents with high-grade fever, muscle pain, and conjunctival suffusion. Leptospira IgM is {igm_status}. {weils_flag}. Creatinine {creatinine}, Bilirubin {bilirubin}. Inpatient management with IV antibiotics and monitoring for renal/pulmonary complications required.'
  },

  {
    code: 'A75.3',
    description: 'Typhus fever due to Rickettsia tsutsugamushi',
    commonName: 'Scrub Typhus',
    specialty: 'General Medicine',
    subcategory: 'Tropical Infections',
    typicalLOS: { min: 4, max: 8, average: 5 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 18000, max: 45000 },
      privateRoom: { min: 30000, max: 75000 },
      icu: { min: 65000, max: 150000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1050',
    pmjayPackageRate: 7500,
    daycareEligible: false,
    commonTPAQueries: [
      'Scrub Typhus IgM report',
      'Presence of Eschar',
      'Evidence of multi-organ involvement',
      'Was IV Doxycycline or Azithromycin started?'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Missing IgM confirmation'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'scrub_igm', name: 'Scrub Typhus IgM ELISA', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Serological evidence of scrub typhus not provided' },
      { id: 'cbc_scrub', name: 'CBC with Platelet Count', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'lft_scrub', name: 'Liver Function Tests', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'eschar_photo', name: 'Clinical Photo of Eschar (if present)', category: 'clinical', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['ARDS / Pulse oximetry <90%', 'Encephalopathy', 'Creatinine >2.0', 'SGOT/SGPT >500', 'Platelet <50000'],
    mustNotMissFlags: ['Dengue', 'Leptospirosis', 'Malaria'],
    specialNotes: ['Detection of Eschar is nearly diagnostic — document its location (axilla, groin)'],
    admissionJustificationTemplate: 'Patient presents with high-grade fever, headache, and {eschar_present}. Scrub Typhus IgM is {igm_status}. {organ_involvement}. {hypoxia_flag}. IV antibiotics and inpatient monitoring for multi-organ dysfunction syndrome required.'
  },

  {
    code: 'B15.9',
    description: 'Hepatitis A without hepatic coma',
    commonName: 'Acute Viral Hepatitis A',
    specialty: 'General Medicine',
    subcategory: 'Hepatology',
    typicalLOS: { min: 3, max: 7, average: 4 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 12000, max: 30000 },
      privateRoom: { min: 20000, max: 50000 },
      icu: { min: 50000, max: 120000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1053',
    pmjayPackageRate: 5000,
    daycareEligible: false,
    commonTPAQueries: [
      'Hepatitis A IgM (HAV IgM) report',
      'Bilirubin level and trend',
      'Evidence of coagulopathy (INR)',
      'Able to tolerate oral feeds?'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Mild hepatitis manageable on OPD basis'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'hav_igm', name: 'HAV IgM ELISA', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Etiological confirmation not provided' },
      { id: 'lft_hav', name: 'LFT with Bilirubin fractions', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Severity of hepatitis not documented' },
      { id: 'inr_hav', name: 'PT/INR', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Coagulopathy not assessed' }
    ],
    recommendedDocuments: [
      { id: 'usg_hav', name: 'USG Abdomen (hepatomegaly)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['INR >1.5', 'Bilirubin >10', 'Vomiting / Unable to eat', 'Altered sensorium'],
    mustNotMissFlags: ['Fulminant hepatic failure', 'Hepatitis E co-infection', 'Drug-induced Liver Injury'],
    specialNotes: ['Inability to tolerate oral feeds is the primary justification for admission in mild cases'],
    admissionJustificationTemplate: 'Patient presents with jaundice, vomiting, and extreme weakness. HAV IgM is {igm_status}. Bilirubin {bil}, INR {inr}. {vomiting_status}. Inpatient management with IV fluids, supportive care, and monitoring for hepatic failure required.'
  },

  {
    code: 'K27.9',
    description: 'Peptic ulcer, site unspecified, unspecified as acute or chronic, without hemorrhage or perforation',
    commonName: 'Peptic Ulcer Disease (PUD)',
    specialty: 'Gastroenterology',
    subcategory: 'Upper GI',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: ['44.13'],
    costEstimate: {
      generalWard: { min: 15000, max: 35000 },
      privateRoom: { min: 25000, max: 60000 },
      icu: { min: 50000, max: 120000 },
      daycare: { min: 8000, max: 15000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'GS-1011',
    pmjayPackageRate: 6000,
    daycareEligible: true,
    commonTPAQueries: [
      'Upper GI Endoscopy report',
      'Evidence of H. pylori infection',
      'Was IV PPI required?'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['OPD manageable unless bleed/perforation'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'ugie_report', name: 'Upper GI Endoscopy (UGIE) Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Visual confirmation of ulcer not provided' },
      { id: 'h_pylori', name: 'H. pylori Test (RUT / Stal Ag)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Etiology investigation not documented' }
    ],
    recommendedDocuments: [
      { id: 'cbc_pud', name: 'CBC (to rule out occult bleed)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Severe pain unresponsive to OPD meds', 'Recent hematemesis', 'Unable to eat', 'Large ulcer >2cm'],
    mustNotMissFlags: ['Gastric malignancy', 'Perforated Viscus', 'Myocardial Infarction'],
    specialNotes: ['Document failed response to oral PPIs to justify admission for IV therapy'],
    admissionJustificationTemplate: 'Patient presents with severe epigastric pain and {vomiting}. UGIE confirms {ulcer_site} ulcer, Forrest Grade {grade}. {h_pylori_status}. Inpatient management with IV PPIs and monitoring for complications required.'
  },

  {
    code: 'N17.9',
    description: 'Acute kidney failure, unspecified',
    commonName: 'Acute Kidney Injury (AKI)',
    specialty: 'General Medicine',
    subcategory: 'Nephrology',
    typicalLOS: { min: 3, max: 10, average: 5 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: ['39.95'],
    costEstimate: {
      generalWard: { min: 18000, max: 45000 },
      privateRoom: { min: 30000, max: 80000 },
      icu: { min: 60000, max: 150000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1062',
    pmjayPackageRate: 10000,
    daycareEligible: false,
    commonTPAQueries: [
      'Creatinine trend (Baseline vs Admission)',
      'Precipitating factor (Dehydration/Drugs/Infection)',
      'Daily urine output chart',
      'Is dialysis required?'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Missing baseline creatinine comparison'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'rft_aki', name: 'Serial Renal Function Tests', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Creatinine trend not documented' },
      { id: 'io_aki', name: 'Hourly / Daily Intake-Output Chart', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Oliguria not documented' },
      { id: 'usg_aki', name: 'USG KUB (to rule out obstruction)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Post-renal cause not excluded' }
    ],
    recommendedDocuments: [
      { id: 'unine_rm_aki', name: 'Urine R/M with Casts', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Creatinine increase >3x baseline', 'Potassium >6.0', 'Urine output <0.5ml/kg/h for 12h', 'Uremic symptoms', 'Pulm Edema'],
    mustNotMissFlags: ['Rapidly progressive GN', 'Obstructive Uropathy', 'Ethylene glycol poisoning'],
    specialNotes: ['Document the AKI stage (KDIGO 1/2/3) explicitly'],
    admissionJustificationTemplate: 'Patient presents with oliguria and {precipitating_event}. Creatinine risen from {baseline} to {admission}. KDIGO Stage {stage}. {potassium_flag}. USG shows {usg_findings}. Inpatient fluid management, metabolic correction, and monitoring for dialysis requirement required.'
  },

  {
    code: 'E87.1',
    description: 'Hypo-osmolality and hyponatremia',
    commonName: 'Hyponatremia / Low Sodium',
    specialty: 'General Medicine',
    subcategory: 'Metabolic',
    typicalLOS: { min: 2, max: 6, average: 4 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 12000, max: 35000 },
      privateRoom: { min: 22000, max: 60000 },
      icu: { min: 50000, max: 130000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1087',
    pmjayPackageRate: 4000,
    daycareEligible: false,
    commonTPAQueries: [
      'Sodium levels at admission and trend',
      'Symptoms (Confusion/Seizures/Vomiting)',
      'Etiology (SIADH/Dehydration/Drugs)',
      'Urine sodium and osmolality'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Mild asymptomatic hyponatremia (Na >130)'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'serial_na', name: 'Serial Serum Sodium Levels', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Correction rate and safety not documented' },
      { id: 'urine_na', name: 'Urine Sodium and Osmolality', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Etiological workup not provided' }
    ],
    recommendedDocuments: [
      { id: 'thyroid_cortisol', name: 'TSH and morning Cortisol', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Sodium <120', 'Seizures', 'Altered Sensorium', 'Severe vomiting'],
    mustNotMissFlags: ['Adrenal insufficiency', 'SIADH from malignancy', 'Hypothyroidism'],
    specialNotes: ['Warning: Central Pontine Myelinolysis risk — document correction rate carefully (<8-10 mEq/24h)'],
    admissionJustificationTemplate: 'Patient presents with {symptoms}. Serum sodium {na} mEq/L. {seizure_flag}. Urine Na {u_na}. Inpatient management with controlled salt correction, etiology workup, and neurological monitoring required.'
  },

  {
    code: 'E05.9',
    description: 'Thyrotoxicosis, unspecified',
    commonName: 'Hyperthyroidism / Thyroid Storm',
    specialty: 'General Medicine',
    subcategory: 'Endocrinology',
    typicalLOS: { min: 2, max: 7, average: 4 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 15000, max: 40000 },
      privateRoom: { min: 25000, max: 75000 },
      icu: { min: 60000, max: 150000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1082',
    pmjayPackageRate: 4200,
    daycareEligible: false,
    commonTPAQueries: [
      'TSH and free T4 reports',
      'Tachycardia / Arrhythmia (ECG)',
      'Was thyroid storm score calculated?'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['OPD manageable hyperthyroidism'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'tft_hyper', name: 'Thyroid Function Tests (fT4, TSH)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'ecg_hyper', name: 'ECG (to check for AF/Tachycardia)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'thyroid_usg', name: 'USG Thyroid with Doppler', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Burch-Wartofsky score >45', 'Atrial fibrillation', 'High fever >103F', 'Congestive Heart Failure'],
    mustNotMissFlags: ['Amiodarone induced thyrotoxicosis', 'Graves disease', 'Toxic multinodular goiter'],
    specialNotes: ['Thyroid storm is a clinical emergency — use Burch-Wartofsky score to justify ICU'],
    admissionJustificationTemplate: 'Patient presents with severe palpitations, tremors, and {jaundice_fever}. TSH {tsh}, fT4 {ft4}. ECG shows {arrhythmia_status}. Burch-Wartofsky score {score}. Inpatient stabilization, rate control, and monitoring for thyroid storm required.'
  },

  {
    code: 'M06.9',
    description: 'Rheumatoid arthritis, unspecified',
    commonName: 'Rheumatoid Arthritis (Acute Flare)',
    specialty: 'General Medicine',
    subcategory: 'Rheumatology',
    typicalLOS: { min: 3, max: 7, average: 4 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 15000, max: 45000 },
      privateRoom: { min: 25000, max: 75000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 10000, max: 25000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1101',
    pmjayPackageRate: 11000,
    daycareEligible: true,
    commonTPAQueries: [
      'RA Factor and Anti-CCP reports',
      'ESR/CRP to document active inflammation',
      'Was IV steroid / biologic required?',
      'Joint involvement details'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Chronic stable RA (OPD manageable)'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'ra_anti_ccp', name: 'RA Factor + Anti-CCP', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Diagnostic confirmation of RA absent' },
      { id: 'crp_ra', name: 'CRP and ESR', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Disease activity not documented' }
    ],
    recommendedDocuments: [
      { id: 'xray_joints', name: 'X-Ray involved joints', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Severe polyarthritis with functional loss', 'Systemic involvement (Lung/Vasculitis)', 'Uncontrolled pain on oral meds'],
    mustNotMissFlags: ['Septic arthritis', 'Fibromyalgia', 'Gout'],
    specialNotes: ['Admission justified by "Acute Flare with inability to perform daily activities"'],
    admissionJustificationTemplate: 'Patient presents with acute flare of Rheumatoid Arthritis with {joint_count} joints involved. Anti-CCP {ccp}, CRP {crp}. Patient unable to mobilize/perform ADLs. Inpatient management with IV pulse therapy, pain management, and stabilization required.'
  },

  {
    code: 'M32.9',
    description: 'Systemic lupus erythematosus, unspecified',
    commonName: 'Systemic Lupus Erythematosus (SLE / Lupus)',
    specialty: 'General Medicine',
    subcategory: 'Rheumatology',
    typicalLOS: { min: 4, max: 12, average: 7 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 25000, max: 70000 },
      privateRoom: { min: 45000, max: 130000 },
      icu: { min: 90000, max: 250000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1102',
    pmjayPackageRate: 15000,
    daycareEligible: false,
    commonTPAQueries: [
      'ANA and Anti-dsDNA reports',
      'Evidence of organ involvement (Renal/Lung)',
      'Was IV pulse steroid required?'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Chronic stable SLE'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'ana_dsdna', name: 'ANA (IF method) and Anti-dsDNA', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Serological confirmation of SLE absent' },
      { id: 'complement_levels', name: 'C3 and C4 Levels', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Disease activity markers not provided' }
    ],
    recommendedDocuments: [
      { id: 'urine_protein', name: '24-hour Urine Protein / Spot PCR', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Lupus Nephritis', 'Cerebritis', 'Hemolytic Anemia', 'Pulmonary Hemorrhage'],
    mustNotMissFlags: ['Infection mimicking lupus flare', 'TMA', 'Drug induced lupus'],
    specialNotes: ['Lupus flare with organ involvement highly justifies ICU admission'],
    admissionJustificationTemplate: 'Patient presents with acute SLE flare involving {organs}. Anti-dsDNA {dsdna}, C3 {c3}, C4 {c4}. {renal_involvement_flag}. Inpatient management with IV pulse steroids, immunosuppression titration, and monitoring for organ failure required.'
  },

  {
    code: 'M35.0',
    description: 'Sicca syndrome [Sjogren]',
    commonName: 'Sjogren Syndrome',
    specialty: 'General Medicine',
    subcategory: 'Rheumatology',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 10000, max: 25000 },
      privateRoom: { min: 18000, max: 45000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 5000, max: 12000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1103',
    pmjayPackageRate: 8000,
    daycareEligible: true,
    commonTPAQueries: [
      'Anti-Ro/SSA and Anti-La/SSB reports',
      'Schirmer test result',
      'Evidence of extraglandular involvement'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['OPD manageable unless systemic involvement'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'ssa_ssb', name: 'Anti-Ro (SSA) and Anti-La (SSB)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'schirmer', name: 'Schirmer Test Results', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Vasculitis', 'Interstitial Lung Disease', 'Lymphoma secondary to Sjogrens'],
    mustNotMissFlags: ['Lymphoma', 'RA association', 'SLE association'],
    specialNotes: ['Most Sjogrens patients are OPD — admission only for severe systemic flare'],
    admissionJustificationTemplate: 'Patient presents with severe sicca symptoms and {extraglandular_symptoms}. SSA {ssa}, SSB {ssb}. Inpatient workup and management of systemic manifestations required.'
  },

  {
    code: 'M81.0',
    description: 'Age-related osteoporosis without current pathological fracture',
    commonName: 'Severe Osteoporosis',
    specialty: 'General Medicine',
    subcategory: 'Metabolic Bone',
    typicalLOS: { min: 1, max: 3, average: 2 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 8000, max: 20000 },
      privateRoom: { min: 15000, max: 35000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 10000, max: 25000 }
    },
    pmjayEligible: false,
    daycareEligible: true,
    commonTPAQueries: [
      'DEXA Scan report with T-score',
      'Was IV Zoledronic acid / Denosumab given?',
      'Previous fracture history'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Daycare condition claimed as inpatient'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'dexa_report', name: 'DEXA Scan Report (Spine & Hip)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'T-score evidence absent' }
    ],
    recommendedDocuments: [
      { id: 'vit_d_level', name: 'Serum 25-OH Vitamin D', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['T-score < -3.5', 'Multiple fragility fractures', 'Failure of oral bisphosphonates'],
    mustNotMissFlags: ['Multiple Myeloma', 'Hyperparathyroidism', 'Malabsorption'],
    specialNotes: ['IV Bisphosphonate administration is usually a Daycare procedure'],
    admissionJustificationTemplate: 'Patient with severe osteoporosis (T-score {tscore}) and {fracture_history}. Inpatient / Daycare admission for IV bisphosphonate therapy and metabolic workup required.'
  },

  {
    code: 'E53.8',
    description: 'Deficiency of other specified B group vitamins',
    commonName: 'Vitamin B12 Deficiency',
    specialty: 'General Medicine',
    subcategory: 'Nutritional',
    typicalLOS: { min: 1, max: 3, average: 2 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 5000, max: 12000 },
      privateRoom: { min: 10000, max: 25000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 3000, max: 8000 }
    },
    pmjayEligible: false,
    daycareEligible: true,
    commonTPAQueries: [
      'Serum B12 level',
      'Clinical symptoms (Neuropathy/Anemia)',
      'Why was oral therapy insufficient?'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['OPD manageable condition'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'b12_level', name: 'Serum Vitamin B12 level', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'mma_level', name: 'Methylmalonic Acid (MMA)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Subacute Combined Degeneration of Cord', 'Megaloblastic Anemia (Hb <7)', 'Pancytopenia'],
    mustNotMissFlags: ['Pernicious Anemia', 'Gastric Atrophy', 'Celiac Disease'],
    specialNotes: ['Neurological involvement strongly justifies IV / IM replacement under monitoring'],
    admissionJustificationTemplate: 'Patient presents with {neuropathy_symptoms} and severe B12 deficiency (Level {level} pg/mL). Inpatient monitoring for intensive replacement and neurological assessment required.'
  },

  {
    code: 'E55.9',
    description: 'Vitamin D deficiency, unspecified',
    commonName: 'Severe Vitamin D Deficiency',
    specialty: 'General Medicine',
    subcategory: 'Nutritional',
    typicalLOS: { min: 1, max: 2, average: 1 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 3000, max: 8000 },
      privateRoom: { min: 6000, max: 15000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 2000, max: 5000 }
    },
    pmjayEligible: false,
    daycareEligible: true,
    commonTPAQueries: [
      'Serum 25-OH Vitamin D level',
      'Associated Calcium imbalance'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Pure OPD condition'],
    preAuthRequired: false,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'vitd_level', name: 'Serum Vitamin D level', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'serum_calcium', name: 'Serum Calcium and Phosphorus', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Hypocalcemic tetany', 'Osteomalacia', 'Levels <5 ng/mL'],
    mustNotMissFlags: ['Hyperparathyroidism', 'Malabsorption', 'Renal disease'],
    specialNotes: ['Admission only if severe bone pain or tetany present'],
    admissionJustificationTemplate: 'Patient presents with {symptoms} associated with severe Vitamin D deficiency (Level {level} ng/mL). Inpatient stabilization and high-dose replacement required.'
  },

  {
    code: 'E87.6',
    description: 'Hypokalemia',
    commonName: 'Hypokalemia / Low Potassium',
    specialty: 'General Medicine',
    subcategory: 'Electrolyte Imbalance',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 12000, max: 35000 },
      privateRoom: { min: 22000, max: 55000 },
      icu: { min: 50000, max: 120000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1088',
    pmjayPackageRate: 3800,
    daycareEligible: false,
    commonTPAQueries: [
      'Potassium levels at admission and trend',
      'ECG changes (U-waves/T-wave flattening)',
      'Etiology (Diuretics/Vomiting)'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Mild asymptomatic hypokalemia (K >3.0)'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'serial_k', name: 'Serial Serum Potassium Levels', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'ecg_k', name: 'ECG showing hypokalemic changes', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'urine_k', name: 'Urine Potassium and Chloride', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Potassium <2.5', 'Muscle paralysis', 'Arrhythmias', 'T-wave inversion / U-waves'],
    mustNotMissFlags: ['Periodic Paralysis', 'Hyperaldosteronism', 'Hypomagnesemia association'],
    specialNotes: ['Severe hypokalemia requires central line IV correction — justifies ICU'],
    admissionJustificationTemplate: 'Patient presents with muscle weakness and palpitations. Serum potassium {k} mEq/L. ECG shows {ecg_changes}. {paralysis_flag}. Inpatient management with controlled IV potassium replacement and cardiac monitoring required.'
  },

  {
    code: 'E87.5',
    description: 'Hyperkalemia',
    commonName: 'Hyperkalemia / High Potassium',
    specialty: 'General Medicine',
    subcategory: 'Electrolyte Imbalance',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'high',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 15000, max: 40000 },
      privateRoom: { min: 25000, max: 65000 },
      icu: { min: 60000, max: 150000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1090',
    pmjayPackageRate: 4000,
    daycareEligible: false,
    commonTPAQueries: [
      'Potassium level and ECG changes',
      'Renal status (CKD/AKI)',
      'Was dialysis required for correction?'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Pseudohyperkalemia (hemolyzed sample)'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'serial_k_high', name: 'Serial Potassium Levels', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'ecg_k_high', name: 'ECG showing peaked T-waves', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'rft_high_k', name: 'Renal Function Tests', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Potassium >6.5', 'Peaked T-waves / Wide QRS', 'Brdycardia', 'Muscle weakness'],
    mustNotMissFlags: ['Crush injury (Rhabdomyolysis)', 'Tumor Lysis Syndrome', 'Adrenal Crisis'],
    specialNotes: ['Hyperkalemia is or "Potassium >6.5" is a medical emergency requiring ICU'],
    admissionJustificationTemplate: 'Patient presents with ECG abnormalities and elevated potassium (Level {k} mEq/L). {renal_status}. {ecg_finding}. Emergency insulin-dextrose, calcium gluconate, and monitoring required in intensive setting.'
  },

  {
    code: 'T78.2',
    description: 'Anaphylactic shock, unspecified',
    commonName: 'Anaphylaxis',
    specialty: 'General Medicine',
    subcategory: 'Allergy',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'high',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 20000, max: 50000 },
      privateRoom: { min: 35000, max: 90000 },
      icu: { min: 80000, max: 200000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1111',
    pmjayPackageRate: 9000,
    daycareEligible: false,
    commonTPAQueries: [
      'Evidence of hypotension / airway compromise',
      'Was Adrenaline given?',
      'Known allergen documentation'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Simple urticaria claimed as anaphylaxis'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'vitals_record', name: 'Emergency Room Vitals Chart (BP, HR, RR)', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Hemodynamic instability not documented' },
      { id: 'adrenaline_log', name: 'Medication Log showing Adrenaline/Epi use', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Severity index (Adrenaline requirement) absent' }
    ],
    recommendedDocuments: [
      { id: 'tryptase', name: 'Serum Tryptase Level', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Hypotension (SBP <90)', 'Stridor / Laryngeal edema', 'Bronchospasm', 'Syncope', 'Biphasic reaction risk'],
    mustNotMissFlags: ['Vasovagal syncope', 'Panic attack', 'Asthmatic attack'],
    specialNotes: ['Always document time of allergen exposure and onset of symptoms'],
    admissionJustificationTemplate: 'Patient presents with acute onset {hypotension_stridor} following {allergen} exposure. {adrenaline_given}. {biphasic_risk}. Inpatient ICU monitoring for late-phase reaction and stabilization required.'
  },

  {
    code: 'Z88.9',
    description: 'Personal history of allergy to unspecified drugs, medicaments and biological substances',
    commonName: 'Drug Allergy / Severe Reaction',
    specialty: 'General Medicine',
    subcategory: 'Allergy',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 15000, max: 40000 },
      privateRoom: { min: 25000, max: 70000 },
      icu: { min: 60000, max: 150000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1112',
    pmjayPackageRate: 7500,
    daycareEligible: false,
    commonTPAQueries: [
      'Suspected drug name',
      'Type of reaction (Rash/Angioedema/Stevens-Johnson)',
      'Was IV steroid / antihistamine required?'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Mild drug rash manageable on OPD basis'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'rash_photo', name: 'Skin Lesion Documentation', category: 'clinical', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'biopsy_rash', name: 'Skin Biopsy (if SJS/TEN suspected)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Mucosal involvement', 'Skin peeling (Nikolsky sign)', 'Fever + Diffuse rash', 'Angioedema'],
    mustNotMissFlags: ['SJS / TEN (Life threatening)', 'DRESS syndrome', 'Erythema Multiforme'],
    specialNotes: ['SJS/TEN (Stevens-Johnson Syndrome) are high-rejection-risk if severity not vividly described'],
    admissionJustificationTemplate: 'Patient presents with severe {reaction_type} following {drug_name}. {mucosal_involvement_flag}. {target_lesions}. Inpatient management with IV steroids and monitoring for systemic toxicity/SJS required.'
  },

  // ══════════════════════════════════════════════════════════════
  // SPECIALTY 2: CARDIOLOGY
  // ══════════════════════════════════════════════════════════════

  {
    code: 'I21.9',
    description: 'Acute myocardial infarction, unspecified',
    commonName: 'Heart Attack / Acute MI',
    specialty: 'Cardiology',
    subcategory: 'Acute Coronary Syndromes',
    typicalLOS: { min: 4, max: 10, average: 6 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'high',
    surgeryRequired: false,
    procedureCodes: ['00.66', '36.01', '36.02'],
    costEstimate: {
      generalWard: { min: 80000, max: 200000 },
      privateRoom: { min: 150000, max: 400000 },
      icu: { min: 200000, max: 600000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1001',
    pmjayPackageRate: 38000,
    daycareEligible: false,
    commonTPAQueries: [
      'Submit serial ECG reports (admission, 6h, 24h)',
      'Troponin I or T levels with timestamps',
      'Echocardiography report',
      'Coronary angiography report if done',
      'Thrombolysis consent and drug details if given'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Missing serial ECGs', 'Troponin not documented with timestamps', 'Echo not done'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'ecg_serial', name: 'Serial ECGs — Admission, 6h, 24h, Discharge', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Dynamic ECG changes not documented' },
      { id: 'troponin_serial', name: 'Serial Troponin I or T with timestamps', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Biochemical evidence of myocardial injury absent' },
      { id: 'echo', name: 'Echocardiography Report (2D Echo)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Ventricular function not assessed — standard of care' },
      { id: 'cath_report', name: 'Coronary Angiography Report', category: 'operative', mandatory: false, whenRequired: 'if CAG done', tpaQueryIfMissing: 'Coronary anatomy not documented' },
      { id: 'pci_report', name: 'PCI Procedure Note + Stent Details', category: 'operative', mandatory: false, whenRequired: 'if PCI done', tpaQueryIfMissing: 'Intervention details not documented' },
      { id: 'stent_sticker', name: 'Stent Sticker / Invoice (original)', category: 'implant', mandatory: false, whenRequired: 'if stent implanted', tpaQueryIfMissing: 'Implant cost not verifiable without original sticker' }
    ],
    recommendedDocuments: [
      { id: 'lipid_profile', name: 'Lipid Profile', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' },
      { id: 'ckmb', name: 'CK-MB (if troponin unavailable)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['STEMI on ECG', 'Troponin >99th percentile', 'EF <40%', 'Cardiogenic shock', 'Complete heart block', 'VT/VF'],
    mustNotMissFlags: ['Aortic dissection', 'Pulmonary embolism', 'Pericarditis', 'GERD mimicking cardiac pain'],
    specialNotes: ['Stent sticker is absolutely mandatory when PCI done — original physical sticker must be attached to claim', 'Thrombolysis: document consent, drug used, dose, time of administration, TIMI flow post-lysis'],
    admissionJustificationTemplate: 'Patient presents with acute onset chest pain with radiation to {radiation_site} for {duration}. ECG shows {ecg_findings}. Troponin {troponin_value} at {troponin_time} — {times} upper limit of normal. Clinical presentation consistent with acute {stemi_nstemi}. Emergency coronary intervention / medical management required in CCU setting.'
  },

  {
    code: 'I50.9',
    description: 'Heart failure, unspecified',
    commonName: 'Congestive Heart Failure / Acute Decompensated Heart Failure',
    specialty: 'Cardiology',
    subcategory: 'Heart Failure',
    typicalLOS: { min: 5, max: 12, average: 7 },
    admissionType: 'emergency',
    wardType: 'any',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: ['99.18', '93.90'],
    costEstimate: {
      generalWard: { min: 35000, max: 90000 },
      privateRoom: { min: 65000, max: 170000 },
      icu: { min: 100000, max: 280000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1009',
    pmjayPackageRate: 15000,
    daycareEligible: false,
    commonTPAQueries: [
      'Was this acute decompensation or chronic stable heart failure?',
      'Provide precipitating factor documentation',
      'Submit echocardiography with EF measurement',
      'BNP or NT-proBNP level',
      'Daily weight chart and diuresis response'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Chronic stable HF — TPA questions if acute decompensation', 'Missing echo/EF documentation'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'echo_hf', name: 'Echocardiography with EF Measurement', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Ventricular function and HF classification not documented' },
      { id: 'bnp', name: 'BNP or NT-proBNP', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Biochemical severity of heart failure not established' },
      { id: 'cxr_hf', name: 'Chest X-Ray (pulmonary edema evidence)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Radiological evidence of congestion not provided' },
      { id: 'daily_weight', name: 'Daily Weight Chart and Fluid Balance', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Response to diuresis not documented' }
    ],
    recommendedDocuments: [
      { id: 'ecg_hf', name: 'ECG (arrhythmia, ischemia)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' },
      { id: 'rft_hf', name: 'Renal Function Tests', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['EF <30%', 'SpO2 <90%', 'BNP >500', 'Bilateral crepitations', 'Pulmonary edema on CXR', 'JVP elevated'],
    mustNotMissFlags: ['Acute MI as precipitant', 'Pulmonary embolism', 'Cardiac tamponade', 'Severe valve disease'],
    specialNotes: ['Document precipitating cause: new MI, arrhythmia, infection, medication non-compliance, dietary excess', 'Daily weight is TPA-required evidence of active diuresis treatment'],
    admissionJustificationTemplate: 'Patient with known heart failure (EF {ef}%) presents with acute decompensation precipitated by {precipitant}. BNP {bnp} pg/mL. SpO2 {spo2}% with bilateral crepitations and {edema_grade} pedal edema. Acute pulmonary edema on CXR. IV diuresis and hemodynamic monitoring required in inpatient setting.'
  },

  {
    code: 'I48.91',
    description: 'Unspecified atrial fibrillation',
    commonName: 'Atrial Fibrillation (AF)',
    specialty: 'Cardiology',
    subcategory: 'Arrhythmias',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: ['99.61', '99.62'],
    costEstimate: {
      generalWard: { min: 20000, max: 60000 },
      privateRoom: { min: 35000, max: 110000 },
      icu: { min: 55000, max: 130000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1015',
    pmjayPackageRate: 12000,
    daycareEligible: false,
    commonTPAQueries: [
      'Was this new-onset or paroxysmal AF?',
      'Submit 12-lead ECG confirming AF',
      'Thyroid function test (TSH)',
      'Echo to assess structural heart disease',
      'If cardioversion done, submit consent and defibrillator record'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Chronic AF managed on OPD basis', 'Missing ECG confirmation', 'No documented symptom burden'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'ecg_af', name: '12-Lead ECG Confirming Atrial Fibrillation', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Arrhythmia not electrocardiographically confirmed' },
      { id: 'echo_af', name: 'Echocardiography (LA size, valve assessment)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Structural etiology not investigated' },
      { id: 'tft', name: 'Thyroid Function Tests (TSH)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Thyroid etiology not excluded' }
    ],
    recommendedDocuments: [
      { id: 'holter', name: 'Holter Monitor Report (if paroxysmal)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Rapid ventricular rate >150', 'Hemodynamic compromise', 'New AF <48h duration', 'Pre-excitation on ECG'],
    mustNotMissFlags: ['Wolff-Parkinson-White syndrome', 'AF with acute MI', 'Thyrotoxicosis'],
    specialNotes: ['New onset AF within 48h has cardioversion option — this justifies emergency admission strongly', 'Anticoagulation initiation also justifies admission for monitoring'],
    admissionJustificationTemplate: 'Patient presents with {new_chronic} atrial fibrillation with ventricular rate {hr}/min. {symptoms}. 12-lead ECG confirms irregularly irregular rhythm consistent with AF. {cardioversion_indication}. Inpatient rate control, anticoagulation initiation, and monitoring for thromboembolic risk required.'
  },

  {
    code: 'I20.0',
    description: 'Unstable angina',
    commonName: 'Unstable Angina (UA)',
    specialty: 'Cardiology',
    subcategory: 'Acute Coronary Syndromes',
    typicalLOS: { min: 3, max: 7, average: 4 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: ['00.66'],
    costEstimate: {
      generalWard: { min: 40000, max: 100000 },
      privateRoom: { min: 70000, max: 180000 },
      icu: { min: 120000, max: 300000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1002',
    pmjayPackageRate: 18000,
    daycareEligible: false,
    commonTPAQueries: [
      'Submit serial ECGs and Troponin levels',
      'GRACE score or TIMI score',
      'Documentation of dynamic ST-T changes',
      'Coronary Angiogram report'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Stable angina claimed as unstable', 'Normal troponins and no ECG changes'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'ua_ecg', name: 'Serial ECGs showing dynamic changes', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'ua_trop', name: 'Serial Troponin I/T (negative results)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'grace_score', name: 'GRACE Score / TIMI Score', category: 'clinical', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Prolonged rest pain >20 min', 'ST depression >0.5mm', 'Dynamic T-wave inversion', 'Hypotension during pain'],
    mustNotMissFlags: ['NSTEMI', 'Aortic dissection', 'Esophageal rupture'],
    specialNotes: ['Unstable Angina is defined by typical chest pain with negative enzymes but dynamic ECG or high clinical risk'],
    admissionJustificationTemplate: 'Patient presents with crescendo angina / rest pain for {duration}. Serial ECGs show {ecg_changes}. Troponin {trop_level} (Negative). {high_risk_features}. Inpatient stabilization with antiplatelets, anticoagulants, and early invasive strategy (CAG) required.'
  },

  {
    code: 'I09.9',
    description: 'Rheumatic heart disease, unspecified',
    commonName: 'Rheumatic Heart Disease (RHD)',
    specialty: 'Cardiology',
    subcategory: 'Valvular Heart Disease',
    typicalLOS: { min: 4, max: 10, average: 6 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 25000, max: 65000 },
      privateRoom: { min: 45000, max: 120000 },
      icu: { min: 90000, max: 200000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1010',
    pmjayPackageRate: 12000,
    daycareEligible: false,
    commonTPAQueries: [
      'Echo report confirming valvular lesions',
      'History of Rheumatic Fever',
      'ASO Titre results'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Chronic stable RHD without failure symptoms'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'echo_rhd', name: 'Detailed 2D Echo Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'aso_titre', name: 'ASO Titre / CRP', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Severe MS/MR/AS/AR', 'Pulmonary Hypertension', 'Atrial Fibrillation', 'Heart Failure'],
    mustNotMissFlags: ['Infective Endocarditis', 'Atrial Myxoma', 'Anemia aggravating RHD'],
    specialNotes: ['Secondary prophylaxis (Penicillin) documentation is important for TPA'],
    admissionJustificationTemplate: 'Patient with known RHD presents with {symptoms}. 2D Echo shows {valve_findings} with {pht_status}. {af_status}. Inpatient management for cardiac optimization and {intervention_plan} required.'
  },

  {
    code: 'I05.0',
    description: 'Mitral stenosis',
    commonName: 'Mitral Stenosis (MS)',
    specialty: 'Cardiology',
    subcategory: 'Valvular Heart Disease',
    typicalLOS: { min: 3, max: 7, average: 5 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['35.12', '35.23'],
    costEstimate: {
      generalWard: { min: 80000, max: 180000 },
      privateRoom: { min: 140000, max: 300000 },
      icu: { min: 180000, max: 400000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1011',
    pmjayPackageRate: 100000,
    daycareEligible: false,
    commonTPAQueries: [
      'Mitral valve area (MVA) on Echo',
      'Wilkins score for BMV fitness',
      'Presence of LA clot (TEE report)',
      'Gradient across mitral valve'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Mild MS not requiring intervention'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'echo_ms', name: '2D Echo with MVA and Gradients', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'tee_clot', name: 'Transesophagel Echo (TEE) to rule out LA clot', category: 'investigation', mandatory: true, whenRequired: 'if BMV planned', tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'wilkins_score', name: 'Wilkins Score Documentation', category: 'clinical', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['MVA <1.0 cm2', 'Mean gradient >10 mmHg', 'Severe PASP >50', 'New AF'],
    mustNotMissFlags: ['Mitral Regurgitation co-existence', 'LA Myxoma', 'Thromboembolism'],
    specialNotes: ['BMV (Balloon Mitral Valvotomy) is a common intervention for severe MS'],
    admissionJustificationTemplate: 'Patient presents with NYHA Class {class} dyspnea. Echo shows Severe Mitral Stenosis with MVA {mva} cm2 and mean gradient {gradient} mmHg. Wilkins score {score}. {la_clot_status}. Inpatient admission for {intervention_type} required.'
  },

  {
    code: 'I35.0',
    description: 'Nonrheumatic aortic (valve) stenosis',
    commonName: 'Aortic Stenosis (AS)',
    specialty: 'Cardiology',
    subcategory: 'Valvular Heart Disease',
    typicalLOS: { min: 5, max: 12, average: 7 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: true,
    procedureCodes: ['35.21', '35.22'],
    costEstimate: {
      generalWard: { min: 150000, max: 350000 },
      privateRoom: { min: 250000, max: 550000 },
      icu: { min: 300000, max: 800000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1013',
    pmjayPackageRate: 150000,
    daycareEligible: false,
    commonTPAQueries: [
      'Aortic valve area (AVA) and Peak gradient',
      'Symptoms: Angina, Syncope, Dyspnea (Triad)',
      'LV function (EF%)',
      'Valve morphology (Bicuspid vs Senile)'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Asymptomatic moderate AS'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'echo_as', name: 'Echo with AVA, Vmax, and Mean Gradient', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'dobutamine_echo', name: 'Dobutamine Stress Echo (if low-flow AS)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['AVA <1.0 cm2 / Indexed <0.6', 'Vmax >4.0 m/s', 'Mean gradient >40 mmHg', 'EF <50%'],
    mustNotMissFlags: ['Bicuspid aortic valve with root dilation', 'Aortic Coarctation', 'Sub-valvular stenosis'],
    specialNotes: ['Symptomatic severe AS has high 2-year mortality — prioritize pre-auth'],
    admissionJustificationTemplate: 'Patient presents with classic triad of {triad_symptoms}. Echo shows Severe Aortic Stenosis with AVA {ava} cm2, Vmax {vmax} m/s, and Mean Gradient {gradient} mmHg. EF {ef}%. Inpatient admission for {avr_intervention} required.'
  },

  {
    code: 'I47.1',
    description: 'Supraventricular tachycardia',
    commonName: 'Supraventricular Tachycardia (SVT)',
    specialty: 'Cardiology',
    subcategory: 'Arrhythmias',
    typicalLOS: { min: 1, max: 3, average: 2 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: ['37.34'],
    costEstimate: {
      generalWard: { min: 15000, max: 40000 },
      privateRoom: { min: 25000, max: 70000 },
      icu: { min: 50000, max: 130000 },
      daycare: { min: 35000, max: 90000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1016',
    pmjayPackageRate: 8500,
    daycareEligible: true,
    commonTPAQueries: [
      'ECG showing narrow complex tachycardia',
      'Was Adenosine or DC shock required?',
      'EP study results if done'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Sinus tachycardia claimed as SVT'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'svt_ecg', name: 'ECG showing SVT rhythm', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'tachy_chart', name: 'Holter / Event Monitor report', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['HR >180', 'Hypotension / Syncope', 'Angina during SVT', 'Failure of vagal maneuvers'],
    mustNotMissFlags: ['Atrial Flutter', 'AVNRT', 'WPW Syndrome'],
    specialNotes: ['RF Ablation is the definitive treatment — usually daycare'],
    admissionJustificationTemplate: 'Patient presents with acute palpitations and pulse {hr}/min. ECG confirms {svt_type}. {adenosine_response}. {instability_flag}. Inpatient acute management / Daycare RF ablation required.'
  },

  {
    code: 'I44.2',
    description: 'Atrioventricular block, complete',
    commonName: 'Complete Heart Block (CHB) / Third Degree AV Block',
    specialty: 'Cardiology',
    subcategory: 'Arrhythmias',
    typicalLOS: { min: 3, max: 7, average: 5 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'high',
    surgeryRequired: true,
    procedureCodes: ['37.83'],
    costEstimate: {
      generalWard: { min: 100000, max: 250000 },
      privateRoom: { min: 180000, max: 450000 },
      icu: { min: 250000, max: 600000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1017',
    pmjayPackageRate: 60000,
    daycareEligible: false,
    commonTPAQueries: [
      'ECG showing AV dissociation',
      'Symptoms: Syncope (Stokes-Adams attacks)',
      'Was temporary pacemaker (TPM) inserted?',
      'Permanent pacemaker (PPI) indication and sticker'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Missing pacemaker sticker', 'Wait-and-watch in reversible block (e.g., drug induced)'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'chb_ecg', name: 'ECG showing Complete Heart Block', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'pacemaker_sticker', name: 'Pacemaker / Lead Stickers (Original)', category: 'implant', mandatory: true, whenRequired: 'if PPI done', tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'tpm_record', name: 'Temporary Pacing Procedure Note', category: 'operative', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Heart rate <30', 'Syncope', 'Wide QRS escape', 'Heart failure'],
    mustNotMissFlags: ['Acute MI causing CHB', 'Hyperkalemia', 'Lyme disease'],
    specialNotes: ['CHB is a life-threatening emergency — TPM should be done immediately if unstable'],
    admissionJustificationTemplate: 'Patient presents with syncope and bradycardia (HR {hr}/min). ECG confirms Complete Heart Block with AV dissociation. {tpm_inserted}. Emergency inpatient management and Permanent Pacemaker Implantation (PPI) required.'
  },

  {
    code: 'I33.0',
    description: 'Acute and subacute infective endocarditis',
    commonName: 'Infective Endocarditis (IE)',
    specialty: 'Cardiology',
    subcategory: 'Valvular / Infectious',
    typicalLOS: { min: 14, max: 42, average: 21 },
    admissionType: 'emergency',
    wardType: 'any',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 60000, max: 180000 },
      privateRoom: { min: 120000, max: 350000 },
      icu: { min: 250000, max: 700000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1018',
    pmjayPackageRate: 18000,
    daycareEligible: false,
    commonTPAQueries: [
      'Modified Duke Criteria documentation',
      'Echo evidence of vegetation',
      'Blood culture results (3 sets)',
      'Justification for long LOS (4-6 weeks antibiotics)'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Negative cultures AND no echo evidence'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'echo_veg', name: '2D / TEE Echo showing vegetations', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'blood_culture_ie', name: 'Multiple Blood Cultures (at least 3)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'crp_ie', name: 'Serial CRP / ESR trend', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['New valvular regurgitation', 'Embolic phenomena (Stroke/Splenic)', 'Heart failure', 'Abscess on Echo', 'Large vegetation >10mm'],
    mustNotMissFlags: ['Fungal endocarditis', 'Culture negative IE', 'Marantic endocarditis'],
    specialNotes: ['Inpatient stay is long due to mandatory IV antibiotic course (2-6 weeks)'],
    admissionJustificationTemplate: 'Patient presents with Prolonged fever, new murmur, and {embolic_signs}. Echo shows {veg_size} vegetation on {valve}. Blood cultures positive for {organism}. Duke criteria met. Inpatient long-term IV antibiotic therapy and monitoring for complications required.'
  },

  {
    code: 'I31.3',
    description: 'Pericardial effusion (noninflammatory)',
    commonName: 'Pericardial Effusion / Cardiac Tamponade',
    specialty: 'Cardiology',
    subcategory: 'Pericardial Disease',
    typicalLOS: { min: 3, max: 10, average: 5 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: ['37.0'],
    costEstimate: {
      generalWard: { min: 30000, max: 80000 },
      privateRoom: { min: 55000, max: 150000 },
      icu: { min: 100000, max: 300000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1019',
    pmjayPackageRate: 14000,
    daycareEligible: false,
    commonTPAQueries: [
      'Echo evidence of effusion size',
      'Signs of tamponade (RA/RV collapse)',
      'Pericardial fluid analysis report',
      'Cause workup (TB/Malignancy)'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Small effusion manageable as OPD'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'echo_effusion', name: '2D Echo sizing effusion (mm)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'fluid_analysis', name: 'Pericardial Fluid Analysis (if tapped)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Pulsus paradoxus', 'RA/RV diastolic collapse', 'LVPapillary motion', 'Beck\'s Triad (Hypotension, JVD, Muffled heart sounds)'],
    mustNotMissFlags: ['TB Pericarditis', 'Uremic effusion', 'Post-MI pericarditis'],
    specialNotes: ['Cardiac Tamponade is a surgical emergency requiring pericardiocentesis'],
    admissionJustificationTemplate: 'Patient presents with dyspnea, muffled heart sounds, and BP {bp}. Echo shows {effusion_size} mm global pericardial effusion with {tamponade_signs}. Emergency pericardiocentesis and inpatient monitoring required.'
  },

  {
    code: 'I27.20',
    description: 'Pulmonary arterial hypertension, unspecified',
    commonName: 'Pulmonary Hypertension (PAH)',
    specialty: 'Cardiology',
    subcategory: 'Pulmonary Circulation',
    typicalLOS: { min: 3, max: 7, average: 4 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 25000, max: 60000 },
      privateRoom: { min: 45000, max: 110000 },
      icu: { min: 80000, max: 200000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1020',
    pmjayPackageRate: 11000,
    daycareEligible: false,
    commonTPAQueries: [
      'Echo PASP value',
      'Right heart catheterization (RHC) data',
      'Primary vs Secondary cause evidence'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Chronic stable PAH'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'echo_pasp', name: 'Echo with PASP and RV function', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'rhc_data', name: 'Right Heart Catheterization Report', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['PASP >70 mmHg', 'RV failure / Dilated RA', 'Syncope', 'NYHA Class IV'],
    mustNotMissFlags: ['CTPE (Chronic Thromboembolic PH)', 'Congenital Heart Disease', 'Interstital Lung Disease'],
    specialNotes: ['Document WHO functional class to justify admission for optimization'],
    admissionJustificationTemplate: 'Patient presents with severe dyspnea and syncope. Echo shows PASP {pasp} mmHg with {rv_status}. Functional Class {class}. Inpatient workup for etiology and pulmonary vasodilator titration required.'
  },

  {
    code: 'I82.40',
    description: 'Acute embolism and thrombosis of unspecified deep veins of lower extremity',
    commonName: 'Deep Vein Thrombosis (DVT)',
    specialty: 'Cardiology',
    subcategory: 'Venous Disease',
    typicalLOS: { min: 3, max: 7, average: 4 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 20000, max: 50000 },
      privateRoom: { min: 35000, max: 90000 },
      icu: { min: 70000, max: 150000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1021',
    pmjayPackageRate: 9500,
    daycareEligible: false,
    commonTPAQueries: [
      'Venous Doppler report confirming thrombus',
      'Well\'s Score documentation',
      'Was IVC filter required?'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Superficial thrombophlebitis claimed as DVT'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'venous_doppler', name: 'Venous Color Doppler (Lower Limb)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'd_dimer', name: 'D-Dimer Level', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Proximal DVT (Iliac/Femoral)', 'Phlegmasia cerulea dolens', 'High risk of Pulmonary Embolism'],
    mustNotMissFlags: ['Pulmonary Embolism', 'Cellulitis mimicking DVT', 'Ruptured Baker\'s cyst'],
    specialNotes: ['Inpatient admission is primarily for stabilization on anticoagulation and monitoring for PE'],
    admissionJustificationTemplate: 'Patient presents with unilateral limb swelling and pain for {duration}. Venous Doppler confirms {prox_distal} DVT in {vein_name}. Well\'s score {score}. Inpatient anticoagulation, limb elevation, and monitoring for pulmonary embolism required.'
  },

  {
    code: 'I83.9',
    description: 'Varicose veins of lower extremities without ulcer or inflammation',
    commonName: 'Varicose Veins',
    specialty: 'Surgery',
    subcategory: 'Venous Disease',
    typicalLOS: { min: 1, max: 3, average: 2 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['38.59'],
    costEstimate: {
      generalWard: { min: 25000, max: 60000 },
      privateRoom: { min: 40000, max: 100000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 20000, max: 50000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'GS-1029',
    pmjayPackageRate: 15000,
    daycareEligible: true,
    commonTPAQueries: [
      'Venous Doppler report showing reflux',
      'CEAP classification documentation',
      'Was laser/RFA used? Sticker mandatory',
      'Functional disability assessment'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Cosmetic treatment claimed as functional surgery'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'doppler_vv', name: 'Venous Doppler with Reflux study', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'laser_sticker', name: 'Laser Fiber / RFA Sticker (Original)', category: 'implant', mandatory: false, whenRequired: 'if EVLT/RFA done', tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['CEAP Class C4-C6 (Skin changes/Ulcer)', 'Recurrent superficial thrombophlebitis', 'Severe aching pain affecting work'],
    mustNotMissFlags: ['Deep Vein Thrombosis', 'Arterial insufficiency', 'Lymphedema'],
    specialNotes: ['EVLT (Endovenous Laser Therapy) is the preferred modern procedure — usually daycare'],
    admissionJustificationTemplate: 'Patient presents with symptomatic varicose veins (CEAP Class {class}). Doppler confirms reflux in {vein}. Failed conservative management (compression). {skin_changes_flag}. Inpatient / Daycare surgical intervention with {procedure_name} required.'
  },

  {
    code: 'I42.0',
    description: 'Dilated cardiomyopathy',
    commonName: 'Dilated Cardiomyopathy (DCM)',
    specialty: 'Cardiology',
    subcategory: 'Cardiomyopathies',
    typicalLOS: { min: 4, max: 10, average: 6 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 35000, max: 90000 },
      privateRoom: { min: 60000, max: 170000 },
      icu: { min: 100000, max: 300000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1022',
    pmjayPackageRate: 12000,
    daycareEligible: false,
    commonTPAQueries: [
      'Echo reporting LV dilation and low EF%',
      'Is ischemic etiology ruled out (CAG)?',
      'BNP/NT-proBNP levels'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Stable DCM without acute failure'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'echo_dcm', name: 'Detailed Echo with LV volumes and EF', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'cag_dcm', name: 'Coronary Angiogram Report', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['EF <25%', 'Moderate to Severe MR', 'Frequent VT/PVCs', 'NYHA Class IV'],
    mustNotMissFlags: ['Ischemic cardiomyopathy', 'Peripartum cardiomyopathy', 'Alcoholic cardiomyopathy'],
    specialNotes: ['Document optimization of GDMT (Guideline Directed Medical Therapy)'],
    admissionJustificationTemplate: 'Patient with known DCM presents with {acute_failure_symptoms}. Echo shows LV dilation (LVEDD {lvedd} mm) and EF {ef}%. {arrhythmia_status}. Inpatient management with IV diuresis, GDMT optimization, and monitoring required.'
  },

  {
    code: 'I42.1',
    description: 'Obstructive hypertrophic cardiomyopathy',
    commonName: 'Hypertrophic Cardiomyopathy (HCM / HOCM)',
    specialty: 'Cardiology',
    subcategory: 'Cardiomyopathies',
    typicalLOS: { min: 4, max: 10, average: 6 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 40000, max: 100000 },
      privateRoom: { min: 70000, max: 180000 },
      icu: { min: 120000, max: 300000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1023',
    pmjayPackageRate: 13000,
    daycareEligible: false,
    commonTPAQueries: [
      'Echo with Septal wall thickness (mm)',
      'LVOT gradient measurement',
      'SAM (Systolic Anterior Motion) of mitral valve',
      'Sudden Cardiac Death (SCD) risk assessment'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Mild HCM without obstruction or symptoms'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'echo_hocm', name: 'Detailed Echo with septal thickness and LVOT gradient', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'mri_cardiac', name: 'Cardiac MRI report', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Septal thickness >30mm', 'LVOT gradient >50 mmHg', 'Syncope', 'Non-sustained VT'],
    mustNotMissFlags: ['Athlete\'s heart', 'Hypertensive hypertrophy', 'Amyloidosis'],
    specialNotes: ['High SCD risk justifies ICD implantation — requires separate pre-auth'],
    admissionJustificationTemplate: 'Patient presents with angina and syncope. Echo shows HOCM with septal thickness {thickness} mm and LVOT gradient {gradient} mmHg. {sam_present}. Inpatient stabilization, beta-blocker titration, and ICD risk assessment required.'
  },

  {
    code: 'I40.9',
    description: 'Acute myocarditis, unspecified',
    commonName: 'Acute Myocarditis',
    specialty: 'Cardiology',
    subcategory: 'Inflammatory Heart Disease',
    typicalLOS: { min: 5, max: 14, average: 8 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'high',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 50000, max: 120000 },
      privateRoom: { min: 80000, max: 220000 },
      icu: { min: 150000, max: 450000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1024',
    pmjayPackageRate: 15000,
    daycareEligible: false,
    commonTPAQueries: [
      'Troponin levels (often very high)',
      'Echo showing global hypokinesia',
      'Viral markers / Cause workup',
      'Cardiac MRI results'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Normal Troponins and Normal Echo'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'trop_myo', name: 'Serial Troponin I/T with timestamps', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'echo_myo', name: 'Echo showing global hypokinesia', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'cmri_myo', name: 'Cardiac MRI with LGE (Late Gadolinium Enhancement)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Fulminant failure / Shock', 'Ventricular arrhythmias', 'EF <35%', 'High degree AV block'],
    mustNotMissFlags: ['Acute Myocardial Infarction', 'Giant cell myocarditis', 'Thyroid crisis'],
    specialNotes: ['Fulminant myocarditis may require Mechanical Circulatory Support (ECMO/IABP)'],
    admissionJustificationTemplate: 'Patient presents with acute chest pain and dyspnea after viral prodrome. Troponin {trop} (Significant elevation). Echo shows global hypokinesia with EF {ef}%. {shock_status}. Emergency inpatient management for myocarditis and monitoring for heart failure/arrhythmia required.'
  },

  {
    code: 'I31.1',
    description: 'Chronic constrictive pericarditis',
    commonName: 'Constrictive Pericarditis',
    specialty: 'Cardiology',
    subcategory: 'Pericardial Disease',
    typicalLOS: { min: 7, max: 15, average: 10 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: true,
    procedureCodes: ['37.12'],
    costEstimate: {
      generalWard: { min: 100000, max: 250000 },
      privateRoom: { min: 180000, max: 400000 },
      icu: { min: 250000, max: 600000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1025',
    pmjayPackageRate: 80000,
    daycareEligible: false,
    commonTPAQueries: [
      'Echo with Respiratory variation (>25%)',
      'CT/MRI showing pericardial thickening',
      'Evidence of right heart failure',
      'Pathology for TB if suspected'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Chronic stable state without plan for pericardiectomy'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'echo_constriction', name: 'Echo with Doppler / Tissue Doppler features', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'ct_pericardium', name: 'CT Chest showing thickened / calcified pericardium', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'cath_data_constriction', name: 'Right & Left Heart Cath data (Square root sign)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['NYHA Class IV failure', 'Severe Ascites', 'Cardiac Cirrhosis', 'Respiratory variation in Mitral flow'],
    mustNotMissFlags: ['Restrictive Cardiomyopathy (main DD)', 'TB Chest', 'Post-radiation pericarditis'],
    specialNotes: ['Pericardiectomy is standard of care for symptomatic constriction'],
    admissionJustificationTemplate: 'Patient presents with progressive right heart failure and ascites. Echo/CT confirms chronic constrictive pericarditis with pericardial thickness {thickness} mm. {tubercular_suspicion}. Inpatient admission for Pericardiectomy and post-operative management required.'
  },

  {
    code: 'I71.4',
    description: 'Abdominal aortic aneurysm, without rupture',
    commonName: 'Abdominal Aortic Aneurysm (AAA)',
    specialty: 'Surgery',
    subcategory: 'Aortic Disease',
    typicalLOS: { min: 5, max: 10, average: 7 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: true,
    procedureCodes: ['38.44', '39.71'],
    costEstimate: {
      generalWard: { min: 150000, max: 400000 },
      privateRoom: { min: 250000, max: 600000 },
      icu: { min: 350000, max: 900000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1026',
    pmjayPackageRate: 150000,
    daycareEligible: false,
    commonTPAQueries: [
      'CT Angiogram with Aneurysm size (cm)',
      'Is size >5.5cm (Male) or >5.0cm (Female)?',
      'Rate of expansion (>0.5cm in 6 months)',
      'Stent-graft details if EVAR done'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Small aneurysm <5.0cm not requiring surgery'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'cta_aaa', name: 'CT Angiogram with multiplanar reconstructions', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'evar_sticker', name: 'EVAR Stent-Graft Stickers (Original)', category: 'implant', mandatory: false, whenRequired: 'if EVAR done', tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Size >5.5cm', 'Symptomatic AAA (Back pain)', 'Rapid expansion', 'Contained leak signs'],
    mustNotMissFlags: ['Ruptured AAA (Emergency)', 'Infected (Mycotic) aneurysm', 'Inflammatory AAA'],
    specialNotes: ['EVAR (Endovascular Aneurysm Repair) is high-cost due to expensive stent-grafts'],
    admissionJustificationTemplate: 'Patient with known AAA presents with {symptoms}. CT Angiogram shows aneurysm size {size} cm. {expansion_rate}. {leak_signs}. Inpatient admission for {repair_type} (Open/EVAR) and monitoring required.'
  },

  {
    code: 'I71.0',
    description: 'Dissection of aorta, unspecified',
    commonName: 'Aortic Dissection (Stanford Type A / B)',
    specialty: 'Surgery',
    subcategory: 'Aortic Disease',
    typicalLOS: { min: 7, max: 21, average: 12 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'high',
    surgeryRequired: true,
    procedureCodes: ['38.45', '39.73'],
    costEstimate: {
      generalWard: { min: 250000, max: 600000 },
      privateRoom: { min: 400000, max: 1000000 },
      icu: { min: 500000, max: 1500000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1027',
    pmjayPackageRate: 200000,
    daycareEligible: false,
    commonTPAQueries: [
      'CT Angiogram confirming dissection flap',
      'Stanford Classification (A or B)',
      'Involvement of major branches (Renal/Mesenteric)',
      'Organ ischemia signs'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Mistaken for MI without CTA confirmation'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'cta_dissection', name: 'CT Angiogram showing primary entry tear and flap', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'tee_dissection', name: 'TEE (if unstable for CTA)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Stanford Type A (Surgical Emergency)', 'Stanford Type B with organ malperfusion', 'Aortic Rupture / Hemopericardium', 'Uncontrolled HTN'],
    mustNotMissFlags: ['Acute Myocardial Infarction', 'Pulmonary Embolism', 'Stroke'],
    specialNotes: ['Stanford Type A requires immediate open cardiac surgery —Stanford Type B is often managed medically'],
    admissionJustificationTemplate: 'Patient presents with "tearing" chest/back pain and BP {bp}. CT Angiogram confirms Stanford Type {type} Aortic Dissection. {branch_involvement}. {malperfusion_signs}. Emergency inpatient ICU management and {surgical_plan} required.'
  },

  {
    code: 'I48.92',
    description: 'Unspecified atrial flutter',
    commonName: 'Atrial Flutter',
    specialty: 'Cardiology',
    subcategory: 'Arrhythmias',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: ['37.34'],
    costEstimate: {
      generalWard: { min: 20000, max: 50000 },
      privateRoom: { min: 35000, max: 90000 },
      icu: { min: 60000, max: 150000 },
      daycare: { min: 40000, max: 100000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1028',
    pmjayPackageRate: 10000,
    daycareEligible: true,
    commonTPAQueries: [
      'ECG showing "saw-tooth" waves',
      'Atrial rate vs Ventricular rate',
      'Was DC cardioversion done?',
      'Indication for RF ablation'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Chronic stable flutter'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'flutter_ecg', name: 'ECG showing Saw-tooth flutter waves', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'echo_flutter', name: 'Echo to rule out structural disease', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['1:1 Conduction / HR >250', 'Hypotension', 'Heart Failure', 'New onset <48h'],
    mustNotMissFlags: ['Atrial Fibrillation', 'SVT', 'Ventricular Tachycardia'],
    specialNotes: ['RF ablation of CTI (Cavo-Tricuspid Isthmus) is definitive cure'],
    admissionJustificationTemplate: 'Patient presents with tachycardia and palpitations. ECG confirms Atrial Flutter with {conduction_ratio} conduction and pulse {hr}/min. {instability_flag}. Inpatient rate/rhythm control and {plan_ablation} required.'
  },

  {
    code: 'I45.6',
    description: 'Pre-excitation syndrome',
    commonName: 'Wolff-Parkinson-White (WPW) Syndrome',
    specialty: 'Cardiology',
    subcategory: 'Arrhythmias',
    typicalLOS: { min: 1, max: 4, average: 2 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: ['37.34'],
    costEstimate: {
      generalWard: { min: 20000, max: 50000 },
      privateRoom: { min: 35000, max: 90000 },
      icu: { min: 60000, max: 150000 },
      daycare: { min: 50000, max: 120000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1029',
    pmjayPackageRate: 12000,
    daycareEligible: true,
    commonTPAQueries: [
      'ECG showing Delta wave and short PR interval',
      'History of SVT or syncope',
      'EP study and Ablation report'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Asymptomatic WPW pattern on ECG'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'delta_wave_ecg', name: 'ECG showing pre-excitation (Delta wave)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'ep_study_report', name: 'EP Study and Mapping Report', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['WPW with Atrial Fibrillation (Emergency)', 'Delta-wave HR >250', 'Syncope', 'Short R-R interval <250ms'],
    mustNotMissFlags: ['SVT', 'Ebstein Anomaly', 'HOCM association'],
    specialNotes: ['WPW with AF is a medical emergency — avoid AV nodal blockers (Verapamil/Digoxin)'],
    admissionJustificationTemplate: 'Patient presents with {symptoms}. ECG shows short PR interval and Delta waves consistent with WPW syndrome. {tachycardia_type}. Inpatient EP study and accessory pathway ablation required to prevent life-threatening arrhythmias.'
  },

  {
    code: 'I49.5',
    description: 'Sick sinus syndrome',
    commonName: 'Sick Sinus Syndrome (SSS)',
    specialty: 'Cardiology',
    subcategory: 'Arrhythmias',
    typicalLOS: { min: 3, max: 7, average: 5 },
    admissionType: 'both',
    wardType: 'icu',
    icuProbability: 'moderate',
    surgeryRequired: true,
    procedureCodes: ['37.83'],
    costEstimate: {
      generalWard: { min: 100000, max: 250000 },
      privateRoom: { min: 180000, max: 450000 },
      icu: { min: 250000, max: 600000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'CT-1030',
    pmjayPackageRate: 60000,
    daycareEligible: false,
    commonTPAQueries: [
      'Evidence of sinus pauses / brady-tachy syndrome',
      'Correlation of symptoms with heart rate',
      'Holter Monitor report',
      'Pacemaker indication'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Asymptomatic sinus bradycardia'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'holter_sss', name: '24-hour Holter Monitor showing pauses / chronotropic incompetence', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'treadmill_sss', name: 'Treadmill Test (to check chronotropic response)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Sinus pauses >3 seconds', 'Symptomatic bradycardia', 'Tachy-Brady syndrome', 'Syncope'],
    mustNotMissFlags: ['Drug-induced bradycardia', 'Hypothyroidism', 'Hyperkalemia'],
    specialNotes: ['Pacemaker (PPI) is the standard treatment for symptomatic SSS'],
    admissionJustificationTemplate: 'Patient presents with syncope and dizziness. Holter shows sinus pauses of {pause_duration} seconds and {tachy_brady_flag}. Diagnosis consistent with Sick Sinus Syndrome. Inpatient admission for PPI required.'
  },

  // ══════════════════════════════════════════════════════════════
  // SPECIALTY 3: GASTROENTEROLOGY
  // ══════════════════════════════════════════════════════════════

  {
    code: 'K80.20',
    description: 'Calculus of gallbladder without cholecystitis',
    commonName: 'Cholelithiasis / Gallstones',
    specialty: 'Surgery',
    subcategory: 'Hepatobiliary',
    typicalLOS: { min: 3, max: 6, average: 4 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['51.23', '51.22'],
    costEstimate: {
      generalWard: { min: 45000, max: 90000 },
      privateRoom: { min: 70000, max: 150000 },
      icu: { min: 0, max: 0 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'SG-1024',
    pmjayPackageRate: 22000,
    daycareEligible: false,
    commonTPAQueries: [
      'USG abdomen confirming gallstones mandatory',
      'Pre-operative fitness assessment',
      'Was acute cholecystitis or jaundice present? Submit LFT',
      'OT notes and laparoscopy/open surgery details',
      'If converted from lap to open — document reason'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Asymptomatic gallstones — TPA may question elective surgery'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'usg_gb', name: 'USG Abdomen — Gallstone Confirmation Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Radiological confirmation of cholelithiasis not provided' },
      { id: 'lft', name: 'Liver Function Tests', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Biliary obstruction not assessed' },
      { id: 'preop_fitness', name: 'Pre-Operative Fitness Certificate', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Surgical fitness not documented' },
      { id: 'ot_notes', name: 'Operation Theatre Notes', category: 'operative', mandatory: true, tpaQueryIfMissing: 'Surgical procedure details not provided' },
      { id: 'anaesthesia_notes', name: 'Anaesthesia Notes', category: 'operative', mandatory: true, tpaQueryIfMissing: 'Anaesthesia type and events not documented' }
    ],
    recommendedDocuments: [
      { id: 'mrcp', name: 'MRCP (if CBD stone suspected)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Acute cholecystitis', 'CBD dilation >8mm', 'Jaundice', 'Fever + RUQ pain + Jaundice (Charcots triad)'],
    mustNotMissFlags: ['Cholangitis', 'CBD stones', 'Gallbladder carcinoma', 'Hepatitis'],
    specialNotes: ['Symptomatic cholelithiasis (biliary colic) has clear surgical indication', 'Laparoscopic cholecystectomy is standard — open conversion must be documented with reason'],
    admissionJustificationTemplate: 'Patient with symptomatic cholelithiasis confirmed on USG abdomen showing {stone_details}. {symptoms}. Elective laparoscopic cholecystectomy indicated for {indication}. Pre-operative workup completed. Surgical intervention required to prevent complications of acute cholecystitis, pancreatitis, or CBD obstruction.'
  },

  {
    code: 'K85.9',
    description: 'Acute pancreatitis, unspecified',
    commonName: 'Acute Pancreatitis',
    specialty: 'Gastroenterology',
    subcategory: 'Pancreatic',
    typicalLOS: { min: 5, max: 21, average: 8 },
    admissionType: 'emergency',
    wardType: 'any',
    icuProbability: 'high',
    surgeryRequired: false,
    procedureCodes: ['52.09', '99.18'],
    costEstimate: {
      generalWard: { min: 40000, max: 120000 },
      privateRoom: { min: 70000, max: 220000 },
      icu: { min: 120000, max: 400000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'GS-1018',
    pmjayPackageRate: 18000,
    daycareEligible: false,
    commonTPAQueries: [
      'Serum amylase and lipase values mandatory',
      'CT abdomen / CECT for severity grading',
      'APACHE-II or Ranson score documentation',
      'Daily fluid balance — pancreatitis requires aggressive resuscitation',
      'Justify ICU admission with clinical parameters'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Mild pancreatitis — TPA may question ICU admission'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'amylase_lipase', name: 'Serum Amylase and Lipase (>3x upper limit)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Biochemical diagnosis not established' },
      { id: 'cect_abdomen', name: 'CT Abdomen with Contrast (CECT) — Severity Grade', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Severity of pancreatitis not radiologically graded — CT Severity Index required' },
      { id: 'fluid_balance', name: 'Daily Fluid Balance Chart', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Fluid resuscitation volume and response not documented' },
      { id: 'usg_pancreatitis', name: 'USG Abdomen (etiology — gallstones, CBD)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Etiology investigation not documented' }
    ],
    recommendedDocuments: [
      { id: 'ranson_apache', name: 'Ranson Score / APACHE-II Score Documentation', category: 'clinical', mandatory: false, tpaQueryIfMissing: 'Severity scoring not formally applied' }
    ],
    severityMarkers: ['Amylase >3x ULN', 'CECT grade D/E', 'Ranson score ≥3', 'Organ failure', 'Infected necrosis'],
    mustNotMissFlags: ['Mesenteric ischemia', 'Perforated peptic ulcer', 'Biliary obstruction'],
    specialNotes: ['CECT abdomen is both diagnostic and required by TPA for severity grading', 'Alcoholic pancreatitis — some TPAs may query alcohol history'],
    admissionJustificationTemplate: 'Patient presents with acute pancreatitis — serum amylase {amylase} U/L ({x}x upper limit of normal) with severe epigastric pain and vomiting. CECT abdomen confirms {severity} acute pancreatitis (CT Severity Index: {ctsi}). {organ_failure}. Aggressive IV fluid resuscitation, bowel rest, and close monitoring for complications (necrosis, pseudocyst, organ failure) required in inpatient setting.'
  },

  {
    code: 'K57.30',
    description: 'Diverticulosis of large intestine without perforation or abscess',
    commonName: 'Acute Diverticulitis',
    specialty: 'Surgery',
    subcategory: 'Colorectal',
    typicalLOS: { min: 4, max: 8, average: 5 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 25000, max: 65000 },
      privateRoom: { min: 45000, max: 110000 },
      icu: { min: 0, max: 0 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'GS-1033',
    pmjayPackageRate: 9800,
    daycareEligible: false,
    commonTPAQueries: [
      'CT abdomen confirming diverticulitis required',
      'Was abscess or perforation present?'
    ],
    highRejectionRisk: false,
    rejectionReasons: [],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'ct_diverticulitis', name: 'CT Abdomen (Hinchey grading)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Radiological confirmation required' },
      { id: 'cbc_diverticulitis', name: 'CBC with TLC', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Infection severity not hematologically documented' }
    ],
    recommendedDocuments: [],
    severityMarkers: ['Perforation on CT', 'Fecal peritonitis', 'TLC >18,000', 'Pericolic abscess'],
    mustNotMissFlags: ['Colorectal carcinoma', 'Ischemic colitis', 'Crohn\'s disease'],
    specialNotes: ['CT abdomen is mandatory for confirming diverticulitis — clinical diagnosis alone insufficient for TPA'],
    admissionJustificationTemplate: 'Patient presents with left iliac fossa pain, fever, and leukocytosis. CT abdomen confirms acute diverticulitis (Hinchey Grade {grade}) with {complications}. IV antibiotics and bowel rest required in inpatient setting.'
  },

  {
    code: 'I85.01',
    description: 'Esophageal varices with bleeding',
    commonName: 'Variceal Bleed (Hematemesis)',
    specialty: 'Gastroenterology',
    subcategory: 'Hepatology',
    typicalLOS: { min: 5, max: 12, average: 7 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'high',
    surgeryRequired: false,
    procedureCodes: ['42.33'],
    costEstimate: {
      generalWard: { min: 40000, max: 100000 },
      privateRoom: { min: 70000, max: 180000 },
      icu: { min: 120000, max: 350000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1052',
    pmjayPackageRate: 15000,
    daycareEligible: false,
    commonTPAQueries: [
      'Upper GI Endoscopy report showing variceal bleed',
      'Was EVL (Banding) done? Sticker mandatory',
      'Hb level at admission and trend',
      'Child-Pugh Score'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Missing endoscopy report'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'endoscopy_bleed', name: 'Emergency Endoscopy Report with intervention details', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'evl_sticker', name: 'Endoscopic Banding (EVL) Sticker (Original)', category: 'implant', mandatory: true, whenRequired: 'if EVL done', tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'lft_bleed', name: 'LFT and Coagulation profile', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Active spurting on endoscopy', 'Shock (BP <90)', 'Hb <7', 'Child-Pugh Class C', 'Hepatic Encephalopathy'],
    mustNotMissFlags: ['Peptic Ulcer Bleed', 'Dieulafoy Lesion', 'Gastric Antral Vascular Ectasia'],
    specialNotes: ['Octreotide/Terlipressin administration should be vividly documented'],
    admissionJustificationTemplate: 'Patient presents with massive hematemesis and melena. BP {bp}, HR {hr}. Hb {hb}. Endoscopy confirms {grade} esophageal varices with {bleeding_status}. {evl_performed}. Emergency ICU management, IV vasoactive drugs, and monitoring for re-bleed required.'
  },

  {
    code: 'K21.0',
    description: 'Gastro-esophageal reflux disease with esophagitis',
    commonName: 'GERD / Acid Reflux',
    specialty: 'Gastroenterology',
    subcategory: 'Upper GI',
    typicalLOS: { min: 1, max: 3, average: 2 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: ['44.13'],
    costEstimate: {
      generalWard: { min: 10000, max: 25000 },
      privateRoom: { min: 18000, max: 45000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 8000, max: 15000 }
    },
    pmjayEligible: false,
    daycareEligible: true,
    commonTPAQueries: [
      'Endoscopy report showing esophagitis (LA Grade)',
      'Why was OPD management insufficient?',
      'Previous treatment history'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['OPD treatable condition', 'Normal endoscopy'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'endo_gerd', name: 'Upper GI Endoscopy Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'ph_metry', name: '24h PH-Metry report', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['LA Grade C/D Esophagitis', 'Barrett\'s Esophagus', 'Stricture formation', 'Severe dysphagia'],
    mustNotMissFlags: ['Eosinophilic Esophagitis', 'Esophageal Cancer', 'Coronary Artery Disease'],
    specialNotes: ['LA Grade A/B esophagitis is almost always considered OPD by TPAs'],
    admissionJustificationTemplate: 'Patient presents with severe retrosternal burning and {dysphagia}. Endoscopy shows LA Grade {grade} esophagitis. {barretts_flag}. Inpatient / Daycare management for dose escalation and monitoring required.'
  },

  {
    code: 'K22.0',
    description: 'Achalasia of cardia',
    commonName: 'Achalasia Cardia',
    specialty: 'Gastroenterology',
    subcategory: 'Esophageal',
    typicalLOS: { min: 3, max: 7, average: 4 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['42.7'],
    costEstimate: {
      generalWard: { min: 40000, max: 100000 },
      privateRoom: { min: 70000, max: 180000 },
      icu: { min: 100000, max: 250000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'GS-1012',
    pmjayPackageRate: 15000,
    daycareEligible: false,
    commonTPAQueries: [
      'Barium Swallow showing "Bird-beak" appearance',
      'High-Resolution Manometry (HRM) data',
      'Endoscopy showing dilated esophagus'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Missing manometry data'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'hrm_report', name: 'High Resolution Manometry Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'barium_swallow', name: 'Barium Swallow X-ray films', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'poem_sticker', name: 'POEM procedure equipment sticker', category: 'implant', mandatory: false, whenRequired: 'if POEM done', tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Sigmoid Esophagus', 'Weight loss >10%', 'Recurrent aspiration pneumonia', 'Eckardt Score >6'],
    mustNotMissFlags: ['Pseudoachalasia (Malignancy)', 'Chagas Disease'],
    specialNotes: ['POEM (Per-Oral Endoscopic Myotomy) is a modern high-cost intervention'],
    admissionJustificationTemplate: 'Patient presents with progressive dysphagia and regurgitation. Barium swallow shows bird-beak appearance. Manometry confirms Type {type} Achalasia. Eckardt score {score}. Inpatient admission for {procedure_type} (Heller\'s / POEM) required.'
  },

  {
    code: 'K50.9',
    description: 'Crohn\'s disease, unspecified',
    commonName: 'Crohn\'s Disease',
    specialty: 'Gastroenterology',
    subcategory: 'IBD',
    typicalLOS: { min: 4, max: 12, average: 7 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: ['45.23'],
    costEstimate: {
      generalWard: { min: 30000, max: 80000 },
      privateRoom: { min: 55000, max: 150000 },
      icu: { min: 100000, max: 250000 },
      daycare: { min: 15000, max: 40000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1054',
    pmjayPackageRate: 12000,
    daycareEligible: true,
    commonTPAQueries: [
      'Colonoscopy/Enteroscopy report with biopsies',
      'CT/MRI Enterography results',
      'Was biologic (Infliximab) used? Expense justification',
      'Fecal Calprotectin levels'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Chronic stable state without acute flare'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'colonoscopy_ibi', name: 'Colonoscopy Report with Histopathology', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'cte_report', name: 'CT Enterography Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'calpro_ibi', name: 'Fecal Calprotectin', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Stricture / Obstruction', 'Fistulizing disease', 'Weight loss >15%', 'Abscess formation', 'Anemia (Hb <8)'],
    mustNotMissFlags: ['Intestinal TB (main DD in India)', 'Lymphoma', 'Behcet\'s Disease'],
    specialNotes: ['TB vs Crohn\'s is a common TPA query — document why TB was ruled out'],
    admissionJustificationTemplate: 'Patient presents with acute flare of Crohn\'s disease including abdominal pain and {stool_frequency} stools/day. CTE shows {involvement_area}. Biopsy confirms Crohn\'s. {fistula_status}. Inpatient management with IV steroids / biologics and monitoring for obstruction required.'
  },

  {
    code: 'K51.9',
    description: 'Ulcerative colitis, unspecified',
    commonName: 'Ulcerative Colitis (UC)',
    specialty: 'Gastroenterology',
    subcategory: 'IBD',
    typicalLOS: { min: 4, max: 12, average: 7 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: ['45.23'],
    costEstimate: {
      generalWard: { min: 30000, max: 80000 },
      privateRoom: { min: 55000, max: 150000 },
      icu: { min: 100000, max: 300000 },
      daycare: { min: 15000, max: 40000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1055',
    pmjayPackageRate: 12000,
    daycareEligible: true,
    commonTPAQueries: [
      'Colonoscopy with Mayo Score / UCEIS score',
      'Number of bloody stools per day',
      'CRP/Albumin levels',
      'Is Toxic Megacolon ruled out?'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Mild UC manageable as OPD'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'colonoscopy_uc', name: 'Colonoscopy with biopsy and Mayo Score', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'abdominal_xray_uc', name: 'Abdominal X-ray (to rule out megacolon)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Bloody stools >6/day', 'Tachycardia / Fever', 'Albumin <3.0', 'Toxic Megacolon (Diameter >6cm)'],
    mustNotMissFlags: ['CMV Colitis', 'C. difficile infection', 'Ischemic Colitis'],
    specialNotes: ['Truelove and Witts criteria should be used to justify admission for severe UC'],
    admissionJustificationTemplate: 'Patient presents with severe UC flare (Mayo Score {score}). Bloody stools {count}/day. Albumin {alb}, CRP {crp}. {megacolon_flag}. Inpatient management with IV steroids, hydration, and surgical backup for toxic megacolon monitoring required.'
  },

  {
    code: 'K29.7',
    description: 'Gastritis, unspecified',
    commonName: 'Gastritis / Erosive Gastritis',
    specialty: 'Gastroenterology',
    subcategory: 'Upper GI',
    typicalLOS: { min: 1, max: 3, average: 2 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: ['44.13'],
    costEstimate: {
      generalWard: { min: 8000, max: 20000 },
      privateRoom: { min: 15000, max: 35000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 6000, max: 12000 }
    },
    pmjayEligible: false,
    daycareEligible: true,
    commonTPAQueries: [
      'Endoscopy confirming erosions',
      'Cause (NSAIDs/Alcohol/Stress)',
      'Severity of pain'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Purely OPD condition in 90% cases'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'endo_gastritis', name: 'Upper GI Endoscopy Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'h_pylori_gastritis', name: 'H. pylori result', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Hematemesis / Melena', 'Erosive gastritis with multiple bleeds', 'Intractible vomiting'],
    mustNotMissFlags: ['Peptic Ulcer', 'Gastric Cancer', 'Pancreatitis'],
    specialNotes: ['Only erosive gastritis with bleeding or severe dehydration justifies admission'],
    admissionJustificationTemplate: 'Patient presents with severe epigastric pain and {vomiting}. Endoscopy confirms erosive gastritis with {bleeding_points}. Inpatient / Daycare management for IV PPIs and stabilization required.'
  },

  {
    code: 'K58.9',
    description: 'Irritable bowel syndrome without diarrhea',
    commonName: 'Irritable Bowel Syndrome (IBS)',
    specialty: 'Gastroenterology',
    subcategory: 'Functional GI',
    typicalLOS: { min: 1, max: 2, average: 1 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 5000, max: 12000 },
      privateRoom: { min: 10000, max: 25000 },
      icu: { min: 0, max: 0 },
      daycare: null
    },
    pmjayEligible: false,
    daycareEligible: false,
    commonTPAQueries: [
      'Rome IV criteria documentation',
      'Why was admission required for functional disorder?',
      'Warning signs Rule-out'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Almost always rejected as OPD-only'],
    preAuthRequired: false,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [],
    recommendedDocuments: [
      { id: 'colonoscopy_ibs', name: 'Colonoscopy (to rule out organic disease)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Severe disability / Inability to work', 'Association with severe psych distress'],
    mustNotMissFlags: ['IBD', 'Colorectal Cancer', 'Celiac Disease'],
    specialNotes: ['TPA will almost certainly reject an IBS admission unless other complications exist'],
    admissionJustificationTemplate: 'Patient presents with severe chronic abdominal pain and {symptoms} consistent with IBS. Inpatient workup to rule out organic disease and stabilize severe functional symptoms required.'
  },

  {
    code: 'K30',
    description: 'Functional dyspepsia',
    commonName: 'Functional Dyspepsia',
    specialty: 'Gastroenterology',
    subcategory: 'Functional GI',
    typicalLOS: { min: 1, max: 2, average: 1 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 5000, max: 12000 },
      privateRoom: { min: 10000, max: 25000 },
      icu: { min: 0, max: 0 },
      daycare: null
    },
    pmjayEligible: false,
    daycareEligible: false,
    commonTPAQueries: [
      'Endoscopy report (must be normal)',
      'Psychological assessment'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['OPD-only condition'],
    preAuthRequired: false,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'endo_dyspepsia', name: 'Upper GI Endoscopy Report (Normal)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [],
    severityMarkers: [],
    mustNotMissFlags: ['Gastric cancer', 'Gallstones', 'Pancreatic cancer'],
    specialNotes: ['Dyspepsia is a diagnosis of exclusion — document exclusion of organic disease'],
    admissionJustificationTemplate: 'Patient presents with chronic epigastric fullness and pain. Negative endoscopy and USG suggests functional dyspepsia. Inpatient management for symptom control and lifestyle counseling required.'
  },

  {
    code: 'K90.0',
    description: 'Celiac disease',
    commonName: 'Celiac Disease / Gluten Enteropathy',
    specialty: 'Gastroenterology',
    subcategory: 'Malabsorption',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: ['45.13'],
    costEstimate: {
      generalWard: { min: 15000, max: 40000 },
      privateRoom: { min: 25000, max: 70000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 10000, max: 25000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1056',
    pmjayPackageRate: 8500,
    daycareEligible: true,
    commonTPAQueries: [
      'Anti-tTG IgA levels',
      'D2 Biopsy showing Marsh grading',
      'Clinical symptoms (Diarrhea/Weight loss)'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['OPD manageable'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'ttg_report', name: 'Anti-tTG IgA Serology', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'd2_biopsy', name: 'Duodenal (D2) Biopsy History Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'marsh_grade', name: 'Marsh Histopathology Grade', category: 'clinical', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Marsh 3b/3c', 'Severe malnutrition / BMI <15', 'Hypocalcemic tetany', 'Celiac Crisis'],
    mustNotMissFlags: ['Intestinal Lymphoma', 'Tropical Sprue', 'Crohn\'s Disease'],
    specialNotes: ['Celiac Crisis with severe electrolyte imbalance is an emergency admission'],
    admissionJustificationTemplate: 'Patient presents with chronic malabsorption diarrhea and extreme weakness. Anti-tTG {ttg}. Biopsy shows Marsh {grade}. {malnutrition_status}. Inpatient management for metabolic correction and dietary stabilization required.'
  },

  {
    code: 'K72.9',
    description: 'Hepatic failure, unspecified',
    commonName: 'Hepatic Encephalopathy / Liver Failure',
    specialty: 'Gastroenterology',
    subcategory: 'Hepatology',
    typicalLOS: { min: 5, max: 14, average: 8 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'high',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 50000, max: 120000 },
      privateRoom: { min: 80000, max: 220000 },
      icu: { min: 150000, max: 450000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'MD-1057',
    pmjayPackageRate: 15000,
    daycareEligible: false,
    commonTPAQueries: [
      'West Haven Grade of Encephalopathy',
      'Serum Ammonia levels',
      'Precipitating factor (Infection/Bleed/Constipation)',
      'Liver failure timeline (Acute vs Chronic)'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Baseline stable cirrhosis without encephalopathy'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'ammonia_level', name: 'Serum Ammonia Level', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'lft_failure', name: 'LFT and Coagulation profile', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'ct_head_failure', name: 'CT Head (to rule out intracranial bleed)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Grade III/IV Encephalopathy (Coma)', 'INR >2.5', 'Hypoglycemia', 'Cerebral Edema'],
    mustNotMissFlags: ['Intracranial Hemorrhage', 'Wernicke Encephalopathy', 'Meningitis'],
    specialNotes: ['Lactulose and Rifaximin therapy should be documented'],
    admissionJustificationTemplate: 'Patient presents with altered sensorium and jaundice. Grade {grade} Hepatic Encephalopathy. Precipitating factor: {factor}. Ammonia {ammonia}. {coagulopathy_flag}. Emergency ICU management and monitoring for liver failure required.'
  },

  // ══════════════════════════════════════════════════════════════
  // SPECIALTY 4: ORTHOPEDICS
  // ══════════════════════════════════════════════════════════════

  {
    code: 'S72.001A',
    description: 'Fracture of unspecified part of neck of right femur, initial encounter',
    commonName: 'Hip Fracture / Neck of Femur Fracture',
    specialty: 'Orthopedics',
    subcategory: 'Fractures — Lower Limb',
    typicalLOS: { min: 7, max: 14, average: 9 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['81.52', '79.35', '81.51'],
    costEstimate: {
      generalWard: { min: 80000, max: 200000 },
      privateRoom: { min: 140000, max: 350000 },
      icu: { min: 200000, max: 450000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'OR-1008',
    pmjayPackageRate: 45000,
    daycareEligible: false,
    commonTPAQueries: [
      'X-ray pelvis and hip confirming fracture',
      'Implant stickers mandatory — original physical stickers required',
      'OT notes with implant details (company, model, size)',
      'Pre-operative fitness — especially for elderly patients',
      'Post-operative X-ray showing implant position'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Missing implant stickers', 'Implant cost not matching invoice'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'xray_hip', name: 'X-Ray Pelvis with Hip (AP and Lateral views)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Fracture not radiologically confirmed' },
      { id: 'implant_sticker_hip', name: 'Implant Sticker — Original Physical Sticker (not photocopy)', category: 'implant', mandatory: true, whenRequired: 'if PFNA nail, DHS, or prosthesis used', tpaQueryIfMissing: 'Implant identity and cost cannot be verified without original manufacturer sticker' },
      { id: 'implant_invoice', name: 'Implant Invoice from Supplier', category: 'implant', mandatory: true, whenRequired: 'if implant used', tpaQueryIfMissing: 'Cost of implant not verifiable' },
      { id: 'ot_notes_hip', name: 'Operation Theatre Notes with Implant Details', category: 'operative', mandatory: true, tpaQueryIfMissing: 'Surgical procedure and implant specifications not documented' },
      { id: 'preop_ecg', name: 'Pre-Operative ECG (especially >60 years)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Pre-operative cardiac clearance not documented' },
      { id: 'postop_xray', name: 'Post-Operative X-Ray Showing Implant Position', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Surgical outcome not radiologically confirmed' }
    ],
    recommendedDocuments: [
      { id: 'dexa', name: 'DEXA Scan (if osteoporosis suspected)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Displaced fracture', 'Intracapsular vs extracapsular', 'Garden classification', 'AO/OTA classification', 'Vascular compromise'],
    mustNotMissFlags: ['Pathological fracture (malignancy)', 'Avascular necrosis of femoral head'],
    specialNotes: ['Implant sticker is the single most common rejection reason for orthopedic claims — it MUST be the original physical sticker attached to the claim form, not a photocopy or printout', 'Implant cost often exceeds package rate — pre-authorize implant separately'],
    admissionJustificationTemplate: 'Patient presents with {mechanism} resulting in {fracture_type} hip fracture confirmed on X-ray (Garden Grade {grade} / AO Type {ao_type}). Surgical intervention with {implant_type} required. Pre-operative workup completed. Risk of avascular necrosis, non-union, and permanent disability without surgical fixation. Inpatient management, surgical fixation, and post-operative rehabilitation required.'
  },

  {
    code: 'M17.11',
    description: 'Primary osteoarthritis, right knee',
    commonName: 'Total Knee Replacement (TKR) / Knee Osteoarthritis',
    specialty: 'Orthopedics',
    subcategory: 'Joint Replacement',
    typicalLOS: { min: 5, max: 8, average: 6 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['81.54'],
    costEstimate: {
      generalWard: { min: 180000, max: 400000 },
      privateRoom: { min: 280000, max: 650000 },
      icu: { min: 0, max: 0 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'OR-1022',
    pmjayPackageRate: 80000,
    daycareEligible: false,
    commonTPAQueries: [
      'X-ray knee standing (weight-bearing) confirming grade 3-4 OA',
      'Implant stickers — both femoral and tibial components',
      'Conservative treatment failure documentation',
      'Functional disability assessment',
      'Pre-operative fitness for elective surgery'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Conservative treatment not documented as failed', 'Grade 1-2 OA insufficient for TKR', 'Missing weight-bearing X-ray', 'Missing implant stickers'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'xray_knee_wt', name: 'X-Ray Knee — Standing Weight-Bearing AP View (both knees)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Arthritis grading requires weight-bearing film — non-weight-bearing X-ray is insufficient for TKR justification' },
      { id: 'conservative_failure', name: 'Documentation of Failed Conservative Treatment (physio, injections, medications — minimum 6 months)', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Surgical intervention unjustified without evidence of failed conservative management' },
      { id: 'implant_stickers_tkr', name: 'Implant Stickers — ALL Components (femoral, tibial, patella, polyethylene insert)', category: 'implant', mandatory: true, tpaQueryIfMissing: 'All prosthesis components must have original stickers' },
      { id: 'ot_notes_tkr', name: 'OT Notes with Implant Details', category: 'operative', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'mri_knee', name: 'MRI Knee (if soft tissue assessment needed)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Kellgren-Lawrence Grade 3-4', 'Bone-on-bone appearance', 'Severe functional limitation', 'Failed conservative treatment'],
    mustNotMissFlags: ['Septic arthritis', 'Knee malignancy', 'Inflammatory arthritis'],
    specialNotes: ['Weight-bearing X-ray is non-negotiable — many hospitals submit supine films which TPAs reject', 'Document exactly what conservative treatment was tried and for how long', 'All implant components need individual stickers — including polyethylene insert which is often missed'],
    admissionJustificationTemplate: 'Patient with Kellgren-Lawrence Grade {kl_grade} bilateral knee osteoarthritis (right worse than left). Weight-bearing X-ray shows {xray_findings}. Failed conservative management including {conservative_treatment} for {duration} with no functional improvement. Severe functional limitation — {functional_status}. Total knee replacement indicated for pain relief and functional restoration.'
  },

  {
    code: 'M54.5',
    description: 'Low back pain',
    commonName: 'Lumbar Disc Disease / PIVD',
    specialty: 'Orthopedics',
    subcategory: 'Spine',
    typicalLOS: { min: 3, max: 7, average: 4 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: ['80.51', '81.08'],
    costEstimate: {
      generalWard: { min: 15000, max: 50000 },
      privateRoom: { min: 25000, max: 90000 },
      icu: { min: 0, max: 0 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'OR-1031',
    pmjayPackageRate: 11000,
    daycareEligible: false,
    commonTPAQueries: [
      'MRI lumbar spine confirming disc herniation',
      'Neurological deficit documented by neurosurgeon',
      'Was conservative treatment tried?',
      'Justify inpatient vs OPD physiotherapy'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Mechanical back pain without neurological deficit rejected frequently', 'OPD-treatable condition', 'Missing MRI'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'mri_lumbar', name: 'MRI Lumbar Spine Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Disc herniation level and nerve compression not documented without MRI' },
      { id: 'neuro_exam', name: 'Neurological Examination — Power, Sensation, Reflexes', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Neurological deficit not formally assessed — hospitalization justification unclear' }
    ],
    recommendedDocuments: [
      { id: 'xray_lumbar', name: 'X-Ray Lumbar Spine (AP + Lateral)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Foot drop', 'Bladder/bowel dysfunction (cauda equina)', 'Grade 4-5 motor weakness', 'Dermatomal sensory loss'],
    mustNotMissFlags: ['Cauda equina syndrome (surgical emergency)', 'Spinal malignancy / metastasis', 'Spinal infection (discitis, TB spine)'],
    specialNotes: ['Cauda equina syndrome is a surgical emergency — escalate immediately', 'Mechanical back pain without neurological deficit is very high rejection risk'],
    admissionJustificationTemplate: 'Patient presents with {symptom_duration} history of back pain with {radiation_pattern}. MRI lumbar spine shows {mri_findings} at {level}. Neurological examination demonstrates {neurological_findings}. {cauda_equina_flag}. {conservative_treatment_failed}. Inpatient pain management and {surgical_plan} required.'
  },

  {
    code: 'S83.51',
    description: 'Tear of anterior cruciate ligament',
    commonName: 'ACL Tear',
    specialty: 'Orthopedics',
    subcategory: 'Knee / Sports Injury',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['81.45'],
    costEstimate: {
      generalWard: { min: 60000, max: 120000 },
      privateRoom: { min: 90000, max: 180000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 50000, max: 100000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'OR-1021',
    pmjayPackageRate: 15000,
    daycareEligible: true,
    commonTPAQueries: [
      'MRI Knee report movies and description',
      'Clinical Laxity signs (Lachman / Drawer tests)',
      'Was Meniscus also torn?',
      'Implant (Screw/Endobutton) stickers'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['ACL tear without clinical instability (Grade I/II)', 'Degenerative tear'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'mri_acl', name: 'MRI Knee Report showing Full Thickness ACL Tear', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'lachman_test', name: 'Clinical Laxity (Lachman Grade II/III) documentation', category: 'clinical', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Full thickness tear', 'Pivot shift positive', 'Multiple ligament injury (MCL/LCL)', 'Tibial spine avulsion'],
    mustNotMissFlags: ['Meniscal bucket handle tear', 'Segond fracture', 'Nerve injury'],
    specialNotes: ['Arthroscopic ACL reconstruction is the gold standard — stickers for interface screws/endobuttons are vital'],
    admissionJustificationTemplate: 'Patient presents with acute knee injury and instability. MRI confirms Complete ACL Tear. {clinical_laxity_signs}. Failed conservative management. Inpatient / Daycare Arthroscopic ACL Reconstruction required for restoration of stability.'
  },

  {
    code: 'M23.20',
    description: 'Derangement of unspecified meniscus due to old tear or injury',
    commonName: 'Meniscal Tear',
    specialty: 'Orthopedics',
    subcategory: 'Knee',
    typicalLOS: { min: 1, max: 3, average: 2 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['80.6'],
    costEstimate: {
      generalWard: { min: 35000, max: 80000 },
      privateRoom: { min: 55000, max: 130000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 30000, max: 70000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'OR-1025',
    pmjayPackageRate: 11000,
    daycareEligible: true,
    commonTPAQueries: [
      'MRI Knee report',
      'Locking or buckling symptoms',
      'Joint line tenderness documentation',
      'Was meniscal repair or partial meniscectomy done?'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Degenerative meniscal tear in elderly (wait and watch)'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'mri_meniscus', name: 'MRI Knee Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [],
    severityMarkers: ['Locked Knee (Inability to extend)', 'Bucket handle tear', 'Displaced fragment'],
    mustNotMissFlags: ['Loose body', 'OCD (Osteochondritis Dissecans)', 'Plica syndrome'],
    specialNotes: ['Meniscal repair stickers (if used) are mandatory for reimbursement'],
    admissionJustificationTemplate: 'Patient presents with knee pain and {locking_symptoms}. MRI confirms {tear_type} meniscal tear. {locked_knee_flag}. Inpatient / Daycare arthroscopic {procedure_name} required.'
  },

  {
    code: 'M47.812',
    description: 'Spondylosis without myelopathy or radiculopathy, cervical region',
    commonName: 'Cervical Spondylosis',
    specialty: 'Orthopedics',
    subcategory: 'Spine',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 20000, max: 50000 },
      privateRoom: { min: 35000, max: 90000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 15000, max: 35000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'OR-1011',
    pmjayPackageRate: 12000,
    daycareEligible: true,
    commonTPAQueries: [
      'X-ray/MRI evidence of osteophytes/stenosis',
      'Severity of neck pain / vertigo',
      'Is there myelopathy? (Gait/Dexterity)'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Degenerative change only (normal aging)'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'mri_cervical', name: 'MRI Cervical Spine Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [],
    severityMarkers: ['Gait instability (Myelopathy)', 'Hoffmann positive', 'Clonus', 'Wasting of hand intrinsics'],
    mustNotMissFlags: ['Cervical Disc Prolapse', 'Syringomyelia', 'Multiple Sclerosis'],
    specialNotes: ['Conservative management should be emphasized for simple spondylosis'],
    admissionJustificationTemplate: 'Patient presents with chronic severe neck pain and {myelopathy_signs}. MRI confirms cervical spondylosis at {level} with {stenosis_type}. Inpatient stabilization and {management_plan} required.'
  },

  {
    code: 'M75.00',
    description: 'Adhesive capsulitis of unspecified shoulder',
    commonName: 'Frozen Shoulder',
    specialty: 'Orthopedics',
    subcategory: 'Shoulder',
    typicalLOS: { min: 1, max: 3, average: 2 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['80.41'],
    costEstimate: {
      generalWard: { min: 25000, max: 60000 },
      privateRoom: { min: 45000, max: 100000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 20000, max: 50000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'OR-1022',
    pmjayPackageRate: 9000,
    daycareEligible: true,
    commonTPAQueries: [
      'Range of Motion (ROM) measurements',
      'Diabetes status (high association)',
      'Was MUA (Manipulation under Anesthesia) done?'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Purely physiotherapy condition'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'rom_record', name: 'Passive vs Active ROM range documentation', category: 'clinical', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'mri_shoulder_frozen', name: 'MRI Shoulder (to rule out rotator cuff tear)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['ROM < 30 degrees abduction', 'Night pain preventing sleep', 'Failure of 3 months physio'],
    mustNotMissFlags: ['Rotator cuff tear', 'Calcific tendonitis', 'Pancoast tumor'],
    specialNotes: ['MUA or Arthroscopic capsular release are common surgical indications'],
    admissionJustificationTemplate: 'Patient presents with progressive shoulder stiffness and pain. Abduction limited to {degrees} degrees. {diabetes_flag}. Failed 3 months of physiotherapy. Inpatient / Daycare MUA or capsular release required.'
  },

  {
    code: 'G56.00',
    description: 'Carpal tunnel syndrome, unspecified upper limb',
    commonName: 'Carpal Tunnel Syndrome (CTS)',
    specialty: 'Orthopedics',
    subcategory: 'Hand / Nerve',
    typicalLOS: { min: 1, max: 2, average: 1 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['04.43'],
    costEstimate: {
      generalWard: { min: 15000, max: 35000 },
      privateRoom: { min: 25000, max: 60000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 12000, max: 30000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'OR-1023',
    pmjayPackageRate: 8500,
    daycareEligible: true,
    commonTPAQueries: [
      'NCV (Nerve Conduction Velocity) report',
      'Tinel and Phalen test results',
      'Presence of thenar wasting'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Mild CTS without NCV confirmation'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'ncv_cts', name: 'NCV Median Nerve study report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [],
    severityMarkers: ['Thenar muscle atrophy', 'Persistent numbness', 'Absent sensory response on NCV'],
    mustNotMissFlags: ['Cervical Radiculopathy', 'Pronator Syndrome', 'Diabetic Neuropathy'],
    specialNotes: ['Carpal tunnel release is a classic daycare procedure'],
    admissionJustificationTemplate: 'Patient presents with classic numbness in median nerve distribution. NCV confirms {severity} carpal tunnel syndrome. {thenar_wasting}. Inpatient / Daycare carpal tunnel release required.'
  },

  {
    code: 'S82.899A',
    description: 'Other fracture of unspecified lower leg, initial encounter for closed fracture',
    commonName: 'Ankle Fracture (Bimalleolar / Trimalleolar)',
    specialty: 'Orthopedics',
    subcategory: 'Trauma',
    typicalLOS: { min: 3, max: 7, average: 5 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['79.36'],
    costEstimate: {
      generalWard: { min: 50000, max: 120000 },
      privateRoom: { min: 80000, max: 180000 },
      icu: { min: 0, max: 0 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'OR-1028',
    pmjayPackageRate: 35000,
    daycareEligible: false,
    commonTPAQueries: [
      'X-ray AP/Lat/Mortise views',
      'Medullary vs Cortical involvement',
      'Implant stickers for plates/screws'
    ],
    highRejectionRisk: false,
    rejectionReasons: [],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'xray_ankle_fx', name: 'X-ray Ankle films (minimum 2 views)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'plate_screw_sticker', name: 'Ortho Implant Stickers (Original)', category: 'implant', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'ct_ankle_fx', name: 'CT Ankle (for complex trimalleolar fx)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Trimalleolar fracture', 'Talar shift / Syndesmotic injury', 'Open fracture (Gustilo-Anderson)', 'Malleolar skin tenting'],
    mustNotMissFlags: ['Syndesmotic injury', 'Maisonneuve fracture (high fibula)', 'Compartment syndrome'],
    specialNotes: ['Always document syndesmotic stability after ORIF'],
    admissionJustificationTemplate: 'Patient presents with acute ankle trauma and deformity. X-ray shows {fx_type} fracture. {instability_feature}. Inpatient ORIF with plate and screws and stabilization required.'
  },

  {
    code: 'S52.501A',
    description: 'Unspecified fracture of the lower end of right radius, initial encounter for closed fracture',
    commonName: 'Colles Fracture / Distal Radius FX',
    specialty: 'Orthopedics',
    subcategory: 'Trauma',
    typicalLOS: { min: 1, max: 4, average: 2 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['79.32'],
    costEstimate: {
      generalWard: { min: 30000, max: 70000 },
      privateRoom: { min: 50000, max: 120000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 25000, max: 60000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'OR-1030',
    pmjayPackageRate: 18000,
    daycareEligible: true,
    commonTPAQueries: [
      'X-ray wrist films',
      'Joint surfaces involvement (Intra-articular)',
      'Was manipulation done or plating?'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Simple fracture manageable by plaster (OPD)'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'xray_wrist_fx', name: 'X-ray Wrist AP/Lat', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'implant_radius', name: 'Voler Locking Plate sticker', category: 'implant', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Intra-articular extension', 'Comminution', 'Ulnar styloid fracture', 'Radial shortening >3mm'],
    mustNotMissFlags: ['Scaphoid fracture', 'DRUJ instability', 'Median nerve compression'],
    specialNotes: ['Dorsal tilt >10 deg usually justifies surgical ORIF'],
    admissionJustificationTemplate: 'Patient presents with wrist deformity after fall. X-ray confirms {fx_position} distal radius fracture with {articular_involvement}. Inpatient ORIF or manipulation under anesthesia required.'
  },

  {
    code: 'M65.30',
    description: 'Trigger finger, unspecified finger',
    commonName: 'Trigger Finger',
    specialty: 'Orthopedics',
    subcategory: 'Hand',
    typicalLOS: { min: 1, max: 1, average: 1 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['82.01'],
    costEstimate: {
      generalWard: { min: 10000, max: 20000 },
      privateRoom: { min: 18000, max: 35000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 8000, max: 15000 }
    },
    pmjayEligible: false,
    daycareEligible: true,
    commonTPAQueries: [
      'Clinical examination findings (nodule)',
      'Failed steroid injection history'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['OPD minor procedure'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [],
    recommendedDocuments: [],
    severityMarkers: ['Locked finger', 'Severe pain clicking'],
    mustNotMissFlags: ['Flexor tenosynovitis (Infectious)', 'Dupuytren contracture'],
    specialNotes: ['Trigger release is almost always a daycare procedure'],
    admissionJustificationTemplate: 'Patient presents with painful clicking and locking of {finger}. Failed conservative management. Daycare surgical release of A1 pulley required.'
  },

  {
    code: 'M72.2',
    description: 'Plantar fascial fibromatosis',
    commonName: 'Plantar Fasciitis / Heel Spur',
    specialty: 'Orthopedics',
    subcategory: 'Foot / Ankle',
    typicalLOS: { min: 1, max: 1, average: 1 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 5000, max: 12000 },
      privateRoom: { min: 10000, max: 20000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 3000, max: 8000 }
    },
    pmjayEligible: false,
    daycareEligible: true,
    commonTPAQueries: [
      'X-ray showing heel spur',
      'Clinical focal tenderness'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['OPD condition (Inserts/Exercises)'],
    preAuthRequired: false,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'xray_heel', name: 'X-ray Calcaneum (Lat)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [],
    severityMarkers: ['Severe disability', 'Failure of 6 months physio/inserts'],
    mustNotMissFlags: ['Calcaneal stress fracture', 'Tarsal tunnel syndrome', 'Baxter nerve impingement'],
    specialNotes: ['Admission only for ESWT or recalcitrant cases requiring surgical release'],
    admissionJustificationTemplate: 'Patient presents with severe heel pain. X-ray shows {spur_status}. Inpatient / Daycare management for {procedure_name} required.'
  },

  {
    code: 'M77.1',
    description: 'Lateral epicondylitis',
    commonName: 'Tennis Elbow',
    specialty: 'Orthopedics',
    subcategory: 'Elbow',
    typicalLOS: { min: 1, max: 1, average: 1 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 5000, max: 12000 },
      privateRoom: { min: 10000, max: 20000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 3000, max: 8000 }
    },
    pmjayEligible: false,
    daycareEligible: true,
    commonTPAQueries: [
      'Pain location (Lateral epicondyle)',
      'Impact on ADLs'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Pure OPD condition'],
    preAuthRequired: false,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [],
    recommendedDocuments: [],
    severityMarkers: [],
    mustNotMissFlags: ['Radial tunnel syndrome', 'Cervical radiculopathy', 'Posterior interosseous nerve palsy'],
    specialNotes: ['Usually treated with PRP or steroid injections in OPD'],
    admissionJustificationTemplate: 'Patient presents with severe lateral elbow pain. Diagnosis of Tennis Elbow confirmed. Inpatient / Daycare management for {treatment} required.'
  },

  // ══════════════════════════════════════════════════════════════
  // SPECIALTY 5: NEUROLOGY
  // ══════════════════════════════════════════════════════════════

  {
    code: 'I63.9',
    description: 'Cerebral infarction, unspecified',
    commonName: 'Ischemic Stroke',
    specialty: 'Neurology',
    subcategory: 'Stroke',
    typicalLOS: { min: 7, max: 21, average: 10 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'high',
    surgeryRequired: false,
    procedureCodes: ['99.10'],
    costEstimate: {
      generalWard: { min: 60000, max: 180000 },
      privateRoom: { min: 110000, max: 350000 },
      icu: { min: 180000, max: 500000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'NS-1001',
    pmjayPackageRate: 28000,
    daycareEligible: false,
    commonTPAQueries: [
      'MRI/CT brain confirming infarction',
      'Time of symptom onset — crucial for thrombolysis window',
      'NIHSS score at admission',
      'Was tPA thrombolysis given? Consent + drug details',
      'Rehabilitation plan documentation'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['TIA (24h resolution) — TPA may question LOS', 'Missing imaging'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'ct_brain', name: 'CT Brain (non-contrast) — Admission', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Hemorrhage vs ischemia not differentiated' },
      { id: 'mri_brain', name: 'MRI Brain with DWI (diffusion weighted imaging)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Infarct confirmation and extent not documented' },
      { id: 'nihss', name: 'NIHSS Score Documentation', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Stroke severity not objectively quantified' },
      { id: 'ecg_stroke', name: 'ECG (AF as cardioembolic cause)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Cardioembolic etiology not investigated' },
      { id: 'echo_stroke', name: 'Echocardiography (cardioembolic workup)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'mra_cta', name: 'MR Angiography or CT Angiography (vessel imaging)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' },
      { id: 'tpa_consent', name: 'tPA Thrombolysis Consent + Administration Record', category: 'clinical', mandatory: false, whenRequired: 'if thrombolysis given', tpaQueryIfMissing: 'Thrombolysis not consented/documented' }
    ],
    severityMarkers: ['NIHSS >15', 'Large vessel occlusion', 'Hemorrhagic transformation', 'Malignant MCA syndrome', 'Dysphagia/aspiration risk'],
    mustNotMissFlags: ['Hemorrhagic stroke', 'Todd\'s paralysis post-seizure', 'Hypertensive encephalopathy', 'Brain tumor'],
    specialNotes: ['Time of symptom onset is legally critical — document precisely', 'Thrombolysis window: <4.5 hours from symptom onset to needle time — document both times exactly'],
    admissionJustificationTemplate: 'Patient presents with sudden onset {neurological_deficits} at {onset_time}. CT brain excludes hemorrhage. MRI DWI confirms {infarct_location} ischemic infarct. NIHSS score {nihss}. {thrombolysis_statement}. Stroke unit admission required for monitoring, secondary prevention initiation, dysphagia assessment, and rehabilitation planning.'
  },

  {
    code: 'G40.909',
    description: 'Epilepsy, unspecified, not intractable',
    commonName: 'Seizure Disorder / Epilepsy',
    specialty: 'Neurology',
    subcategory: 'Seizure Disorders',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 15000, max: 45000 },
      privateRoom: { min: 25000, max: 80000 },
      icu: { min: 50000, max: 150000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'NS-1015',
    pmjayPackageRate: 9000,
    daycareEligible: false,
    commonTPAQueries: [
      'Was this first seizure or breakthrough seizure?',
      'EEG report',
      'CT/MRI brain to rule out structural cause',
      'Drug levels if on anti-epileptics',
      'Justify inpatient management for known epileptic'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Known epileptic — TPA questions readmission', 'Missing EEG', 'Single brief seizure — OPD-manageable per TPA'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'ct_brain_seizure', name: 'CT Brain (structural etiology)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Secondary cause of seizure not excluded' },
      { id: 'eeg', name: 'EEG Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Electrophysiological evidence not documented' },
      { id: 'drug_levels', name: 'Anti-Epileptic Drug Level (if on medication)', category: 'investigation', mandatory: false, whenRequired: 'if on anti-epileptics', tpaQueryIfMissing: 'Sub-therapeutic levels not documented — compliance cannot be assessed' }
    ],
    recommendedDocuments: [
      { id: 'mri_brain_seizure', name: 'MRI Brain (first seizure workup)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Status epilepticus (>5 min or recurrent)', 'Post-ictal paralysis', 'First seizure in adult', 'Focal onset seizure', 'New structural lesion'],
    mustNotMissFlags: ['Brain tumor', 'Meningitis/encephalitis', 'Metabolic cause (hypoglycemia, hyponatremia)', 'Drug withdrawal'],
    specialNotes: ['Status epilepticus is medical emergency — document seizure duration exactly', 'First seizure in adult requires full workup — this strongly justifies admission'],
    admissionJustificationTemplate: 'Patient presents with {first_recurrent} generalized tonic-clonic seizure lasting {duration}. {status_epilepticus}. CT brain shows {ct_findings}. EEG shows {eeg_findings}. AED drug level {drug_level}. {etiology}. Inpatient monitoring, investigation for precipitating cause, and AED optimization required.'
  },

  {
    code: 'G03.9',
    description: 'Meningitis, unspecified',
    commonName: 'Meningitis',
    specialty: 'Neurology',
    subcategory: 'Infection',
    typicalLOS: { min: 7, max: 21, average: 14 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'high',
    surgeryRequired: false,
    procedureCodes: ['03.31'],
    costEstimate: {
      generalWard: { min: 40000, max: 100000 },
      privateRoom: { min: 70000, max: 180000 },
      icu: { min: 150000, max: 400000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'NS-1002',
    pmjayPackageRate: 18000,
    daycareEligible: false,
    commonTPAQueries: [
      'CSF (Cerebrospinal Fluid) analysis report',
      'CT/MRI brain results',
      'Clinical signs of meningeal irritation (Kernig/Brudzinski)',
      'Fever and headache duration'
    ],
    highRejectionRisk: false,
    rejectionReasons: [],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'csf_report', name: 'CSF Analysis (Cytology, Bio-chem, Culture)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'ct_mri_meningitis', name: 'CT/MRI Brain', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Altered sensorium', 'Seizures', 'Cranial nerve palsies', 'Septic shock'],
    mustNotMissFlags: ['Encephalitis', 'Brain abscess', 'Cryptococcal meningitis (HIV)'],
    specialNotes: ['CSF analysis is the diagnostic gold standard — always include CSF culture results when available'],
    admissionJustificationTemplate: 'Patient presents with fever, headache, and signs of meningeal irritation. CSF shows {pleocytosis} and {glucose_level}. {neurological_deficit}. Emergency inpatient ICU management and IV antibiotics/antivirals required.'
  },

  {
    code: 'G35',
    description: 'Multiple sclerosis',
    commonName: 'Multiple Sclerosis (MS)',
    specialty: 'Neurology',
    subcategory: 'Demyelinating',
    typicalLOS: { min: 3, max: 10, average: 5 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 30000, max: 80000 },
      privateRoom: { min: 50000, max: 150000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 20000, max: 60000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'NS-1005',
    pmjayPackageRate: 15000,
    daycareEligible: true,
    commonTPAQueries: [
      'MRI Brain/Spine showing demyelinating plaques',
      'CSF Oligoclonal bands results',
      'VEP (Visual Evoked Potential) report',
      'McDonals criteria fulfillment'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Chronic stable disease (TPA questions acute justification)'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'mri_demyelination', name: 'MRI Brain and Spine Reports', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'csf_ocb', name: 'CSF Oligoclonal Bands', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Acute relapse (optic neuritis/transverse myelitis)', 'EDSS score progression', 'New gadolinium-enhancing lesions'],
    mustNotMissFlags: ['Neuromyelitis Optica (NMO)', 'ADEM', 'Spinal cord tumor'],
    specialNotes: ['Admission usually for high-dose pulse steroid therapy'],
    admissionJustificationTemplate: 'Patient presents with acute neurological deficit suggestive of MS relapse. MRI confirms new demyelinating plaques at {level}. Inpatient high-dose pulse steroid therapy and stabilization required.'
  },

  {
    code: 'G20',
    description: 'Parkinson\'s disease',
    commonName: 'Parkinson\'s Disease',
    specialty: 'Neurology',
    subcategory: 'Movement Disorders',
    typicalLOS: { min: 2, max: 7, average: 4 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 20000, max: 50000 },
      privateRoom: { min: 35000, max: 90000 },
      icu: { min: 0, max: 0 },
      daycare: null
    },
    pmjayEligible: false,
    daycareEligible: false,
    commonTPAQueries: [
      'Justify inpatient admission for chronic disease',
      'Presence of falls / swallowing difficulty',
      'Drug induced parkinsonism ruling out'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Purely for medication adjustment or physiotherapy'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [],
    recommendedDocuments: [],
    severityMarkers: ['Frequent falls', 'Aspiration pneumonia risk', 'Freezing of gait', 'Dementia complication'],
    mustNotMissFlags: ['Progressive Supranuclear Palsy (PSP)', 'Normal Pressure Hydrocephalus (NPH)', 'Drug induced parkinsonism'],
    specialNotes: ['Inpatient care justified during medication titration "off" periods or complications like falls/aspiration'],
    admissionJustificationTemplate: 'Patient with advanced Parkinson\'s disease presents with {complication_type}. {swallowing_status}. {falls_history}. Inpatient management for medication optimization and complication stabilization required.'
  },

  {
    code: 'G61.0',
    description: 'Guillain-Barré syndrome',
    commonName: 'GBS',
    specialty: 'Neurology',
    subcategory: 'Peripheral Nerve',
    typicalLOS: { min: 7, max: 30, average: 14 },
    admissionType: 'emergency',
    wardType: 'icu',
    icuProbability: 'high',
    surgeryRequired: false,
    procedureCodes: ['99.71'],
    costEstimate: {
      generalWard: { min: 50000, max: 150000 },
      privateRoom: { min: 80000, max: 250000 },
      icu: { min: 200000, max: 800000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'NS-1010',
    pmjayPackageRate: 150000,
    daycareEligible: false,
    commonTPAQueries: [
      'NCV (Nerve Conduction Velocity) report',
      'CSF albuminocytologic dissociation',
      'Presence of respiratory distress (vital capacity)',
      'Justify IVIg vs Plasmapheresis'
    ],
    highRejectionRisk: false,
    rejectionReasons: [],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'ncv_gbs', name: 'NCV Study showing demyelinating neuropathy', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'csf_gbs', name: 'CSF Analysis (Albuminocytologic dissociation)', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [],
    severityMarkers: ['Respiratory muscle weakness', 'Bulbar palsy', 'Rapidly ascending paralysis', 'Autonomic instability'],
    mustNotMissFlags: ['Acute spinal cord compression', 'Transverse myelitis', 'Hypokalemic paralysis'],
    specialNotes: ['IVIg cost is often very high — document weight and dose calculation precisely'],
    admissionJustificationTemplate: 'Patient presents with rapidly ascending motor paralysis and {respiratory_status}. NCV and CSF confirm GBS. High risk of respiratory failure. Emergency ICU admission for {specific_treatment} (IVIg/Plasmapheresis) required.'
  },

  {
    code: 'G70.00',
    description: 'Myasthenia gravis without (acute) exacerbation',
    commonName: 'Myasthenia Gravis',
    specialty: 'Neurology',
    subcategory: 'Neuromuscular',
    typicalLOS: { min: 3, max: 15, average: 7 },
    admissionType: 'both',
    wardType: 'icu',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 30000, max: 80000 },
      privateRoom: { min: 50000, max: 150000 },
      icu: { min: 100000, max: 300000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'NS-1011',
    pmjayPackageRate: 18000,
    daycareEligible: false,
    commonTPAQueries: [
      'Anti-AChR antibody levels',
      'RNST (Repetitive Nerve Stimulation Test) report',
      'Ice pack test or Tensilon test result',
      'CT Chest for Thymoma'
    ],
    highRejectionRisk: false,
    rejectionReasons: [],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'rnst_report', name: 'RNST Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'achr_antibody', name: 'Anti-AChR Antibody Assay', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' },
      { id: 'ct_thymoma', name: 'CT Chest (Thymoma screening)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Myasthenic crisis (Respiratory failure)', 'Bulbar involvement', 'Generalized weakness'],
    mustNotMissFlags: ['Cholinergic crisis', 'Botulism', 'Lambert-Eaton Syndrome'],
    specialNotes: ['Myasthenic crisis requires emergency ICU admission and possibly plasmapheresis'],
    admissionJustificationTemplate: 'Patient with known MG presents with {symptoms} suggestive of {crisis_status}. {respiratory_effort}. RNST confirms neuromuscular junction defect. Inpatient / ICU management and therapy optimization required.'
  },

  // ══════════════════════════════════════════════════════════════
  // SPECIALTY 6: UROLOGY
  // ══════════════════════════════════════════════════════════════

  {
    code: 'N20.0',
    description: 'Calculus of kidney',
    commonName: 'Kidney Stone / Renal Calculus',
    specialty: 'Urology',
    subcategory: 'Urolithiasis',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: ['98.51', '56.0', '55.04'],
    costEstimate: {
      generalWard: { min: 20000, max: 60000 },
      privateRoom: { min: 35000, max: 100000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 30000, max: 70000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'UR-1003',
    pmjayPackageRate: 15000,
    daycareEligible: true,
    commonTPAQueries: [
      'USG KUB or CT KUB confirming stone',
      'Stone size — determines OPD vs inpatient ESWL',
      'Was ureteric obstruction or infection present?',
      'Renal function tests',
      'Urine culture if infection suspected'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Small stones passable spontaneously — OPD-manageable per TPA', 'Missing imaging', 'No obstruction documented'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'usg_kub', name: 'USG KUB (Kidney, Ureter, Bladder)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Stone not radiologically confirmed' },
      { id: 'ct_kub', name: 'NCCT KUB (Non-Contrast CT) — preferred for ureteric stones', category: 'investigation', mandatory: false, whenRequired: 'if ureteric stone suspected and USG inconclusive', tpaQueryIfMissing: 'Ureteric stone not definitively confirmed' },
      { id: 'rft_stone', name: 'Renal Function Tests (Creatinine, BUN)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Obstructive nephropathy not assessed' },
      { id: 'urine_culture_stone', name: 'Urine Routine, Microscopy, and Culture', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Concurrent UTI not excluded' }
    ],
    recommendedDocuments: [
      { id: 'xray_kub', name: 'X-Ray KUB (radio-opaque stones)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Obstructive uropathy', 'Infected obstructed kidney', 'Bilateral obstruction', 'Solitary kidney', 'Acute kidney injury'],
    mustNotMissFlags: ['Pyelonephritis', 'Urosepsis', 'Aortic aneurysm mimicking renal colic'],
    specialNotes: ['Stone >10mm or symptomatic obstruction justifies intervention', 'Infected obstructed kidney (pyonephrosis) is urological emergency — document fever + obstruction combination'],
    admissionJustificationTemplate: 'Patient presents with renal colic with USG/CT confirming {stone_location} calculus of {stone_size}mm. {hydronephrosis_grade} hydronephrosis with {obstruction_degree} obstruction. Creatinine {creatinine}. {infection_status}. {intervention_planned} required in inpatient setting for {indication}.'
  },

  {
    code: 'N40.1',
    description: 'Benign prostatic hyperplasia with lower urinary tract symptoms',
    commonName: 'BPH (Enlarged Prostate)',
    specialty: 'Urology',
    subcategory: 'Prostate',
    typicalLOS: { min: 3, max: 7, average: 4 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['60.29'],
    costEstimate: {
      generalWard: { min: 40000, max: 80000 },
      privateRoom: { min: 70000, max: 150000 },
      icu: { min: 0, max: 0 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'UR-1005',
    pmjayPackageRate: 18000,
    daycareEligible: false,
    commonTPAQueries: [
      'USG showing Prostate volume',
      'PVR (Post-void residual) volume',
      'IPSS (International Prostate Symptom Score)',
      'PSA (Prostate Specific Antigen) to rule out malignancy',
      'Uroflowmetry report'
    ],
    highRejectionRisk: false,
    rejectionReasons: [],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'prostate_usg', name: 'USG Pelvis showing Prostate Volume and PVR', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'psa_report', name: 'PSA Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'uroflowmetry', name: 'Uroflowmetry Report (Qmax)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Prostate volume >50cc', 'PVR >100ml', 'Acute urinary retention', 'Recurrent UTIs', 'Hematuria'],
    mustNotMissFlags: ['Prostate Cancer', 'Urethral stricture', 'Neurogenic bladder'],
    specialNotes: ['TURP (Transurethral Resection of Prostate) is the standard surgical intervention'],
    admissionJustificationTemplate: 'Patient presents with severe LUTS. USG shows prostate volume {volume}cc and PVR {pvr}ml. PSA {psa}. {retention_status}. Inpatient TURP and stabilization required.'
  },

  {
    code: 'N10',
    description: 'Acute tubulo-interstitial nephritis',
    commonName: 'Acute Pyelonephritis (Kidney Infection)',
    specialty: 'Urology',
    subcategory: 'Infection',
    typicalLOS: { min: 3, max: 7, average: 5 },
    admissionType: 'emergency',
    wardType: 'any',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 15000, max: 40000 },
      privateRoom: { min: 30000, max: 80000 },
      icu: { min: 60000, max: 150000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'UR-1010',
    pmjayPackageRate: 9000,
    daycareEligible: false,
    commonTPAQueries: [
      'Urine culture and sensitivity',
      'USG KUB ruling out obstruction/stones',
      'WBC count and CRP',
      'Fever chart'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Simple UTI manageable on OPD antibiotics'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'urine_culture_pyelo', name: 'Urine Culture & Sensitivity Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'usg_kub_pyelo', name: 'USG KUB Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [],
    severityMarkers: ['High fever / Chills', 'Flank pain', 'Urosepsis signs', 'Diabetes co-morbidity', 'Solitary kidney'],
    mustNotMissFlags: ['Perinephric abscess', 'Renal papillary necrosis', 'Emphysematous pyelonephritis (Emergency)'],
    specialNotes: ['Pyelo in diabetics is very high risk — document blood sugar control'],
    admissionJustificationTemplate: 'Patient presents with high fever, chills, and flank pain. Urine culture shows {organism}. WBC {wbc}. {sepsis_status}. Inpatient IV antibiotics and monitoring required.'
  },

  {
    code: 'N43.3',
    description: 'Hydrocele, unspecified',
    commonName: 'Hydrocele',
    specialty: 'Urology',
    subcategory: 'Scrotal',
    typicalLOS: { min: 1, max: 3, average: 2 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['61.2'],
    costEstimate: {
      generalWard: { min: 15000, max: 35000 },
      privateRoom: { min: 25000, max: 60000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 12000, max: 25000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'UR-1015',
    pmjayPackageRate: 7500,
    daycareEligible: true,
    commonTPAQueries: [
      'USG Scrotum confirming hydrocele',
      'Was it congenital or acquired?',
      'Impact on daily activities'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Small hydrocele without symptoms'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'usg_scrotum', name: 'USG Scrotum Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [],
    severityMarkers: ['Large size causing discomfort', 'Infected hydrocele (Pyocele)', 'Associated hernia'],
    mustNotMissFlags: ['Testicular Tumor', 'Epididymitis', 'Torsion'],
    specialNotes: ['Lord\'s plication or Jaboulay\'s procedure are standard techniques'],
    admissionJustificationTemplate: 'Patient presents with progressive scrotal swelling. USG confirms large hydrocele. {complaints}. Inpatient / Daycare eversion of sac (Hydrocelectomy) required.'
  },

  {
    code: 'N47.1',
    description: 'Phimosis',
    commonName: 'Phimosis',
    specialty: 'Urology',
    subcategory: 'Penile',
    typicalLOS: { min: 1, max: 1, average: 1 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['64.0'],
    costEstimate: {
      generalWard: { min: 10000, max: 25000 },
      privateRoom: { min: 18000, max: 40000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 8000, max: 18000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'UR-1016',
    pmjayPackageRate: 5000,
    daycareEligible: true,
    commonTPAQueries: [
      'Grade of phimosis',
      'History of recurrent balanitis',
      'Difficulty in voiding'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Purely for hygiene without complication documentation'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [],
    recommendedDocuments: [],
    severityMarkers: ['Recurrent balanoposthitis', 'Paraphimosis history', 'Balantis xerotica obliterans (BXO)'],
    mustNotMissFlags: ['Penile Cancer', 'Paraphimosis (Emergency)'],
    specialNotes: ['Document recurrent infections to justify surgery to TPA'],
    admissionJustificationTemplate: 'Patient presents with severe phimosis and history of {recurrent_infections}. {voiding_difficulty}. Inpatient / Daycare circumcision required.'
  },

  // ══════════════════════════════════════════════════════════════
  // SPECIALTY 7: OBSTETRICS & GYNECOLOGY
  // ══════════════════════════════════════════════════════════════

  {
    code: 'O82',
    description: 'Encounter for cesarean delivery without indication',
    commonName: 'Caesarean Section (LSCS)',
    specialty: 'Obstetrics & Gynecology',
    subcategory: 'Obstetric Procedures',
    typicalLOS: { min: 3, max: 5, average: 4 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['74.1', '74.99'],
    costEstimate: {
      generalWard: { min: 35000, max: 90000 },
      privateRoom: { min: 60000, max: 180000 },
      icu: { min: 100000, max: 250000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'OB-1011',
    pmjayPackageRate: 9000,
    daycareEligible: false,
    commonTPAQueries: [
      'What was the indication for LSCS vs normal delivery?',
      'Antenatal records from beginning of pregnancy',
      'Baby birth record and weight',
      'Blood group of mother and baby',
      'OT notes with documented LSCS indication'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['LSCS indication not documented — TPA may query elective LSCS', 'Missing antenatal records', 'Baby details missing'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'antenatal_records', name: 'Antenatal Case Notes (complete pregnancy follow-up)', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Pregnancy complications history not documented' },
      { id: 'lscs_indication', name: 'LSCS Indication Documentation in OT Notes', category: 'operative', mandatory: true, tpaQueryIfMissing: 'Surgical indication not documented — LSCS may be classified as elective by TPA' },
      { id: 'baby_details', name: 'Baby Birth Record (weight, APGAR, date/time)', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Delivery outcome not documented' },
      { id: 'blood_group', name: 'Blood Group — Mother and Baby', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Rh incompatibility not assessed' },
      { id: 'usg_obstetric', name: 'Obstetric USG Reports (dating, anomaly, growth)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Fetal wellbeing and placental assessment not documented' }
    ],
    recommendedDocuments: [
      { id: 'ctg', name: 'CTG (Cardiotocography) — if fetal distress indication', category: 'investigation', mandatory: false, whenRequired: 'if fetal distress was indication', tpaQueryIfMissing: 'Fetal distress not objectively documented' }
    ],
    severityMarkers: ['Fetal distress on CTG', 'Placenta previa', 'Abruptio placentae', 'Failed progress of labour', 'Previous LSCS'],
    mustNotMissFlags: ['PPH (Post-Partum Hemorrhage)', 'Uterine rupture', 'Shoulder dystocia'],
    specialNotes: ['LSCS indication is the most scrutinized OB claim — document it explicitly and unambiguously in OT notes', 'Previous LSCS is a valid indication — mention scar count', 'PPH: document blood loss estimation and management steps'],
    admissionJustificationTemplate: 'Patient at {gestational_age} weeks gestation admitted for LSCS. Indication: {lscs_indication}. {prior_lscs}. {maternal_complications}. Fetal status: {fetal_status}. Emergency/elective LSCS performed under {anaesthesia} anaesthesia. Baby delivered — weight {baby_weight}g, APGAR {apgar_1}/{apgar_5}.'
  },

  {
    code: 'N83.20',
    description: 'Unspecified ovarian cysts',
    commonName: 'Ovarian Cyst (with Torsion / Surgery)',
    specialty: 'Obstetrics & Gynecology',
    subcategory: 'Gynecological Surgery',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['65.29', '65.25'],
    costEstimate: {
      generalWard: { min: 30000, max: 80000 },
      privateRoom: { min: 55000, max: 150000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 25000, max: 60000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'GY-1009',
    pmjayPackageRate: 13000,
    daycareEligible: true,
    commonTPAQueries: [
      'USG pelvis confirming cyst with size',
      'CA-125 if malignancy suspected',
      'Was torsion or rupture present? Emergency vs elective',
      'Histopathology report post-surgery'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Functional cysts <5cm — OPD management expected by TPA'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'usg_pelvis', name: 'USG Pelvis (TV/TA) with Cyst Characteristics', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Cyst confirmation and malignancy risk not documented' },
      { id: 'ca125', name: 'CA-125 (if malignancy features on USG)', category: 'investigation', mandatory: false, whenRequired: 'if complex cyst features', tpaQueryIfMissing: 'Malignancy risk not assessed' },
      { id: 'hpe_ovary', name: 'Histopathology Report of Specimen', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Nature of cyst not confirmed post-surgery' },
      { id: 'ot_notes_ovary', name: 'OT Notes (approach — laparoscopic or open)', category: 'operative', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [],
    severityMarkers: ['Torsion signs (acute onset pain, nausea)', 'Rupture with haemoperitoneum', 'Size >10cm', 'Complex/septated features', 'Rapidly growing'],
    mustNotMissFlags: ['Ovarian malignancy', 'Ectopic pregnancy', 'Appendicitis'],
    specialNotes: ['Torsion is surgical emergency — time of symptom onset to surgery must be documented'],
    admissionJustificationTemplate: 'Patient presents with {symptoms} with USG pelvis confirming {cyst_type} ovarian cyst of {size}cm on {side} ovary. {torsion_features}. {malignancy_risk}. Surgical intervention (laparoscopic cystectomy/oophorectomy) indicated for {indication}.'
  },

  {
    code: 'D25.9',
    description: 'Leiomyoma of uterus, unspecified',
    commonName: 'Uterine Fibroids (Hysterectomy)',
    specialty: 'Obstetrics & Gynecology',
    subcategory: 'Gynecological Surgery',
    typicalLOS: { min: 3, max: 7, average: 4 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['68.4', '68.3'],
    costEstimate: {
      generalWard: { min: 40000, max: 100000 },
      privateRoom: { min: 70000, max: 200000 },
      icu: { min: 0, max: 0 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'GY-1001',
    pmjayPackageRate: 20000,
    daycareEligible: false,
    commonTPAQueries: [
      'USG/MRI showing fibroid size and location',
      'Hemoglobin levels (anemia due to heavy bleeding)',
      'Pressure symptoms (bladder/rectum)',
      'Failed conservative (medication) therapy'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Small asymptomatic fibroids'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'usg_fibroid', name: 'USG Pelvis showing size and number of fibroids', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'hb_fibroid', name: 'Hemoglobin Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'mri_pelvis_fibroid', name: 'MRI Pelvis', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Large size >10cm', 'Severe anemia (Hb <8)', 'Pressure symptoms on ureter', 'Rapid growth (Malignancy risk)', 'Submucosal location'],
    mustNotMissFlags: ['Uterine Sarcoma', 'Adenomyosis', 'Endometrial hyperplasia'],
    specialNotes: ['Laparoscopic Hysterectomy (TLH) costs are usually 30-50% higher than open'],
    admissionJustificationTemplate: 'Patient presents with heavy menstrual bleeding and pressure symptoms. USG shows {fibroid_count} fibroids, largest {size}cm. Hb {hb}. {conservative_failed}. Inpatient {procedure_type} required for definitive management.'
  },

  {
    code: 'O00.9',
    description: 'Ectopic pregnancy, unspecified',
    commonName: 'Ectopic Pregnancy',
    specialty: 'Obstetrics & Gynecology',
    subcategory: 'Obstetric Emergencies',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'moderate',
    surgeryRequired: true,
    procedureCodes: ['66.01', '66.02'],
    costEstimate: {
      generalWard: { min: 35000, max: 80000 },
      privateRoom: { min: 60000, max: 150000 },
      icu: { min: 100000, max: 250000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'OB-1005',
    pmjayPackageRate: 15000,
    daycareEligible: false,
    commonTPAQueries: [
      'USG showing adnexal mass and empty uterus',
      'Beta-hCG levels',
      'Presence of free fluid (hemoperitoneum)',
      'Clinical status (BP/Pulse)'
    ],
    highRejectionRisk: false,
    rejectionReasons: [],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'usg_ectopic', name: 'USG Pelvis confirming Ectopic Gestation', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' },
      { id: 'bhcg_report', name: 'Serial Beta-hCG levels', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [],
    severityMarkers: ['Ruptured ectopic', 'Hemoperitoneum', 'Hypovolemic shock', 'Beta-hCG >5000'],
    mustNotMissFlags: ['Appendicitis', 'Ovarian torsion', 'Ruptured corpus luteum cyst'],
    specialNotes: ['Ruptured ectopic is a life-threatening emergency — document time of diagnosis to surgery'],
    admissionJustificationTemplate: 'Patient presents with acute abdominal pain and positive pregnancy test. USG confirms {location} ectopic pregnancy with {rupture_status}. Beta-hCG {bhcg}. {shock_signs}. Emergency inpatient surgical management (Salpingectomy) required.'
  },

  {
    code: 'N73.9',
    description: 'Female pelvic inflammatory disease, unspecified',
    commonName: 'PID (Pelvic Inflammatory Disease)',
    specialty: 'Obstetrics & Gynecology',
    subcategory: 'Infection',
    typicalLOS: { min: 2, max: 5, average: 3 },
    admissionType: 'both',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: [],
    costEstimate: {
      generalWard: { min: 15000, max: 35000 },
      privateRoom: { min: 25000, max: 60000 },
      icu: { min: 0, max: 0 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'GY-1015',
    pmjayPackageRate: 8000,
    daycareEligible: false,
    commonTPAQueries: [
      'USG findings (Free fluid, TO mass)',
      'Cervical motion tenderness documentation',
      'High vaginal swab (HVS) results',
      'WBC count and fever'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Vague pelvic pain without objective markers (OPD manage)'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'usg_pid', name: 'USG Pelvis Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'hvs_pid', name: 'High Vaginal Swab Culture', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Tubo-ovarian (TO) abscess', 'High fever >102F', 'Unable to tolerate oral intake', 'Pregnancy complication', 'Severe peritoneal signs'],
    mustNotMissFlags: ['Ectopic pregnancy', 'Appendicitis', 'Endometriosis exacerbation'],
    specialNotes: ['Admission justified if outpatient antibiotics fail or if TO abscess suspected'],
    admissionJustificationTemplate: 'Patient presents with severe pelvic pain and fever. Examination shows {tenderness_type}. USG shows {usg_findings}. {abscess_flag}. Inpatient IV antibiotics and stabilization required.'
  },

  // ══════════════════════════════════════════════════════════════
  // SPECIALTY 8: RESPIRATORY
  // ══════════════════════════════════════════════════════════════

  {
    code: 'J44.1',
    description: 'Chronic obstructive pulmonary disease with acute exacerbation',
    commonName: 'COPD Exacerbation',
    specialty: 'Respiratory',
    subcategory: 'Obstructive Airway Disease',
    typicalLOS: { min: 4, max: 10, average: 6 },
    admissionType: 'emergency',
    wardType: 'any',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: ['96.72'],
    costEstimate: {
      generalWard: { min: 25000, max: 70000 },
      privateRoom: { min: 45000, max: 130000 },
      icu: { min: 80000, max: 220000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'RS-1007',
    pmjayPackageRate: 10500,
    daycareEligible: false,
    commonTPAQueries: [
      'Spirometry confirming COPD diagnosis',
      'ABG report with pH, pCO2, pO2',
      'Was NIV/BiPAP required?',
      'Previous COPD admissions and current GOLD stage'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Mild exacerbation treated as emergency — OPD-manageable per TPA', 'Missing spirometry baseline'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'spirometry', name: 'Spirometry Report (baseline FEV1/FVC ratio)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'COPD diagnosis not pulmonary function test confirmed — GOLD stage cannot be determined' },
      { id: 'abg_copd', name: 'Arterial Blood Gas Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Type 2 respiratory failure / hypercapnia not documented' },
      { id: 'cxr_copd', name: 'Chest X-Ray (hyperinflation, infiltrates)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Precipitating cause not investigated' },
      { id: 'niv_record', name: 'NIV/BiPAP Usage Record with Settings', category: 'clinical', mandatory: false, whenRequired: 'if NIV used', tpaQueryIfMissing: 'NIV usage and response not documented' }
    ],
    recommendedDocuments: [
      { id: 'sputum_copd', name: 'Sputum Culture (if infective exacerbation)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['pH <7.35', 'pCO2 >50', 'SpO2 <88%', 'GOLD Stage 3-4', 'Use of accessory muscles', 'Cyanosis'],
    mustNotMissFlags: ['Pneumothorax', 'Pulmonary embolism', 'Cardiac failure as precipitant', 'Pneumonia'],
    specialNotes: ['Spirometry is the diagnostic gold standard — without it, TPAs may question the COPD diagnosis itself', 'Document GOLD stage explicitly in the pre-auth'],
    admissionJustificationTemplate: 'Known COPD patient (GOLD Stage {gold_stage}, FEV1 {fev1}% predicted) presents with acute exacerbation precipitated by {precipitant}. SpO2 {spo2}% on room air, RR {rr}/min. ABG shows pH {ph}, pCO2 {pco2}. {niv_statement}. Bronchodilator nebulization, systemic corticosteroids, antibiotics, and {niv_statement} required in inpatient setting.'
  },

  {
    code: 'J45.51',
    description: 'Severe persistent asthma with acute exacerbation',
    commonName: 'Acute Severe Asthma / Status Asthmaticus',
    specialty: 'Respiratory',
    subcategory: 'Obstructive Airway Disease',
    typicalLOS: { min: 3, max: 7, average: 4 },
    admissionType: 'emergency',
    wardType: 'any',
    icuProbability: 'moderate',
    surgeryRequired: false,
    procedureCodes: ['93.91', '96.72'],
    costEstimate: {
      generalWard: { min: 20000, max: 55000 },
      privateRoom: { min: 35000, max: 100000 },
      icu: { min: 70000, max: 180000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'RS-1009',
    pmjayPackageRate: 9200,
    daycareEligible: false,
    commonTPAQueries: [
      'PEFR at admission (pre-bronchodilator)',
      'SpO2 and ABG if severe',
      'Was IV magnesium or aminophylline required?',
      'Previous asthma admissions in 12 months'
    ],
    highRejectionRisk: true,
    rejectionReasons: ['Mild-moderate attack — TPA questions inpatient vs OPD nebulization', 'Missing severity documentation'],
    preAuthRequired: true,
    preAuthUrgency: 'urgent',
    mandatoryDocuments: [
      { id: 'pefr', name: 'Peak Flow (PEFR) — Pre and Post Bronchodilator', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Objective severity of asthma attack not documented' },
      { id: 'spo2_asthma', name: 'SpO2 Monitoring Record', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Hypoxemia severity not documented' }
    ],
    recommendedDocuments: [
      { id: 'abg_asthma', name: 'ABG (if PEFR <33% or SpO2 <92%)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['PEFR <33% predicted', 'SpO2 <92%', 'Silent chest', 'Unable to speak in sentences', 'HR >120', 'RR >30'],
    mustNotMissFlags: ['Foreign body aspiration', 'Vocal cord dysfunction', 'Anaphylaxis', 'Pulmonary embolism'],
    specialNotes: ['Document British Thoracic Society severity classification (moderate/severe/life-threatening) explicitly', 'PEFR is the objective severity marker — document it'],
    admissionJustificationTemplate: 'Patient presents with severe asthma exacerbation. PEFR {pefr}% predicted ({pefr_absolute} L/min). SpO2 {spo2}% on {o2_delivery}. BTS Classification: {bts_severity}. {iv_medications}. Multiple nebulizations in {location} without adequate response. Inpatient IV bronchodilator therapy and respiratory monitoring required.'
  },

  // ══════════════════════════════════════════════════════════════
  // SPECIALTY 9: SURGERY
  // ══════════════════════════════════════════════════════════════

  {
    code: 'K35.80',
    description: 'Acute appendicitis without abscess',
    commonName: 'Acute Appendicitis',
    specialty: 'Surgery',
    subcategory: 'Abdominal Emergency',
    typicalLOS: { min: 3, max: 6, average: 4 },
    admissionType: 'emergency',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['47.01', '47.09'],
    costEstimate: {
      generalWard: { min: 30000, max: 75000 },
      privateRoom: { min: 55000, max: 140000 },
      icu: { min: 80000, max: 200000 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'SG-1001',
    pmjayPackageRate: 18500,
    daycareEligible: false,
    commonTPAQueries: [
      'USG abdomen for appendix visualization',
      'Alvarado score or clinical diagnosis documentation',
      'Histopathology of appendix specimen',
      'Was laparoscopic or open approach used?'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Missing histopathology', 'Normal appendix on histology — TPA may query surgical necessity'],
    preAuthRequired: true,
    preAuthUrgency: 'emergency',
    mandatoryDocuments: [
      { id: 'usg_appendix', name: 'USG Abdomen (appendix visualization attempt)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Radiological workup not performed' },
      { id: 'cbc_appendix', name: 'CBC (TLC and differential for leukocytosis)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Inflammatory response not hematologically documented' },
      { id: 'hpe_appendix', name: 'Histopathology Report of Appendix Specimen', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Appendicitis not histologically confirmed — surgical necessity questioned' },
      { id: 'ot_notes_appendix', name: 'OT Notes (findings — gangrenous / perforated / simple)', category: 'operative', mandatory: true, tpaQueryIfMissing: 'Intraoperative findings not documented' }
    ],
    recommendedDocuments: [
      { id: 'ct_appendix', name: 'CT Abdomen (if clinical/USG inconclusive)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Alvarado score ≥7', 'Perforated appendix', 'Peritonitis', 'TLC >18,000', 'Appendix >6mm with periappendiceal fat stranding'],
    mustNotMissFlags: ['Ovarian pathology (females)', 'Meckel\'s diverticulum', 'Mesenteric adenitis', 'Crohn\'s disease'],
    specialNotes: ['Histopathology is mandatory — a claim can be challenged if appendix was normal histologically', 'Document Alvarado score at admission for clinical decision justification'],
    admissionJustificationTemplate: 'Patient presents with classical features of acute appendicitis: right iliac fossa pain, nausea, fever, and guarding. Alvarado score {alvarado}. TLC {tlc} with neutrophilia. USG shows {usg_findings}. Emergency appendicectomy (laparoscopic/open) performed. Intraoperative findings: {io_findings}. Histopathology confirms {hpe_result}.'
  },

  {
    code: 'K40.30',
    description: 'Unilateral inguinal hernia, without obstruction or gangrene',
    commonName: 'Inguinal Hernia Repair',
    specialty: 'Surgery',
    subcategory: 'Hernia Surgery',
    typicalLOS: { min: 1, max: 3, average: 2 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['53.00', '53.01'],
    costEstimate: {
      generalWard: { min: 20000, max: 55000 },
      privateRoom: { min: 35000, max: 95000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 18000, max: 45000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'SG-1005',
    pmjayPackageRate: 12000,
    daycareEligible: true,
    commonTPAQueries: [
      'Was this obstructed / strangulated or simple hernia?',
      'Mesh used? Provide mesh sticker/invoice',
      'Was emergency or elective surgery?',
      'Clinical examination findings (reducible vs irreducible)'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Daycare-eligible condition claimed as inpatient without justification', 'Missing mesh invoice'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'clinical_hernia', name: 'Clinical Examination Note (hernia type, reducibility)', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Hernia characteristics not clinically documented' },
      { id: 'mesh_sticker', name: 'Mesh Invoice / Sticker (if mesh used)', category: 'implant', mandatory: false, whenRequired: 'if synthetic mesh used', tpaQueryIfMissing: 'Mesh cost not verifiable' },
      { id: 'ot_notes_hernia', name: 'OT Notes', category: 'operative', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'usg_hernia', name: 'USG Groin (if diagnosis uncertain)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Obstruction', 'Strangulation', 'Irreducibility', 'Richter\'s hernia'],
    mustNotMissFlags: ['Strangulated hernia (surgical emergency)', 'Femoral hernia (higher strangulation risk)', 'Lymph node / lipoma mimicking hernia'],
    specialNotes: ['Obstructed/strangulated hernia is emergency — document onset of obstruction and time to surgery', 'Laparoscopic vs open approach should be documented'],
    admissionJustificationTemplate: 'Patient presents with {hernia_type} inguinal hernia, {reducibility}. {obstruction_strangulation}. Surgical repair indicated for {indication}. {mesh_plan}. {approach} hernia repair performed.'
  },

  // ══════════════════════════════════════════════════════════════
  // SPECIALTY 10: ONCOLOGY
  // ══════════════════════════════════════════════════════════════

  {
    code: 'C50.919',
    description: 'Malignant neoplasm of unspecified site of unspecified female breast',
    commonName: 'Breast Cancer',
    specialty: 'Oncology',
    subcategory: 'Solid Tumors — Breast',
    typicalLOS: { min: 3, max: 8, average: 5 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: true,
    procedureCodes: ['85.43', '85.48', '85.36'],
    costEstimate: {
      generalWard: { min: 80000, max: 250000 },
      privateRoom: { min: 150000, max: 450000 },
      icu: { min: 0, max: 0 },
      daycare: null
    },
    pmjayEligible: true,
    pmjayHBPCode: 'OC-1003',
    pmjayPackageRate: 55000,
    daycareEligible: false,
    commonTPAQueries: [
      'Histopathology confirming malignancy',
      'Staging workup (CT chest/abdomen/pelvis, bone scan)',
      'FNAC or core biopsy report',
      'Tumour markers (CA 15-3, CEA)',
      'Multidisciplinary team (MDT) treatment plan'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Incomplete staging workup', 'Missing biopsy confirmation'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'biopsy_breast', name: 'Core Biopsy or FNAC Report with ER/PR/HER2 status', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Malignancy not histologically confirmed — surgical necessity questioned' },
      { id: 'mammo_usg', name: 'Mammography + USG Breast (BIRADS classification)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Radiological staging not documented' },
      { id: 'staging_ct', name: 'CT Chest/Abdomen/Pelvis (staging)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Distant metastasis not assessed — stage undetermined' },
      { id: 'mdt_plan', name: 'MDT Meeting Minutes / Treatment Plan', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Treatment not evidence-based multidisciplinary decision' },
      { id: 'ot_notes_breast', name: 'OT Notes with Margin Status', category: 'operative', mandatory: true, tpaQueryIfMissing: '' }
    ],
    recommendedDocuments: [
      { id: 'bone_scan', name: 'Bone Scan (Stage III-IV)', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' },
      { id: 'tumour_markers', name: 'CA 15-3, CEA', category: 'investigation', mandatory: false, tpaQueryIfMissing: '' }
    ],
    severityMarkers: ['Stage III-IV', 'HER2 positive', 'Triple negative', 'Inflammatory breast cancer', 'Lymph node involvement'],
    mustNotMissFlags: ['Phyllodes tumour', 'Metastatic disease from other primary', 'Lymphoma'],
    specialNotes: ['ER/PR/HER2 receptor status is required by TPA to assess chemotherapy/targeted therapy need', 'All oncology claims require MDT documentation — this is standard TPA requirement'],
    admissionJustificationTemplate: 'Patient with histologically confirmed {histology} breast carcinoma, {er_pr_her2} status, Stage {stage}. MDT recommendation: {mdt_plan}. {surgery_type} performed as part of multimodality treatment plan. Complete staging workup done confirming {staging_findings}.'
  },

  {
    code: 'Z51.11',
    description: 'Encounter for antineoplastic chemotherapy',
    commonName: 'Chemotherapy Administration',
    specialty: 'Oncology',
    subcategory: 'Cancer Treatment',
    typicalLOS: { min: 1, max: 5, average: 2 },
    admissionType: 'elective',
    wardType: 'general',
    icuProbability: 'low',
    surgeryRequired: false,
    procedureCodes: ['99.25'],
    costEstimate: {
      generalWard: { min: 30000, max: 150000 },
      privateRoom: { min: 55000, max: 280000 },
      icu: { min: 0, max: 0 },
      daycare: { min: 25000, max: 120000 }
    },
    pmjayEligible: true,
    pmjayHBPCode: 'OC-1021',
    pmjayPackageRate: 35000,
    daycareEligible: true,
    commonTPAQueries: [
      'Oncologist prescription with cycle number and regimen',
      'Primary cancer diagnosis and histopathology',
      'Pre-chemo CBC, LFT, RFT clearance',
      'Drug invoice — branded vs generic',
      'Pre-authorization for each chemotherapy cycle'
    ],
    highRejectionRisk: false,
    rejectionReasons: ['Missing oncologist prescription', 'Drug not on approved formulary', 'Pre-auth not renewed for each cycle'],
    preAuthRequired: true,
    preAuthUrgency: 'routine',
    mandatoryDocuments: [
      { id: 'onco_prescription', name: 'Oncologist Prescription with Cycle, Regimen, BSA Calculation', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Chemotherapy not physician-prescribed with dosing rationale' },
      { id: 'primary_ca_diagnosis', name: 'Primary Cancer Histopathology Report', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Underlying malignancy not confirmed' },
      { id: 'pre_chemo_labs', name: 'Pre-Chemotherapy Labs (CBC, LFT, RFT, ECHO if anthracycline)', category: 'investigation', mandatory: true, tpaQueryIfMissing: 'Organ function clearance for chemotherapy not documented' },
      { id: 'drug_invoice_chemo', name: 'Chemotherapy Drug Invoice (with batch number)', category: 'clinical', mandatory: true, tpaQueryIfMissing: 'Drug cost not verifiable' }
    ],
    recommendedDocuments: [],
    severityMarkers: ['Febrile neutropenia', 'Grade 3-4 toxicity', 'Dose reduction required'],
    mustNotMissFlags: ['Febrile neutropenia (oncological emergency)', 'Drug toxicity', 'Disease progression on current regimen'],
    specialNotes: ['Pre-authorization must be renewed for each chemotherapy cycle — one PA for multiple cycles is insufficient for most TPAs', 'BSA-based dosing calculation must be documented by oncologist'],
    admissionJustificationTemplate: 'Patient with {primary_cancer} on cycle {cycle_number} of {regimen} chemotherapy. BSA {bsa} m², doses: {drug_doses}. Pre-chemotherapy labs within acceptable range: {lab_summary}. Chemotherapy administered as per MDT protocol. {cycle_rationale}.'
  }

];
// Exact match or prefix match
export const getConditionByCode = (code: string): ICD10Condition | undefined => {
  const clean = code.trim().toUpperCase();
  return ICD10_MASTER_DB.find(c => 
    c.code === clean || 
    clean.startsWith(c.code.split('.')[0])
  );
};

export const getConditionsBySpecialty = (specialty: MedicalSpecialty): ICD10Condition[] => {
  return ICD10_MASTER_DB.filter(c => c.specialty === specialty);
};

// Search by code, common name, or description
export const searchConditions = (query: string): ICD10Condition[] => {
  const q = query.toLowerCase();
  return ICD10_MASTER_DB.filter(c =>
    c.code.toLowerCase().includes(q) ||
    c.commonName.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q)
  );
};

export const getDocumentChecklist = (
  icd10Code: string,
  claimMode: 'cashless' | 'reimbursement'
): { mandatory: DocumentRequirement[]; recommended: DocumentRequirement[]; reimbursementExtra: DocumentRequirement[] } => {
  const condition = getConditionByCode(icd10Code);
  
  const reimbursementExtra: DocumentRequirement[] = [
    { id: 'claim_form_signed', name: 'Claim Form — Signed by Insured + Treating Doctor', category: 'administrative', mandatory: true, tpaQueryIfMissing: 'Claim form not executed — reimbursement cannot be processed' },
    { id: 'original_bills', name: 'ALL Original Bills (hospital, pharmacy, investigations) — no photocopies', category: 'administrative', mandatory: true, tpaQueryIfMissing: 'Original documents required for reimbursement — photocopies rejected' },
    { id: 'kyc_docs', name: 'KYC — Aadhar / PAN of Insured', category: 'administrative', mandatory: true, tpaQueryIfMissing: 'Identity verification required' },
    { id: 'neft_details', name: 'NEFT Details (Account No + IFSC + cancelled cheque)', category: 'administrative', mandatory: true, tpaQueryIfMissing: 'Payment cannot be processed without bank details' },
    { id: 'no_other_insurance', name: 'Declaration of No Duplicate Claim from Other Insurer', category: 'administrative', mandatory: true, tpaQueryIfMissing: 'Duplicate claim risk not ruled out' }
  ];

  if (!condition) {
    return {
      mandatory: [],
      recommended: [],
      reimbursementExtra: claimMode === 'reimbursement' ? reimbursementExtra : []
    };
  }

  return {
    mandatory: condition.mandatoryDocuments,
    recommended: condition.recommendedDocuments,
    reimbursementExtra: claimMode === 'reimbursement' ? reimbursementExtra : []
  };
};

export const estimateCost = (
  icd10Code: string,
  wardType: 'general' | 'private' | 'icu',
  los: number
): { min: number; max: number; average: number; breakdown: Record<string, number> } => {
  const condition = getConditionByCode(icd10Code);
  if (!condition) return { min: 0, max: 0, average: 0, breakdown: {} };

  const range = wardType === 'icu'
    ? condition.costEstimate.icu
    : wardType === 'private'
    ? condition.costEstimate.privateRoom
    : condition.costEstimate.generalWard;

  if (!range) return { min: 0, max: 0, average: 0, breakdown: {} };

  // Scale by LOS vs average LOS
  const losRatio = los / condition.typicalLOS.average;
  const scaledMin = Math.round(range.min * losRatio);
  const scaledMax = Math.round(range.max * losRatio);

  return {
    min: scaledMin,
    max: scaledMax,
    average: Math.round((scaledMin + scaledMax) / 2),
    breakdown: {
      roomCharges: Math.round(scaledMax * 0.30),
      consultantFees: Math.round(scaledMax * 0.10),
      nursing: Math.round(scaledMax * 0.05),
      investigations: Math.round(scaledMax * 0.15),
      medicines: Math.round(scaledMax * 0.25),
      procedures: Math.round(scaledMax * 0.10),
      miscellaneous: Math.round(scaledMax * 0.05),
    }
  };
};

export const predictTPAQueries = (icd10Code: string): string[] => {
  const condition = getConditionByCode(icd10Code);
  if (!condition) return [];
  return condition.commonTPAQueries;
};

export const getConditionByName = (name: string): ICD10Condition | undefined => {
  const lower = name.toLowerCase();
  return ICD10_MASTER_DB.find(c => 
    c.commonName.toLowerCase() === lower || 
    c.description.toLowerCase() === lower
  );
};

export const getSeverityMarkers = (icd10Code: string): string[] => {
  const condition = getConditionByCode(icd10Code);
  if (!condition) return [];
  return condition.severityMarkers;
};

export const getSpecialNotes = (icd10Code: string): string[] => {
  const condition = getConditionByCode(icd10Code);
  if (!condition) return [];
  return condition.specialNotes;
};

export const getAdmissionJustificationTemplate = (icd10Code: string): string => {
  const condition = getConditionByCode(icd10Code);
  return condition?.admissionJustificationTemplate || '';
};

export const isPMJAYEligible = (icd10Code: string): { eligible: boolean; hbpCode?: string; packageRate?: number } => {
  const condition = getConditionByCode(icd10Code);
  if (!condition) return { eligible: false };
  return {
    eligible: condition.pmjayEligible,
    hbpCode: condition.pmjayHBPCode,
    packageRate: condition.pmjayPackageRate
  };
};

export const isDaycareEligible = (icd10Code: string): boolean => {
  const condition = getConditionByCode(icd10Code);
  return condition?.daycareEligible || false;
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

  const condition = getConditionByCode(cleaned);
  const hasDecimal = cleaned.includes('.');
  
  if (condition && !hasDecimal && condition.code.includes('.')) {
    return {
      isValid: true,
      isBillable: false,
      originalCode: cleaned,
      suggestedCode: condition.code,
      suggestedDescription: condition.description,
      warningMessage: `"${cleaned}" is a category code. Indian TPAs require a billable subcategory code. Recommended: ${condition.code} — ${condition.description}`
    };
  }

  return {
    isValid: !!condition,
    isBillable: hasDecimal,
    originalCode: cleaned,
    suggestedCode: condition?.code || cleaned,
    suggestedDescription: condition?.description || '',
    warningMessage: condition ? (hasDecimal ? null : "Category code entered. Billable code preferred.") : "ICD-10 code not found in master database."
  };
};
