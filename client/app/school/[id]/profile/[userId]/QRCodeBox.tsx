// components/QRCodeBox.tsx
"use client";

import { QRCodeCanvas } from "qrcode.react";

type Props = {
  value: string;
  logoUrl?: string;
};

export default function QRCodeBox({ value, logoUrl }: Props) {
  return (
    <div className="absolute top-8 right-8">
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
