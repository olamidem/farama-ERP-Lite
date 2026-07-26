const permissionsList = [
  {
    code: "catalog_read",
    module: "Catalog",
    name: "Read Products & Categories",
    description:
      "Enables viewing products, variations, units and general categorizations.",
  },
  {
    code: "catalog_write",
    module: "Catalog",
    name: "Write Products & Categories",
    description:
      "Enables creating, updating, importing, or deleting store catalogue entries.",
  },
  {
    code: "inventory_read",
    module: "Inventory",
    name: "Read Inventory Levels",
    description:
      "Provides read-only access to stock ledgers, counts, and warehouse values.",
  },
  {
    code: "inventory_write",
    module: "Inventory",
    name: "Perform Stock Adjustments",
    description:
      "Enables performing physical stock counts, stock corrections, and manual transfers.",
  },
  {
    code: "purchases_manage",
    module: "Inventory",
    name: "Manage Supplier Purchase Orders",
    description:
      "Provides full control over incoming restock requests, purchase forms, and invoices.",
  },
  {
    code: "staff_manage",
    module: "Staff",
    name: "Administrate Organization",
    description:
      "Enables resetting staff PINs, creating/suspending users, and editing role assignments.",
  },
  {
    code: "settings_manage",
    module: "System",
    name: "Manage System Settings",
    description:
      "Enables configuring tax structures, default currencies, store hours, and automated backup routines.",
  },
];

export const PermissionTab = () => {
  return (
    <div id="permissions-tab" className="space-y-6 text-left">
      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Module
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                System Identifier
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Display Title
              </th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {permissionsList.map((perm) => (
              <tr key={perm.code} className="hover:bg-slate-50/50 transition">
                <td className="py-4 px-6 font-black text-indigo-600 uppercase tracking-wider">
                  {perm.module}
                </td>
                <td className="py-4 px-6">
                  <code className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono font-bold text-slate-600">
                    {perm.code}
                  </code>
                </td>
                <td className="py-4 px-6 font-bold text-slate-800">
                  {perm.name}
                </td>
                <td className="py-4 px-6 font-medium text-slate-400">
                  {perm.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Also export as PermissionsTab for maximum compatibility
export { PermissionTab as PermissionsTab };
export default PermissionTab;   