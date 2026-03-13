import { WizardDocCategory } from '../components/PreAuthWizard/types';
import { DocumentRequirement } from '../types';
import { getDocumentChecklist } from '../data/icd10MasterDatabase';

export const getRequiredDocuments = (diagnosisOrIcd10: string): DocumentRequirement[] => {
    // Attempt cashless checklist first
    const dbChecklist = getDocumentChecklist(diagnosisOrIcd10, 'cashless');
    
    const mapToWizardCategory = (name: string): WizardDocCategory => {
        const n = name.toLowerCase();
        if (n.includes('x-ray') || n.includes('cxr')) return 'chest_xray';
        if (n.includes('cbc') || n.includes('blood count')) return 'cbc';
        if (n.includes('abg')) return 'abg';
        if (n.includes('ecg')) return 'ecg';
        if (n.includes('ct scan')) return 'ct_scan';
        if (n.includes('mri')) return 'mri';
        if (n.includes('usg') || n.includes('ultrasound')) return 'ultrasound';
        if (n.includes('culture')) return 'blood_culture';
        if (n.includes('urine')) return 'urine_routine';
        if (n.includes('lft')) return 'lft';
        if (n.includes('kft') || n.includes('creatinine')) return 'kft';
        if (n.includes('policy') || n.includes('insurance')) return 'policy_copy';
        return 'other';
    };

    return [...dbChecklist.mandatory, ...dbChecklist.recommended].map(r => ({
        category: mapToWizardCategory(r.name) as any, // Cast for legacy support
        displayName: r.name,
        isRequired: r.mandatory,
        description: r.tpaQueryIfMissing,
    }));
};

/**
 * Matches a filename to a document category
 */
export const guessDocumentCategory = (filename: string): WizardDocCategory => {
    const lower = filename.toLowerCase();

    if (lower.includes('xray') || lower.includes('x-ray') || lower.includes('cxr')) return 'chest_xray';
    if (lower.includes('cbc') || lower.includes('blood count')) return 'cbc';
    if (lower.includes('abg') || lower.includes('blood gas')) return 'abg';
    if (lower.includes('ecg') || lower.includes('ekg')) return 'ecg';
    if (lower.includes('ct') || lower.includes('scan')) return 'ct_scan';
    if (lower.includes('mri')) return 'mri';
    if (lower.includes('usg') || lower.includes('ultrasound')) return 'ultrasound';
    if (lower.includes('culture')) return 'blood_culture';
    if (lower.includes('urine')) return 'urine_routine';
    if (lower.includes('lft') || lower.includes('liver')) return 'lft';
    if (lower.includes('kft') || lower.includes('kidney') || lower.includes('renal')) return 'kft';
    if (lower.includes('covid') || lower.includes('rtpcr')) return 'covid_test';
    if (lower.includes('ns1') || lower.includes('antigen')) return 'ns1_antigen';
    if (lower.includes('igm') || lower.includes('mac')) return 'dengue_igm';
    if (lower.includes('usg abdomen') || lower.includes('pelvis')) return 'usg_abdomen';
    if (lower.includes('policy') || lower.includes('insurance')) return 'policy_copy';
    if (lower.includes('pan')) return 'pan_card';
    if (lower.includes('id') || lower.includes('aadhaar')) return 'id_proof';

    return 'other';
};
