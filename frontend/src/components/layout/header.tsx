"use client";
import { Bell, Search, UserCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  if (pathname === '/visit-request' || pathname.startsWith('/verify/')) {
    return null;
  }

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="flex w-full items-center">
        <div className="relative flex w-full max-w-md items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="ស្វែងរករបាយការណ៍ គំរូឯកសារ..."
            className="h-9 w-full rounded-md border border-gray-300 bg-gray-50 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
          </span>
        </button>
        <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
          <UserCircle className="h-6 w-6" />
          <span className="text-sm font-medium">
            {user ? `${user.full_name} (${user.role})` : "Loading..."}
          </span>
        </button>
      </div>
    </header>
  );
}
