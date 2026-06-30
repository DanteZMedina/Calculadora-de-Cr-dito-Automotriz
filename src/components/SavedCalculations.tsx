/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SavedCalculation } from '../types';
import { formatMXN } from '../utils/export';
import { Bookmark, Trash2, Plus, ArrowRight, Sparkles } from 'lucide-react';

interface SavedCalculationsProps {
  currentInputs: {
    brand: string;
    modelName: string;
    vehiclePrice: number;
    discount: number;
    downPaymentPercent: number;
    interestRate: number;
    termMonths: number;
  };
  onLoad: (inputs: any) => void;
}

export default function SavedCalculations({ currentInputs, onLoad }: SavedCalculationsProps) {
  const [savedList, setSavedList] = useState<SavedCalculation[]>([]);
  const [newName, setNewName] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('car_loan_simulations');
    if (saved) {
      try {
        setSavedList(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved calculations', e);
      }
    }
  }, []);

  const saveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    
    const brand = currentInputs.brand.trim() || 'Auto';
    const model = currentInputs.modelName.trim() || 'Sin modelo';
    
    const newCalc: SavedCalculation = {
      id: Math.random().toString(36).substring(2, 9),
      brand,
      modelName: model,
      vehiclePrice: currentInputs.vehiclePrice,
      discount: currentInputs.discount,
      downPaymentPercent: currentInputs.downPaymentPercent,
      interestRate: currentInputs.interestRate,
      termMonths: currentInputs.termMonths,
      timestamp: Date.now(),
    };

    const updated = [newCalc, ...savedList].slice(0, 10); // Limit to 10 saves
    setSavedList(updated);
    localStorage.setItem('car_loan_simulations', JSON.stringify(updated));
    setNewName('');
  };

  const deleteCalc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent loading it when deleting
    const updated = savedList.filter((item) => item.id !== id);
    setSavedList(updated);
    localStorage.setItem('car_loan_simulations', JSON.stringify(updated));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="saved-calculations-container">
      {/* Title */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bookmark className="h-4.5 w-4.5 text-slate-500" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">
            Simulaciones Guardadas
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">Historial Local</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Save Current Simulation Button/Form */}
        <form onSubmit={saveCurrent} className="flex gap-2">
          <button
            type="submit"
            disabled={!currentInputs.vehiclePrice || currentInputs.vehiclePrice <= 0}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:hover:bg-slate-900 cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Guardar Cotización Actual</span>
          </button>
        </form>

        {/* List of saved */}
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {savedList.map((item) => {
            const label = `${item.brand} ${item.modelName}`.trim();
            const netPrice = item.vehiclePrice - item.discount;
            return (
              <div
                key={item.id}
                onClick={() => onLoad(item)}
                className="group border border-slate-200 hover:border-teal-500/50 hover:bg-slate-50/50 p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center relative"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-800 text-xs truncate max-w-[150px]" title={label}>
                      {label}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {item.termMonths}m
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-2 gap-y-0.5 font-medium">
                    <span>Neto: <strong className="text-slate-700 font-semibold">{formatMXN(netPrice)}</strong></span>
                    <span>Tasa: <strong className="text-slate-700 font-semibold">{item.interestRate}%</strong></span>
                    <span>Enganche: <strong className="text-slate-700 font-semibold">{item.downPaymentPercent}%</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-600 text-[10px] font-bold flex items-center">
                    Cargar <ArrowRight className="h-3 w-3 ml-0.5" />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => deleteCalc(item.id, e)}
                    className="p-1.5 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {savedList.length === 0 && (
            <div className="py-6 text-center text-slate-400 flex flex-col items-center justify-center space-y-1">
              <span className="text-xs">No tienes simulaciones guardadas.</span>
              <span className="text-[10px] text-slate-400">Guarda tus cálculos para compararlos después.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
