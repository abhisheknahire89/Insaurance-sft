// ============================================================================
// INSURANCE CASE — THE SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * Every field in the system has not just a value, but metadata about
 * WHERE that value came from and WHEN it was set.
 */
export interface TrackedField<T> {
  value: T;
  source: 'voice' | 'manual' | 'emr' | 'computed' | 'default' | 'unknown';
  timestamp: Date;
  confidence?: number; // 0-1, for AI-extracted fields
  rawExtraction?: string; // Original text that was parsed
}

/**
 * Create a tracked field with source information
 */
export function tracked<T>(
  value: T, 
  source: TrackedField<T>['source'],
  options?: { confidence?: number; rawExtraction?: string }
): TrackedField<T> {
  return {
    value,
    source,
    timestamp: new Date(),
    confidence: options?.confidence,
    rawExtraction: options?.rawExtraction,
  };
}

/**
 * Create a default tracked field (used for initialization)
 */
export function defaultField<T>(value: T): TrackedField<T> {
  return tracked(value, 'default');
}

/**
 * Get the raw value from a tracked field (for display/computation)
 */
export function val<T>(field: TrackedField<T> | undefined): T | undefined {
  return field?.value;
}

// ============================================================================
// PATIENT DATA
// ============================================================================

export interface PatientData {
  patientName: TrackedField<string>;
  age: TrackedField<number>;
  gender: TrackedField<'Male' | 'Female' | 'Other'>;
  dateOfBirth: TrackedField<string>;
  mobileNumber: TrackedField<string>;
  address: TrackedField<string>;
  city: TrackedField<string>;
  state: TrackedField<string>;
  pincode: TrackedField<string>;
  occupation: TrackedField<string>;
  uhid: TrackedField<string>;
  abhaId: TrackedField<string>;
}

// ============================================================================
// INSURANCE DATA
// ============================================================================

export interface InsuranceData {
  insurerName: TrackedField<string>;
  tpaName: TrackedField<string>;
  tpaCardNumber: TrackedField<string>;
  policyNumber: TrackedField<string>;
  policyType: TrackedField<string>;
  policyStartDate: TrackedField<string>;
  policyEndDate: TrackedField<string>;
  sumInsured: TrackedField<number>;
  proposerName: TrackedField<string>;
  insuredName: TrackedField<string>;
  relationship: TrackedField<string>;
}

// ============================================================================
// CLINICAL DATA
// ============================================================================

export interface VitalsData {
  bloodPressure: TrackedField<string>; // "120/80"
  systolic: TrackedField<number>;
  diastolic: TrackedField<number>;
  pulse: TrackedField<number>;
  spo2: TrackedField<number>;
  respiratoryRate: TrackedField<number>;
  temperature: TrackedField<number>;
  gcs: TrackedField<number>;
}

export interface ClinicalData {
  chiefComplaints: TrackedField<string>;
  duration: TrackedField<string>;
  natureOfIllness: TrackedField<'Acute' | 'Chronic' | 'Acute on Chronic'>;
  relevantFindings: TrackedField<string>;
  investigations: TrackedField<string>;
  provisionalDiagnosis: TrackedField<string>;
  treatmentPlan: TrackedField<string>;
  vitals: VitalsData;
}

// ============================================================================
// ADMISSION DATA
// ============================================================================

export interface ComorbidityData {
  diabetes: TrackedField<boolean>;
  hypertension: TrackedField<boolean>;
  heartDisease: TrackedField<boolean>;
  kidney: TrackedField<boolean>;
  liver: TrackedField<boolean>;
  respiratory: TrackedField<boolean>;
  cancer: TrackedField<boolean>;
  other: TrackedField<string>;
}

export interface AdmissionData {
  dateOfAdmission: TrackedField<string>;
  timeOfAdmission: TrackedField<string>;
  admissionType: TrackedField<'Emergency' | 'Elective'>;
  roomCategory: TrackedField<'General Ward' | 'Semi-Private' | 'Private' | 'ICU'>;
  expectedLOS: TrackedField<number>;
  expectedICUDays: TrackedField<number>;
  treatmentType: TrackedField<{
    medical: boolean;
    surgical: boolean;
    icu: boolean;
    investigation: boolean;
  }>;
  pastMedicalHistory: ComorbidityData;
}

// ============================================================================
// COMPUTED DATA (Engine Outputs)
// ============================================================================

export interface ICDResult {
  primaryCode: TrackedField<string>;
  primaryDescription: TrackedField<string>;
  confidence: TrackedField<number>;
  tier: TrackedField<1 | 2 | 3 | 'FLOOR'>;
  validationStatus: TrackedField<'valid' | 'needs_review' | 'fallback'>;
  isSurgical: TrackedField<boolean>;
  specialty: TrackedField<string>;
}

export interface SeverityResult {
  overallLevel: TrackedField<'Low' | 'Moderate' | 'High' | 'Critical'>;
  overallScore: TrackedField<number>;
  phenoIntensity: TrackedField<number>;
  urgencyQuotient: TrackedField<number>;
  deteriorationVelocity: TrackedField<number>;
  icuRequired: TrackedField<boolean>;
  redFlags: TrackedField<string[]>;
}

