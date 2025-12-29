
import React from 'react';
import { ChatSession } from '../types';
import { PlusCircle, MessageSquare, History, Leaf, X } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  isOpen, 
  onClose, 
  onNewChat, 
  onSelectSession 
}) => {
  return (
    <>
      {/* Overlay for mobile - ensures interaction is blocked behind drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[85vw] max-w-72 bg-emerald-950 h-full flex flex-col text-emerald-50 border-r border-emerald-900/50
        sidebar-transition transform ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-5 border-b border-emerald-900 flex items-center justify-between safe-area-top">
          <div className="flex items-center gap-2 text-emerald-400">
            <Leaf className="w-6 h-6" />
            <span className="font-bold text-lg tracking-tight">AgroAssist Pro</span>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-2 hover:bg-emerald-900 rounded-xl text-emerald-400 active:scale-90 transition-transform"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 transition-all text-white rounded-2xl p-4 text-sm font-bold shadow-lg shadow-emerald-950/40 active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5" />
            Nova Análise
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 no-scrollbar">
          <div className="px-3 py-4 text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <History className="w-3 h-3" />
            Histórico Técnico
          </div>
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => {
                onSelectSession(session.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl text-sm transition-all text-left group ${
                currentSessionId === session.id
                  ? 'bg-emerald-800/80 text-white shadow-inner font-semibold ring-1 ring-emerald-700/50'
                  : 'hover:bg-emerald-900/40 text-emerald-200/60 hover:text-emerald-100'
              }`}
            >
              <MessageSquare className={`w-4 h-4 shrink-0 ${currentSessionId === session.id ? 'text-emerald-400' : 'text-emerald-700 group-hover:text-emerald-500'}`} />
              <span className="truncate">{session.title}</span>
            </button>
          ))}
          {sessions.length === 0 && (
            <div className="px-3 py-10 text-center text-emerald-600/50 text-xs italic">
              Nenhuma análise salva
            </div>
          )}
        </div>

        <div className="p-5 bg-emerald-950 text-[10px] text-emerald-700 border-t border-emerald-900 safe-area-bottom">
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-widest">Apoio Técnico</span>
            <span className="opacity-50">v1.2</span>
          </div>
          <p className="mt-2 leading-relaxed opacity-40 italic">Ferramenta exclusiva para uso profissional de engenheiros agrônomos.</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
