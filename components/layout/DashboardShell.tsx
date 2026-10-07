'use client';

import React from 'react';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';

export function DashboardShell({
  children,
  breadcrumbs = [],
  onSearch,
}: {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  onSearch?: (query: string) => void;
}) {
  return (
    <div className="flex min-h-screen bg-[#05070A] text-slate-100">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar breadcrumbs={breadcrumbs} onSearch={onSearch} />
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
