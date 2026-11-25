import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/appContext";

export const metadata: Metadata = {
  title: "판교밋 (PangyoMeet) — 판교 직장인 소개팅 & 로테이션 모임",
  description:
    "6개월 회사 메일 인증과 판교 생활권 인증으로 만나는 1:1 매칭 및 주선자 큐레이션 단체 소개팅 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-dvh bg-slate-200/70 text-slate-900">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
