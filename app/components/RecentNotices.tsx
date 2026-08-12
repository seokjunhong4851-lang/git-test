"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
type Notice = { id: string; title: string; createdAt: string; important?: boolean };
export function RecentNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  useEffect(() => { try { const saved = JSON.parse(window.localStorage.getItem("tsv-notices") || "[]") as Notice[]; setNotices(saved.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)); } catch { setNotices([]); } }, []);
  if (notices.length === 0) return null;
  return <ul className="featured-recent" aria-label="최근 공지 제목">{notices.map((notice) => <li key={notice.id}><Link href={`/notices#notice-${notice.id}`}>{notice.important && <b>중요</b>}<span>{notice.title}</span></Link></li>)}</ul>;
}
