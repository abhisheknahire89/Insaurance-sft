import * as fs from 'fs';
import * as path from 'path';

// ── Load data ────────────────────────────────────────────────────────────────
const BASE = path.resolve(__dirname, '..');
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(BASE, p), 'utf-8'));

const icdDict: Record<string, string> = read('data/icd10cm_2024_codes.json');
const seeds: any[] = read('data/condition_seed_list.json');
const hinglish: Record<string, string[]> = read('data/hinglish_lexicon.json');
const assocLib: any = read('data/templates/associated_codes_library.json');
const losLib: any = read('data/templates/los_templates.json');
const tqLib: any = read('data/templates/tpa_query_templates.json');
const procLib: any = read('data/templates/expected_procedures_templates.json');

// ── Variant rules per specialty ──────────────────────────────────────────────
const VARIANT_RULES: Record<string, (seed: any) => any[]> = {
    Respiratory: (s) => {
        if (s.id === 'RESP-001') return [
            { code: 'J13', description: icdDict['J13'], use_when: 'Pneumococcal pneumonia confirmed' },
            { code: 'J14', description: icdDict['J14'], use_when: 'Haemophilus influenzae pneumonia' },
            { code: 'J15.0', description: icdDict['J15.0'], use_when: 'Klebsiella CAP — often in diabetics/alcoholics' },
            { code: 'J15.211', description: icdDict['J15.211'], use_when: 'MRSA pneumonia — post-influenza or healthcare-associated' },
            { code: 'J12.9', description: icdDict['J12.9'], use_when: 'Viral/COVID-19 pneumonia' },
        ];
        if (s.id === 'RESP-003') return [
            { code: 'J44.0', description: icdDict['J44.0'], use_when: 'COPD with active lower respiratory infection' },
            { code: 'J44.9', description: icdDict['J44.9'], use_when: 'Stage classification for COPD' },
            { code: 'J96.00', description: icdDict['J96.00'], use_when: 'COPD with acute respiratory failure' },
        ];
        if (s.id === 'RESP-004') return [
            { code: 'J45.41', description: icdDict['J45.41'], use_when: 'Moderate persistent asthma with exacerbation' },
            { code: 'J45.901', description: icdDict['J45.901'], use_when: 'Unspecified asthma severity with exacerbation' },
            { code: 'J96.01', description: icdDict['J96.01'], use_when: 'Asthma with hypoxic respiratory failure' },
        ];
        if (s.id === 'RESP-007') return [
            { code: 'A15.4', description: icdDict['A15.4'], use_when: 'TB with mediastinal lymphadenopathy' },
            { code: 'A15.6', description: icdDict['A15.6'], use_when: 'TB pleuritis with effusion' },
            { code: 'A15.5', description: icdDict['A15.5'], use_when: 'Laryngeal TB' },
        ];
        return defaultVariants(s);
    },
    Cardiac: (s) => {
        if (s.id === 'CARD-001') return [
            { code: 'I21.19', description: icdDict['I21.19'], use_when: 'Inferior wall STEMI (RCA or LCx territory)' },
            { code: 'I21.3', description: icdDict['I21.3'], use_when: 'STEMI when site not determinable on ECG' },
            { code: 'I21.A1', description: icdDict['I21.A1'], use_when: 'LAD territory STEMI — anterior/anteroseptal' },
        ];
        if (s.id === 'CARD-004') return [
            { code: 'I50.31', description: icdDict['I50.31'], use_when: 'Acute diastolic HF — hypertension-related' },
            { code: 'I50.41', description: icdDict['I50.41'], use_when: 'Combined systolic and diastolic failure' },
            { code: 'I50.1', description: icdDict['I50.1'], use_when: 'Predominant left ventricular failure' },
        ];
        if (s.id === 'CARD-008') return [
            { code: 'I48.0', description: icdDict['I48.0'], use_when: 'Paroxysmal AF — self-terminating episodes' },
            { code: 'I48.11', description: icdDict['I48.11'], use_when: 'Longstanding persistent AF > 12 months' },
            { code: 'I48.19', description: icdDict['I48.19'], use_when: 'Persistent AF not fitting other categories' },
        ];
        return defaultVariants(s);
    },
    Neurology: (s) => {
        if (s.id === 'NEUR-001') return [
            { code: 'I63.10', description: icdDict['I63.10'], use_when: 'Cardioembolic stroke — AF source' },
            { code: 'I63.40', description: icdDict['I63.40'], use_when: 'Embolic stroke of undetermined source (ESUS)' },
            { code: 'I63.00', description: icdDict['I63.00'], use_when: 'Large vessel atherothrombotic stroke' },
        ];
        if (s.id === 'NEUR-002') return [
            { code: 'I61.0', description: icdDict['I61.0'], use_when: 'Subcortical/basal ganglia bleed — hypertension' },
            { code: 'I61.3', description: icdDict['I61.3'], use_when: 'Brainstem hemorrhage — worst prognosis' },
            { code: 'I61.4', description: icdDict['I61.4'], use_when: 'Cerebellar hemorrhage — may need evacuation' },
        ];
        if (s.id === 'NEUR-004') return [
            { code: 'G00.0', description: icdDict['G00.0'], use_when: 'Haemophilus meningitis — children < 5 years' },
            { code: 'G00.1', description: icdDict['G00.1'], use_when: 'Pneumococcal meningitis — commonest in adults' },
            { code: 'G00.2', description: icdDict['G00.2'], use_when: 'Streptococcal meningitis — group B neonatal' },
        ];
        return defaultVariants(s);
    },
    Gastroenterology: (s) => {
        if (s.id === 'GI-001') return [
            { code: 'K85.12', description: icdDict['K85.12'], use_when: 'Biliary pancreatitis with infected necrosis' },
            { code: 'K85.20', description: icdDict['K85.20'], use_when: 'Alcohol-induced pancreatitis' },
            { code: 'K85.21', description: icdDict['K85.21'], use_when: 'Alcohol pancreatitis with sterile necrosis' },
        ];
        if (s.id === 'GI-013') return [
            { code: 'K72.00', description: icdDict['K72.00'], use_when: 'Acute hepatic failure without encephalopathy' },
            { code: 'K72.01', description: icdDict['K72.01'], use_when: 'Acute hepatic failure with hepatic coma' },
            { code: 'K72.90', description: icdDict['K72.90'], use_when: 'Chronic-on-acute hepatic failure' },
        ];
        if (s.id === 'GI-003' || s.id === 'GI-004') return [
            { code: 'K92.0', description: icdDict['K92.0'], use_when: 'Hematemesis — bright red blood vomiting' },
            { code: 'K92.1', description: icdDict['K92.1'], use_when: 'Melena — digested blood in stool' },
            { code: 'I85.11', description: icdDict['I85.11'], use_when: 'Variceal hemorrhage in cirrhosis' },
        ];
        return defaultVariants(s);
    },
    Endocrinology: (s) => {
        if (s.id === 'ENDO-001') return [
            { code: 'E10.11', description: icdDict['E10.11'], use_when: 'DKA Type 1 with coma' },
            { code: 'E11.10', description: icdDict['E11.10'], use_when: 'DKA in Type 2 (less common, stressor-induced)' },
            { code: 'E11.11', description: icdDict['E11.11'], use_when: 'DKA Type 2 with coma' },
        ];
        if (s.id === 'ENDO-002') return [
            { code: 'E11.11', description: icdDict['E11.11'], use_when: 'DKA Type 2 with coma — severe' },
            { code: 'E10.10', description: icdDict['E10.10'], use_when: 'Reclassify as Type 1 if antibody positive' },
            { code: 'E11.01', description: icdDict['E11.01'], use_when: 'HHS with DKA features mixed presentation' },
        ];
        if (s.id === 'ENDO-004') return [
            { code: 'E10.641', description: icdDict['E10.641'], use_when: 'Type 1 DM hypoglycemia with coma' },
            { code: 'E11.649', description: icdDict['E11.649'], use_when: 'Type 2 DM hypoglycemia without coma' },
            { code: 'E11.00', description: icdDict['E11.00'], use_when: 'HHS — severe hyperglycemia without acidosis' },
        ];
        return defaultVariants(s);
    },
};

