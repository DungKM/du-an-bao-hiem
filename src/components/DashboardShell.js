"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardShell({ user, daysLeft, isAdmin, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar user={user} daysLeft={daysLeft} onMenuClick={() => setSidebarOpen((v) => !v)} />
      <div className="flex-1 flex justify-center">
        <div className="flex w-full max-w-7xl">
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-[90] md:hidden no-print"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <Sidebar isAdmin={isAdmin} open={sidebarOpen} />
          <main className="flex-1 p-4 sm:p-6 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
