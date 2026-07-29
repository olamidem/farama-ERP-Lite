import { useState } from "react";
import {
  Upload,
  X,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface ImportCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    newCustomers: Array<{
      name: string;
      phone?: string;
      email?: string;
      address?: string;
      remarks?: string;
    }>,
  ) => Promise<void>;
  isLoading?: boolean;
}

interface ParsedCustomerRow {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  remarks?: string;
  isValid: boolean;
  error?: string;
}

export default function ImportCustomersModal({
  isOpen,
  onClose,
  onImport,
  isLoading = false,
}: ImportCustomersModalProps) {
  const [parsedRows, setParsedRows] = useState<ParsedCustomerRow[]>([]);
  const [fileName, setFileName] = useState<string>("");

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

        const rows: ParsedCustomerRow[] = data.map((row) => {
          // Normalize column headers
          const name = String(
            row["Name"] || row["name"] || row["Full Name"] || "",
          ).trim();
          const phone = String(
            row["Phone"] || row["phone"] || row["Phone Number"] || "",
          ).trim();
          const email = String(
            row["Email"] || row["email"] || row["Email Address"] || "",
          ).trim();
          const address = String(row["Address"] || row["address"] || "").trim();
          const remarks = String(
            row["Remarks"] || row["remarks"] || row["Notes"] || "",
          ).trim();

          const isValid = name.length >= 2;
          const error = !isValid
            ? "Customer name must be at least 2 characters"
            : undefined;

          return { name, phone, email, address, remarks, isValid, error };
        });

        setParsedRows(rows);
        if (rows.length === 0) {
          toast.error("No valid customer rows found in file");
        } else {
          toast.success(`Loaded ${rows.length} rows from file`);
        }
      } catch {
        toast.error(
          "Failed to parse file. Please upload a valid CSV or Excel file.",
        );
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Full Name": "John Doe",
        "Phone Number": "+2348012345678",
        "Email Address": "john.doe@example.com",
        Address: "12 Commercial Avenue, Ikeja, Lagos",
        Remarks: "VIP regular client",
      },
      {
        "Full Name": "Jane Smith",
        "Phone Number": "+2348098765432",
        "Email Address": "jane.smith@example.com",
        Address: "5 Victoria Island, Lagos",
        Remarks: "Prefers generic brands",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Customer Import Template",
    );
    XLSX.writeFile(workbook, "Customers_Import_Template.xlsx");
  };

  const handleExecuteImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid customer records to import");
      return;
    }

    await onImport(
      validRows.map((r) => ({
        name: r.name,
        phone: r.phone,
        email: r.email,
        address: r.address,
        remarks: r.remarks,
      })),
    );

    setParsedRows([]);
    setFileName("");
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Batch Import Customer Profiles
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                Upload CSV or Excel file to import customer accounts in bulk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Action Row */}
          <div className="flex items-center justify-between gap-2">
            <label className="flex-1 cursor-pointer">
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 text-center bg-slate-50/40 hover:bg-indigo-50/20 transition flex flex-col items-center justify-center gap-1.5">
                <Upload className="h-5 w-5 text-indigo-500" />
                <span className="text-xs font-black text-slate-700">
                  {fileName ? fileName : "Click to select CSV or XLSX file"}
                </span>
                <span className="text-[9px] font-bold text-slate-400">
                  Supported formats: .csv, .xlsx, .xls
                </span>
              </div>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-extrabold text-[10px] uppercase tracking-wider transition flex flex-col items-center gap-1 shrink-0 cursor-pointer shadow-xs"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              <span>Sample Format</span>
            </button>
          </div>

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                <span>Preview Records ({parsedRows.length} total)</span>
                <span className="text-emerald-600 font-extrabold">
                  {validCount} valid to import
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[10px]">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={row.isValid ? "bg-white" : "bg-rose-50/40"}
                      >
                        <td className="py-2 px-3">
                          {row.isValid ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <span title={row.error}>
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-800">
                          {row.name || "N/A"}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">
                          {row.phone || "N/A"}
                        </td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-[120px]">
                          {row.email || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-extrabold text-[10px] uppercase tracking-wider cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={isLoading || validCount === 0}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-[10px] uppercase tracking-wider cursor-pointer shadow-xs transition flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Import {validCount} Profiles</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
