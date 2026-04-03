import { GoogleGenAI } from '@google/genai';
import {
  PatientRecord, InsurancePolicyDetails, ClinicalDetails,
  AdmissionDetails, DiagnosisEntry, WizardVoiceFinding
} from '../components/PreAuthWizard/types';

import { ICD10_TIER1, getAllTier1SearchTerms } from '../data/icd10Tier1Enriched';

// Build the prompt with injected database
const buildVoiceDictationPrompt = () => {
  const databaseSection = ICD10_TIER1
    .filter(c => c.id !== "FLOOR-001")
    .map(c => {
      const terms = getAllTier1SearchTerms(c).slice(0, 10);
      return `[\${c.icd_codes.primary.code}] \${c.condition_name}\n  Terms: \${terms.join(', ')}`;
    })
    .join('\n\n');
  
  return `
You are a medical transcription AI for Indian hospitals. Parse the doctor's voice dictation into structured clinical data.

═══════════════════════════════════════════════════════════════════════════════
ICD-10 CODE ASSIGNMENT RULES
═══════════════════════════════════════════════════════════════════════════════

SEARCH the database below to find the correct ICD-10 code. Follow these rules:

1. MATCH the diagnosis from the dictation against the "Terms" listed for each code
2. If CONFIDENT match found → Use that code
3. If diagnosis is RARE, GENETIC, or NOT in database → Use R69
4. If UNSURE → Use R69

CRITICAL RULES:
- ONLY use codes from this database
- NEVER invent or guess codes
- NEVER use a code that sounds similar but doesn't match
- R69 is the SAFE fallback — better R69 than wrong code

DURATION EXTRACTION (CRITICAL):
1. Extract duration from phrase like: "since X days", "X din se", "last X days", "for X days".
2. If no explicit duration, infer from context (e.g., "came this morning" -> "Few hours").
3. NEVER leave duration empty for emergency cases.

COMORBIDITY EXTRACTION:
Look for these keywords and extract:
- "diabetic" / "sugar patient" / "diabetes" -> diabetes: true
- "hypertensive" / "BP patient" -> hypertension: true
- "heart patient" / "cardiac history" -> heartDisease: true
- "kidney patient" / "CKD" -> kidney: true

═══════════════════════════════════════════════════════════════════════════════
FALLBACK CODE
═══════════════════════════════════════════════════════════════════════════════

[R69] Illness, unspecified
USE WHEN: Rare disease, genetic condition, unknown diagnosis, uncertain match, 
test data, gibberish, or anything not clearly matching above codes.

═══════════════════════════════════════════════════════════════════════════════
EXAMPLES
═══════════════════════════════════════════════════════════════════════════════

✅ "Patient has acute appendicitis" → K35.80 (matches "appendicitis" in database)
✅ "Dil ka daura pada" → I21.9 (matches Hindi term for heart attack)
✅ "Pneumonia with low oxygen" → J18.9 (matches "pneumonia")
✅ "Xeroderma pigmentosum syndrome" → R69 (rare genetic, NOT in database)
✅ "Test case xyz" → R69 (test data)
✅ "Some rare genetic disorder" → R69 (not in database)

═══════════════════════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════════════════

Return JSON only:
{
  "patient": {
    "patientName": "string or null",
    "age": number_or_null,
    "gender": "Male|Female|Other or null",
    "mobileNumber": "string or null",
    "address": "string or null",
    "city": "string or null",
    "occupation": "string or null"
  },
  "insurance": {
    "insurerName": "string or null",
    "policyNumber": "string or null",
    "tpaName": "string or null",
    "sumInsured": number_or_null
  },
  "clinical": {
    "chiefComplaints": "concise summary of main symptoms",
    "durationOfPresentAilment": "e.g. 5 days",
    "natureOfIllness": "Acute|Chronic|Acute on Chronic",
    "historyOfPresentIllness": "full narrative from notes",
    "relevantClinicalFindings": "examination/investigation findings",
    "treatmentTakenSoFar": "prior treatment or null",
    "reasonForHospitalisation": "why OPD is not sufficient",
    "additionalClinicalNotes": "any other relevant info",
    "diagnoses": [
      { 
        "diagnosis": "Full medical condition name", 
        "icd10Code": "REQUIRED ICD-10 code - see rules below", 
        "icd10Description": "Standard ICD-10 description",
        "isSurgical": true_or_false
      }
    ],
    "vitals": {
      "bp": "systolic/diastolic e.g. 100/70",
      "pulse": "number string e.g. 118",
      "temp": "degrees F string e.g. 102.8",
      "spo2": "percent string e.g. 86",
      "rr": "per min string e.g. 28"
    },
    "proposedLineOfTreatment": {
      "medical": true_or_false,
      "surgical": true_or_false,
      "intensiveCare": true_or_false,
      "investigation": true_or_false
    }
  },
  "admission": {
    "admissionType": "Emergency|Planned",
    "roomCategory": "General Ward|Semi-Private|Private|ICU|HDU",
    "expectedDaysInRoom": number,
    "expectedDaysInICU": number,
    "expectedLengthOfStay": number,
    "pastMedicalHistory": {
      "diabetes": { "present": true_or_false, "duration": "e.g. 8 years or null" },
      "hypertension": { "present": true_or_false, "duration": "string or null" },
      "heartDisease": { "present": true_or_false },
      "asthma": { "present": true_or_false },
      "epilepsy": { "present": true_or_false },
      "cancer": { "present": true_or_false },
      "kidney": { "present": true_or_false },
      "liver": { "present": true_or_false },
      "hiv": { "present": true_or_false },
      "alcoholism": { "present": true_or_false },
      "smoking": { "present": true_or_false }
    }
  }
}
`;
};

