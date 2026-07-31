/**
 * useThermalPrinter — React Hook
 * Manages thermal printer connection state and provides print actions
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { thermalPrinter, type ReceiptPrintData, type PrinterConnection } from "../services/thermal/escpos-printer";

export interface UseThermalPrinterReturn {
  isSupported: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  isPrinting: boolean;
  error: string | null;
  connect: () => Promise<PrinterConnection | undefined>;
  disconnect: () => Promise<void>;
  printReceipt: (data: ReceiptPrintData, paperWidth?: 58 | 80) => Promise<boolean>;
  printRaw: (data: Uint8Array) => Promise<boolean>;
  testPrint: () => Promise<boolean>;
  clearError: () => void;
}

export function useThermalPrinter(): UseThermalPrinterReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<PrinterConnection | null>(null);

  const isSupported = thermalPrinter.isSupported();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(thermalPrinter.isConnected());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const conn = await thermalPrinter.connect();
      connectionRef.current = conn;
      setIsConnected(true);
      return conn;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to connect printer";
      setError(msg);
      setIsConnected(false);
      return undefined;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setError(null);
    try {
      await thermalPrinter.disconnect();
      connectionRef.current = null;
      setIsConnected(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to disconnect";
      setError(msg);
    }
  }, []);

  const printReceipt = useCallback(async (data: ReceiptPrintData, paperWidth: 58 | 80 = 58): Promise<boolean> => {
    setIsPrinting(true);
    setError(null);
    try {
      if (!thermalPrinter.isConnected()) {
        const conn = await thermalPrinter.connect();
        if (!conn) return false;
      }
      await thermalPrinter.printReceipt(data, paperWidth);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Print failed";
      setError(msg);
      if (!thermalPrinter.isConnected()) setIsConnected(false);
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, []);

  const printRaw = useCallback(async (data: Uint8Array): Promise<boolean> => {
    setIsPrinting(true);
    setError(null);
    try {
      if (!thermalPrinter.isConnected()) {
        const conn = await thermalPrinter.connect();
        if (!conn) return false;
      }
      await thermalPrinter.sendRaw(data);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Raw print failed";
      setError(msg);
      if (!thermalPrinter.isConnected()) setIsConnected(false);
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, []);

  const testPrint = useCallback(async (): Promise<boolean> => {
    setIsPrinting(true);
    setError(null);
    try {
      if (!thermalPrinter.isConnected()) {
        const conn = await thermalPrinter.connect();
        if (!conn) return false;
      }
      await thermalPrinter.initialize();
      await thermalPrinter.align(1);
      await thermalPrinter.bold(true);
      await thermalPrinter.setSize(2, 2);
      await thermalPrinter.text("TEST PRINT\n");
      await thermalPrinter.setSize(1, 1);
      await thermalPrinter.bold(false);
      await thermalPrinter.feed(1);
      await thermalPrinter.align(0);
      await thermalPrinter.text("Left align test\n");
      await thermalPrinter.align(2);
      await thermalPrinter.text("Right align test\n");
      await thermalPrinter.align(1);
      await thermalPrinter.text("--- Barcode ---\n");
      await thermalPrinter.printBarcode("TEST-12345", "CODE128", 2, 50);
      await thermalPrinter.feed(2);
      await thermalPrinter.text("--- QR Code ---\n");
      await thermalPrinter.printQRCode("https://farama.store", 6);
      await thermalPrinter.feed(3);
      await thermalPrinter.cut(0);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Test print failed";
      setError(msg);
      if (!thermalPrinter.isConnected()) setIsConnected(false);
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    isSupported,
    isConnected,
    isConnecting,
    isPrinting,
    error,
    connect,
    disconnect,
    printReceipt,
    printRaw,
    testPrint,
    clearError,
  };
}

export default useThermalPrinter;
