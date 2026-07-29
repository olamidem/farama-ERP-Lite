export const QUERY_KEYS = {
  products: ["products"],
  categories: ["categories"],
  sales: ["sales"],
  users: ["users"],
  suppliers: ["suppliers"],
  units: ["units"],
  productUnits: ["product-units"],
  inventory: ["inventory"],
  purchases: ["purchases"],
  purchase: (id: string) => ["purchase", id],
   stockMovements: ["stock-movements"] as const,
  roles: ["roles"] as const,
  customers: {
    all: ["customers"] as const,
    detail: (customerId: string) =>
      ["customers", customerId] as const,
    ledger: (customerId: string) =>
      ["customer-ledger", customerId] as const,
  },
  wallets: {
    all: ["customer-wallets"] as const,
    detail: (customerId: string) =>
      ["customer-wallet", customerId] as const,
    transactions: (customerId: string) =>
      ["customer-wallet-transactions", customerId] as const,
    overview: ["customer-wallet-overview"] as const,
  },
} as const;
