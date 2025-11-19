import React, { useState, useRef, useEffect } from 'react';
import { MessageCircleIcon, XIcon, SendIcon } from './Icons';
import { chatWithArchiveBot } from '../services/geminiService';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "안녕! 궁금한 게 있으면 뭐든 물어봐구리!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => `${m.sender}: ${m.text}`);
    const response = await chatWithArchiveBot(userMsg.text, history);

    const botMsg: Message = { id: Date.now() + 1, text: response || "응답을 불러올 수 없구리...", sender: 'bot' };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="glass-panel mb-4 w-80 md:w-96 h-96 rounded-xl flex flex-col overflow-hidden shadow-2xl animate-fade-in-up">
          <div className="bg-game-primary bg-opacity-80 p-3 flex justify-between items-center backdrop-blur-sm">
            <span className="font-display text-lg font-bold">구리구리</span>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded p-1">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-game-primary text-white' 
                    : 'bg-slate-700 text-gray-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                 <div className="bg-slate-700 text-gray-100 px-3 py-2 rounded-lg text-sm animate-pulse">
                   생각 중이구리...
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-slate-800 border-t border-slate-600 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="구리구리에게 질문해봐!"
              className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-game-primary text-white"
            />
            <button 
              onClick={handleSend} 
              disabled={isLoading}
              className="bg-game-primary hover:bg-blue-600 disabled:bg-gray-600 text-white p-2 rounded transition-colors"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group ${
          isOpen ? 'bg-slate-700 rotate-90' : 'bg-gradient-to-r from-game-primary to-game-accent hover:scale-110 neon-border'
        }`}
      >
        {isOpen ? <XIcon className="w-6 h-6 text-white" /> : <MessageCircleIcon className="w-7 h-7 text-white" />}
      </button>
    </div>
  );
};

export default ChatWidget;