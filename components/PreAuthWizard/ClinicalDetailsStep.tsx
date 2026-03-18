import React, { useState } from 'react';
import { ClinicalDetails, ClinicalDataSource, DiagnosisEntry, WizardVitals } from '../PreAuthWizard/types';
import { 
    validateAndSuggestICD10, 
    searchConditions, 
    predictTPAQueries, 
    getAdmissionJustificationTemplate,
    getSeverityMarkers,
    getSpecialNotes
} from '../../data/icd10MasterDatabase';
import { suggestICDCode } from '../../services/icdIntelligentLookup';
import { logICDSelection } from '../../services/icdAuditLogger';
import { ICDSuggestionDisplay } from './ICDSuggestionDisplay';

interface ClinicalDetailsStepProps {
    clinical: Partial<ClinicalDetails>;
    onClinicalChange: (c: Partial<ClinicalDetails>) => void;
    onNext: () => void;
    onBack: () => void;
}

const DEFAULT_VITALS: WizardVitals = { bp: '', pulse: '', temp: '', spo2: '', rr: '' };

export const ClinicalDetailsStep: React.FC<ClinicalDetailsStepProps> = ({
    clinical, onClinicalChange, onNext, onBack
}) => {
    const [dataSource, setDataSource] = useState<ClinicalDataSource | null>(clinical.chiefComplaints ? 'manual_entry' : null);
    const [icdQuery, setIcdQuery] = useState('');
    const [icdResults, setIcdResults] = useState<any[]>([]);
    const [showInjury, setShowInjury] = useState(false);
    const [showSurgery, setShowSurgery] = useState(false);
    const [showMaternity, setShowMaternity] = useState(false);

    const vitals = clinical.vitals ?? DEFAULT_VITALS;
    const c = clinical;

    const update = (partial: Partial<ClinicalDetails>) => onClinicalChange({ ...clinical, ...partial });

    const handleVitalChange = (field: keyof WizardVitals, val: string) => {
        update({ vitals: { ...vitals, [field]: val } });
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
        const existing = c.diagnoses ?? [];
        if (existing.some(d => d.icd10Code === entry.code)) return;
        
        const template = getAdmissionJustificationTemplate(entry.code);
        
        // Intelligent resolution
        const symptoms = [c.chiefComplaints, c.historyOfPresentIllness].filter(Boolean) as string[];
        const intelligentMatch = suggestICDCode(entry.commonName ?? entry.description, c.relevantClinicalFindings ?? '', symptoms);
        
        logICDSelection({
            originalDiagnosisTerm: entry.commonName ?? entry.description,
            selectedICD: intelligentMatch.isFloorCode ? entry.code : intelligentMatch.icdCode,
            matchLayer: intelligentMatch.isFloorCode ? 'MANUAL_SEARCH_FALLBACK' : intelligentMatch.matchLayer,
            confidenceScore: intelligentMatch.confidence,
            userId: 'doctor_profile_123',
            recordId: 'wizard_on_the_fly'
        });

        const newEntry: DiagnosisEntry = {
            diagnosis: entry.commonName ?? entry.description,
            icd10Code: intelligentMatch.isFloorCode ? entry.code : intelligentMatch.icdCode, // Use DB code if fallback triggers
            icd10Description: intelligentMatch.isFloorCode ? entry.description : intelligentMatch.icdDescription,
            probability: intelligentMatch.confidence / 100,
            reasoning: intelligentMatch.reasoning,
            isSelected: existing.length === 0,
            matchResult: intelligentMatch
        };

        const updatedDiagnoses = [...existing, newEntry];
        update({ 
            diagnoses: updatedDiagnoses, 
            selectedDiagnosisIndex: existing.length === 0 ? 0 : (c.selectedDiagnosisIndex ?? 0),
            reasonForHospitalisation: existing.length === 0 ? template : c.reasonForHospitalisation
        });
        setIcdQuery('');
        setIcdResults([]);
    };

    const selectPrimaryDx = (idx: number) => {
        update({
            selectedDiagnosisIndex: idx,
            diagnoses: (c.diagnoses ?? []).map((d, i) => ({ ...d, isSelected: i === idx }))
        });
    };

    const removeDx = (idx: number) => {
        const updated = (c.diagnoses ?? []).filter((_, i) => i !== idx);
        update({ diagnoses: updated, selectedDiagnosisIndex: 0 });
    };

    const spo2Val = parseInt(vitals.spo2 || '100');
    const pulseVal = parseInt(vitals.pulse || '80');
    const tempVal = parseFloat(vitals.temp || '98.6');

    const isValid = !!(
        c.chiefComplaints &&
        c.diagnoses && c.diagnoses.length > 0 &&
        (c.proposedLineOfTreatment?.medical || c.proposedLineOfTreatment?.surgical ||
            c.proposedLineOfTreatment?.intensiveCare || c.proposedLineOfTreatment?.investigation) &&
        c.reasonForHospitalisation
    );

    const getMissingClinical = () => {
        const m: string[] = [];
        if (!c.chiefComplaints) m.push('Chief Complaints');
        if (!c.diagnoses?.length) m.push('Diagnosis');
        if (!(c.proposedLineOfTreatment?.medical || c.proposedLineOfTreatment?.surgical || c.proposedLineOfTreatment?.intensiveCare || c.proposedLineOfTreatment?.investigation)) m.push('Treatment Line');
        if (!c.reasonForHospitalisation) m.push('OPD Justification');
        return m;
    };

    return (
        <div className="space-y-5">
            {/* Step context */}
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
                        <p className="text-xs text-gray-500">Chief complaints and clinical context</p>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Chief Complaints *</label>
                    <textarea value={c.chiefComplaints ?? ''} onChange={e => update({ chiefComplaints: e.target.value })} rows={2}
                        className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                        placeholder="Fever, cough, breathlessness..." />
                </div>

                {/* Optional clinical fields */}
                <details className="group">
                    <summary className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl cursor-pointer hover:bg-gray-700/50 transition-colors list-none">
                        <span className="text-xs text-gray-400">+ Additional clinical details (optional)</span>
                        <span className="text-gray-500 text-xs transition-transform group-open:rotate-180">▼</span>
                    </summary>
                    <div className="mt-3 space-y-4 pl-2 border-l-2 border-gray-700">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Duration</label>
                                <input value={c.durationOfPresentAilment ?? ''} onChange={e => update({ durationOfPresentAilment: e.target.value })}
                                    className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50" placeholder="e.g. 5 days" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Nature of Illness</label>
                                <select value={c.natureOfIllness ?? ''} onChange={e => update({ natureOfIllness: e.target.value as any })}
                                    className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50">
                                    <option value="">Select</option>
                                    <option>Acute</option><option>Chronic</option><option>Acute on Chronic</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">History of Present Illness</label>
                            <textarea value={c.historyOfPresentIllness ?? ''} onChange={e => update({ historyOfPresentIllness: e.target.value })} rows={3}
                                className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                placeholder="Describe onset, progression, associated symptoms, prior treatment tried..." />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Relevant Clinical Findings</label>
                            <textarea value={c.relevantClinicalFindings ?? ''} onChange={e => update({ relevantClinicalFindings: e.target.value })} rows={2}
                                className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                placeholder="Examination findings, auscultation, palpation etc." />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Prior OPD Treatment (if any)</label>
                            <textarea value={c.treatmentTakenSoFar ?? ''} onChange={e => update({ treatmentTakenSoFar: e.target.value })} rows={2}
                                className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                placeholder="e.g. Oral antibiotics for 3 days without relief..." />
                        </div>
                    </div>
                </details>
            </div>

            {/* Vitals — collapsed */}
            <details className="group bg-gray-800/50 rounded-xl">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-700/30 rounded-xl transition-colors list-none">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0"><span className="text-sm">💊</span></div>
                        <div>
                            <span className="font-bold text-white text-sm">Vitals at Presentation</span>
                            <span className="text-xs text-gray-500 ml-2">(optional)</span>
                        </div>
                    </div>
                    <span className="text-gray-500 text-xs transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-5 gap-3">
                    {([['bp', 'BP (mmHg)', '130/80'], ['pulse', 'Pulse (/min)', '80'], ['temp', 'Temp (°F)', '98.6'], ['spo2', 'SpO2 (%)', '98'], ['rr', 'RR (/min)', '16']] as [keyof WizardVitals, string, string][]).map(([f, label, ph]) => {
                        let alertClass = '';
                        if (f === 'spo2' && vitals.spo2 && parseInt(vitals.spo2) < 94) alertClass = 'border-red-500/60 text-red-300';
                        if (f === 'temp' && vitals.temp && parseFloat(vitals.temp) > 100.4) alertClass = 'border-amber-500/60';
                        if (f === 'pulse' && vitals.pulse && (parseInt(vitals.pulse) > 100 || parseInt(vitals.pulse) < 60)) alertClass = 'border-amber-500/60';
                        return (
                            <div key={f}>
                                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                                <input value={vitals[f] ?? ''} onChange={e => handleVitalChange(f, e.target.value)}
                                    className={`w-full bg-gray-900 border rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 ${alertClass || 'border-white/10'}`}
                                    placeholder={ph} />
                            </div>
                        );
                    })}
                </div>
                    {spo2Val < 94 && vitals.spo2 && (
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-2 text-red-300 text-xs">
                            ⚠️ SpO2 {vitals.spo2}% — Hypoxia detected. This strongly supports inpatient necessity.
                        </div>
                    )}
                </div>
            </details>

            {/* Diagnosis */}
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0"><span>🔬</span></div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Diagnosis *</h3>
                        <p className="text-xs text-gray-500">Search by name or ICD-10 code</p>
                    </div>
                </div>
                <div className="relative">
                    <input value={icdQuery} onChange={e => handleIcdSearch(e.target.value)}
                        className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                        placeholder="Search diagnosis by name or ICD-10 code (e.g. Pneumonia or J18)..." />
                    {icdResults.length > 0 && (
                        <div className="absolute z-20 w-full bg-gray-900 border border-white/20 rounded-xl mt-1 shadow-xl overflow-hidden">
                            {icdResults.map(r => (
                                <button key={r.code} onClick={() => addDiagnosis(r)}
                                    className="w-full px-4 py-2.5 text-left hover:bg-white/10 text-sm flex justify-between items-center">
                                    <span className="text-white">{r.commonName ?? r.description}</span>
                                    <span className="font-mono text-xs text-blue-400">{r.code}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {(c.diagnoses ?? []).length > 0 && (
                    <div className="space-y-2">
                        {(c.diagnoses ?? []).map((dx, i) => {
                            const validation = validateAndSuggestICD10(dx.icd10Code);
                            return (
                                <div key={i} className="space-y-2">
                                    <div className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${dx.isSelected ? 'bg-blue-600/20 border-blue-500/50' : 'bg-gray-900 border-white/10 hover:border-white/20'}`}
                                        onClick={() => selectPrimaryDx(i)}>
                                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${dx.isSelected ? 'bg-blue-500 border-blue-400' : 'border-gray-500'}`} />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-white">{dx.diagnosis}</div>
                                            <div className="text-xs text-gray-400 font-mono">{dx.icd10Code} — {dx.icd10Description}</div>
                                        </div>
                                        {dx.isSelected && <span className="text-xs text-blue-400 font-semibold">Primary</span>}
                                        <button onClick={e => { e.stopPropagation(); removeDx(i); }} className="text-gray-600 hover:text-red-400 text-xs p-1">✕</button>
                                    </div>
                                    
                                    {/* Intelligence Suggestion Module */}
                                    {dx.matchResult && (
                                        <div className="mx-2 mt-2">
                                            <ICDSuggestionDisplay 
                                                result={dx.matchResult} 
                                                onSelectAlternative={(altCode) => {
                                                    const updatedDx = [...(c.diagnoses || [])];
                                                    updatedDx[i] = { 
                                                        ...dx, 
                                                        icd10Code: altCode,
                                                        icd10Description: "Updated from Alternative Selection" 
                                                    };
                                                    update({ diagnoses: updatedDx });
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* BUG 3: ICD-10 Validation Feedback */}
                                    {!validation.isBillable && validation.isValid && (
                                        <div className="mx-2 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg space-y-2 mt-2">
                                            <div className="flex items-start gap-2">
                                                <span className="text-amber-400 text-sm">⚠️</span>
                                                <p className="text-amber-300 text-xs leading-relaxed">{validation.warningMessage}</p>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const updatedDx = [...(c.diagnoses || [])];
                                                    updatedDx[i] = { 
                                                        ...dx, 
                                                        icd10Code: validation.suggestedCode, 
                                                        icd10Description: validation.suggestedDescription 
                                                    };
                                                    update({ diagnoses: updatedDx });
                                                }}
                                                className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-md border border-amber-500/30 transition-colors"
                                            >
                                                Correct to {validation.suggestedCode} (Billable)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                {(c.diagnoses ?? []).length === 0 && <p className="text-gray-500 text-xs text-center py-4">Search and add the primary diagnosis above *</p>}
                
                {/* TPA Intelligence Panel */}
                {c.diagnoses?.[c.selectedDiagnosisIndex ?? 0] && (
                    <div className="space-y-2">
                        <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded-xl space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-blue-400 text-sm">💡</span>
                                <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">TPA Intelligence</h4>
                            </div>
                            <p className="text-[10px] text-blue-400/80 leading-relaxed font-medium">Common queries for this diagnosis. Address these in your notes to avoid delays:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {predictTPAQueries(c.diagnoses[c.selectedDiagnosisIndex ?? 0].icd10Code).map((query, idx) => (
                                    <div key={idx} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-[10px] text-blue-300">
                                        • {query}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Severity & Clinical Risk Indicators */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-amber-900/10 border border-amber-500/20 rounded-xl space-y-2">
                                <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">⚠️ Severity Markers</h4>
                                <ul className="space-y-1">
                                    {getSeverityMarkers(c.diagnoses[c.selectedDiagnosisIndex ?? 0].icd10Code).map((m, idx) => (
                                        <li key={idx} className="text-[9px] text-amber-300/80 leading-tight">• {m}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-3 bg-green-900/10 border border-green-500/20 rounded-xl space-y-2">
                                <h4 className="text-[10px] font-bold text-green-400 uppercase tracking-wider">📝 Clinical Notes</h4>
                                <ul className="space-y-1">
                                    {getSpecialNotes(c.diagnoses[c.selectedDiagnosisIndex ?? 0].icd10Code).map((n, idx) => (
                                        <li key={idx} className="text-[9px] text-green-300/80 leading-tight">• {n}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Treatment Plan */}
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0"><span>📋</span></div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Proposed Treatment Plan</h3>
                        <p className="text-xs text-gray-500">Required for TPA pre-authorization</p>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-2">Line of Treatment * (check all that apply)</label>
                    <div className="flex flex-wrap gap-3">
                        {([['medical', 'Medical Management'], ['surgical', 'Surgical Management'], ['intensiveCare', 'Intensive Care'], ['investigation', 'Investigation Only'], ['nonAllopathic', 'Non-Allopathic']] as const).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox"
                                    checked={c.proposedLineOfTreatment?.[key] ?? false}
                                    onChange={e => update({ proposedLineOfTreatment: { ...{ medical: false, surgical: false, intensiveCare: false, investigation: false, nonAllopathic: false }, ...c.proposedLineOfTreatment, [key]: e.target.checked } })}
                                    className="accent-blue-500" />
                                <span className="text-sm text-gray-300" onClick={() => {
                                    if (key === 'surgical') setShowSurgery(prev => !prev);
                                }}>{label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Why is OPD management NOT appropriate? * <span className="text-gray-500">(critical for TPA approval)</span></label>
                    <textarea value={c.reasonForHospitalisation ?? ''} onChange={e => update({ reasonForHospitalisation: e.target.value })} rows={3}
                        className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                        placeholder="e.g. Patient requires IV antibiotics, continuous oxygen therapy, and hemodynamic monitoring which cannot be accomplished on outpatient basis." />
                </div>

                {/* Structured treatment & investigations — collapsed */}
                <details className="group">
                    <summary className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl cursor-pointer hover:bg-gray-700/50 transition-colors list-none">
                        <span className="text-xs text-gray-400">+ Structured treatment details (optional)</span>
                        <span className="text-gray-500 text-xs transition-transform group-open:rotate-180">▼</span>
                    </summary>
                    <div className="mt-3 pl-2 border-l-2 border-gray-700 space-y-4">
                        <div className="bg-gray-900/40 border border-white/5 rounded-xl p-4 space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Structured Treatment Plan</h4>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Antibiotics / Specific Meds</label>
                                <input
                                    value={c.proposedTreatmentDetails?.antibiotics ?? ''}
                                    onChange={e => update({ proposedTreatmentDetails: { ...c.proposedTreatmentDetails!, antibiotics: e.target.value } })}
                                    className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                    placeholder="e.g. IV Ceftriaxone 2gm OD, Inj Clarithromycin 500mg BD"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-900 border border-white/5 rounded-lg">
                                    <input type="checkbox" checked={c.proposedTreatmentDetails?.oxygenTherapy ?? false} onChange={e => update({ proposedTreatmentDetails: { ...c.proposedTreatmentDetails!, oxygenTherapy: e.target.checked } })} className="accent-blue-500" />
                                    <span className="text-xs text-gray-300">Oxygen Support</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-900 border border-white/5 rounded-lg">
                                    <input type="checkbox" checked={c.proposedTreatmentDetails?.ivFluids ?? false} onChange={e => update({ proposedTreatmentDetails: { ...c.proposedTreatmentDetails!, ivFluids: e.target.checked } })} className="accent-blue-500" />
                                    <span className="text-xs text-gray-300">IV Fluids</span>
                                </label>
                            </div>
                            <div className="space-y-3 pt-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Investigations Sent / Pending</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {([['bloodCulture', 'Blood Culture'], ['sputumCulture', 'Sputum Culture'], ['abg', 'ABG'], ['ctScan', 'CT Scan'], ['ecg', 'ECG'], ['echo', 'ECHO']] as const).map(([key, label]) => (
                                        <label key={key} className="flex items-center gap-2 cursor-pointer p-1.5 bg-gray-900 border border-white/5 rounded-lg">
                                            <input type="checkbox" checked={c.investigationsSent?.[key] ?? false} onChange={e => update({ investigationsSent: { ...c.investigationsSent!, [key]: e.target.checked } })} className="accent-blue-500" />
                                            <span className="text-[10px] text-gray-400">{label}</span>
                                        </label>
                                    ))}
                                </div>
                                <input
                                    value={c.investigationsPending ?? ''}
                                    onChange={e => update({ investigationsPending: e.target.value })}
                                    className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                                    placeholder="Other pending investigations (e.g. COVID-19 PCR, Procalcitonin)"
                                />
                            </div>
                        </div>

                        {/* Conditional Panels */}
                        <div className="space-y-3">
                            <button onClick={() => setShowInjury(p => !p)} className="text-xs text-blue-400 hover:underline">
                                {showInjury ? '▼' : '▶'} Is this an injury/accident case?
                            </button>
                            {showInjury && (
                                <div className="bg-gray-900 rounded-xl p-4 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Date of Injury</label>
                                        <input type="date" value={c.injuryDetails?.dateOfInjury ?? ''} onChange={e => update({ injuryDetails: { ...c.injuryDetails as any, isInjury: true, dateOfInjury: e.target.value, isMLC: c.injuryDetails?.isMLC ?? false } })}
                                            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Cause of Injury</label>
                                        <input value={c.injuryDetails?.causeOfInjury ?? ''} onChange={e => update({ injuryDetails: { ...c.injuryDetails as any, isInjury: true, causeOfInjury: e.target.value, isMLC: c.injuryDetails?.isMLC ?? false } })}
                                            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" placeholder="Road accident, fall..." />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={c.injuryDetails?.isMLC ?? false} onChange={e => update({ injuryDetails: { ...c.injuryDetails as any, isInjury: true, isMLC: e.target.checked } })} className="accent-blue-500" />
                                        <span className="text-sm text-gray-300">Medico-Legal Case (MLC)</span>
                                    </label>
                                </div>
                            )}

                            <button onClick={() => setShowSurgery(p => !p)} className="text-xs text-blue-400 hover:underline">
                                {showSurgery ? '▼' : '▶'} Add surgery details
                            </button>
                            {showSurgery && (
                                <div className="bg-gray-900 rounded-xl p-4 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Name of Surgery *</label>
                                        <input value={c.surgeryDetails?.nameOfSurgery ?? ''} onChange={e => update({ surgeryDetails: { ...c.surgeryDetails as any, nameOfSurgery: e.target.value, routeOfSurgery: c.surgeryDetails?.routeOfSurgery ?? 'Open' } })}
                                            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" placeholder="e.g. Laparoscopic Appendicectomy" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Route of Surgery</label>
                                        <select value={c.surgeryDetails?.routeOfSurgery ?? 'Open'} onChange={e => update({ surgeryDetails: { ...c.surgeryDetails as any, nameOfSurgery: c.surgeryDetails?.nameOfSurgery ?? '', routeOfSurgery: e.target.value as any } })}
                                            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                                            <option>Open</option><option>Laparoscopic</option><option>Endoscopic</option><option>Robotic</option><option>Other</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </details>
            </div>

            <div className="space-y-3">
                {!isValid && (
                    <div className="flex items-start gap-2 p-3 bg-amber-900/20 border border-amber-500/30 rounded-xl">
                        <span className="text-amber-400 mt-0.5 shrink-0">⚠️</span>
                        <span className="text-sm text-amber-300">Missing: {getMissingClinical().join(', ')}</span>
                    </div>
                )}
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
        </div>
    );
};
