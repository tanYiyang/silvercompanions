import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import Provider from "@/components/Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Silver Companions",
  description: "Volunteer Matching Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
        <Navbar/>
          <main className="flex flex-col h-full w-full justify-center items-center pt-16">
          {children}
          </main>
          <Toaster />
        </Provider>

        </body>
    </html>
  );
}
