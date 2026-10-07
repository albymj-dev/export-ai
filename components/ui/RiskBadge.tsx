import React from 'react';
import { RiskTier, DiscrepancySeverity } from '@/types';
import { AlertTriangle, AlertOctagon, CheckCircle2, Info } from 'lucide-react';

export function RiskBadge({ tier, score }: { tier: RiskTier; score?: number }) {
  if (tier === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400">
        <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
        <span>CRITICAL</span>
        {score !== undefined && (
          <span className="text-red-500/80 font-mono tabular-nums">({score}/100)</span>
        )}
      </span>
    );
  }

  if (tier === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
        <span>HIGH RISK</span>
        {score !== undefined && (
          <span className="text-amber-500/80 font-mono tabular-nums">({score}/100)</span>
        )}
      </span>
    );
  }

  if (tier === 'MODERATE') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-400">
        <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
        <span>MODERATE</span>
        {score !== undefined && (
          <span className="text-yellow-500/80 font-mono tabular-nums">({score}/100)</span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      <span>LOW RISK</span>
      {score !== undefined && (
        <span className="text-emerald-500/80 font-mono tabular-nums">({score}/100)</span>
      )}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: DiscrepancySeverity }) {
  const configs: Record<DiscrepancySeverity, { label: string; color: string; icon: any }> = {
    CRITICAL: { label: 'CRITICAL', color: 'text-red-400 border-red-500/30 bg-red-950/30', icon: AlertOctagon },
    HIGH: { label: 'HIGH', color: 'text-amber-400 border-amber-500/30 bg-amber-950/30', icon: AlertTriangle },
    MEDIUM: { label: 'MEDIUM', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20', icon: AlertTriangle },
    LOW: { label: 'LOW', color: 'text-blue-400 border-blue-500/30 bg-blue-950/20', icon: Info },
    INFO: { label: 'INFO', color: 'text-slate-400 border-slate-700 bg-slate-900/40', icon: Info },
  };

  const c = configs[severity] || configs.INFO;
  const Icon = c.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[11px] font-mono tracking-wider font-semibold rounded ${c.color}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; textClass: string }> = {
    EXPORT_READY: { label: 'Export Ready', textClass: 'text-emerald-400' },
    VERIFIED: { label: 'Verified', textClass: 'text-emerald-400' },
    NEEDS_REVIEW: { label: 'Needs Review', textClass: 'text-amber-400' },
    PROCESSING: { label: 'Processing', textClass: 'text-cyan-400' },
    DRAFT: { label: 'Draft', textClass: 'text-slate-400' },
    BLOCKED: { label: 'Blocked', textClass: 'text-red-400' },
    OPEN: { label: 'Open Issue', textClass: 'text-red-400' },
    RESOLVED: { label: 'Resolved', textClass: 'text-emerald-400' },
    REJECTED: { label: 'Rejected', textClass: 'text-slate-400' },
  };

  const item = map[status] || { label: status, textClass: 'text-slate-300' };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${item.textClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {item.label}
    </span>
  );
}
