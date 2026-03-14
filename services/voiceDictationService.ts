import { GoogleGenAI } from '@google/genai';
import {
  PatientRecord, InsurancePolicyDetails, ClinicalDetails,
  AdmissionDetails, DiagnosisEntry, WizardVoiceFinding
} from '../components/PreAuthWizard/types';

import { formatDatabaseForGemini } from '../data/icd10MasterDatabase';

// Build the prompt with injected database
const buildVoiceDictationPrompt = () => {
  const databaseSection = formatDatabaseForGemini();
  
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

═══════════════════════════════════════════════════════════════════════════════
ICD-10 DATABASE
═══════════════════════════════════════════════════════════════════════════════

${databaseSection}

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

  const diagnoses: DiagnosisEntry[] = (c.diagnoses ?? []).map((d: any, i: number) => ({
    diagnosis: d.diagnosis ?? '',
    icd10Code: d.icd10Code ?? '',
    icd10Description: d.icd10Description ?? '',
    probability: 0.9,
    reasoning: '',
    isSelected: i === 0,
  }));

  // voiceCapturedFindings is WizardVoiceFinding[] — leave empty, transcript goes to additionalClinicalNotes
  const voiceCapturedFindings: WizardVoiceFinding[] = [];

  const pmh = a.pastMedicalHistory ?? {};
  const defaultCond = { present: false };

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
      durationOfPresentAilment: c.durationOfPresentAilment ?? '',
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
        diabetes: pmh.diabetes ?? defaultCond,
        hypertension: pmh.hypertension ?? defaultCond,
        heartDisease: pmh.heartDisease ?? defaultCond,
        asthma: pmh.asthma ?? defaultCond,
        epilepsy: pmh.epilepsy ?? defaultCond,
        cancer: pmh.cancer ?? defaultCond,
        kidney: pmh.kidney ?? defaultCond,
        liver: pmh.liver ?? defaultCond,
        hiv: pmh.hiv ?? defaultCond,
        alcoholism: pmh.alcoholism ?? defaultCond,
        smoking: pmh.smoking ?? defaultCond,
        anyOther: { present: false },
      },
      previousHospitalization: { wasHospitalizedBefore: false },
    },
  };
}
