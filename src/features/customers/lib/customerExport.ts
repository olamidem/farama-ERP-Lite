import * as XLSX from "xlsx";
import { toast } from "sonner";
import type { Customer } from "../types/customer";

export function exportCustomersToExcel(customers: Customer[]) {
  try {
    const dataToExport = customers.map((cust) => ({
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
      `Pharmacy_Customers_Report_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    toast.success("Customers list exported to Excel");
  } catch {
    toast.error("Failed to export customers to Excel");
  }
}

export function formatNaira(value: number): string {
  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
