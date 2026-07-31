import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  format?: string;
  width?: number;
  height?: number;
  fontSize?: number;
  className?: string;
  displayValue?: boolean;
}

export const Barcode = ({
  value,
  format = "CODE128",
  width = 1.5,
  height = 45,
  fontSize = 11,
  className = "",
  displayValue = true,
}: BarcodeProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          displayValue,
          fontOptions: "bold",
          font: "monospace",
          fontSize,
          margin: 6,
          background: "transparent",
          lineColor: "#000000",
        });
      } catch (err) {
        console.error("Barcode render error:", err);
      }
    }
  }, [value, format, width, height, fontSize, displayValue]);

  if (!value) return null;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg ref={svgRef} className="max-w-full h-auto" />
    </div>
  );
};

export default Barcode;
