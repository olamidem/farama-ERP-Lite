import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  FileText,
  ShoppingBag,
  History,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../api/supabase";
import { useCustomers } from "../hooks/useCustomers";
import {
  useCreateCustomer,
  useUpdateCustomer,
  useAddCustomerLedgerEntry,
} from "../hooks/useCustomerMutations";
import type { Customer } from "../types/customer";
import CustomerModal from "../components/CustomerModal";
import TopUpModal from "../components/TopUpModal";
import DeleteCustomerModal from "../components/DeleteCustomerModal";
import WalletOverviewHeader from "../components/WalletOverviewHeader";
import DepositModal from "../components/DepositModal";
import WithdrawModal from "../components/WithdrawModal";
import WalletStatementModal from "../components/WalletStatementModal";
import {
  useWalletTransactions,
  useCustomerWallet,
  useUpdateWalletStatus,
} from "../hooks/useCustomerWallet";
import Pagination from "../../../components/ui/pagination/Pagination";

import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface CustomerSale {
  id: string;
  invoice_number?: string;
  created_at?: string;
  sale_date?: string;
  payment_method?: string;
  total_amount: number | string;
  status?: string;
  customer_id?: string;
}

export default function CustomersPage() {
  const { data: customers = [], isLoading } = useCustomers();
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const addLedgerMutation = useAddCustomerLedgerEntry();

  // Selected customer for the right ledger panel
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerToEdit, setSelectedCustomerToEdit] =
    useState<Customer | null>(null);

  // Delete Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );

  // Top Up Action Modal
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [customerToTopUp, setCustomerToTopUp] = useState<Customer | null>(null);

  // Dedicated Wallet Modals State
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositCustomer, setDepositCustomer] = useState<Customer | null>(null);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawCustomer, setWithdrawCustomer] = useState<Customer | null>(
    null,
  );

  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(
    null,
  );

  const [txFilterType, setTxFilterType] = useState<string>("all");

  const updateWalletStatusMutation = useUpdateWalletStatus();
  const { data: activeWallet } = useCustomerWallet(activeCustomerId || "");
  const { data: activeWalletTransactions = [] } = useWalletTransactions(
    activeCustomerId || undefined,
  );

  // Active Tab state
  const [activeTab, setActiveTab] = useState<
    "profiles_wallets" | "ledger_analytics"
  >("profiles_wallets");

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isPostingLedger = addLedgerMutation.isPending;

  // Find currently active customer details
  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.id === activeCustomerId) || null;
  }, [customers, activeCustomerId]);

  // Fetch sales purchases for the active customer
  const { data: activeCustomerSales = [], isLoading: isLoadingSales } =
    useQuery({
      queryKey: ["customer_sales", activeCustomerId],
      queryFn: async () => {
        if (!activeCustomerId) return [];
        try {
          const { data, error } = await supabase
            .from("sales")
            .select("*")
            .eq("customer_id", activeCustomerId)
            .order("created_at", { ascending: false });
          if (error) throw error;
          return data || [];
        } catch {
          // Fallback to local storage sales
          const stored = localStorage.getItem("farama_pos_sales");
          if (stored) {
            const parsed = JSON.parse(stored) as CustomerSale[];
            return parsed.filter((s) => s.customer_id === activeCustomerId);
          }
          return [];
        }
      },
      enabled: !!activeCustomerId,
    });

  // Calculate high-level stats cards based on customers array
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
      registeredCount: customers.filter((c) => c.id !== "walk-in-customer-id")
        .length,
    };
  }, [customers]);

  // Filter customers based on search
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

  // Paginated customers
  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, page, pageSize]);

  // Handle saving customer edits/additions
  const handleSaveCustomer = async (data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    remarks?: string;
  }) => {
    try {
      if (selectedCustomerToEdit) {
        await updateCustomerMutation.mutateAsync({
          id: selectedCustomerToEdit.id,
          input: data,
        });
      } else {
        await createCustomerMutation.mutateAsync({
          ...data,
          wallet_balance: 0,
          outstanding_debt: 0,
        });
      }
      setIsModalOpen(false);
      setSelectedCustomerToEdit(null);
    } catch {
      // Notification handled inside hook
    }
  };

  const handleDeleteCustomer = (cust: Customer) => {
    if (cust.id === "walk-in-customer-id") return;
    setCustomerToDelete(cust);
    setIsDeleteModalOpen(true);
  };

  const handlePostLedger = async (data: {
    type: "TOP_UP" | "PAYMENT" | "DEBIT";
    amount: number;
    remarks?: string;
  }) => {
    if (!customerToTopUp) return;
    try {
      await addLedgerMutation.mutateAsync({
        customerId: customerToTopUp.id,
        type: data.type,
        amount: data.amount,
        remarks: data.remarks || "Manual Adjustment",
      });
      setIsTopUpOpen(false);
      setCustomerToTopUp(null);
    } catch {
      // Error handled in hook
    }
  };

  const handleExportExcel = () => {
    try {
      const dataToExport = filteredCustomers.map((cust) => ({
        "Full Name": cust.name,
        "Phone Number": cust.phone || "N/A",
        "Email Address": cust.email || "N/A",
        "Physical Address": cust.address || "N/A",
        "Wallet Balance (NGN)": cust.wallet_balance || 0,
        "Outstanding Debt (NGN)": cust.outstanding_debt || 0,
        Remarks: cust.remarks || "N/A",
        "Registered Date": new Date(cust.created_at).toLocaleString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customers Directory");
      XLSX.writeFile(
        workbook,
        `Pharmacy_Customers_Report_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success("Customers list and ledger summary exported to Excel");
    } catch {
      toast.error("Failed to export customers to Excel");
    }
  };

  // Static/Mock Chart Data for analytics showing ledger volume over the week
  const areaChartData = [
    { name: "Mon", Deposits: 12000, DebtIssued: 8000, Repayments: 5000 },
    { name: "Tue", Deposits: 18000, DebtIssued: 15000, Repayments: 9000 },
    { name: "Wed", Deposits: 15000, DebtIssued: 5000, Repayments: 12000 },
    { name: "Thu", Deposits: 24000, DebtIssued: 22000, Repayments: 18000 },
    { name: "Fri", Deposits: 30000, DebtIssued: 18000, Repayments: 25000 },
    { name: "Sat", Deposits: 45000, DebtIssued: 35000, Repayments: 32000 },
    { name: "Sun", Deposits: 20000, DebtIssued: 12000, Repayments: 15000 },
  ];

  // Pie chart breakdown of customer segments
  const pieChartData = [
    { name: "Prepaid Wallets", value: stats.totalPrepaid, color: "#6366F1" },
    { name: "Outstanding Debts", value: stats.totalDebt, color: "#F43F5E" },
  ];

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
        <>
          {/* Core content dual panel (Registry List on Left, Active Ledger Details on Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Panel: Customer Registry */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden flex flex-col">
              {/* Search Bar & Actions Toolbar */}
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search registered customers by name, phone, or email..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedCustomerToEdit(null);
                      setIsModalOpen(true);
                    }}
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider cursor-pointer shadow-xs transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Customer</span>
                  </button>

                  <button
                    onClick={handleExportExcel}
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold text-[10px] uppercase tracking-wider cursor-pointer shadow-xs transition"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Export Report</span>
                  </button>
                </div>
              </div>

              {/* Table list */}
              {isLoading ? (
                <div className="p-16 flex flex-col items-center justify-center space-y-3">
                  <div className="h-8 w-8 animate-spin border-4 border-indigo-600 border-t-transparent rounded-full" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">
                    Retrieving Ledger balances...
                  </span>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-16 text-center max-w-sm mx-auto space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                      No Records Found
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 leading-normal mt-1">
                      Check your search query or add a brand new customer wallet
                      account.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/40 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left select-none">
                        <th className="py-4 px-5">Customer</th>
                        <th className="py-4 px-5">Wallet Bal</th>
                        <th className="py-4 px-5">Outstanding</th>
                        <th className="py-4 px-5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {paginatedCustomers.map((cust) => {
                        const isSelected = activeCustomerId === cust.id;
                        const isWalkIn = cust.id === "walk-in-customer-id";

                        return (
                          <tr
                            key={cust.id}
                            onClick={() => setActiveCustomerId(cust.id)}
                            className={`transition hover:bg-slate-50/70 cursor-pointer ${
                              isSelected
                                ? "bg-indigo-50/30 font-bold border-l-2 border-indigo-600"
                                : ""
                            }`}
                          >
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full border text-[10px] font-black flex items-center justify-center uppercase select-none ${
                                    isSelected
                                      ? "bg-indigo-600 border-indigo-600 text-white"
                                      : "bg-slate-50 border-slate-200 text-slate-600"
                                  }`}
                                >
                                  {cust.name.substring(0, 2)}
                                </div>
                                <div>
                                  <span className="block font-black text-slate-800">
                                    {cust.name}
                                  </span>
                                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                    {cust.phone || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-5">
                              {(cust.wallet_balance || 0) > 0 ? (
                                <span className="font-extrabold text-indigo-600">
                                  ₦
                                  {Number(
                                    cust.wallet_balance || 0,
                                  ).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-semibold">
                                  ₦0.00
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-5">
                              {(cust.outstanding_debt || 0) > 0 ? (
                                <span className="font-extrabold text-rose-600">
                                  ₦
                                  {Number(
                                    cust.outstanding_debt || 0,
                                  ).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-semibold">
                                  ₦0.00
                                </span>
                              )}
                            </td>

                            <td
                              className="py-4 px-5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDepositCustomer(cust);
                                    setIsDepositOpen(true);
                                  }}
                                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer shadow-xs transition"
                                  title="Deposit Funds to Wallet"
                                >
                                  <ArrowDownLeft className="h-3 w-3 shrink-0" />
                                  <span>Deposit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setWithdrawCustomer(cust);
                                    setIsWithdrawOpen(true);
                                  }}
                                  className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 py-1 px-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer transition"
                                  title="Withdraw Funds from Wallet"
                                >
                                  <ArrowUpRight className="h-3 w-3 shrink-0" />
                                  <span>Withdraw</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStatementCustomer(cust);
                                    setIsStatementOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition cursor-pointer"
                                  title="Print Wallet Statement"
                                >
                                  <Wallet className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isWalkIn) return;
                                    setSelectedCustomerToEdit(cust);
                                    setIsModalOpen(true);
                                  }}
                                  disabled={isWalkIn}
                                  className={`p-1.5 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition cursor-pointer ${
                                    isWalkIn
                                      ? "text-slate-200 border-none hover:bg-transparent"
                                      : "text-slate-400 hover:text-slate-700"
                                  }`}
                                  title="Edit Profile"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isWalkIn) return;
                                    handleDeleteCustomer(cust);
                                  }}
                                  disabled={isWalkIn}
                                  className={`p-1.5 rounded-lg border border-slate-200/50 hover:bg-rose-50 transition cursor-pointer ${
                                    isWalkIn
                                      ? "text-slate-200 border-none hover:bg-transparent"
                                      : "text-rose-400 hover:text-rose-600"
                                  }`}
                                  title="Delete Profile"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination controls */}
              {filteredCustomers.length > 0 && !isLoading && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/20">
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalItems={filteredCustomers.length}
                    onPageChange={(p) => setPage(p)}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                    itemName="accounts"
                  />
                </div>
              )}
            </div>

            {/* Right Panel: Selected Customer Account Detail / Ledger Overview */}
            <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden">
              {!activeCustomer ? (
                // Dashed placeholder state (strictly matching image)
                <div className="p-8 py-16 text-center bg-slate-50/20 border-2 border-dashed border-slate-200/60 rounded-3xl m-4 flex flex-col items-center justify-center min-h-[380px]">
                  <div className="p-4 bg-slate-100/70 border border-slate-200/30 rounded-2xl text-slate-400/80 mb-4 select-none">
                    <Users className="h-8 w-8" />
                  </div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                    No Customer Selected
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 leading-relaxed mt-2 max-w-[240px] mx-auto">
                    Click a row in the registry table to view detailed ledger
                    cards, recent store purchases, and wallet transactions.
                  </p>
                </div>
              ) : (
                // Active Interactive Ledger Detail Panel
                <div className="flex flex-col h-full animate-fade-in divide-y divide-slate-100">
                  {/* Account Header info */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-700 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-2 select-none">
                          Active Account
                        </span>
                        <h3 className="text-sm font-black text-slate-800">
                          {activeCustomer.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        {activeCustomer.id !== "walk-in-customer-id" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedCustomerToEdit(activeCustomer);
                                setIsModalOpen(true);
                              }}
                              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg border border-slate-200/50 hover:bg-slate-50 transition cursor-pointer"
                              title="Edit Profile"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCustomer(activeCustomer)
                              }
                              className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg border border-slate-200/50 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete Profile"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setActiveCustomerId(null)}
                          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer ml-1"
                          title="Deselect Account"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Contact particulars */}
                    <div className="space-y-2 text-[10px] text-slate-600 font-bold">
                      {activeCustomer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{activeCustomer.phone}</span>
                        </div>
                      )}
                      {activeCustomer.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {activeCustomer.email}
                          </span>
                        </div>
                      )}
                      {activeCustomer.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {activeCustomer.address}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Wallet Status & Quick Actions */}
                    <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            Wallet Balance
                          </span>
                          <span className="block text-base font-black text-indigo-600 font-mono mt-0.5">
                            ₦
                            {Number(
                              activeCustomer.wallet_balance || 0,
                            ).toLocaleString("en-NG", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            Wallet Status
                          </span>
                          <span
                            className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${
                              activeWallet?.status === "suspended"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {activeWallet?.status || "ACTIVE"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setDepositCustomer(activeCustomer);
                            setIsDepositOpen(true);
                          }}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                          <span>Deposit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setWithdrawCustomer(activeCustomer);
                            setIsWithdrawOpen(true);
                          }}
                          className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          <span>Withdraw</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setStatementCustomer(activeCustomer);
                            setIsStatementOpen(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[9px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Wallet className="h-3 w-3" />
                          <span>Statement</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const newStatus =
                              activeWallet?.status === "active"
                                ? "suspended"
                                : "active";
                            updateWalletStatusMutation.mutate({
                              customerId: activeCustomer.id,
                              status: newStatus,
                            });
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Toggle Status</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Ledger & Immutable Transactions trace */}
                  <div className="p-5 flex-1 flex flex-col min-h-[260px]">
                    <div className="flex items-center justify-between gap-1.5 mb-3">
                      <div className="flex items-center gap-1.5">
                        <History className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Wallet Transactions Ledger
                        </h4>
                      </div>
                      <span className="text-[9px] font-black text-indigo-600">
                        {activeWalletTransactions.length} logs
                      </span>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-2 mb-2 no-scrollbar">
                      {[
                        "all",
                        "deposit",
                        "withdrawal",
                        "sale_payment",
                        "refund",
                      ].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setTxFilterType(f)}
                          className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition shrink-0 cursor-pointer ${
                            txFilterType === f
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {f.replace("_", " ")}
                        </button>
                      ))}
                    </div>

                    {activeWalletTransactions.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-100 rounded-2xl bg-slate-50/10">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          No Wallet Transactions
                        </span>
                        <p className="text-[9px] font-bold text-slate-400/80 mt-1 max-w-[160px]">
                          Deposits, withdrawals, and POS sales will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {activeWalletTransactions
                          .filter(
                            (tx) =>
                              txFilterType === "all" ||
                              tx.type === txFilterType,
                          )
                          .map((tx) => {
                            const isCredit = tx.direction === "credit";
                            return (
                              <div
                                key={tx.id}
                                className="p-2.5 border border-slate-100 rounded-xl bg-slate-50/40 text-[10px] flex justify-between items-start gap-2"
                              >
                                <div className="min-w-0 space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`inline-block text-[8px] font-black uppercase tracking-widest rounded px-1.5 py-0.2 ${
                                        tx.type === "deposit"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : tx.type === "withdrawal"
                                            ? "bg-rose-100 text-rose-800"
                                            : tx.type === "sale_payment"
                                              ? "bg-indigo-100 text-indigo-800"
                                              : tx.type === "refund"
                                                ? "bg-amber-100 text-amber-800"
                                                : "bg-slate-200 text-slate-800"
                                      }`}
                                    >
                                      {tx.type.replace("_", " ")}
                                    </span>
                                    <span className="text-[8px] font-mono text-slate-400">
                                      {tx.reference}
                                    </span>
                                  </div>
                                  <p className="font-bold text-slate-700 truncate pr-1">
                                    {tx.notes ||
                                      `${tx.type.toUpperCase()} transaction`}
                                  </p>
                                  <span className="block text-[8px] text-slate-400 font-medium">
                                    {new Date(tx.created_at).toLocaleString(
                                      "en-NG",
                                      {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                      },
                                    )}{" "}
                                    • {tx.payment_method.toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span
                                    className={`block font-black font-mono ${
                                      isCredit
                                        ? "text-emerald-600"
                                        : "text-rose-600"
                                    }`}
                                  >
                                    {isCredit ? "+" : "-"}₦
                                    {tx.amount.toLocaleString("en-NG", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                  <span className="block text-[8px] font-mono text-slate-400">
                                    Bal: ₦
                                    {tx.balance_after.toLocaleString("en-NG")}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Recent Store Purchases trace */}
                  <div className="p-5 min-h-[220px]">
                    <div className="flex items-center gap-1.5 mb-3">
                      <ShoppingBag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Recent Store Purchases
                      </h4>
                    </div>

                    {isLoadingSales ? (
                      <div className="animate-pulse space-y-2">
                        <div className="h-10 bg-slate-100 rounded-xl" />
                        <div className="h-10 bg-slate-100 rounded-xl" />
                      </div>
                    ) : activeCustomerSales.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-100 rounded-2xl bg-slate-50/10">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          No Purchases Recorded
                        </span>
                        <p className="text-[9px] font-bold text-slate-400/80 mt-1">
                          No store sales logged under this client.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {activeCustomerSales.map((sale: CustomerSale) => (
                          <div
                            key={sale.id}
                            className="p-2 border border-slate-100 rounded-xl bg-slate-50/20 text-[10px] flex justify-between items-center"
                          >
                            <div>
                              <span className="block font-black text-slate-700">
                                Invoice: #
                                {sale.invoice_number ||
                                  sale.id.substring(0, 8).toUpperCase()}
                              </span>
                              <span className="block text-[8px] text-slate-400 font-bold">
                                {sale.created_at || sale.sale_date
                                  ? new Date(
                                      sale.created_at || sale.sale_date || "",
                                    ).toLocaleDateString()
                                  : "N/A"}{" "}
                                • {sale.payment_method || "N/A"}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="block font-black text-slate-800">
                                ₦
                                {Number(sale.total_amount).toLocaleString(
                                  "en-US",
                                  { minimumFractionDigits: 2 },
                                )}
                              </span>
                              <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">
                                {sale.status || "Completed"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // Detailed Ledger Analytics & Ledger History Logs
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Chart: Ledger Trends over the week */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Total Ledger Activity & Credit Operations
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400">
                    Volume of deposits, credits issued, and debt repayments over
                    the week
                  </p>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl text-slate-500 select-none">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider pr-1">
                    Pharmacy Credit trends
                  </span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={areaChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorDeposits"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366F1"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366F1"
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorDebt"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#F43F5E"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#F43F5E"
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#F1F5F9"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#94A3B8"
                      fontSize={9}
                      tickLine={false}
                    />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        fontSize: "10px",
                        borderRadius: "12px",
                        border: "1px solid #F1F5F9",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Deposits"
                      stroke="#6366F1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorDeposits)"
                    />
                    <Area
                      type="monotone"
                      dataKey="DebtIssued"
                      stroke="#F43F5E"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorDebt)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Store Balances breakdown */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                  Liability and Asset Portfolio
                </h3>
                <p className="text-[10px] font-bold text-slate-400">
                  Breakdown of customer deposits vs total outstanding credits
                </p>
              </div>

              <div className="h-44 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: "10px", borderRadius: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center total text */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    Net Exposure
                  </span>
                  <span className="text-sm font-black text-slate-800 mt-1">
                    ₦{Math.abs(stats.netPosition).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-50 pt-3">
                {pieChartData.map((d, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-[10px]"
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-500">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span>{d.name}</span>
                    </div>
                    <span className="font-black text-slate-700">
                      ₦{d.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick instructions/Ledger Guide note */}
          <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-3xl p-5 flex items-start gap-4">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 shrink-0 select-none">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Store ledger audit systems & rules
              </h4>
              <p className="text-[10px] font-semibold text-slate-500 leading-relaxed mt-1 max-w-4xl">
                The Farama Pharmacy ledger allows you to deposit advances or log
                credit limits dynamically. All client top-ups increase their
                prepaid custody (a liability for us, stored as a cash reserve).
                Outstanding debts represent store credit given during invoice
                creations or custom credit lines. The net store position
                evaluates these totals to provide full store exposure risk
                instantly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Customer Create/Edit Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomerToEdit(null);
        }}
        customer={selectedCustomerToEdit}
        onSave={handleSaveCustomer}
        isLoading={
          createCustomerMutation.isPending || updateCustomerMutation.isPending
        }
      />

      {/* Wallet balance top up / post ledger action modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => {
          setIsTopUpOpen(false);
          setCustomerToTopUp(null);
        }}
        customer={customerToTopUp}
        onSave={handlePostLedger}
        isLoading={isPostingLedger}
      />

      {/* Delete Customer Confirmation Modal */}
      <DeleteCustomerModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCustomerToDelete(null);
        }}
        customer={customerToDelete}
        onDeleted={() => {
          if (activeCustomerId === customerToDelete?.id) {
            setActiveCustomerId(null);
          }
        }}
      />

      {/* Dedicated Wallet Deposit Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => {
          setIsDepositOpen(false);
          setDepositCustomer(null);
        }}
        customer={depositCustomer}
      />

      {/* Dedicated Wallet Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => {
          setIsWithdrawOpen(false);
          setWithdrawCustomer(null);
        }}
        customer={withdrawCustomer}
      />

      {/* Printable Customer Wallet Statement Modal */}
      <WalletStatementModal
        isOpen={isStatementOpen}
        onClose={() => {
          setIsStatementOpen(false);
          setStatementCustomer(null);
        }}
        customer={statementCustomer}
      />
    </div>
  );
}
