export interface DdxItem {
  diagnosis: string;
  rationale: string;
  confidence: 'High' | 'Medium' | 'Low';
  probability: number;
}

export interface CoPilotRefinementSuggestion {
  suggestion: string;
}

export interface CoPilotFollowUpQuestion {
  question: string;
}

export interface CoPilotRecommendedTest {
  test: string;
}

export interface CoPilotEvidence {
  citation: string;
}

export interface CoPilotSuggestion {
  differentials: DdxItem[];
  refinementSuggestions: CoPilotRefinementSuggestion[];
  followUpQuestions: CoPilotFollowUpQuestion[];
  recommendedTests: CoPilotRecommendedTest[];
  managementNextSteps: string[];
  evidenceAndCitations: CoPilotEvidence[];
}

export interface Sender {
  id: string;
  name: string;
  role?: string;
}

export interface StructuredDataType {
  type: string;
  data: any;
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  structuredData?: StructuredDataType;
  action_type?: 'Informational' | 'Requires Clinician Confirmation';
  is_confirmed?: boolean;
}

export interface ExtractedTestResult {
  testName: string;
  value: string;
  unit: string;
  interpretation: 'normal' | 'abnormal_high' | 'abnormal_low' | 'critical';
  spokenText: string;
  documentAttached: boolean;
  documentId?: string;
}

export interface PatientInfo {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  uhid: string;
  policyNumber?: string;
  tpaName?: string;
}

export interface ConsultationInfo {
  date: string;
  doctorName: string;
  doctorLicense: string;
  department: string;
}

export interface NexusInsuranceInput {
  ddx: DdxItem[];
  severity: {
    phenoIntensity: number;
    urgencyQuotient: number;
    deteriorationVelocity: number;
    mustNotMiss: boolean;
    redFlagSeverity: 'none' | 'minor' | 'moderate' | 'critical';
  };
  keyFindings: string[];
  vitals: {
    bp: string;
    pulse: string;
    temp: string;
    spo2: string;
    rr: string;
  };
  extractedTestResults: ExtractedTestResult[];
}

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'image';
  uploadedAt: string;
  linkedToTest?: string;
  base64Data?: string;
}

export interface PreAuthSubmission {
  primaryDiagnosis: DdxItem;
  icd10Code: string;
  severityScores: NexusInsuranceInput['severity'];
  severityOverride?: {
    overridden: boolean;
    newSeverity: string;
    justification: string;
  };
  keyFindings: string[];
  testResults: ExtractedTestResult[];
  uploadedDocuments: UploadedDocument[];
  clinicalNotes: string;
  medicalNecessityStatement: string;
  documentationStatus: 'complete' | 'pending_documents';
  pendingDocuments: string[];
  doctorConfirmation: {
    confirmed: boolean;
    confirmedAt: string;
    doctorName: string;
    doctorLicense: string;
  };
  disclaimer: string;
}
