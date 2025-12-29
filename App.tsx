
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Role, Message, ChatSession } from './types';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import { generateAgroAnalysis } from './services/geminiService';
import { Send, Loader2, Leaf, Tractor, ThermometerSun, Sprout, Menu, ChevronRight } from 'lucide-react';

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
        content: "Erro de conexão. A análise técnica não pôde ser completada.",
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

      <main className="flex-1 flex flex-col relative min-w-0 h-full">
        {/* Header - Mobile First */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-30 sticky top-0 safe-area-top">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-xl text-slate-600 active:bg-slate-200 transition-colors"
              aria-label="Abrir Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex p-2 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
              <Tractor className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-900 text-sm md:text-base leading-tight truncate">Relatório Técnico</h1>
              <div className="flex items-center gap-1.5 overflow-hidden">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                 <p className="text-[9px] md:text-[10px] text-emerald-600 font-bold uppercase tracking-wider truncate">Eng. Agrônomo Online</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6 text-slate-400 shrink-0">
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-slate-600">Culturas Ativas</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 md:bg-transparent px-2.5 py-1.5 md:p-0 rounded-full md:rounded-none border border-amber-100 md:border-none">
              <ThermometerSun className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] md:text-xs font-semibold text-amber-700 md:text-slate-500 uppercase tracking-tighter md:tracking-normal">Clima</span>
            </div>
          </div>
        </header>

        {/* Chat Area - Scrollable */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 bg-gradient-to-b from-stone-50 to-white scroll-smooth no-scrollbar"
        >
          {currentSession?.messages.length === 0 && !isLoading && (
            <div className="min-h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-10 px-4">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white border border-emerald-100 rounded-[2.5rem] flex items-center justify-center text-emerald-600 mb-6 shadow-xl shadow-emerald-900/5 rotate-3 hover:rotate-0 transition-transform duration-500">
                <Leaf className="w-10 h-10 md:w-12 md:h-12" />
              </div>
              <div className="space-y-4 mb-10">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Análise Especializada</h2>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                  Olá, Engenheiro. Descreva as condições da lavoura ou solicite um plano de manejo fundamentado.
                </p>
              </div>
              
              <div className="w-full grid grid-cols-1 gap-3">
                {[
                  "Manejo de percevejo na soja (R5)",
                  "Densidade de milho safrinha",
                  "Planejamento de sorgo forrageiro",
                  "Redução de perdas na colheita"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="group p-5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left font-semibold shadow-sm flex items-center justify-between active:scale-[0.98]"
                  >
                    <span className="group-hover:text-emerald-800 transition-colors">{suggestion}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto w-full">
            {currentSession?.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>

          {isLoading && (
            <div className="max-w-4xl mx-auto w-full flex justify-start mb-8">
              <div className="flex gap-3 md:gap-4 items-start">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/10">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <span className="flex items-center gap-2 text-slate-400 text-xs md:text-sm font-medium animate-pulse">
                    Consultando bases técnicas...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Input Area - Optimized for Touch */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-20 safe-area-bottom">
          <form 
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto relative"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: Manejo de pragas no milho..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 md:py-5 pl-6 pr-16 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm md:text-base text-slate-800 placeholder:text-slate-400 font-medium shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 md:p-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-30 disabled:scale-95 disabled:grayscale transition-all shadow-lg shadow-emerald-900/10 active:scale-90"
              aria-label="Enviar"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
             <div className="h-px w-8 bg-slate-300" />
             <p className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.2em]">
               Uso Técnico Profissional
             </p>
             <div className="h-px w-8 bg-slate-300" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
