"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Users,
  MessageCircle,
  UserCheck,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "@/lib/appContext";

export function CompanyBadge({
  companyName,
  status,
}: {
  companyName: string;
  status: "VERIFIED" | "FORMER_EMPLOYEE" | "EXPIRED";
}) {
  if (status === "VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        현직 · {companyName}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
      전 직장 · {companyName}
    </span>
  );
}

export function MannerTempBadge({ temp }: { temp: number }) {
  const color =
    temp >= 39
      ? "text-rose-600 bg-rose-50 border-rose-200"
      : temp >= 36.5
      ? "text-amber-600 bg-amber-50 border-amber-200"
      : "text-slate-600 bg-slate-100 border-slate-200";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${color}`}
    >
      🌡️ {temp.toFixed(1)}°C
    </span>
  );
}

export function AppShell({
  children,
  title,
  rightAction,
}: {
  children: React.ReactNode;
  title?: string;
  rightAction?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, chats } = useApp();
  const unreadTotal = chats.reduce((acc, c) => acc + c.unread, 0);

  const navItems = [
    { href: "/", label: "1:1 매칭", icon: Heart },
    { href: "/events", label: "단체 모임", icon: Users },
    {
      href: "/chat",
      label: "채팅",
      icon: MessageCircle,
      badge: unreadTotal > 0 ? unreadTotal : undefined,
    },
    { href: "/profile", label: "마이/인증", icon: UserCheck },
  ];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50 shadow-2xl border-x border-slate-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 text-sm font-bold text-white shadow-sm">
            판
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-slate-900">
                {title ?? "판교밋"}
              </h1>
              <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                <MapPin className="h-3 w-3 text-rose-500" />
                판교
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {user.companyStatus === "VERIFIED"
                ? `${user.companyName} 인증됨 · D-${user.daysUntilExpire}`
                : `전 직장(${user.companyName}) · 재인증 필요`}
            </p>
          </div>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-24">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 z-30 w-full max-w-md border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="grid grid-cols-4 py-1.5">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors ${
                  active
                    ? "text-rose-600"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`h-5 w-5 ${active ? "fill-rose-500/15" : ""}`}
                  />
                  {item.badge && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
