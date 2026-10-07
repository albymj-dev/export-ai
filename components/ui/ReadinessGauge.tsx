import React from 'react';
import { ExportReadiness } from '@/types';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

export function ReadinessGauge({
  score,
  status,
  breakdown,
}: {
  score: number;
  status: 'EXPORT_READY' | 'NEEDS_REVIEW' | 'BLOCKED';
  breakdown?: ExportReadiness['breakdown'];
}) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#10b981'; // emerald
  let statusLabel = 'Export Ready';
  let StatusIcon = ShieldCheck;
  let textColor = 'text-emerald-400';

  if (status === 'BLOCKED' || score < 60) {
    strokeColor = '#ef4444'; // red
    statusLabel = 'Blocked / High Risk';
    StatusIcon = ShieldX;
    textColor = 'text-red-400';
  } else if (status === 'NEEDS_REVIEW' || score < 90) {
    strokeColor = '#f59e0b'; // amber
    statusLabel = 'Needs Officer Review';
    StatusIcon = ShieldAlert;
    textColor = 'text-amber-400';
  }

  return (
    <div className="flex flex-col items-center p-6 bg-[#0B0F14] border border-slate-800/80 rounded-xl">
      <div className="relative flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#1e293b"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
            {score}%
          </span>
          <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium">
            Readiness
          </span>
        </div>
      </div>

      <div className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${textColor}`}>
        <StatusIcon className="w-4 h-4" />
        <span>{statusLabel}</span>
      </div>

      {breakdown && (
        <div className="w-full mt-5 space-y-2.5 pt-4 border-t border-slate-800/60 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Documents Complete</span>
              <span className="font-mono tabular-nums">{breakdown.documentsComplete}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.documentsComplete}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Data Consistency</span>
              <span className="font-mono tabular-nums">{breakdown.dataConsistency}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  breakdown.dataConsistency < 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${breakdown.dataConsistency}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Compliance Fields</span>
              <span className="font-mono tabular-nums">{breakdown.complianceFields}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${breakdown.complianceFields}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Human Verification</span>
              <span className="font-mono tabular-nums">{breakdown.humanVerification}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  breakdown.humanVerification < 100 ? 'bg-yellow-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${breakdown.humanVerification}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
