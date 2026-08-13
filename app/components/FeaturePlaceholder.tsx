import Link from "next/link";

type FeaturePlaceholderProps = {
  icon: string;
  title: string;
  description: string;
};

export function FeaturePlaceholder({ icon, title, description }: FeaturePlaceholderProps) {
  return (
    <main className="feature-shell">
      <Link className="back-link" href="/">← 홈으로 돌아가기</Link>
      <section className="feature-panel">
        <span className="feature-icon" aria-hidden="true">{icon}</span>
        <p className="section-label">TSV TEAM DASHBOARD</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="coming-soon">이 기능은 다음 단계에서 함께 완성할 예정입니다.</div>
      </section>
    </main>
  );
}
