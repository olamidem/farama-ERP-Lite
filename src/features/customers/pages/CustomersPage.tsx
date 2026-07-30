import { useState, useMemo } from "react";
import { useCustomers } from "../hooks/useCustomers";
import {
  useCreateCustomer,
  useUpdateCustomer,
  useAddCustomerLedgerEntry,
} from "../hooks/useCustomerMutations";
import {
  useWalletTransactions,
  useCustomerWallet,
  useUpdateWalletStatus,
} from "../hooks/useCustomerWallet";
import { useCustomerSales } from "../hooks/useCustomerSales";
import { useCustomerModals } from "../hooks/useCustomerModals";
import { useCustomerTableState } from "../hooks/useCustomerTableState";
import { exportCustomersToExcel } from "../lib/customerExport";

import WalletOverviewHeader from "../components/WalletOverviewHeader";
import CustomerListTable from "../components/CustomerListTable";
import CustomerDetailDrawer from "../components/CustomerDetailDrawer";
import CustomerAnalyticsTab from "../components/tabs/CustomerAnalyticsTab";
import CustomerModalsContainer from "../components/CustomerModalsContainer";

export default function CustomersPage() {
  const { data: customers = [], isLoading } = useCustomers();
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const addLedgerMutation = useAddCustomerLedgerEntry();
  const updateWalletStatusMutation = useUpdateWalletStatus();

  // Selected customer for the right drawer/panel
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);

  // Custom hook managing all modal states
  const modals = useCustomerModals();

  // Custom hook managing table search, pagination, and analytics stats
  const tableState = useCustomerTableState(customers);

  // Active Tab state
  const [activeTab, setActiveTab] = useState<
    "profiles_wallets" | "ledger_analytics"
  >("profiles_wallets");

  // Drawer filtering state
  const [txFilterType, setTxFilterType] = useState<string>("ALL");

  // Queries for active customer details
  const { data: activeWallet } = useCustomerWallet(activeCustomerId || "");
  const { data: activeWalletTransactions = [] } = useWalletTransactions(
    activeCustomerId || undefined,
  );
  const { data: activeCustomerSales = [], isLoading: isLoadingSales } =
    useCustomerSales(activeCustomerId);

  // Find currently active customer details
  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.id === activeCustomerId) || null;
  }, [customers, activeCustomerId]);

  const handleSaveCustomer = async (data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    remarks?: string;
  }) => {
    try {
      if (modals.selectedCustomerToEdit) {
        await updateCustomerMutation.mutateAsync({
          id: modals.selectedCustomerToEdit.id,
          input: data,
        });
      } else {
        await createCustomerMutation.mutateAsync({
          ...data,
          wallet_balance: 0,
          outstanding_debt: 0,
        });
      }
      modals.closeCustomerModal();
    } catch {
      // Notification handled inside hook
    }
  };

  const handlePostLedger = async (data: {
    type: "TOP_UP" | "PAYMENT" | "DEBIT";
    amount: number;
    remarks?: string;
  }) => {
    if (!modals.customerToTopUp) return;
    try {
      await addLedgerMutation.mutateAsync({
        customerId: modals.customerToTopUp.id,
        type: data.type,
        amount: data.amount,
        remarks: data.remarks || "Manual Adjustment",
      });
      modals.closeTopUpModal();
    } catch {
      // Error handled in hook
    }
  };

  const handleExportExcel = () => {
    exportCustomersToExcel(tableState.filteredCustomers);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Overview Analytics Header */}
      <WalletOverviewHeader />

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6 -mb-px">
          <button
            onClick={() => setActiveTab("profiles_wallets")}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition cursor-pointer ${
              activeTab === "profiles_wallets"
                ? "border-indigo-600 text-indigo-600 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            PROFILES & LEDGER WALLETS
          </button>
          <button
            onClick={() => setActiveTab("ledger_analytics")}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition cursor-pointer ${
              activeTab === "ledger_analytics"
                ? "border-indigo-600 text-indigo-600 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            DETAILED LEDGER ANALYTICS
          </button>
        </div>
      </div>

      {activeTab === "profiles_wallets" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <CustomerListTable
            customers={customers}
            filteredCustomers={tableState.filteredCustomers}
            paginatedCustomers={tableState.paginatedCustomers}
            isLoading={isLoading}
            search={tableState.search}
            onSearchChange={tableState.handleSearchChange}
            activeCustomerId={activeCustomerId}
            onSelectCustomer={(id) => setActiveCustomerId(id)}
            onNewCustomer={modals.openCreateModal}
            onExportExcel={handleExportExcel}
            onDeposit={modals.openDepositModal}
            onWithdraw={modals.openWithdrawModal}
            onStatement={modals.openStatementModal}
            onEdit={modals.openEditModal}
            onDelete={modals.openDeleteModal}
            page={tableState.page}
            pageSize={tableState.pageSize}
            onPageChange={tableState.handlePageChange}
            onPageSizeChange={tableState.handlePageSizeChange}
          />

          <CustomerDetailDrawer
            activeCustomer={activeCustomer}
            activeWallet={activeWallet}
            activeWalletTransactions={activeWalletTransactions}
            activeCustomerSales={activeCustomerSales}
            isLoadingSales={isLoadingSales}
            txFilterType={txFilterType}
            onTxFilterChange={setTxFilterType}
            onDeselect={() => setActiveCustomerId(null)}
            onEdit={modals.openEditModal}
            onDelete={modals.openDeleteModal}
            onDeposit={modals.openDepositModal}
            onWithdraw={modals.openWithdrawModal}
            onStatement={modals.openStatementModal}
            onToggleStatus={(customerId, status) => {
              updateWalletStatusMutation.mutate({ customerId, status });
            }}
          />
        </div>
      ) : (
        <CustomerAnalyticsTab stats={tableState.stats} />
      )}

      {/* Encapsulated Modal Boilerplate */}
      <CustomerModalsContainer
        isModalOpen={modals.isModalOpen}
        selectedCustomerToEdit={modals.selectedCustomerToEdit}
        isDeleteModalOpen={modals.isDeleteModalOpen}
        customerToDelete={modals.customerToDelete}
        isTopUpOpen={modals.isTopUpOpen}
        customerToTopUp={modals.customerToTopUp}
        isDepositOpen={modals.isDepositOpen}
        depositCustomer={modals.depositCustomer}
        isWithdrawOpen={modals.isWithdrawOpen}
        withdrawCustomer={modals.withdrawCustomer}
        isStatementOpen={modals.isStatementOpen}
        statementCustomer={modals.statementCustomer}
        onCloseCustomerModal={modals.closeCustomerModal}
        onCloseDeleteModal={modals.closeDeleteModal}
        onCloseTopUpModal={modals.closeTopUpModal}
        onCloseDepositModal={modals.closeDepositModal}
        onCloseWithdrawModal={modals.closeWithdrawModal}
        onCloseStatementModal={modals.closeStatementModal}
        onSaveCustomer={handleSaveCustomer}
        onPostLedger={handlePostLedger}
        onCustomerDeleted={() => {
          if (activeCustomerId === modals.customerToDelete?.id) {
            setActiveCustomerId(null);
          }
        }}
        isSavingCustomer={
          createCustomerMutation.isPending || updateCustomerMutation.isPending
        }
        isPostingLedger={addLedgerMutation.isPending}
      />
    </div>
  );
}
