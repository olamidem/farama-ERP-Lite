import { useState } from "react";
import { X, Image as ImageIcon, Printer, Store, Phone, MapPin, Hash, Check } from "lucide-react";
import { useReceiptStore } from "../../store/receipt.store";
import { toast } from "sonner";

interface ReceiptConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptConfigModal = ({ isOpen, onClose }: ReceiptConfigModalProps) => {
  const { settings, updateSettings } = useReceiptStore();

  const [form, setForm] = useState({ ...settings });

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image file size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    toast.success("POS receipt settings saved successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                POS Receipt & Thermal Printer Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure store branding, footer messages, and auto-print preferences
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Logo Upload Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Store Logo (Optional)
            </label>
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              {form.logoUrl ? (
                <div className="relative group shrink-0">
                  <img
                    src={form.logoUrl}
                    alt="Store Logo"
                    className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                    className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-md hover:bg-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload-input"
                />
                <label
                  htmlFor="logo-upload-input"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-2xs transition-all"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span>{form.logoUrl ? "Change Logo" : "Upload Store Logo"}</span>
                </label>
                <p className="text-[10px] text-slate-400">
                  Recommended: Transparent PNG or black/white SVG/JPEG (max 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Basic Store Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-blue-500" />
                <span>Store Name</span>
              </label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm((prev) => ({ ...prev, storeName: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-bold outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span>Telephone / Phone</span>
              </label>
              <input
                type="text"
                required
                value={form.storePhone}
                onChange={(e) => setForm((prev) => ({ ...prev, storePhone: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Store Address</span>
              </label>
              <input
                type="text"
                required
                value={form.storeAddress}
                onChange={(e) => setForm((prev) => ({ ...prev, storeAddress: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-blue-500" />
                <span>RC / Registration No.</span>
              </label>
              <input
                type="text"
                value={form.rcNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, rcNumber: e.target.value }))}
                placeholder="e.g. RC: 938472-A"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Social Handle / Website
              </label>
              <input
                type="text"
                value={form.socialHandle || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, socialHandle: e.target.value }))}
                placeholder="@faramastore"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer Note */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Receipt Footer Message
            </label>
            <textarea
              rows={2}
              value={form.footerText}
              onChange={(e) => setForm((prev) => ({ ...prev, footerText: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Thermal Printer Paper & Auto-print Settings */}
          <div className="p-3.5 bg-blue-50/50 dark:bg-slate-900/60 rounded-2xl border border-blue-100 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                  Auto-Print Thermal Receipt on Checkout
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Automatically trigger printer dialog after completing sale
                </span>
              </div>
              <input
                type="checkbox"
                checked={form.autoPrint}
                onChange={(e) => setForm((prev) => ({ ...prev, autoPrint: e.target.checked }))}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                Thermal Roll Paper Width
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, paperWidth: "80mm" }))}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    form.paperWidth === "80mm"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200"
                  }`}
                >
                  80mm Standard
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, paperWidth: "58mm" }))}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    form.paperWidth === "58mm"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200"
                  }`}
                >
                  58mm Mini
                </button>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceiptConfigModal;
