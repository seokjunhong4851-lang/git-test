import { DashboardMenu } from "./components/DashboardMenu";

export default function Home() {
  return (
    <main className="dashboard-shell">
      <header className="hero">
        <span className="eyebrow">TSV TEAM DASHBOARD</span>
        <h1>슬기로운 TSV 생활</h1>
        <p>우리 팀의 소식과 일정을 한곳에서 확인하고 함께 관리해요.</p>
      </header>
      <DashboardMenu />
    </main>
  );
}
