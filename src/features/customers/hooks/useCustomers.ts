import { useQuery } from "@tanstack/react-query";

import {
  getCustomers,
  getCustomerById,
  getCustomerWallet,
} from "../services/customer.service";
import { QUERY_KEYS } from "../lib/queryKey";

export const useCustomers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.customers,
    queryFn: getCustomers,
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.customers, id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });
};

export const useCustomerWallet = (customerId: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.customerWallet, customerId],
    queryFn: () => getCustomerWallet(customerId),
    enabled: !!customerId,
  });
};