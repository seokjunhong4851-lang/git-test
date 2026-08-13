"use client";

import Link from "next/link";
import { StoredItem, useSharedCollection } from "../hooks/useSharedCollection";

type Notice = StoredItem & { title: string; important?: boolean };

export function RecentNotices() {
  const notices = useSharedCollection<Notice>("tsv-notices");
  const recent = notices.items
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  if (!notices.ready || recent.length === 0) return null;
  return (
    <ul className="featured-recent" aria-label="최근 공지 제목">
      {recent.map((notice) => (
        <li key={notice.id}>
          <Link href={`/notices#notice-${notice.id}`}>
            {notice.important && <b>중요</b>}
            <span>{notice.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
