/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import LoanForm from './components/LoanForm';
import SummaryCards from './components/SummaryCards';
import ChartsSection from './components/ChartsSection';
import AmortizationTable from './components/AmortizationTable';
import SavedCalculations from './components/SavedCalculations';
import InsurancePlaceholder from './components/InsurancePlaceholder';
import DisclaimerModal from './components/DisclaimerModal';

import { LoanInputs } from './types';
import { calculateLoan, estimateCat } from './utils/calculations';
import { exportToPDF, exportToExcel } from './utils/export';
import { FileDown, Download, Sparkles, RefreshCw, HelpCircle, Check, Landmark } from 'lucide-react';

const DEFAULT_INPUTS: LoanInputs = {
  brand: 'Mazda',
  modelName: 'CX-30 i Sport',
  vehiclePrice: 489900,
  discount: 15000,
  downPaymentPercent: 20,
  interestRate: 14.99,
  termMonths: 48,
  openingCommissionPercent: 2.5,
  openingCommissionFlat: 0,
  commissionType: 'percent',
  includeIvaOnInterest: true,
  capitalizeCommission: false,
};

export default function App() {
  const [inputs, setInputs] = useState<LoanInputs>(DEFAULT_INPUTS);
  
  // Insurance optional inputs (to show we support premium calculation and roadmap)
  const [manualInsurancePremium, setManualInsurancePremium] = useState<number>(12500);
  const [capitalizeInsurance, setCapitalizeInsurance] = useState<boolean>(false);

  // Disclaimer modal state
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);

  // Auto-open disclaimer if not accepted before
  useEffect(() => {
    const accepted = localStorage.getItem('disclaimer_accepted_byd');
    if (accepted !== 'true') {
      setIsDisclaimerOpen(true);
    }
  }, []);

  const handleCloseDisclaimer = () => {
    localStorage.setItem('disclaimer_accepted_byd', 'true');
    setIsDisclaimerOpen(false);
  };

  // Perform calculation with useMemo to keep it fast
  const calculationResult = useMemo(() => {
    // Basic calculation for the vehicle and loan params
    const result = calculateLoan(inputs);

    // If they provided manual insurance, we adjust the calculations if capitalized or paid monthly.
    // In Mexico, if insurance is capitalized, it is added to the amount to finance.
    // If it is paid monthly but not capitalized, it is simply divided by 12 and added to each monthly payment.
    if (manualInsurancePremium > 0 && result.schedule.length > 0) {
      const annualInsuranceCost = manualInsurancePremium;
      
      if (capitalizeInsurance) {
        // Recalculate with insurance capitalized in amount to finance
        // For accurate calculation, we can simulate adding insurance to the initial vehicle price or net price.
        // Let's create an adjusted input where vehicle price is increased by the capitalized insurance for the term,
        // or we can adjust the amount to finance directly.
        // Let's adjust amountToFinance and recalculate.
        const adjustedInputs = {
          ...inputs,
          vehiclePrice: inputs.vehiclePrice + annualInsuranceCost * (inputs.termMonths / 12),
        };
        const adjustedResult = calculateLoan(adjustedInputs);
        return adjustedResult;
      } else {
        // If paid monthly (non-capitalized), we add the monthly premium to each payment in schedule
        const monthlyInsurance = annualInsuranceCost / 12;
        const adjustedSchedule = result.schedule.map((row) => ({
          ...row,
          monthlyPayment: row.monthlyPayment + monthlyInsurance,
          insurancePaid: monthlyInsurance,
        }));
        
        const adjustedSummary = {
          ...result.summary,
          averageMonthlyPayment: result.summary.averageMonthlyPayment + monthlyInsurance,
          totalOutofPocket: result.summary.totalOutofPocket + (annualInsuranceCost * (inputs.termMonths / 12)),
          totalCreditCost: result.summary.totalCreditCost + (annualInsuranceCost * (inputs.termMonths / 12)),
        };

        return {
          ...result,
          schedule: adjustedSchedule,
          summary: adjustedSummary,
        };
      }
    }

    return result;
  }, [inputs, manualInsurancePremium, capitalizeInsurance]);

  const { summary, schedule, errors } = calculationResult;

  const estimatedCatValue = useMemo(() => {
    return estimateCat(inputs, summary);
  }, [inputs, summary]);

  // Load a saved simulation
  const handleLoadSaved = (saved: any) => {
    setInputs({
      ...inputs,
      brand: saved.brand,
      modelName: saved.modelName,
      vehiclePrice: saved.vehiclePrice,
      discount: saved.discount,
      downPaymentPercent: saved.downPaymentPercent,
      interestRate: saved.interestRate,
      termMonths: saved.termMonths,
    });
  };

  const handleExportPDF = () => {
    exportToPDF(inputs, summary, schedule, estimatedCatValue);
  };

  const handleExportExcel = () => {
    exportToExcel(inputs, summary, schedule, estimatedCatValue);
  };

  const resetToDefault = () => {
    setInputs(DEFAULT_INPUTS);
    setManualInsurancePremium(12500);
    setCapitalizeInsurance(false);
  };

  // Check if inputs are valid for calculations
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="app-root">
      {/* Top Banner Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* --- Export and Action Bar --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm" id="action-bar">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-teal-500 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Simulador Activo</span>
              <h2 className="text-sm font-bold text-slate-800">
                {inputs.brand && inputs.modelName ? `${inputs.brand} ${inputs.modelName}` : 'Auto Nuevo'}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Reset button */}
            <button
              onClick={resetToDefault}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Restaurar parámetros estándar"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Valores Iniciales</span>
            </button>

            {/* Export PDF */}
            <button
              onClick={handleExportPDF}
              disabled={hasErrors}
              className="px-4 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm border border-slate-800"
            >
              <FileDown className="h-3.5 w-3.5 text-teal-400" />
              <span>Exportar PDF</span>
            </button>

            {/* Export Excel / CSV */}
            <button
              onClick={handleExportExcel}
              disabled={hasErrors}
              className="px-4 py-2 text-xs font-bold bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-40 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm border border-teal-700"
            >
              <Download className="h-3.5 w-3.5 text-teal-100" />
              <span>Exportar Excel (CSV)</span>
            </button>
          </div>
        </div>

        {/* --- Primary Dashboard Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="dashboard-layout">
          {/* Left Column: Form & Saved Simulators (col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <LoanForm
              inputs={inputs}
              onChange={setInputs}
              errors={errors}
            />

            <SavedCalculations
              currentInputs={inputs}
              onLoad={handleLoadSaved}
            />
          </div>

          {/* Right Column: Central Results, Charts & Table (col-span-8) */}
          <div className="lg:col-span-8 space-y-8">
            {hasErrors ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-2">
                <p className="text-sm font-bold text-red-800">Hay un error en los parámetros del crédito.</p>
                <p className="text-xs text-red-600">Por favor, corrija los campos resaltados en el panel de control a la izquierda para poder calcular de forma precisa.</p>
              </div>
            ) : (
              <>
                {/* 1. Primary Highlight Results Cards */}
                <SummaryCards
                  summary={summary}
                  cat={estimatedCatValue}
                  brand={inputs.brand}
                  modelName={inputs.modelName}
                />

                {/* 2. Graphical Analytics */}
                <ChartsSection
                  summary={summary}
                  schedule={schedule}
                  includeIvaOnInterest={inputs.includeIvaOnInterest}
                />

                {/* 3. Insurance Roadmap and Integration */}
                <InsurancePlaceholder
                  manualInsurancePremium={manualInsurancePremium}
                  onInsuranceChange={setManualInsurancePremium}
                  capitalizeInsurance={capitalizeInsurance}
                  onCapitalizeChange={setCapitalizeInsurance}
                />

                {/* 4. Amortization Table */}
                <AmortizationTable
                  schedule={schedule}
                  includeIvaOnInterest={inputs.includeIvaOnInterest}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Decorative localized footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-8 mt-auto text-xs" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col space-y-2 text-left">
            <span className="text-white font-bold tracking-wide uppercase">
              CÁLCULO DE CRÉDITO AUTOMOTRIZ LOCALIZADO
            </span>
            <p className="max-w-xl text-slate-400 leading-relaxed">
              Amortización francesa que cumple con la normatividad del Banco de México para créditos de automóviles con tasa de interés fija.
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              © {new Date().getFullYear()} Dantemx5. Todos los derechos reservados. Desarrollado de manera independiente.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
            <button
              onClick={() => setIsDisclaimerOpen(true)}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 px-3.5 py-2 rounded-lg font-bold transition-all border border-slate-700/60 flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Aviso Legal / Disclaimer</span>
            </button>
            <div className="flex items-center space-x-1.5 bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800">
              <Landmark className="h-4 w-4 text-teal-400" />
              <span className="text-[10px] text-slate-400 font-semibold font-mono uppercase">TASA ANUAL FIJA ORDINARIA</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms & Conditions Popup Disclaimer */}
      <DisclaimerModal 
        isOpen={isDisclaimerOpen} 
        onClose={handleCloseDisclaimer} 
      />
    </div>
  );
}
