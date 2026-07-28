export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  remarks?: string;
}

export interface UpdateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  remarks?: string;
}

export interface CustomerSearchFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
}