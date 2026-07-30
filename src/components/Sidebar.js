"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE_ITEMS = [
  { href: "/than-so-hoc", icon: "🎁", label: "Quà Tặng TSH", module: 1 },
  { href: "/hoach-dinh-tai-chinh", icon: "📊", label: "Hoạch Định Tài Chính", module: 2 },
  { href: "/tinh-phi-quyen-loi", icon: "🛡️", label: "Tính Phí Quyền Lợi", module: 3 },
  { href: "/so-sanh-dong-phi", icon: "🔀", label: "So Sánh Đóng Phí", module: 4 },
  { href: "/khach-hang", icon: "👥", label: "Khách Hàng Đã Lưu", module: 5 },
  { href: "/phuong-an-da-luu", icon: "💾", label: "Phương Án Đã Lưu", module: 6 },
];

export default function Sidebar({ isAdmin, open }) {
  const pathname = usePathname();

  const items = isAdmin
    ? [...BASE_ITEMS, { href: "/admin", icon: "⚙️", label: "Tạo Tài Khoản", module: 7 }]
    : BASE_ITEMS;

  return (
    <aside
      className={`fixed md:static top-14 md:top-auto bottom-0 md:bottom-auto left-0 z-[95] w-[250px] shrink-0 h-[calc(100vh-56px)] md:h-auto overflow-y-auto bg-sidebar-bg border-r border-sidebar-border p-4 no-print transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <Link
        href="/"
        className={`relative flex items-center gap-2 w-full rounded-[9px] mb-3 px-[11px] py-[7px] text-[12.5px] transition ${
          pathname === "/"
            ? "bg-brand-light border border-brand-accent/[0.27] text-brand-accent font-bold shadow-[0_2px_8px_rgba(211,17,69,0.15)]"
            : "bg-white border border-[#EAE4D6] text-sidebar-text font-semibold shadow-sm hover:bg-gray-50"
        }`}
      >
        {pathname === "/" && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-[3px] bg-brand-accent" />
        )}
        <span className="text-sm shrink-0">▶</span>
        <span className="flex-1">Bắt đầu tư vấn</span>
      </Link>

      <div className="h-px bg-black/[0.06] mx-0.5 mb-3" />

      <nav className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2 w-full rounded-[9px] px-[11px] py-[7px] text-[12.5px] transition ${
                active
                  ? "bg-brand-light border border-brand-accent/[0.27] text-brand-accent font-bold shadow-[0_2px_8px_rgba(211,17,69,0.15)]"
                  : "bg-white border border-[#EAE4D6] text-sidebar-text font-semibold shadow-sm hover:bg-gray-50"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-[3px] bg-brand-accent" />
              )}
              <span className="text-[15px] shrink-0">{item.icon}</span>
              <span className="shrink-0 w-[15px] text-[10.5px] font-extrabold text-sidebar-muted">
                {item.module}
              </span>
              <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
