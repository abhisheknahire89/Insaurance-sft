import React, { useState } from 'react';
import { WizardProgress } from './WizardProgress';
import { PatientInsuranceStep } from './PatientInsuranceStep';
import { ClinicalDetailsStep } from './ClinicalDetailsStep';
import { AdmissionCostStep } from './AdmissionCostStep';
import { DocumentsGenerateStep } from './DocumentsGenerateStep';
import { VoiceDictationMode } from './VoiceDictationMode';
import { useInsuranceCase, InsuranceCaseProvider } from '../../contexts/InsuranceCaseContext';
import { DebugPanel } from '../DebugPanel';

interface PreAuthWizardProps {
    onClose: () => void;
}

const PreAuthWizardInner: React.FC<PreAuthWizardProps> = ({ onClose }) => {
    const { state, importVoiceTranscript, runAllEngines } = useInsuranceCase();
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [showVoiceMode, setShowVoiceMode] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleNext = async () => {
        setSaving(true);
        // Run engines asynchronously in background to ensure up-to-date computations
        runAllEngines().catch(console.error);
        setSaving(false);
        if (step < 4) setStep((step + 1) as any);
    };

    const handleBack = () => {
        if (step > 1) setStep((step - 1) as any);
    };

    const handleGenerate = async (irdaiText: string) => {
        console.log("PDF Generation triggered with IRDAI Text length:", irdaiText?.length);
    };

    const handleVoiceComplete = async (data: any) => {
        setSaving(true);
        // data.rawTranscript contains the raw string from voice dictation
        try {
            await importVoiceTranscript(data.rawTranscript || "Mock transcript for testing");
            setShowVoiceMode(false);
            setStep(4);
        } catch (error) {
            console.error("Failed to parse voice:", error);
        } finally {
            setSaving(false);
        }
    };

    if (showVoiceMode) {
        return (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
                <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-3xl my-8 mx-4 shadow-2xl">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <span className="text-red-400 font-bold text-sm">🎙️ Voice Dictation</span>
                            <span className="font-mono text-xs text-gray-500">{state.caseId}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {saving && <span className="text-xs text-gray-500">⏳ Parsing...</span>}
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
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-bold text-sm">📋 New Pre-Authorization</span>
                        <span className="font-mono text-xs text-gray-500">{state.caseId}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none transition-colors">✕</button>
                    </div>
                </div>

                {step < 4 && (
                    <div className="mx-6 mt-4 flex justify-end">
                        <button
                            onClick={() => setShowVoiceMode(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600/20 hover:border-red-400 transition-all"
                        >
                            <span>🎙️</span> Switch to Voice Dictation
                        </button>
                    </div>
                )}

                <div className="px-6 pt-4 pb-3">
                    <WizardProgress currentStep={step} onStepClick={s => s < step && setStep(s as any)} />
                </div>

                <div className="px-6 pb-6 min-h-[500px] overflow-y-auto" style={{ maxHeight: '75vh' }}>
                    {step === 1 && <PatientInsuranceStep onNext={handleNext} />}
                    {step === 2 && <ClinicalDetailsStep onNext={handleNext} onBack={handleBack} />}
                    {step === 3 && <AdmissionCostStep onNext={handleNext} onBack={handleBack} />}
                    {step === 4 && <DocumentsGenerateStep onBack={handleBack} onGenerate={handleGenerate} />}
                </div>
            </div>
            
            <DebugPanel />
        </div>
    );
};

export const PreAuthWizard: React.FC<PreAuthWizardProps> = (props) => (
    <InsuranceCaseProvider>
        <PreAuthWizardInner {...props} />
    </InsuranceCaseProvider>
);
