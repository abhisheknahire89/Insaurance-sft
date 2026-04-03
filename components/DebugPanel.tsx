import React from 'react';
import { useInsuranceCase } from '../contexts/InsuranceCaseContext';
import { val } from '../types/InsuranceCase';

export function DebugPanel() {
  const { state, getTrace } = useInsuranceCase();
  const trace = getTrace();
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 0, 
      right: 0, 
      width: '400px', 
      maxHeight: '300px',
      overflow: 'auto',
      background: '#1a1a1a', 
      color: '#00ff00',
      fontFamily: 'monospace',
      fontSize: '11px',
      padding: '10px',
      borderTopLeftRadius: '8px',
      zIndex: 9999
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid #333' }}>
        🔍 DEBUG: {state.caseId}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> {state.status} | 
        <strong> Valid:</strong> {state.validation.isValid ? '✅' : '❌'} | 
        <strong> Completeness:</strong> {state.validation.completenessScore}%
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Key Values:</strong>
        <div>• Patient: {val(state.patient.patientName) || '❌ MISSING'} ({state.patient.patientName?.source})</div>
        <div>• Age: {val(state.patient.age) || '❌ MISSING'} ({state.patient.age?.source})</div>
        <div>• Insurer: {val(state.insurance.insurerName) || '❌ MISSING'} ({state.insurance.insurerName?.source})</div>
        <div>• Sum Insured: {val(state.insurance.sumInsured) || '❌ MISSING'} ({state.insurance.sumInsured?.source})</div>
        <div>• Diagnosis: {val(state.clinical.provisionalDiagnosis) || '❌ MISSING'} ({state.clinical.provisionalDiagnosis?.source})</div>
        <div>• ICD: {val(state.computed?.icd?.primaryCode) || '❌ NOT COMPUTED'}</div>
        <div>• Cost: {val(state.computed?.cost?.totalEstimate) || '❌ NOT COMPUTED'}</div>
        <div>• Severity: {val(state.computed?.severity?.overallLevel) || '❌ NOT COMPUTED'}</div>
      </div>
      
      {state.validation.errors.length > 0 && (
        <div style={{ color: '#ff6b6b', marginBottom: '10px' }}>
          <strong>Errors:</strong>
          {state.validation.errors.map((e, i) => (
            <div key={i}>• {e.message}</div>
          ))}
        </div>
      )}
      
      <div>
        <strong>Trace (last 5):</strong>
        {trace.slice(-5).map((t, i) => (
          <div key={i} style={{ color: '#888' }}>
            [{new Date(t.timestamp).toLocaleTimeString()}] {t.action} 
            {t.field && ` → ${t.field}`}
            {t.newValue !== undefined && ` = ${JSON.stringify(t.newValue).slice(0, 30)}`}
          </div>
        ))}
      </div>
    </div>
  );
}
