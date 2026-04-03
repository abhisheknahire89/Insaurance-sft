import { 
  InsuranceCase, 
  TrackedField, 
  tracked, 
  createEmptyInsuranceCase 
} from '../types/InsuranceCase';

// ============================================================================
// GEMINI PROMPT FOR EXTRACTION
// ============================================================================

const EXTRACTION_PROMPT = `
You are a medical data extraction AI. Extract structured data from the following clinical transcript.

EXTRACTION RULES:
1. Extract ONLY what is explicitly stated or clearly implied
2. For age: Look for "X saal", "X years old", "X yo", etc.
3. For insurance: Look for company names like "Star Health", "HDFC Ergo", "Oriental", etc.
4. For sum insured: Look for "X lakh", "X lac", "₹X", etc.
5. For diagnosis: Extract the PRIMARY diagnosis (main reason for admission)
6. For comorbidities: Extract secondary conditions (diabetes, HTN, etc.)
7. For vitals: Parse BP as "systolic/diastolic", SpO2 as percentage, etc.
8. For room: Look for "ICU", "ward", "semi-private", etc.

CRITICAL: 
- If a value is NOT mentioned, return null (not empty string, not 0)
- If diagnosis is STEMI/heart attack/MI, set primaryDiagnosis to "Acute myocardial infarction"
- If patient needs ICU, set roomCategory to "ICU"
- Extract comorbidities separately from primary diagnosis

Return ONLY valid JSON in this exact format:
{
  "patient": {
    "name": string | null,
    "age": number | null,
    "gender": "Male" | "Female" | null,
    "mobile": string | null
  },
  "insurance": {
    "insurerName": string | null,
    "policyNumber": string | null,
    "tpaName": string | null,
    "sumInsured": number | null
  },
  "clinical": {
    "chiefComplaints": string | null,
    "duration": string | null,
    "primaryDiagnosis": string | null,
    "relevantFindings": string | null,
    "vitals": {
      "bp": string | null,
      "pulse": number | null,
      "spo2": number | null,
      "rr": number | null,
      "temp": number | null
    }
  },
  "admission": {
    "type": "Emergency" | "Elective" | null,
    "roomCategory": "General Ward" | "Semi-Private" | "Private" | "ICU" | null,
    "needsICU": boolean,
    "needsSurgery": boolean
  },
  "comorbidities": {
    "diabetes": boolean,
    "hypertension": boolean,
    "heartDisease": boolean,
    "other": string | null
  }
}

TRANSCRIPT:
`;

// ============================================================================
// PARSE VOICE TRANSCRIPT
// ============================================================================

export async function parseVoiceTranscript(
  transcript: string
): Promise<Partial<InsuranceCase>> {
  
  console.log('[Parser] Starting voice extraction for:', transcript.slice(0, 100) + '...');
  
  // Call Gemini API
  const response = await fetch('/api/gemini/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: EXTRACTION_PROMPT + transcript,
    }),
  });
  
  const result = await response.json();
  
  // Parse the JSON response
  let extracted;
  try {
    // Handle markdown code blocks
    const jsonStr = result.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    extracted = JSON.parse(jsonStr);
  } catch (e) {
    console.error('[Parser] Failed to parse Gemini response:', e);
    throw new Error('Failed to parse voice transcript');
  }
  
  console.log('[Parser] Extracted data:', extracted);
  
  // Convert to InsuranceCase format with source tracking
  const insuranceCase: Partial<InsuranceCase> = {
    inputSource: 'voice',
    rawInput: transcript,
  };
  
  // Patient data
  if (extracted.patient) {
    insuranceCase.patient = {
      patientName: extracted.patient.name 
        ? tracked(extracted.patient.name, 'voice', { rawExtraction: transcript })
        : undefined,
      age: extracted.patient.age 
        ? tracked(extracted.patient.age, 'voice', { rawExtraction: transcript })
        : undefined,
      gender: extracted.patient.gender 
        ? tracked(extracted.patient.gender, 'voice')
        : undefined,
      mobileNumber: extracted.patient.mobile 
        ? tracked(extracted.patient.mobile, 'voice')
        : undefined,
    } as any;
  }
  
  // Insurance data
  if (extracted.insurance) {
    insuranceCase.insurance = {
      insurerName: extracted.insurance.insurerName 
        ? tracked(extracted.insurance.insurerName, 'voice', { 
            confidence: 0.9,
            rawExtraction: transcript 
          })
        : undefined,
      policyNumber: extracted.insurance.policyNumber 
        ? tracked(extracted.insurance.policyNumber, 'voice')
        : undefined,
      tpaName: extracted.insurance.tpaName 
        ? tracked(extracted.insurance.tpaName, 'voice')
        : undefined,
      sumInsured: extracted.insurance.sumInsured 
        ? tracked(extracted.insurance.sumInsured, 'voice', {
            rawExtraction: transcript
          })
        : undefined,
    } as any;
  }
  
  // Clinical data
  if (extracted.clinical) {
    const vitals = extracted.clinical.vitals || {};
    let systolic = 0, diastolic = 0;
    
    if (vitals.bp) {
      const [sys, dia] = vitals.bp.split('/').map(Number);
      systolic = sys || 0;
      diastolic = dia || 0;
    }
    
    insuranceCase.clinical = {
      chiefComplaints: extracted.clinical.chiefComplaints 
        ? tracked(extracted.clinical.chiefComplaints, 'voice')
        : undefined,
      duration: extracted.clinical.duration 
        ? tracked(extracted.clinical.duration, 'voice')
        : undefined,
      provisionalDiagnosis: extracted.clinical.primaryDiagnosis 
        ? tracked(extracted.clinical.primaryDiagnosis, 'voice', {
            confidence: 0.85,
            rawExtraction: transcript
          })
        : undefined,
      relevantFindings: extracted.clinical.relevantFindings 
        ? tracked(extracted.clinical.relevantFindings, 'voice')
        : undefined,
      vitals: {
        bloodPressure: vitals.bp 
          ? tracked(vitals.bp, 'voice')
          : undefined,
        systolic: systolic > 0 
          ? tracked(systolic, 'voice')
          : undefined,
        diastolic: diastolic > 0 
          ? tracked(diastolic, 'voice')
          : undefined,
        pulse: vitals.pulse 
          ? tracked(vitals.pulse, 'voice')
          : undefined,
        spo2: vitals.spo2 
          ? tracked(vitals.spo2, 'voice')
          : undefined,
        respiratoryRate: vitals.rr 
          ? tracked(vitals.rr, 'voice')
          : undefined,
        temperature: vitals.temp 
          ? tracked(vitals.temp, 'voice')
          : undefined,
      } as any,
    } as any;
  }
  
  // Admission data
  if (extracted.admission) {
    insuranceCase.admission = {
      admissionType: extracted.admission.type 
        ? tracked(extracted.admission.type, 'voice')
        : undefined,
      roomCategory: extracted.admission.roomCategory 
        ? tracked(extracted.admission.roomCategory, 'voice')
        : extracted.admission.needsICU 
          ? tracked('ICU', 'voice')
          : undefined,
      treatmentType: tracked({
        medical: true,
        surgical: extracted.admission.needsSurgery || false,
        icu: extracted.admission.needsICU || false,
        investigation: true,
      }, 'voice'),
    } as any;
    
    // Comorbidities
    if (extracted.comorbidities) {
      insuranceCase.admission.pastMedicalHistory = {
        diabetes: tracked(extracted.comorbidities.diabetes || false, 'voice'),
        hypertension: tracked(extracted.comorbidities.hypertension || false, 'voice'),
        heartDisease: tracked(extracted.comorbidities.heartDisease || false, 'voice'),
        other: extracted.comorbidities.other 
          ? tracked(extracted.comorbidities.other, 'voice')
          : undefined,
      } as any;
    }
  }
  
  console.log('[Parser] Converted to InsuranceCase:', insuranceCase);
  
  return insuranceCase;
}

