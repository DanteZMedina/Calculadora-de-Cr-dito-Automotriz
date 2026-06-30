/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AmortizationRow } from '../types';
import { formatMXN } from '../utils/export';
import { Table, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface AmortizationTableProps {
  schedule: AmortizationRow[];
  includeIvaOnInterest: boolean;
}

export default function AmortizationTable({ schedule, includeIvaOnInterest }: AmortizationTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(12); // Default to 12 months (1 year) per page

  if (!schedule || schedule.length === 0) return null;

  const hasInsuranceColumn = schedule.some((row) => row.insurancePaid && row.insurancePaid > 0);

  // Filter based on search term (month number)
  const filteredSchedule = schedule.filter((row) => {
    if (!searchTerm) return true;
    return row.paymentNumber.toString().includes(searchTerm);
  });

  const totalRows = filteredSchedule.length;
  const isAll = pageSize === 'all';
  const limit = isAll ? totalRows : pageSize;
  const totalPages = Math.ceil(totalRows / limit) || 1;

  // Adjust current page if it exceeds total pages
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * limit;
  const endIndex = isAll ? totalRows : Math.min(startIndex + limit, totalRows);
  const paginatedSchedule = filteredSchedule.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="amortization-table-container">
      {/* Table Header Section */}
      <div className="p-5 bg-slate-50 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-slate-900 text-white rounded-lg">
            <Table className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">
              Tabla de Amortización Detallada
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Proyección corrida de pagos mes con mes
            </p>
          </div>
        </div>

        {/* Filters and search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar mes..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset page
              }}
              className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 w-28 transition-all"
            />
          </div>

          {/* Page Size Select */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-400 font-medium">Ver:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value;
                setPageSize(val === 'all' ? 'all' : parseInt(val));
                setCurrentPage(1); // Reset page
              }}
              className="py-1 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-700 font-medium font-mono"
            >
              <option value={12}>12m (1 año)</option>
              <option value={24}>24m (2 años)</option>
              <option value={36}>36m (3 años)</option>
              <option value="all">Ver todo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 text-center w-14">No. Pago</th>
              <th className="py-3.5 px-4 text-right">Saldo Inicial</th>
              <th className="py-3.5 px-4 text-right bg-teal-50/20 text-teal-950 font-extrabold">Pago Mensual</th>
              <th className="py-3.5 px-4 text-right">Interés ordinario</th>
              {includeIvaOnInterest && <th className="py-3.5 px-4 text-right text-sky-700">IVA s/ Int. (16%)</th>}
              {hasInsuranceColumn && <th className="py-3.5 px-4 text-right text-emerald-700">Seguro Mensual</th>}
              <th className="py-3.5 px-4 text-right">Abono Capital</th>
              <th className="py-3.5 px-4 text-right">Saldo Final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 text-xs font-medium text-slate-700">
            {paginatedSchedule.map((row) => (
              <tr key={row.paymentNumber} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                  {row.paymentNumber}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {formatMXN(row.initialBalance)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold bg-teal-50/10 text-slate-900 border-x border-teal-50/20">
                  {formatMXN(row.monthlyPayment)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">
                  {formatMXN(row.interestPaid)}
                </td>
                {includeIvaOnInterest && (
                  <td className="py-3 px-4 text-right font-mono text-sky-600 bg-sky-50/5">
                    {formatMXN(row.ivaOnInterest)}
                  </td>
                )}
                {hasInsuranceColumn && (
                  <td className="py-3 px-4 text-right font-mono text-emerald-600 bg-emerald-50/5">
                    {formatMXN(row.insurancePaid || 0)}
                  </td>
                )}
                <td className="py-3 px-4 text-right font-mono text-slate-600">
                  {formatMXN(row.principalPaid)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-800 font-semibold">
                  {formatMXN(row.finalBalance)}
                </td>
              </tr>
            ))}

            {paginatedSchedule.length === 0 && (
              <tr>
                <td colSpan={includeIvaOnInterest ? (hasInsuranceColumn ? 8 : 7) : (hasInsuranceColumn ? 7 : 6)} className="py-8 text-center text-slate-400">
                  No se encontraron pagos con ese filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      {!isAll && totalPages > 1 && (
        <div className="p-4 bg-slate-50 border-t border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Mostrando <span className="font-bold text-slate-700">{startIndex + 1}</span> a{' '}
            <span className="font-bold text-slate-700">{endIndex}</span> de{' '}
            <span className="font-bold text-slate-700">{totalRows}</span> meses
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(activePage - 1)}
              disabled={activePage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center font-bold font-mono transition-all ${
                  activePage === p
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(activePage + 1)}
              disabled={activePage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
