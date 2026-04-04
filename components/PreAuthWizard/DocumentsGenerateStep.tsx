import React, { useState } from 'react';
import { useInsuranceCase } from '../../contexts/InsuranceCaseContext';
import { val } from '../../types/InsuranceCase';
import { generatePreAuthPDF } from '../../services/PDFGenerator';



interface DocGenerateStepProps {
    onBack: () => void;
    onGenerate: (irdaiText: string) => void;
}

export const DocumentsGenerateStep: React.FC<DocGenerateStepProps> = ({ onBack, onGenerate }) => {
    const { state, validate } = useInsuranceCase();
    const [activeTab, setActiveTab] = useState<'docs' | 'summary'>('summary');
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [irdaiText, setIrdaiText] = useState('');

    const handleGenerate = async () => {
        // Run final validation gate
        validate();
        
        if (!state.validation.isValid) {
            console.warn('Generating PDF with validation warnings/errors. Incomplete information might be present.');
        }

        setGenerating(true);
        try {
            // PDF generator uses the single source of truth (InsuranceCase)
            const pdfContent = generatePreAuthPDF(state);
            if (pdfContent.success && pdfContent.html) {
                setIrdaiText(pdfContent.html);
                setGenerated(true);
                onGenerate(pdfContent.html);
            } else {
                throw new Error("PDF Generator returned failure status");
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate PDF.');
        } finally {
            setGenerating(false);
        }
    };

    const handlePrint = () => {
        const w = window.open('', '_blank', 'width=900,height=700');
        if (!w) return;
        w.document.write(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 11pt; padding: 20mm; }
    pre { white-space: pre-wrap; font-family: monospace; font-size: 10pt; }
  </style>
</head>
<body><pre>${irdaiText}</pre></body>
</html>`);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 400);
    };


    if (generated) {
        return (
            <div className="space-y-5">
                <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-5 text-center space-y-2">
                    <div className="text-4xl">✅</div>
                    <h2 className="text-xl font-bold text-white">Pre-Auth Document Ready</h2>
                    <div className="font-mono text-blue-300 text-sm">{state.caseId}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 text-blue-300 transition-colors">
                        🖨️ Print / Save PDF
                    </button>
                    <button onClick={() => setGenerated(false)} className="py-2.5 rounded-xl text-sm text-gray-500 border border-white/10 hover:bg-white/5 transition-colors">
                        ← Back to Edit
                    </button>
                </div>

                <div>
                    <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Generated Document</h3>
                    <textarea readOnly value={irdaiText} rows={18}
                        className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-gray-300 focus:outline-none resize-none" />
                </div>
            </div>
        );
    }

    const patientName = val(state.patient.patientName) || '-';
    const patientAge = val(state.patient.age) || '?';
    const policyNum = val(state.insurance.policyNumber) || '-';
    const insurer = val(state.insurance.insurerName) || '-';
    const totalEst = val(state.computed?.cost?.totalEstimate) || 0;
    const severityLvl = val(state.computed?.severity?.overallLevel) || 'Low';

    return (
        <div className="space-y-5">
            <h2 className="text-xl font-bold text-white">Step 4: Documents &amp; Generate</h2>

            <div className="flex gap-1 bg-gray-800/50 rounded-xl p-1">
                <button onClick={() => setActiveTab('summary')} className={`flex-1 py-2 rounded-lg text-xs font-medium ${activeTab === 'summary' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>📋 Summary &amp; Validation</button>
                <button onClick={() => setActiveTab('docs')} className={`flex-1 py-2 rounded-lg text-xs font-medium ${activeTab === 'docs' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>🏥 Medical Necessity</button>
            </div>

            {activeTab === 'summary' && (
                <div className="space-y-4">
                    {state.validation.errors.length > 0 && (
                        <div className="bg-red-900/20 border border-red-500/40 rounded-xl p-4 space-y-2">
                            <h3 className="text-red-400 font-bold text-sm">Critical Missing Information ({state.validation.errors.length})</h3>
                            <ul className="list-disc pl-5 text-red-300 text-xs space-y-1">
                                {state.validation.errors.map((e, i) => <li key={i}>{e.message}</li>)}
                            </ul>
                        </div>
                    )}
                    {state.validation.warnings.length > 0 && (
                        <div className="bg-amber-900/20 border border-amber-500/40 rounded-xl p-4 space-y-2">
                            <h3 className="text-amber-400 font-bold text-sm">Warnings ({state.validation.warnings.length})</h3>
                            <ul className="list-disc pl-5 text-amber-300 text-xs space-y-1">
                                {state.validation.warnings.map((w, i) => <li key={i}>{w.message}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="bg-gray-800/50 rounded-xl p-4 space-y-3 text-sm">
                        <h3 className="font-semibold text-white">Pre-Authorization Summary</h3>
                        
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-gray-400">Patient</span>
                            <span className="text-white text-right font-medium">{patientName}, {patientAge}Y</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-gray-400">Policy</span>
                            <span className="text-white text-right font-medium">{policyNum} ({insurer})</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-gray-400">Calculated Cost</span>
                            <span className="text-white text-right font-medium">₹{totalEst}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-gray-400">Severity</span>
                            <span className="text-white text-right font-medium">{severityLvl}</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'docs' && (
                <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                        <h3 className="font-semibold text-white text-sm">Engine-Generated Medical Necessity</h3>
                        <div className="bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300">
                            {val(state.computed?.medicalNecessity?.statement) || 'Statement will be computed during validation.'}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={onBack} className="py-3 rounded-xl font-semibold text-sm bg-gray-800 hover:bg-gray-700 text-white">← Back</button>
                <button onClick={handleGenerate} disabled={generating}
                    className="py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    {generating ? '⏳ Generating...' : '🚀 Generate Document'}
                </button>
            </div>
        </div>
    );
};
