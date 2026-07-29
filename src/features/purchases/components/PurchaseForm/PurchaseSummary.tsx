import { Calendar, FileText } from "lucide-react";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import Label from "../../../../components/ui/Label";

interface PurchaseSummaryProps {
  purchaseDate: string;
  setPurchaseDate: (value: string) => void;

  expectedDeliveryDate: string;
  setExpectedDeliveryDate: (value: string) => void;

  remarks: string;
  setRemarks: (value: string) => void;

  isSubmitting: boolean;
  onCancel: () => void;
  buttonText?: string;
}

const PurchaseSummary = ({
  purchaseDate,
  setPurchaseDate,
  expectedDeliveryDate,
  setExpectedDeliveryDate,
  remarks,
  setRemarks,
  isSubmitting,
  onCancel,
  buttonText = "Create Purchase Order",
}: PurchaseSummaryProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors">
      <h3 className="mb-6 text-base font-bold text-slate-800 dark:text-slate-100">
        Logistics & Metadata
      </h3>

      <div className="space-y-5">
        <div>
          <Label className="flex items-center gap-2">
            <Calendar size={14} />
            Purchase Date
          </Label>

          <Input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Calendar size={14} />
            Expected Delivery Date
          </Label>

          <Input
            type="date"
            value={expectedDeliveryDate}
            onChange={(e) =>
              setExpectedDeliveryDate(e.target.value)
            }
          />
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <FileText size={14} />
            Remarks
          </Label>

          <textarea
            rows={4}
            value={remarks}
            onChange={(e) =>
              setRemarks(e.target.value)
            }
            placeholder="Additional notes..."
            className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900"
          />
        </div>

        <div className="space-y-3 pt-4">
          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
          >
            {buttonText}
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSummary;