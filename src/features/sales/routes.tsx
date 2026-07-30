import { SalesPage } from "./pages/SalesPage";
import { SalesHistoryPage } from "./pages/SalesHistoryPage";
import { SaleDetailsPage } from "./pages/SaleDetailsPage";

export const salesRoutes = [
  {
    path: "/sales",
    component: SalesPage,
  },
  {
    path: "/sales/history",
    component: SalesHistoryPage,
  },
  {
    path: "/sales/:saleId",
    component: SaleDetailsPage,
  },
];