export interface CostBreakdown {
  roomRent: TrackedField<number>;
  nursingCharges: TrackedField<number>;
  icuCharges: TrackedField<number>;
  otCharges: TrackedField<number>;
  surgeonFee: TrackedField<number>;
  anesthetistFee: TrackedField<number>;
  consultantFee: TrackedField<number>;
  investigations: TrackedField<number>;
  medicines: TrackedField<number>;
  consumables: TrackedField<number>;
  implants: TrackedField<number>;
  miscellaneous: TrackedField<number>;
}

export interface CostResult {
  totalEstimate: TrackedField<number>;
  claimedAmount: TrackedField<number>;
  breakdown: CostBreakdown;
  los: {
    totalDays: TrackedField<number>;
    wardDays: TrackedField<number>;
    icuDays: TrackedField<number>;
  };
}

export interface MedicalNecessityResult {
  statement: TrackedField<string>;
  vitalInterpretation: TrackedField<string>;
  hospitalizationReasons: TrackedField<string[]>;
  opdContraindication: TrackedField<string>;
}

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
  blocking: boolean; // If true, blocks PDF generation
}

export interface ValidationResult {
  isValid: boolean;
  completenessScore: number; // 0-100
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ============================================================================
// THE MASTER TYPE — SINGLE SOURCE OF TRUTH
// ============================================================================

export interface InsuranceCase {
  // Metadata
  caseId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'validating' | 'validated' | 'generating' | 'complete' | 'error';
  
  // Input tracking
  inputSource: 'voice' | 'manual' | 'emr' | 'mixed';
  rawInput?: string; // Original transcript or EMR data
  
  // Core data sections
  patient: PatientData;
  insurance: InsuranceData;
  clinical: ClinicalData;
  admission: AdmissionData;
  
  // Engine outputs (computed from core data)
  computed: {
    icd: ICDResult | null;
    severity: SeverityResult | null;
    cost: CostResult | null;
    medicalNecessity: MedicalNecessityResult | null;
  };
  
  // Validation state
  validation: ValidationResult;
  
  // Debug trace
  trace: TraceEntry[];
}

export interface TraceEntry {
  timestamp: Date;
  action: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
  source?: string;
}

// ============================================================================
// FACTORY FUNCTION — Create empty InsuranceCase
// ============================================================================

export function createEmptyInsuranceCase(): InsuranceCase {
  const now = new Date();
  const caseId = `PA-AIVANA-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  
  return {
    caseId,
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    inputSource: 'manual',
    
    patient: {
      patientName: defaultField(''),
      age: defaultField(0),
      gender: defaultField('Male'),
      dateOfBirth: defaultField(''),
      mobileNumber: defaultField(''),
      address: defaultField(''),
      city: defaultField(''),
      state: defaultField(''),
      pincode: defaultField(''),
      occupation: defaultField(''),
      uhid: defaultField(''),
      abhaId: defaultField(''),
    },
    
    insurance: {
      insurerName: defaultField(''),
      tpaName: defaultField(''),
      tpaCardNumber: defaultField(''),
      policyNumber: defaultField(''),
      policyType: defaultField(''),
      policyStartDate: defaultField(''),
      policyEndDate: defaultField(''),
      sumInsured: defaultField(0),
      proposerName: defaultField(''),
      insuredName: defaultField(''),
      relationship: defaultField(''),
    },
    
    clinical: {
      chiefComplaints: defaultField(''),
      duration: defaultField(''),
      natureOfIllness: defaultField('Acute'),
      relevantFindings: defaultField(''),
      investigations: defaultField(''),
      provisionalDiagnosis: defaultField(''),
      treatmentPlan: defaultField(''),
      vitals: {
        bloodPressure: defaultField(''),
        systolic: defaultField(0),
        diastolic: defaultField(0),
        pulse: defaultField(0),
        spo2: defaultField(0),
        respiratoryRate: defaultField(0),
        temperature: defaultField(0),
        gcs: defaultField(15),
      },
    },
    
    admission: {
      dateOfAdmission: defaultField(now.toISOString().slice(0, 10)),
      timeOfAdmission: defaultField(now.toTimeString().slice(0, 5)),
      admissionType: defaultField('Emergency'),
      roomCategory: defaultField('General Ward'),
      expectedLOS: defaultField(3),
      expectedICUDays: defaultField(0),
      treatmentType: defaultField({
        medical: true,
        surgical: false,
        icu: false,
        investigation: false,
      }),
      pastMedicalHistory: {
        diabetes: defaultField(false),
        hypertension: defaultField(false),
        heartDisease: defaultField(false),
        kidney: defaultField(false),
        liver: defaultField(false),
        respiratory: defaultField(false),
        cancer: defaultField(false),
        other: defaultField(''),
      },
    },
    
    computed: {
      icd: null,
      severity: null,
      cost: null,
      medicalNecessity: null,
    },
    
    validation: {
      isValid: false,
      completenessScore: 0,
      errors: [],
      warnings: [],
    },
    
    trace: [{
      timestamp: now,
      action: 'CASE_CREATED',
    }],
  };
}
