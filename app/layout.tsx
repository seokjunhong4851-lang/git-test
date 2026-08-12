import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "슬기로운 TSV 생활",
  description: "TSV 팀의 공지, 멤버, 근태, 근무표와 회식 장소를 함께 관리하는 대시보드",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
