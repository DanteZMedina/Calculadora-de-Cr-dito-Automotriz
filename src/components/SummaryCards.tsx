/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LoanSummary } from '../types';
import { formatMXN, formatPercent } from '../utils/export';
import { Info, HelpCircle, Flame, Sparkles, TrendingUp, DollarSign, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  summary: LoanSummary;
  cat: number;
  brand: string;
  modelName: string;
}

export default function SummaryCards({ summary, cat, brand, modelName }: SummaryCardsProps) {
  const carLabel = `${brand} ${modelName}`.trim() || 'Vehículo Seleccionado';

  return (
    <div className="space-y-6" id="summary-cards-section">
      {/* --- Main prominent monthly payment card --- */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-md border border-slate-800" id="main-mensualidad-card">
        {/* Decorative ambient background */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="inline-block px-2 py-0.5 text-[10px] font-mono tracking-wider font-bold uppercase rounded bg-teal-500 text-teal-950">
                PAGO MENSUAL PROMEDIO
              </span>
              <span className="text-slate-400 text-xs">|</span>
              <span className="text-slate-300 text-xs font-medium max-w-[200px] truncate" title={carLabel}>
                {carLabel}
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-white font-sans mt-2">
              {formatMXN(summary.averageMonthlyPayment)}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mt-2">
              * El pago mensual es fijo e incluye capital, intereses e {summary.totalIvaPaid > 0 ? 'IVA (16%)' : 'sin IVA'}. El monto puede variar ligeramente en el último mes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 self-stretch md:self-auto min-w-[240px]">
            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80 flex-1 text-center md:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">CAT Estimado</span>
              <span className="text-xl font-bold font-mono text-teal-400 block mt-0.5">
                {formatPercent(cat)}
              </span>
              <span className="text-[9px] text-slate-500 block">Costo Anual Total</span>
            </div>
            
            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80 flex-1 text-center md:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Monto Financiar</span>
              <span className="text-xl font-bold font-mono text-slate-200 block mt-0.5">
                {formatMXN(summary.amountToFinance)}
              </span>
              <span className="text-[9px] text-slate-500 block">Sujeto a crédito</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Bento Grid for other crucial totals --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="totals-bento-grid">
        {/* Total Interest Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Intereses</span>
              <h4 className="text-xl font-black text-slate-800 mt-1 font-mono">
                {formatMXN(summary.totalInterestPaid)}
              </h4>
            </div>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[10px] text-slate-500">
            <span>Interés puro devengado</span>
            <span className="font-semibold text-slate-700">Tasa fija</span>
          </div>
        </div>

        {/* Total IVA on Interest */}
        <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">IVA s/ Intereses</span>
              <h4 className="text-xl font-black text-slate-800 mt-1 font-mono">
                {formatMXN(summary.totalIvaPaid)}
              </h4>
            </div>
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <Info className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[10px] text-slate-500">
            <span>Impuesto del 16%</span>
            <span className="font-semibold text-slate-700">Federal</span>
          </div>
        </div>

        {/* Costo Total del Crédito (Pure cost of credit) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-rose-600">Costo del Crédito</span>
              <h4 className="text-xl font-black text-rose-600 mt-1 font-mono">
                {formatMXN(summary.totalCreditCost)}
              </h4>
            </div>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg group-hover:animate-pulse">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[10px] text-slate-500">
            <span>Intereses + IVA + Comisión</span>
            <span className="font-bold text-rose-500">Financiamiento</span>
          </div>
        </div>

        {/* Desembolso Total Out-of-Pocket */}
        <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pago Total (Auto + Crédito)</span>
              <h4 className="text-xl font-black text-slate-800 mt-1 font-mono">
                {formatMXN(summary.totalOutofPocket)}
              </h4>
            </div>
            <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[10px] text-slate-500">
            <span>Enganche + Mensualidades</span>
            <span className="font-semibold text-slate-700">Costo total real</span>
          </div>
        </div>
      </div>
    </div>
  );
}
