import { InsuranceCase, MedicalNecessityResult, tracked } from '../types/InsuranceCase';

/**
 * Generates the medical necessity statement text based on all clinical markers.
 */
export async function computeMedicalNecessity(
  insuranceCase: InsuranceCase
): Promise<MedicalNecessityResult | null> {
  const diagnosis = insuranceCase.clinical.provisionalDiagnosis?.value || 'the condition';
  const vitals = insuranceCase.clinical.vitals;
  const severity = insuranceCase.computed?.severity?.overallLevel?.value;

  let statement = `Patient requires admission for management of ${diagnosis}.`;
  let vitalInterpretation = 'Patient vitals are stable.';
  const reasons: string[] = [];

  if (vitals.systolic?.value && vitals.systolic.value < 90) {
    vitalInterpretation = 'Patient is hypotensive.';
    reasons.push('Continuous hemodynamic monitoring required.');
  }

  if (vitals.spo2?.value && vitals.spo2.value < 93) {
    vitalInterpretation = 'Patient is hypoxic on room air.';
    reasons.push('Requires oxygen therapy and close monitoring.');
  }

  if (severity === 'Critical') {
    statement += ' Due to the critical nature of the presentation and abnormal vitals, ICU admission is absolutely medically necessary.';
    reasons.push('ICU care and continuous monitoring indicated.');
  } else if (severity === 'High') {
    statement += ' Close inpatient monitoring is required.';
  }

  // Comorbidities
  const pmh = insuranceCase.admission.pastMedicalHistory;
  if (pmh?.diabetes?.value) {
    statement += ' Pre-existing diabetes complicates management, requiring strict glycemic monitoring.';
    reasons.push('Diabetic comorbidity management.');
  }

  return {
    statement: tracked(statement, 'computed'),
    vitalInterpretation: tracked(vitalInterpretation, 'computed'),
    hospitalizationReasons: tracked(reasons, 'computed'),
    opdContraindication: tracked('Oral medications and OPD management have failed or are contraindicated due to the acute presentation.', 'computed')
  };
}
