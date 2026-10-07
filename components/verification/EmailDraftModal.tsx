'use client';

import React, { useState } from 'react';
import { DiscrepancyRecord, EmailDraft } from '@/types';
import { Mail, Sparkles, Copy, Check, X, Loader2 } from 'lucide-react';

export function EmailDraftModal({
  shipmentId,
  discrepancy,
  isOpen,
  onClose,
}: {
  shipmentId: string;
  discrepancy: DiscrepancyRecord | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [recipientRole, setRecipientRole] = useState<'SUPPLIER' | 'BUYER' | 'CUSTOMS_BROKER'>('SUPPLIER');
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editableSubject, setEditableSubject] = useState('');
  const [editableBody, setEditableBody] = useState('');

  if (!isOpen || !discrepancy) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/draft-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discrepancyId: discrepancy.id,
          recipientRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDraft(data.draft);
        setEditableSubject(data.draft.subject);
        setEditableBody(data.draft.body);
      }
    } catch (e) {
      console.error('Failed to draft email:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const fullText = `Subject: ${editableSubject}\n\n${editableBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0B0F14] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <Mail className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Discrepancy Email Drafter</h3>
              <p className="text-xs text-slate-400">
                Regarding {discrepancy.field}: {discrepancy.difference}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Role selector */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Recipient Party:</span>
            <div className="flex gap-2">
              {(['SUPPLIER', 'BUYER', 'CUSTOMS_BROKER'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRecipientRole(r)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    recipientRole === r
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>

            {!draft && (
              <button
                disabled={isLoading}
                onClick={handleGenerate}
                className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Generate Draft</span>
              </button>
            )}
          </div>

          {draft ? (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={editableSubject}
                  onChange={(e) => setEditableSubject(e.target.value)}
                  className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Email Body
                </label>
                <textarea
                  rows={10}
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  className="w-full bg-[#05070A] border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
                />
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 border border-dashed border-slate-800 rounded-xl">
              <Sparkles className="w-8 h-8 text-cyan-400/60 mb-2" />
              <p className="font-medium text-slate-200">Ready to compose customized discrepancy notification</p>
              <p className="text-slate-400 text-[11px] max-w-sm mt-1">
                Gemini will incorporate precise carton numbers, document names, and required rectification timelines.
              </p>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Generate Notification Draft</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {draft && (
          <div className="px-6 py-3.5 border-t border-slate-800 flex items-center justify-between bg-[#070A0F]">
            <span className="text-[11px] text-slate-400">
              Review draft before copying to your corporate email client.
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Email'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