// ── Default variant generator ────────────────────────────────────────────────
function defaultVariants(seed: any): any[] {
    return [
        { code: seed.primary_code, description: icdDict[seed.primary_code] || 'See ICD dictionary', use_when: 'Default — use when no specific subtype identified' },
        { code: 'A41.9', description: icdDict['A41.9'], use_when: 'When sepsis complicates the primary condition' },
        { code: 'N17.9', description: icdDict['N17.9'], use_when: 'When AKI develops as a complication' },
    ];
}

// ── Admission criteria generator ─────────────────────────────────────────────
function buildAdmissionCriteria(seed: any): string[] {
    const base = [
        'Failed adequate outpatient/OPD treatment',
        'Requires IV medications or continuous monitoring',
        'Vitals unstable: HR >100 or <50, SBP <90 or >180 mmHg, SpO₂ <94%, RR >25/min, Temp >38.5°C',
    ];
    const bySpec: Record<string, string[]> = {
        Respiratory: ['SpO₂ <92% on room air', 'PaO₂/FiO₂ ratio <300', 'Respiratory rate >30/min', 'Requiring NIV or invasive ventilation'],
        Cardiac: ['Troponin positive with haemodynamic compromise', 'Killip Class ≥ II', 'EF <40% with pulmonary oedema', 'Arrhythmia with haemodynamic compromise'],
        Neurology: ['GCS <14 or rapidly falling', 'New focal neurological deficit', 'Status epilepticus not terminating', 'Impending respiratory failure'],
        Gastroenterology: ['Active hematemesis or melena with tachycardia', 'Bilirubin >5 mg/dL rising', 'Serum amylase/lipase >3× ULN with pain', 'Signs of peritonitis'],
        Nephrology: ['Serum creatinine >3 mg/dL or rapidly rising', 'Oliguria <0.5 mL/kg/hr for >6 hours', 'Hyperkalemia >6.0 mEq/L', 'Fluid overload with pulmonary oedema'],
        Endocrinology: ['Blood glucose >400 mg/dL with ketonuria', 'Bicarbonate <18 or pH <7.3 (DKA)', 'Altered sensorium with hypoglycemia', 'Thyroid storm Burch-Wartofsky score ≥45'],
        Orthopedics: ['Open fracture requiring emergent debridement', 'Neurovascular compromise distal to fracture', 'Compartment syndrome features', 'Inability to weight-bear with CT/MRI evidence'],
        'General Surgery': ['Signs of peritonitis — guarding/rigidity', 'Bowel obstruction with vascular compromise', 'Escalating sepsis from surgical source', 'Burns >20% BSA'],
        'Obstetrics and Gynecology': ['SBP >160 or DBP >110 with proteinuria', 'Active obstetric hemorrhage with tachycardia', 'Foetal distress on CTG', 'Septic features post-delivery/abortion'],
        Pediatrics: ['Age <3 months with fever and toxicity', 'SpO₂ <92% in child with respiratory illness', 'Dehydration >10%', 'Altered sensorium or seizure in febrile child'],
        'Infectious Disease': ['Dengue with warning signs: platelet <50,000, haematocrit rise >20%', 'Malaria with parasitaemia >5% or cerebral features', 'Sepsis criteria: qSOFA ≥2', 'HIV with CD4 <200 with opportunistic infection'],
        Hematology: ['Hb <7 g/dL with symptomatic anemia', 'Platelet <20,000 with active bleeding', 'INR >3 in coagulopathy with bleeding', 'Blast crisis or ANC <500'],
        Oncology: ['Neutrophil count <500 with temperature >38.3°C', 'Spine compression with motor deficit', 'Calcium >12 mg/dL malignant hypercalcemia', 'Brain metastasis with cerebral oedema'],
        Psychiatry: ['Active suicidal/homicidal ideation with plan', 'Inability to care for self', 'Psychosis with aggression requiring de-escalation', 'Seizure-risk substance withdrawal'],
        'Emergency Medicine': ['Haemodynamic instability from trauma', 'GCS drop ≥2 points in polytrauma', 'Burns with airway involvement', 'Poisoning with altered consciousness'],
        Dermatology: ['Skin detachment >10% BSA (SJS/TEN)', 'Mucosal involvement with sepsis risk', 'Rapidly spreading necrotising infection', 'Inability to take oral medications'],
        Urology: ['Complete urinary retention with renal compromise', 'Urosepsis with haemodynamic instability', 'Stone with obstructive uropathy and AKI'],
    };
    const sp = bySpec[seed.specialty] || [];
    return [...base, ...sp];
}

