export interface ICDAuditLog {
  timestamp: string;
  originalDiagnosisTerm: string;
  selectedICD: string;
  matchLayer: string;
  confidenceScore: number;
  userId: string;
  recordId: string;
}

export function logICDSelection(log: Omit<ICDAuditLog, 'timestamp'>) {
  const auditEntry: ICDAuditLog = {
    ...log,
    timestamp: new Date().toISOString()
  };
  
  // In a real application, this would send to your backend logging service
  console.log(`[ICD AUDIT LOG]`, JSON.stringify(auditEntry, null, 2));
  
  // Optionally, we could save to local storage for demo purposes
  try {
    const existingLogs = JSON.parse(localStorage.getItem('icd_audit_logs') || '[]');
    existingLogs.push(auditEntry);
    localStorage.setItem('icd_audit_logs', JSON.stringify(existingLogs));
  } catch(e) {
      console.warn('Failed to save audit log to local storage');
  }
}
