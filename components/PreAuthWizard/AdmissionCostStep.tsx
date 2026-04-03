import React from 'react';
import { useInsuranceCase } from '../../contexts/InsuranceCaseContext';
import { val } from '../../types/InsuranceCase';
import { formatCostDisplay } from '../../utils/costCalculator';

interface AdmissionCostStepProps {
    onNext: () => void;
    onBack: () => void;
}

export const AdmissionCostStep: React.FC<AdmissionCostStepProps> = ({ onNext, onBack }) => {
    const { state, setField } = useInsuranceCase();
    const adm = state.admission;
    const computedCost = state.computed?.cost;

    const updateField = (field: string, value: any) => setField('admission', field, value);

    // Make sure we have the required fields to move on
    const isValid = !!(val(adm.admissionType) && val(adm.roomCategory));

    return (
        <div className="space-y-5">
            <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span>Step 3 of 4</span>
                    <span>•</span>
                    <span>Admission &amp; Cost</span>
                </div>
                <h2 className="text-xl font-bold text-white">Admission Details</h2>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><span>🏥</span></div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Admission Planning</h3>
                    </div>
                </div>

                <div className="flex gap-4">
                    {['Emergency', 'Planned'].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" value={type}
                                checked={val(adm.admissionType) === type}
                                onChange={() => updateField('admissionType', type)} className="accent-blue-500" />
                            <span className="text-sm text-gray-200">{type}</span>
                        </label>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Date of Admission *</label>
                        <input type="date" value={val(adm.dateOfAdmission) ?? ''} onChange={e => updateField('dateOfAdmission', e.target.value)}
                            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-2">Room Category *</label>
                        <select value={val(adm.roomCategory) ?? ''} onChange={e => updateField('roomCategory', e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                            <option value="">Select...</option>
                            <option>General Ward</option>
                            <option>Private</option>
                            <option>ICU</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><span>💰</span></div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Engine-Computed Cost</h3>
                        <p className="text-xs text-gray-500">Automatically generated from diagnosis & room</p>
                    </div>
                </div>

                {computedCost ? (
                    <div className="bg-gray-900 rounded-lg p-4 border border-emerald-500/30">
                        <div className="flex justify-between items-center mb-4 text-emerald-400">
                            <span>Computed Total Estimate:</span>
                            <span className="text-2xl font-bold">{formatCostDisplay(val(computedCost.totalEstimate) || 0)}</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-400">
                            <div className="flex justify-between">
                                <span>Ward Days:</span>
                                <span>{val(computedCost.los?.wardDays)} days</span>
                            </div>
                            <div className="flex justify-between">
                                <span>ICU Days:</span>
                                <span>{val(computedCost.los?.icuDays)} days</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500 text-sm">
                        Calculating... Please wait or go back and ensure diagnosis is set.
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
                    {isValid ? 'Continue to Generation →' : 'Select Admission Details'}
                </button>
            </div>
        </div>
    );
};
