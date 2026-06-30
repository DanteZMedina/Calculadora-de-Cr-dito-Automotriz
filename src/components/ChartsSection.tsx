/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { LoanSummary, AmortizationRow } from '../types';
import { formatMXN } from '../utils/export';
import { Presentation, PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface ChartsSectionProps {
  summary: LoanSummary;
  schedule: AmortizationRow[];
  includeIvaOnInterest: boolean;
}

export default function ChartsSection({ summary, schedule, includeIvaOnInterest }: ChartsSectionProps) {
  if (!schedule || schedule.length === 0) return null;

  // 1. Data for Cost Breakdown Pie Chart
  // We want to show what makes up the Total Out of Pocket Cost
  const pieData = [
    { name: 'Capital Neto Financiado', value: summary.amountToFinance - (summary.openingCommissionAmount && schedule[0]?.initialBalance > summary.amountToFinance ? summary.openingCommissionAmount : 0), color: '#0d9488' }, // Teal 600
    { name: 'Enganche de Contado', value: summary.downPaymentAmount, color: '#0f172a' }, // Slate 900
    { name: 'Intereses Totales', value: summary.totalInterestPaid, color: '#6366f1' }, // Indigo 500
    { name: 'IVA s/ Intereses (16%)', value: summary.totalIvaPaid, color: '#38bdf8' }, // Sky 400
    { name: 'Comisión por Apertura', value: summary.openingCommissionAmount, color: '#f43f5e' }, // Rose 500
  ].filter(item => item.value > 0);

  // 2. Sample or condensed amortization schedule for the Bar Chart
  // If schedule is too long (e.g. 72 months), let's group it or show every N-th month,
  // or show all since Recharts Bar handles scrolling / scaling well, but let's sample or show the full set in a clean scrollable box, or label every 6th/12th month.
  // Actually, let's map the whole schedule but format the XAxis to show labels every 6 or 12 months for readability on mobile.
  const barData = schedule.map((row) => ({
    mes: `Mes ${row.paymentNumber}`,
    'Abono Capital': Math.round(row.principalPaid),
    'Interés Pagado': Math.round(row.interestPaid),
    'IVA s/ Interés': Math.round(row.ivaOnInterest),
  }));

  const customTooltipFormatter = (value: any) => [formatMXN(Number(value)), ''];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="charts-container">
      {/* --- Pie Chart: Cost Breakdown --- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-5 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <PieIcon className="h-4 w-4 text-teal-600" />
            <span>Distribución del Gasto Real</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Muestra el destino de cada peso desembolsado en la compra (total de ${formatMXN(summary.totalOutofPocket)}).
          </p>
        </div>

        <div className="h-64 flex items-center justify-center my-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={customTooltipFormatter} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {pieData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium">{item.name}</span>
              </div>
              <span className="font-mono font-bold text-slate-800">
                {formatMXN(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* --- Stacked Bar Chart: Payment Progression --- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-7 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            <span>Evolución Mensual del Pago</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Observe cómo disminuyen los intereses y aumenta el abono directo a capital con el método francés de amortización.
          </p>
        </div>

        <div className="h-72 w-full my-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 9, fill: '#64748b' }}
                interval={schedule.length > 36 ? 11 : schedule.length > 24 ? 5 : 2} // Label cleanups for long schedules
                stroke="#cbd5e1"
              />
              <YAxis 
                tick={{ fontSize: 9, fill: '#64748b' }}
                tickFormatter={(val) => `$${Math.round(val).toLocaleString()}`}
                stroke="#cbd5e1"
              />
              <Tooltip 
                formatter={(val) => formatMXN(Number(val))}
                contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              <Bar dataKey="Abono Capital" stackId="a" fill="#0d9488" />
              <Bar dataKey="Interés Pagado" stackId="a" fill="#6366f1" />
              {includeIvaOnInterest && <Bar dataKey="IVA s/ Interés" stackId="a" fill="#38bdf8" />}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[11px] text-slate-400 italic text-center mt-1 border-t border-slate-100 pt-3">
          El abono a capital aumenta gradualmente cada mes acelerando la liquidación de la deuda.
        </div>
      </div>
    </div>
  );
}
