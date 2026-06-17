import type { Metadata } from "next";
import { Inter, Geist, Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const kantumruy = Kantumruy_Pro({ subsets: ["khmer", "latin"], variable: "--font-kantumruy" });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Automated Report Management System",
  description: "ARMS Portal for report generation and management",
};

import { AuthProvider } from "@/lib/auth";
import { AppLayout } from "@/components/layout/app-layout";

// ... (geist and kantumruy imports already above)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km" className={cn("font-sans", geist.variable, kantumruy.variable)} suppressHydrationWarning>
      <body className={kantumruy.className} suppressHydrationWarning>
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
