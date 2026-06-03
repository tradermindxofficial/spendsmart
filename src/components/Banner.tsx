'use client';

import React from 'react';
import { dbMode } from '../lib/db';
import { Database, AlertCircle } from 'lucide-react';

export default function Banner() {
  if (dbMode !== 'demo') return null;

  return (
    <div className="relative w-full bg-amber-500/10 border-b border-amber-500/25 px-4 py-2 text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-medium text-center sm:text-left">
            <strong>Demo Mode:</strong> App is using browser Local Storage. Set your Supabase keys to enable cloud sync.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/35">
          <Database className="h-3 w-3" />
          <span>Local Storage</span>
        </div>
      </div>
    </div>
  );
}
