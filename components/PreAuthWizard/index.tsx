import React, { useState, useCallback } from 'react';
import {
    PreAuthRecord, PatientRecord, InsurancePolicyDetails,
    ClinicalDetails, AdmissionDetails, CostEstimate, WizardState
} from './types';
import { WizardProgress } from './WizardProgress';
import { PatientInsuranceStep } from './PatientInsuranceStep';
import { ClinicalDetailsStep } from './ClinicalDetailsStep';
import { AdmissionCostStep } from './AdmissionCostStep';
import { DocumentsGenerateStep } from './DocumentsGenerateStep';
import { VoiceDictationMode } from './VoiceDictationMode';
import { VoiceExtractedData } from '../../services/voiceDictationService';
import { savePreAuth, savePatient, generatePreAuthId, generatePatientId } from '../../services/storageService';
import { calculateTotals } from '../../utils/costCalculator';
import { lookupICD, calculateGuaranteedCost, inferICDFromDiagnosis, validateAndFixCostEstimate } from '../../services/icdUnifiedLookup';
import { validateICDCode } from '../../services/icdValidation';
import { logICDSelection } from '../../services/icdAuditLogger';
import { todayISO, nowTimeString } from '../../utils/formatters';

interface PreAuthWizardProps {
    onClose: () => void;
    existingRecord?: PreAuthRecord;
    prefilledData?: Partial<PreAuthRecord>;
}

const buildEmptyRecord = (): Partial<PreAuthRecord> => ({
    id: generatePreAuthId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    version: 1,
    createdBy: 'Insurance Desk',
    patient: {},
    insurance: { dataSource: 'manual' },
    clinical: {
        dataSource: 'manual_entry',
        diagnoses: [],
        selectedDiagnosisIndex: 0,
        proposedLineOfTreatment: { medical: false, surgical: false, intensiveCare: false, investigation: false, nonAllopathic: false },
        vitals: { bp: '', pulse: '', temp: '', spo2: '', rr: '' },
        proposedTreatmentDetails: {
            antibiotics: '', oxygenTherapy: false, oxygenDetails: '',
            ivFluids: false, ivFluidDetails: '',
            nebulization: false, nebulizationDetails: '',
            insulinProtocol: false, insulinDetails: '',
            pendingInvestigations: '', otherTreatments: '',
        },
        investigationsSent: {
            bloodCulture: false, sputumCulture: false, urineCulture: false,
            abg: false, ecg: false, echo: false, ctScan: false, mri: false, other: '',
        },
        investigationsResultsAvailable: '',
        investigationsPending: '',
        voiceCapturedFindings: [],
        chiefComplaints: '',
        durationOfPresentAilment: '',
        natureOfIllness: 'Acute',
        historyOfPresentIllness: '',
        relevantClinicalFindings: '',
        treatmentTakenSoFar: '',
        reasonForHospitalisation: '',
        additionalClinicalNotes: '',
    },
    admission: {
        admissionType: 'Emergency',
        dateOfAdmission: todayISO(),
        timeOfAdmission: nowTimeString(),
        roomCategory: 'General Ward',
        expectedDaysInICU: 0,
        expectedDaysInRoom: 0,
        expectedLengthOfStay: 0,
        pastMedicalHistory: {
            diabetes: { present: false }, hypertension: { present: false }, heartDisease: { present: false },
            asthma: { present: false }, epilepsy: { present: false }, cancer: { present: false },
            kidney: { present: false }, liver: { present: false }, hiv: { present: false },
            alcoholism: { present: false }, smoking: { present: false }, anyOther: { present: false },
        },
        previousHospitalization: { wasHospitalizedBefore: false },
    },
    costEstimate: calculateTotals({}, 0),
    uploadedDocuments: [],
    documentRequirements: [],
    declarations: { patient: {}, doctor: {}, hospital: {} },
    outputs: {},
});

