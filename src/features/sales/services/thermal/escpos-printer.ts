/**
 * ESC/POS Thermal Printer Service
 * Direct USB/Serial communication via Web Serial API — no window.print()
 * 
 * Requirements: Chrome/Edge/Opera with Web Serial API support
 * Tested with: Epson TM-T20, Xprinter, Hoin, Goojprt, and generic 58mm/80mm thermal printers
 */

declare global {
  interface Navigator {
    serial: {
      requestPort(options?: { filters?: Array<{ usbVendorId?: number; usbProductId?: number }> }): Promise<SerialPort>;
      getPorts(): Promise<SerialPort[]>;
    };
  }

  interface SerialPort {
    open(options: { baudRate: number; dataBits?: number; stopBits?: number; parity?: string }): Promise<void>;
    close(): Promise<void>;
    writable: WritableStream<Uint8Array>;
    getInfo(): SerialPortInfo;
  }

  interface SerialPortInfo {
    usbVendorId?: number;
    usbProductId?: number;
  }
}

export interface PrinterConnection {
  port: SerialPort;
  writer: WritableStreamDefaultWriter<Uint8Array>;
  info: SerialPortInfo;
}

export interface PrintOptions {
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: "none" | "even" | "odd";
}

export interface ReceiptPrintData {
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  rcNumber?: string;
  receiptNumber: string;
  date: string;
  cashierName?: string;
  customerName: string;
  paymentMethod: string;
  items: Array<{
    name: string;
    unit_name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid?: number;
  balanceDue?: number;
  change?: number;
  currencySymbol?: string;
}

const DEFAULT_OPTIONS: PrintOptions = {
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
};

export class EscPosPrinter {
  private connection: PrinterConnection | null = null;
  private encoder = new TextEncoder();

  // ESC/POS Command constants
  private readonly ESC = 0x1b;
  private readonly GS = 0x1d;
  private readonly LF = 0x0a;

  /**
   * Check if Web Serial API is supported in current browser
   */
  isSupported(): boolean {
    return typeof navigator !== "undefined" && "serial" in navigator;
  }

