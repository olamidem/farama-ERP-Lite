import { useState } from "react";
import type { PaymentMethod, PaymentDetails, SplitPaymentDetail } from "../types/payment";
import { calculateChangeDue } from "../utils/calculations";

export function usePayments() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [splitPayments, setSplitPayments] = useState<SplitPaymentDetail[]>([]);

  const calculateChange = (payableAmount: number) => {
    return calculateChangeDue(cashTendered, payableAmount);
  };

  const resetPaymentState = () => {
    setCashTendered(0);
    setReferenceNumber("");
    setSplitPayments([]);
  };

  const buildPaymentDetails = (payableAmount: number): PaymentDetails => {
    const received = paymentMethod === "CASH" ? cashTendered : payableAmount;
    return {
      method: paymentMethod,
      amountPaid: Math.min(received, payableAmount),
      receivedAmount: received,
      changeDue: paymentMethod === "CASH" ? calculateChange(payableAmount) : 0,
      reference: referenceNumber || undefined,
      splitPayments: paymentMethod === "SPLIT" ? splitPayments : undefined,
    };
  };

  return {
    paymentMethod,
    setPaymentMethod,
    cashTendered,
    setCashTendered,
    referenceNumber,
    setReferenceNumber,
    splitPayments,
    setSplitPayments,
    calculateChange,
    resetPaymentState,
    buildPaymentDetails,
  };
}
