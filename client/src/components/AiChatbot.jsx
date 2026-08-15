import React, { useState, useRef, useEffect } from 'react';
import API from '../api';
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';

export default function AiChatbot({ studentId, placeholderText = "Ask me anything about the student..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I am EduVision AI, your personal academic success counselor. Ask me questions about CGPA, weak subjects, attendance forecast, or risk status!" }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestionChips = [
    "How is the overall attendance?",
    "Identify weak subjects and marks",
    "What is the current academic risk tier?",
    "Suggest career pathways based on skills"
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
      // Gather last 4 messages for conversational context
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
        content: "Sorry, I am facing trouble connecting to my knowledge base right now. Please try again.",
        isAiPowered: false
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-[380px] h-[520px] bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom duration-300">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">EduVision AI Assistant</h3>
                <span className="text-[10px] text-cyan-100 font-semibold tracking-wider uppercase block">Context-Aware Counselor</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
                
                <div className={`p-3 rounded-2xl max-w-[78%] text-xs shadow-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-200/60 rounded-tl-none'
                }`}>
                  {m.content}
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/60 rounded-tl-none flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt suggestions when chat is empty or just started */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Suggested Prompts:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="text-[10px] px-2 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 transition font-medium"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Input */}
          <div className="p-3 border-t border-slate-100 bg-white flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={placeholderText}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none placeholder-slate-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !message.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-md shadow-indigo-100 disabled:opacity-50 disabled:shadow-none"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition duration-300 hover:scale-105"
        title="Chat with EduVision AI"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

    </div>
  );
}