export const VOICE_DICTATION_PROMPT = buildVoiceDictationPrompt();


export interface VoiceExtractedData {
  patient: Partial<PatientRecord>;
  insurance: Partial<InsurancePolicyDetails>;
  clinical: Partial<ClinicalDetails>;
  admission: Partial<AdmissionDetails>;
  rawTranscript: string;
}

export async function parseTranscriptWithGemini(transcript: string): Promise<VoiceExtractedData> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
  const ai = new GoogleGenAI({ apiKey });

  const result = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: `${VOICE_DICTATION_PROMPT}\n\nDoctor's transcript:\n"""\n${transcript}\n"""` }] }],
    config: { temperature: 0.1, responseMimeType: 'application/json' }
  });

  const text = result.text ?? '{}';
  let parsed: any = {};
  try { parsed = JSON.parse(text); } catch { parsed = {}; }

  const c = parsed.clinical ?? {};
  const a = parsed.admission ?? {};
  const p = parsed.patient ?? {};
  const ins = parsed.insurance ?? {};
  
  // Need to import validateICDCodeAsync dynamically or have it injected to prevent loops, 
  // but let's assume it's available via a dynamic import since this is a service file.
  const { validateICDCodeAsync } = await import('./icdLookupService');

  const diagnoses: DiagnosisEntry[] = await Promise.all((c.diagnoses ?? []).map(async (d: any, i: number) => {
    let finalCode = d.icd10Code ?? '';
    let finalDesc = d.icd10Description ?? '';
    
    if (finalCode) {
      const validated = await validateICDCodeAsync(finalCode);
      if (validated.code && validated.code !== 'R69') {
        finalCode = validated.code;
        finalDesc = validated.description;
      }
    }
    
    return {
      diagnosis: d.diagnosis ?? '',
      icd10Code: finalCode,
      icd10Description: finalDesc,
      probability: 0.9,
      reasoning: '',
      isSelected: i === 0,
    };
  }));

  // voiceCapturedFindings is WizardVoiceFinding[] — leave empty, transcript goes to additionalClinicalNotes
  const voiceCapturedFindings: WizardVoiceFinding[] = [];

  const pmh = a.pastMedicalHistory ?? {};
  const defaultCond = { present: false };

  function extractDurationFromText(text: string): string | null {
    const patterns = [
      /(\\d+)\\s*(din|days?|hours?|ghante|weeks?|hafte)/i,
      /since\\s+(\\d+)\\s*(days?|hours?)/i,
      /(morning|evening|yesterday|kal|aaj)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    return null;
  }

  const duration = c.durationOfPresentAilment || extractDurationFromText(transcript) || 'Not specified';

  return {
    rawTranscript: transcript,
    patient: {
      patientName: p.patientName ?? undefined,
      age: p.age ?? undefined,
      gender: p.gender ?? undefined,
      mobileNumber: p.mobileNumber ?? undefined,
      address: p.address ?? undefined,
      city: p.city ?? undefined,
      occupation: p.occupation ?? undefined,
    },
    insurance: {
      insurerName: ins.insurerName ?? undefined,
      policyNumber: ins.policyNumber ?? undefined,
      tpaName: ins.tpaName ?? undefined,
      sumInsured: ins.sumInsured ?? undefined,
    },
    clinical: {
      dataSource: 'voice_scribe',
      chiefComplaints: c.chiefComplaints ?? '',
      durationOfPresentAilment: duration,
      natureOfIllness: c.natureOfIllness ?? 'Acute',
      historyOfPresentIllness: c.historyOfPresentIllness ?? '',
      relevantClinicalFindings: c.relevantClinicalFindings ?? '',
      treatmentTakenSoFar: c.treatmentTakenSoFar ?? '',
      reasonForHospitalisation: c.reasonForHospitalisation ?? '',
      additionalClinicalNotes: c.additionalClinicalNotes ?? transcript,
      diagnoses,
      selectedDiagnosisIndex: 0,
      vitals: {
        bp: c.vitals?.bp ?? '',
        pulse: c.vitals?.pulse ?? '',
        temp: c.vitals?.temp ?? '',
        spo2: c.vitals?.spo2 ?? '',
        rr: c.vitals?.rr ?? '',
      },
      proposedLineOfTreatment: {
        medical: c.proposedLineOfTreatment?.medical ?? false,
        surgical: c.proposedLineOfTreatment?.surgical ?? false,
        intensiveCare: c.proposedLineOfTreatment?.intensiveCare ?? false,
        investigation: c.proposedLineOfTreatment?.investigation ?? false,
        nonAllopathic: false,
      },
      proposedTreatmentDetails: {
        antibiotics: c.proposedTreatmentDetails?.antibiotics ?? '',
        oxygenTherapy: c.proposedTreatmentDetails?.oxygenTherapy ?? false,
        oxygenDetails: c.proposedTreatmentDetails?.oxygenDetails ?? '',
        ivFluids: c.proposedTreatmentDetails?.ivFluids ?? false,
        ivFluidDetails: '',
        nebulization: c.proposedTreatmentDetails?.nebulization ?? false,
        nebulizationDetails: '',
        insulinProtocol: c.proposedTreatmentDetails?.insulinProtocol ?? false,
        insulinDetails: '',
        pendingInvestigations: c.proposedTreatmentDetails?.pendingInvestigations ?? '',
        otherTreatments: '',
      },
      investigationsSent: {
        bloodCulture: c.investigationsSent?.bloodCulture ?? false,
        sputumCulture: c.investigationsSent?.sputumCulture ?? false,
        urineCulture: false,
        abg: c.investigationsSent?.abg ?? false,
        ecg: false,
        echo: false,
        ctScan: c.investigationsSent?.ctScan ?? false,
        mri: false,
        other: '',
      },
      investigationsResultsAvailable: '',
      investigationsPending: c.proposedTreatmentDetails?.pendingInvestigations ?? '',
      voiceCapturedFindings,
    },
    admission: {
      admissionType: a.admissionType ?? 'Emergency',
      roomCategory: a.roomCategory ?? 'General Ward',
      expectedDaysInRoom: a.expectedDaysInRoom ?? 0,
      expectedDaysInICU: a.expectedDaysInICU ?? 0,
      expectedLengthOfStay: a.expectedLengthOfStay ?? 0,
      pastMedicalHistory: {
        diabetes: pmh.diabetes?.present === true || pmh.diabetes === true || transcript.toLowerCase().includes('diabet') || transcript.toLowerCase().includes('sugar') ? { present: true, duration: pmh.diabetes?.duration || null } as any : defaultCond,
        hypertension: pmh.hypertension?.present === true || pmh.hypertension === true || transcript.toLowerCase().includes('hypertens') || transcript.toLowerCase().includes('bp') ? { present: true, duration: pmh.hypertension?.duration || null } as any : defaultCond,
        heartDisease: pmh.heartDisease?.present === true || pmh.heartDisease === true || transcript.toLowerCase().includes('heart') || transcript.toLowerCase().includes('cardiac') ? { present: true } as any : defaultCond,
        asthma: pmh.asthma?.present === true || pmh.asthma === true ? { present: true } as any : defaultCond,
        epilepsy: pmh.epilepsy?.present === true || pmh.epilepsy === true ? { present: true } as any : defaultCond,
        cancer: pmh.cancer?.present === true || pmh.cancer === true ? { present: true } as any : defaultCond,
        kidney: pmh.kidney?.present === true || pmh.kidney === true || transcript.toLowerCase().includes('ckd') || transcript.toLowerCase().includes('kidney') ? { present: true } as any : defaultCond,
        liver: pmh.liver?.present === true || pmh.liver === true ? { present: true } as any : defaultCond,
        hiv: pmh.hiv?.present === true || pmh.hiv === true ? { present: true } as any : defaultCond,
        alcoholism: pmh.alcoholism?.present === true || pmh.alcoholism === true ? { present: true } as any : defaultCond,
        smoking: pmh.smoking?.present === true || pmh.smoking === true ? { present: true } as any : defaultCond,
        anyOther: { present: false },
      },
      previousHospitalization: { wasHospitalizedBefore: false },
    },
  };
}
