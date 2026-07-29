import { useState, useMemo, useCallback } from "react";
import type { Customer } from "../types/customer";

export function useCustomerTableState(customers: Customer[] = []) {
  // Search & Pagination State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Search filter handler
  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const s = search.toLowerCase();
      return (
        cust.name.toLowerCase().includes(s) ||
        (cust.phone && cust.phone.toLowerCase().includes(s)) ||
        (cust.email && cust.email.toLowerCase().includes(s)) ||
        (cust.address && cust.address.toLowerCase().includes(s))
      );
    });
  }, [customers, search]);

  // Paginate filtered results
  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, page, pageSize]);

  // High-level analytics stats calculation
  const stats = useMemo(() => {
    let totalPrepaid = 0;
    let totalDebt = 0;
    let topPrepaidVal = 0;
    let topPrepaidCust = "None";
    let topDebtorVal = 0;
    let topDebtorCust = "None";

    customers.forEach((c) => {
      if (c.id === "walk-in-customer-id") return;
      totalPrepaid += c.wallet_balance || 0;
      totalDebt += c.outstanding_debt || 0;

      if ((c.wallet_balance || 0) > topPrepaidVal) {
        topPrepaidVal = c.wallet_balance;
        topPrepaidCust = c.name;
      }
      if ((c.outstanding_debt || 0) > topDebtorVal) {
        topDebtorVal = c.outstanding_debt;
        topDebtorCust = c.name;
      }
    });

    const netPosition = totalPrepaid - totalDebt;

    return {
      totalPrepaid,
      totalDebt,
      netPosition,
      topPrepaidCust,
      topDebtorCust,
      registeredCount: customers.filter((c) => c.id !== "walk-in-customer-id").length,
    };
  }, [customers]);

  return {
    search,
    page,
    pageSize,
    filteredCustomers,
    paginatedCustomers,
    stats,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
  };
}