// ── Documentation list builder ────────────────────────────────────────────────
function buildMustIncludeDocs(seed: any): string[] {
    const base = [
        'Signed pre-authorization request form',
        'Admission note with past medical/surgical history',
        'Vitals chart at admission (BP, HR, RR, SpO₂, Temp)',
        'Treating doctor\'s name and registration number',
    ];
    const bySpec: Record<string, string[]> = {
        Respiratory: ['Chest X-ray (PA/AP) at admission', 'SpO₂ / ABG report', 'Sputum culture & sensitivity', 'PFT report for COPD/Asthma'],
        Cardiac: ['12-lead ECG at admission', 'Troponin I or T assay with timestamp', '2D Echo report', 'Coronary angiogram report (if applicable)'],
        Neurology: ['CT brain (non-contrast) report', 'MRI brain with DWI if stroke', 'NIHSS score documented', 'CSF analysis for meningitis/encephalitis'],
        Gastroenterology: ['USG abdomen report', 'LFT / Serum amylase/lipase values', 'Endoscopy report for GI bleed', 'CT abdomen for surgical cases'],
        Nephrology: ['Serum creatinine BUN trend', 'Urine routine microscopy', '24-hr urine protein if nephrotic', 'Renal USG report'],
        Endocrinology: ['Blood glucose 4-hourly chart', 'HbA1c', 'ABG for DKA (pH, bicarbonate, anion gap)', 'TFT for thyroid conditions'],
        Orthopedics: ['Pre-op X-rays (AP + lateral)', 'MRI for soft tissue/disc injuries', 'Implant quotation and brand details', 'Surgeon\'s operative plan note'],
        'General Surgery': ['Pre-op investigations (CBC, LFT, RFT, ECG)', 'Anaesthesia fitness note', 'Operative findings note', 'HPE report for excised tissue'],
        'Obstetrics and Gynecology': ['Antenatal booking records', 'USG (latest with biometry)', 'Blood group & Rh typing', 'Partogram for labour cases'],
        Pediatrics: ['Weight-for-age chart', 'Vaccination history', 'Neonatology / Paediatric specialist note', 'Sepsis screen results'],
        'Infectious Disease': ['Blood culture reports (×2)', 'Relevant serology (Dengue/Malaria/Widal/Lepto)', 'HIV test result where relevant', 'Sensitivity-directed antibiotic chart'],
        Hematology: ['CBC with differential and peripheral smear', 'Coagulation profile (PT INR aPTT)', 'Bone marrow biopsy report (if applicable)', 'Transfusion records'],
        Oncology: ['Histopathology/biopsy report', 'Staging PET-CT or CT', 'Chemotherapy protocol sheet', 'ECOG/Karnofsky performance status'],
        Psychiatry: ['Psychiatrist assessment note', 'Risk assessment (suicide/violence)', 'Drug levels if applicable', 'Nursing observation chart'],
        'Emergency Medicine': ['ATLS primary + secondary survey', 'Mechanism of injury document', 'Toxicology screen report', 'GCS trend every 4 hours'],
        Dermatology: ['Clinical photographs at admission', 'Skin biopsy report', 'Ophthalmology review note for SJS', 'Wound culture results'],
        Urology: ['USG KUB or CT urography', 'Urine culture sensitivity', 'Urological specialist note', 'Pre-procedure creatinine'],
    };
    return [...base, ...(bySpec[seed.specialty] || [])];
}

