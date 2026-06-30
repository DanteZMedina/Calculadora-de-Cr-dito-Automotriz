/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LoanInputs, LoanSummary, AmortizationRow } from '../types';

export const formatMXN = (val: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const formatPercent = (val: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val / 100);
};

/**
 * Exports the amortization table and loan summary to PDF.
 */
export function exportToPDF(
  inputs: LoanInputs,
  summary: LoanSummary,
  schedule: AmortizationRow[],
  cat: number
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const carName = `${inputs.brand} ${inputs.modelName}`.trim() || 'Vehículo';

  // --- Theme Colors ---
  const primaryColor = [15, 23, 42]; // Slate 900
  const accentColor = [13, 148, 136]; // Teal 600
  const grayColor = [100, 116, 139]; // Slate 500

  // --- Header ---
  doc.setFillColor(15, 23, 42); // Slate 900 background for top header banner
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('COTIZACIÓN DE CRÉDITO AUTOMOTRIZ', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Calculadora de Crédito Automotriz para México', 15, 26);

  const dateStr = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.setFontSize(9);
  doc.text(`Fecha de emisión: ${dateStr}`, 130, 26);

  // --- Section 1: Vehicle & Loan Specifications ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Especificaciones del Crédito', 15, 48);

  // Draw separator line
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(15, 51, 195, 51);

  // Specifications Details (Two-column layout)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Column 1
  let y = 58;
  const col1X = 15;
  const col2X = 110;
  const spacing = 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Vehículo:', col1X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(carName, col1X + 45, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Valor Factura:', col1X, y + spacing);
  doc.setFont('helvetica', 'normal');
  doc.text(formatMXN(inputs.vehiclePrice), col1X + 45, y + spacing);

  doc.setFont('helvetica', 'bold');
  doc.text('Descuento de Oferta:', col1X, y + spacing * 2);
  doc.setFont('helvetica', 'normal');
  doc.text(formatMXN(inputs.discount), col1X + 45, y + spacing * 2);

  doc.setFont('helvetica', 'bold');
  doc.text('Precio Neto:', col1X, y + spacing * 3);
  doc.setFont('helvetica', 'normal');
  doc.text(formatMXN(summary.netVehiclePrice), col1X + 45, y + spacing * 3);

  doc.setFont('helvetica', 'bold');
  doc.text('Enganche:', col1X, y + spacing * 4);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatMXN(summary.downPaymentAmount)} (${formatPercent(inputs.downPaymentPercent)})`, col1X + 45, y + spacing * 4);

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.text('Tasa de Interés Anual:', col2X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatPercent(inputs.interestRate), col2X + 48, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Plazo del Crédito:', col2X, y + spacing);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inputs.termMonths} meses`, col2X + 48, y + spacing);

  doc.setFont('helvetica', 'bold');
  doc.text('Monto a Financiar:', col2X, y + spacing * 2);
  doc.setFont('helvetica', 'normal');
  doc.text(formatMXN(summary.amountToFinance), col2X + 48, y + spacing * 2);

  doc.setFont('helvetica', 'bold');
  doc.text('Comisión por Apertura:', col2X, y + spacing * 3);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatMXN(summary.openingCommissionAmount)} (${inputs.commissionType === 'percent' ? `${inputs.openingCommissionPercent}%` : 'Fija'})`, col2X + 48, y + spacing * 3);

  doc.setFont('helvetica', 'bold');
  doc.text('Costo Anual Total (CAT):', col2X, y + spacing * 4);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatPercent(cat)} (Estimado)`, col2X + 48, y + spacing * 4);

  // --- Section 2: Summary of Totals ---
  y = y + spacing * 5 + 5;
  doc.setFillColor(248, 250, 252); // Slate 50 background for Summary
  doc.rect(15, y, 180, 28, 'F');
  doc.setDrawColor(203, 213, 225); // Slate 300 border
  doc.rect(15, y, 180, 28, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);

  const cardY = y + 7;
  // Let's create a beautiful clean summary grid
  doc.text('MENSUALIDAD PROMEDIO', 20, cardY);
  doc.setFontSize(14);
  doc.setTextColor(13, 148, 136); // Teal 600
  doc.text(formatMXN(summary.averageMonthlyPayment), 20, cardY + 7);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('COSTO TOTAL DEL CRÉDITO', 85, cardY);
  doc.setFontSize(14);
  doc.setTextColor(225, 29, 72); // Rose 600 for credit costs
  doc.text(formatMXN(summary.totalCreditCost), 85, cardY + 7);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('PAGO TOTAL DEL CRÉDITO', 145, cardY);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(formatMXN(summary.totalPaymentsSum), 145, cardY + 7);

  // Add details about IVA below the summary box
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `* Cálculos incluyen IVA del 16% sobre intereses: ${inputs.includeIvaOnInterest ? 'Sí' : 'No'}. Comisión por apertura: ${inputs.capitalizeCommission ? 'Financiada' : 'Pagada al inicio'}.`,
    15,
    y + 34
  );

  // --- Section 3: Amortization Table ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Tabla de Amortización', 15, y + 44);

  const hasInsuranceColumn = schedule.some((row) => row.insurancePaid && row.insurancePaid > 0);

  // Build body array for autotable
  const tableData = schedule.map((row) => [
    row.paymentNumber.toString(),
    formatMXN(row.initialBalance),
    formatMXN(row.monthlyPayment),
    formatMXN(row.interestPaid),
    inputs.includeIvaOnInterest ? formatMXN(row.ivaOnInterest) : '$0.00',
    ...(hasInsuranceColumn ? [formatMXN(row.insurancePaid || 0)] : []),
    formatMXN(row.principalPaid),
    formatMXN(row.finalBalance),
  ]);

  // Headers
  const tableHeaders = [
    [
      'No.', 
      'Saldo Inicial', 
      'Pago Mensual', 
      'Interés', 
      'IVA s/ Int.', 
      ...(hasInsuranceColumn ? ['Seguro'] : []), 
      'Abono Capital', 
      'Saldo Final'
    ],
  ];

  autoTable(doc, {
    startY: y + 47,
    head: tableHeaders,
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'right',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 }, // Payment number
      1: { halign: 'right' },
      2: { halign: 'right', fontStyle: 'bold' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      ...(hasInsuranceColumn
        ? {
            5: { halign: 'right' },
            6: { halign: 'right' },
            7: { halign: 'right' },
          }
        : {
            5: { halign: 'right' },
            6: { halign: 'right' },
          }),
    },
    bodyStyles: {
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 15, right: 15 },
  });

  // Footer / Disclaimer
  const finalY = (doc as any).lastAutoTable.finalY || 250;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(
    'Este documento es una simulación informativa de crédito automotriz y no representa un compromiso de financiamiento formal.',
    15,
    Math.min(285, finalY + 10)
  );
  doc.text(
    'Sujeto a aprobación de crédito y variaciones según la institución financiera de su elección.',
    15,
    Math.min(289, finalY + 10)
  );

  // Save the document
  const fileName = `Cotizacion_${inputs.brand || ''}_${inputs.modelName || 'Auto'}_México.pdf`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_.-]/g, '');
  doc.save(fileName);
}

