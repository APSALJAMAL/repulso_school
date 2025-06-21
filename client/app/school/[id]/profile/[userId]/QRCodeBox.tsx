// components/QRCodeBox.tsx
"use client";

import { QRCodeCanvas } from "qrcode.react";

type Props = {
  value: string;
  logoUrl?: string;
  className?: string; // allow custom styling
};

export default function QRCodeBox({ value, logoUrl, className = "" }: Props) {
  return (
    <div className={`flex justify-center ${className}`}>
      <QRCodeCanvas
        value={value}
        size={200}
        level="H"
        includeMargin
        imageSettings={{
          src: logoUrl || "/default-logo.png",
          height: 60,
          width: 60,
          excavate: true,
        }}
      />
    </div>
  );
}
