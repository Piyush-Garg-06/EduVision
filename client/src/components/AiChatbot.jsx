import React, { useState, useRef, useEffect } from 'react';
import API from '../api';
import MarkdownRenderer from './MarkdownRenderer';
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2, Minus, Maximize2 } from 'lucide-react';

export default function AiChatbot({ studentId, placeholderText = "Ask EduVision AI Academic Counselor..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I am EduVision AI, your 24/7 academic counselor and mentor. How can I assist you with your academic planning, course performance, attendance recovery, or career roadmap today?" 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestionChips = [
    "How can I improve my performance in Compiler Design?",
    "What is the recommended attendance recovery plan?",
    "Suggest a study roadmap to achieve 7.5 CGPA",
    "Recommended portfolio projects for Software Engineer roles"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || message;
    if (!queryText.trim() || loading) return;

    const userMessage = { role: 'user', content: queryText };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const chatHistory = messages.slice(-4).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await API.post('/ai/chat', {
        studentId,
        message: queryText,
        chatHistory
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.data.response,
        isAiPowered: res.data.isAiPowered
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I am experiencing a momentary connection issue. Please try again in a few moments.",
        isAiPowered: false
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-[420px] h-[550px] bg-slate-900 border border-slate-700 shadow-2xl rounded-3xl flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom duration-300">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">EduVision AI Counselor</h3>
                <span className="text-[10px] text-cyan-100 font-semibold tracking-wider uppercase block">
                  Autonomous 24/7 Academic Mentor
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-xl transition"
              aria-label="Close Counselor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role !== 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}>
                  {m.role === 'user' ? (
                    <p className="whitespace-pre-line text-white">{m.content}</p>
                  ) : (
                    <MarkdownRenderer content={m.content} />
                  )}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-[11px]">EduVision AI is analyzing student telemetry...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-3 py-2 bg-slate-900/95 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-750 text-[10px] text-slate-300 hover:text-white shrink-0 border border-slate-700 transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={placeholderText}
              className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none transition"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !message.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white transition disabled:opacity-50 shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 hover:scale-105 transition-all group"
      >
        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        <span>{isOpen ? 'Close AI Counselor' : '24/7 AI Counselor'}</span>
      </button>

    </div>
  );
}
