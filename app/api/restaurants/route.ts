import { NextRequest, NextResponse } from "next/server";

const CENTER = { longitude: "127.0772", latitude: "37.2188" };
const allowed = new Set(["한식", "중식", "일식", "양식", "기타"]);

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") || "한식";
  if (!allowed.has(category)) return NextResponse.json({ error: "지원하지 않는 음식 종류입니다." }, { status: 400 });
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return NextResponse.json({ configured: false, places: [] });

  const query = category === "기타" ? "화성 삼성전자 H3 맛집" : `화성 삼성전자 H3 ${category} 맛집`;
  const params = new URLSearchParams({ query, x: CENTER.longitude, y: CENTER.latitude, radius: "5000", sort: "distance", size: "12", category_group_code: "FD6" });
  const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params}`, { headers: { Authorization: `KakaoAK ${key}` }, next: { revalidate: 1800 } });
  if (!response.ok) return NextResponse.json({ configured: true, places: [], error: "음식점 정보를 불러오지 못했습니다." }, { status: 502 });
  const result = await response.json();
  return NextResponse.json({ configured: true, places: result.documents });
}
