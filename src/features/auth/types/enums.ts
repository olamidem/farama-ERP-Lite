export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
  PENDING: "PENDING",
  INVITED: "INVITED",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const ROLE_NAME = {
  ADMINISTRATOR: "Administrator",
  MANAGER: "Manager",
  ACCOUNTANT: "Accountant",
  STOREKEEPER: "Storekeeper",
  CASHIER: "Cashier",
} as const;

export type RoleName = (typeof ROLE_NAME)[keyof typeof ROLE_NAME];
