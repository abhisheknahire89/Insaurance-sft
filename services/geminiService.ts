import { DdxItem, ExtractedTestResult, NexusInsuranceInput } from '../types';

const ai = {
  models: {
    generateContent: async (args: any) => {
      return { text: "[]" };
    }
  }
};

const Type = {
  ARRAY: 'array',
  OBJECT: 'object',
  STRING: 'string'
};

export const extractTestResultsFromTranscript = async (
  transcript: string,
  language: string
): Promise<ExtractedTestResult[]> => {
  const systemInstruction = `You are a medical data extraction AI. Analyze the transcript and extract any laboratory or diagnostic test results mentioned.

For each test result found, extract:
1. testName: Standard name of the test (e.g., "Hemoglobin", "Chest X-Ray", "Blood Sugar")
2. value: The numerical or descriptive value mentioned
3. unit: The unit of measurement if mentioned
4. interpretation: Classify as 'normal', 'abnormal_high', 'abnormal_low', or 'critical' based on clinical context
5. spokenText: The exact phrase the doctor used

Return a JSON array. If no test results are mentioned, return an empty array.

Example output:
[
  {
    "testName": "Hemoglobin",
    "value": "8.5",
    "unit": "g/dL",
    "interpretation": "abnormal_low",
    "spokenText": "Hemoglobin is 8.5, which is quite low"
  },
  {
    "testName": "Chest X-Ray",
    "value": "Right lower lobe consolidation",
    "unit": "",
    "interpretation": "abnormal_high",
    "spokenText": "X-ray shows consolidation in the right lower lobe"
  }
]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Transcript:\n${transcript}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              testName: { type: Type.STRING },
              value: { type: Type.STRING },
              unit: { type: Type.STRING },
              interpretation: {
                type: Type.STRING,
                enum: ['normal', 'abnormal_high', 'abnormal_low', 'critical']
              },
              spokenText: { type: Type.STRING }
            },
            required: ['testName', 'value', 'interpretation', 'spokenText']
          }
        }
      }
    });

    const results = JSON.parse(response.text);
    return results.map((r: any) => ({
      ...r,
      documentAttached: false,
      documentId: undefined
    }));
  } catch (error) {
    console.error('Error extracting test results:', error);
    return [];
  }
};

export const generateMedicalNecessityStatement = async (
  diagnosis: DdxItem,
  severity: NexusInsuranceInput['severity'],
  keyFindings: string[],
  testResults: ExtractedTestResult[],
  vitals: NexusInsuranceInput['vitals']
): Promise<string> => {

  const systemInstruction = `You are a medical documentation specialist. Generate a concise medical necessity statement for insurance pre-authorization.

The statement must:
1. State the primary diagnosis with ICD-10 code
2. List key clinical findings that support hospitalization
3. Explain why outpatient (OPD) management is NOT appropriate
4. Quantify the risk if hospitalization is denied
5. Be 150-200 words maximum
6. Use professional medical language suitable for TPA review

Do NOT:
- Make up findings not provided in the input
- Use emotional language
- Guarantee outcomes`;

  const prompt = `
Generate a medical necessity statement for:

DIAGNOSIS: ${diagnosis.diagnosis} (Confidence: ${(diagnosis.probability * 100).toFixed(0)}%)
ICD-10: Will be determined

SEVERITY SCORES:
- Symptom Severity (PhenoIntensity): ${severity.phenoIntensity.toFixed(2)}
- Clinical Urgency: ${severity.urgencyQuotient.toFixed(2)}
- Deterioration Risk: ${severity.deteriorationVelocity.toFixed(2)}
- Red Flag: ${severity.redFlagSeverity}

VITALS:
- BP: ${vitals.bp} mmHg
- Pulse: ${vitals.pulse}/min
- Temperature: ${vitals.temp}°F
- SpO2: ${vitals.spo2}%
- Respiratory Rate: ${vitals.rr}/min

KEY CLINICAL FINDINGS:
${keyFindings.map(f => `- ${f}`).join('\n')}

ABNORMAL TEST RESULTS:
${testResults.filter(t => t.interpretation !== 'normal').map(t => `- ${t.testName}: ${t.value} ${t.unit} (${t.interpretation})`).join('\n')}

Generate the medical necessity statement now.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction }
    });
    return response.text;
  } catch (error) {
    console.error('Error generating medical necessity:', error);
    return 'Error generating statement. Please write manually.';
  }
};
