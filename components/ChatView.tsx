import React, { useState, useEffect } from 'react';
import { Message, NexusInsuranceInput, CoPilotSuggestion } from '../types';
import { extractTestResultsFromTranscript } from '../services/aiService';
import { InsurancePreAuthModal } from './InsurancePreAuthModal';

interface ChatViewProps {
    chat: { messages: Message[] };
    language: string;
}

const detectAdmissionIntent = (messages: Message[]): boolean => {
    const recentMessages = messages.slice(-5);
    const admissionKeywords = [
        'admit', 'admission', 'hospitalization', 'inpatient',
        'IPD', 'ward', 'admit karo', 'bharthi', 'भर्ती'
    ];

    return recentMessages.some(msg =>
        admissionKeywords.some(kw =>
            msg.text.toLowerCase().includes(kw.toLowerCase())
        )
    );
};

export const ChatView: React.FC<ChatViewProps> = ({ chat, language }) => {
    const [showPreAuthModal, setShowPreAuthModal] = useState(false);
    const [preAuthNexusData, setPreAuthNexusData] = useState<NexusInsuranceInput | null>(null);

    // Mock extract vitals helper
    const extractVitalsFromTranscript = (transcript: string) => ({
        bp: '120/80',
        pulse: '80',
        temp: '98.6',
        spo2: '98',
        rr: '16'
    });

    useEffect(() => {
        if (detectAdmissionIntent(chat.messages) && !showPreAuthModal) {
            const lastCopilotMsg = [...chat.messages]
                .reverse()
                .find(m => m.structuredData?.type === 'copilot');

            if (lastCopilotMsg?.structuredData?.data) {
                const copilotData = lastCopilotMsg.structuredData.data as CoPilotSuggestion;
                const transcript = chat.messages.map(m => m.text).join('\n');

                extractTestResultsFromTranscript(transcript, language)
                    .then(testResults => {
                        setPreAuthNexusData({
                            ddx: copilotData.differentials,
                            severity: {
                                phenoIntensity: 0.75,
                                urgencyQuotient: 0.80,
                                deteriorationVelocity: 0.70,
                                mustNotMiss: true,
                                redFlagSeverity: 'moderate'
                            },
                            keyFindings: copilotData.managementNextSteps,
                            vitals: extractVitalsFromTranscript(transcript),
                            extractedTestResults: testResults
                        });
                        setShowPreAuthModal(true);
                    });
            }
        }
    }, [chat.messages, showPreAuthModal, language]);

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white p-4">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {chat.messages.map(msg => (
                    <div key={msg.id} className={`p-3 rounded-lg max-w-[80%] ${msg.sender.role === 'AI' ? 'bg-gray-800 self-start' : 'bg-blue-600 self-end ml-auto'}`}>
                        {msg.text}
                    </div>
                ))}
            </div>

            <button
                onClick={() => setShowPreAuthModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-sm font-semibold transition w-fit ml-auto"
            >
                🩺 Force Trigger Pre-Auth
            </button>

            {showPreAuthModal && preAuthNexusData && (
                <InsurancePreAuthModal
                    isOpen={showPreAuthModal}
                    onClose={() => setShowPreAuthModal(false)}
                    nexusOutput={preAuthNexusData}
                    patientInfo={{
                        name: 'John Doe',
                        age: 45,
                        gender: 'Male',
                        uhid: 'AIV-2023-001',
                        tpaName: 'Star Health'
                    }}
                    consultationInfo={{
                        date: new Date().toISOString(),
                        doctorName: 'Dr. Jane Smith',
                        doctorLicense: 'MCI-123456',
                        department: 'Internal Medicine'
                    }}
                    onSubmit={(preAuthData, tpaDocument) => {
                        console.log('Submitted Data:', preAuthData);
                        console.log('TPA Document:', tpaDocument);
                        alert('Pre-Auth Generated! Check console for TPA output.');
                    }}
                />
            )}
        </div>
    );
};
