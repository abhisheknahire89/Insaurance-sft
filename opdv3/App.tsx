import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { PreAuthDashboard } from './components/PreAuthDashboard/index';
import { PreAuthWizard } from './components/PreAuthWizard/index';
import { StatusTracker } from './components/PostSubmission/StatusTracker';
import { PreAuthRecord } from './components/PreAuthWizard/types';

import { Sidebar } from './components/Sidebar';
import { ScribeSessionView } from './components/VedaSessionView';
import { InsuranceModule } from './components/InsuranceModule';
import { ChatView } from './components/ChatView';
import { PRE_CODED_GPTS } from './constants';
import { Chat, PreCodedGpt, UserRole } from './types';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<'chat' | 'scribe' | 'insurance'>('scribe');
  const [language, setLanguage] = useState('English');
  const [doctorProfile, setDoctorProfile] = useState({ qualification: 'MBBS', canPrescribeAllopathic: 'yes' as const });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isInsightsPanelOpen, setIsInsightsPanelOpen] = useState(false);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const handleNewChat = (gpt?: PreCodedGpt) => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: gpt ? gpt.title : 'New Chat',
      messages: [],
      gptId: gpt?.id,
      userRole: UserRole.DOCTOR
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setActiveView('chat');
  };

  return (
    <div className="flex h-screen bg-black">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        gpts={PRE_CODED_GPTS}
        chats={chats}
        onNewChat={handleNewChat}
        onSelectChat={setActiveChatId}
        activeChat={activeChat}
        activeChatId={activeChatId}
        language={language}
        setLanguage={setLanguage}
        doctorProfile={doctorProfile}
        setDoctorProfile={setDoctorProfile}
        onStartScribeSession={() => setActiveView('scribe')}
        onStartInsuranceModule={() => setActiveView('insurance')}
        activeView={activeView}
        onShowPrintModal={() => { }}
        onShowAboutModal={() => { }}
        onGenerateCaseSummary={() => { }}
      />

      <main className="flex-1 relative overflow-hidden">
        {activeView === 'scribe' && (
          <ScribeSessionView
            onEndSession={() => setActiveView('chat')}
            doctorProfile={doctorProfile}
            language={language}
          />
        )}
        {activeView === 'chat' && (
          <ChatView
            chat={activeChat}
            onNewChat={handleNewChat}
            updateChat={(id, msgs) => setChats(prev => prev.map(c => c.id === id ? { ...c, messages: msgs } : c))}
            userRole="Clinician"
            language={language}
            isDoctorVerified={true}
            setShowVerificationModal={() => { }}
            setPendingVerificationMessage={() => { }}
            pendingVerificationMessage={null}
            doctorProfile={doctorProfile}
            pendingFirstMessage={null}
            setPendingFirstMessage={() => { }}
            isInsightsPanelOpen={isInsightsPanelOpen}
            setIsInsightsPanelOpen={setIsInsightsPanelOpen}
            knowledgeBaseProtocols={[]}
          />
        )}
        {activeView === 'insurance' && (
          <InsuranceModule />
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;

