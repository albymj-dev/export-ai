'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export function ExecutiveSummaryCard({
  shipmentId,
  aiSummary,
  onSummaryUpdated,
}: {
  shipmentId: string;
  aiSummary?: {
    overview: string;
    keyFindings: string[];
    recommendations: string[];
    generatedAt: string;
  } | null;
  onSummaryUpdated?: () => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/summary`, {
        method: 'POST',
      });
      if (res.ok) {
        onSummaryUpdated?.();
      }
    } catch (e) {
      console.error('Summary error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-[#0B0F14] border border-blue-500/20 rounded-xl p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              EXPORT VERIFICATION SUMMARY
            </h3>
            <p className="text-xs text-slate-400">
              Executive AI assessment & customs clearance advisory
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950/40 hover:bg-blue-900/40 border border-blue-800/40 rounded-lg text-xs font-semibold text-blue-400 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{aiSummary ? 'Regenerate Assessment' : 'Generate Summary'}</span>
        </button>
      </div>

      {aiSummary ? (
        <div className="mt-4 space-y-4 text-xs">
          {/* Overview text */}
          <div className="p-3.5 bg-[#070A0F] border border-slate-800/80 rounded-lg text-slate-200 leading-relaxed">
            {aiSummary.overview}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Findings */}
            <div className="p-4 bg-[#070A0F] border border-slate-800/80 rounded-lg space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-wide uppercase">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Key Discrepancy Findings</span>
              </div>
              <ul className="space-y-2">
                {aiSummary.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300 leading-normal">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="p-4 bg-[#070A0F] border border-slate-800/80 rounded-lg space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Officer Action Steps</span>
              </div>
              <ul className="space-y-2">
                {aiSummary.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300 leading-normal">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {aiSummary.generatedAt && (
            <div className="pt-2 text-[10px] text-slate-500 text-right font-mono">
              Generated: {new Date(aiSummary.generatedAt).toLocaleString()}
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <Sparkles className="w-8 h-8 text-cyan-400/50 mb-2" />
          <p className="text-xs text-slate-300 font-medium">
            AI executive summary not yet generated for this shipment.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            {isGenerating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Synthesize Executive Verification Dossier</span>
          </button>
        </div>
      )}
    </div>
  );
}
