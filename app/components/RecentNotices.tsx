"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Notice = { id: string; title: string; createdAt: string; important?: boolean };

export function RecentNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("tsv-notices") || "[]") as Notice[];
      setNotices(saved.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3));
    } catch { setNotices([]); }
  }, []);

  return <section className="recent-notices" aria-label="최근 공지사항">
    <div className="recent-notices-head"><strong>최근 공지</strong><Link href="/notices">전체 보기 →</Link></div>
    {notices.length === 0 ? <p>아직 등록된 공지사항이 없습니다.</p> : <ol>{notices.map((notice) => <li key={notice.id}><Link href="/notices">{notice.important && <span>중요</span>}<b>{notice.title}</b></Link></li>)}</ol>}
  </section>;
}
