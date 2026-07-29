import {
  CheckCircle2,
  ShoppingBag,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { formatDate } from "../../../../utils/formatDate";
import type { SupplierWithStats } from "../../types/supplier";
import { useSupplierPurchases } from "../../hooks/useSupplierPurchase";

interface SupplierTimelineProps {
  supplier: SupplierWithStats;
}

interface TimelinePurchase {
  id: string;
  purchase_number?: string;
  purchase_date?: string;
  created_at: string;
  status: string;
  total_amount?: number;
  updated_at?: string;
}

export default function SupplierTimeline({ supplier }: SupplierTimelineProps) {
  const { data: purchases = [], isLoading } = useSupplierPurchases(supplier.id);

  if (isLoading) {
    return (
      <div className="py-6 text-center text-xs text-slate-400">
        Loading timeline events...
      </div>
    );
  }

  // Compile timeline events dynamically
  interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    icon: LucideIcon;
    color: string;
  }

  const events: TimelineEvent[] = [];

  // 1. Add supplier registration
  events.push({
    id: "registration",
    title: "Supplier Registered",
    description: `Registered "${supplier.name}" as an active supplier in the directory.`,
    date: supplier.supplierSince || supplier.created_at,
    icon: UserPlus,
    color: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50",
  });

  // 2. Add purchase events
  (purchases as TimelinePurchase[]).forEach((p) => {
    const poNum = p.purchase_number || `PO-${p.id.slice(0, 8)}`;

    // Purchase creation
    events.push({
      id: `create-${p.id}`,
      title: "Purchase Order Issued",
      description: `Issued purchase order ${poNum} for a total of ${new Intl.NumberFormat(
        "en-PH",
        {
          style: "currency",
          currency: "PHP",
        },
      ).format(p.total_amount || 0)}.`,
      date: p.purchase_date || p.created_at,
      icon: ShoppingBag,
      color: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
    });

    // Purchase completion/receiving
    if (p.status === "RECEIVED") {
      events.push({
        id: `receive-${p.id}`,
        title: "Goods Received",
        description: `Successfully received all goods and updated stock for purchase order ${poNum}.`,
        date: p.updated_at || p.created_at,
        icon: CheckCircle2,
        color: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
      });
    }
  });

  // Sort timeline events descending by date
  events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, idx) => {
          const Icon = event.icon;
          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {idx !== events.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100 dark:bg-slate-800"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${event.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {event.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {event.description}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <time dateTime={event.date}>
                        {formatDate(event.date)}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
