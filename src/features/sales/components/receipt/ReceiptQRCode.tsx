import { QRCodeSVG } from "qrcode.react";

interface ReceiptQRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const ReceiptQRCode = ({
  value,
  size = 110,
  className = "",
}: ReceiptQRCodeProps) => {
  if (!value) return null;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        includeMargin={true}
        className="max-w-full h-auto"
      />
    </div>
  );
};

export default ReceiptQRCode;
