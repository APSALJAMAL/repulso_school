"use client";

import Image from "next/image";
import logo from "@/app/favicon.ico";

export default function Navbar() {
  return <Image src={logo} alt="Logo" className="size-12" />;
}
