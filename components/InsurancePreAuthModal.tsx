import React, { useState, useEffect } from 'react';
import {
    NexusInsuranceInput,
    PatientInfo,
    ConsultationInfo,
    PreAuthSubmission,
    UploadedDocument,
    ExtractedTestResult
} from '../types';
import { generateMedicalNecessityStatement } from '../services/geminiService';
import { generateDisclaimer } from '../constants';
import { InsuranceStepReview } from './InsuranceStepReview';
import { InsuranceStepDocuments } from './InsuranceStepDocuments';
import { InsuranceStepConfirm } from './InsuranceStepConfirm';

interface InsurancePreAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (preAuthData: PreAuthSubmission, tpaDocument: string) => void;
    nexusOutput: NexusInsuranceInput | null;
    patientInfo: PatientInfo;
    consultationInfo: ConsultationInfo;
}

export const InsurancePreAuthModal: React.FC<InsurancePreAuthModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    nexusOutput,
    patientInfo,
    consultationInfo
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [severityOverride, setSeverityOverride] = useState({
        overridden: false,
        newSeverity: '',
        justification: ''
    });

    const [testResults, setTestResults] = useState<ExtractedTestResult[]>([]);
    const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
    const [medicalNecessity, setMedicalNecessity] = useState('');
    const [doctorConfirmed, setDoctorConfirmed] = useState(false);
    const [generatingStatement, setGeneratingStatement] = useState(false);

    useEffect(() => {
        if (nexusOutput?.extractedTestResults) {
            setTestResults(nexusOutput.extractedTestResults);
        }
    }, [nexusOutput]);

    const calculateDocumentationStatus = () => {
        const testsNeedingDocs = testResults.filter(t =>
            t.interpretation !== 'normal' && !t.documentAttached
        );

        if (testsNeedingDocs.length === 0) {
            return { status: 'complete' as const, pendingList: [] };
        }

        return {
            status: 'pending_documents' as const,
            pendingList: testsNeedingDocs.map(t => `${t.testName} report`)
        };
    };

    const handleNextStep = async () => {
        if (currentStep === 2) {
            if (nexusOutput) {
                setGeneratingStatement(true);
                const statement = await generateMedicalNecessityStatement(
                    nexusOutput.ddx[0],
                    nexusOutput.severity,
                    nexusOutput.keyFindings,
                    testResults,
                    nexusOutput.vitals
                );
                setMedicalNecessity(statement);
                setGeneratingStatement(false);
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevStep = () => setCurrentStep(prev => prev - 1);

    const formatPreAuthForTPA = (submission: PreAuthSubmission): string => {
        return `
═══════════════════════════════════════════════════════════════
              PRE-AUTHORIZATION REQUEST
              Generated via Aivana Clinical Documentation System
═══════════════════════════════════════════════════════════════

DOCUMENT STATUS: ${submission.documentationStatus === 'complete' ? '✓ COMPLETE' : '⚠ PENDING DOCUMENTS'}
${submission.pendingDocuments.length > 0 ? `Pending: ${submission.pendingDocuments.join(', ')}` : ''}

───────────────────────────────────────────────────────────────
SECTION 1: DIAGNOSIS
───────────────────────────────────────────────────────────────
Primary Diagnosis: ${submission.primaryDiagnosis.diagnosis}
ICD-10 Code: ${submission.icd10Code}
Diagnostic Confidence: ${(submission.primaryDiagnosis.probability * 100).toFixed(0)}%
Clinical Rationale: ${submission.primaryDiagnosis.rationale}

───────────────────────────────────────────────────────────────
SECTION 2: CLINICAL SEVERITY ASSESSMENT (NEXUS Scores)
───────────────────────────────────────────────────────────────
Symptom Severity (PhenoIntensity): ${submission.severityScores.phenoIntensity.toFixed(2)} / 1.00
Clinical Urgency (UrgencyQuotient): ${submission.severityScores.urgencyQuotient.toFixed(2)} / 1.00
Deterioration Risk (DeteriorationVelocity): ${submission.severityScores.deteriorationVelocity.toFixed(2)} / 1.00
Red Flag Status: ${submission.severityScores.redFlagSeverity.toUpperCase()}

${submission.severityOverride?.overridden ? `
** SEVERITY OVERRIDE BY PHYSICIAN **
Override Justification: ${submission.severityOverride.justification}
` : ''}

───────────────────────────────────────────────────────────────
SECTION 3: KEY CLINICAL FINDINGS
───────────────────────────────────────────────────────────────
${submission.keyFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

───────────────────────────────────────────────────────────────
SECTION 4: TEST RESULTS
───────────────────────────────────────────────────────────────
${submission.testResults.map(t =>
            `• ${t.testName}: ${t.value} ${t.unit}
   Interpretation: ${t.interpretation.replace('_', ' ').toUpperCase()}
   Document: ${t.documentAttached ? '✓ Attached' : '✗ Not attached'}`
        ).join('\n\n')}

───────────────────────────────────────────────────────────────
SECTION 5: MEDICAL NECESSITY STATEMENT
───────────────────────────────────────────────────────────────
${submission.medicalNecessityStatement}

───────────────────────────────────────────────────────────────
SECTION 6: SUPPORTING DOCUMENTS
───────────────────────────────────────────────────────────────
Total Documents Attached: ${submission.uploadedDocuments.length}
${submission.uploadedDocuments.map((d, i) =>
            `${i + 1}. ${d.fileName} (${d.fileSize}) - ${d.linkedToTest || 'General'}`
        ).join('\n')}

───────────────────────────────────────────────────────────────
SECTION 7: PHYSICIAN CONFIRMATION
───────────────────────────────────────────────────────────────
Confirmed By: ${submission.doctorConfirmation.doctorName}
License Number: ${submission.doctorConfirmation.doctorLicense}
Confirmation Timestamp: ${submission.doctorConfirmation.confirmedAt}

═══════════════════════════════════════════════════════════════
DISCLAIMER
═══════════════════════════════════════════════════════════════
${submission.disclaimer}

═══════════════════════════════════════════════════════════════
    `.trim();
    };

    const handleSubmit = () => {
        if (!doctorConfirmed || !nexusOutput) return;

        setIsSubmitting(true);

        setTimeout(() => {
            const { status, pendingList } = calculateDocumentationStatus();
            const disclaimer = generateDisclaimer(status, pendingList);

            const submission: PreAuthSubmission = {
                primaryDiagnosis: nexusOutput.ddx[0],
                icd10Code: 'Pending ICD-10 Assignment',
                severityScores: nexusOutput.severity,
                severityOverride: severityOverride.overridden ? severityOverride : undefined,
                keyFindings: nexusOutput.keyFindings,
                testResults,
                uploadedDocuments,
                clinicalNotes: '',
                medicalNecessityStatement: medicalNecessity,
                documentationStatus: status,
                pendingDocuments: pendingList,
                doctorConfirmation: {
                    confirmed: doctorConfirmed,
                    confirmedAt: new Date().toISOString(),
                    doctorName: consultationInfo.doctorName,
                    doctorLicense: consultationInfo.doctorLicense
                },
                disclaimer
            };

            const tpaDocument = formatPreAuthForTPA(submission);
            setIsSubmitting(false);
            onSubmit(submission, tpaDocument);
            onClose();
        }, 1500);
    };

    const handleFileUpload = (file: File) => {
        const documentId = Math.random().toString(36).substring(7);
        const newDoc: UploadedDocument = {
            id: documentId,
            fileName: file.name,
            fileSize: (file.size / 1024).toFixed(1) + ' KB',
            fileType: file.type.includes('pdf') ? 'pdf' : 'image',
            uploadedAt: new Date().toISOString()
        };

        setUploadedDocuments([...uploadedDocuments, newDoc]);
    };

    const handleLinkDocument = (documentId: string, testName: string) => {
        setUploadedDocuments(docs => docs.map(d =>
            d.id === documentId ? { ...d, linkedToTest: testName } : d
        ));

        setTestResults(results => results.map(r =>
            r.testName === testName
                ? { ...r, documentAttached: true, documentId }
                : r
        ));
    };

    const handleRemoveDocument = (documentId: string, testName?: string) => {
        setUploadedDocuments(docs => docs.filter(d => d.id !== documentId));

        if (testName) {
            setTestResults(results => results.map(r =>
                r.testName === testName
                    ? { ...r, documentAttached: false, documentId: undefined }
                    : r
            ));
        }
    };

    if (!isOpen || !nexusOutput) return null;

    const { status, pendingList } = calculateDocumentationStatus();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-4xl max-h-[90vh] rounded-xl flex flex-col shadow-2xl">
                <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900 rounded-t-xl sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-blue-400">⚡</span>
                            Insurance Pre-Authorization
                        </h2>
                        <p className="text-sm text-gray-400 mt-1 flex gap-4">
                            <span>Patient: {patientInfo.name} ({patientInfo.uhid})</span>
                            <span>•</span>
                            <span>TPA: {patientInfo.tpaName || 'Not specified'}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition p-2">
                        ✕
                    </button>
                </div>

                <div className="flex border-b border-gray-800 bg-gray-900/50">
                    {[
                        { num: 1, label: 'Review Admission' },
                        { num: 2, label: 'Attach Documents' },
                        { num: 3, label: 'Confirm & Submit' }
                    ].map((step) => (
                        <div
                            key={step.num}
                            className={`flex-1 py-3 px-4 text-center text-sm font-medium border-b-2 transition-colors
                ${currentStep === step.num
                                    ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                                    : currentStep > step.num
                                        ? 'border-gray-600 text-gray-300'
                                        : 'border-transparent text-gray-600'
                                }`}
                        >
                            Step {step.num}: {step.label}
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-900 relative">
                    {currentStep === 1 && (
                        <InsuranceStepReview
                            nexusData={nexusOutput}
                            primaryDiagnosis={nexusOutput.ddx.length > 0 ? nexusOutput.ddx[0] : null}
                            patientName={patientInfo.name}
                            severityOverride={severityOverride}
                            onSeverityOverrideChange={setSeverityOverride}
                        />
                    )}

                    {currentStep === 2 && (
                        <InsuranceStepDocuments
                            testResults={testResults}
                            uploadedDocuments={uploadedDocuments}
                            onFileUpload={handleFileUpload}
                            onLinkDocument={handleLinkDocument}
                            onRemoveDocument={handleRemoveDocument}
                        />
                    )}

                    {currentStep === 3 && (
                        generatingStatement ? (
                            <div className="flex flex-col items-center justify-center h-48 space-y-4">
                                <div className="w-8 h-8 rounded-full border-4 border-gray-700 border-t-purple-500 animate-spin" />
                                <p className="text-gray-400 animate-pulse">Generating Medical Necessity Statement...</p>
                            </div>
                        ) : (
                            <InsuranceStepConfirm
                                documentationStatus={status}
                                pendingDocuments={pendingList}
                                medicalNecessityStatement={medicalNecessity}
                                onMedicalNecessityChange={setMedicalNecessity}
                                doctorConfirmed={doctorConfirmed}
                                onDoctorConfirmChange={setDoctorConfirmed}
                                consultationInfo={consultationInfo}
                            />
                        )
                    )}
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-xl flex justify-between items-center">
                    <button
                        onClick={currentStep === 1 ? onClose : handlePrevStep}
                        disabled={isSubmitting}
                        className="px-6 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {currentStep === 1 ? 'Cancel' : '← Back'}
                    </button>

                    {currentStep < 3 ? (
                        <button
                            onClick={handleNextStep}
                            className="px-6 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
                        >
                            Next Step →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!doctorConfirmed || isSubmitting}
                            className={`px-8 py-2 rounded-lg text-sm font-medium flex items-center justify-center min-w-[140px] transition
                ${!doctorConfirmed
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20'
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            ) : 'Submit Pre-Authorization'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
