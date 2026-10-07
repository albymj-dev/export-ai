'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Sparkles, RefreshCw, ShieldCheck, ChevronRight } from 'lucide-react';

export function AppTopbar({
  breadcrumbs = [],
  onSearch,
}: {
  breadcrumbs?: Array<{ label: string; href?: string }>;
  onSearch?: (query: string) => void;
}) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  // Global keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        const input = document.getElementById('global-search-input');
        input?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResetDemo = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/demo/seed', { method: 'POST' });
      const data = await res.json();
      if (data.shipmentId) {
        router.push(`/shipments/${data.shipmentId}`);
        router.refresh();
      }
    } catch (e) {
      console.error('Failed to seed demo:', e);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#070A0F]/90 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-200 transition-colors">
          EXPORTAI
        </Link>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            {crumb.href ? (
              <Link href={crumb.href} className="text-slate-400 hover:text-slate-200 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-200 font-medium">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Center Search & Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div className="relative w-64 md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search shipments, HS codes, PO... (/)"
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              onSearch?.(e.target.value);
            }}
            className="w-full bg-[#0B0F14] border border-slate-800 text-xs text-slate-200 rounded-lg pl-8 pr-8 py-2 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-600"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
            /
          </kbd>
        </div>

        {/* Hackathon Demo Reset Button */}
        <button
          onClick={handleResetDemo}
          disabled={isSeeding}
          title="Reload Demo EXP-KERALA-2026-001 with 5 realistic documents and cross-check discrepancies"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-800/50 bg-cyan-950/30 text-cyan-400 text-xs font-medium hover:bg-cyan-900/40 hover:border-cyan-600/60 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Load Hackathon Demo</span>
        </button>

        {/* New Shipment CTA */}
        <Link
          href="/shipments/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Shipment</span>
        </Link>
      </div>
    </header>
  );
}
