import { CostEstimate, RoomCategory, SeverityAssessment } from '../components/PreAuthWizard/types';
import ICD_COSTS_DATA from '../config/icd_costs_database.json';
export function calculateExpectedLOS(
  icdCode: string,
  roomCategory: RoomCategory,
  severity: SeverityAssessment
): { total: number; ward: number; icu: number } {
  const condition = ICD_COSTS_DATA.conditions.find(c => c.icd_code === icdCode || icdCode.startsWith(c.icd_code)) || {
    los: { avg: 3, icu: 0 }
  };
  
  let icuDays = condition.los.icu || 0;
  let totalDays = condition.los.avg || 3;

  // Severity Overrides
  if (severity.overallRisk === 'Critical') {
    icuDays = Math.max(icuDays, 4); // Min 4 days ICU for critical
    totalDays = Math.max(totalDays, 7);
  } else if (severity.overallRisk === 'High') {
    icuDays = Math.max(icuDays, 2);
  }

  // Cap ICU days to total days
  icuDays = Math.min(icuDays, totalDays);
  
  return {
    total: totalDays,
    ward: totalDays - icuDays,
    icu: icuDays
  };
}

export function calculateCost(
  icdCode: string,
  roomCategory: RoomCategory,
  isPMJAY: boolean,
  customLOS?: number,
  customICUDays?: number,
  severity?: SeverityAssessment
): CostEstimate {
  const dbResult = ICD_COSTS_DATA.conditions.find(c => c.icd_code === icdCode || icdCode.startsWith(c.icd_code));
  const fallbackPrices = { ward: 5000, icu: 15000, invest: 10000, med_per_day: 3000, consult: 1500, procedure: 50000 };
  
  const selectedLOS = customLOS || (dbResult ? dbResult.los.avg : 3);
  let selectedICU = customICUDays || (dbResult ? dbResult.los.icu : 0);

  if (!customICUDays && severity) {
     const override = calculateExpectedLOS(icdCode, roomCategory, severity);
     selectedICU = override.icu;
  }

  const wardDays = Math.max(0, selectedLOS - selectedICU);
  let totalEst = 0;
  
  if (isPMJAY && dbResult?.pmjay.eligible) {
     totalEst = dbResult.pmjay.rate;
  } else {
     const rates = dbResult?.private || fallbackPrices;
     const roomRate = rates.ward || fallbackPrices.ward;
     const icuRate = rates.icu || fallbackPrices.icu;
     const procRate = rates.procedure || 0;
     const medRate = rates.med_per_day || fallbackPrices.med_per_day;
     const investRate = ('invest' in rates ? rates.invest : undefined) || fallbackPrices.invest;
     
     totalEst = (roomRate * wardDays) + (icuRate * selectedICU) + procRate + (medRate * selectedLOS) + investRate;
  }

  return calculateTotals({
    roomRentPerDay: dbResult?.private?.ward || fallbackPrices.ward,
    expectedRoomDays: wardDays,
    icuChargesPerDay: dbResult?.private?.icu || fallbackPrices.icu,
    expectedIcuDays: selectedICU,
    otCharges: dbResult?.private?.procedure ? dbResult.private.procedure * 0.3 : 0,
    surgeonFee: dbResult?.private?.procedure ? dbResult.private.procedure * 0.5 : 0,
    anesthetistFee: dbResult?.private?.procedure ? dbResult.private.procedure * 0.2 : 0,
    medicinesEstimate: (dbResult?.private?.med_per_day || fallbackPrices.med_per_day) * selectedLOS,
    investigationsEstimate: dbResult?.private?.invest || fallbackPrices.invest,
    consultantFee: (dbResult?.private?.consult || fallbackPrices.consult) * selectedLOS,
    amountClaimedFromInsurer: totalEst
  });
}

/**
 * Recalculates all derived totals in a CostEstimate object.
 * Call this whenever any numeric field changes.
 */
export const calculateTotals = (cost: Partial<CostEstimate>, sumInsured: number = 0): CostEstimate => {
    const base: CostEstimate = {
        roomRentPerDay: cost.roomRentPerDay ?? 0,
        expectedRoomDays: cost.expectedRoomDays ?? 0,
        totalRoomCharges: 0,
        nursingChargesPerDay: cost.nursingChargesPerDay ?? 0,
        totalNursingCharges: 0,
        icuChargesPerDay: cost.icuChargesPerDay ?? 0,
        expectedIcuDays: cost.expectedIcuDays ?? 0,
        totalIcuCharges: 0,
        otCharges: cost.otCharges ?? 0,
        surgeonFee: cost.surgeonFee ?? 0,
        anesthetistFee: cost.anesthetistFee ?? 0,
        consultantFee: cost.consultantFee ?? 0,
        otherDoctorFees: cost.otherDoctorFees ?? 0,
        investigationsEstimate: cost.investigationsEstimate ?? 0,
        medicinesEstimate: cost.medicinesEstimate ?? 0,
        consumablesEstimate: cost.consumablesEstimate ?? 0,
        implants: cost.implants ?? [],
        totalImplantsCost: 0,
        ambulanceCharges: cost.ambulanceCharges ?? 0,
        miscCharges: cost.miscCharges ?? 0,
        packageName: cost.packageName,
        packageAmount: cost.packageAmount,
        isPackageRate: cost.isPackageRate ?? false,
        totalEstimatedCost: 0,
        amountClaimedFromInsurer: 0,
        patientResponsibility: 0,
        exceedsSumInsured: false,
        excessAmount: 0,
        copayPercentage: cost.copayPercentage,
        copayAmount: 0,
    };

    if (base.isPackageRate && base.packageAmount) {
        base.totalEstimatedCost = base.packageAmount;
    } else {
        base.totalRoomCharges = base.roomRentPerDay * base.expectedRoomDays;
        base.totalNursingCharges = base.nursingChargesPerDay * base.expectedRoomDays;
        base.totalIcuCharges = base.icuChargesPerDay * base.expectedIcuDays;
        base.totalImplantsCost = base.implants.reduce((sum, i) => sum + (i.implantCost ?? 0), 0);

        base.totalEstimatedCost =
            base.totalRoomCharges +
            base.totalNursingCharges +
            base.totalIcuCharges +
            base.otCharges +
            base.surgeonFee +
            base.anesthetistFee +
            base.consultantFee +
            base.otherDoctorFees +
            base.investigationsEstimate +
            base.medicinesEstimate +
            base.consumablesEstimate +
            base.totalImplantsCost +
            base.ambulanceCharges +
            base.miscCharges;
    }

    if (base.copayPercentage) {
        base.copayAmount = Math.round(base.totalEstimatedCost * (base.copayPercentage / 100));
    }

    // Default claimed = min(total, sum insured)
    base.amountClaimedFromInsurer = cost.amountClaimedFromInsurer !== undefined
        ? cost.amountClaimedFromInsurer
        : (sumInsured > 0 ? Math.min(base.totalEstimatedCost, sumInsured) : base.totalEstimatedCost);

    base.patientResponsibility = Math.max(0, base.totalEstimatedCost - base.amountClaimedFromInsurer);
    base.exceedsSumInsured = sumInsured > 0 && base.totalEstimatedCost > sumInsured;
    base.excessAmount = base.exceedsSumInsured ? base.totalEstimatedCost - sumInsured : 0;

    return base;
};

export const formatCostDisplay = (amount: number): string =>
    `₹${amount.toLocaleString('en-IN')}`;
