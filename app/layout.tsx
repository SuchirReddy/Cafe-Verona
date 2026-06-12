import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Cafe Veřona Menu & Ordering",
  description: "Browse our menu, place orders, and join our waitlist.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, playfair.variable)}>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-[#F9F6F0] to-[#E8DCCC]">
          {children}
        </div>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
