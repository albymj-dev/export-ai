import React from 'react';
import { ChecklistItem } from '@/types';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

export function ChecklistPanel({
  items,
  readinessScore = 78,
  readinessStatus = 'NEEDS_REVIEW',
}: {
  items: ChecklistItem[];
  readinessScore?: number;
  readinessStatus?: 'EXPORT_READY' | 'NEEDS_REVIEW' | 'BLOCKED';
}) {
  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  const getStatusBadge = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'PASSED':
        return <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded">PASSED</span>;
      case 'WARNING':
        return <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-950/40 border border-amber-500/30 text-amber-400 rounded">WARNING</span>;
      case 'FAILED':
        return <span className="text-[10px] font-mono px-2 py-0.5 bg-red-950/40 border border-red-500/30 text-red-400 rounded">ACTION REQUIRED</span>;
      default:
        return <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-400 rounded">PENDING</span>;
    }
  };

  // Safe fallback list if items are temporarily empty
  const effectiveItems = items && items.length > 0 ? items : [
    {
      id: 'default-inv',
      shipmentId: '',
      category: 'DOCUMENTS' as const,
      title: 'Commercial Invoice Complete',
      description: 'Document attached and validated with financial values and consignee block.',
      status: 'PASSED' as const,
      assignedDoc: 'INV-2026-9042',
    },
    {
      id: 'default-pl',
      shipmentId: '',
      category: 'DOCUMENTS' as const,
      title: 'Packing List Itemized',
      description: 'Breakdown of package counts, tare weights, and individual marks.',
      status: 'PASSED' as const,
      assignedDoc: 'PL-2026-9042',
    },
    {
      id: 'default-sb',
      shipmentId: '',
      category: 'DOCUMENTS' as const,
      title: 'Customs Shipping Bill Entry',
      description: 'Electronic export declaration lodged at ICEGATE customs port.',
      status: 'PASSED' as const,
      assignedDoc: 'SB-COCHIN-49204',
    },
    {
      id: 'default-qc',
      shipmentId: '',
      category: 'DOCUMENTS' as const,
      title: 'Quality & Phytosanitary Certificate',
      description: 'Spices Board India laboratory test report and fumigation certification.',
      status: 'PASSED' as const,
      assignedDoc: 'QC-SPICE-7731',
    },
    {
      id: 'default-qty',
      shipmentId: '',
      category: 'DATA_CONSISTENCY' as const,
      title: 'Quantity & Package Match',
      description: 'Commercial Invoice (1,200 ctns) vs Packing List (1,180 ctns) variance.',
      status: 'FAILED' as const,
    },
    {
      id: 'default-wt',
      shipmentId: '',
      category: 'DATA_CONSISTENCY' as const,
      title: 'Gross & Net Weight Alignment',
      description: 'Variance of 400 kg detected between Invoice and Packing List.',
      status: 'WARNING' as const,
    },
    {
      id: 'default-hs',
      shipmentId: '',
      category: 'DATA_CONSISTENCY' as const,
      title: 'HS Code Uniformity (0904.11.10)',
      description: 'Harmonized System code matches across invoice, shipping bill, and QC.',
      status: 'PASSED' as const,
    },
    {
      id: 'default-kyc',
      shipmentId: '',
      category: 'COMPLIANCE' as const,
      title: 'Buyer & Consignee Identity KYC',
      description: 'EuroSpice Imports B.V. verified against European VAT register.',
      status: 'PASSED' as const,
    },
    {
      id: 'default-signoff',
      shipmentId: '',
      category: 'VERIFICATION' as const,
      title: 'Officer Human Resolution Sign-off',
      description: 'Critical carton count and net weight discrepancies require sign-off.',
      status: 'PENDING' as const,
    },
  ];

  const categories: Array<{ id: ChecklistItem['category']; label: string }> = [
    { id: 'DOCUMENTS', label: 'Mandatory Manifest Documents' },
    { id: 'DATA_CONSISTENCY', label: 'Cross-Document Data Consistency' },
    { id: 'COMPLIANCE', label: 'Statutory Export Compliance' },
    { id: 'VERIFICATION', label: 'Human Officer Sign-Off' },
  ];

  const passedCount = effectiveItems.filter((i) => i.status === 'PASSED').length;
  const warningCount = effectiveItems.filter((i) => i.status === 'WARNING').length;
  const failedCount = effectiveItems.filter((i) => i.status === 'FAILED').length;
  const pendingCount = effectiveItems.filter((i) => i.status === 'PENDING').length;

  const isExportReady = readinessStatus === 'EXPORT_READY' || (failedCount === 0 && readinessScore >= 90);

  return (
    <div className="bg-[#0B0F14] border border-slate-800/80 rounded-xl p-6 space-y-6">
      {/* Top Banner / Verdict */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-wide">
              EXPORT READINESS VERIFICATION CHECKLIST
            </h3>
            <span className="font-mono text-xs font-bold text-cyan-400">
              ({passedCount}/{effectiveItems.length} Checks Cleared)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pre-clearance compliance gate checks required prior to container gate-in at port terminal
          </p>
        </div>

        {/* Final Status Banner */}
        <div className="flex items-center gap-2.5">
          {isExportReady ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>EXPORT READY</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-950/40 border border-amber-500/40 text-amber-400 rounded-lg text-xs font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>NOT READY FOR EXPORT · REVIEW REQUIRED</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Score Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#070A0F] border border-slate-800/80 rounded-xl text-xs">
        <div className="flex items-center justify-between pr-3 border-r border-slate-800">
          <span className="text-slate-400">Passed</span>
          <span className="font-mono font-bold text-emerald-400 tabular-nums">{passedCount}</span>
        </div>
        <div className="flex items-center justify-between pr-3 border-r border-slate-800">
          <span className="text-slate-400">Warnings</span>
          <span className="font-mono font-bold text-amber-400 tabular-nums">{warningCount}</span>
        </div>
        <div className="flex items-center justify-between pr-3 border-r border-slate-800">
          <span className="text-slate-400">Action Required</span>
          <span className="font-mono font-bold text-red-400 tabular-nums">{failedCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Pending Review</span>
          <span className="font-mono font-bold text-slate-300 tabular-nums">{pendingCount}</span>
        </div>
      </div>

      {/* Categories & Checklist Items */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const catItems = effectiveItems.filter((item) => item.category === cat.id);
          if (catItems.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {cat.label}
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  {catItems.filter((i) => i.status === 'PASSED').length}/{catItems.length} Passed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 bg-[#070A0F] border rounded-xl flex items-start gap-3 text-xs transition-colors ${
                      item.status === 'FAILED'
                        ? 'border-red-500/30 bg-red-950/10'
                        : item.status === 'WARNING'
                        ? 'border-amber-500/30 bg-amber-950/10'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-200 truncate">
                          {item.title}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                      {item.assignedDoc && (
                        <div className="mt-2 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                          <span>Ref:</span>
                          <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {item.assignedDoc}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