// ── India-specific notes ──────────────────────────────────────────────────────
function buildIndiaNotes(seed: any): string {
    const notes: Record<string, string> = {
        Respiratory: 'TB is endemic in India — always rule out TB with sputum AFB/CBNAAT before starting empiric antibiotics. PMJAY covers pneumonia hospitalization. COVID-19 protocols were mandated 2020-23.',
        Cardiac: 'Rheumatic heart disease prevalence is high in India. PMJAY covers many cardiac procedures including PTCA and valve replacement. Urban hospitals see high STEMI burden with delayed presentations.',
        Neurology: 'Cysticercosis (NCC) is a common cause of seizures in India. Availability of IV tPA is limited to select centres. Stroke rehabilitation is a PMJAY covered service.',
        Gastroenterology: 'Typhoid, hepatitis A, and amoebic liver abscess are endemic. Alcohol-related liver disease is common. PMJAY covers ERCP and endoscopic interventions.',
        Nephrology: 'CKD secondary to diabetes and hypertension is rising rapidly. Haemodialysis is covered under PMJAY. Aristolochic acid nephropathy reported in herbal medicine users.',
        Endocrinology: 'India has 77+ million people with T2DM. DKA may present in newly diagnosed T2DM (ketosis-prone DM in South Asians). PMJAY covers diabetic foot management.',
        Orthopedics: 'Road traffic accidents are a leading cause of orthopedic admissions. PMJAY covers hip and knee replacements. Bone cement implantable classifiers require prior approval.',
        'General Surgery': 'Appendicitis, hernia, and gallbladder disease are high-volume procedures. PMJAY covers most elective and emergency surgical procedures. Laparoscopy preferred over open.',
        'Obstetrics and Gynecology': 'India has high maternal mortality ratio — PPH and eclampsia are leading causes. PMJAY Janani Suraksha Yojana covers institutional deliveries. LSCS rate rising.',
        Pediatrics: 'Neonatal sepsis and PEM are major paediatric burdens. Malnutrition management (SAM) is PMJAY covered. Kawasaki should be considered in prolonged fever > 5 days.',
        'Infectious Disease': 'Dengue, malaria (P. falciparum/vivax), scrub typhus, and leptospirosis are seasonal. Mucormycosis incidence surged post-COVID in India. HIV prevalence high in certain states (AP, Maharashtra).',
        Hematology: 'Sickle cell disease is prevalent in tribal populations (Odisha, MP, Maharashtra). Thalassemia major burden is high. PMJAY covers blood products and bone marrow transplant.',
        Oncology: 'Head & neck cancers and cervical cancer are leading in India. Tobacco/betel nut use correlates. PMJAY covers chemotherapy, radiation, and surgical oncology packages.',
        Psychiatry: 'Mental health beds are critically scarce in India. PMHANS scheme provides some coverage. Suicide risk assessment is mandatory per MHA 2017 guidelines.',
        'Emergency Medicine': 'Road traffic injuries are the leading cause of trauma in India. Snake envenomation (Russel viper/Cobra/Krait) is a significant rural emergency. Polytrauma PMJAY covered.',
        Dermatology: 'SJS/TEN risk high with allopurinol, sulfonamides, carbamazepine - common in India. Leprosy (Hansen disease) elimination achieved but still exists. PMJAY covers skin procedures.',
        Urology: 'Urinary tract stones prevalent due to dietary habits and climate. BPH is common in men > 50. PMJAY covers PCNL, ureteroscopy, TURP.',
    };
    return notes[seed.specialty] || 'India-specific documentation guidelines apply. Follow PMJAY pre-authorization norms.';
}

