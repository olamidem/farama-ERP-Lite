import type { CreateSaleInput, Sale } from "../../types";

export interface ProcessPaymentInput {
  sale: Sale;
  payload: CreateSaleInput;
}

export async function processPayment({
  sale,
  payload,
}: ProcessPaymentInput): Promise<void> {
  switch (payload.payment_method) {
    case "CASH":
      await processCashPayment(sale, payload);
      break;

    case "POS":
      await processPOSPayment(sale, payload);
      break;

    case "TRANSFER":
      await processTransferPayment(sale, payload);
      break;

    case "WALLET":
      await processWalletPayment(sale, payload);
      break;

    case "SPLIT":
      await processSplitPayment(sale, payload);
      break;

    case "DEPOSIT":
      await processDepositPayment(sale, payload);
      break;

    default:
      throw new Error("Unsupported payment method.");
  }

  await createOutstandingBalance(sale, payload);
}

async function processCashPayment(
  sale: Sale,
  payload: CreateSaleInput
) {
  if (
    (payload.amount_paid ?? 0) <= 0
  ) {
    throw new Error("Cash payment amount is required.");
  }
}

async function processPOSPayment(
  sale: Sale,
  payload: CreateSaleInput
) {
  if (
    (payload.amount_paid ?? 0) <= 0
  ) {
    throw new Error("POS payment amount is required.");
  }
}

async function processTransferPayment(
  sale: Sale,
  payload: CreateSaleInput
) {
  if (
    (payload.amount_paid ?? 0) <= 0
  ) {
    throw new Error("Transfer amount is required.");
  }
}

async function processWalletPayment(
  sale: Sale,
  payload: CreateSaleInput
) {
  if (!sale.customer_id) {
    throw new Error(
      "Wallet payment requires a customer."
    );
  }

  await payWithWallet({
    customer_id: sale.customer_id,
    amount: sale.payable_amount,
    sale_id: sale.id,
    reference: sale.sale_number,
    notes: `POS Sale ${sale.sale_number}`,
    performed_by:
      sale.created_by ?? undefined,
  });
}

async function processDepositPayment(
  sale: Sale,
  payload: CreateSaleInput
) {
  if (!sale.customer_id) return;

  const paid =
    payload.amount_paid ?? 0;

  if (paid <= sale.payable_amount)
    return;

  const excess =
    paid - sale.payable_amount;

  await depositToWallet({
    customer_id: sale.customer_id,
    amount: excess,
    payment_method:
      payload.payment_method,
    notes:
      "Excess payment deposited into wallet",
    reference: sale.sale_number,
    performed_by:
      sale.created_by ?? undefined,
  });
}

async function processSplitPayment(
  sale: Sale,
  payload: CreateSaleInput
) {
  if (!payload.amount_paid) {
    throw new Error(
      "Split payment requires payment amount."
    );
  }
}
async function createOutstandingBalance(
  sale: Sale,
  payload: CreateSaleInput
) {
  if (!sale.customer_id) return;

  const paid =
    payload.amount_paid ??
    sale.payable_amount;

  const outstanding =
    sale.payable_amount - paid;

  if (outstanding <= 0) return;

  /*
   * Phase 2
   *
   * We'll move this to
   * customer-account.service.ts
   */

  console.log(
    "Outstanding balance:",
    outstanding
  );
}
