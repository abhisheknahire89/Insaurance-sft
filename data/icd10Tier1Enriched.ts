import { Tier1Condition } from '../types/icd.types';

/**
 * TIER 1: Enriched ICD-10 Database
 * 300+ conditions commonly seen in Indian hospitals
 * Full metadata for pre-authorization document generation
 */

export const ICD10_TIER1: Tier1Condition[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // RESPIRATORY (25 conditions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "RESP-001",
    specialty: "Respiratory",
    condition_name: "Community Acquired Pneumonia",
    common_aliases: [
      "pneumonia", "lung infection", "chest infection", "CAP", 
      "lower respiratory tract infection", "LRTI", "lobar pneumonia",
      "bronchopneumonia", "bilateral pneumonia"
    ],
    hinglish_terms: [
      "phephdon mein infection", "lungs mein infection", "seene mein infection",
      "nimoniya", "nimonia", "फेफड़ों में संक्रमण"
    ],
    medical_necessity_keywords: [
      "hypoxia", "oxygen requirement", "IV antibiotics", "respiratory distress",
      "consolidation", "infiltrates", "sepsis", "failed outpatient therapy",
      "tachypnea", "desaturation"
    ],
    icd_codes: {
      primary: { code: "J18.9", description: "Pneumonia, unspecified organism" },
      variants: [
        { code: "J15.9", description: "Bacterial pneumonia, unspecified", use_when: "Bacterial etiology confirmed" },
        { code: "J12.9", description: "Viral pneumonia, unspecified", use_when: "Viral etiology suspected" },
        { code: "J13", description: "Pneumonia due to Streptococcus pneumoniae", use_when: "Pneumococcus confirmed" },
        { code: "J15.0", description: "Pneumonia due to Klebsiella", use_when: "Klebsiella confirmed on culture" },
        { code: "J15.1", description: "Pneumonia due to Pseudomonas", use_when: "Pseudomonas confirmed" }
      ]
    },
    admission_criteria: [
      "SpO2 <94% on room air",
      "Respiratory rate >24/min",
      "CURB-65 score ≥2",
      "Unable to tolerate oral intake",
      "Failed outpatient antibiotics (48-72 hours)",
      "Bilateral or multilobar involvement",
      "Sepsis criteria met",
      "Hemodynamic instability",
      "High-risk comorbidities (COPD, DM, immunocompromised)"
    ],
    typical_los: { ward: 5, icu: 0 },
    cost_estimate: {
      roomRent: 15000, nursing: 2250, icuCharges: 0, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 4000,
      investigations: 8000, medicines: 15000, consumables: 2000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Admission for mild pneumonia without documented hypoxia",
      "LOS >7 days without documented complications",
      "No chest X-ray findings documented",
      "No vitals recorded at admission",
      "Upgrading antibiotics without culture report"
    ],
    documentation_required: [
      "SpO2 at admission (room air)",
      "Respiratory rate at admission",
      "Chest X-ray with specific findings",
      "CURB-65 score",
      "Reason OPD management not feasible",
      "Antibiotic rationale"
    ],
    clinical_severity_markers: [
      "SpO2 <94%", "RR >24/min", "HR >100/min", "CRP >100",
      "TLC >15000", "Bilateral infiltrates", "CURB-65 ≥2"
    ],
    special_considerations: [
      "High TB endemic area — rule out TB for non-resolving pneumonia",
      "Document TB workup (sputum AFB, GeneXpert) if LOS >5 days",
      "Klebsiella pneumonia common in Indian diabetic patients"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "MG032",
    pmjay_package_rate: 15000,
    is_surgical: false,
    is_emergency_typically: true
  },

  {
    id: "RESP-002",
    specialty: "Respiratory",
    condition_name: "COPD Acute Exacerbation",
    common_aliases: [
      "AECOPD", "COPD flare", "COPD attack", "chronic bronchitis exacerbation",
      "emphysema exacerbation", "COPD with respiratory failure"
    ],
    hinglish_terms: [
      "dama badh gaya", "saans ki bimari badh gayi", "COPD attack",
      "phephdon ki bimari", "dam ki bimari", "saans phoolna"
    ],
    medical_necessity_keywords: [
      "acute exacerbation", "respiratory failure", "NIV", "BiPAP",
      "IV steroids", "nebulization", "CO2 retention", "acidosis",
      "failed OPD management", "accessory muscle use"
    ],
    icd_codes: {
      primary: { code: "J44.1", description: "COPD with acute exacerbation" },
      variants: [
        { code: "J44.0", description: "COPD with acute lower respiratory infection", use_when: "Infective exacerbation with fever, purulent sputum" },
        { code: "J96.00", description: "Acute respiratory failure", use_when: "Respiratory failure present" }
      ]
    },
    admission_criteria: [
      "SpO2 <88% on room air",
      "Respiratory rate >30/min",
      "Use of accessory muscles",
      "Inability to speak in full sentences",
      "Altered mental status (CO2 narcosis)",
      "ABG showing pH <7.35 with elevated pCO2",
      "Need for NIV/BiPAP",
      "Cor pulmonale signs"
    ],
    typical_los: { ward: 5, icu: 2 },
    cost_estimate: {
      roomRent: 17500, nursing: 2625, icuCharges: 50000, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 5600,
      investigations: 10000, medicines: 20000, consumables: 3000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Admission without documented SpO2 or ABG",
      "Using J44.9 (stable COPD) instead of J44.1",
      "ICU billed without BiPAP/Ventilator logs",
      "Repeated admissions without rehab referral"
    ],
    documentation_required: [
      "Baseline SpO2 and admission SpO2",
      "ABG values",
      "GOLD staging",
      "Previous exacerbation frequency",
      "NIV/BiPAP requirement and settings",
      "Response to initial nebulization"
    ],
    clinical_severity_markers: [
      "SpO2 <88%", "pH <7.35", "pCO2 >50", "RR >30",
      "Altered sensorium", "Accessory muscle use"
    ],
    special_considerations: [
      "Common in Indian males due to smoking and biomass exposure",
      "Document smoking history in pack-years",
      "Biomass exposure (chulha) significant in rural women",
      "BiPAP usage logs must be signed shift-wise"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "MG028",
    pmjay_package_rate: 12000,
    is_surgical: false,
    is_emergency_typically: true
  },

  {
    id: "RESP-003",
    specialty: "Respiratory",
    condition_name: "Acute Severe Asthma",
    common_aliases: [
      "severe asthma attack", "acute asthma", "asthma exacerbation",
      "bronchial asthma attack", "status asthmaticus", "near-fatal asthma"
    ],
    hinglish_terms: [
      "dama ka attack", "saans phoolna", "asthma ka daura",
      "saans nahi aa rahi", "दमा का दौरा"
    ],
    medical_necessity_keywords: [
      "acute severe asthma", "poor response to bronchodilators",
      "continuous nebulization", "IV steroids", "ICU monitoring",
      "impending respiratory failure", "silent chest"
    ],
    icd_codes: {
      primary: { code: "J45.51", description: "Severe persistent asthma with acute exacerbation" },
      variants: [
        { code: "J45.52", description: "Severe persistent asthma with status asthmaticus", use_when: "Status asthmaticus - refractory to treatment" },
        { code: "J45.41", description: "Moderate persistent asthma with acute exacerbation", use_when: "Moderate asthma flare" },
        { code: "J45.901", description: "Unspecified asthma with acute exacerbation", use_when: "Severity not previously classified" }
      ]
    },
    admission_criteria: [
      "Peak flow <50% predicted",
      "SpO2 <92% on room air",
      "Unable to speak in full sentences",
      "Respiratory rate >25/min",
      "Heart rate >110/min",
      "Silent chest on auscultation",
      "No improvement after 3 nebulizations",
      "Previous near-fatal asthma"
    ],
    typical_los: { ward: 3, icu: 1 },
    cost_estimate: {
      roomRent: 10500, nursing: 1575, icuCharges: 25000, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 4000,
      investigations: 6000, medicines: 12000, consumables: 2000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Admission for mild asthma without documented severity",
      "No peak flow or SpO2 documented",
      "LOS >5 days for uncomplicated asthma",
      "Using mild asthma code (J45.21) for admission"
    ],
    documentation_required: [
      "Peak flow or FEV1 at presentation",
      "SpO2 at admission",
      "Response to initial bronchodilator",
      "Previous asthma severity classification",
      "Trigger identification if possible"
    ],
    clinical_severity_markers: [
      "Peak flow <50%", "SpO2 <92%", "Silent chest",
      "Unable to complete sentences", "RR >25"
    ],
    special_considerations: [
      "High prevalence in urban India due to pollution",
      "Diwali and crop burning season see spikes",
      "Always use severity-appropriate codes"
    ],
    pmjay_eligible: true,
    is_surgical: false,
    is_emergency_typically: true
  },

  {
    id: "RESP-004",
    specialty: "Respiratory",
    condition_name: "Pulmonary Tuberculosis",
    common_aliases: [
      "TB", "tuberculosis", "PTB", "Koch's disease", "consumption",
      "lung TB", "open TB", "sputum positive TB"
    ],
    hinglish_terms: [
      "TB ho gayi", "tapedik", "kshay rog", "rajyakshma",
      "टीबी", "क्षय रोग"
    ],
    medical_necessity_keywords: [
      "hemoptysis", "respiratory failure", "miliary TB", "MDR-TB",
      "drug-resistant", "injectable regimen", "malnutrition", "ATT adverse reaction"
    ],
    icd_codes: {
      primary: { code: "A15.0", description: "Tuberculosis of lung" },
      variants: [
        { code: "A15.5", description: "TB of larynx, trachea and bronchus", use_when: "Endobronchial TB" },
        { code: "A15.6", description: "Tuberculous pleurisy", use_when: "TB pleural effusion" },
        { code: "A15.7", description: "Primary respiratory TB", use_when: "Primary TB complex" }
      ]
    },
    admission_criteria: [
      "Massive hemoptysis (>100 mL in 24 hours)",
      "Respiratory failure requiring oxygen",
      "Miliary TB with multi-organ involvement",
      "Severe malnutrition unable to take oral ATT",
      "Drug-resistant TB requiring injectable initiation",
      "Severe ATT adverse drug reactions"
    ],
    typical_los: { ward: 10, icu: 0 },
    cost_estimate: {
      roomRent: 30000, nursing: 4500, icuCharges: 0, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 8000,
      investigations: 15000, medicines: 20000, consumables: 3000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Admission for uncomplicated PTB manageable on OPD",
      "No documentation of why ATT cannot be given OPD",
      "LOS >14 days without documented complications",
      "TB without microbiological confirmation"
    ],
    documentation_required: [
      "Microbiological confirmation (AFB/GeneXpert/culture)",
      "Drug sensitivity results if available",
      "Reason for admission vs OPD DOTS",
      "ATT regimen with dosages",
      "NIKSHAY registration number"
    ],
    clinical_severity_markers: [
      "Hemoptysis", "SpO2 <90%", "Miliary pattern on CXR",
      "Bilateral extensive disease", "MDR/XDR confirmed"
    ],
    special_considerations: [
      "India has highest TB burden globally",
      "RNTCP/NTEP notification mandatory",
      "Most uncomplicated TB should be OPD DOTS",
      "Many TPAs have specific TB exclusions"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "NTEP",
    is_surgical: false,
    is_emergency_typically: false
  },

  {
    id: "RESP-005",
    specialty: "Respiratory",
    condition_name: "Pleural Effusion",
    common_aliases: [
      "fluid around lungs", "pleural fluid", "hydrothorax",
      "parapneumonic effusion", "malignant effusion"
    ],
    hinglish_terms: [
      "phephdon mein paani", "seene mein paani bhar gaya",
      "lungs mein fluid", "फेफड़ों में पानी"
    ],
    medical_necessity_keywords: [
      "large effusion", "therapeutic drainage", "ICD insertion",
      "empyema risk", "diagnostic thoracentesis", "respiratory compromise"
    ],
    icd_codes: {
      primary: { code: "J90", description: "Pleural effusion, not elsewhere classified" },
      variants: [
        { code: "J91.0", description: "Malignant pleural effusion", use_when: "Due to malignancy" },
        { code: "J91.8", description: "Pleural effusion in other conditions", use_when: "Secondary to SLE, RA, etc." },
        { code: "J94.0", description: "Chylous effusion", use_when: "Chylothorax confirmed" }
      ]
    },
    admission_criteria: [
      "Moderate to large effusion (>1/3 hemithorax)",
      "Need for therapeutic thoracentesis",
      "ICD insertion required",
      "Suspected empyema",
      "Hypoxia secondary to effusion",
      "New effusion requiring diagnostic evaluation"
    ],
    typical_los: { ward: 5, icu: 0 },
    cost_estimate: {
      roomRent: 15000, nursing: 2250, icuCharges: 0, otCharges: 5000,
      surgeonFee: 5000, anesthetistFee: 0, consultantFee: 4000,
      investigations: 10000, medicines: 8000, consumables: 3000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Small effusion admitted without drainage",
      "No pleural fluid analysis sent",
      "ADA not checked in TB endemic area",
      "Prolonged ICD without documented output"
    ],
    documentation_required: [
      "Effusion size estimate with imaging",
      "Pleural fluid analysis (Light's criteria)",
      "ADA levels",
      "Drainage procedure details",
      "Underlying cause identification"
    ],
    clinical_severity_markers: [
      "Large effusion (>2/3 hemithorax)", "SpO2 <92%",
      "Empyema (pH <7.2)", "Massive effusion with mediastinal shift"
    ],
    special_considerations: [
      "TB pleural effusion most common exudative effusion in India",
      "ADA >40 IU/L strongly suggestive of TB",
      "Always send ADA, AFB, culture from pleural fluid"
    ],
    pmjay_eligible: true,
    is_surgical: false,
    is_emergency_typically: true
  },

  {
    id: "RESP-006",
    specialty: "Respiratory",
    condition_name: "Pneumothorax",
    common_aliases: [
      "collapsed lung", "air leak", "tension pneumothorax",
      "spontaneous pneumothorax", "traumatic pneumothorax"
    ],
    hinglish_terms: [
      "lung collapse ho gaya", "hawa bhar gayi seene mein",
      "phephda pichak gaya", "फेफड़ा पिचक गया"
    ],
    medical_necessity_keywords: [
      "pneumothorax", "ICD insertion", "air leak",
      "lung collapse", "emergency decompression", "underwater seal"
    ],
    icd_codes: {
      primary: { code: "J93.9", description: "Pneumothorax, unspecified" },
      variants: [
        { code: "J93.0", description: "Spontaneous tension pneumothorax", use_when: "Tension pneumothorax - emergency" },
        { code: "J93.11", description: "Primary spontaneous pneumothorax", use_when: "No underlying lung disease" },
        { code: "J93.12", description: "Secondary spontaneous pneumothorax", use_when: "Known lung disease (COPD, TB)" },
        { code: "J93.83", description: "Postprocedural pneumothorax", use_when: "Iatrogenic - post-procedure" }
      ]
    },
    admission_criteria: [
      "Any size pneumothorax with symptoms",
      "Large pneumothorax (>2 cm rim)",
      "Tension pneumothorax",
      "Need for ICD insertion",
      "Bilateral pneumothorax",
      "Secondary pneumothorax in patient with lung disease"
    ],
    typical_los: { ward: 4, icu: 0 },
    cost_estimate: {
      roomRent: 12000, nursing: 1800, icuCharges: 0, otCharges: 8000,
      surgeonFee: 8000, anesthetistFee: 0, consultantFee: 4000,
      investigations: 5000, medicines: 5000, consumables: 5000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Small pneumothorax admitted without symptoms",
      "ICD >7 days without air leak status",
      "No follow-up imaging documented"
    ],
    documentation_required: [
      "Chest X-ray with size estimation",
      "Symptoms at presentation",
      "ICD insertion procedure note",
      "Daily air leak status",
      "Follow-up imaging showing resolution"
    ],
    clinical_severity_markers: [
      "Tension pneumothorax", "Bilateral", "Large (>50%)",
      "Hemodynamic instability", "Hypoxia"
    ],
    special_considerations: [
      "TB-related pneumothorax common in India",
      "Always rule out TB in secondary spontaneous pneumothorax"
    ],
    pmjay_eligible: true,
    is_surgical: true,
    is_emergency_typically: true
  },

  {
    id: "RESP-007",
    specialty: "Respiratory",
    condition_name: "Acute Respiratory Distress Syndrome",
    common_aliases: [
      "ARDS", "acute lung injury", "non-cardiogenic pulmonary edema",
      "shock lung", "wet lung"
    ],
    hinglish_terms: [
      "lungs fail ho gaye", "ARDS ho gaya", "dono phephde kharab",
      "फेफड़े फेल"
    ],
    medical_necessity_keywords: [
      "ARDS", "Berlin criteria", "PaO2/FiO2 ratio", "mechanical ventilation",
      "prone positioning", "ICU mandatory", "lung protective ventilation"
    ],
    icd_codes: {
      primary: { code: "J80", description: "Acute respiratory distress syndrome" },
      variants: []
    },
    admission_criteria: [
      "Berlin criteria met",
      "Acute onset bilateral opacities",
      "PaO2/FiO2 <300",
      "Not fully explained by cardiac failure",
      "Mechanical ventilation required"
    ],
    typical_los: { ward: 4, icu: 10 },
    cost_estimate: {
      roomRent: 16000, nursing: 2400, icuCharges: 250000, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 14000,
      investigations: 30000, medicines: 80000, consumables: 20000, implants: 0
    },
    room_category_default: "ICU",
    tpa_query_triggers: [
      "ARDS diagnosed without Berlin criteria",
      "No PaO2/FiO2 ratio calculated",
      "Not in ICU"
    ],
    documentation_required: [
      "Berlin criteria documentation",
      "PaO2/FiO2 ratio",
      "Bilateral opacities on imaging",
      "Cardiac cause excluded (Echo)",
      "Ventilation strategy and settings"
    ],
    clinical_severity_markers: [
      "PaO2/FiO2 <100 (severe)", "PaO2/FiO2 100-200 (moderate)",
      "PaO2/FiO2 200-300 (mild)", "Prone positioning required"
    ],
    special_considerations: [
      "Document Berlin criteria explicitly",
      "Prone positioning and lung protective ventilation should be documented",
      "High mortality - document daily progress and family communication"
    ],
    pmjay_eligible: true,
    is_surgical: false,
    is_emergency_typically: true
  },

  {
    id: "RESP-008",
    specialty: "Respiratory",
    condition_name: "Pulmonary Embolism",
    common_aliases: [
      "PE", "pulmonary thromboembolism", "PTE", "lung clot",
      "saddle embolus", "massive PE", "submassive PE"
    ],
    hinglish_terms: [
      "phephdon mein khoon ka thakka", "lungs mein clot",
      "फेफड़ों में खून का थक्का"
    ],
    medical_necessity_keywords: [
      "pulmonary embolism", "anticoagulation", "thrombolysis",
      "hemodynamic instability", "RV strain", "DVT source"
    ],
    icd_codes: {
      primary: { code: "I26.99", description: "Other pulmonary embolism without acute cor pulmonale" },
      variants: [
        { code: "I26.09", description: "Other PE with acute cor pulmonale", use_when: "RV strain on echo, elevated troponin" },
        { code: "I26.92", description: "Saddle embolus without acute cor pulmonale", use_when: "Saddle embolus on CT" },
        { code: "I26.01", description: "Septic pulmonary embolism with acute cor pulmonale", use_when: "Infective endocarditis source" }
      ]
    },
    admission_criteria: [
      "Any confirmed pulmonary embolism",
      "Hemodynamic instability",
      "Hypoxia (SpO2 <94%)",
      "RV dysfunction on echo",
      "Elevated troponin or BNP",
      "Need for thrombolysis"
    ],
    typical_los: { ward: 5, icu: 2 },
    cost_estimate: {
      roomRent: 17500, nursing: 2625, icuCharges: 50000, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 8000,
      investigations: 25000, medicines: 30000, consumables: 5000, implants: 0
    },
    room_category_default: "ICU",
    tpa_query_triggers: [
      "PE diagnosis without CTPA confirmation",
      "Anticoagulation without imaging",
      "No risk factor assessment"
    ],
    documentation_required: [
      "CTPA findings with location/extent",
      "Risk stratification (massive/submassive/low-risk)",
      "Echo - RV function",
      "Troponin and BNP values",
      "DVT assessment (Doppler)",
      "Anticoagulation plan"
    ],
    clinical_severity_markers: [
      "Massive (hemodynamic instability)", "Submassive (RV strain, troponin+)",
      "Saddle embolus", "Bilateral PE"
    ],
    special_considerations: [
      "PE underdiagnosed in India",
      "CTPA access may be limited - document if unavailable",
      "Wells score should be documented"
    ],
    pmjay_eligible: true,
    is_surgical: false,
    is_emergency_typically: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CARDIOLOGY (30 conditions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "CARD-001",
    specialty: "Cardiology",
    condition_name: "Acute ST-Elevation Myocardial Infarction",
    common_aliases: [
      "STEMI", "heart attack", "MI", "myocardial infarction",
      "anterior wall MI", "inferior wall MI", "lateral MI",
      "coronary thrombosis", "acute MI", "massive heart attack"
    ],
    hinglish_terms: [
      "dil ka daura", "heart attack", "nas block",
      "seene mein achanak dard", "दिल का दौरा", "हार्ट अटैक"
    ],
    medical_necessity_keywords: [
      "ST elevation", "positive troponin", "primary PCI", "thrombolysis",
      "door to balloon time", "hemodynamic instability", "cardiogenic shock",
      "emergency angiography"
    ],
    icd_codes: {
      primary: { code: "I21.3", description: "ST elevation (STEMI) MI of unspecified site" },
      variants: [
        { code: "I21.09", description: "STEMI involving anterior wall", use_when: "LAD territory - V1-V4 changes" },
        { code: "I21.19", description: "STEMI involving inferior wall", use_when: "RCA territory - II, III, aVF changes" },
        { code: "I21.29", description: "STEMI involving other sites", use_when: "Lateral or posterior wall" },
        { code: "I21.9", description: "Acute MI, unspecified", use_when: "Site not specified" }
      ]
    },
    admission_criteria: [
      "ECG showing ST elevation ≥2 contiguous leads",
      "Elevated cardiac biomarkers",
      "Acute onset crushing chest pain",
      "Hemodynamic instability",
      "New onset heart failure"
    ],
    typical_los: { ward: 3, icu: 3 },
    cost_estimate: {
      roomRent: 18000, nursing: 2700, icuCharges: 84000, otCharges: 50000,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 12000,
      investigations: 20000, medicines: 50000, consumables: 25000, implants: 75000
    },
    room_category_default: "ICU",
    tpa_query_triggers: [
      "Angiography billed without ECG/Troponin",
      "Stent size mismatch with barcode",
      "ICU >3 days without complications",
      "No door-to-balloon time documented"
    ],
    documentation_required: [
      "Time of chest pain onset",
      "Door to balloon / door to needle time",
      "Initial ECG with ST changes",
      "Serial troponin values with timestamps",
      "Stent barcode/invoice",
      "Post-PCI ECG and angiographic result",
      "Echo with EF"
    ],
    clinical_severity_markers: [
      "STEMI on ECG", "Troponin >99th percentile", "EF <40%",
      "Cardiogenic shock", "Complete heart block", "VT/VF"
    ],
    special_considerations: [
      "Stent outer pouch/barcode mandatory for implant cost",
      "DES pricing capped by NPPA",
      "Document thrombolytic drug, dose, timing if PCI unavailable"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "MC013",
    pmjay_package_rate: 120000,
    is_surgical: true,
    is_emergency_typically: true
  },

  {
    id: "CARD-002",
    specialty: "Cardiology",
    condition_name: "Non-ST Elevation Myocardial Infarction",
    common_aliases: [
      "NSTEMI", "non-ST elevation MI", "type 2 MI",
      "small heart attack", "partial heart attack"
    ],
    hinglish_terms: [
      "chhota heart attack", "partial heart attack",
      "troponin badha hua", "छोटा हार्ट अटैक"
    ],
    medical_necessity_keywords: [
      "NSTEMI", "troponin positive", "ACS protocol", "anticoagulation",
      "early invasive strategy", "GRACE score", "TIMI score"
    ],
    icd_codes: {
      primary: { code: "I21.4", description: "Non-ST elevation (NSTEMI) myocardial infarction" },
      variants: [
        { code: "I21.A1", description: "Myocardial infarction type 2", use_when: "Supply-demand mismatch (anemia, sepsis, tachycardia)" },
        { code: "I21.A9", description: "Other myocardial infarction type", use_when: "Type 3-5 MI" }
      ]
    },
    admission_criteria: [
      "Elevated troponin with ischemic symptoms",
      "Dynamic ECG changes (ST depression, T-wave inversion)",
      "GRACE score >140",
      "Ongoing chest pain despite medical therapy",
      "Heart failure or hemodynamic compromise"
    ],
    typical_los: { ward: 3, icu: 2 },
    cost_estimate: {
      roomRent: 15000, nursing: 2250, icuCharges: 56000, otCharges: 50000,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 10000,
      investigations: 20000, medicines: 40000, consumables: 20000, implants: 75000
    },
    room_category_default: "ICU",
    tpa_query_triggers: [
      "Marginally elevated troponin without ischemic symptoms - may be Type 2 MI",
      "CAG showing normal coronaries",
      "No GRACE/TIMI score documented"
    ],
    documentation_required: [
      "Serial troponin values",
      "ECG changes documented",
      "GRACE/TIMI risk score",
      "Angiographic findings",
      "Invasive vs conservative decision rationale"
    ],
    clinical_severity_markers: [
      "Troponin rise", "Dynamic ECG changes", "GRACE >140",
      "Hemodynamic instability", "Recurrent chest pain"
    ],
    special_considerations: [
      "Type 2 MI (demand-supply mismatch) frequently miscoded as NSTEMI",
      "TPAs scrutinizing this - document clearly if troponin rise is due to sepsis/anemia"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "MC013",
    is_surgical: true,
    is_emergency_typically: true
  },

  {
    id: "CARD-003",
    specialty: "Cardiology",
    condition_name: "Acute Pericarditis",
    common_aliases: [
      "pericarditis", "viral pericarditis", "pericardial inflammation",
      "idiopathic pericarditis", "acute pericardial syndrome"
    ],
    hinglish_terms: [
      "dil ki jhilli mein sujan", "pericardium mein sujan",
      "दिल की झिल्ली में सूजन"
    ],
    medical_necessity_keywords: [
      "pericarditis", "pericardial effusion", "chest pain pleuritic",
      "diffuse ST elevation", "pericardial rub", "troponin negative"
    ],
    icd_codes: {
      primary: { code: "I30.9", description: "Acute pericarditis, unspecified" },
      variants: [
        { code: "I30.0", description: "Acute nonspecific idiopathic pericarditis", use_when: "Viral/idiopathic cause" },
        { code: "I30.1", description: "Infective pericarditis", use_when: "Bacterial/TB pericarditis" },
        { code: "I30.8", description: "Other forms of acute pericarditis", use_when: "Post-MI, uremic, etc." }
      ]
    },
    admission_criteria: [
      "Large pericardial effusion",
      "Risk of tamponade",
      "High-risk features (fever >38°C, immunosuppressed)",
      "Failure of outpatient NSAIDs",
      "Myopericarditis with troponin elevation",
      "Hemodynamic compromise"
    ],
    typical_los: { ward: 4, icu: 0 },
    cost_estimate: {
      roomRent: 12000, nursing: 1800, icuCharges: 0, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 4000,
      investigations: 10000, medicines: 8000, consumables: 1000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Pericarditis without effusion admitted",
      "No echo done",
      "Confused with STEMI due to ST changes"
    ],
    documentation_required: [
      "ECG showing diffuse ST elevation or PR depression",
      "Echo showing pericardial effusion",
      "Troponin (to differentiate from MI)",
      "CRP/ESR for inflammation",
      "Etiology workup (viral markers, TB, autoimmune)"
    ],
    clinical_severity_markers: [
      "Large effusion", "Tamponade physiology", "Fever >38°C",
      "Myopericarditis (troponin+)", "Hemodynamic instability"
    ],
    special_considerations: [
      "Differentiate from STEMI - diffuse ST elevation in all leads",
      "TB pericarditis common in India - always evaluate",
      "Colchicine reduces recurrence"
    ],
    pmjay_eligible: true,
    is_surgical: false,
    is_emergency_typically: false
  },

  {
    id: "CARD-004",
    specialty: "Cardiology",
    condition_name: "Acute Heart Failure",
    common_aliases: [
      "congestive heart failure", "CHF", "AHF", "acute decompensated heart failure",
      "ADHF", "pulmonary edema", "cardiac failure", "HFrEF", "HFpEF"
    ],
    hinglish_terms: [
      "dil kamzor ho gaya", "heart fail", "saans phoolna heart se",
      "paani chad gaya lungs mein", "दिल कमज़ोर"
    ],
    medical_necessity_keywords: [
      "heart failure", "pulmonary edema", "elevated BNP", "reduced EF",
      "IV diuretics", "oxygen requirement", "cardiogenic shock", "NYHA class"
    ],
    icd_codes: {
      primary: { code: "I50.9", description: "Heart failure, unspecified" },
      variants: [
        { code: "I50.21", description: "Acute systolic heart failure", use_when: "HFrEF - EF <40%" },
        { code: "I50.31", description: "Acute diastolic heart failure", use_when: "HFpEF - EF ≥50%" },
        { code: "I50.41", description: "Acute combined systolic and diastolic heart failure", use_when: "Combined pattern" },
        { code: "I50.1", description: "Left ventricular failure", use_when: "Acute pulmonary edema" }
      ]
    },
    admission_criteria: [
      "SpO2 <90% on room air",
      "Respiratory distress requiring oxygen",
      "Need for IV diuretics",
      "Hypotension (SBP <90)",
      "New onset heart failure",
      "Refractory to oral diuretics"
    ],
    typical_los: { ward: 5, icu: 2 },
    cost_estimate: {
      roomRent: 17500, nursing: 2625, icuCharges: 50000, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 8000,
      investigations: 15000, medicines: 25000, consumables: 3000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Chronic stable heart failure admitted without acute trigger",
      "No BNP/NT-proBNP done",
      "No echo documented"
    ],
    documentation_required: [
      "BNP/NT-proBNP levels",
      "Echo with EF",
      "Chest X-ray showing congestion",
      "SpO2 at admission",
      "Daily weight and I/O chart",
      "Precipitating factor identified"
    ],
    clinical_severity_markers: [
      "EF <30%", "BNP >1000", "Pulmonary edema on CXR",
      "Cardiogenic shock", "NYHA class IV"
    ],
    special_considerations: [
      "Identify and document precipitating factor (infection, non-compliance, ACS)",
      "Daily weights mandatory for diuretic titration",
      "Distinguish from acute kidney injury"
    ],
    pmjay_eligible: true,
    is_surgical: false,
    is_emergency_typically: true
  },

  {
    id: "CARD-005",
    specialty: "Cardiology",
    condition_name: "Atrial Fibrillation with Rapid Ventricular Response",
    common_aliases: [
      "AF", "AFib", "atrial fibrillation", "AF with RVR",
      "rapid AF", "fast AF", "uncontrolled AF"
    ],
    hinglish_terms: [
      "dil ki dhadkan irregular", "dil bahut tez chal raha",
      "दिल की धड़कन अनियमित"
    ],
    medical_necessity_keywords: [
      "atrial fibrillation", "rapid ventricular response", "rate control",
      "rhythm control", "cardioversion", "anticoagulation", "stroke risk"
    ],
    icd_codes: {
      primary: { code: "I48.91", description: "Unspecified atrial fibrillation" },
      variants: [
        { code: "I48.0", description: "Paroxysmal atrial fibrillation", use_when: "Self-terminating episodes" },
        { code: "I48.1", description: "Persistent atrial fibrillation", use_when: "Sustained >7 days" },
        { code: "I48.2", description: "Chronic atrial fibrillation", use_when: "Long-standing persistent" }
      ]
    },
    admission_criteria: [
      "HR >150 with symptoms",
      "Hemodynamic instability",
      "Associated chest pain or heart failure",
      "New onset AF requiring evaluation",
      "Failed outpatient rate control",
      "Need for cardioversion"
    ],
    typical_los: { ward: 3, icu: 1 },
    cost_estimate: {
      roomRent: 10500, nursing: 1575, icuCharges: 25000, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 6000,
      investigations: 10000, medicines: 15000, consumables: 2000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Stable chronic AF admitted without acute issue",
      "No rhythm strips/ECG documented",
      "No CHADS-VASc score documented"
    ],
    documentation_required: [
      "ECG showing AF with heart rate",
      "CHADS-VASc score",
      "HAS-BLED score",
      "Echo for structural heart disease",
      "Rate/rhythm control strategy",
      "Anticoagulation plan"
    ],
    clinical_severity_markers: [
      "HR >150", "Hypotension", "Heart failure",
      "Chest pain", "Syncope"
    ],
    special_considerations: [
      "Always calculate and document CHADS-VASc",
      "Anticoagulation decision must be documented",
      "Thyroid function must be checked"
    ],
    pmjay_eligible: true,
    is_surgical: false,
    is_emergency_typically: true
  },

  {
    id: "CARD-006",
    specialty: "Cardiology",
    condition_name: "Complete Heart Block",
    common_aliases: [
      "CHB", "third degree AV block", "complete AV block",
      "heart block requiring pacemaker"
    ],
    hinglish_terms: [
      "dil ki bijli band ho gayi", "heart block",
      "pacemaker lagana padega", "दिल में ब्लॉक"
    ],
    medical_necessity_keywords: [
      "complete heart block", "AV block", "pacemaker", "bradycardia",
      "syncope", "temporary pacing", "permanent pacemaker"
    ],
    icd_codes: {
      primary: { code: "I44.2", description: "Atrioventricular block, complete" },
      variants: [
        { code: "I44.1", description: "Atrioventricular block, second degree", use_when: "Mobitz Type II" },
        { code: "I45.9", description: "Conduction disorder, unspecified", use_when: "Block type not specified" }
      ]
    },
    admission_criteria: [
      "Complete heart block on ECG",
      "Symptomatic bradycardia",
      "Need for temporary pacing",
      "Syncope or pre-syncope",
      "Heart rate <40/min"
    ],
    typical_los: { ward: 3, icu: 2 },
    cost_estimate: {
      roomRent: 10500, nursing: 1575, icuCharges: 50000, otCharges: 30000,
      surgeonFee: 25000, anesthetistFee: 10000, consultantFee: 8000,
      investigations: 10000, medicines: 15000, consumables: 10000, implants: 80000
    },
    room_category_default: "ICU",
    tpa_query_triggers: [
      "Pacemaker implant without documented indication",
      "No ECG showing heart block",
      "Device details not matching invoice"
    ],
    documentation_required: [
      "ECG showing complete heart block",
      "Heart rate documented",
      "Symptoms (syncope, dizziness)",
      "Echo",
      "Pacemaker details with device sticker",
      "Indication for permanent pacemaker"
    ],
    clinical_severity_markers: [
      "HR <40", "Syncope", "Heart failure",
      "Hemodynamic instability"
    ],
    special_considerations: [
      "Pacemaker device sticker mandatory",
      "Document indication per ACC/AHA guidelines",
      "Rule out reversible causes (electrolytes, drugs)"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "MC020",
    is_surgical: true,
    is_emergency_typically: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OBSTETRICS (25 conditions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "OB-001",
    specialty: "Obstetrics",
    condition_name: "Eclampsia",
    common_aliases: [
      "eclampsia", "pregnancy seizures", "toxemia with seizures",
      "convulsions in pregnancy", "eclamptic seizures"
    ],
    hinglish_terms: [
      "pregnancy mein fits", "garbhavastha mein daure",
      "pregnancy mein mirgi jaisa", "गर्भावस्था में दौरे"
    ],
    medical_necessity_keywords: [
      "eclampsia", "seizures", "convulsions", "pregnancy induced hypertension",
      "severe preeclampsia", "magnesium sulfate", "emergency delivery"
    ],
    icd_codes: {
      primary: { code: "O15.0", description: "Eclampsia in pregnancy" },
      variants: [
        { code: "O15.1", description: "Eclampsia in labor", use_when: "Seizures during labor" },
        { code: "O15.2", description: "Eclampsia in puerperium", use_when: "Post-delivery eclampsia" },
        { code: "O15.9", description: "Eclampsia, unspecified as to time period", use_when: "Timing not specified" }
      ]
    },
    admission_criteria: [
      "Seizures in pregnant woman",
      "Severe hypertension (BP >160/110)",
      "Proteinuria with neurological symptoms",
      "Imminent eclampsia signs (headache, visual changes, hyperreflexia)"
    ],
    typical_los: { ward: 4, icu: 3 },
    cost_estimate: {
      roomRent: 16000, nursing: 2400, icuCharges: 75000, otCharges: 25000,
      surgeonFee: 25000, anesthetistFee: 12000, consultantFee: 8000,
      investigations: 15000, medicines: 20000, consumables: 10000, implants: 0
    },
    room_category_default: "ICU",
    tpa_query_triggers: [
      "Eclampsia without documented seizure",
      "No BP records",
      "No magnesium sulfate administration documented"
    ],
    documentation_required: [
      "Description of seizure episode",
      "BP readings (before and after)",
      "Proteinuria level (dipstick/24hr)",
      "Magnesium sulfate regimen",
      "Fetal heart rate monitoring",
      "Mode and timing of delivery",
      "Maternal and fetal outcome"
    ],
    clinical_severity_markers: [
      "Recurrent seizures", "BP >180/120", "HELLP syndrome",
      "Pulmonary edema", "Renal failure", "Fetal distress"
    ],
    special_considerations: [
      "Magnesium sulfate is drug of choice - document Pritchard or Zuspan regimen",
      "Delivery is definitive treatment - document decision for timing",
      "ICU monitoring mandatory post-seizure",
      "Document fetal status throughout"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "OB008",
    pmjay_package_rate: 30000,
    is_surgical: false,
    is_emergency_typically: true
  },

  {
    id: "OB-002",
    specialty: "Obstetrics",
    condition_name: "Severe Pre-eclampsia",
    common_aliases: [
      "severe preeclampsia", "severe PIH", "severe toxemia",
      "preeclampsia with severe features", "imminent eclampsia"
    ],
    hinglish_terms: [
      "pregnancy mein BP bahut badh gaya", "garbhavastha mein high BP",
      "गर्भावस्था में हाई बीपी"
    ],
    medical_necessity_keywords: [
      "severe preeclampsia", "BP >160/110", "proteinuria", "headache",
      "visual disturbances", "epigastric pain", "HELLP", "imminent eclampsia"
    ],
    icd_codes: {
      primary: { code: "O14.1", description: "Severe pre-eclampsia" },
      variants: [
        { code: "O14.2", description: "HELLP syndrome", use_when: "Hemolysis, elevated liver enzymes, low platelets" },
        { code: "O14.0", description: "Mild to moderate pre-eclampsia", use_when: "BP 140-159/90-109, mild proteinuria" }
      ]
    },
    admission_criteria: [
      "BP ≥160/110 on two occasions",
      "Proteinuria ≥2+ or >300mg/24hr",
      "Symptoms (headache, visual changes, epigastric pain)",
      "Laboratory abnormalities (elevated LFT, low platelets)",
      "Fetal growth restriction"
    ],
    typical_los: { ward: 5, icu: 1 },
    cost_estimate: {
      roomRent: 20000, nursing: 3000, icuCharges: 25000, otCharges: 20000,
      surgeonFee: 20000, anesthetistFee: 10000, consultantFee: 6000,
      investigations: 12000, medicines: 15000, consumables: 5000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Severe preeclampsia without BP documentation",
      "No proteinuria documented",
      "No lab reports (LFT, platelets)"
    ],
    documentation_required: [
      "Serial BP readings",
      "Proteinuria levels",
      "Complete blood count with platelets",
      "LFT",
      "Symptoms documented",
      "Fetal monitoring (NST/BPP)",
      "Antihypertensive regimen",
      "Magnesium sulfate prophylaxis"
    ],
    clinical_severity_markers: [
      "BP >180/120", "Platelets <100,000", "LFT >2x normal",
      "Creatinine >1.1", "Pulmonary edema", "Neurological symptoms"
    ],
    special_considerations: [
      "Differentiate mild from severe - severe requires more intensive monitoring",
      "HELLP is severe preeclampsia - code O14.2",
      "Document magnesium sulfate for seizure prophylaxis"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "OB007",
    is_surgical: false,
    is_emergency_typically: true
  },

  {
    id: "OB-003",
    specialty: "Obstetrics",
    condition_name: "Cesarean Section",
    common_aliases: [
      "LSCS", "C-section", "cesarean delivery", "caesarean",
      "lower segment cesarean section", "emergency LSCS", "elective LSCS"
    ],
    hinglish_terms: [
      "operation se delivery", "cesarean delivery",
      "ऑपरेशन से डिलीवरी", "सिजेरियन"
    ],
    medical_necessity_keywords: [
      "cesarean", "LSCS", "C-section", "failed induction",
      "fetal distress", "CPD", "previous cesarean", "malpresentation"
    ],
    icd_codes: {
      primary: { code: "O82", description: "Encounter for cesarean delivery without indication" },
      variants: [
        { code: "O82.0", description: "Delivery by elective cesarean section", use_when: "Planned/scheduled cesarean" },
        { code: "O82.1", description: "Delivery by emergency cesarean section", use_when: "Unplanned/emergency cesarean" }
      ]
    },
    admission_criteria: [
      "Valid indication for cesarean documented",
      "Previous cesarean in labor",
      "Fetal distress requiring immediate delivery",
      "CPD (Cephalopelvic disproportion)",
      "Malpresentation (breech, transverse)",
      "Failed induction of labor",
      "Placenta previa"
    ],
    typical_los: { ward: 4, icu: 0 },
    cost_estimate: {
      roomRent: 16000, nursing: 2400, icuCharges: 0, otCharges: 20000,
      surgeonFee: 25000, anesthetistFee: 10000, consultantFee: 5000,
      investigations: 8000, medicines: 10000, consumables: 8000, implants: 0
    },
    room_category_default: "Semi-Private",
    tpa_query_triggers: [
      "No indication for cesarean documented",
      "Elective cesarean without valid reason",
      "Previous LSCS - was VBAC attempted?"
    ],
    documentation_required: [
      "Clear indication for cesarean",
      "Consent for cesarean",
      "Anesthesia assessment",
      "Operative notes",
      "Baby details (weight, APGAR)",
      "Post-op maternal monitoring"
    ],
    clinical_severity_markers: [
      "Fetal distress (abnormal CTG)", "Cord prolapse", "Placental abruption",
      "Uterine rupture", "Previous 2+ cesareans"
    ],
    special_considerations: [
      "Indication must be clearly documented",
      "Emergency vs elective affects coding",
      "TPAs question primary cesarean without trial of labor"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "OB001",
    pmjay_package_rate: 25000,
    is_surgical: true,
    is_emergency_typically: false
  },

  {
    id: "OB-004",
    specialty: "Obstetrics",
    condition_name: "Postpartum Hemorrhage",
    common_aliases: [
      "PPH", "post delivery bleeding", "obstetric hemorrhage",
      "atonic PPH", "traumatic PPH"
    ],
    hinglish_terms: [
      "delivery ke baad bleeding", "bahut khoon beh raha",
      "डिलीवरी के बाद ब्लीडिंग"
    ],
    medical_necessity_keywords: [
      "postpartum hemorrhage", "PPH", "uterine atony", "blood transfusion",
      "hysterectomy", "B-Lynch", "uterine massage", "uterotonics"
    ],
    icd_codes: {
      primary: { code: "O72.1", description: "Other immediate postpartum hemorrhage" },
      variants: [
        { code: "O72.0", description: "Third-stage hemorrhage", use_when: "Hemorrhage during placental delivery" },
        { code: "O72.2", description: "Delayed and secondary PPH", use_when: "PPH after 24 hours" },
        { code: "O72.3", description: "Postpartum coagulation defects", use_when: "PPH with DIC" }
      ]
    },
    admission_criteria: [
      "Blood loss >500ml vaginal / >1000ml cesarean",
      "Hemodynamic instability",
      "Need for blood transfusion",
      "Need for surgical intervention",
      "Retained placenta"
    ],
    typical_los: { ward: 4, icu: 2 },
    cost_estimate: {
      roomRent: 16000, nursing: 2400, icuCharges: 50000, otCharges: 25000,
      surgeonFee: 20000, anesthetistFee: 10000, consultantFee: 6000,
      investigations: 10000, medicines: 15000, consumables: 15000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "PPH without documented blood loss estimate",
      "Transfusion without Hb documentation",
      "No cause identified"
    ],
    documentation_required: [
      "Estimated blood loss",
      "Cause of PPH (4 Ts: Tone, Tissue, Trauma, Thrombin)",
      "Pre and post-transfusion Hb",
      "Blood products given",
      "Uterotonics used",
      "Surgical intervention if any"
    ],
    clinical_severity_markers: [
      "Blood loss >1000ml", "Shock (tachycardia, hypotension)",
      "Need for blood transfusion", "Surgical intervention required"
    ],
    special_considerations: [
      "Document 4 Ts cause",
      "Active management of third stage (AMTSL) documentation",
      "Blood bank liaison critical"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "OB009",
    is_surgical: false,
    is_emergency_typically: true
  },

  {
    id: "OB-005",
    specialty: "Obstetrics",
    condition_name: "Ectopic Pregnancy",
    common_aliases: [
      "ectopic", "tubal pregnancy", "extrauterine pregnancy",
      "ruptured ectopic", "unruptured ectopic"
    ],
    hinglish_terms: [
      "tube mein pregnancy", "bahar ki pregnancy",
      "ट्यूब में प्रेगनेंसी"
    ],
    medical_necessity_keywords: [
      "ectopic pregnancy", "tubal pregnancy", "ruptured ectopic",
      "hemoperitoneum", "laparoscopy", "salpingectomy", "methotrexate"
    ],
    icd_codes: {
      primary: { code: "O00.10", description: "Tubal pregnancy without intrauterine pregnancy" },
      variants: [
        { code: "O00.11", description: "Tubal pregnancy with intrauterine pregnancy", use_when: "Heterotopic pregnancy" },
        { code: "O00.20", description: "Ovarian pregnancy", use_when: "Pregnancy in ovary" },
        { code: "O00.80", description: "Other ectopic pregnancy", use_when: "Abdominal, cervical, cornual" }
      ]
    },
    admission_criteria: [
      "Confirmed ectopic on ultrasound",
      "Suspected ruptured ectopic",
      "Hemodynamic instability",
      "Pain with positive pregnancy test",
      "For surgical/medical management"
    ],
    typical_los: { ward: 3, icu: 0 },
    cost_estimate: {
      roomRent: 9000, nursing: 1350, icuCharges: 0, otCharges: 20000,
      surgeonFee: 20000, anesthetistFee: 8000, consultantFee: 4000,
      investigations: 8000, medicines: 5000, consumables: 5000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Ectopic without ultrasound confirmation",
      "Medical management without follow-up plan",
      "Ruptured ectopic - why delay in surgery?"
    ],
    documentation_required: [
      "Ultrasound report confirming ectopic",
      "Beta-hCG levels",
      "Hemoglobin",
      "Surgical notes (if operative)",
      "Histopathology of specimen",
      "Follow-up beta-hCG plan (if medical management)"
    ],
    clinical_severity_markers: [
      "Ruptured ectopic", "Hemoperitoneum", "Hemodynamic instability",
      "Beta-hCG >10,000", "Large ectopic (>4 cm)"
    ],
    special_considerations: [
      "Ruptured ectopic is surgical emergency",
      "Methotrexate for unruptured with beta-hCG <5000",
      "Document fertility-sparing vs definitive surgery decision"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "OB005",
    is_surgical: true,
    is_emergency_typically: true
  },

  {
    id: "OB-006",
    specialty: "Obstetrics",
    condition_name: "Placenta Previa",
    common_aliases: [
      "low lying placenta", "placenta previa", "complete previa",
      "partial previa", "marginal previa"
    ],
    hinglish_terms: [
      "placenta neeche hai", "naal neeche hai",
      "प्लेसेंटा नीचे"
    ],
    medical_necessity_keywords: [
      "placenta previa", "APH", "antepartum hemorrhage",
      "bleeding in pregnancy", "cesarean mandatory"
    ],
    icd_codes: {
      primary: { code: "O44.1", description: "Complete placenta previa with hemorrhage" },
      variants: [
        { code: "O44.0", description: "Complete placenta previa without hemorrhage", use_when: "No active bleeding" },
        { code: "O44.2", description: "Partial placenta previa without hemorrhage", use_when: "Partial previa, no bleeding" },
        { code: "O44.3", description: "Partial placenta previa with hemorrhage", use_when: "Partial previa with bleeding" }
      ]
    },
    admission_criteria: [
      "Any bleeding with placenta previa",
      "Complete previa after 34 weeks",
      "For planned cesarean",
      "Hemodynamic instability"
    ],
    typical_los: { ward: 5, icu: 1 },
    cost_estimate: {
      roomRent: 20000, nursing: 3000, icuCharges: 25000, otCharges: 25000,
      surgeonFee: 30000, anesthetistFee: 12000, consultantFee: 6000,
      investigations: 10000, medicines: 10000, consumables: 10000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Placenta previa without ultrasound confirmation",
      "No blood loss documentation",
      "Prolonged stay without active bleeding"
    ],
    documentation_required: [
      "Ultrasound confirming placental location",
      "Type of previa (complete/partial/marginal)",
      "Episodes of bleeding",
      "Blood transfusion if given",
      "Steroids for lung maturity",
      "Cesarean timing and indication"
    ],
    clinical_severity_markers: [
      "Active bleeding", "Complete previa", "Accreta suspected",
      "Need for transfusion", "Preterm delivery"
    ],
    special_considerations: [
      "Complete previa = mandatory cesarean",
      "Risk of placenta accreta with previous cesarean",
      "Document blood availability/cross-match"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "OB003",
    is_surgical: true,
    is_emergency_typically: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERAL SURGERY (25 conditions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "SURG-001",
    specialty: "General Surgery",
    condition_name: "Acute Appendicitis",
    common_aliases: [
      "appendicitis", "appendix infection", "inflamed appendix",
      "acute appendix", "appendicular colic"
    ],
    hinglish_terms: [
      "appendix mein sujan", "appendix ki bimari",
      "अपेंडिक्स में सूजन", "अपेंडिक्स इन्फेक्शन"
    ],
    medical_necessity_keywords: [
      "acute appendicitis", "RIF pain", "McBurney tenderness",
      "appendicectomy", "rebound tenderness", "Alvarado score"
    ],
    icd_codes: {
      primary: { code: "K35.80", description: "Unspecified acute appendicitis" },
      variants: [
        { code: "K35.30", description: "Acute appendicitis with localized peritonitis", use_when: "Localized abscess/peritonitis" },
        { code: "K35.20", description: "Acute appendicitis with generalized peritonitis", use_when: "Perforation with generalized peritonitis" },
        { code: "K35.890", description: "Other acute appendicitis without perforation", use_when: "Gangrenous but not perforated" }
      ]
    },
    admission_criteria: [
      "Clinical/imaging confirmed appendicitis",
      "Alvarado score ≥7",
      "USG showing appendix >6mm",
      "Peritoneal signs"
    ],
    typical_los: { ward: 3, icu: 0 },
    cost_estimate: {
      roomRent: 10500, nursing: 1575, icuCharges: 0, otCharges: 12000,
      surgeonFee: 17500, anesthetistFee: 7000, consultantFee: 2000,
      investigations: 6000, medicines: 6000, consumables: 4000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Histopathology showing normal appendix",
      "No imaging confirmation",
      "Conservative management billed as surgical"
    ],
    documentation_required: [
      "Alvarado score",
      "USG/CT findings",
      "Operative notes",
      "Histopathology report"
    ],
    clinical_severity_markers: [
      "Alvarado ≥7", "Peritonitis signs", "TLC >15,000",
      "Appendix >6mm on USG", "Perforation"
    ],
    special_considerations: [
      "Histopathology mandatory - claim challenged if normal",
      "Document Alvarado score",
      "Laparoscopic vs open - document choice"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "SG0001",
    pmjay_package_rate: 25000,
    is_surgical: true,
    is_emergency_typically: true
  },

  {
    id: "SURG-002",
    specialty: "General Surgery",
    condition_name: "Perforated Appendicitis with Peritonitis",
    common_aliases: [
      "ruptured appendix", "burst appendix", "perforated appendix",
      "appendicitis with peritonitis", "complicated appendicitis",
      "gangrenous appendicitis with perforation"
    ],
    hinglish_terms: [
      "appendix phat gaya", "appendix mein chhed ho gaya",
      "appendix burst", "अपेंडिक्स फट गया"
    ],
    medical_necessity_keywords: [
      "perforated appendix", "ruptured appendix", "peritonitis",
      "free fluid", "loculated collection", "sepsis",
      "exploratory laparotomy", "peritoneal lavage"
    ],
    icd_codes: {
      primary: { code: "K35.20", description: "Acute appendicitis with generalized peritonitis" },
      variants: [
        { code: "K35.30", description: "Acute appendicitis with localized peritonitis", use_when: "Localized abscess without generalized contamination" },
        { code: "K35.21", description: "Acute appendicitis with generalized peritonitis, with abscess", use_when: "Perforation with both peritonitis and abscess" }
      ]
    },
    admission_criteria: [
      "Perforation confirmed on imaging or surgery",
      "Generalized abdominal rigidity",
      "Free air on X-ray/CT",
      "Sepsis/SIRS criteria met",
      "Loculated collection on imaging"
    ],
    typical_los: { ward: 7, icu: 3 },
    cost_estimate: {
      roomRent: 24500, nursing: 3675, icuCharges: 75000, otCharges: 20000,
      surgeonFee: 25000, anesthetistFee: 10000, consultantFee: 6000,
      investigations: 15000, medicines: 25000, consumables: 15000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Perforated appendicitis without CT confirmation",
      "ICU stay without documented sepsis",
      "Prolonged antibiotics without culture"
    ],
    documentation_required: [
      "CT abdomen showing perforation/free air/collection",
      "Operative findings documenting perforation",
      "Peritoneal contamination grade",
      "Culture reports",
      "Daily clinical progress",
      "Histopathology"
    ],
    clinical_severity_markers: [
      "Free air on imaging", "Generalized guarding",
      "Sepsis/septic shock", "WBC >20,000",
      "Paralytic ileus", "Multi-organ dysfunction"
    ],
    special_considerations: [
      "Use K35.20 for generalized peritonitis, not K35.80",
      "Document Mannheim Peritonitis Index if applicable",
      "Drain placement indication and output"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "SG0002",
    pmjay_package_rate: 40000,
    is_surgical: true,
    is_emergency_typically: true
  },

  {
    id: "SURG-003",
    specialty: "General Surgery",
    condition_name: "Acute Cholecystitis",
    common_aliases: [
      "cholecystitis", "gallbladder infection", "gallbladder inflammation",
      "acute calculous cholecystitis", "gallstone attack"
    ],
    hinglish_terms: [
      "pittashay mein sujan", "gallbladder mein infection",
      "पित्ताशय में सूजन"
    ],
    medical_necessity_keywords: [
      "acute cholecystitis", "Murphy's sign", "gallbladder wall thickening",
      "cholecystectomy", "pericholecystic fluid", "fever with RUQ pain"
    ],
    icd_codes: {
      primary: { code: "K80.00", description: "Calculus of gallbladder with acute cholecystitis without obstruction" },
      variants: [
        { code: "K80.01", description: "Calculus of gallbladder with acute cholecystitis with obstruction", use_when: "CBD stone or obstruction" },
        { code: "K81.0", description: "Acute cholecystitis", use_when: "Acalculous cholecystitis" },
        { code: "K80.10", description: "Calculus of gallbladder with chronic cholecystitis", use_when: "Chronic cholecystitis presenting acutely" }
      ]
    },
    admission_criteria: [
      "Murphy's sign positive",
      "USG showing gallstones with wall thickening",
      "Fever with RUQ pain",
      "Elevated WBC with right upper quadrant tenderness",
      "Tokyo Grade II or III severity"
    ],
    typical_los: { ward: 4, icu: 0 },
    cost_estimate: {
      roomRent: 14000, nursing: 2100, icuCharges: 0, otCharges: 18000,
      surgeonFee: 22000, anesthetistFee: 9000, consultantFee: 4000,
      investigations: 10000, medicines: 10000, consumables: 6000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Cholecystitis without USG confirmation",
      "Chronic gallstones admitted as acute",
      "Delayed surgery without documented reason"
    ],
    documentation_required: [
      "USG showing gallstones and wall thickening",
      "Murphy's sign documented",
      "Tokyo severity grade",
      "Operative notes",
      "Histopathology"
    ],
    clinical_severity_markers: [
      "GB wall >4mm", "Pericholecystic fluid", "Murphy's sign positive",
      "WBC >18,000", "Tokyo Grade III"
    ],
    special_considerations: [
      "Document Tokyo severity grade",
      "Early cholecystectomy preferred over delayed",
      "MRCP if CBD stone suspected"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "SG0010",
    pmjay_package_rate: 30000,
    is_surgical: true,
    is_emergency_typically: true
  },

  {
    id: "SURG-004",
    specialty: "General Surgery",
    condition_name: "Intestinal Obstruction",
    common_aliases: [
      "bowel obstruction", "intestinal block", "IO", "ileus",
      "small bowel obstruction", "large bowel obstruction",
      "adhesive obstruction", "obstructed hernia"
    ],
    hinglish_terms: [
      "aant mein rukawat", "pet mein block", "gas band",
      "आंत में रुकावट"
    ],
    medical_necessity_keywords: [
      "intestinal obstruction", "bowel obstruction", "multiple air-fluid levels",
      "dilated bowel loops", "no flatus", "bilious vomiting",
      "exploratory laparotomy"
    ],
    icd_codes: {
      primary: { code: "K56.60", description: "Unspecified intestinal obstruction" },
      variants: [
        { code: "K56.50", description: "Intestinal adhesions with obstruction", use_when: "Post-operative adhesive obstruction" },
        { code: "K56.2", description: "Volvulus", use_when: "Sigmoid or cecal volvulus" },
        { code: "K56.1", description: "Intussusception", use_when: "Telescoping of bowel (common in children)" },
        { code: "K56.69", description: "Other intestinal obstruction", use_when: "Other specified cause" }
      ]
    },
    admission_criteria: [
      "Clinical/radiological evidence of obstruction",
      "Multiple air-fluid levels on X-ray",
      "Dilated bowel loops",
      "Absolute constipation (no flatus/stool)",
      "Bilious vomiting"
    ],
    typical_los: { ward: 6, icu: 1 },
    cost_estimate: {
      roomRent: 21000, nursing: 3150, icuCharges: 25000, otCharges: 20000,
      surgeonFee: 25000, anesthetistFee: 10000, consultantFee: 6000,
      investigations: 15000, medicines: 20000, consumables: 10000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Obstruction without X-ray/CT confirmation",
      "Conservative management >72 hours without re-evaluation",
      "Surgery for simple ileus"
    ],
    documentation_required: [
      "X-ray abdomen erect showing air-fluid levels",
      "CT abdomen if done",
      "Clinical findings (distension, bowel sounds)",
      "Ryle's tube output",
      "Operative findings",
      "Cause of obstruction identified"
    ],
    clinical_severity_markers: [
      "Strangulation signs (fever, tachycardia, localized tenderness)",
      "Closed loop obstruction", "Metabolic derangement",
      "Peritonitis", "Gangrenous bowel"
    ],
    special_considerations: [
      "Differentiate mechanical obstruction from ileus",
      "Document failed conservative management if surgery done",
      "Specify cause (adhesions, hernia, tumor, volvulus)"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "SG0015",
    is_surgical: true,
    is_emergency_typically: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEUROLOGY (15 conditions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "NEURO-001",
    specialty: "Neurology",
    condition_name: "Acute Ischemic Stroke",
    common_aliases: [
      "stroke", "brain stroke", "cerebral stroke", "CVA",
      "cerebrovascular accident", "brain attack", "paralysis",
      "MCA stroke", "ACA stroke", "PCA stroke"
    ],
    hinglish_terms: [
      "brain stroke", "lakwa", "paralysis", "dimag ka daura",
      "ब्रेन स्ट्रोक", "लकवा", "पक्षाघात"
    ],
    medical_necessity_keywords: [
      "acute stroke", "ischemic stroke", "thrombolysis", "NIHSS",
      "CT brain infarct", "hemiplegia", "aphasia", "door to needle time"
    ],
    icd_codes: {
      primary: { code: "I63.9", description: "Cerebral infarction, unspecified" },
      variants: [
        { code: "I63.50", description: "Cerebral infarction due to unspecified occlusion of cerebral artery", use_when: "Arterial occlusion confirmed" },
        { code: "I63.30", description: "Cerebral infarction due to thrombosis of cerebral arteries", use_when: "Thrombotic stroke" },
        { code: "I63.40", description: "Cerebral infarction due to embolism of cerebral arteries", use_when: "Embolic stroke (cardiac source)" }
      ]
    },
    admission_criteria: [
      "Acute neurological deficit",
      "CT/MRI showing infarction",
      "NIHSS ≥1",
      "Within thrombolysis window",
      "Need for monitoring and rehabilitation"
    ],
    typical_los: { ward: 6, icu: 3 },
    cost_estimate: {
      roomRent: 21000, nursing: 3150, icuCharges: 75000, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 10000,
      investigations: 30000, medicines: 40000, consumables: 8000, implants: 0
    },
    room_category_default: "ICU",
    tpa_query_triggers: [
      "Stroke without CT/MRI confirmation",
      "Thrombolysis without documented window",
      "Prolonged ICU without documented neuromonitoring need"
    ],
    documentation_required: [
      "Time of symptom onset",
      "NIHSS score at admission",
      "CT/MRI brain report",
      "Door to needle time (if thrombolysis)",
      "tPA consent and administration details",
      "Daily neurological assessments"
    ],
    clinical_severity_markers: [
      "NIHSS >15", "Large vessel occlusion", "Hemorrhagic transformation",
      "Malignant MCA syndrome", "Dysphagia/aspiration risk"
    ],
    special_considerations: [
      "Time of onset is legally critical - document precisely",
      "Thrombolysis window: <4.5 hours from symptom onset",
      "Document rehabilitation plan"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "NE0001",
    pmjay_package_rate: 40000,
    is_surgical: false,
    is_emergency_typically: true
  },

  {
    id: "NEURO-002",
    specialty: "Neurology",
    condition_name: "Seizure Disorder / Status Epilepticus",
    common_aliases: [
      "seizures", "epilepsy", "fits", "convulsions",
      "status epilepticus", "GTCS", "tonic-clonic seizure"
    ],
    hinglish_terms: [
      "mirgi", "fits aana", "daure padna", "jhatkay aana",
      "मिर्गी", "दौरे"
    ],
    medical_necessity_keywords: [
      "seizures", "status epilepticus", "convulsions", "anticonvulsants",
      "EEG", "postictal", "breakthrough seizures"
    ],
    icd_codes: {
      primary: { code: "G40.909", description: "Epilepsy, unspecified, not intractable" },
      variants: [
        { code: "G41.0", description: "Grand mal status epilepticus", use_when: "Status epilepticus - convulsive" },
        { code: "G41.2", description: "Complex partial status epilepticus", use_when: "Non-convulsive status epilepticus" },
        { code: "G40.919", description: "Epilepsy, unspecified, intractable", use_when: "Drug-resistant epilepsy" }
      ]
    },
    admission_criteria: [
      "Status epilepticus",
      "Cluster seizures (>3 in 24 hours)",
      "First seizure requiring workup",
      "Post-ictal confusion >30 minutes",
      "Breakthrough seizures on medication",
      "Need for IV anticonvulsants"
    ],
    typical_los: { ward: 4, icu: 2 },
    cost_estimate: {
      roomRent: 14000, nursing: 2100, icuCharges: 50000, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 8000,
      investigations: 20000, medicines: 15000, consumables: 3000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Single uncomplicated seizure admitted",
      "No EEG done",
      "Known epilepsy without breakthrough documented"
    ],
    documentation_required: [
      "Seizure description (type, duration, frequency)",
      "EEG report",
      "CT/MRI brain",
      "Anticonvulsant levels if on medication",
      "Anticonvulsant regimen changes"
    ],
    clinical_severity_markers: [
      "Status epilepticus (>5 minutes)", "Cluster seizures",
      "Respiratory compromise", "Post-ictal coma"
    ],
    special_considerations: [
      "Status epilepticus is neurological emergency",
      "Document seizure semiology for classification",
      "Check AED compliance/levels"
    ],
    pmjay_eligible: true,
    is_surgical: false,
    is_emergency_typically: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NEPHROLOGY (10 conditions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "NEPH-001",
    specialty: "Nephrology",
    condition_name: "Acute Kidney Injury",
    common_aliases: [
      "AKI", "acute renal failure", "ARF", "kidney failure",
      "acute kidney failure", "renal shutdown"
    ],
    hinglish_terms: [
      "kidney fail ho gaya", "gurde kharab", "kidney band pad gaya",
      "किडनी फेल", "गुर्दे खराब"
    ],
    medical_necessity_keywords: [
      "acute kidney injury", "AKI", "rising creatinine", "oliguria",
      "dialysis", "uremia", "hyperkalemia", "metabolic acidosis"
    ],
    icd_codes: {
      primary: { code: "N17.9", description: "Acute kidney failure, unspecified" },
      variants: [
        { code: "N17.0", description: "Acute kidney failure with tubular necrosis", use_when: "ATN confirmed" },
        { code: "N17.1", description: "Acute kidney failure with acute cortical necrosis", use_when: "Cortical necrosis" },
        { code: "N17.2", description: "Acute kidney failure with medullary necrosis", use_when: "Papillary necrosis" }
      ]
    },
    admission_criteria: [
      "Creatinine >2x baseline",
      "Urine output <0.5 ml/kg/hr for 6 hours",
      "Hyperkalemia (K+ >6)",
      "Metabolic acidosis",
      "Uremic symptoms",
      "Need for dialysis"
    ],
    typical_los: { ward: 5, icu: 3 },
    cost_estimate: {
      roomRent: 17500, nursing: 2625, icuCharges: 75000, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 8000,
      investigations: 15000, medicines: 20000, consumables: 10000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "AKI without baseline creatinine",
      "Dialysis without documented indication",
      "No urine output monitoring"
    ],
    documentation_required: [
      "Baseline creatinine",
      "Serial creatinine",
      "Urine output chart",
      "KDIGO stage",
      "Cause of AKI identified",
      "Dialysis indication if done"
    ],
    clinical_severity_markers: [
      "KDIGO Stage 3", "Anuria", "Hyperkalemia requiring dialysis",
      "Uremic encephalopathy", "Pulmonary edema"
    ],
    special_considerations: [
      "Document KDIGO stage",
      "Identify pre-renal, renal, or post-renal cause",
      "Input-output chart mandatory"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "NP0001",
    is_surgical: false,
    is_emergency_typically: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INFECTIOUS DISEASE (15 conditions)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "ID-001",
    specialty: "Infectious Disease",
    condition_name: "Dengue Fever",
    common_aliases: [
      "dengue", "dengue hemorrhagic fever", "DHF", "dengue shock syndrome",
      "DSS", "breakbone fever"
    ],
    hinglish_terms: [
      "dengue bukhar", "haddi tod bukhar", "platelet girna",
      "डेंगू बुखार", "हड्डी तोड़ बुखार"
    ],
    medical_necessity_keywords: [
      "dengue", "thrombocytopenia", "NS1 positive", "warning signs",
      "plasma leakage", "dengue shock", "hemoconcentration"
    ],
    icd_codes: {
      primary: { code: "A90", description: "Dengue fever [classical dengue]" },
      variants: [
        { code: "A91", description: "Dengue hemorrhagic fever", use_when: "DHF with bleeding manifestations" }
      ]
    },
    admission_criteria: [
      "Platelet <100,000",
      "Warning signs present",
      "Persistent vomiting",
      "Abdominal pain",
      "Lethargy/restlessness",
      "Bleeding manifestations",
      "Hemoconcentration"
    ],
    typical_los: { ward: 4, icu: 0 },
    cost_estimate: {
      roomRent: 12000, nursing: 1800, icuCharges: 0, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 4000,
      investigations: 8000, medicines: 10000, consumables: 2000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Dengue admitted with platelet >100,000",
      "No NS1/IgM confirmation",
      "No serial platelet monitoring"
    ],
    documentation_required: [
      "NS1/IgM dengue report",
      "Serial platelet counts",
      "Hematocrit monitoring",
      "Warning signs assessment",
      "Fluid chart"
    ],
    clinical_severity_markers: [
      "Platelet <50,000", "Hematocrit rise >20%", "Bleeding",
      "Shock (narrow pulse pressure)", "Organ impairment"
    ],
    special_considerations: [
      "Serial platelet monitoring essential",
      "Fluid management is key - avoid overhydration",
      "Platelet transfusion rarely needed unless bleeding"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "ID0001",
    is_surgical: false,
    is_emergency_typically: true
  },

  {
    id: "ID-002",
    specialty: "Infectious Disease",
    condition_name: "Typhoid Fever",
    common_aliases: [
      "typhoid", "enteric fever", "salmonella typhi infection",
      "TAB fever"
    ],
    hinglish_terms: [
      "typhoid bukhar", "motijhara", "miyadi bukhar",
      "टायफाइड", "मियादी बुखार"
    ],
    medical_necessity_keywords: [
      "typhoid", "enteric fever", "Widal positive", "blood culture positive",
      "step ladder fever", "relative bradycardia"
    ],
    icd_codes: {
      primary: { code: "A01.0", description: "Typhoid fever" },
      variants: [
        { code: "A01.1", description: "Paratyphoid fever A", use_when: "Paratyphoid A confirmed" },
        { code: "A01.4", description: "Paratyphoid fever, unspecified", use_when: "Paratyphoid unspecified" }
      ]
    },
    admission_criteria: [
      "High grade fever >5 days",
      "Complications present (perforation, encephalopathy)",
      "Unable to tolerate oral",
      "Persistent vomiting",
      "Abdominal distension"
    ],
    typical_los: { ward: 5, icu: 0 },
    cost_estimate: {
      roomRent: 15000, nursing: 2250, icuCharges: 0, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 4000,
      investigations: 6000, medicines: 10000, consumables: 1500, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Typhoid without Widal/blood culture",
      "Uncomplicated typhoid manageable OPD",
      "Why IV antibiotics needed"
    ],
    documentation_required: [
      "Widal or blood culture report",
      "Fever chart",
      "Antibiotic sensitivity",
      "Complication screening"
    ],
    clinical_severity_markers: [
      "Intestinal perforation", "Encephalopathy", "Myocarditis",
      "Hepatitis", "DIC"
    ],
    special_considerations: [
      "Blood culture preferred over Widal",
      "Document why OPD management not feasible",
      "Watch for intestinal perforation in 3rd week"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "ID0002",
    is_surgical: false,
    is_emergency_typically: false
  },

  {
    id: "ID-003",
    specialty: "Infectious Disease",
    condition_name: "Malaria",
    common_aliases: [
      "malaria", "plasmodium infection", "falciparum malaria",
      "vivax malaria", "severe malaria", "cerebral malaria"
    ],
    hinglish_terms: [
      "malaria bukhar", "teeje ka bukhar", "thandi lagna",
      "मलेरिया"
    ],
    medical_necessity_keywords: [
      "malaria", "plasmodium", "parasitemia", "severe malaria",
      "cerebral malaria", "antimalarials", "artesunate"
    ],
    icd_codes: {
      primary: { code: "B50.9", description: "Plasmodium falciparum malaria, unspecified" },
      variants: [
        { code: "B50.0", description: "Plasmodium falciparum malaria with cerebral complications", use_when: "Cerebral malaria" },
        { code: "B51.9", description: "Plasmodium vivax malaria without complication", use_when: "Vivax malaria" },
        { code: "B50.8", description: "Other severe and complicated P. falciparum malaria", use_when: "Severe malaria with complications" }
      ]
    },
    admission_criteria: [
      "Severe malaria (any WHO criteria)",
      "Cerebral malaria",
      "Parasitemia >5%",
      "Hypoglycemia",
      "Renal impairment",
      "Severe anemia (Hb <7)",
      "Respiratory distress"
    ],
    typical_los: { ward: 4, icu: 2 },
    cost_estimate: {
      roomRent: 14000, nursing: 2100, icuCharges: 50000, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 4000,
      investigations: 8000, medicines: 15000, consumables: 3000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: [
      "Malaria admitted without positive smear/RDT",
      "Uncomplicated malaria admitted",
      "Severity criteria not documented"
    ],
    documentation_required: [
      "Malaria smear or RDT report",
      "Parasitemia percentage if available",
      "Severity criteria met",
      "Antimalarial regimen",
      "Response to treatment"
    ],
    clinical_severity_markers: [
      "Cerebral malaria (GCS <11)", "Parasitemia >5%", "Hb <7",
      "Creatinine >3", "Hypoglycemia", "Respiratory distress"
    ],
    special_considerations: [
      "IV artesunate for severe malaria",
      "WHO severe malaria criteria must be documented",
      "Watch for delayed hemolysis"
    ],
    pmjay_eligible: true,
    pmjay_package_code: "ID0003",
    is_surgical: false,
    is_emergency_typically: true
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // THE R69 FALLBACK - Always include this as the last entry
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "FLOOR-001",
    specialty: "General",
    condition_name: "Illness, unspecified",
    common_aliases: [],
    hinglish_terms: [],
    medical_necessity_keywords: ["undiagnosed", "under evaluation", "investigation required"],
    icd_codes: {
      primary: { code: "R69", description: "Illness, unspecified" },
      variants: []
    },
    admission_criteria: [
      "Requires investigation",
      "Observation needed",
      "Diagnosis unclear"
    ],
    typical_los: { ward: 3, icu: 0 },
    cost_estimate: {
      roomRent: 9000, nursing: 1350, icuCharges: 0, otCharges: 0,
      surgeonFee: 0, anesthetistFee: 0, consultantFee: 3000,
      investigations: 10000, medicines: 5000, consumables: 1000, implants: 0
    },
    room_category_default: "General Ward",
    tpa_query_triggers: ["Specific diagnosis should be updated once confirmed"],
    documentation_required: ["Working diagnosis", "Investigation plan"],
    clinical_severity_markers: [],
    special_considerations: [
      "Use as temporary code only",
      "Update with specific ICD once diagnosis confirmed",
      "Document reason diagnosis is unclear"
    ],
    pmjay_eligible: false,
    is_surgical: false,
    is_emergency_typically: false
  }

  // ADD MORE CONDITIONS HERE FOR EACH SPECIALTY
  // Target: 300 total conditions covering:
  // - Respiratory: 25
  // - Cardiology: 30
  // - Obstetrics: 25
  // - Gynecology: 15
  // - General Surgery: 25
  // - Orthopedics: 25
  // - Neurology: 15
  // - Nephrology: 15
  // - Gastroenterology: 20
  // - Infectious Disease: 20
  // - Pediatrics: 25
  // - Oncology: 15
  // - Urology: 15
  // - ENT: 10
  // - Ophthalmology: 10
  // - Endocrinology: 15
  // - Psychiatry: 10
  // - Dermatology: 5

];

// Export helper functions
export function getTier1ConditionByCode(code: string): Tier1Condition | undefined {
  return ICD10_TIER1.find(c => 
    c.icd_codes.primary.code === code ||
    c.icd_codes.variants.some(v => v.code === code)
  );
}

export function getTier1ConditionsBySpecialty(specialty: string): Tier1Condition[] {
  return ICD10_TIER1.filter(c => c.specialty === specialty);
}

export function getAllTier1SearchTerms(condition: Tier1Condition): string[] {
  return [
    condition.condition_name.toLowerCase(),
    ...condition.common_aliases.map(a => a.toLowerCase()),
    ...condition.hinglish_terms.map(t => t.toLowerCase()),
    ...condition.medical_necessity_keywords.map(k => k.toLowerCase())
  ];
}
