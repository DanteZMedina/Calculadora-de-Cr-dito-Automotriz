/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LoanInputs, AmortizationRow, LoanSummary } from '../types';

/**
 * Calculates the car loan amortization table and summary statistics.
 */
export function calculateLoan(inputs: LoanInputs): {
  summary: LoanSummary;
  schedule: AmortizationRow[];
  errors: { [key: string]: string };
} {
  const errors: { [key: string]: string } = {};

  // 1. Validation Constraints
  if (!inputs.vehiclePrice || inputs.vehiclePrice <= 0) {
    errors.vehiclePrice = 'El valor factura del vehículo debe ser mayor a $0.';
  }

  if (inputs.discount < 0) {
    errors.discount = 'El descuento no puede ser menor a $0.';
  }

  const netVehiclePrice = Math.max(0, (inputs.vehiclePrice || 0) - (inputs.discount || 0));
  if (inputs.vehiclePrice && inputs.discount >= inputs.vehiclePrice) {
    errors.discount = 'El descuento no puede ser mayor o igual al precio del vehículo.';
  }

  if (inputs.downPaymentPercent < 0 || inputs.downPaymentPercent > 100) {
    errors.downPaymentPercent = 'El porcentaje de enganche debe estar entre 0% y 100%.';
  }

  if (inputs.interestRate < 0) {
    errors.interestRate = 'La tasa de interés no puede ser menor al 0%.';
  }

  if (!inputs.termMonths || inputs.termMonths < 12 || inputs.termMonths > 72) {
    errors.termMonths = 'El plazo debe ser de entre 12 y 72 meses.';
  }

  // If there are fatal input errors, return empty calculation with errors
  if (Object.keys(errors).length > 0) {
    return {
      summary: {
        netVehiclePrice: Math.max(0, inputs.vehiclePrice - inputs.discount),
        downPaymentAmount: 0,
        amountToFinance: 0,
        openingCommissionAmount: 0,
        totalInterestPaid: 0,
        totalIvaPaid: 0,
        totalPaymentsSum: 0,
        totalOutofPocket: 0,
        totalCreditCost: 0,
        averageMonthlyPayment: 0,
      },
      schedule: [],
      errors,
    };
  }

  // 2. Financial Calculations
  const downPaymentAmount = (netVehiclePrice * inputs.downPaymentPercent) / 100;
  let baseAmountToFinance = netVehiclePrice - downPaymentAmount;

  // Calculate opening commission
  let openingCommissionAmount = 0;
  if (inputs.commissionType === 'percent') {
    // Opening commission is typically calculated on the amount to finance
    openingCommissionAmount = (baseAmountToFinance * inputs.openingCommissionPercent) / 100;
  } else {
    openingCommissionAmount = inputs.openingCommissionFlat;
  }
  openingCommissionAmount = Math.max(0, openingCommissionAmount);

  // Capitalize commission or pay upfront
  const amountToFinance = inputs.capitalizeCommission
    ? baseAmountToFinance + openingCommissionAmount
    : baseAmountToFinance;

  const schedule: AmortizationRow[] = [];
  let totalInterestPaid = 0;
  let totalIvaPaid = 0;
  let totalPaymentsSum = 0;

  if (amountToFinance > 0) {
    const annualRate = inputs.interestRate / 100;
    const monthlyRate = annualRate / 12;
    const ivaRate = 0.16; // Mexican VAT rate

    // If we have standard fixed total payment (including IVA on interest):
    // Effective monthly rate including tax is monthlyRate * (1 + ivaRate) if we include IVA
    const effectiveMonthlyRate = inputs.includeIvaOnInterest
      ? monthlyRate * (1 + ivaRate)
      : monthlyRate;

    const term = inputs.termMonths;

    let monthlyPayment = 0;
    if (effectiveMonthlyRate > 0) {
      monthlyPayment =
        (amountToFinance * (effectiveMonthlyRate * Math.pow(1 + effectiveMonthlyRate, term))) /
        (Math.pow(1 + effectiveMonthlyRate, term) - 1);
    } else {
      monthlyPayment = amountToFinance / term;
    }

    let remainingBalance = amountToFinance;

    for (let month = 1; month <= term; month++) {
      // Calculate interest for this month
      const interestPaid = remainingBalance * monthlyRate;
      const ivaOnInterest = inputs.includeIvaOnInterest ? interestPaid * ivaRate : 0;
      
      // The total cost of the payment is constant if we used the effective rate
      // or if rate is 0, it's just amountToFinance / term.
      // If we did not include IVA, the monthlyPayment is Principal + Interest.
      // Let's make sure the amortization matches the calculated payment.
      let principalPaid = 0;
      let actualPayment = monthlyPayment;

      if (effectiveMonthlyRate > 0) {
        // If we include IVA, the fixed payment M includes interest + iva on interest
        // So principal = M - (interest + iva)
        principalPaid = monthlyPayment - (interestPaid + ivaOnInterest);
      } else {
        principalPaid = monthlyPayment;
      }

      // Handle floating point errors in the last month
      if (month === term || principalPaid > remainingBalance) {
        principalPaid = remainingBalance;
        // Adjust the last payment to perfectly match the remaining balance
        actualPayment = principalPaid + interestPaid + ivaOnInterest;
      }

      const finalBalance = Math.max(0, remainingBalance - principalPaid);

      schedule.push({
        paymentNumber: month,
        initialBalance: remainingBalance,
        monthlyPayment: actualPayment,
        interestPaid,
        ivaOnInterest,
        principalPaid,
        finalBalance,
      });

      totalInterestPaid += interestPaid;
      totalIvaPaid += ivaOnInterest;
      totalPaymentsSum += actualPayment;

      remainingBalance = finalBalance;
    }
  }

  // Total out of pocket:
  // Down payment + sum of all monthly payments + opening commission (if paid upfront)
  const totalOutofPocket =
    downPaymentAmount +
    totalPaymentsSum +
    (inputs.capitalizeCommission ? 0 : openingCommissionAmount);

  // Pure cost of credit = Total payments sum + Opening Commission (if upfront) - Net price of car
  // (Which is essentially: Total Interest + Total IVA + Opening Commission)
  const totalCreditCost = Math.max(
    0,
    totalInterestPaid + totalIvaPaid + openingCommissionAmount
  );

  const averageMonthlyPayment = inputs.termMonths > 0 ? totalPaymentsSum / inputs.termMonths : 0;

  return {
    summary: {
      netVehiclePrice,
      downPaymentAmount,
      amountToFinance,
      openingCommissionAmount,
      totalInterestPaid,
      totalIvaPaid,
      totalPaymentsSum,
      totalOutofPocket,
      totalCreditCost,
      averageMonthlyPayment,
    },
    schedule,
    errors,
  };
}

