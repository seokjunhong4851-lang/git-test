import Link from "next/link";
import { dashboardMenus } from "../config/menu";
import { RecentNotices } from "./RecentNotices";

export function DashboardMenu() {
  const menus = dashboardMenus.filter((menu) => menu.enabled !== false);
  const featuredMenu = menus.find((menu) => menu.featured);
  const standardMenus = menus.filter((menu) => !menu.featured);

  return (
    <nav aria-label="TSV 대시보드 메뉴" className="menu-area">
      {featuredMenu && (
        <Link className="menu-card featured-card" href={featuredMenu.href}>
          <span className="menu-icon" aria-hidden="true">{featuredMenu.icon}</span>
          <span>
            <strong>{featuredMenu.title}</strong>
            <small>{featuredMenu.description}</small>
            <RecentNotices />
          </span>
          <span className="menu-arrow" aria-hidden="true">→</span>
        </Link>
      )}
      <p className="section-label">TEAM MENU</p>
      <div className="menu-grid">
        {standardMenus.map((menu) => (
          <Link className="menu-card" href={menu.href} key={menu.id}>
            <span className="menu-icon" aria-hidden="true">{menu.icon}</span>
            <span>
              <strong>{menu.title}</strong>
              <small>{menu.description}</small>
            </span>
            <span className="menu-arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
