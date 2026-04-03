import React, { useRef, useState } from 'react';
import { useInsuranceCase } from '../../contexts/InsuranceCaseContext';
import { val } from '../../types/InsuranceCase';
import { INSURER_LIST, INDIAN_STATES, TPA_NAMES } from '../../config/tpaRegistry';
import { calculateAge, isPolicyActive, isPolicyExpiringSoon } from '../../utils/formatters';

interface PatientInsuranceStepProps {
    onNext: () => void;
}

const inputCls = 'w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors';
const labelCls = 'block text-xs text-gray-400 mb-1';

const SectionHeader = ({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) => (
    <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <span className="text-base">{icon}</span>
        </div>
        <div>
            <h3 className="font-bold text-white text-sm">{title}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
    </div>
);

export const PatientInsuranceStep: React.FC<PatientInsuranceStepProps> = ({ onNext }) => {
    const { state, setField, dispatch } = useInsuranceCase();
    const p = state.patient;
    const ins = state.insurance;

    const [isExtracting, setIsExtracting] = useState(false);

    // Track policy warning locally for UI feedback
    const [policyDateWarning, setPolicyDateWarning] = useState('');

    const handleFieldValue = (section: 'patient' | 'insurance', field: string, value: any) => {
        setField(section as any, field, value);
    };

    const handlePatientNameChange = (name: string) => {
        handleFieldValue('patient', 'patientName', name);
        if (!val(ins.proposerName)) {
            handleFieldValue('insurance', 'proposerName', name);
            handleFieldValue('insurance', 'insuredName', name);
        }
    };

    const handleDOBChange = (dob: string) => {
        handleFieldValue('patient', 'dateOfBirth', dob);
        handleFieldValue('patient', 'age', calculateAge(dob));
    };

    const handlePolicyEndDate = (date: string) => {
        handleFieldValue('insurance', 'policyEndDate', date);
        if (!isPolicyActive(date)) {
            setPolicyDateWarning('⚠️ This policy has expired. TPA will reject this pre-auth.');
        } else if (isPolicyExpiringSoon(date)) {
            setPolicyDateWarning('⚠️ Policy is expiring within 7 days. Verify renewal status.');
        } else {
            setPolicyDateWarning('');
        }
    };

    // Very basic check for validness to let user pass
    const isValid = !!(
        val(p.patientName) && val(p.age) && val(p.gender) && val(p.mobileNumber) && val(p.city) && val(p.state) &&
        val(ins.insurerName) && val(ins.tpaName) && val(ins.policyNumber) && val(ins.sumInsured)
    );

    const getMissingFields = () => {
        const missing: string[] = [];
        if (!val(p.patientName)) missing.push('Patient Name');
        if (!val(p.age)) missing.push('Age');
        if (!val(p.gender)) missing.push('Gender');
        if (!val(p.mobileNumber)) missing.push('Mobile');
        if (!val(p.city)) missing.push('City');
        if (!val(p.state)) missing.push('State');
        if (!val(ins.insurerName)) missing.push('Insurance Company');
        if (!val(ins.tpaName)) missing.push('TPA');
        if (!val(ins.policyNumber)) missing.push('Policy Number');
        if (!val(ins.sumInsured)) missing.push('Sum Insured');
        return missing;
    };

    return (
        <div className="space-y-5">
            <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span>Step 1 of 4</span>
                    <span>•</span>
                    <span>Patient &amp; Insurance</span>
                </div>
                <h2 className="text-xl font-bold text-white">Patient &amp; Insurance Details</h2>
            </div>

            {/* Patient Demographics */}
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-4">
                <SectionHeader icon="👤" title="Patient Demographics" subtitle="Basic patient information" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className={labelCls}>Full Name *</label>
                        <input value={val(p.patientName) ?? ''} onChange={e => handlePatientNameChange(e.target.value)}
                            className={inputCls} placeholder="As on insurance card" />
                    </div>
                    <div>
                        <label className={labelCls}>Age *</label>
                        <input type="number" value={val(p.age) ?? ''} onChange={e => handleFieldValue('patient', 'age', +e.target.value)}
                            className={inputCls} placeholder="Years" />
                    </div>
                    <div>
                        <label className={labelCls}>Gender *</label>
                        <select value={val(p.gender) ?? ''} onChange={e => handleFieldValue('patient', 'gender', e.target.value)}
                            className={inputCls}>
                            <option value="">Select</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Mobile Number *</label>
                        <input type="tel" value={val(p.mobileNumber) ?? ''} onChange={e => handleFieldValue('patient', 'mobileNumber', e.target.value)}
                            className={inputCls} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                        <label className={labelCls}>City *</label>
                        <input value={val(p.city) ?? ''} onChange={e => handleFieldValue('patient', 'city', e.target.value)}
                            className={inputCls} />
                    </div>
                    <div className="col-span-2">
                        <label className={labelCls}>State *</label>
                        <select value={val(p.state) ?? ''} onChange={e => handleFieldValue('patient', 'state', e.target.value)}
                            className={inputCls}>
                            <option value="">Select State</option>
                            {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* Optional patient fields */}
                <details className="group">
                    <summary className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl cursor-pointer hover:bg-gray-700/50 transition-colors list-none">
                        <span className="text-xs text-gray-400">+ More patient details (optional)</span>
                        <span className="text-gray-500 text-xs transition-transform group-open:rotate-180">▼</span>
                    </summary>
                    <div className="mt-3 grid grid-cols-2 gap-4 pl-2 border-l-2 border-gray-700">
                        <div>
                            <label className={labelCls}>Date of Birth</label>
                            <input type="date" value={val(p.dateOfBirth) ?? ''} onChange={e => handleDOBChange(e.target.value)} className={inputCls} />
                        </div>
                    </div>
                </details>
            </div>

            {/* Insurance Details */}
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-4">
                <SectionHeader icon="🛡️" title="Insurance &amp; Policy Details" subtitle="Insurer, TPA, and policy information" />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Insurance Company *</label>
                        <datalist id="insurer-list">{INSURER_LIST.map(i => <option key={i} value={i} />)}</datalist>
                        <input list="insurer-list" value={val(ins.insurerName) ?? ''} onChange={e => handleFieldValue('insurance', 'insurerName', e.target.value)}
                            className={inputCls} placeholder="Start typing insurer…" />
                    </div>
                    <div>
                        <label className={labelCls}>TPA Name *</label>
                        <select value={val(ins.tpaName) ?? ''} onChange={e => handleFieldValue('insurance', 'tpaName', e.target.value)} className={inputCls}>
                            <option value="">Select TPA</option>
                            {TPA_NAMES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Policy Number *</label>
                        <input value={val(ins.policyNumber) ?? ''} onChange={e => handleFieldValue('insurance', 'policyNumber', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Sum Insured (₹) *</label>
                        <input type="number" value={val(ins.sumInsured) ?? ''} onChange={e => handleFieldValue('insurance', 'sumInsured', +e.target.value)}
                            className={inputCls} placeholder="e.g. 500000" />
                    </div>
                    <div>
                         <label className={labelCls}>Policy End Date</label>
                         <input type="date" value={val(ins.policyEndDate) ?? ''} onChange={e => handlePolicyEndDate(e.target.value)} className={inputCls} />
                         {policyDateWarning && <p className="text-amber-400 text-xs mt-1">{policyDateWarning}</p>}
                    </div>
                </div>
            </div>

            {/* Missing fields + Continue button */}
            <div className="space-y-3">
                {!isValid && (
                    <div className="flex items-start gap-2 p-3 bg-amber-900/20 border border-amber-500/30 rounded-xl">
                        <span className="text-amber-400 mt-0.5 shrink-0">⚠️</span>
                        <span className="text-sm text-amber-300">Missing: {getMissingFields().join(', ')}</span>
                    </div>
                )}
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
                        isValid
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {isValid ? 'Continue to Clinical Details →' : 'Fill Required Fields to Continue'}
                </button>
            </div>
        </div>
    );
};