// ── Keywords / aliases builder ────────────────────────────────────────────────
function buildKeywords(seed: any): string[] {
    const base = [seed.condition_name.toLowerCase()];
    const hl = hinglish[seed.specialty] || [];
    // pick first 4 hinglish phrases relevant to this specialty
    return [...base, ...hl.slice(0, 4)];
}

// ── Condition builder ─────────────────────────────────────────────────────────
function buildCondition(seed: any): any {
    const primaryCode = seed.primary_code;
    const primaryDesc = icdDict[primaryCode] || 'CODE_NOT_IN_DICT';
    const variantFn = VARIANT_RULES[seed.specialty] || defaultVariants;
    const variants = variantFn(seed);
    const sp = seed.specialty;
    const los = losLib.by_specialty[sp] || { min: 3, typical: 5, icu_fraction: 0.1, note: '' };
    const assoc = assocLib.by_specialty[sp] || { symptoms: [], complications: [], comorbidities: [] };
    const tpaTriggers = [...(tqLib.tpa_universal || []), ...((tqLib.by_specialty || {})[sp] || [])].slice(0, 6);
    const procs = (procLib.by_specialty[sp] || []).slice(0, 8);
    const admissionCriteria = buildAdmissionCriteria(seed);
    const mustDocs = buildMustIncludeDocs(seed);
    const indiaNotes = buildIndiaNotes(seed);
    const keywords = buildKeywords(seed);

    // Gather 5+ associated codes (unique, from dict)
    const rawAssocCodes = [
        ...(assoc.symptoms || []),
        ...(assoc.complications || []),
        ...(assoc.comorbidities || []),
    ].filter(c => c !== primaryCode);
    const seen = new Set<string>();
    const associatedCodes: any[] = [];
    for (const code of rawAssocCodes) {
        if (!seen.has(code) && icdDict[code]) {
            seen.add(code);
            associatedCodes.push({ code, description: icdDict[code] });
        }
        if (associatedCodes.length >= 7) break;
    }

    return {
        id: seed.id,
        specialty: sp,
        icd_codes: {
            primary: { code: primaryCode, description: primaryDesc, version: 'ICD-10-CM 2024' },
            specific_variants: variants.slice(0, 5),
            associated_codes: associatedCodes,
        },
        condition_name: seed.condition_name,
        keywords,
        admission_criteria: admissionCriteria,
        expected_length_of_stay: {
            minimum_days: los.min,
            typical_days: los.typical,
            icu_days_if_applicable: Math.round(los.typical * los.icu_fraction),
            note: los.note,
        },
        expected_procedures: procs,
        tpa_query_triggers: tpaTriggers,
        must_include_in_documentation: mustDocs,
        india_specific_notes: indiaNotes,
        pmjay_eligible: seed.pmjay_eligible,
        package_rate_available: seed.package_rate_available,
        typical_package_codes: [],
        coding_systems_supported: ['ICD-10-CM 2024'],
        needs_manual_review: !icdDict[primaryCode],
    };
}

