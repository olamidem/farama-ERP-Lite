export const routeMeta = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Overview of today's business",
  },

  "/products": {
    title: "Products",
    subtitle: "Manage your product catalog",
  },

  "/products/$productId": {
    title: "Product Details",
    subtitle: "View and update product information",
  },

  "/categories": {
    title: "Categories",
    subtitle: "Organize products",
  },

  "/units": {
    title: "Units",
    subtitle: "Manage measurement units",
  },

  "/inventory": {
    title: "Inventory",
    subtitle: "Monitor stock levels",
  },

  "/purchases": {
    title: "Purchases",
    subtitle: "Manage supplier purchases",
  },

  "/suppliers": {
    title: "Suppliers",
    subtitle: "Manage supplier information",
  },

  "/customers": {
    title: "Customers",
    subtitle: "Manage customer profiles and wallets",
  },

  "/customers/$customerId": {
    title: "Customer Details",
    subtitle: "View customer history and manage store credit",
  },

  "/staff": {
    title: "Staff",
    subtitle: "Manage employees",
  },

  "/profile": {
    title: "Profile",
    subtitle: "Manage your account",
  },

  "/lock-screen": {
    title: "Locked",
    subtitle: "Unlock your session",
  },
} as const;