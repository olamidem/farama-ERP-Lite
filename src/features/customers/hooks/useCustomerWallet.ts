import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../lib/queryKey";
import { getReadableError } from "../../../utils/error";
import {
  getWalletByCustomerId,
  getWalletTransactions,
  depositToWallet,
  withdrawFromWallet,
  updateWalletStatus,
  getWalletOverviewStats,
  transferWalletBalance,
} from "../services/wallet.service";
import type {
  WalletDepositInput,
  WalletWithdrawalInput,
  WalletStatus,
} from "../types/wallet";

export const useCustomerWallet = (customerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.wallets.detail(customerId),
    queryFn: () => getWalletByCustomerId(customerId),
    enabled: !!customerId,
  });
};

export const useCustomerWalletTransactions = (customerId?: string) => {
  return useQuery({
    queryKey: customerId ? QUERY_KEYS.wallets.transactions(customerId) : ["wallet_transactions"],
    queryFn: () => (customerId ? getWalletTransactions(customerId) : Promise.resolve([])),
    enabled: !!customerId,
  });
};

export const useWalletTransactions = useCustomerWalletTransactions;

export const useDepositWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WalletDepositInput) => depositToWallet(input),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallets.detail(variables.customer_id),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallets.transactions(variables.customer_id),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customers.all,
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallets.overview,
      });
      toast.success("Wallet deposit successful.");
    },
    onError: (error) => {
      toast.error(getReadableError(error));
    },
  });
};

export const useWithdrawWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WalletWithdrawalInput) => withdrawFromWallet(input),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallets.detail(variables.customer_id),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallets.transactions(variables.customer_id),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customers.all,
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallets.overview,
      });
      toast.success("Wallet withdrawal successful.");
    },
    onError: (error) => {
      toast.error(getReadableError(error));
    },
  });
};

export const useTransferWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { senderId: string; recipientId: string; amount: number; notes?: string }) =>
      transferWalletBalance(input),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallets.detail(variables.senderId),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallets.detail(variables.recipientId),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallets.transactions(variables.senderId),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallets.transactions(variables.recipientId),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customers.all,
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallets.overview,
      });
      toast.success(`Successfully transferred ₦${variables.amount.toLocaleString()} store credit!`);
    },
    onError: (error) => {
      toast.error(getReadableError(error));
    },
  });
};

export const useUpdateWalletStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      status,
    }: {
      customerId: string;
      status: WalletStatus;
    }) => updateWalletStatus(customerId, status),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.wallets.detail(variables.customerId),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.customers.all,
      });
      toast.success(`Customer status set to ${variables.status}.`);
    },
    onError: (error) => {
      toast.error(getReadableError(error));
    },
  });
};

export const useWalletOverviewStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.wallets.overview,
    queryFn: () => getWalletOverviewStats(),
  });
};
