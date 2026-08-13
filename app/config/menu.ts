export type MenuItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  featured?: boolean;
  enabled?: boolean;
};

/**
 * 홈 화면의 메뉴는 이 배열 하나에서 관리합니다.
 * 추가: 항목을 복사한 뒤 id와 href가 겹치지 않게 수정합니다.
 * 숨김: enabled를 false로 바꿉니다.
 * 삭제: Git에 백업(커밋)한 뒤 해당 항목과 연결된 기능 폴더를 제거합니다.
 */
export const dashboardMenus: MenuItem[] = [
  {
    id: "notices",
    title: "공지사항",
    description: "팀의 새로운 소식과 꼭 확인해야 할 내용을 모아봐요.",
    icon: "📢",
    href: "/notices",
    featured: true,
    enabled: true,
  },
  {
    id: "members",
    title: "멤버 소개",
    description: "함께 일하는 TSV 멤버를 소개합니다.",
    icon: "👥",
    href: "/members",
    enabled: true,
  },
  {
    id: "attendance",
    title: "근태캘린더",
    description: "휴가와 근무 일정을 한눈에 확인해요.",
    icon: "🗓️",
    href: "/attendance",
    enabled: true,
  },
  {
    id: "ladder",
    title: "근무표 사다리",
    description: "공정하고 재미있게 근무 순서를 정해요.",
    icon: "🪜",
    href: "/ladder",
    enabled: true,
  },
  {
    id: "dining",
    title: "회식 장소",
    description: "함께 가고 싶은 맛집 후보를 모아봐요.",
    icon: "🍽️",
    href: "/dining",
    enabled: true,
  },
];
