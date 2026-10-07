'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, Circle } from 'lucide-react';

export function AIProcessingAnimation({
  onComplete,
  isAnalyzing = true,
}: {
  onComplete?: () => void;
  isAnalyzing?: boolean;
}) {
  const steps = [
    'Document structure and MIME authenticity validated',
    'Commercial Invoice fields & financial totals extracted',
    'Packing List packages & carton identifiers extracted',
    'HS Codes & product specifications normalized',
    'Executing cross-document quantity & weight reconciliation',
    'Transparent customs risk assessment calculation',
    'Updating pre-shipment export readiness index',
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          onComplete?.();
          return prev;
        }
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isAnalyzing, steps.length, onComplete]);

  return (
    <div className="relative overflow-hidden p-8 bg-[#0B0F14] border border-blue-500/30 rounded-2xl shadow-2xl">
      {/* Subtle scanning laser line effect */}
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanline pointer-events-none opacity-75" />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">
            EXPORTAI RECONCILIATION ENGINE
          </h3>
          <p className="text-xs text-slate-400">
            Multimodal document intelligence & cross-check verification in progress
          </p>
        </div>
      </div>

      <div className="space-y-3.5 pl-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs transition-colors duration-300 ${
                isDone
                  ? 'text-emerald-400 font-medium'
                  : isCurrent
                  ? 'text-cyan-300 font-semibold'
                  : 'text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-700 shrink-0" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
