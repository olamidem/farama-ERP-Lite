import { useState, useCallback } from "react";
import type { Customer } from "../types/customer";

export function useCustomerModals() {
  // Customer Edit/Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerToEdit, setSelectedCustomerToEdit] = useState<Customer | null>(null);

  // Delete Customer Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Top Up Modal
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [customerToTopUp, setCustomerToTopUp] = useState<Customer | null>(null);

  // Dedicated Wallet Deposit Modal
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositCustomer, setDepositCustomer] = useState<Customer | null>(null);

  // Dedicated Wallet Withdraw Modal
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawCustomer, setWithdrawCustomer] = useState<Customer | null>(null);

  // Dedicated Wallet Statement Modal
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null);

  // Open Handlers
  const openCreateModal = useCallback(() => {
    setSelectedCustomerToEdit(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((customer: Customer) => {
    setSelectedCustomerToEdit(customer);
    setIsModalOpen(true);
  }, []);

  const closeCustomerModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCustomerToEdit(null);
  }, []);

  const openDeleteModal = useCallback((customer: Customer) => {
    if (customer.id === "walk-in-customer-id") return;
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setCustomerToDelete(null);
  }, []);

  const openTopUpModal = useCallback((customer: Customer) => {
    setCustomerToTopUp(customer);
    setIsTopUpOpen(true);
  }, []);

  const closeTopUpModal = useCallback(() => {
    setIsTopUpOpen(false);
    setCustomerToTopUp(null);
  }, []);

  const openDepositModal = useCallback((customer: Customer) => {
    setDepositCustomer(customer);
    setIsDepositOpen(true);
  }, []);

  const closeDepositModal = useCallback(() => {
    setIsDepositOpen(false);
    setDepositCustomer(null);
  }, []);

  const openWithdrawModal = useCallback((customer: Customer) => {
    setWithdrawCustomer(customer);
    setIsWithdrawOpen(true);
  }, []);

  const closeWithdrawModal = useCallback(() => {
    setIsWithdrawOpen(false);
    setWithdrawCustomer(null);
  }, []);

  const openStatementModal = useCallback((customer: Customer) => {
    setStatementCustomer(customer);
    setIsStatementOpen(true);
  }, []);

  const closeStatementModal = useCallback(() => {
    setIsStatementOpen(false);
    setStatementCustomer(null);
  }, []);

  return {
    // States
    isModalOpen,
    selectedCustomerToEdit,
    isDeleteModalOpen,
    customerToDelete,
    isTopUpOpen,
    customerToTopUp,
    isDepositOpen,
    depositCustomer,
    isWithdrawOpen,
    withdrawCustomer,
    isStatementOpen,
    statementCustomer,

    // Action Handlers
    openCreateModal,
    openEditModal,
    closeCustomerModal,
    openDeleteModal,
    closeDeleteModal,
    openTopUpModal,
    closeTopUpModal,
    openDepositModal,
    closeDepositModal,
    openWithdrawModal,
    closeWithdrawModal,
    openStatementModal,
    closeStatementModal,
  };
}
