import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../../lib/queryKey";
import {
  getWalletByCustomerId,
  getWalletTransactions,
} from "../services/wallet.service";

export const useCustomerWallet = (customerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.wallets.detail(customerId),
    queryFn: () => getWalletByCustomerId(customerId),
    enabled: !!customerId,
  });
};

export const useCustomerWalletTransactions = (customerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.wallets.transactions(customerId),
    queryFn: () => getWalletTransactions(customerId),
    enabled: !!customerId,
  });
};