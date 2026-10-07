'use client';

import React, { useState } from 'react';
import { DiscrepancyRecord } from '@/types';
import { SeverityBadge } from '@/components/ui/RiskBadge';
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle,
  XCircle,
  Edit3,
  Mail,
  FileSearch,
  Sparkles,
  Check,
} from 'lucide-react';

export function DiscrepancyCard({
  discrepancy,
  onResolve,
  onDraftEmail,
}: {
  discrepancy: DiscrepancyRecord;
  onResolve: (id: string, action: string, verifiedValue?: any, reason?: string) => Promise<void>;
  onDraftEmail?: (discrepancy: DiscrepancyRecord) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualVal, setManualVal] = useState(String(discrepancy.valueA));
  const [manualReason, setManualReason] = useState('');

  const isResolved = discrepancy.status === 'RESOLVED' || discrepancy.status === 'VERIFIED';
  const isRejected = discrepancy.status === 'REJECTED';

  const handleAction = async (action: string, val?: any, reason?: string) => {
    setIsSubmitting(true);
    try {
      await onResolve(discrepancy.id, action, val, reason);
      setShowManualInput(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBorderColor = () => {
    if (isResolved) return 'border-emerald-500/40 bg-emerald-950/10';
    if (isRejected) return 'border-slate-800 bg-slate-900/30 opacity-75';
    if (discrepancy.severity === 'CRITICAL') return 'border-red-500/40 bg-[#0B0F14] shadow-lg shadow-red-950/20';
    if (discrepancy.severity === 'HIGH') return 'border-amber-500/40 bg-[#0B0F14] shadow-lg shadow-amber-950/10';
    return 'border-slate-800 bg-[#0B0F14]';
  };

  return (
    <div className={`border rounded-xl p-5 transition-all ${getBorderColor()}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800/70">
        <div className="flex items-center gap-2.5">
          <SeverityBadge severity={discrepancy.severity} />
          <h4 className="text-sm font-semibold text-white tracking-tight">
            {discrepancy.field}
          </h4>
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">
            {discrepancy.category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isResolved ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified & Resolved
            </span>
          ) : isRejected ? (
            <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
              <XCircle className="w-3.5 h-3.5" />
              Rejected Variance
            </span>
          ) : (
            <span className="text-xs font-mono text-red-400 flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5" />
              Risk Index: {discrepancy.riskScore}/100
            </span>
          )}
        </div>
      </div>

      {/* Side-by-Side Conflicting Values */}
      <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Document A */}
        <div className="p-3.5 bg-[#05070A] border border-slate-800/80 rounded-lg">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium truncate">
            {discrepancy.docAName}
          </p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono tracking-tight text-white tabular-nums">
              {String(discrepancy.valueA)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Source A</span>
          </div>
        </div>

        {/* Document B */}
        <div className="p-3.5 bg-[#05070A] border border-slate-800/80 rounded-lg">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium truncate">
            {discrepancy.docBName}
          </p>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono tracking-tight text-white tabular-nums">
              {String(discrepancy.valueB)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Source B</span>
          </div>
        </div>
      </div>

      {/* Variance summary */}
      <div className="px-3 py-2 bg-slate-900/60 border border-slate-800/60 rounded-lg flex items-center justify-between text-xs mb-3">
        <span className="text-slate-400">Calculated Discrepancy:</span>
        <span className="font-mono font-semibold text-amber-400">{discrepancy.difference}</span>
      </div>

      {/* Explanation & AI Recommendation */}
      <div className="space-y-2.5 text-xs text-slate-300">
        <div>
          <span className="text-slate-400 font-medium">Customs Impact: </span>
          <span>{discrepancy.explanation}</span>
        </div>

        <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-lg">
          <div className="flex items-center gap-1.5 text-blue-400 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Recommended Action</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{discrepancy.recommendation}</p>
        </div>

        {discrepancy.evidenceSnippet && (
          <div className="flex items-start gap-2 text-[11px] text-slate-400 pt-1">
            <FileSearch className="w-3.5 h-3.5 shrink-0 text-slate-500 mt-0.5" />
            <span className="italic">Evidence: {discrepancy.evidenceSnippet}</span>
          </div>
        )}
      </div>

      {/* Human Resolution Metadata if resolved */}
      {discrepancy.humanResolution && (
        <div className="mt-3.5 p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-xs text-emerald-300">
          <div className="flex items-center justify-between font-medium">
            <span>Verified Value: {String(discrepancy.humanResolution.verifiedValue)}</span>
            <span className="text-[11px] text-emerald-400">
              By {discrepancy.humanResolution.resolvedBy}
            </span>
          </div>
          {discrepancy.humanResolution.reason && (
            <p className="mt-1 text-[11px] text-emerald-400/90 italic">
              Note: {discrepancy.humanResolution.reason}
            </p>
          )}
        </div>
      )}

      {/* Manual correction drawer */}
      {showManualInput && (
        <div className="mt-4 p-3.5 bg-slate-900/90 border border-blue-500/40 rounded-lg space-y-3">
          <div className="text-xs font-semibold text-white">Manual Value Verification</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Corrected Value</label>
              <input
                type="text"
                value={manualVal}
                onChange={(e) => setManualVal(e.target.value)}
                className="w-full bg-[#05070A] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Officer Note / Verification Basis</label>
              <input
                type="text"
                placeholder="e.g. Physical recount tally verified"
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                className="w-full bg-[#05070A] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowManualInput(false)}
              className="px-3 py-1 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              onClick={() => handleAction('MANUAL_CORRECTION', manualVal, manualReason)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
            >
              Confirm Correction
            </button>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {!isResolved && (
            <>
              <button
                disabled={isSubmitting}
                onClick={() => handleAction('ACCEPT_A', discrepancy.valueA, `Verified value aligns with ${discrepancy.docAName}`)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Accept Value A ({String(discrepancy.valueA)})
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => handleAction('ACCEPT_B', discrepancy.valueB, `Verified value aligns with ${discrepancy.docBName}`)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Accept Value B ({String(discrepancy.valueB)})
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => setShowManualInput(!showManualInput)}
                className="px-3 py-1.5 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-800/50 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Manual Correct</span>
              </button>
            </>
          )}

          {isResolved && (
            <button
              disabled={isSubmitting}
              onClick={() => handleAction('OPEN')}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Reopen Discrepancy
            </button>
          )}
        </div>

        {onDraftEmail && (
          <button
            onClick={() => onDraftEmail(discrepancy)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-800/40 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Draft Email</span>
          </button>
        )}
      </div>
    </div>
  );
}
