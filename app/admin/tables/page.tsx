"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, QrCode } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminTablesPage() {
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    // Get the current domain
    setBaseUrl(window.location.origin);
  }, []);

  const tables = Array.from({ length: 10 }, (_, i) => i + 1);

  const downloadQR = (tableNumber: number) => {
    const svg = document.getElementById(`qr-table-${tableNumber}`);
    if (!svg) {
      toast.error("QR Code not found");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      // Draw white background
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      
      const pngFile = canvas.toDataURL("image/png");
      
      // Create download link
      const downloadLink = document.createElement("a");
      downloadLink.download = `Table-${tableNumber}-QR.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
      toast.success(`Downloaded QR for Table ${tableNumber}`);
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-coffee-900 mb-1">Tables & QR Codes</h1>
        <p className="text-coffee-600">Print QR codes for customers to scan and order from their table.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => {
          const url = `${baseUrl}/menu?table=${table}`;
          return (
            <div key={table} className="bg-white p-6 rounded-2xl shadow-sm border border-coffee-200 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-coffee-900">Table {table}</h3>
                <QrCode className="text-coffee-300" size={24} />
              </div>
              
              <div className="bg-white p-4 border-2 border-coffee-100 rounded-xl mb-6 shadow-sm">
                <QRCodeSVG
                  id={`qr-table-${table}`}
                  value={url}
                  size={160}
                  level={"H"}
                  includeMargin={true}
                  fgColor="#4a3022" // coffee-900
                />
              </div>

              <div className="text-center w-full mb-6">
                <p className="text-xs text-coffee-500 font-mono break-all line-clamp-2" title={url}>
                  {url}
                </p>
              </div>

              <button
                onClick={() => downloadQR(table)}
                className="w-full py-2.5 bg-coffee-800 text-cream rounded-xl font-medium hover:bg-coffee-900 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} /> Download PNG
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
