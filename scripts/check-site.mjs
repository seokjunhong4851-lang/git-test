const baseUrl = (process.env.SITE_URL || process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const routes = [
  ["/", "슬기로운 TSV 생활"], ["/notices", "공지사항"], ["/members", "멤버 소개"],
  ["/attendance", "근태캘린더"], ["/ladder", "근무표 사다리"], ["/dining", "회식 장소"],
];
let failed = 0;
console.log(`\n사이트 점검 시작: ${baseUrl}\n`);
for (const [route, expectedText] of routes) {
  try {
    const response = await fetch(`${baseUrl}${route}`, { redirect: "follow" });
    const html = await response.text();
    const ok = response.ok && html.includes(expectedText);
    console.log(`${ok ? "✅" : "❌"} ${route.padEnd(14)} 상태 ${response.status} / 문구 '${expectedText}'`);
    if (!ok) failed += 1;
  } catch (error) {
    console.log(`❌ ${route.padEnd(14)} 연결 실패: ${error.message}`); failed += 1;
  }
}
if (failed) { console.error(`\n${failed}개 항목에서 문제가 발견되었습니다.`); process.exit(1); }
console.log("\n모든 페이지 주소가 정상입니다.\n");
