import Link from "next/link";
import type { ReactNode } from "react";
export function FeatureLayout({ icon, title, description, action, children }: { icon: string; title: string; description: string; action?: ReactNode; children: ReactNode }) {
  return <main className="feature-shell"><Link className="back-link" href="/">← 메인으로 돌아가기</Link><header className="feature-header"><div className="feature-title-wrap"><span className="feature-icon" aria-hidden="true">{icon}</span><div><p className="section-label">TSV TEAM DASHBOARD</p><h1>{title}</h1><p>{description}</p></div></div>{action}</header>{children}<p className="development-note">현재 개발용 저장소를 사용합니다. Supabase 연결 전에는 이 브라우저에만 내용이 저장됩니다.</p></main>;
}
