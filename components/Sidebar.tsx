
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
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 bg-emerald-900 h-full flex flex-col text-emerald-50 border-r border-emerald-800
        sidebar-transition transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Leaf className="w-6 h-6" />
            <span className="font-bold text-lg tracking-tight">AgroAssist Pro</span>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-2 hover:bg-emerald-800 rounded-lg text-emerald-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 transition-colors text-white rounded-xl p-3 text-sm font-semibold shadow-lg shadow-emerald-950/20"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Análise
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
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
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all text-left ${
                currentSessionId === session.id
                  ? 'bg-emerald-800 text-white shadow-inner font-medium ring-1 ring-emerald-700'
                  : 'hover:bg-emerald-800/50 text-emerald-200/80'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate">{session.title}</span>
            </button>
          ))}
          {sessions.length === 0 && (
            <div className="px-3 py-8 text-center text-emerald-500/40 text-xs italic">
              Inicie uma nova consulta técnica
            </div>
          )}
        </div>

        <div className="p-4 bg-emerald-950/50 text-[10px] text-emerald-600 border-t border-emerald-800">
          <p className="font-medium">Apoio à Decisão Agronômica</p>
          <p className="mt-1 opacity-60">© 2024 AgroAssist • v1.1</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
