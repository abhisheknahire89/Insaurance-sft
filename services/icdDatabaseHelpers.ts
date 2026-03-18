import { validateICDCode, lookupICD, normalize } from './icdLookupService';
import { ICD10_TIER1 } from '../data/icd10Tier1Enriched';

export const getConditionByCode = (code: string) => {
  const result = validateICDCode(code);
  return result.condition_data; // This is a Tier1Condition if tier === 1
};

export const getConditionByName = (name: string) => {
  const result = lookupICD(name);
  return result.condition_data;
};

export const searchConditions = (query: string) => {
  const result = lookupICD(query);
  return result.tier !== 'FLOOR' ? [result] : [];
};

export const predictTPAQueries = (code: string) => {
  const cond = getConditionByCode(code);
  return cond?.tpa_query_triggers || [];
};

export const getAdmissionJustificationTemplate = (code: string) => {
  return ""; // Deprecated in Tier 1 model
};

export const getSeverityMarkers = (code: string) => {
  const cond = getConditionByCode(code);
  return cond?.clinical_severity_markers || [];
};

export const getSpecialNotes = (code: string) => {
  const cond = getConditionByCode(code);
  return cond?.special_considerations || [];
};

export const validateAndSuggestICD10 = (diagnosis: string, findings?: string) => {
  const result = lookupICD(diagnosis, findings || '');
  return {
    isValid: result.tier !== 'FLOOR',
    isBillable: result.tier !== 'FLOOR',
    originalCode: diagnosis,
    suggestedCode: result.code,
    suggestedDescription: result.description,
    warningMessage: result.tier === 'FLOOR' ? result.reasoning : null
  };
};

export const getDocumentChecklist = (icd10Code: string, type: 'cashless' | 'reimbursement' = 'cashless') => {
  const condition = getConditionByCode(icd10Code);
  const docs = condition?.documentation_required || [];
  
  return {
    mandatory: docs.map((d: string) => ({ name: d, type: 'Mandatory' })),
    recommended: [],
    reimbursementExtra: type === 'reimbursement' ? [{ name: 'Cancelled Cheque', type: 'Required' }] : []
  };
};

export const estimateCost = (icd10Code: string, roomCategory: string, stayDays: number = 3) => {
  const condition = getConditionByCode(icd10Code);
  
  if (!condition || !condition.cost_estimate) {
    return {
      average: 25000,
      max: 50000,
      breakdown: {
        roomCharges: 5000,
        consultantFees: 2000,
        investigations: 5000,
        medicines: 5000,
        procedures: 0,
        nursing: 1000,
        miscellaneous: 2000
      }
    };
  }

  const cost = condition.cost_estimate;
  
  return {
    average: cost.roomRent + cost.nursing + cost.investigations + cost.medicines + cost.consultantFee + cost.otCharges + cost.surgeonFee,
    max: cost.roomRent + cost.nursing + cost.investigations + cost.medicines + cost.consultantFee + cost.otCharges + cost.surgeonFee * 1.5,
    breakdown: {
      roomCharges: cost.roomRent + (cost.icuCharges || 0),
      consultantFees: cost.consultantFee,
      investigations: cost.investigations,
      medicines: cost.medicines,
      procedures: cost.otCharges + cost.surgeonFee + cost.anesthetistFee + (cost.implants || 0),
      nursing: cost.nursing,
      miscellaneous: cost.consumables
    }
  };
};

export const isPMJAYEligible = (icd10Code: string) => {
    const condition = getConditionByCode(icd10Code);
    if (!condition) return { eligible: false };
    
    return {
        eligible: condition.pmjay_eligible,
        hbpCode: condition.pmjay_package_code,
        packageRate: condition.pmjay_package_rate
    };
};

export { lookupICD };

export const calculateGuaranteedCost = (code: string, category: string, roomCat: string, isPMJAY: boolean, customLOS: number | null, customICU: number | null) => {
    const cost = estimateCost(code, roomCat, customLOS || 3);
    const wardDays = Math.max(0, (customLOS || 3) - (customICU || 0));
    const icuDays = customICU || 0;
    
    return {
        total_estimated: cost.average,
        calculation_confidence: 'high',
        los: { total_days: wardDays + icuDays, ward_days: wardDays, icu_days: icuDays },
        breakdown: {
            room_rent: cost.breakdown.roomCharges,
            nursing_charges: cost.breakdown.nursing,
            icu_charges: 0,
            ot_charges: cost.breakdown.procedures * 0.2,
            surgeon_fee: cost.breakdown.procedures * 0.6,
            anesthetist_fee: cost.breakdown.procedures * 0.2,
            consultant_fee: cost.breakdown.consultantFees,
            investigations: cost.breakdown.investigations,
            medicines: cost.breakdown.medicines,
            consumables: 0,
            implants: 0,
            miscellaneous: cost.breakdown.miscellaneous
        },
        claimed_amount: cost.average
    };
};

export const validateAndFixCostEstimate = (costObj: any) => {
    return costObj;
};

export const inferICDFromDiagnosis = (diagnosis: string) => {
    const res = lookupICD(diagnosis);
    return res.tier !== 'FLOOR' ? res.code : null;
};
