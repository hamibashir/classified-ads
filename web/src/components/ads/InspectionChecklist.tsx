'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Car,
  Home,
  Package,
} from 'lucide-react';
import { CategoryItem } from '@/types/category';

interface InspectionChecklistProps {
  category?: CategoryItem | { slug?: string; name?: string } | null;
  className?: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  desc: string;
  important?: boolean;
}

export const InspectionChecklist: React.FC<InspectionChecklistProps> = ({
  category,
  className = '',
}) => {
  const catSlug = (category?.slug || '').toLowerCase();

  // Determine category-specific checklist
  let type: 'motors' | 'mobiles' | 'property' | 'general' = 'general';
  let Icon = Package;
  let categoryTitle = 'Buyer Inspection Checklist';

  if (
    catSlug.includes('motor') ||
    catSlug.includes('car') ||
    catSlug.includes('vehicle') ||
    catSlug.includes('bike')
  ) {
    type = 'motors';
    Icon = Car;
    categoryTitle = 'Vehicle Inspection & Document Checklist';
  } else if (
    catSlug.includes('mobile') ||
    catSlug.includes('phone') ||
    catSlug.includes('electronic') ||
    catSlug.includes('tablet')
  ) {
    type = 'mobiles';
    Icon = Smartphone;
    categoryTitle = 'Device & PTA Verification Checklist';
  } else if (
    catSlug.includes('prop') ||
    catSlug.includes('plot') ||
    catSlug.includes('house') ||
    catSlug.includes('commercial')
  ) {
    type = 'property';
    Icon = Home;
    categoryTitle = 'Real Estate Verification Checklist';
  }

  const checklistMap: Record<'motors' | 'mobiles' | 'property' | 'general', ChecklistItem[]> = {
    motors: [
      {
        id: 'm1',
        title: 'Original Smart Card & Registration Book',
        desc: 'Verify that the registration card is original and chassis/engine numbers match the engine stamp.',
        important: true,
      },
      {
        id: 'm2',
        title: 'Biometric Verification Transfer',
        desc: 'Ensure the seller is the registered owner and can provide Nadra biometric verification on the spot.',
        important: true,
      },
      {
        id: 'm3',
        title: 'Excise Tax & Token Record Check',
        desc: 'Verify online through the provincial Excise & Taxation portal (Punjab/Sindh/KPK/Islamabad).',
      },
      {
        id: 'm4',
        title: 'Engine & Suspension Physical Test Drive',
        desc: 'Check for abnormal exhaust smoke, engine vibrations, gearbox shifting smoothness, and AC cooling.',
      },
    ],
    mobiles: [
      {
        id: 'p1',
        title: 'PTA DIRBS Official IMEI Validation',
        desc: 'Dial *#06# to get the 15-digit IMEI. SMS it to 8484 or verify on dirbs.pta.gov.pk for genuine tax-paid status.',
        important: true,
      },
      {
        id: 'p2',
        title: 'Check iCloud / Google Account Lock',
        desc: 'Ensure seller logs out of Apple ID or Google account and perform a factory reset in your presence.',
        important: true,
      },
      {
        id: 'p3',
        title: 'Hardware & Sensor Test',
        desc: 'Check TrueTone, Face ID / Touch ID, front & rear cameras, charging port, and speaker clarity.',
      },
      {
        id: 'p4',
        title: 'Battery Health & Physical Seal',
        desc: 'Confirm maximum battery capacity percentage and verify screen glass is not refurbished or third-party replaced.',
      },
    ],
    property: [
      {
        id: 'r1',
        title: 'Registry, Fard & Allotment Letter',
        desc: 'Inspect original title deeds, latest society allotment letter, and verified transfer slip.',
        important: true,
      },
      {
        id: 'r2',
        title: 'Society NOC & Outstanding Dues',
        desc: 'Confirm with housing authority (LDA/CDA/DHA/Bahria) for valid NOC and clear utility/development dues.',
        important: true,
      },
      {
        id: 'r3',
        title: 'Physical Site & Plot Demarcation',
        desc: 'Personally visit the location to confirm street width, corner status, sewerage lines, and possession state.',
      },
      {
        id: 'r4',
        title: 'Witnessed Legal Sale Agreement',
        desc: 'Execute formal Bayana contract with stamp paper and Nadra CNIC copies of all signing parties.',
      },
    ],
    general: [
      {
        id: 'g1',
        title: 'Physical In-Person Inspection',
        desc: 'Meet in a daylight public commercial area to test functionality thoroughly before handing over money.',
        important: true,
      },
      {
        id: 'g2',
        title: 'Verify Accessories & Original Invoice',
        desc: 'Check for original packaging, receipts, or warranty cards mentioned in the listing.',
      },
      {
        id: 'g3',
        title: 'Zero Advance Payments via Easypaisa/JazzCash',
        desc: 'Never transfer tokens, delivery charges, or advance payments before physically inspecting the item.',
        important: true,
      },
      {
        id: 'g4',
        title: 'Exchange Signed Receipt / CNIC Copy',
        desc: 'For high-value items, retain a handwritten receipt with both buyer and seller CNIC numbers.',
      },
    ],
  };

  const items = checklistMap[type];
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className={`p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">{categoryTitle}</h3>
            <p className="text-[11px] text-slate-500">
              Interactive safety guide for Pakistani buyers — check items as you inspect
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Buyer Protection</span>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const isChecked = Boolean(checkedIds[item.id]);

          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                isChecked
                  ? 'bg-teal-50/50 border-teal-300'
                  : 'bg-slate-50/60 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="pt-0.5 shrink-0">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isChecked
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>
              </div>

              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-xs sm:text-sm font-semibold ${
                      isChecked ? 'text-teal-950 line-through' : 'text-slate-800'
                    }`}
                  >
                    {item.title}
                  </h4>
                  {item.important && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                      Mandatory
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-[11px] sm:text-xs leading-relaxed text-amber-800">
          <strong>Security Notice:</strong> Zaaz B does not operate escrow services or
          online delivery couriers. Always complete inspections physically and deal locally with
          cash or instant on-the-spot bank transfer upon verification.
        </p>
      </div>
    </div>
  );
};
