'use client';

import React from 'react';
import { ShieldCheck, Eye, Smartphone, Car, Lock } from 'lucide-react';

export const SafeTradingSection: React.FC = () => {
  return (
    <section className="my-10 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Safe Trading Guidelines in Pakistan
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Follow these essential tips to ensure safe and transparent peer-to-peer transactions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
            <Eye className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Meet in Public Places</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Always arrange inspections in busy daylight locations like commercial plazas, fuel stations, or metro stations.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
            <Smartphone className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Check PTA Approval</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            For smartphones, verify the 15-digit IMEI number via 8484 SMS or the official PTA DIRBS system before purchasing.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
            <Car className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Verify Vehicle Biometrics</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            For cars and bikes, ensure biometric verification is completed and check excise tax records before handover.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No Advance Payments</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Never send advance deposits via Easypaisa, JazzCash, or bank transfer before physically verifying the item.
          </p>
        </div>
      </div>
    </section>
  );
};