  /**
   * Request USB Serial port from browser
   * User must select their thermal printer from the browser popup
   */
  async connect(options: PrintOptions = {}): Promise<PrinterConnection> {
    if (!this.isSupported()) {
      throw new Error("Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.");
    }

    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      const port = await navigator.serial.requestPort({ filters: [] });

      await port.open({
        baudRate: opts.baudRate!,
        dataBits: opts.dataBits,
        stopBits: opts.stopBits,
        parity: opts.parity,
      });

      const writer = port.writable.getWriter();
      const info = port.getInfo();

      this.connection = { port, writer, info };

      // Initialize printer
      await this.initialize();

      return this.connection;
    } catch (error) {
      throw new Error(`Failed to connect printer: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
  }

  /**
   * Disconnect and release resources
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.writer.close();
        await this.connection.port.close();
      } catch {
        // Ignore cleanup errors
      }
      this.connection = null;
    }
  }

  /**
   * Check if printer is connected
   */
  isConnected(): boolean {
    return this.connection !== null;
  }

  /**
   * Initialize/reset printer to default state
   */
  async initialize(): Promise<void> {
    await this.sendRaw(new Uint8Array([this.ESC, 0x40]));
  }

  /**
   * Send raw bytes to printer
   */
  async sendRaw(data: Uint8Array): Promise<void> {
    if (!this.connection) {
      throw new Error("Printer not connected. Call connect() first.");
    }
    await this.connection.writer.write(data);
  }

  /**
   * Send text string to printer
   */
  async text(str: string): Promise<void> {
    await this.sendRaw(this.encoder.encode(str));
  }

  /**
   * Line feed (move down one line)
   */
  async feed(lines: number = 1): Promise<void> {
    const data = new Uint8Array(lines).fill(this.LF);
    await this.sendRaw(data);
  }

  /**
   * Set text alignment: 0=left, 1=center, 2=right
   */
  async align(mode: 0 | 1 | 2): Promise<void> {
    await this.sendRaw(new Uint8Array([this.ESC, 0x61, mode]));
  }

  /**
   * Set text size: width and height multipliers (1-8)
   */
  async setSize(width: number = 1, height: number = 1): Promise<void> {
    const n = ((width - 1) << 4) | (height - 1);
    await this.sendRaw(new Uint8Array([this.GS, 0x21, n]));
  }

  /**
   * Bold text on/off
   */
  async bold(on: boolean = true): Promise<void> {
    await this.sendRaw(new Uint8Array([this.ESC, 0x45, on ? 0x01 : 0x00]));
  }

  /**
   * Underline: 0=off, 1=thin, 2=thick
   */
  async underline(mode: 0 | 1 | 2 = 0): Promise<void> {
    await this.sendRaw(new Uint8Array([this.ESC, 0x2d, mode]));
  }

  /**
   * Reverse (white on black) on/off
   */
  async reverse(on: boolean = true): Promise<void> {
    await this.sendRaw(new Uint8Array([this.GS, 0x42, on ? 0x01 : 0x00]));
  }

  /**
   * Print and feed paper (in lines)
   */
  async printAndFeed(lines: number = 3): Promise<void> {
    await this.sendRaw(new Uint8Array([this.ESC, 0x64, lines]));
  }

  /**
   * Cut paper: 0=full cut, 1=partial cut
   */
  async cut(mode: 0 | 1 = 0): Promise<void> {
    await this.sendRaw(new Uint8Array([this.GS, 0x56, mode]));
  }

  /**
   * Open cash drawer (if connected)
   */
  async openCashDrawer(): Promise<void> {
    await this.sendRaw(new Uint8Array([this.ESC, 0x70, 0x00, 0x3c, 0xfa]));
  }

  /**
   * Print barcode using native ESC/POS commands
   */
  async printBarcode(
    data: string,
    type: "UPC_A" | "UPC_E" | "EAN13" | "EAN8" | "CODE39" | "ITF" | "CODABAR" | "CODE93" | "CODE128" = "CODE128",
    width: number = 2,
    height: number = 60
  ): Promise<void> {
    const typeMap: Record<string, number> = {
      UPC_A: 0x41,
      UPC_E: 0x42,
      EAN13: 0x43,
      EAN8: 0x44,
      CODE39: 0x45,
      ITF: 0x46,
      CODABAR: 0x47,
      CODE93: 0x48,
      CODE128: 0x49,
    };

    const typeCode = typeMap[type];
    if (!typeCode) throw new Error(`Unsupported barcode type: ${type}`);

    await this.sendRaw(new Uint8Array([this.GS, 0x77, width]));
    await this.sendRaw(new Uint8Array([this.GS, 0x68, height]));
    const encoded = this.encoder.encode(data);
    const cmd = new Uint8Array([this.GS, 0x6b, typeCode, encoded.length, ...encoded]);
    await this.sendRaw(cmd);
  }

  /**
   * Print QR Code using ESC/POS native commands
   */
  async printQRCode(data: string, size: number = 6): Promise<void> {
    const encoded = this.encoder.encode(data);

    await this.sendRaw(new Uint8Array([this.GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]));
    await this.sendRaw(new Uint8Array([this.GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, size]));
    await this.sendRaw(new Uint8Array([this.GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31]));
    const pL = encoded.length + 3;
    const pH = 0;
    await this.sendRaw(new Uint8Array([this.GS, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30, ...encoded]));
    await this.sendRaw(new Uint8Array([this.GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30]));
  }

  /**
   * Print a complete receipt from formatted data
   */
  async printReceipt(receiptData: ReceiptPrintData, paperWidth: 58 | 80 = 58): Promise<void> {
    const { formatReceiptForThermal } = await import("./thermal-receipt");
    const commands = formatReceiptForThermal(receiptData, paperWidth);
    await this.sendRaw(commands);
  }
}

// Singleton instance
export const thermalPrinter = new EscPosPrinter();
export default thermalPrinter;
