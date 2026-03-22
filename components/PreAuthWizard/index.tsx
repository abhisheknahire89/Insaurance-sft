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
import { calculateTotals, calculateCost } from '../../utils/costCalculator';
import { calculateOverallSeverity } from '../../services/severityService';
import { lookupICD, calculateGuaranteedCost, inferICDFromDiagnosis, validateAndFixCostEstimate } from '../../services/icdDatabaseHelpers';
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
    const icdLookup = lookupICD(validatedICD.code, validatedICD.description);
    console.log(`[ICD Lookup] Source: ${icdLookup.tier}, Code: ${icdLookup.code}, Specialty: ${icdLookup.condition_data?.specialty || 'General'}`);

    if (data.clinical.diagnoses.length > 0) {
        // Only override if confidence is high or specific
        if (icdLookup.tier !== 'FLOOR') {
            data.clinical.diagnoses[0].icd10Code = icdLookup.code;
            data.clinical.diagnoses[0].icd10Description = icdLookup.description;
        }
    } else {
        data.clinical.diagnoses.push({
            diagnosis: icdLookup.description,
            icd10Code: icdLookup.code,
            icd10Description: icdLookup.description,
            isSelected: true,
            probability: icdLookup.confidence / 100,
            reasoning: icdLookup.reasoning
        });
    }
        
    logICDSelection({
        originalDiagnosisTerm: diagnosisName,
        selectedICD: icdLookup.code,
        matchLayer: String(icdLookup.tier),
        confidenceScore: validatedICD.isValid ? 100 : 0,
        userId: 'doctor_profile_123', // Demo user
        recordId: record.id
    });


    // Step 4: Calculate costs (guaranteed non-zero) and overrides
    const roomCat = data.admission?.roomCategory ?? 'General Ward';
    const isPMJAY = (data.insurance?.policyType || '').toLowerCase().includes('pmjay') ||
        (data.insurance?.policyType || '').toLowerCase().includes('ayushman');
    
    const customLOS = data.admission?.expectedLengthOfStay || undefined;
    const customICU = data.admission?.expectedDaysInICU || undefined;

    // BUG #5: Use severity overrides based on actual vitals and clinical notes
    const severity = calculateOverallSeverity(data.clinical?.vitals, icdLookup.code, data.rawTranscript);

    if (data.clinical) {
        data.clinical.severity = severity;
    }

    // BUG #3 and #4: Cost calculation using improved logic
    const calculatedCost = calculateCost(
        icdLookup.code,
        roomCat,
        isPMJAY,
        customLOS,
        customICU,
        severity
    );

    const finalLOS = calculatedCost.expectedRoomDays + calculatedCost.expectedIcuDays;
    const finalWard = calculatedCost.expectedRoomDays;
    const finalICU = calculatedCost.expectedIcuDays;

    const updatedAdmission = {
        ...data.admission,
        expectedLengthOfStay: finalLOS,
        expectedDaysInRoom: finalWard,
        expectedDaysInICU: finalICU,
    };
    setSaving(true);
    const cleanObj = (obj: any) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && v !== ''));

    // Update record — CRITICAL: Merge extracted data, explicitly clear medicalNecessity to prevent stale data
    await updateRecord({
        patient: { ...record.patient, ...cleanObj(data.patient) } as any,
        insurance: { ...record.insurance, ...cleanObj(data.insurance) } as any,
        clinical: { ...record.clinical, ...cleanObj(data.clinical) } as any,
        admission: { ...record.admission, ...cleanObj(updatedAdmission) } as any,
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