export const PreAuthWizard: React.FC<PreAuthWizardProps> = ({ onClose, existingRecord, prefilledData }) => {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [showVoiceMode, setShowVoiceMode] = useState(() => !!(prefilledData as any)?.startWithVoice);
    const [record, setRecord] = useState<Partial<PreAuthRecord>>(() => {
        if (existingRecord) return existingRecord;
        const empty = buildEmptyRecord();
        if (prefilledData) {
            return {
                ...empty,
                ...prefilledData,
                patient: { ...empty.patient, ...prefilledData.patient },
                clinical: { ...empty.clinical, ...prefilledData.clinical },
                admission: { ...empty.admission, ...prefilledData.admission },
                costEstimate: prefilledData.costEstimate ?? empty.costEstimate,
            };
        }
        return empty;
    });
    const [saving, setSaving] = useState(false);

    const updateRecord = useCallback(async (partial: Partial<PreAuthRecord>) => {
        const updated = { ...record, ...partial, updatedAt: new Date().toISOString() };
        setRecord(updated);
        try { await savePreAuth(updated as PreAuthRecord); } catch (e) { /* silent */ }
    }, [record]);

    const handleNext = async () => {
        setSaving(true);
        await updateRecord({});
        setSaving(false);
        if (step < 4) setStep((step + 1) as any);
    };

    const handleBack = () => {
        if (step > 1) setStep((step - 1) as any);
    };

    const handleGenerate = async (irdaiText: string) => {
        const finalStatus = (record.uploadedDocuments ?? []).length === 0 ? 'pending_documents' : 'ready_to_submit';
        await updateRecord({ status: finalStatus, outputs: { irdaiText } });
        if (record.patient?.patientName) {
            const pat = { id: generatePatientId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...record.patient } as PatientRecord;
            await savePatient(pat);
        }
    };

    // ── Voice dictation: bulk-fill all sections, auto-calculate costs, jump to step 4 ──
    const handleVoiceComplete = async (data: VoiceExtractedData) => {
    // ═══════════════════════════════════════════════════════════════════
    // 100% BULLETPROOF ICD & COST CALCULATION
    // ═══════════════════════════════════════════════════════════════════
    
    const voiceDx = data.clinical?.diagnoses?.[0];
    let icdCode = (voiceDx?.icd10Code || '').trim();
    const diagnosisName = voiceDx?.diagnosis || '';

    console.log(`[ICD Input] Code: "${icdCode}", Name: "${diagnosisName}"`);

    // Step 1: Validate Gemini Result against Local Engine
    const validatedICD = validateICDCode(icdCode || '');

    console.log('[ICD Debug] Gemini raw:', icdCode);
    console.log('[ICD Debug] Final validated:', validatedICD);

    // Step 2: Lookup with 4-layer failsafe to get cost
    // Step 2: Lookup with 4-layer failsafe to get cost
    const icdLookup = lookupICD(validatedICD.code, validatedICD.description);
    console.log(`[ICD Lookup] Source: ${icdLookup.source}, Code: ${icdLookup.icdCode}, Specialty: ${icdLookup.specialty}`);

    // Step 3: Update diagnosis in data
    if (data.clinical?.diagnoses?.[0]) {
        data.clinical.diagnoses[0].icd10Code = icdLookup.icdCode;
        data.clinical.diagnoses[0].icd10Description = icdLookup.conditionName;
        data.clinical.diagnoses[0].matchResult = undefined;
        
        logICDSelection({
            originalDiagnosisTerm: diagnosisName,
            selectedICD: icdLookup.icdCode,
            matchLayer: validatedICD.source,
            confidenceScore: validatedICD.isValid ? 100 : 0,
            userId: 'doctor_profile_123', // Demo user
            recordId: record.id
        });
    }


    // Step 4: Calculate costs (guaranteed non-zero)
    const roomCat = data.admission?.roomCategory ?? 'General Ward';
    const isPMJAY = (data.insurance?.policyType || '').toLowerCase().includes('pmjay') ||
        (data.insurance?.policyType || '').toLowerCase().includes('ayushman');
    
    const customLOS = data.admission?.expectedLengthOfStay || undefined;
    const customICU = data.admission?.expectedDaysInICU || undefined;

    let costEst = calculateGuaranteedCost(
        icdLookup.icdCode,
        icdLookup.conditionName,
        roomCat,
        isPMJAY,
        customLOS,
        customICU
    );

    // Step 5: Final validation (catch any edge cases)
    costEst = validateAndFixCostEstimate(costEst);

    console.log(`[Cost Result] Total: ₹${costEst.total_estimated}, Confidence: ${costEst.calculation_confidence}`);

    // Step 6: Build state objects
    const finalLOS = costEst.los.total_days;
    const finalWard = costEst.los.ward_days;
    const finalICU = costEst.los.icu_days;

    const calculatedCost = {
        roomRentPerDay: Math.round(costEst.breakdown.room_rent / Math.max(1, finalWard)),
        expectedRoomDays: finalWard,
        totalRoomCharges: costEst.breakdown.room_rent,
        nursingChargesPerDay: Math.round(costEst.breakdown.nursing_charges / Math.max(1, finalWard)),
        totalNursingCharges: costEst.breakdown.nursing_charges,
        icuChargesPerDay: finalICU > 0 ? Math.round(costEst.breakdown.icu_charges / finalICU) : 22000,
        expectedIcuDays: finalICU,
        totalIcuCharges: costEst.breakdown.icu_charges,
        otCharges: costEst.breakdown.ot_charges,
        surgeonFee: costEst.breakdown.surgeon_fee,
        anesthetistFee: costEst.breakdown.anesthetist_fee,
        consultantFee: costEst.breakdown.consultant_fee,
        investigationsEstimate: costEst.breakdown.investigations,
        medicinesEstimate: costEst.breakdown.medicines,
        consumablesEstimate: costEst.breakdown.consumables,
        miscCharges: costEst.breakdown.miscellaneous,
        totalEstimatedCost: costEst.total_estimated,
        amountClaimedFromInsurer: Math.min(costEst.claimed_amount, data.insurance?.sumInsured ?? costEst.claimed_amount),
    };

    const updatedAdmission = {
        ...data.admission,
        expectedLengthOfStay: finalLOS,
        expectedDaysInRoom: finalWard,
        expectedDaysInICU: finalICU,
    };
    setSaving(true);
    // Update record — CRITICAL: Explicitly clear medicalNecessity to prevent stale data
    await updateRecord({
        patient: data.patient as any,
        insurance: data.insurance as any,
        clinical: data.clinical as any,
        admission: updatedAdmission as any,
        costEstimate: calculatedCost as any,
        medicalNecessity: undefined, // Clear stale statement
        outputs: {}, // Clear stale generated text
    });
    setSaving(false);
    setShowVoiceMode(false);
    // Jump straight to Documents & Generate — all data is pre-filled
    setStep(4);
};

    // ── Voice dictation overlay ─────────────────────────────────────────────────
    if (showVoiceMode) {
        return (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
                <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-3xl my-8 mx-4 shadow-2xl">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <span className="text-red-400 font-bold text-sm">🎙️ Voice Dictation</span>
                            <span className="font-mono text-xs text-gray-500">{record.id}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {saving && <span className="text-xs text-gray-500">💾 Saving...</span>}
                            <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none transition-colors">✕</button>
                        </div>
                    </div>
                    <div className="px-6 py-6">
                        <VoiceDictationMode
                            onComplete={handleVoiceComplete}
                            onCancel={() => setShowVoiceMode(false)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-3xl my-8 mx-4 shadow-2xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-bold text-sm">📋 New Pre-Authorization</span>
                        <span className="font-mono text-xs text-gray-500">{record.id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {saving && <span className="text-xs text-gray-500">💾 Saving...</span>}
                        <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none transition-colors">✕</button>
                    </div>
                </div>

                {/* Voice shortcut — shown on steps 1–3 */}
                {step < 4 && (
                    <div className="mx-6 mt-4 flex justify-end">
                        <button
                            onClick={() => setShowVoiceMode(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600/20 hover:border-red-400 transition-all"
                        >
                            <span>🎙️</span>
                            Switch to Voice Dictation
                        </button>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="px-6 pt-4 pb-3">
                    <WizardProgress currentStep={step} onStepClick={s => s < step && setStep(s)} />
                </div>

                {/* Step Content */}
                <div className="px-6 pb-6 min-h-[500px] overflow-y-auto" style={{ maxHeight: '75vh' }}>
                    {step === 1 && (
                        <PatientInsuranceStep
                            patient={record.patient ?? {}}
                            insurance={record.insurance ?? {}}
                            onPatientChange={p => updateRecord({ patient: p, medicalNecessity: undefined, outputs: {} })}
                            onInsuranceChange={ins => updateRecord({ insurance: ins, medicalNecessity: undefined, outputs: {} })}
                            onNext={handleNext}
                        />
                    )}
                    {step === 2 && (
                        <ClinicalDetailsStep
                            clinical={record.clinical ?? {}}
                            onClinicalChange={c => updateRecord({ clinical: c, medicalNecessity: undefined, outputs: {} })}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}
                    {step === 3 && (
                        <AdmissionCostStep
                            admission={record.admission ?? {}}
                            cost={record.costEstimate ?? {}}
                            clinical={record.clinical ?? {}}
                            sumInsured={record.insurance?.sumInsured ?? 0}
                            onAdmissionChange={a => updateRecord({ admission: a, medicalNecessity: undefined, outputs: {} })}
                            onCostChange={c => updateRecord({ costEstimate: c, medicalNecessity: undefined, outputs: {} })}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}
                    {step === 4 && (
                        <DocumentsGenerateStep
                            record={record}
                            onRecordChange={r => updateRecord(r)}
                            onBack={handleBack}
                            onGenerate={handleGenerate}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
