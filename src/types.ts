/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LoanInputs {
  brand: string;
  modelName: string;
  vehiclePrice: number; // Valor factura
  discount: number; // Descuento
  downPaymentPercent: number; // Enganche % (0 to 100)
  interestRate: number; // Tasa de interés anual % (>= 0)
  termMonths: number; // Plazo en meses (12 - 72)
  openingCommissionPercent: number; // Comisión por apertura %
  openingCommissionFlat: number; // Comisión por apertura fija (monto plano)
  commissionType: 'percent' | 'flat';
  includeIvaOnInterest: boolean; // IVA de 16% sobre intereses (estándar en México)
  capitalizeCommission: boolean; // Si la comisión se suma al crédito o se paga al inicio
}

export interface AmortizationRow {
  paymentNumber: number;
  initialBalance: number;
  monthlyPayment: number; // Payment for this month (Principal + Interest + IVA)
  interestPaid: number;
  ivaOnInterest: number;
  principalPaid: number;
  finalBalance: number;
  insurancePaid?: number; // Seguro pagado mensualmente
}

export interface LoanSummary {
  netVehiclePrice: number; // Valor factura - Descuento
  downPaymentAmount: number;
  amountToFinance: number; // Net price - Down payment (plus commission if capitalized)
  openingCommissionAmount: number;
  totalInterestPaid: number;
  totalIvaPaid: number;
  totalPaymentsSum: number; // Sum of all monthly payments (Principal + Interest + IVA)
  totalOutofPocket: number; // Total payments sum + Down payment + Upfront commission (if not capitalized)
  totalCreditCost: number; // Total payments sum + Opening Commission - Amount to Finance (the pure cost of financing)
  averageMonthlyPayment: number;
}

export interface SavedCalculation {
  id: string;
  brand: string;
  modelName: string;
  vehiclePrice: number;
  discount: number;
  downPaymentPercent: number;
  interestRate: number;
  termMonths: number;
  timestamp: number;
}
