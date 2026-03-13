import { GoogleGenAI } from '@google/genai';
import {
  PatientRecord, InsurancePolicyDetails, ClinicalDetails,
  AdmissionDetails, DiagnosisEntry, WizardVoiceFinding
} from '../components/PreAuthWizard/types';

const PROMPT = `You are a medical AI that parses a doctor's dictated clinical notes into structured JSON for an insurance pre-authorization form.

Extract ALL available information from the transcript and return a JSON object.
If a field is not mentioned, use null. Do NOT make up values not in the transcript.
Return ONLY valid JSON, no markdown, no code fences.

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

═══════════════════════════════════════════════════════════════════════════════
CRITICAL ICD-10 CODE RULES — YOU MUST FOLLOW THESE
═══════════════════════════════════════════════════════════════════════════════

1. The icd10Code field is MANDATORY. NEVER return empty, null, or blank for icd10Code.

2. Use the MOST SPECIFIC ICD-10-CM code available. Format: Letter + 2 digits + optional decimal + up to 4 more characters.

3. COMMON ICD-10 CODES BY SPECIALTY:

RESPIRATORY:
- J15.9 = Bacterial pneumonia, unspecified
- J18.9 = Pneumonia, unspecified organism  
- J44.1 = COPD with acute exacerbation
- J45.901 = Asthma, acute exacerbation
- J96.00 = Acute respiratory failure

CARDIAC:
- I21.9 = Acute myocardial infarction, unspecified
- I21.3 = STEMI of unspecified site
- I50.9 = Heart failure, unspecified
- I48.91 = Atrial fibrillation
- I10 = Essential hypertension

INFECTIOUS:
- A41.9 = Sepsis, unspecified organism
- A09 = Infectious gastroenteritis
- A41.01 = Sepsis due to MSSA
- B34.9 = Viral infection, unspecified
- A75.3 = Scrub typhus

GASTROINTESTINAL:
- K35.80 = Acute appendicitis, unspecified
- K80.00 = Cholelithiasis (gallstones)
- K85.9 = Acute pancreatitis, unspecified
- K92.2 = GI hemorrhage, unspecified
- K56.7 = Intestinal obstruction

RENAL/UROLOGICAL:
- N17.9 = Acute kidney injury, unspecified
- N39.0 = Urinary tract infection
- N20.0 = Kidney stones
- N18.6 = End-stage renal disease

NEUROLOGICAL:
- I63.9 = Cerebral infarction (stroke), unspecified
- I61.9 = Intracerebral hemorrhage
- G40.909 = Epilepsy, unspecified
- G41.9 = Status epilepticus

ENDOCRINE:
- E11.9 = Type 2 diabetes mellitus without complications
- E10.10 = Type 1 DM with ketoacidosis
- E11.65 = Type 2 DM with hyperglycemia
- E05.90 = Thyrotoxicosis/hyperthyroidism

TRAUMA/SURGICAL:
- S72.90 = Fracture of femur
- S82.90 = Fracture of leg
- T79.4 = Traumatic shock
- K40.90 = Inguinal hernia

OBSTETRIC:
- O80 = Normal delivery
- O82 = Cesarean delivery
- O14.1 = Severe pre-eclampsia
- O72.0 = Postpartum hemorrhage

PSYCHIATRIC:
- F32.9 = Major depressive disorder
- F31.9 = Bipolar disorder
- F20.9 = Schizophrenia

PEDIATRIC:
- P59.9 = Neonatal jaundice
- J21.9 = Acute bronchiolitis
- A08.0 = Rotavirus enteritis

4. THE "IF IN DOUBT" RULE:
If the diagnosis name is mentioned but the ICD code is not, YOU MUST infer the most likely code from the lists above. 
- If "Pneumonia" -> use J18.9
- If "Heart Attack" -> use I21.9
- If "Stroke" -> use I63.9
- If "Appendicitis" -> use K35.80
- If NO clue remains, use "R69" (Illness, unspecified), but NEVER leave it blank.

5. Use the MOST SPECIFIC UNSPECIFIED variant (usually .9 or .90) if clinical specifics are missing.

6. For multiple diagnoses, list PRIMARY diagnosis first. 
`;

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
    contents: [{ role: 'user', parts: [{ text: `${PROMPT}\n\nDoctor's transcript:\n"""\n${transcript}\n"""` }] }],
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
