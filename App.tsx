
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Role, Message, ChatSession } from './types';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import { generateAgroAnalysis } from './services/geminiService';
import { Send, Loader2, Leaf, Tractor, ThermometerSun, Sprout, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSession?.messages, isLoading]);

  const handleNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Nova Análise',
      messages: [],
      createdAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  }, []);

  useEffect(() => {
    if (sessions.length === 0) {
      handleNewChat();
    }
  }, [sessions.length, handleNewChat]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !currentSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: input,
      timestamp: new Date(),
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          title: s.messages.length === 0 ? input.slice(0, 30) + (input.length > 30 ? '...' : '') : s.title,
          messages: [...s.messages, userMessage]
        };
      }
      return s;
    }));

    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const history = currentSession?.messages || [];
      const response = await generateAgroAnalysis(history, currentInput);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.ASSISTANT,
        content: response,
        timestamp: new Date(),
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [...s.messages, assistantMessage] };
        }
        return s;
      }));
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.ASSISTANT,
        content: "Ocorreu um erro técnico ao processar sua solicitação. Verifique sua conexão.",
        timestamp: new Date(),
      };
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [...s.messages, errorMessage] };
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden relative">
      <Sidebar 
        sessions={sessions} 
        currentSessionId={currentSessionId} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={handleNewChat} 
        onSelectSession={setCurrentSessionId} 
      />

      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-30 shadow-sm sticky top-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <Tractor className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-800 text-sm md:text-base leading-tight truncate">Painel Consultivo</h1>
              <p className="text-[9px] md:text-[10px] text-emerald-600 font-bold uppercase tracking-widest truncate">Acesso Eng. Agrônomo</p>
            </div>
          </div>

          <div className="flex gap-3 md:gap-6 text-slate-400">
            <div className="hidden lg:flex items-center gap-2">
              <Sprout className="w-4 h-4" />
              <span className="text-xs">Soja/Milho</span>
            </div>
            <div className="flex items-center gap-2">
              <ThermometerSun className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] md:text-xs font-medium">Clima Local</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-stone-50 to-white scroll-smooth"
        >
          {currentSession?.messages.length === 0 && !isLoading && (
            <div className="min-h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 md:space-y-8 py-10">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mb-2 animate-pulse shadow-inner">
                <Leaf className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Análise de Safra</h2>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed px-4">
                  Forneça dados sobre estádio fenológico, condições de solo e monitoramento para diagnóstico técnico.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full px-4">
                {[
                  "Plantio de milho safrinha",
                  "Manejo de percevejo na soja",
                  "Redução de perdas na colheita",
                  "Densidade de brachiaria"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="p-4 bg-white border border-emerald-100 rounded-2xl text-xs md:text-sm text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left font-semibold shadow-sm flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentSession?.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-8">
              <div className="flex gap-3 md:gap-4 items-start">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/10">
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm italic text-slate-400 text-xs md:text-sm">
                  Processando parâmetros técnicos...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-200 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] z-20">
          <form 
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto relative group"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Descreva o cenário técnico..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 md:py-4 pl-5 md:pl-6 pr-14 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm md:text-base text-slate-700 placeholder:text-slate-400 shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 md:p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <p className="text-[9px] md:text-[10px] text-center text-slate-400 mt-4 uppercase tracking-tighter font-medium">
            Ferramenta Consultiva • Validação Local Necessária
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
