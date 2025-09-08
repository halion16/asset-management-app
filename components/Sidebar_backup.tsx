'use client';

import { 
  Home, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Users, 
  MapPin,
  Wrench,
  FileText,
  ChevronDown,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { 
    name: "Ordini di lavoro", 
    icon: Home, 
    href: "/", 
    count: 1,
    subItems: [
      { name: "Da eseguire", href: "/work-orders/pending" },
      { name: "Fatto", href: "/work-orders/completed" }
    ]
  },
  { 
    name: "Ordini di acquisto", 
    icon: ShoppingCart, 
    href: "/purchase-orders"
  },
  { 
    name: "Reportistica", 
    icon: BarChart3, 
    href: "/reports" 
  },
  { 
    name: "Calendar", 
    icon: Calendar, 
    href: "/calendar" 
  },
  { 
    name: "Documenti", 
    icon: FileText, 
    href: "/documents" 
  },
  { 
    name: "Parti e Scorte", 
    icon: Package, 
    href: "/parts" 
  },
  { 
    name: "Richieste", 
    icon: MessageSquare, 
    href: "/requests" 
  },
  { 
    name: "Attrezzature", 
    icon: Package, 
    href: "/assets" 
  },
  { 
    name: "Automazioni", 
    icon: Settings, 
    href: "/automations",
    lock: true
  },
  { 
    name: "Ubicazioni", 
    icon: MapPin, 
    href: "/locations" 
  },
  { 
    name: "Team / Utenti", 
    icon: Users, 
    href: "/team" 
  },
  { 
    name: "Fornitori", 
    icon: Wrench, 
    href: "/suppliers" 
  },
  { 
    name: "Inventario delle parti", 
    icon: Package, 
    href: "/inventory",
    lock: true
  },
  { 
    name: "Libreria", 
    icon: FileText, 
    href: "/library",
    expanded: true,
    subItems: [
      { name: "Contatti", href: "/library/contacts" },
      { name: "Automazioni", href: "/library/automations" },
      { name: "Ubicazioni", href: "/library/locations" },
      { name: "Fornitori", href: "/library/suppliers" }
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">X</span>
          </div>
          <span className="font-semibold text-gray-900">Asset Manager</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.name}>
              <div>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                    {item.lock && (
                      <div className="w-3 h-3 border border-gray-400 rounded-sm bg-white">
                        <div className="w-1 h-1 bg-gray-400 rounded-full mx-auto mt-0.5"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.count && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {item.count}
                      </span>
                    )}
                    {item.subItems && (
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        item.expanded ? "rotate-180" : ""
                      )} />
                    )}
                  </div>
                </Link>
                
                {/* Sub Items */}
                {item.subItems && item.expanded && (
                  <ul className="mt-1 ml-8 space-y-1">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.href}
                          className={cn(
                            "block px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors",
                            pathname === subItem.href && "text-blue-700 bg-blue-50"
                          )}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">DL</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">David Luchetta</p>
            <button 
              onClick={() => {
                if (window.confirm('Vuoi disconnetterti?')) {
                  localStorage.removeItem('authUser');
                  window.location.href = '/login';
                }
              }}
              className="text-xs text-gray-500 hover:text-red-600"
            >
              Disconnetti
            </button>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}