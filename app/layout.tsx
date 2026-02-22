// app/layout.tsx
import "./globals.css";
import { Nunito } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/categories/CategoryNav";
import type { Metadata } from "next";
import Providers from "./providers";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TANMORE",
  description: "Modern ecommerce site built with Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased`}>
        <Providers>
          <Navbar />
          <CategoryNav />
          <main className="min-h-screen px-6">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
