/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, RefreshCw, Layers, ArrowUpRight } from 'lucide-react';

interface InsurancePlaceholderProps {
  manualInsurancePremium: number;
  onInsuranceChange: (premium: number) => void;
  capitalizeInsurance: boolean;
  onCapitalizeChange: (capitalize: boolean) => void;
}

export default function InsurancePlaceholder({
  manualInsurancePremium,
  onInsuranceChange,
  capitalizeInsurance,
  onCapitalizeChange,
}: InsurancePlaceholderProps) {
  const [premiumStr, setPremiumStr] = useState('');

  // Helper to format string numbers with thousand separators "," and optional "$ " prefix
  const formatCommas = (val: number | string, includePrefix = false) => {
    if (val === undefined || val === null || val === '') return '';
    
    // Strip non-digits and dots
    let str = val.toString().replace(/[^0-9.]/g, '');
    const parts = str.split('.');
    
    // If multiple dots, keep only the first
    if (parts.length > 2) {
      str = parts[0] + '.' + parts.slice(1).join('');
    }
    
    const integerPart = parts[0];
    const decimalPart = parts[1] !== undefined ? '.' + parts[1].substring(0, 2) : '';
    
    if (integerPart === '') {
      return (includePrefix ? '$ ' : '') + decimalPart;
    }
    
    const formattedInteger = parseInt(integerPart, 10).toLocaleString('es-MX');
    return (includePrefix ? '$ ' : '') + formattedInteger + decimalPart;
  };

  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Sync from parent
  useEffect(() => {
    setPremiumStr(formatCommas(manualInsurancePremium, true));
  }, []);

  useEffect(() => {
    if (parseNumber(premiumStr) !== manualInsurancePremium) {
      setPremiumStr(formatCommas(manualInsurancePremium, true));
    }
  }, [manualInsurancePremium]);

  const handlePremiumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = raw.replace(/[^0-9.]/g, '');
    const formatted = formatCommas(clean, true);
    setPremiumStr(formatted);
    const parsed = parseNumber(clean);
    onInsuranceChange(parsed);
  };
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-6 text-white shadow-sm relative overflow-hidden" id="insurance-section">
      {/* Visual glowing effect */}
      <div className="absolute right-0 bottom-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20 text-teal-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                  Módulo de Seguro Automotriz
                </span>
                <span className="bg-slate-800 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-slate-300">
                  ROADMAP
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 mt-0.5">
                Integración de APIS en Tiempo Real
              </h3>
            </div>
          </div>
        </div>

        {/* Informative text */}
        <p className="text-xs text-slate-400 leading-relaxed">
          Estamos investigando la integración directa con los servidores de aseguradoras mexicanas líder (como <strong className="text-slate-300">Quálitas, GNP, HDI y Banorte</strong>) para cotizar el seguro multianual de cobertura amplia al instante según tu código postal y modelo.
        </p>

        {/* Temporary Manual Quote Input */}
        <div className="pt-3 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              ¿Ya tienes una cotización? (Opcional)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Agregado al cálculo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="input-manualInsurancePremium">
                Costo del Seguro Anual (MXN)
              </label>
              <div className="relative">
                <input
                  id="input-manualInsurancePremium"
                  type="text"
                  value={premiumStr}
                  onChange={handlePremiumChange}
                  placeholder="Ej. $ 12,500.00"
                  className="w-full pl-3 pr-10 py-1.5 text-xs bg-slate-900 border border-slate-850 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500/50 font-mono font-bold"
                />
                <span className="absolute inset-y-0 right-2.5 flex items-center text-slate-500 text-[9px] font-mono">MXN/año</span>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center space-x-2.5 cursor-pointer py-2 group" htmlFor="input-capitalizeInsurance">
                <input
                  id="input-capitalizeInsurance"
                  type="checkbox"
                  disabled={!manualInsurancePremium || manualInsurancePremium <= 0}
                  checked={capitalizeInsurance}
                  onChange={(e) => onCapitalizeChange(e.target.checked)}
                  className="h-3.5 w-3.5 rounded text-teal-600 focus:ring-teal-500/20 border-slate-700 bg-slate-900 accent-teal-600 disabled:opacity-30"
                />
                <div>
                  <span className={`text-[11px] font-semibold block transition-colors ${
                    manualInsurancePremium > 0 ? 'text-slate-300 group-hover:text-white' : 'text-slate-600'
                  }`}>
                    Financiar seguro en mensualidades
                  </span>
                  <span className="text-[9px] text-slate-500 block leading-tight">
                    Difiere el costo anual en tu mensualidad fija.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Future features list */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[10px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Cpu className="h-3.5 w-3.5 text-teal-500/50" />
            <span>Webhooks de Aseguradoras</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <RefreshCw className="h-3.5 w-3.5 text-teal-500/50" />
            <span>Cotización por C.P.</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Layers className="h-3.5 w-3.5 text-teal-500/50" />
            <span>Coberturas Personalizables</span>
          </div>
        </div>
      </div>
    </div>
  );
}
