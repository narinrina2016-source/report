"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Settings, Users, FolderOpen, Inbox, CalendarHeart } from 'lucide-react';

const navigation = [
  { name: 'ទំព័រដើម (Dashboard)', href: '/', icon: LayoutDashboard },
  { name: 'របាយការណ៍ (Reports)', href: '/reports', icon: FileText },
  { name: 'លិខិតចេញចូល (Documents)', href: '/documents', icon: Inbox },
  { name: 'សំណើសុំទស្សនកិច្ច (Visits)', href: '/visit-requests', icon: CalendarHeart },
  { name: 'គំរូឯកសារ (Templates)', href: '/templates', icon: FolderOpen },
  { name: 'អ្នកប្រើប្រាស់ (Users)', href: '/users', icon: Users },
  { name: 'ការកំណត់ (Settings)', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  
  if (pathname === '/visit-request' || pathname.startsWith('/verify/')) {
    return null;
  }

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <h1 className="text-lg font-bold">ប្រព័ន្ធគ្រប់គ្រងរបាយការណ៍</h1>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-4">
        <nav className="flex-1 space-y-1 px-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white"
            >
              <item.icon
                className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-white"
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
