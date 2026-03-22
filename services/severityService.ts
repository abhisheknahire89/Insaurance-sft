import { WizardVitals, SeverityAssessment } from '../components/PreAuthWizard/types';

export function calculateOverallSeverity(
    vitals: WizardVitals | undefined,
    icdCode: string,
    clinicalNotes: string
): SeverityAssessment {
    let phenoIntensity = 0.5;
    let urgencyQuotient = 0.5;
    let deteriorationVelocity = 0.4;
    let overallRisk: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Moderate';
    let mustNotMiss = false;

    const notesLower = clinicalNotes.toLowerCase();
    
    let isCritical = false;
    let isHigh = false;

    // Cardiac mapping
    if (icdCode.startsWith('I21') || notesLower.includes('stemi') || notesLower.includes('cardiogenic shock') || notesLower.includes('myocardial infarction')) {
        isCritical = true;
        mustNotMiss = true;
    }

    // Vitals Escalators
    if (vitals?.spo2) {
        const spo2 = parseInt(vitals.spo2);
        if (spo2 < 90) isCritical = true;
        else if (spo2 < 94) isHigh = true;
    }

    if (vitals?.bp) {
        const [sys, dia] = vitals.bp.split('/').map(Number);
        if (sys && (sys < 90 || sys > 200)) isCritical = true; // Hypotension or Hypertensive Emergency
        else if (sys && (sys < 100 || sys > 180)) isHigh = true;
    }

    if (vitals?.pulse) {
        const pulse = parseInt(vitals.pulse);
        if (pulse > 130 || pulse < 40) isCritical = true;
        else if (pulse > 110 || pulse < 50) isHigh = true;
    }

    if (isCritical) {
        phenoIntensity = 0.9;
        urgencyQuotient = 0.9;
        deteriorationVelocity = 0.8;
        overallRisk = 'Critical';
    } else if (isHigh) {
        phenoIntensity = 0.7;
        urgencyQuotient = 0.7;
        deteriorationVelocity = 0.6;
        overallRisk = 'High';
    }

    return {
        phenoIntensity,
        urgencyQuotient,
        deteriorationVelocity,
        overallRisk,
        mustNotMiss
    };
}
