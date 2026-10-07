'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ship,
  FileText,
  ShieldCheck,
  FileCheck2,
  Settings,
  Sparkles,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

export function AppSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Shipments', href: '/shipments', icon: Ship },
    { label: 'Documents', href: '/documents', icon: FileText },
    { label: 'Verification Queue', href: '/verification', icon: ShieldCheck },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#070A0F] border-r border-slate-800/80 flex flex-col h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/70">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#070A0F] rounded-[7px] flex items-center justify-center">
              <FileCheck2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-wider text-white">EXPORTAI</span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-tight">Customs Verification</p>
          </div>
        </Link>
      </div>

      {/* Kerala Hackathon Badge info */}
      <div className="mx-4 my-3 px-3 py-2 bg-blue-950/20 border border-blue-900/40 rounded-lg text-xs">
        <div className="flex items-center gap-1.5 text-blue-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>IBM × Kerala Hackathon</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">Challenge 3: Export Verification</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Officer Profile & Council Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#05070A]">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-900/50 transition-colors">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
            AM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">Alby Mathew Joshy</p>
            <p className="text-[10px] text-slate-400 truncate">Kerala Export Inspection</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
