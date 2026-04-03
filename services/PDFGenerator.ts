import { InsuranceCase, val, TrackedField } from '../types/InsuranceCase';
import { canGeneratePDF } from './ValidationGate';

// ============================================================================
// PDF GENERATOR — READS ONLY FROM INSURANCE CASE
// ============================================================================

export function generatePreAuthPDF(insuranceCase: InsuranceCase): {
  success: boolean;
  html?: string;
  errors?: string[];
} {
  
  // GATE CHECK — Cannot generate if validation fails
  const gateCheck = canGeneratePDF(insuranceCase);
  if (!gateCheck.allowed) {
    console.error('[PDF] Generation blocked by validation gate:', gateCheck.reasons);
    return {
      success: false,
      errors: gateCheck.reasons,
    };
  }
  
  console.log('[PDF] Generating from InsuranceCase:', insuranceCase.caseId);
  
  // Extract all values from tracked fields
  const data = {
    // Metadata
    caseId: insuranceCase.caseId,
    generatedAt: new Date().toLocaleString(),
    
    // Patient
    patientName: val(insuranceCase.patient.patientName) || 'N/A',
    age: val(insuranceCase.patient.age) || 'N/A',
    gender: val(insuranceCase.patient.gender) || 'N/A',
    dateOfBirth: val(insuranceCase.patient.dateOfBirth) || 'N/A',
    mobileNumber: val(insuranceCase.patient.mobileNumber) || 'N/A',
    address: val(insuranceCase.patient.address) || 'N/A',
    city: val(insuranceCase.patient.city) || 'N/A',
    state: val(insuranceCase.patient.state) || 'N/A',
    pincode: val(insuranceCase.patient.pincode) || 'N/A',
    
    // Insurance
    insurerName: val(insuranceCase.insurance.insurerName) || 'N/A',
    tpaName: val(insuranceCase.insurance.tpaName) || 'N/A',
    tpaCardNumber: val(insuranceCase.insurance.tpaCardNumber) || 'N/A',
    policyNumber: val(insuranceCase.insurance.policyNumber) || 'N/A',
    policyType: val(insuranceCase.insurance.policyType) || 'N/A',
    sumInsured: val(insuranceCase.insurance.sumInsured) 
      ? `₹${val(insuranceCase.insurance.sumInsured)!.toLocaleString()}`
      : 'N/A',
    
    // Clinical
    chiefComplaints: val(insuranceCase.clinical.chiefComplaints) || 'N/A',
    duration: val(insuranceCase.clinical.duration) || 'N/A',
    relevantFindings: val(insuranceCase.clinical.relevantFindings) || 'N/A',
    provisionalDiagnosis: val(insuranceCase.clinical.provisionalDiagnosis) || 'N/A',
    
    // Vitals
    bp: val(insuranceCase.clinical.vitals.bloodPressure) || 'N/A',
    pulse: val(insuranceCase.clinical.vitals.pulse) || 'N/A',
    spo2: val(insuranceCase.clinical.vitals.spo2) || 'N/A',
    rr: val(insuranceCase.clinical.vitals.respiratoryRate) || 'N/A',
    
    // Admission
    admissionDate: val(insuranceCase.admission.dateOfAdmission) || 'N/A',
    admissionTime: val(insuranceCase.admission.timeOfAdmission) || 'N/A',
    admissionType: val(insuranceCase.admission.admissionType) || 'N/A',
    roomCategory: val(insuranceCase.admission.roomCategory) || 'N/A',
    
    // ICD
    icdCode: val(insuranceCase.computed?.icd?.primaryCode) || 'N/A',
    icdDescription: val(insuranceCase.computed?.icd?.primaryDescription) || 'N/A',
    
    // Severity
    severityLevel: val(insuranceCase.computed?.severity?.overallLevel) || 'N/A',
    
    // Cost
    totalCost: val(insuranceCase.computed?.cost?.totalEstimate)
      ? `₹${val(insuranceCase.computed?.cost?.totalEstimate)!.toLocaleString()}`
      : 'N/A',
    totalDays: val(insuranceCase.computed?.cost?.los?.totalDays) || 'N/A',
    wardDays: val(insuranceCase.computed?.cost?.los?.wardDays) || 'N/A',
    icuDays: val(insuranceCase.computed?.cost?.los?.icuDays) || 'N/A',
    
    // Cost breakdown
    roomRent: val(insuranceCase.computed?.cost?.breakdown?.roomRent) || 0,
    icuCharges: val(insuranceCase.computed?.cost?.breakdown?.icuCharges) || 0,
    otCharges: val(insuranceCase.computed?.cost?.breakdown?.otCharges) || 0,
    surgeonFee: val(insuranceCase.computed?.cost?.breakdown?.surgeonFee) || 0,
    investigations: val(insuranceCase.computed?.cost?.breakdown?.investigations) || 0,
    medicines: val(insuranceCase.computed?.cost?.breakdown?.medicines) || 0,
    implants: val(insuranceCase.computed?.cost?.breakdown?.implants) || 0,
    
    // Medical necessity
    medicalNecessity: val(insuranceCase.computed?.medicalNecessity?.statement) || 'N/A',
    
    // Comorbidities
    hasDiabetes: val(insuranceCase.admission.pastMedicalHistory?.diabetes),
    hasHypertension: val(insuranceCase.admission.pastMedicalHistory?.hypertension),
    hasHeartDisease: val(insuranceCase.admission.pastMedicalHistory?.heartDisease),
  };
  
  // Build comorbidity string
  const comorbidities: string[] = [];
  if (data.hasDiabetes) comorbidities.push('Diabetes');
  if (data.hasHypertension) comorbidities.push('Hypertension');
  if (data.hasHeartDisease) comorbidities.push('Heart Disease');
  const comorbidityStr = comorbidities.length > 0 ? comorbidities.join(', ') : 'Nil';
  
  // Generate HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Pre-Auth — ${data.caseId}</title>
  <style>
    body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .section { margin: 20px 0; }
    .section-title { border-bottom: 1px dashed #000; padding-bottom: 5px; font-weight: bold; }
    .row { display: flex; justify-content: space-between; padding: 3px 0; }
    .label { color: #666; }
    .value { font-weight: bold; }
    .cost-table { width: 100%; border-collapse: collapse; }
    .cost-table td { padding: 5px; border-bottom: 1px dotted #ccc; }
    .cost-table .total { font-weight: bold; border-top: 2px solid #000; }
  </style>
</head>
<body>
  <div class="header">
    <h2>INSURANCE PRE-AUTHORIZATION REQUEST</h2>
    <p>IRDAI Part-C — Medical Necessity Statement</p>
    <p>Ref No: ${data.caseId} | Date: ${data.generatedAt}</p>
  </div>
  
  <div class="section">
    <div class="section-title">SECTION 1: INSURANCE DETAILS</div>
    <div class="row"><span class="label">Insurance Company:</span><span class="value">${data.insurerName}</span></div>
    <div class="row"><span class="label">TPA Name:</span><span class="value">${data.tpaName}</span></div>
    <div class="row"><span class="label">Policy Number:</span><span class="value">${data.policyNumber}</span></div>
    <div class="row"><span class="label">Sum Insured:</span><span class="value">${data.sumInsured}</span></div>
  </div>
  
  <div class="section">
    <div class="section-title">SECTION 2: PATIENT DETAILS</div>
    <div class="row"><span class="label">Patient Name:</span><span class="value">${data.patientName}</span></div>
    <div class="row"><span class="label">Age / Gender:</span><span class="value">${data.age} years / ${data.gender}</span></div>
    <div class="row"><span class="label">Mobile:</span><span class="value">${data.mobileNumber}</span></div>
  </div>
  
  <div class="section">
    <div class="section-title">SECTION 3: CLINICAL DETAILS</div>
    <div class="row"><span class="label">Chief Complaints:</span><span class="value">${data.chiefComplaints}</span></div>
    <div class="row"><span class="label">Duration:</span><span class="value">${data.duration}</span></div>
    <div class="row"><span class="label">Relevant Findings:</span><span class="value">${data.relevantFindings}</span></div>
    <div class="row"><span class="label">Provisional Diagnosis:</span><span class="value">${data.provisionalDiagnosis}</span></div>
    <div class="row"><span class="label">ICD-10 Code:</span><span class="value">${data.icdCode} — ${data.icdDescription}</span></div>
    <div class="row"><span class="label">Vitals:</span><span class="value">BP: ${data.bp} | HR: ${data.pulse} | SpO2: ${data.spo2}% | RR: ${data.rr}</span></div>
    <div class="row"><span class="label">Severity:</span><span class="value">${data.severityLevel}</span></div>
    <div class="row"><span class="label">Comorbidities:</span><span class="value">${comorbidityStr}</span></div>
  </div>
  
  <div class="section">
    <div class="section-title">SECTION 4: ADMISSION DETAILS</div>
    <div class="row"><span class="label">Admission Date/Time:</span><span class="value">${data.admissionDate} ${data.admissionTime}</span></div>
    <div class="row"><span class="label">Admission Type:</span><span class="value">${data.admissionType}</span></div>
    <div class="row"><span class="label">Room Category:</span><span class="value">${data.roomCategory}</span></div>
    <div class="row"><span class="label">Expected Stay:</span><span class="value">${data.totalDays} days (Ward: ${data.wardDays}, ICU: ${data.icuDays})</span></div>
  </div>
  
  <div class="section">
    <div class="section-title">SECTION 5: COST ESTIMATION</div>
    <table class="cost-table">
      <tr><td>Room Rent</td><td>₹${data.roomRent.toLocaleString()}</td></tr>
      <tr><td>ICU Charges</td><td>₹${data.icuCharges.toLocaleString()}</td></tr>
      <tr><td>OT/Cath Lab</td><td>₹${data.otCharges.toLocaleString()}</td></tr>
      <tr><td>Surgeon Fee</td><td>₹${data.surgeonFee.toLocaleString()}</td></tr>
      <tr><td>Investigations</td><td>₹${data.investigations.toLocaleString()}</td></tr>
      <tr><td>Medicines</td><td>₹${data.medicines.toLocaleString()}</td></tr>
      <tr><td>Implants</td><td>₹${data.implants.toLocaleString()}</td></tr>
      <tr class="total"><td>TOTAL ESTIMATED</td><td>${data.totalCost}</td></tr>
    </table>
  </div>
  
  <div class="section">
    <div class="section-title">SECTION 6: MEDICAL NECESSITY STATEMENT</div>
    <p>${data.medicalNecessity}</p>
  </div>
  
  <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #666;">
    Generated by Aivana Insurance Pre-Auth System | ${data.generatedAt}
  </div>
</body>
</html>
  `;
  
  return {
    success: true,
    html,
  };
}
