import { NextResponse } from "next/server";

export async function GET(_request: Request, context: { params: Promise<{ year: string }> }) {
  const { year } = await context.params;
  if (!/^20\d{2}$/.test(year)) return NextResponse.json({ error: "잘못된 연도입니다." }, { status: 400 });
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/KR`, { next: { revalidate: 60 * 60 * 24 * 7 } });
    if (!response.ok) throw new Error("공휴일 서버 응답 오류");
    const holidays = await response.json();
    return NextResponse.json(holidays);
  } catch {
    return NextResponse.json([], { status: 200, headers: { "X-Holiday-Warning": "unavailable" } });
  }
}
