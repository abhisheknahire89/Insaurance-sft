import { InsuranceCase, ValidationResult, ValidationError, val } from '../types/InsuranceCase';

// ============================================================================
// VALIDATION RULES
// ============================================================================

export function validateCase(insuranceCase: InsuranceCase): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  // =========================================================================
  // CRITICAL VALIDATIONS (blocking)
  // =========================================================================
  
  // Patient name
  const patientName = val(insuranceCase.patient?.patientName);
  if (!patientName || patientName === '' || patientName === 'Unknown') {
    errors.push({
      field: 'patient.patientName',
      code: 'PATIENT_NAME_REQUIRED',
      message: 'Patient name is required',
      severity: 'error',
      blocking: true,
    });
  }
  
  // Patient age
  const age = val(insuranceCase.patient?.age);
  if (!age || age === 0) {
    errors.push({
      field: 'patient.age',
      code: 'PATIENT_AGE_REQUIRED',
      message: 'Patient age is required',
      severity: 'error',
      blocking: true,
    });
  } else if (age > 150 || age < 0) {
    errors.push({
      field: 'patient.age',
      code: 'PATIENT_AGE_INVALID',
      message: `Age ${age} is invalid. Please check.`,
      severity: 'error',
      blocking: true,
    });
  }
  
  // Insurance policy number
  const policyNumber = val(insuranceCase.insurance?.policyNumber);
  if (!policyNumber || policyNumber === '') {
    errors.push({
      field: 'insurance.policyNumber',
      code: 'POLICY_NUMBER_REQUIRED',
      message: 'Policy number is required for pre-auth',
      severity: 'error',
      blocking: true,
    });
  }
  
  // Insurer name
  const insurerName = val(insuranceCase.insurance?.insurerName);
  if (!insurerName || insurerName === '') {
    errors.push({
      field: 'insurance.insurerName',
      code: 'INSURER_REQUIRED',
      message: 'Insurance company name is required',
      severity: 'error',
      blocking: true,
    });
  }
  
  // Chief complaints
  const chiefComplaints = val(insuranceCase.clinical?.chiefComplaints);
  if (!chiefComplaints || chiefComplaints === '') {
    errors.push({
      field: 'clinical.chiefComplaints',
      code: 'CHIEF_COMPLAINTS_REQUIRED',
      message: 'Chief complaints must be documented',
      severity: 'error',
      blocking: true,
    });
  }
  
  // Diagnosis
  const diagnosis = val(insuranceCase.clinical?.provisionalDiagnosis);
  if (!diagnosis || diagnosis === '') {
    errors.push({
      field: 'clinical.provisionalDiagnosis',
      code: 'DIAGNOSIS_REQUIRED',
      message: 'Provisional diagnosis is required',
      severity: 'error',
      blocking: true,
    });
  }
  
  // =========================================================================
  // ICD-10 VALIDATION
  // =========================================================================
  
  const icdCode = val(insuranceCase.computed?.icd?.primaryCode);
  const icdStatus = val(insuranceCase.computed?.icd?.validationStatus);
  
  if (!icdCode) {
    errors.push({
      field: 'computed.icd.primaryCode',
      code: 'ICD_NOT_COMPUTED',
      message: 'ICD-10 code has not been computed yet',
      severity: 'error',
      blocking: true,
    });
  } else if (icdCode === 'R69') {
    errors.push({
      field: 'computed.icd.primaryCode',
      code: 'ICD_FALLBACK_USED',
      message: 'ICD-10 code defaulted to R69 (unspecified). Please specify a valid diagnosis.',
      severity: 'error',
      blocking: true,
    });
  }
  
  // =========================================================================
  // COST VALIDATION
  // =========================================================================
  
  const totalCost = val(insuranceCase.computed?.cost?.totalEstimate);
  
  if (!totalCost || totalCost === 0) {
    errors.push({
      field: 'computed.cost.totalEstimate',
      code: 'COST_NOT_COMPUTED',
      message: 'Cost estimate has not been computed',
      severity: 'error',
      blocking: true,
    });
  } else if (totalCost < 5000) {
    warnings.push({
      field: 'computed.cost.totalEstimate',
      code: 'COST_TOO_LOW',
      message: `Cost estimate ₹${totalCost.toLocaleString()} seems too low. Please verify.`,
      severity: 'warning',
      blocking: false,
    });
  }
  
  // =========================================================================
  // SEVERITY vs ICU VALIDATION
  // =========================================================================
  
  const severity = val(insuranceCase.computed?.severity?.overallLevel);
  const icuDays = val(insuranceCase.computed?.cost?.los?.icuDays);
  const roomCategory = val(insuranceCase.admission?.roomCategory);
  
  if (severity === 'Critical' && icuDays === 0) {
    errors.push({
      field: 'computed.cost.los.icuDays',
      code: 'ICU_SEVERITY_MISMATCH',
      message: 'Severity is CRITICAL but ICU days is 0. This is inconsistent.',
      severity: 'error',
      blocking: true,
    });
  }
  
  if (roomCategory === 'ICU' && icuDays === 0) {
    errors.push({
      field: 'computed.cost.los.icuDays',
      code: 'ICU_ROOM_MISMATCH',
      message: 'Room category is ICU but ICU days is 0. This is inconsistent.',
      severity: 'error',
      blocking: true,
    });
  }
  
  // =========================================================================
  // WARNINGS (non-blocking)
  // =========================================================================
  
  // Sum insured
  const sumInsured = val(insuranceCase.insurance?.sumInsured);
  if (!sumInsured || sumInsured === 0) {
    warnings.push({
      field: 'insurance.sumInsured',
      code: 'SUM_INSURED_MISSING',
      message: 'Sum insured not specified',
      severity: 'warning',
      blocking: false,
    });
  }
  
  // Vitals
  const spo2 = val(insuranceCase.clinical?.vitals?.spo2);
  const pulse = val(insuranceCase.clinical?.vitals?.pulse);
  const systolic = val(insuranceCase.clinical?.vitals?.systolic);
  
  if (!spo2 && !pulse && !systolic) {
    warnings.push({
      field: 'clinical.vitals',
      code: 'VITALS_MISSING',
      message: 'Vital signs not documented',
      severity: 'warning',
      blocking: false,
    });
  }
  
  // =========================================================================
  // CALCULATE COMPLETENESS
  // =========================================================================
  
  const requiredFields = [
    insuranceCase.patient?.patientName,
    insuranceCase.patient?.age,
    insuranceCase.patient?.gender,
    insuranceCase.insurance?.policyNumber,
    insuranceCase.insurance?.insurerName,
    insuranceCase.clinical?.chiefComplaints,
    insuranceCase.clinical?.provisionalDiagnosis,
    insuranceCase.admission?.roomCategory,
    insuranceCase.computed?.icd?.primaryCode,
    insuranceCase.computed?.cost?.totalEstimate,
    insuranceCase.computed?.severity?.overallLevel,
  ];
  
  const filledFields = requiredFields.filter(f => {
    if (!f) return false;
    const value = val(f as any);
    return value !== undefined && value !== null && value !== '' && value !== 0;
  }).length;
  
  const completenessScore = Math.round((filledFields / requiredFields.length) * 100);
  
  // =========================================================================
  // RETURN RESULT
  // =========================================================================
  
  const blockingErrors = errors.filter(e => e.blocking);
  
  return {
    isValid: blockingErrors.length === 0,
    completenessScore,
    errors,
    warnings,
  };
}

// ============================================================================
// VALIDATION GATE — Blocks PDF generation if invalid
// ============================================================================

export function canGeneratePDF(insuranceCase: InsuranceCase): {
  allowed: boolean;
  reasons: string[];
} {
  const validation = validateCase(insuranceCase);
  
  const blockingErrors = validation.errors.filter(e => e.blocking);
  
  if (blockingErrors.length > 0) {
    return {
      allowed: false,
      reasons: blockingErrors.map(e => e.message),
    };
  }
  
  return {
    allowed: true,
    reasons: [],
  };
}
