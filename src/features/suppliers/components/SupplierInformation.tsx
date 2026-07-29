import { User, Phone, Mail, MapPin } from "lucide-react";
import type { SupplierWithStats } from "../types/supplier";

interface SupplierInformationProps {
  supplier?: SupplierWithStats;
}

export default function SupplierInformation({
  supplier,
}: SupplierInformationProps) {
  const infoItems = [
    {
      label: "Contact Person",
      value: supplier?.contact_person || "Not Specified",
      icon: User,
    },
    {
      label: "Phone",
      value: supplier?.phone || "Not Specified",
      icon: Phone,
    },
    {
      label: "Email",
      value: supplier?.email || "Not Specified",
      icon: Mail,
    },
    {
      label: "Address",
      value: supplier?.address || "Not Specified",
      icon: MapPin,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border-t border-b border-slate-100 dark:border-slate-800 py-6 my-2 gap-y-4 md:gap-y-0 text-left">
      {infoItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`flex items-start gap-3 px-4 min-w-0 ${
              idx > 0 ? "md:border-l md:border-slate-100 dark:md:border-slate-800" : ""
            }`}
          >
            <Icon className="h-4.5 w-4.5 text-[#4F46E5] dark:text-indigo-400 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                {item.label}
              </p>
              <p
                className="text-[13px] font-bold text-slate-800 dark:text-slate-200 mt-2 truncate leading-normal"
                title={item.value}
              >
                {item.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
