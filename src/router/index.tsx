import {
  createBrowserHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { requireAuth } from "./guard";
import DashboardLayout from "../layout/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import LoginScreen from "../pages/Login/LoginScreen";
import ProductsPage from "../pages/ProductsPage";
import CategoryPage from "../pages/CategoryPage";
import UnitsPage from "../pages/UnitsPage";
import ProductDetailsPage from "../features/products/details/ProductDetailsPage";
import InventoryPage from "../pages/InventoryPage";
import PurchasesPage from "../features/purchases/pages/PurchasesPage";
import SuppliersPage from "../features/suppliers/pages/SuppliersPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import LockScreenPage from "../features/auth/pages/LockScreenPage";
import SetPasswordPage from "../features/auth/pages/SetPasswordPage";
import AcceptInvitationPage from "../features/auth/pages/AcceptInvitationPage";
import { StaffPage } from "../features/staff";
import CustomersPage from "../features/customers/pages/CustomersPage";

const rootRoute = createRootRoute();
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoginScreen,
  staticData: {
    title: "Sign In",
    subtitle: "Access your ERP account",
  },
});

const setPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/set-password",
  component: SetPasswordPage,
  staticData: {
    title: "Set Password",
    subtitle: "Activate your account",
  },
});

const acceptInviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/accept-invite",
  component: AcceptInvitationPage,
  staticData: {
    title: "Accept Invitation",
    subtitle: "Join your team",
  },
});

/**
 * Protected Application Layout
 */
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  beforeLoad: requireAuth,
  component: DashboardLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/dashboard",
  component: Dashboard,
  staticData: {
    title: "Dashboard",
    subtitle: "Overview of today's business",
  },
});

const productsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/products",
  component: ProductsPage,
  staticData: {
    title: "Products",
    subtitle: "Manage your product catalog",
  },
});

const productDetailsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/products/$productId",
  component: ProductDetailsPage,
  staticData: {
    title: "Product Details",
    subtitle: "View and update product information",
  },
});

const CategoryRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/categories",
  component: CategoryPage,
  staticData: {
    title: "Categories",
    subtitle: "Organize products into categories",
  },
});

const unitsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/units",
  component: UnitsPage,
  staticData: {
    title: "Units",
    subtitle: "Manage measurement units",
  },
});

const inventoryRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/inventory",
  component: InventoryPage,
  staticData: {
    title: "Inventory",
    subtitle: "Monitor stock levels and availability",
  },
});

const purchasesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/purchases",
  component: PurchasesPage,
  staticData: {
    title: "Purchases",
    subtitle: "Manage supplier purchases",
  },
});

const suppliersRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/suppliers",
  component: SuppliersPage,
  staticData: {
    title: "Suppliers",
    subtitle: "Manage supplier information",
  },
});

const staffRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/staff",
  component: StaffPage,
  staticData: {
    title: "Staff",
    subtitle: "Manage employees, roles and permissions",
  },
});

// const settingsRoute = createRoute({
//   getParentRoute: () => appLayoutRoute,
//   path: "/settings",
//   component: SettingsPage,
// });

const profileRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/profile",
  component: ProfilePage,
  staticData: {
    title: "My Profile",
    subtitle: "Manage your account information",
  },
});

const lockScreenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lock-screen",
  component: LockScreenPage,
  staticData: {
    title: "Session Locked",
    subtitle: "Unlock your session to continue",
  },
});

// const salesRoute = createRoute({
//   getParentRoute: () => appLayoutRoute,
//   path: "/sales",
//   component: SalesPage,
// });

const customersRoute = createRoute({
getParentRoute: () => appLayoutRoute,
 path: "/customers",
component: CustomersPage,
});

/**
 * Route Tree
 */
const routeTree = rootRoute.addChildren([
  loginRoute,
  setPasswordRoute,
  acceptInviteRoute,
  lockScreenRoute,
  appLayoutRoute.addChildren([
    dashboardRoute,
    productsRoute,
    CategoryRoute,
    unitsRoute,
    inventoryRoute,
    productDetailsRoute,
    purchasesRoute,
    suppliersRoute,
    staffRoute,
    // settingsRoute,
    profileRoute,
    // salesRoute,
    customersRoute,
  ]),
]);

/**
 * Router
 */
export const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
});

/**
 * Router Types
 */
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
