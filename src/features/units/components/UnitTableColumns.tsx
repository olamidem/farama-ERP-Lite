import type { ColumnDef } from "@tanstack/react-table";
import type { Unit } from "../types/unit";
import Badge from "../../../components/ui/Badge";
import SortableHeader from "../../../components/ui/DataTable/SortableHeader";
import {
  Pencil,
  Archive,
  RotateCcw,
  ShieldCheck,
  Layers,
  Lock,
} from "lucide-react";

export const AVATAR_COLORS = [
  "bg-indigo-50 border-indigo-100 text-indigo-600",
  "bg-emerald-50 border-emerald-100 text-emerald-600",
  "bg-blue-50 border-blue-100 text-blue-600",
  "bg-violet-50 border-violet-100 text-violet-600",
  "bg-rose-50 border-rose-100 text-rose-600",
  "bg-orange-50 border-orange-100 text-orange-600",
  "bg-teal-50 border-teal-100 text-teal-600",
];

interface GetUnitTableColumnsOptions {
  sortBy: "name" | "symbol";
  ascending: boolean;
  onSort: (column: "name" | "symbol") => void;
  onEdit: (unit: Unit) => void;
  onArchive: (unit: Unit) => void;
  onRestore: (unit: Unit) => void;
}

export const getUnitTableColumns = ({
  sortBy,
  ascending,
  onSort,
  onEdit,
  onArchive,
  onRestore,
}: GetUnitTableColumnsOptions): ColumnDef<Unit>[] => [
  {
    accessorKey: "name",
    header: () => (
      <SortableHeader
        label="Unit Name"
        column="name"
        currentSort={sortBy}
        ascending={ascending}
        onSort={onSort}
      />
    ),
    cell: ({ row }) => {
      const unit = row.original;
      const firstLetter = unit.name.charAt(0).toUpperCase();

      // Consistent colored avatar background per unit
      const charCodeSum = unit.name
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const colorClass = AVATAR_COLORS[charCodeSum % AVATAR_COLORS.length];

      return (
        <div
          className="flex items-center gap-3"
          id={`unit-name-container-${unit.id}`}
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold shadow-sm ${colorClass}`}
          >
            {firstLetter}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {unit.name}
            </span>
            {unit.is_system && (
              <span title="System unit - Read-only">
                <Lock size={12} className="text-slate-400 dark:text-slate-500 shrink-0" />
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "symbol",
    header: () => (
      <SortableHeader
        label="Symbol"
        column="symbol"
        currentSort={sortBy}
        ascending={ascending}
        onSort={onSort}
      />
    ),
    cell: ({ row }) => (
      <span className="rounded-md font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 px-2 py-0.5">
        {row.original.symbol}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
        {row.original.description || "No description provided"}
      </span>
    ),
  },
  {
    accessorKey: "is_system",
    header: "Scope",
    cell: ({ row }) => {
      const isSystem = row.original.is_system;
      return isSystem ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 rounded px-1.5 py-0.5">
          <ShieldCheck size={12} />
          <span>System</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
          <Layers size={12} />
          <span>Custom</span>
        </span>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return isActive ? (
        <Badge variant="success" size="sm">
          Active
        </Badge>
      ) : (
        <Badge variant="default" size="sm">
          Inactive
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const unit = row.original;
      const isSystem = unit.is_system;

      return (
        <div
          className="flex items-center gap-1.5"
          id={`unit-actions-container-${unit.id}`}
        >
          <button
            id={`unit-edit-btn-${unit.id}`}
            onClick={() => onEdit(unit)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition duration-150 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
            title={isSystem ? "System units cannot be edited" : "Edit Unit"}
            disabled={isSystem}
          >
            <Pencil size={14} />
          </button>

          {unit.is_active ? (
            <button
              id={`unit-archive-btn-${unit.id}`}
              onClick={() => onArchive(unit)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition duration-150 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              title={
                isSystem ? "System units cannot be archived" : "Archive Unit"
              }
              disabled={isSystem}
            >
              <Archive size={14} />
            </button>
          ) : (
            <button
              id={`unit-restore-btn-${unit.id}`}
              onClick={() => onRestore(unit)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition duration-150 cursor-pointer"
              title="Restore Unit"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      );
    },
  },
];
