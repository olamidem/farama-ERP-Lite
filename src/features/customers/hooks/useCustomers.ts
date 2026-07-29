import { useQuery } from "@tanstack/react-query";
import {
  getCustomers,
  getCustomerById,
} from "../services/customer.service";
import { QUERY_KEYS } from "../../../lib/queryKey";

export const useCustomers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.customers.all,
    queryFn: getCustomers,
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.customers.detail(id),
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });
};