import z from "zod";

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  remarks: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});
export type CustomerFormInput = z.infer<typeof customerSchema>;


export const depositSchema = z.object({
  wallet_id: z.string().uuid("Wallet ID is required"),
  amount: z.number().positive("Deposit amount must be greater than 0"),
  payment_method: z.enum([
    "CASH",
    "BANK_TRANSFER",
    "CARD",
    "WALLET",
    "SYSTEM",
  ]),
  notes: z.string().trim().optional().or(z.literal("")),
  reference: z.string().trim().optional().or(z.literal("")),
  performed_by: z.string().trim().optional(),
});
export type DepositFormInput = z.infer<typeof depositSchema>;


export const withdrawalSchema = z.object({
  wallet_id: z.string().uuid("Wallet ID is required"),
  amount: z.number().positive("Withdrawal amount must be greater than 0"),
  payment_method: z.enum([
    "CASH",
    "BANK_TRANSFER",
    "CARD",
    "WALLET",
    "SYSTEM",
  ]),
  notes: z.string().trim().optional().or(z.literal("")),
  reference: z.string().trim().optional().or(z.literal("")),
  performed_by: z.string().trim().optional(),
});
export type WithdrawalFormInput = z.infer<typeof withdrawalSchema>;


export const topUpSchema = z.object({
  type: z.enum(["TOP_UP", "PAYMENT", "DEBIT"]),
  amount: z.number().positive("Amount must be greater than 0"),
  remarks: z.string().optional(),
});
export type TopUpFormInput = z.infer<typeof topUpSchema>;



export const salePaymentSchema = z.object({
  wallet_id: z.string().uuid(),
  sale_id: z.string().uuid().optional(),
  amount: z.number().positive(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  performed_by: z.string().optional(),
});

export type SalePaymentFormInput = z.infer<typeof salePaymentSchema>;


export const refundSchema = z.object({
  wallet_id: z.string().uuid(),
  sale_id: z.string().uuid().optional(),
  amount: z.number().positive(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  performed_by: z.string().optional(),
});

export type RefundFormInput = z.infer<typeof refundSchema>;

/* -------------------------------------------------------------------------- */
/* Wallet Adjustment */
/* -------------------------------------------------------------------------- */

export const walletAdjustmentSchema = z.object({
  wallet_id: z.string().uuid(),
  amount: z.number().positive(),
  direction: z.enum(["CREDIT", "DEBIT"]),
  notes: z
    .string()
    .trim()
    .min(3, "Adjustment reason is required"),
  performed_by: z.string().optional(),
});

export type WalletAdjustmentFormInput = z.infer<
  typeof walletAdjustmentSchema
>;


export const statementFilterSchema = z.object({
  wallet_id: z.string().uuid(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  typeFilter: z
    .enum([
      "ALL",
      "DEPOSIT",
      "WITHDRAWAL",
      "SALE_PAYMENT",
      "REFUND",
      "ADJUSTMENT",
      "TRANSFER_IN",
      "TRANSFER_OUT",
    ])
    .optional(),
});

export type StatementFilterInput = z.infer<
  typeof statementFilterSchema
>;


export const transferSchema = z.object({
  recipient_id: z.string().min(1, "Please select a recipient customer"),
  amount: z.number().gt(0, "Transfer amount must be greater than 0"),
  notes: z.string().trim().optional().or(z.string().length(0)),
});

export type TransferFormInput = z.infer<typeof transferSchema>;