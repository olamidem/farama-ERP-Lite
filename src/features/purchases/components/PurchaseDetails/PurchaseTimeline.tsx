import { Check, Calendar } from "lucide-react";
import { PURCHASE_STATUS } from "../../constant/purchase.constants";
import { formatDate } from "../../../../utils/formatDate";
import type { Purchase } from "../../types/purchase";

interface PurchaseTimelineProps {
  purchase: Purchase;
}

const PurchaseTimeline = ({ purchase }: PurchaseTimelineProps) => {
  const createdTime = new Date(purchase.created_at).getTime();
  const updatedTime = new Date(purchase.updated_at).getTime();
  const isEdited = updatedTime - createdTime > 3000; // Updated at least 3 seconds after creation

  const steps = [
    {
      title: "Purchase Created",
      description: `Requisition created on ${formatDate(purchase.created_at, true)} by Store Manager`,
      isCompleted: true,
      isActive: false,
    },
    {
      title: "Purchase Edited",
      description: isEdited
        ? `Last updated on ${formatDate(purchase.updated_at, true)}`
        : "No edits recorded for this PO",
      isCompleted: isEdited,
      isActive: !isEdited && purchase.status === "PENDING",
    },
    {
      title: "Goods Received",
      description:
        purchase.received_percentage && purchase.received_percentage > 0
          ? purchase.received_percentage === 100
            ? `All items received (100%)`
            : `Partially received (${purchase.received_percentage}%)`
          : "Awaiting delivery from supplier",
      isCompleted:
        !!purchase.received_percentage && purchase.received_percentage > 0,
      isActive: !purchase.received_percentage && purchase.status === "APPROVED",
    },
    {
      title: "Purchase Closed",
      description:
        purchase.status === PURCHASE_STATUS.RECEIVED
          ? `Closed and archived on ${formatDate(purchase.updated_at, true)}`
          : "Pending final goods receipt",
      isCompleted: purchase.status === PURCHASE_STATUS.RECEIVED,
      isActive: purchase.status === PURCHASE_STATUS.PARTIALLY_RECEIVED,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-3xs transition-colors">
      <h4 className="mb-6 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
        <Calendar size={14} className="text-blue-500 dark:text-blue-400" />
        <span>Purchase Timeline</span>
      </h4>

      <div className="relative ml-2.5 border-l-2 border-slate-100 dark:border-slate-800 pl-6 space-y-6">
        {steps.map((step) => {
          let iconContainer = "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 ring-4 ring-white dark:ring-slate-900";
          let icon = <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />;

          if (step.isCompleted) {
            iconContainer = "bg-emerald-500 text-white ring-4 ring-emerald-50 dark:ring-emerald-950/40";
            icon = <Check size={11} strokeWidth={3} />;
          } else if (step.isActive) {
            iconContainer = "bg-blue-600 dark:bg-blue-500 text-white ring-4 ring-blue-50 dark:ring-blue-950/40";
            icon = <div className="h-2 w-2 rounded-full bg-white" />;
          }

          return (
            <div key={step.title} className="relative">
              {/* Dot Icon */}
              <div
                className={`absolute -left-8.75 top-0 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 ${iconContainer}`}
              >
                {icon}
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                  {step.title}
                </h5>

                <p className="mt-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PurchaseTimeline;
