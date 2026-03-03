export const PREAUTH_DISCLAIMER = `
DISCLAIMER: This pre-authorization request was generated using Aivana Clinical 
Documentation System based on clinical findings reported by the treating physician. 

Aivana Technologies Pvt. Ltd. does not independently verify test results, clinical 
observations, or diagnostic interpretations. The treating physician identified below 
has reviewed and confirmed the accuracy of all clinical information contained herein.

Supporting documents status: {{DOCUMENT_STATUS}}
{{PENDING_DOCUMENTS_LIST}}

This document is intended for insurance pre-authorization purposes only and does not 
constitute a final diagnosis or treatment plan.
`;

export const generateDisclaimer = (status: string, pendingList: string[]): string => {
    let disclaimer = PREAUTH_DISCLAIMER
        .replace('{{DOCUMENT_STATUS}}', status === 'complete' ? 'All documents attached' : 'PENDING - Some documents not attached')
        .replace('{{PENDING_DOCUMENTS_LIST}}',
            pendingList.length > 0
                ? `\nPending documents: ${pendingList.join(', ')}`
                : ''
        );
    return disclaimer.trim();
};