// ── Main ──────────────────────────────────────────────────────────────────────
const invalidCodes: string[] = [];
const missingVariants: string[] = [];

const conditions = seeds.map(seed => {
    if (!icdDict[seed.primary_code]) {
        invalidCodes.push(`${seed.id}: ${seed.primary_code}`);
    }
    const built = buildCondition(seed);
    if (built.icd_codes.specific_variants.length < 3) {
        missingVariants.push(seed.id);
    }
    return built;
});

const output = {
    metadata: {
        schema_version: '1.0.0',
        icd_version: 'ICD-10-CM 2024',
        generated_at: new Date().toISOString(),
        total_conditions: conditions.length,
        target_market: 'Indian private hospitals',
        tpa_compatibility: ['Medi Assist', 'MD India', 'FHPL', 'Paramount', 'Health India TPA'],
        specialties_covered: [...new Set(seeds.map(s => s.specialty))].length,
    },
    conditions,
};

const report = {
    total_built: conditions.length,
    invalid_codes: invalidCodes,
    missing_variants: missingVariants,
    needs_review: conditions.filter(c => c.needs_manual_review).map(c => c.id),
    by_specialty: Object.fromEntries(
        [...new Set(seeds.map(s => s.specialty))].map(sp => [
            sp, seeds.filter(s => s.specialty === sp).length,
        ])
    ),
};

const outDir = path.join(BASE, 'output');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'icd10_insurance_database_v1.json'), JSON.stringify(output, null, 2));
fs.writeFileSync(path.join(outDir, 'build_report.json'), JSON.stringify(report, null, 2));

console.log('\n✅  Build complete!');
console.log(`   Conditions built : ${conditions.length}`);
console.log(`   Invalid codes    : ${invalidCodes.length}${invalidCodes.length ? ' ⚠️' : ''}`);
console.log(`   Missing variants : ${missingVariants.length}${missingVariants.length ? ' ⚠️' : ''}`);
if (invalidCodes.length) console.log('   Invalid:', invalidCodes.join(', '));
console.log('\nOutput → output/icd10_insurance_database_v1.json');
console.log('Report → output/build_report.json\n');
