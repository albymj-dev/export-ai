'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { User, Shield, HardDrive, Cpu, Check, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Alby Mathew Joshy',
    email: 'albymathewjoshy@gmail.com',
    role: 'Senior Export Verification Officer',
    organization: 'Kerala Export Inspection Council',
    portRegistry: 'Cochin Port Customs (INCOK)',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardShell breadcrumbs={[{ label: 'Settings' }]}>
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System & Profile Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage officer identity, compliance verification parameters, and infrastructure
          </p>
        </div>

        {/* Officer Profile Form */}
        <form onSubmit={handleSave} className="p-6 bg-[#0B0F14] border border-slate-800/80 rounded-xl space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <User className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Officer Identity & Credentials</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Official Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Designation / Role</label>
              <input
                type="text"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Organization Bureau</label>
              <input
                type="text"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 mb-1">Port Jurisdiction</label>
              <input
                type="text"
                value={profile.portRegistry}
                onChange={(e) => setProfile({ ...profile, portRegistry: e.target.value })}
                className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors cursor-pointer"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{saved ? 'Changes Saved' : 'Save Profile'}</span>
            </button>
          </div>
        </form>

        {/* Infrastructure & Storage Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 bg-[#0B0F14] border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Storage Abstraction Layer</h3>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Documents are isolated in private storage and strictly protected against path traversal.
            </p>
            <div className="space-y-1.5 font-mono text-[10px] text-slate-300">
              <div className="p-2 bg-[#05070A] rounded border border-slate-800">
                Path: .storage/documents/{'{userId}'}/{'{shipmentId}'}/
              </div>
              <div className="flex items-center justify-between text-emerald-400 pt-1">
                <span>Storage Status</span>
                <span>Active / Isolated</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#0B0F14] border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">AI Engine Status</h3>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Multimodal document intelligence and structured schema extraction.
            </p>
            <div className="space-y-1.5 font-mono text-[10px] text-slate-300">
              <div className="p-2 bg-[#05070A] rounded border border-slate-800">
                Model: gemini-3.8-flash (@google/genai)
              </div>
              <div className="flex items-center justify-between text-emerald-400 pt-1">
                <span>SDK Telemetry</span>
                <span>aistudio-build verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
