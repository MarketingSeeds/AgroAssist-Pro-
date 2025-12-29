
import React from 'react';
import { Message, Role } from '../types';
import { User, ClipboardCheck, Info } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAssistant = message.role === Role.ASSISTANT;

  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold section headers
      if (/^\d\)/.test(line) || (line.includes(':') && line.length < 50 && !line.startsWith('-'))) {
        return <h3 key={i}>{line}</h3>;
      }
      // Bullet points
      if (line.trim().startsWith('-')) {
        return <li key={i} className="ml-2 mb-1 text-slate-700">{line.replace(/^-/, '').trim()}</li>;
      }
      // Aviso Fixo styling
      if (line.includes("Aviso: este conteúdo é de apoio técnico")) {
        return (
          <div key={i} className="mt-6 p-3 md:p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-[10px] md:text-xs italic flex gap-3 items-start">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>{line}</span>
          </div>
        );
      }
      return line.trim() ? <p key={i} className="text-slate-700 mb-2 leading-relaxed">{line}</p> : <div key={i} className="h-2" />;
    });
  };

  return (
    <div className={`flex w-full mb-6 md:mb-8 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex gap-3 md:gap-4 max-w-[95%] md:max-w-[85%] ${!isAssistant ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isAssistant ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          {isAssistant ? <ClipboardCheck className="w-4 h-4 md:w-5 md:h-5" /> : <User className="w-4 h-4 md:w-5 md:h-5" />}
        </div>
        
        <div className={`flex flex-col ${!isAssistant ? 'items-end' : 'items-start'} min-w-0`}>
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {isAssistant ? 'Assistente Técnico' : 'Eng. Agrônomo'}
            </span>
            <span className="text-[9px] text-slate-300">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className={`p-4 md:p-5 rounded-2xl shadow-sm overflow-hidden ${
            isAssistant 
              ? 'bg-white border border-slate-100 text-slate-800' 
              : 'bg-emerald-600 text-white shadow-emerald-900/10'
          }`}>
            <div className={`${isAssistant ? 'markdown-content' : 'break-words'}`}>
              {isAssistant ? renderContent(message.content) : message.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
