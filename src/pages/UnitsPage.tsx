import { useState, useMemo } from "react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import { useUnits } from "../features/units/hooks/useUnits";
import { useRestoreUnit } from "../features/units/hooks/useUnitMutations";
import UnitSummary from "../features/units/components/UnitSummary";
import UnitToolbar from "../features/units/components/UnitToolbar";
import UnitTable from "../features/units/components/UnitTable";
import AddUnitPanel from "../features/units/components/AddUnitPanel";
import EditUnitPanel from "../features/units/components/EditUnitPanel";
import DeleteUnitModal from "../features/units/components/DeleteUnitModal";
import DataTableEmpty from "../components/ui/DataTable/DataTableEmpty";
import Pagination from "../components/ui/pagination/Pagination";
import { Scale } from "lucide-react";
import type { Unit } from "../features/units/types/unit";

const UnitsPage = () => {
  // Filters State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [scope, setScope] = useState("");

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem("units-page-size");
    return saved ? Number(saved) : 10;
  });

  // Sort State
  const [sortBy, setSortBy] = useState<"name" | "symbol">("name");
  const [ascending, setAscending] = useState(true);

  // Panels & Modals State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [archivingUnit, setArchivingUnit] = useState<Unit | null>(null);

  // Queries & Mutations
  const { data: units = [], isLoading } = useUnits();
  const { mutateAsync: restoreUnit } = useRestoreUnit();

  const handleSort = (column: "name" | "symbol") => {
    if (sortBy === column) {
      setAscending((prev) => !prev);
    } else {
      setSortBy(column);
      setAscending(true);
    }
    setPage(1);
  };

  const handleRestore = async (unit: Unit) => {
    await restoreUnit(unit.id);
  };

  // Filter and Sort units locally
  const filteredUnits = useMemo(() => {
    let result = [...units];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.symbol.toLowerCase().includes(q),
      );
    }

    // Status filter
    if (status === "active") {
      result = result.filter((u) => u.is_active);
    } else if (status === "inactive") {
      result = result.filter((u) => !u.is_active);
    }

    // Scope filter
    if (scope === "system") {
      result = result.filter((u) => u.is_system);
    } else if (scope === "custom") {
      result = result.filter((u) => !u.is_system);
    }

    // Sort
    result.sort((a, b) => {
      const valA = String(a[sortBy]).toLowerCase();
      const valB = String(b[sortBy]).toLowerCase();
      return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    return result;
  }, [units, search, status, scope, sortBy, ascending]);

  // Paginated list
  const paginatedUnits = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredUnits.slice(startIndex, startIndex + pageSize);
  }, [filteredUnits, page, pageSize]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Units of Measurement"
        description="Manage standard units (e.g., box, pieces, kg) to specify product packaging sizes."
      >
        <Button onClick={() => setIsAddOpen(true)}>Add Unit</Button>
      </PageHeader>

      <UnitSummary units={units} />

      <UnitToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        scope={scope}
        onScopeChange={(val) => {
          setScope(val);
          setPage(1);
        }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-500 font-medium">Loading units...</p>
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <DataTableEmpty
            icon={Scale}
            title={
              search || status || scope
                ? "No Matching Units"
                : "No Units Defined"
            }
            description={
              search || status || scope
                ? "Try adjusting your filters or search term to locate the unit."
                : "Create your first unit of measurement to start referencing it in inventory."
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <UnitTable
            units={paginatedUnits}
            isLoading={isLoading}
            sortBy={sortBy}
            ascending={ascending}
            onSort={handleSort}
            onEdit={(unit) => setEditingUnit(unit)}
            onArchive={(unit) => setArchivingUnit(unit)}
            onRestore={handleRestore}
          />

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={filteredUnits.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
              localStorage.setItem("units-page-size", String(size));
            }}
            itemName="units"
          />
        </div>
      )}

      {/* Panels and Modals */}
      <AddUnitPanel open={isAddOpen} onClose={() => setIsAddOpen(false)} />

      <EditUnitPanel
        open={!!editingUnit}
        unit={editingUnit}
        onClose={() => setEditingUnit(null)}
      />

      <DeleteUnitModal
        open={!!archivingUnit}
        unit={archivingUnit}
        onClose={() => setArchivingUnit(null)}
      />
    </div>
  );
};

export default UnitsPage;
