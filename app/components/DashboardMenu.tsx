import Link from "next/link";
import { dashboardMenus } from "../config/menu";
import { RecentNotices } from "./RecentNotices";
export function DashboardMenu() {
  const menus = dashboardMenus.filter((menu) => menu.enabled !== false); const featuredMenu = menus.find((menu) => menu.featured); const standardMenus = menus.filter((menu) => !menu.featured);
  return <nav aria-label="TSV 대시보드 메뉴" className="menu-area">
    {featuredMenu && <div className="menu-card featured-card"><div className="featured-main">
      <Link href={featuredMenu.href} aria-label="공지사항 전체 보기"><span className="menu-icon" aria-hidden="true">{featuredMenu.icon}</span></Link>
      <div className="featured-content"><Link className="featured-copy" href={featuredMenu.href}><strong>{featuredMenu.title}</strong><small>{featuredMenu.description}</small></Link><RecentNotices /></div>
      <Link className="menu-arrow" href={featuredMenu.href} aria-label="공지사항 전체 보기">→</Link>
    </div></div>}
    <p className="section-label">TEAM MENU</p><div className="menu-grid">{standardMenus.map((menu) => <Link className="menu-card" href={menu.href} key={menu.id}><span className="menu-icon" aria-hidden="true">{menu.icon}</span><span><strong>{menu.title}</strong><small>{menu.description}</small></span><span className="menu-arrow" aria-hidden="true">→</span></Link>)}</div>
  </nav>;
}