/**
 * Exports the amortization table to a clean CSV compatible with Excel,
 * incorporating UTF-8 BOM so Spanish accent characters render correctly.
 */
export function exportToExcel(
  inputs: LoanInputs,
  summary: LoanSummary,
  schedule: AmortizationRow[],
  cat: number
) {
  const carName = `${inputs.brand} ${inputs.modelName}`.trim() || 'Vehículo';
  
  const hasInsuranceColumn = schedule.some((row) => row.insurancePaid && row.insurancePaid > 0);

  // Create rows for the CSV
  const rows: string[][] = [
    ['SIMULACIÓN DE CRÉDITO AUTOMOTRIZ PARA MÉXICO'],
    ['Generado el', new Date().toLocaleString('es-MX')],
    [''],
    ['ESPECIFICACIONES DEL VEHÍCULO Y DEL CRÉDITO'],
    ['Marca y Modelo', carName],
    ['Valor Factura del VEHÍCULO', (summary.netVehiclePrice + inputs.discount).toFixed(2)],
    ['Descuento Aplicado', inputs.discount.toFixed(2)],
    ['Precio Neto del Vehículo', summary.netVehiclePrice.toFixed(2)],
    ['Enganche Porcentaje', inputs.downPaymentPercent + '%'],
    ['Enganche Monto', summary.downPaymentAmount.toFixed(2)],
    ['Monto Neto a Financiar', summary.amountToFinance.toFixed(2)],
    ['Comisión por Apertura', summary.openingCommissionAmount.toFixed(2)],
    ['Tasa de Interés Anual', inputs.interestRate + '%'],
    ['Plazo (Meses)', inputs.termMonths + ''],
    ['CAT Estimado (Costo Anual Total)', cat.toFixed(2) + '%'],
    ['IVA en Intereses (16%)', inputs.includeIvaOnInterest ? 'Sí' : 'No'],
    ['Comisión por Apertura Capitalizada', inputs.capitalizeCommission ? 'Sí' : 'No'],
    [''],
    ['RESUMEN DE TOTALES'],
    ['Mensualidad Promedio', summary.averageMonthlyPayment.toFixed(2)],
    ['Total de Intereses Pagados', summary.totalInterestPaid.toFixed(2)],
    ['Total de IVA sobre Intereses', summary.totalIvaPaid.toFixed(2)],
    ['Suma de Pagos Mensuales', summary.totalPaymentsSum.toFixed(2)],
    ['Monto Total Pagado (Desembolso Real)', summary.totalOutofPocket.toFixed(2)],
    ['Costo Puro del Crédito', summary.totalCreditCost.toFixed(2)],
    [''],
    ['TABLA DE AMORTIZACIÓN DETALLADA'],
    [
      'Número de Pago',
      'Saldo Inicial (MXN)',
      'Pago Mensual (MXN)',
      'Interés Pagado (MXN)',
      'IVA sobre Interés (MXN)',
      ...(hasInsuranceColumn ? ['Seguro Mensual (MXN)'] : []),
      'Abono a Capital (MXN)',
      'Saldo Final (MXN)',
    ],
  ];

  // Append amortization rows
  schedule.forEach((row) => {
    rows.push([
      row.paymentNumber.toString(),
      row.initialBalance.toFixed(2),
      row.monthlyPayment.toFixed(2),
      row.interestPaid.toFixed(2),
      row.ivaOnInterest.toFixed(2),
      ...(hasInsuranceColumn ? [(row.insurancePaid || 0).toFixed(2)] : []),
      row.principalPaid.toFixed(2),
      row.finalBalance.toFixed(2),
    ]);
  });

  // Convert array to CSV string
  // Use semicolon (;) as separator since Excel in many Spanish systems expects it,
  // or standard comma (,) but escaping cell content correctly.
  // We'll use commas but wrap text values in quotes for standard safety.
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          const formatted = cell ? cell.replace(/"/g, '""') : '';
          return `"${formatted}"`;
        })
        .join(',')
    )
    .join('\n');

  // Prefix with UTF-8 BOM (\uFEFF) so Excel opens it with the correct text encoding
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const fileName = `Simulacion_Credito_${inputs.brand || ''}_${inputs.modelName || 'Auto'}.csv`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_.-]/g, '');

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
