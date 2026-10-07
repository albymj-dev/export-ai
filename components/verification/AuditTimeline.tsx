import React from 'react';
import { AuditLogRecord } from '@/types';
import { History, CheckCircle, Upload, AlertCircle, FileText } from 'lucide-react';

export function AuditTimeline({ logs }: { logs: AuditLogRecord[] }) {
  const getActionIcon = (action: string) => {
    if (action.includes('RESOLVED') || action.includes('VERIFIED')) {
      return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (action.includes('UPLOAD')) {
      return <Upload className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (action.includes('DISCREPANCY')) {
      return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
    }
    return <FileText className="w-3.5 h-3.5 text-cyan-400" />;
  };

  return (
    <div className="bg-[#0B0F14] border border-slate-800/80 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800/70">
        <History className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-white tracking-wide">
          IMMUTABLE COMPLIANCE AUDIT TRAIL
        </h3>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
        {logs.slice(0, 15).map((log) => (
          <div key={log.id} className="relative group text-xs">
            {/* Timeline node */}
            <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#05070A] border border-slate-700 flex items-center justify-center">
              {getActionIcon(log.action)}
            </div>

            <div className="bg-[#070A0F] border border-slate-800/60 p-3 rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] mb-1">
                <span className="font-semibold text-slate-200">
                  {log.action.replace(/_/g, ' ')}
                </span>
                <span className="text-slate-500 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                <span>By: </span>
                <span className="text-slate-300 font-medium">{log.userName}</span>
                <span className="mx-1.5">·</span>
                <span className="font-mono text-slate-500">Resource: {log.resourceId}</span>
              </div>

              {log.newValue && (
                <div className="mt-1.5 p-2 bg-[#05070A] rounded text-[10px] font-mono text-slate-400 overflow-x-auto">
                  {JSON.stringify(log.newValue)}
                </div>
              )}
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <p className="text-xs text-slate-500 italic">No audit records logged yet.</p>
        )}
      </div>
    </div>
  );
}