// ============================================================================
// MERGE EXTRACTED DATA INTO EXISTING CASE
// ============================================================================

export function mergeIntoCase(
  existingCase: InsuranceCase,
  newData: Partial<InsuranceCase>
): InsuranceCase {
  
  const merged = { ...existingCase };
  merged.updatedAt = new Date();
  
  // Add trace entry
  merged.trace.push({
    timestamp: new Date(),
    action: 'MERGE_DATA',
    source: newData.inputSource || 'unknown',
  });
  
  // Deep merge each section, preferring new non-null values
  if (newData.patient) {
    merged.patient = mergeSection(merged.patient, newData.patient, merged.trace);
  }
  if (newData.insurance) {
    merged.insurance = mergeSection(merged.insurance, newData.insurance, merged.trace);
  }
  if (newData.clinical) {
    merged.clinical = mergeSection(merged.clinical, newData.clinical, merged.trace);
  }
  if (newData.admission) {
    merged.admission = mergeSection(merged.admission, newData.admission, merged.trace);
  }
  
  // Update input source
  if (newData.inputSource) {
    if (merged.inputSource === 'manual' || merged.inputSource === newData.inputSource) {
      merged.inputSource = newData.inputSource;
    } else {
      merged.inputSource = 'mixed';
    }
  }
  
  // Store raw input
  if (newData.rawInput) {
    merged.rawInput = newData.rawInput;
  }
  
  console.log('[Parser] Merged case:', merged);
  
  return merged;
}

function mergeSection<T extends Record<string, any>>(
  existing: T,
  incoming: Partial<T>,
  trace: any[]
): T {
  const result = { ...existing };
  
  for (const [key, value] of Object.entries(incoming)) {
    if (value !== undefined && value !== null) {
      // Check if it's a TrackedField
      if (value && typeof value === 'object' && 'value' in value && 'source' in value) {
        const trackedValue = value as TrackedField<any>;
        // Only overwrite if new value is from a "better" source
        const existingTracked = existing[key] as TrackedField<any> | undefined;
        
        if (!existingTracked || existingTracked.source === 'default' || trackedValue.source !== 'default') {
          // Log the change
          trace.push({
            timestamp: new Date(),
            action: 'FIELD_UPDATE',
            field: key,
            oldValue: existingTracked?.value,
            newValue: trackedValue.value,
            source: trackedValue.source,
          });
          
          result[key as keyof T] = value as any;
        }
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursively merge nested objects
        result[key as keyof T] = mergeSection(existing[key] || {}, value, trace);
      } else {
        result[key as keyof T] = value as any;
      }
    }
  }
  
  return result;
}
