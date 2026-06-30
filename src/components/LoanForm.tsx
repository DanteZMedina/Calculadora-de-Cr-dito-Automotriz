/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LoanInputs } from '../types';
import { DollarSign, Percent, Calendar, HelpCircle, Tag, Settings, Car } from 'lucide-react';

interface LoanFormProps {
  inputs: LoanInputs;
  onChange: (inputs: LoanInputs) => void;
  errors: { [key: string]: string };
}

export default function LoanForm({ inputs, onChange, errors }: LoanFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      onChange({ ...inputs, [name]: checked });
    } else if (type === 'number') {
      const numVal = value === '' ? 0 : parseFloat(value);
      onChange({ ...inputs, [name]: numVal });
    } else {
      onChange({ ...inputs, [name]: value });
    }
  };

  const handleSliderChange = (name: string, val: number) => {
    onChange({ ...inputs, [name]: val });
  };

  const applyPresetTerm = (months: number) => {
    onChange({ ...inputs, termMonths: months });
  };

  const netPrice = Math.max(0, inputs.vehiclePrice - inputs.discount);
  const downPaymentAmount = (netPrice * inputs.downPaymentPercent) / 100;

  // Local string states for input fields to allow smooth, format-on-the-fly typing
  const [priceStr, setPriceStr] = useState('');
  const [discountStr, setDiscountStr] = useState('');
  const [downPaymentAmountStr, setDownPaymentAmountStr] = useState('');
  const [downPaymentPercentStr, setDownPaymentPercentStr] = useState('');
  const [interestRateStr, setInterestRateStr] = useState('');
  const [commissionPercentStr, setCommissionPercentStr] = useState('');
  const [commissionFlatStr, setCommissionFlatStr] = useState('');

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

  // Initialize and keep state in sync
  useEffect(() => {
    setPriceStr(formatCommas(inputs.vehiclePrice, true));
    setDiscountStr(formatCommas(inputs.discount, true));
    setDownPaymentPercentStr(inputs.downPaymentPercent.toString());
    setDownPaymentAmountStr(formatCommas(Math.round(downPaymentAmount), true));
    setInterestRateStr(inputs.interestRate.toString());
    setCommissionPercentStr(inputs.openingCommissionPercent.toString());
    setCommissionFlatStr(formatCommas(inputs.openingCommissionFlat, true));
  }, []);

  useEffect(() => {
    if (parseNumber(priceStr) !== inputs.vehiclePrice) {
      setPriceStr(formatCommas(inputs.vehiclePrice, true));
    }
  }, [inputs.vehiclePrice]);

  useEffect(() => {
    if (parseNumber(discountStr) !== inputs.discount) {
      setDiscountStr(formatCommas(inputs.discount, true));
    }
  }, [inputs.discount]);

  useEffect(() => {
    if (parseFloat(downPaymentPercentStr) !== inputs.downPaymentPercent) {
      setDownPaymentPercentStr(inputs.downPaymentPercent.toString());
    }
  }, [inputs.downPaymentPercent]);

  useEffect(() => {
    const computedDownPayment = (netPrice * inputs.downPaymentPercent) / 100;
    if (parseNumber(downPaymentAmountStr) !== Math.round(computedDownPayment)) {
      setDownPaymentAmountStr(formatCommas(Math.round(computedDownPayment), true));
    }
  }, [inputs.downPaymentPercent, netPrice]);

  useEffect(() => {
    if (parseFloat(interestRateStr) !== inputs.interestRate) {
      setInterestRateStr(inputs.interestRate.toString());
    }
  }, [inputs.interestRate]);

  useEffect(() => {
    if (parseFloat(commissionPercentStr) !== inputs.openingCommissionPercent) {
      setCommissionPercentStr(inputs.openingCommissionPercent.toString());
    }
  }, [inputs.openingCommissionPercent]);

  useEffect(() => {
    if (parseNumber(commissionFlatStr) !== inputs.openingCommissionFlat) {
      setCommissionFlatStr(formatCommas(inputs.openingCommissionFlat, true));
    }
  }, [inputs.openingCommissionFlat]);

  // Handle changes reactively
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = raw.replace(/[^0-9.]/g, '');
    const formatted = formatCommas(clean, true);
    setPriceStr(formatted);
    const parsed = parseNumber(clean);
    onChange({ ...inputs, vehiclePrice: parsed });
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = raw.replace(/[^0-9.]/g, '');
    const formatted = formatCommas(clean, true);
    setDiscountStr(formatted);
    const parsed = parseNumber(clean);
    onChange({ ...inputs, discount: parsed });
  };

  const handleDownPaymentPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    let clean = raw.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    setDownPaymentPercentStr(clean);
    
    const parsed = parseFloat(clean);
    if (!isNaN(parsed)) {
      onChange({ ...inputs, downPaymentPercent: Math.min(100, parsed) });
    } else {
      onChange({ ...inputs, downPaymentPercent: 0 });
    }
  };

  const handleDownPaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = raw.replace(/[^0-9.]/g, '');
    const formatted = formatCommas(clean, true);
    setDownPaymentAmountStr(formatted);
    
    const parsedAmount = parseNumber(clean);
    const computedPercent = netPrice > 0 ? (parsedAmount / netPrice) * 100 : 0;
    onChange({
      ...inputs,
      downPaymentPercent: Math.min(100, computedPercent)
    });
  };

  const handleInterestRateChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    let clean = raw.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    setInterestRateStr(clean);
    const parsed = parseFloat(clean);
    onChange({ ...inputs, interestRate: isNaN(parsed) ? 0 : parsed });
  };

  const handleCommissionPercentChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    let clean = raw.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    setCommissionPercentStr(clean);
    const parsed = parseFloat(clean);
    onChange({ ...inputs, openingCommissionPercent: isNaN(parsed) ? 0 : parsed });
  };

  const handleCommissionFlatChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = raw.replace(/[^0-9.]/g, '');
    const formatted = formatCommas(clean, true);
    setCommissionFlatStr(formatted);
    const parsed = parseNumber(clean);
    onChange({ ...inputs, openingCommissionFlat: parsed });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="loan-form-container">
      {/* Title section */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-slate-500" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-800 uppercase">
            Parámetros de Cotización
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">Paso 1: Configurar</span>
      </div>

      <div className="p-6 space-y-6">
        {/* --- Brand & Model --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5" htmlFor="input-brand">
              Marca del Vehículo
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Car className="h-4.5 w-4.5" />
              </span>
              <input
                id="input-brand"
                type="text"
                name="brand"
                value={inputs.brand}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                placeholder="Ej. Mazda, Nissan, Toyota"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5" htmlFor="input-modelName">
              Modelo / Versión
            </label>
            <input
              id="input-modelName"
              type="text"
              name="modelName"
              value={inputs.modelName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800 placeholder-slate-400"
              placeholder="Ej. CX-30 Grand Touring, Sentra SR"
            />
          </div>
        </div>

        {/* --- Vehicle Price & Discount --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5" htmlFor="input-vehiclePrice">
              Valor Factura (Precio de Lista) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-vehiclePrice"
                type="text"
                name="vehiclePrice"
                value={priceStr}
                onChange={handlePriceChange}
                className={`w-full pl-3 pr-12 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-mono font-bold text-slate-800 placeholder-slate-400 ${
                  errors.vehiclePrice ? 'border-red-400 bg-red-50/10' : 'border-slate-200'
                }`}
                placeholder="$ 0.00"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-xs font-mono">
                MXN
              </span>
            </div>
            {errors.vehiclePrice && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.vehiclePrice}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5" htmlFor="input-discount">
              Oferta de Descuento (Bono)
            </label>
            <div className="relative">
              <input
                id="input-discount"
                type="text"
                name="discount"
                value={discountStr}
                onChange={handleDiscountChange}
                className={`w-full pl-3 pr-12 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-mono font-bold text-slate-800 placeholder-slate-400 ${
                  errors.discount ? 'border-red-400 bg-red-50/10' : 'border-slate-200'
                }`}
                placeholder="$ 0.00"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-xs font-mono">
                MXN
              </span>
            </div>
            {errors.discount && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.discount}</p>
            )}
            {!errors.discount && inputs.discount > 0 && (
              <p className="mt-1 text-[11px] text-teal-600 font-medium flex items-center">
                <Tag className="h-3 w-3 mr-1" /> Precio Neto: ${netPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </div>

        {/* --- Down Payment (Enganche) --- */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Enganche (Inversión Inicial)
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              Precio Neto: ${netPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Percentage Input */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Porcentaje (%)</span>
              <div className="relative">
                <input
                  type="text"
                  name="downPaymentPercent"
                  value={downPaymentPercentStr}
                  onChange={handleDownPaymentPercentChange}
                  className="w-full pl-3 pr-7 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-mono font-bold text-slate-800"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 text-xs font-mono">%</span>
              </div>
            </div>

            {/* Absolute Amount Input */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Monto ($ MXN)</span>
              <div className="relative">
                <input
                  type="text"
                  name="downPaymentAmount"
                  value={downPaymentAmountStr}
                  onChange={handleDownPaymentAmountChange}
                  className="w-full pl-3 pr-12 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-mono font-bold text-slate-800"
                  placeholder="$ 0.00"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 text-xs font-mono">
                  MXN
                </span>
              </div>
            </div>
          </div>

          {/* Range Slider for quick adjustments */}
          <div className="space-y-1.5">
            <input
              id="input-downPaymentPercent"
              type="range"
              name="downPaymentPercent"
              min="0"
              max="100"
              step="1"
              value={inputs.downPaymentPercent > 100 ? 100 : inputs.downPaymentPercent}
              onChange={(e) => handleSliderChange('downPaymentPercent', parseFloat(e.target.value))}
              className="w-full accent-teal-600 bg-slate-100 rounded-lg h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Mínimo)</span>
              <span>20% (Estándar)</span>
              <span>50%</span>
              <span>100% (Valor factura)</span>
            </div>
          </div>

          {errors.downPaymentPercent && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.downPaymentPercent}</p>
          )}
        </div>

        {/* --- Interest Rate --- */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600" htmlFor="input-interestRate">
              Tasa de Interés Anual: <span className="font-bold text-teal-600">{inputs.interestRate}%</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">Tasa de interés ordinaria fija</span>
          </div>
          <div className="flex items-center space-x-4">
            <input
              id="input-interestRate"
              type="range"
              name="interestRate"
              min="0"
              max="35"
              step="0.1"
              value={inputs.interestRate}
              onChange={(e) => handleSliderChange('interestRate', parseFloat(e.target.value))}
              className="w-full accent-teal-600 bg-slate-100 rounded-lg h-1.5 cursor-pointer"
            />
            <div className="relative w-24">
              <input
                type="text"
                name="interestRate"
                value={interestRateStr}
                onChange={handleInterestRateChangeLocal}
                className={`w-full text-right pr-6 py-1 text-xs bg-slate-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all font-mono font-bold text-slate-800 ${
                  errors.interestRate ? 'border-red-400 bg-red-50/10' : 'border-slate-200'
                }`}
              />
              <span className="absolute inset-y-0 right-2 flex items-center text-slate-400 text-[10px] font-mono">%</span>
            </div>
          </div>
          {errors.interestRate && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.interestRate}</p>
          )}
        </div>

        {/* --- Term (Plazo) --- */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600" htmlFor="input-termMonths">
              Plazo de Pago: <span className="font-bold text-teal-600">{inputs.termMonths} meses</span>
            </label>
            <span className="text-xs text-slate-500 font-mono font-medium">
              ({(inputs.termMonths / 12).toFixed(1)} Años)
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <input
              id="input-termMonths"
              type="range"
              name="termMonths"
              min="12"
              max="72"
              step="1"
              value={inputs.termMonths}
              onChange={(e) => handleSliderChange('termMonths', parseInt(e.target.value))}
              className="w-full accent-teal-600 bg-slate-100 rounded-lg h-1.5 cursor-pointer"
            />
            <div className="relative w-24">
              <input
                type="number"
                name="termMonths"
                min="12"
                max="72"
                value={inputs.termMonths}
                onChange={handleInputChange}
                className={`w-full text-right pr-10 py-1 text-xs bg-slate-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all font-mono font-bold text-slate-800 ${
                  errors.termMonths ? 'border-red-400 bg-red-50/10' : 'border-slate-200'
                }`}
              />
              <span className="absolute inset-y-0 right-2 flex items-center text-slate-400 text-[10px] font-mono">meses</span>
            </div>
          </div>
          {errors.termMonths && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.termMonths}</p>
          )}

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[12, 24, 36, 48, 60, 72].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => applyPresetTerm(m)}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all ${
                  inputs.termMonths === m
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* --- Opening Commission --- */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Comisión por Apertura
            </label>
            <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-mono font-bold">
              <button
                type="button"
                onClick={() => onChange({ ...inputs, commissionType: 'percent' })}
                className={`px-2 py-0.5 rounded ${
                  inputs.commissionType === 'percent'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Porcentaje (%)
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...inputs, commissionType: 'flat' })}
                className={`px-2 py-0.5 rounded ${
                  inputs.commissionType === 'flat'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Monto ($)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 items-center">
            <div className="col-span-2">
              {inputs.commissionType === 'percent' ? (
                <div className="relative">
                  <input
                    type="text"
                    name="openingCommissionPercent"
                    value={commissionPercentStr}
                    onChange={handleCommissionPercentChangeLocal}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono font-bold text-slate-800"
                    placeholder="2.5"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 text-xs font-mono">%</span>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    name="openingCommissionFlat"
                    value={commissionFlatStr}
                    onChange={handleCommissionFlatChangeLocal}
                    className="w-full pl-3 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono font-bold text-slate-800"
                    placeholder="$ 0.00"
                  />
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Costo</span>
              <span className="text-xs font-mono font-bold text-slate-700">
                ${(inputs.commissionType === 'percent'
                  ? (netPrice - downPaymentAmount) * (inputs.openingCommissionPercent / 100)
                  : inputs.openingCommissionFlat
                ).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Quick presets for opening commission percent */}
          {inputs.commissionType === 'percent' && (
            <div className="flex gap-2">
              {[0, 1.5, 2.0, 2.5].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange({ ...inputs, openingCommissionPercent: p })}
                  className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded ${
                    inputs.openingCommissionPercent === p
                      ? 'bg-teal-100 text-teal-800 border border-teal-200'
                      : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- Advanced Options (Toggles) --- */}
        <div className="pt-2 border-t border-slate-100 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1">
            <span>Opciones de Regulación y Financiamiento</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer group" htmlFor="input-includeIvaOnInterest">
              <input
                id="input-includeIvaOnInterest"
                type="checkbox"
                name="includeIvaOnInterest"
                checked={inputs.includeIvaOnInterest}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 rounded text-teal-600 focus:ring-teal-500/30 border-slate-300 accent-teal-600"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block group-hover:text-slate-900 transition-colors">
                  Incluir IVA del 16% sobre intereses
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                  Estándar obligatorio de Banco de México (Banxico) para créditos de consumo personal.
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer group" htmlFor="input-capitalizeCommission">
              <input
                id="input-capitalizeCommission"
                type="checkbox"
                name="capitalizeCommission"
                checked={inputs.capitalizeCommission}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 rounded text-teal-600 focus:ring-teal-500/30 border-slate-300 accent-teal-600"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block group-hover:text-slate-900 transition-colors">
                  Financiar comisión por apertura (Capitalizar)
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                  Suma la comisión de apertura al saldo financiado para no pagarla de contado al inicio.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
