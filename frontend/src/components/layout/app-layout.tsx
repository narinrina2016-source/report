"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/visit-request", "/login"];
const isPublicRoute = (path: string) => {
  return PUBLIC_ROUTES.includes(path) || path.startsWith("/track/");
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const publicRoute = isPublicRoute(pathname || "");

  useEffect(() => {
    if (!isLoading && !publicRoute && !user) {
      router.push("/login");
    }
  }, [user, isLoading, publicRoute, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If on a public route, just render the content without Sidebar/Header
  if (publicRoute) {
    return (
      <main className="min-h-screen bg-gray-50 text-slate-900">
        {children}
      </main>
    );
  }

  // If not logged in and not a public route, don't render content (useEffect will redirect)
  if (!user) {
    return null; 
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 text-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
