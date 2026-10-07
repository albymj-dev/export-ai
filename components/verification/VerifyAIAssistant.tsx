'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VerificationAssistantMessage } from '@/types';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';

export function VerifyAIAssistant({
  shipmentId,
  shipmentRef,
}: {
  shipmentId: string;
  shipmentRef: string;
}) {
  const [messages, setMessages] = useState<VerificationAssistantMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/verify-ai`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error('Failed to load VerifyAI messages:', e);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text || !text.trim() || isLoading) return;

    const userMessage: VerificationAssistantMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/shipments/${shipmentId}/verify-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.assistantMessage]);
      }
    } catch (e) {
      console.error('VerifyAI error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Why is this shipment flagged as high risk?',
    'Which document should I verify first?',
    'Explain the customs consequence of carton mismatch',
  ];

  return (
    <div className="flex flex-col h-[520px] bg-[#0B0F14] border border-slate-800/80 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[#070A0F] border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-wide">VerifyAI Assistant</span>
            <span className="text-[10px] text-slate-400 block">
              Grounded in shipment {shipmentRef} documents
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
          Active Evidence Grounding
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded bg-blue-950 border border-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] text-xs rounded-xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-[#10161E] border border-slate-800 text-slate-200 rounded-bl-sm'
              }`}
            >
              {m.content}
            </div>
            {m.role === 'user' && (
              <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 bg-[#10161E] border border-slate-800 p-2.5 rounded-lg w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>VerifyAI is cross-referencing document evidence...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-[#070A0F] border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="shrink-0 px-2.5 py-1 bg-[#10161E] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-md transition-colors cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-[#070A0F] border-t border-slate-800/80 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask VerifyAI about quantities, weights, HS codes, or customs rules..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-[#0B0F14] border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/50"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputVal.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
