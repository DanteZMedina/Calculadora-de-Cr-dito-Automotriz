import React, { useEffect, useState } from 'react';
import { ShieldAlert, X, Copyright } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DisclaimerModal({ isOpen, onClose }: DisclaimerModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" id="disclaimer-modal-overlay">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        id="disclaimer-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center space-x-2.5 text-amber-600">
            <ShieldAlert className="h-5.5 w-5.5" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Aviso Legal / Disclaimer
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-600 font-normal">
          <p className="font-semibold text-slate-800 text-sm">
            La presente aplicación tiene como único propósito proporcionar estimaciones y simulaciones informativas relacionadas con créditos automotrices.
          </p>
          <p>
            Los resultados mostrados, incluyendo pagos mensuales, tasas de interés, montos financiados, enganches, plazos, comisiones, seguros y cualquier otro cálculo, son aproximados y se generan con base en la información proporcionada por el usuario y en parámetros de referencia.
          </p>
          <p>
            Los resultados obtenidos no constituyen una oferta de crédito, aprobación de financiamiento, cotización oficial, asesoría financiera, legal o fiscal, ni representan condiciones contractuales definitivas.
          </p>
          <p>
            Las condiciones reales de financiamiento pueden variar significativamente dependiendo de factores como la institución financiera, agencia automotriz, historial crediticio del solicitante, promociones vigentes, ubicación geográfica, comisiones aplicables, seguros obligatorios, impuestos y otros criterios de evaluación.
          </p>
          <p className="border-l-2 border-amber-400 pl-3 bg-amber-50/40 py-2.5 rounded-r-lg font-medium text-slate-700">
            El desarrollador y propietario de esta aplicación no garantiza la exactitud, disponibilidad, integridad o actualización de la información presentada y no asume responsabilidad alguna por pérdidas, daños, perjuicios, decisiones financieras o cualquier consecuencia derivada del uso, interpretación o confianza depositada en los resultados generados por la aplicación.
          </p>
          <p>
            Los usuarios son responsables de verificar toda la información directamente con la agencia automotriz, distribuidor autorizado, institución financiera o entidad correspondiente antes de tomar cualquier decisión de compra o contratación de un crédito.
          </p>
          <p>
            Esta aplicación es una herramienta independiente y no está afiliada, asociada, respaldada, patrocinada ni representa a ninguna marca automotriz, agencia, concesionario, institución bancaria, financiera o entidad gubernamental, salvo que se indique expresamente lo contrario.
          </p>
          <p className="font-semibold text-slate-800">
            El uso de esta aplicación implica la aceptación de los presentes términos y el reconocimiento de que toda la información mostrada tiene fines exclusivamente informativos y orientativos.
          </p>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <div className="flex items-center space-x-1">
              <Copyright className="h-3 w-3" />
              <span>Derechos de Autor Reservados</span>
            </div>
            <span>v1.0.0</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-sm"
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
