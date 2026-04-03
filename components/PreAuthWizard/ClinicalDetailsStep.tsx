import React, { useState } from 'react';
import { useInsuranceCase } from '../../contexts/InsuranceCaseContext';
import { val } from '../../types/InsuranceCase';
import { searchConditions } from '../../services/icdDatabaseHelpers';
import { ICDSuggestionDisplay } from './ICDSuggestionDisplay';

interface ClinicalDetailsStepProps {
    onNext: () => void;
    onBack: () => void;
}

export const ClinicalDetailsStep: React.FC<ClinicalDetailsStepProps> = ({ onNext, onBack }) => {
    const { state, setField } = useInsuranceCase();
    const c = state.clinical;
    const vitals = c.vitals;

    const [icdQuery, setIcdQuery] = useState('');
    const [icdResults, setIcdResults] = useState<any[]>([]);

    const updateField = (field: string, value: any) => setField('clinical', field, value);
    const updateVital = (field: string, value: any) => {
        // We only map primary vitals for now
        setField('clinical', 'vitals', {
            ...vitals,
            [field]: { value, source: 'manual', timestamp: Date.now() }
        });
    };

    const handleIcdSearch = (q: string) => {
        setIcdQuery(q);
        if (q.length >= 2) {
             const results = searchConditions(q);
             setIcdResults(results);
        } else {
             setIcdResults([]);
        }
    };

    const addDiagnosis = (entry: any) => {
        // Set provisional diagnosis directly
        updateField('provisionalDiagnosis', entry.description || entry.commonName);
        setIcdQuery('');
        setIcdResults([]);
    };

    const isValid = !!(val(c.chiefComplaints) && val(c.provisionalDiagnosis));

    return (
        <div className="space-y-5">
            <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span>Step 2 of 4</span>
                    <span>•</span>
                    <span>Clinical Details</span>
                </div>
                <h2 className="text-xl font-bold text-white">Clinical Details</h2>
            </div>

            {/* Presenting Illness */}
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0"><span>🩺</span></div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Presenting Illness</h3>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Chief Complaints *</label>
                    <textarea value={val(c.chiefComplaints) ?? ''} onChange={e => updateField('chiefComplaints', e.target.value)} rows={2}
                        className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Relevant Findings</label>
                    <textarea value={val(c.relevantFindings) ?? ''} onChange={e => updateField('relevantFindings', e.target.value)} rows={3}
                        className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
            </div>

            {/* Vitals */}
            <details className="group bg-gray-800/50 rounded-xl">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center"><span className="text-sm">💊</span></div>
                        <span className="font-bold text-white text-sm">Vitals</span>
                    </div>
                    <span className="text-gray-500 text-xs transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="px-4 pb-4 grid grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs text-gray-400">Sys BP</label>
                        <input type="number" value={val(vitals.systolic) ?? ''} onChange={e => updateVital('systolic', +e.target.value)} className="w-full bg-gray-900 rounded-lg px-2 py-1 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400">Heart Rate</label>
                        <input type="number" value={val(vitals.pulse) ?? ''} onChange={e => updateVital('pulse', +e.target.value)} className="w-full bg-gray-900 rounded-lg px-2 py-1 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400">SpO2</label>
                        <input type="number" value={val(vitals.spo2) ?? ''} onChange={e => updateVital('spo2', +e.target.value)} className="w-full bg-gray-900 rounded-lg px-2 py-1 text-sm text-white" />
                    </div>
                    <div>
                         <label className="block text-xs text-gray-400">Temp (F)</label>
                         <input type="number" value={val(vitals.temperature) ?? ''} onChange={e => updateVital('temperature', +e.target.value)} className="w-full bg-gray-900 rounded-lg px-2 py-1 text-sm text-white" />
                     </div>
                </div>
            </details>

            {/* Diagnosis */}
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><span>🔬</span></div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Provisional Diagnosis *</h3>
                    </div>
                </div>
                
                <input value={val(c.provisionalDiagnosis) ?? ''} onChange={e => updateField('provisionalDiagnosis', e.target.value)}
                        className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-2"
                        placeholder="Free-text diagnosis or search below..." />

                <div className="relative">
                    <input value={icdQuery} onChange={e => handleIcdSearch(e.target.value)}
                        className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        placeholder="Search diagnosis from database..." />
                    {icdResults.length > 0 && (
                        <div className="absolute z-20 w-full bg-gray-900 border border-white/20 rounded-xl mt-1 shadow-xl overflow-hidden">
                            {icdResults.map(r => (
                                <button key={r.code} onClick={() => addDiagnosis(r)}
                                    className="w-full px-4 py-2.5 text-left hover:bg-white/10 text-sm flex justify-between">
                                    <span className="text-white">{r.commonName ?? r.description}</span>
                                    <span className="font-mono text-xs text-blue-400">{r.code}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {state.computed?.icd && (
                   <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                       <div className="text-xs text-blue-400 font-bold">Computed ICD System:</div>
                       <div className="text-sm text-white">{val(state.computed.icd.primaryDescription)} ({val(state.computed.icd.primaryCode)})</div>
                   </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button onClick={onBack} className="py-3 rounded-xl font-semibold text-sm bg-gray-800 hover:bg-gray-700 text-white transition-colors">← Back</button>
                <button onClick={onNext} disabled={!isValid}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${
                        isValid
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}>
                    {isValid ? 'Continue to Admission & Cost →' : 'Fill Required Fields to Continue'}
                </button>
            </div>
        </div>
    );
};