/**
 * Calculates CAT (Costo Anual Total) estimated.
 * In Mexico, CAT is the internal rate of return (IRR) annualized, taking into account
 * all costs (opening commission, interests, IVA, etc.) relative to the net credit received.
 * Net credit received = Net car price - Down payment.
 * Outflows = Monthly payments, and opening commission if paid upfront.
 */
export function estimateCat(inputs: LoanInputs, summary: LoanSummary): number {
  const netCreditReceived = summary.netVehiclePrice - summary.downPaymentAmount;
  if (netCreditReceived <= 0 || inputs.termMonths <= 0) return 0;

  // We need to find the monthly rate 'r' that equates:
  // Net credit received = Opening Commission (if paid upfront, meaning we receive less) + Sum of PMT / (1+r)^t
  // Alternatively: Net credit received - Upfront Commission = Sum of PMT / (1+r)^t
  // Let's use simple Newton-Raphson to solve for the monthly IRR
  const initialValue = netCreditReceived - (inputs.capitalizeCommission ? 0 : summary.openingCommissionAmount);
  const pmts = Array(inputs.termMonths).fill(0);
  
  // Since we assume fixed payments:
  const pmt = summary.totalPaymentsSum / inputs.termMonths;

  // Solve: f(r) = -initialValue + sum_{t=1}^N pmt / (1+r)^t = 0
  // Let's approximate the monthly rate
  let r = inputs.interestRate / 100 / 12; // initial guess
  if (r <= 0) r = 0.01;

  for (let iteration = 0; iteration < 100; iteration++) {
    let f = -initialValue;
    let df = 0;
    
    for (let t = 1; t <= inputs.termMonths; t++) {
      const discountFactor = Math.pow(1 + r, t);
      f += pmt / discountFactor;
      df -= (t * pmt) / (discountFactor * (1 + r));
    }

    if (Math.abs(f) < 1e-6) break;
    if (df === 0) break;
    
    r = r - f / df;
    if (r < -0.99) r = -0.99; // avoid division by zero/negatives
  }

  // Annualized CAT formula in Mexico: CAT = ((1 + r)^12 - 1) * 100
  const cat = (Math.pow(1 + r, 12) - 1) * 100;
  return isNaN(cat) || cat < 0 ? 0 : cat;
}
