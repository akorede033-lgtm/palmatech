import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Bug,
  Trees,
  Sprout,
  Droplets,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface AIAgronomistModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  'How do I treat a severe Bagworm (Metisa plana) outbreak in Block 05?',
  'What is the recommended fertilizer formulation and timing for 8-year-old palms?',
  'How can we optimize FFB harvest yield and maintain the 1-frond pruning standard?',
  'What are early detection signs for Ganoderma Basal Stem Rot and trench protocols?',
];

export const AIAgronomistModal: React.FC<AIAgronomistModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Greetings! I am PalmBot, your AI Agronomist & Oil Palm Intelligence Assistant. I specialize in commercial oil palm cultivation (Elaeis guineensis), IPM strategies, foliar nutrition, and yield diagnostics for your 500-hectare plantation. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handledPromptRef = useRef<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agronomist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI Agronomist endpoint');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.text || data.reply || 'I have analyzed your query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `⚠️ Communication alert: ${err.message || 'Could not connect to Agronomist server'}. Please check backend connection.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialPrompt && isOpen && handledPromptRef.current !== initialPrompt) {
      handledPromptRef.current = initialPrompt;
      handleSendPrompt(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col h-[85vh] text-white overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl shadow-lg text-slate-950 font-bold">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                <span>PalmBot AI Agronomist</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-700/60">
                  Gemini 3.6 Flash
                </span>
              </h3>
              <p className="text-[11px] text-emerald-300/80">Commercial Oil Palm Cultivation, IPM & Nutrition Advisor</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-600/50 text-emerald-300 flex items-center justify-center flex-shrink-0 text-xs font-bold shadow">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              <div
                className={`max-w-[84%] p-4 rounded-2xl shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-emerald-900/30'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed text-xs">{msg.text}</p>
                <span className="text-[9px] text-slate-400 block mt-1.5 text-right font-mono">{msg.timestamp}</span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2.5 text-emerald-400 text-xs bg-slate-800/80 p-3 rounded-xl border border-slate-700 w-fit">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>PalmBot is analyzing 500-ha estate agronomy records...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Quick Presets Bar */}
        <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-1 flex items-center gap-1.5 font-display">
            <HelpCircle className="w-3 h-3 text-emerald-400" />
            <span>Recommended Agronomic Inquiries</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            {PRESET_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendPrompt(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-300 rounded-xl transition-all cursor-pointer text-left flex-shrink-0 text-[11px]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask PalmBot about fertilizer formulas, bagworm control, frond pruning, soil drainage..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-900 text-xs text-white px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 placeholder-slate-500 transition-colors"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
