/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Car, Landmark, ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-teal-500/10 rounded-xl border border-teal-500/30 text-teal-400" id="logo-container">
              <Car className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] tracking-widest text-teal-400 font-semibold bg-teal-950/40 px-2 py-0.5 rounded border border-teal-900">
                  MÉXICO
                </span>
                <span className="font-mono text-[10px] tracking-widest text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded">
                  ESTÁNDAR CN
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Calculadora de Crédito Automotriz
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Simulador de financiamiento instantáneo con tasas, comisiones e IVA localizado
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-slate-400 text-xs self-start md:self-auto bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center space-x-1.5">
              <Landmark className="h-4 w-4 text-teal-400" />
              <span>Cálculo Francés</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span>IVA s/ Int. (16%)</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
