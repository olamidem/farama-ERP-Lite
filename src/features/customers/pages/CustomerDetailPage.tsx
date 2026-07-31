import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Users, ShieldAlert } from "lucide-react";
import { useCustomer } from "../hooks/useCustomers";
import {
  useCustomerWallet,
  useCustomerWalletTransactions,
  useUpdateWalletStatus,
} from "../hooks/useCustomerWallet";
import { useCustomerSales } from "../hooks/useCustomerSales";
import { useCustomerModals } from "../hooks/useCustomerModals";
import {
  useUpdateCustomer,
  useDeleteCustomer,
  useAddCustomerLedgerEntry,
} from "../hooks/useCustomerMutations";
import CustomerFinancialDashboard from "../components/CustomerFinancialDashboard";
import CustomerModalsContainer from "../components/CustomerModalsContainer";
import type { CustomerFormInput, TopUpFormInput } from "../validation/customer.schema";

export function CustomerDetailPage() {
  const params = useParams({ strict: false });
  const customerId = (params as Record<string, string>)?.customerId || "";
  const navigate = useNavigate();

  const [txFilterType, setTxFilterType] = useState<string>("ALL");

  // Fetch customer details
  const { data: customer, isLoading: isLoadingCustomer, error: customerError } = useCustomer(customerId);

  // Wallet queries
  const { data: wallet } = useCustomerWallet(customerId);
  const { data: walletTransactions = [] } = useCustomerWalletTransactions(customerId);

  // Sales query
  const { data: customerSales = [], isLoading: isLoadingSales } = useCustomerSales(customerId);

  // Modals & Mutations
  const modals = useCustomerModals();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();
  const addLedgerEntryMutation = useAddCustomerLedgerEntry();
  const updateWalletStatusMutation = useUpdateWalletStatus();

  // Save handler for editing customer
  const handleSaveCustomer = async (data: CustomerFormInput) => {
    if (!customer) return;
    await updateCustomerMutation.mutateAsync({
      id: customer.id,
      input: {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
      },
    });
    modals.closeCustomerModal();
  };

  // Ledger posting handler
  const handlePostLedger = async (data: TopUpFormInput) => {
    const targetCustomer = modals.customerToTopUp || customer;
    if (!targetCustomer) return;

    await addLedgerEntryMutation.mutateAsync({
      customerId: targetCustomer.id,
      type: data.type,
      amount: data.amount,
      remarks: data.remarks,
    });
    modals.closeTopUpModal();
  };

  // Delete handler
  const handleCustomerDeleted = async () => {
    if (!customer) return;
    await deleteCustomerMutation.mutateAsync(customer.id);
    modals.closeDeleteModal();
    navigate({ to: "/customers" });
  };

  // Wallet status handler
  const handleToggleStatus = async (cust: string, newStatus: "ACTIVE" | "SUSPENDED") => {
    await updateWalletStatusMutation.mutateAsync({
      customerId: cust,
      status: newStatus,
    });
  };

  if (isLoadingCustomer) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-48 w-full bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
        <div className="h-96 w-full bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (customerError || (!isLoadingCustomer && !customer)) {
    return (
      <div className="p-12 max-w-md mx-auto text-center space-y-4">
        <div className="p-3.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 w-fit mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          Customer Not Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          The requested customer profile could not be loaded or does not exist.
        </p>
        <button
          onClick={() => navigate({ to: "/customers" })}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Customers</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full space-y-6">
      {/* Top Breadcrumb & Page Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/customers" })}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-2xs"
            title="Back to Customers list"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
              <span
                onClick={() => navigate({ to: "/customers" })}
                className="hover:underline cursor-pointer flex items-center gap-1"
              >
                <Users className="h-3.5 w-3.5" />
                Customers
              </span>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-300">{customer?.name}</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {customer?.name}'s Financial Dashboard
            </h1>
          </div>
        </div>
      </div>

      {/* Financial Dashboard Main View */}
      <CustomerFinancialDashboard
        activeCustomer={customer || null}
        activeWallet={wallet}
        activeWalletTransactions={walletTransactions}
        activeCustomerSales={customerSales}
        isLoadingSales={isLoadingSales}
        txFilterType={txFilterType}
        onTxFilterChange={setTxFilterType}
        onDeselect={() => navigate({ to: "/customers" })}
        onEdit={modals.openEditModal}
        onDelete={modals.openDeleteModal}
        onDeposit={modals.openDepositModal}
        onWithdraw={modals.openWithdrawModal}
        onStatement={modals.openStatementModal}
        onToggleStatus={handleToggleStatus}
      />

      {/* Customer Modals Container */}
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
        onCustomerDeleted={handleCustomerDeleted}
        isSavingCustomer={updateCustomerMutation.isPending}
        isPostingLedger={addLedgerEntryMutation.isPending}
      />
    </div>
  );
}

export default CustomerDetailPage;
