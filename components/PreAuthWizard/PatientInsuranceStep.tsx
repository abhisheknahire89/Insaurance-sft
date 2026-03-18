import React, { useState, useRef } from 'react';
import { PatientRecord, InsurancePolicyDetails } from '../PreAuthWizard/types';
import { INSURER_LIST, INDIAN_STATES, TPA_NAMES } from '../../config/tpaRegistry';
import { calculateAge, isPolicyActive, isPolicyExpiringSoon } from '../../utils/formatters';
import { extractFromDocument } from '../../services/documentExtractionService';

interface PatientInsuranceStepProps {
    patient: Partial<PatientRecord>;
    insurance: Partial<InsurancePolicyDetails>;
    onPatientChange: (p: Partial<PatientRecord>) => void;
    onInsuranceChange: (ins: Partial<InsurancePolicyDetails>) => void;
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

export const PatientInsuranceStep: React.FC<PatientInsuranceStepProps> = ({
    patient, insurance, onPatientChange, onInsuranceChange, onNext
}) => {
    const [isExtracting, setIsExtracting] = useState(false);
    const [policyDateWarning, setPolicyDateWarning] = useState('');
    const [extractionException, setExtractionException] = useState('');
    const [extractionResult, setExtractionResult] = useState<{ filled: string[]; pending: string[] } | null>(null);

    const fileRef = useRef<HTMLInputElement>(null);

    // Smart defaults: auto-fill proposer & relationship when patient name changes
    const handlePatientNameChange = (name: string) => {
        onPatientChange({ ...patient, patientName: name });
        if (!insurance.proposerName) {
            onInsuranceChange({
                ...insurance,
                proposerName: name,
                insuredName: name,
                relationshipWithProposer: insurance.relationshipWithProposer || 'Self',
            });
        }
    };

    const handleDOBChange = (dob: string) => {
        onPatientChange({ ...patient, dateOfBirth: dob, age: calculateAge(dob) });
    };

    const handlePolicyEndDate = (date: string) => {
        onInsuranceChange({ ...insurance, policyEndDate: date });
        if (!isPolicyActive(date)) {
            setPolicyDateWarning('⚠️ This policy has expired. TPA will reject this pre-auth.');
        } else if (isPolicyExpiringSoon(date)) {
            setPolicyDateWarning('⚠️ Policy is expiring within 7 days. Verify renewal status.');
        } else {
            setPolicyDateWarning('');
        }
    };

    const handleFileUpload = async (file: File) => {
        setIsExtracting(true);
        setExtractionException('');
        setExtractionResult(null);
        try {
            const extracted = await extractFromDocument(file);
            if (extracted.document_type === 'unknown' || extracted.confidence < 40) {
                setExtractionException('Could not read document clearly. Please enter details manually.');
                return;
            }
            const dob = extracted.patient?.dob || patient.dateOfBirth;
            onPatientChange({
                ...patient,
                patientName: extracted.patient?.name || patient.patientName,
                dateOfBirth: dob,
                age: extracted.patient?.age || (dob ? calculateAge(dob) : patient.age),
                gender: (extracted.patient?.gender as any) || patient.gender,
                mobileNumber: extracted.patient?.phone || patient.mobileNumber,
                city: patient.city,
                state: patient.state,
            });
            const endDate = extracted.insurance?.valid_till || insurance.policyEndDate;
            onInsuranceChange({
                ...insurance,
                insurerName: extracted.insurance?.insurance_company || insurance.insurerName,
                tpaName: extracted.insurance?.tpa_name || insurance.tpaName,
                policyNumber: extracted.insurance?.policy_number || insurance.policyNumber,
                sumInsured: extracted.insurance?.sum_insured || insurance.sumInsured,
                policyEndDate: endDate,
                dataSource: 'ocr',
                ocrConfidence: extracted.confidence,
            });
            if (endDate) handlePolicyEndDate(endDate);
            setExtractionResult({ filled: extracted.extracted_fields, pending: extracted.missing_fields });
        } catch (error: any) {
            setExtractionException(error.message || 'Failed to parse document. Please try a clearer image.');
        } finally {
            setIsExtracting(false);
        }
    };

    const isValid = !!(
        patient.patientName && patient.age && patient.gender && patient.mobileNumber && patient.city && patient.state &&
        insurance.insurerName && insurance.tpaName && insurance.policyNumber && insurance.sumInsured
    );

    const getMissingFields = () => {
        const missing: string[] = [];
        if (!patient.patientName) missing.push('Patient Name');
        if (!patient.age) missing.push('Age');
        if (!patient.gender) missing.push('Gender');
        if (!patient.mobileNumber) missing.push('Mobile');
        if (!patient.city) missing.push('City');
        if (!patient.state) missing.push('State');
        if (!insurance.insurerName) missing.push('Insurance Company');
        if (!insurance.tpaName) missing.push('TPA');
        if (!insurance.policyNumber) missing.push('Policy Number');
        if (!insurance.sumInsured) missing.push('Sum Insured');
        return missing;
    };

    return (
        <div className="space-y-5">
            {/* Step context */}
            <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span>Step 1 of 4</span>
                    <span>•</span>
                    <span>Patient &amp; Insurance</span>
                </div>
                <h2 className="text-xl font-bold text-white">Patient &amp; Insurance Details</h2>
            </div>

            {/* Slim OCR helper */}
            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                    <span className="text-lg">📷</span>
                    <span className="text-sm text-gray-400">Have an insurance card? Auto-fill details</span>
                </div>
                <label className={`px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer transition-colors ${isExtracting ? 'bg-gray-700 opacity-60' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    {isExtracting ? (
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                            Reading…
                        </span>
                    ) : 'Scan Card'}
                    <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
                </label>
            </div>

            {/* OCR result / error banners */}
            {extractionException && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-sm text-red-400">{extractionException}</div>
            )}
            {extractionResult && (
                <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <span>✓</span>
                        <span>Extracted {extractionResult.filled.length} fields from card
                            {extractionResult.pending.length > 0 && (
                                <span className="text-amber-400 ml-2">({extractionResult.pending.length} need manual input)</span>
                            )}
                        </span>
                    </div>
                </div>
            )}

            {/* Patient Demographics — required fields always visible */}
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-4">
                <SectionHeader icon="👤" title="Patient Demographics" subtitle="Basic patient information" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className={labelCls}>Full Name *</label>
                        <input value={patient.patientName ?? ''} onChange={e => handlePatientNameChange(e.target.value)}
                            className={inputCls} placeholder="As on insurance card" />
                    </div>
                    <div>
                        <label className={labelCls}>Age *</label>
                        <input type="number" value={patient.age ?? ''} onChange={e => onPatientChange({ ...patient, age: +e.target.value })}
                            className={inputCls} placeholder="Years" />
                    </div>
                    <div>
                        <label className={labelCls}>Gender *</label>
                        <select value={patient.gender ?? ''} onChange={e => onPatientChange({ ...patient, gender: e.target.value as any })}
                            className={inputCls}>
                            <option value="">Select</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Mobile Number *</label>
                        <input type="tel" value={patient.mobileNumber ?? ''} onChange={e => onPatientChange({ ...patient, mobileNumber: e.target.value })}
                            className={inputCls} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                        <label className={labelCls}>City *</label>
                        <input value={patient.city ?? ''} onChange={e => onPatientChange({ ...patient, city: e.target.value })}
                            className={inputCls} />
                    </div>
                    <div className="col-span-2">
                        <label className={labelCls}>State *</label>
                        <select value={patient.state ?? ''} onChange={e => onPatientChange({ ...patient, state: e.target.value })}
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
                            <input type="date" value={patient.dateOfBirth ?? ''} onChange={e => handleDOBChange(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Marital Status</label>
                            <select value={patient.maritalStatus ?? ''} onChange={e => onPatientChange({ ...patient, maritalStatus: e.target.value as any })} className={inputCls}>
                                <option value="">Select</option>
                                <option>Single</option><option>Married</option><option>Widowed</option><option>Divorced</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Email</label>
                            <input type="email" value={patient.email ?? ''} onChange={e => onPatientChange({ ...patient, email: e.target.value })} className={inputCls} placeholder="optional" />
                        </div>
                        <div>
                            <label className={labelCls}>Occupation</label>
                            <input value={patient.occupation ?? ''} onChange={e => onPatientChange({ ...patient, occupation: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Pincode</label>
                            <input value={patient.pincode ?? ''} onChange={e => onPatientChange({ ...patient, pincode: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>UHID (Hospital ID)</label>
                            <input value={patient.uhid ?? ''} onChange={e => onPatientChange({ ...patient, uhid: e.target.value })} className={inputCls} placeholder="optional" />
                        </div>
                        <div>
                            <label className={labelCls}>Aadhaar Number</label>
                            <input value={patient.aadhaarNumber ?? ''} onChange={e => onPatientChange({ ...patient, aadhaarNumber: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>ABHA ID</label>
                            <input value={patient.abhaId ?? ''} onChange={e => onPatientChange({ ...patient, abhaId: e.target.value })} className={inputCls} />
                        </div>
                        <div className="col-span-2">
                            <label className={labelCls}>Address</label>
                            <input value={patient.address ?? ''} onChange={e => onPatientChange({ ...patient, address: e.target.value })} className={inputCls} />
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
                        <input list="insurer-list" value={insurance.insurerName ?? ''} onChange={e => onInsuranceChange({ ...insurance, insurerName: e.target.value })}
                            className={inputCls} placeholder="Start typing insurer…" />
                    </div>
                    <div>
                        <label className={labelCls}>TPA Name *</label>
                        <select value={insurance.tpaName ?? ''} onChange={e => onInsuranceChange({ ...insurance, tpaName: e.target.value })} className={inputCls}>
                            <option value="">Select TPA</option>
                            {TPA_NAMES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Policy Number *</label>
                        <input value={insurance.policyNumber ?? ''} onChange={e => onInsuranceChange({ ...insurance, policyNumber: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Sum Insured (₹) *</label>
                        <input type="number" value={insurance.sumInsured ?? ''} onChange={e => onInsuranceChange({ ...insurance, sumInsured: +e.target.value })}
                            className={inputCls} placeholder="e.g. 500000" />
                    </div>
                </div>

                {/* Optional insurance fields */}
                <details className="group">
                    <summary className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl cursor-pointer hover:bg-gray-700/50 transition-colors list-none">
                        <span className="text-xs text-gray-400">+ More policy details (optional)</span>
                        <span className="text-gray-500 text-xs transition-transform group-open:rotate-180">▼</span>
                    </summary>
                    <div className="mt-3 grid grid-cols-2 gap-4 pl-2 border-l-2 border-gray-700">
                        <div>
                            <label className={labelCls}>TPA ID Card Number</label>
                            <input value={insurance.tpaIdCardNumber ?? ''} onChange={e => onInsuranceChange({ ...insurance, tpaIdCardNumber: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Policy Type</label>
                            <select value={insurance.policyType ?? 'Individual'} onChange={e => onInsuranceChange({ ...insurance, policyType: e.target.value as any })} className={inputCls}>
                                <option>Individual</option><option>Floater</option><option>Corporate</option><option>Group</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Policy Start Date</label>
                            <input type="date" value={insurance.policyStartDate ?? ''} onChange={e => onInsuranceChange({ ...insurance, policyStartDate: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Policy End Date</label>
                            <input type="date" value={insurance.policyEndDate ?? ''} onChange={e => handlePolicyEndDate(e.target.value)} className={inputCls} />
                            {policyDateWarning && <p className="text-amber-400 text-xs mt-1">{policyDateWarning}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Proposer Name</label>
                            <input value={insurance.proposerName ?? ''} onChange={e => onInsuranceChange({ ...insurance, proposerName: e.target.value })}
                                className={inputCls} placeholder="Defaults to patient name" />
                        </div>
                        <div>
                            <label className={labelCls}>Relationship with Proposer</label>
                            <select value={insurance.relationshipWithProposer ?? 'Self'} onChange={e => onInsuranceChange({ ...insurance, relationshipWithProposer: e.target.value })} className={inputCls}>
                                <option>Self</option><option>Spouse</option><option>Son</option><option>Daughter</option><option>Father</option><option>Mother</option><option>Other</option>
                            </select>
                        </div>
                    </div>
                </details>
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
