import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ReceiptSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  rcNumber: string;
  logoUrl?: string;
  socialHandle?: string;
  footerText: string;
  autoPrint: boolean;
  paperWidth: "80mm" | "58mm";
}

interface ReceiptStoreState {
  settings: ReceiptSettings;
  printedSaleIds: Record<string, boolean>;
  updateSettings: (newSettings: Partial<ReceiptSettings>) => void;
  markSaleAsPrinted: (saleId: string) => void;
  isSalePrinted: (saleId: string) => boolean;
}

const DEFAULT_SETTINGS: ReceiptSettings = {
  storeName: "FARAMA STORE",
  storeAddress: "12, Garki Road, Area 11, Abuja",
  storePhone: "+234 803 123 4567",
  rcNumber: "RC: 938472-A",
  socialHandle: "@faramastore",
  logoUrl: "",
  footerText: "Thank you for shopping with us! Please keep this receipt for return/refund reference.",
  autoPrint: false,
  paperWidth: "80mm",
};

export const useReceiptStore = create<ReceiptStoreState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      printedSaleIds: {},
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      markSaleAsPrinted: (saleId) =>
        set((state) => ({
          printedSaleIds: { ...state.printedSaleIds, [saleId]: true },
        })),
      isSalePrinted: (saleId) => !!get().printedSaleIds[saleId],
    }),
    {
      name: "farama_receipt_settings",
    }
  )
);
