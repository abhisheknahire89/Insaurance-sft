import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  InsuranceCase, 
  createEmptyInsuranceCase,
  TrackedField,
  tracked,
} from '../types/InsuranceCase';
import { parseVoiceTranscript, mergeIntoCase } from '../services/UnifiedInputParser';
import { validateCase } from '../services/ValidationGate';
import { computeICD } from '../engine/ICDEngine';
import { computeSeverity } from '../engine/SeverityEngine';
import { computeCost } from '../engine/CostEngine';
import { computeMedicalNecessity } from '../engine/MedicalNecessityEngine';

// ============================================================================
// ACTION TYPES
// ============================================================================

type Action =
  | { type: 'RESET' }
  | { type: 'SET_FIELD'; section: string; field: string; value: any; source: string }
  | { type: 'IMPORT_VOICE'; transcript: string }
  | { type: 'MERGE_DATA'; data: Partial<InsuranceCase> }
  | { type: 'RUN_ENGINES' }
  | { type: 'VALIDATE' }
  | { type: 'SET_STATUS'; status: InsuranceCase['status'] }
  | { type: 'SET_CASE'; insuranceCase: InsuranceCase };

// ============================================================================
// REDUCER
// ============================================================================

function reducer(state: InsuranceCase, action: Action): InsuranceCase {
  switch (action.type) {
    case 'RESET':
      return createEmptyInsuranceCase();
      
    case 'SET_FIELD': {
      const newState = { ...state };
      const section = newState[action.section as keyof InsuranceCase];
      
      if (section && typeof section === 'object') {
        (section as any)[action.field] = tracked(action.value, action.source as any);
      }
      
      newState.updatedAt = new Date();
      newState.trace.push({
        timestamp: new Date(),
        action: 'SET_FIELD',
        field: `${action.section}.${action.field}`,
        newValue: action.value,
        source: action.source,
      });
      
      return newState;
    }
    
    case 'MERGE_DATA':
      return mergeIntoCase(state, action.data);
      
    case 'VALIDATE': {
      const validation = validateCase(state);
      return {
        ...state,
        validation,
        updatedAt: new Date(),
        trace: [...state.trace, {
          timestamp: new Date(),
          action: 'VALIDATE',
        }],
      };
    }
    
    case 'SET_STATUS':
      return {
        ...state,
        status: action.status,
        updatedAt: new Date(),
        trace: [...state.trace, {
          timestamp: new Date(),
          action: 'SET_STATUS',
          newValue: action.status,
        }],
      };
      
    case 'SET_CASE':
      return action.insuranceCase;
      
    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

export interface InsuranceCaseContextValue {
  state: InsuranceCase;
  dispatch: React.Dispatch<Action>;
  
  // High-level actions
  importVoiceTranscript: (transcript: string) => Promise<void>;
  setField: (section: string, field: string, value: any) => void;
  runAllEngines: () => Promise<void>;
  validate: () => void;
  reset: () => void;
  
  // Debug
  getTrace: () => InsuranceCase['trace'];
  getFieldSource: (section: string, field: string) => string | undefined;
}

export const InsuranceCaseContext = createContext<InsuranceCaseContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function InsuranceCaseProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createEmptyInsuranceCase);
  
  // Import voice transcript
  const importVoiceTranscript = useCallback(async (transcript: string) => {
    console.log('[Context] Importing voice transcript...');
    
    dispatch({ type: 'SET_STATUS', status: 'validating' });
    
    try {
      const extractedData = await parseVoiceTranscript(transcript);
      dispatch({ type: 'MERGE_DATA', data: extractedData });
      
      // Run engines after import
      await runAllEngines(state); // We will pass current state inside
      
      // Validate
      dispatch({ type: 'VALIDATE' });
      
      dispatch({ type: 'SET_STATUS', status: 'validated' });
    } catch (error) {
      console.error('[Context] Voice import failed:', error);
      dispatch({ type: 'SET_STATUS', status: 'error' });
    }
  }, [state]);
  
  // Set a single field
  const setField = useCallback((section: string, field: string, value: any) => {
    dispatch({ type: 'SET_FIELD', section, field, value, source: 'manual' });
  }, []);
  
  // Run all processing engines
  const runAllEngines = useCallback(async (currentState?: InsuranceCase) => {
    console.log('[Context] Running all engines...');
    
    // Get current state for processing
    const processingState = currentState || state;
    
    // Run ICD engine
    const icdResult = await computeICD(processingState);
    dispatch({ type: 'MERGE_DATA', data: { computed: { ...processingState.computed, icd: icdResult } } });
    
    // Run severity engine
    const severityResult = await computeSeverity(processingState);
    dispatch({ type: 'MERGE_DATA', data: { computed: { ...processingState.computed, severity: severityResult } } });
    
    // Run cost engine
    const costResult = await computeCost(processingState);
    dispatch({ type: 'MERGE_DATA', data: { computed: { ...processingState.computed, cost: costResult } } });
    
    // Run medical necessity engine
    const medNecResult = await computeMedicalNecessity(processingState);
    dispatch({ type: 'MERGE_DATA', data: { computed: { ...processingState.computed, medicalNecessity: medNecResult } } });
    
    console.log('[Context] All engines complete');
  }, [state]);
  
  // Validate
  const validate = useCallback(() => {
    dispatch({ type: 'VALIDATE' });
  }, []);
  
  // Reset
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);
  
  // Debug: Get trace
  const getTrace = useCallback(() => {
    return state.trace;
  }, [state.trace]);
  
  // Debug: Get field source
  const getFieldSource = useCallback((section: string, field: string) => {
    const sectionData = state[section as keyof InsuranceCase];
    if (sectionData && typeof sectionData === 'object') {
      const fieldData = (sectionData as any)[field] as TrackedField<any> | undefined;
      return fieldData?.source;
    }
    return undefined;
  }, [state]);
  
  const value: InsuranceCaseContextValue = {
    state,
    dispatch,
    importVoiceTranscript,
    setField,
    runAllEngines,
    validate,
    reset,
    getTrace,
    getFieldSource,
  };
  
  return (
    <InsuranceCaseContext.Provider value={value}>
      {children}
    </InsuranceCaseContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useInsuranceCase() {
  const context = useContext(InsuranceCaseContext);
  if (!context) {
    throw new Error('useInsuranceCase must be used within InsuranceCaseProvider');
  }
  return context;
}
