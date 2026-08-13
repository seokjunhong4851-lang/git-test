"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import koLocale from "@fullcalendar/core/locales/ko";
import { EventInput } from "@fullcalendar/core";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { FeatureLayout } from "../components/FeatureLayout";
import { Modal } from "../components/Modal";
import { StoredItem, useSharedCollection } from "../hooks/useSharedCollection";

type Member = StoredItem & { name: string; role: string; email: string; annualLeave: number };
type Schedule = StoredItem & { memberId: string; memberName: string; type: "연차" | "근무" | "GY" | "기타"; start: string; end: string; memo: string };
type Holiday = { date: string; localName: string; name: string };
const colors = { 연차: "#e69a34", 근무: "#26775f", GY: "#7b61c9", 기타: "#3484b8" };

function monthValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function AttendanceCalendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const members = useSharedCollection<Member>("tsv-members");
  const schedules = useSharedCollection<Schedule>("tsv-schedules");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [currentMonth, setCurrentMonth] = useState(monthValue(new Date()));
  const [open, setOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  async function loadHolidays(year: number) {
    try { const response = await fetch(`/api/holidays/${year}`); setHolidays(await response.json()); }
    catch { setHolidays([]); }
  }
  useEffect(() => { loadHolidays(new Date().getFullYear()); }, []);

  const events = useMemo<EventInput[]>(() => [
    ...holidays.map((holiday) => ({ id: `holiday-${holiday.date}`, title: holiday.localName, date: holiday.date, allDay: true, color: "#d94b58", editable: false, classNames: ["holiday-event"] })),
    ...schedules.items.map((schedule) => ({ id: schedule.id, title: `${schedule.memberName} · ${schedule.type}`, start: schedule.start, end: schedule.end || undefined, allDay: true, color: colors[schedule.type], extendedProps: { memo: schedule.memo } })),
  ], [holidays, schedules.items]);

  function move(direction: "prev" | "next" | "today") {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    api[direction]();
  }
  function changeMonth(value: string) {
    if (!value) return;
    setCurrentMonth(value);
    calendarRef.current?.getApi().gotoDate(`${value}-01`);
  }
  function openDate(info: DateClickArg) { setSelectedDate(info.dateStr); setOpen(true); }
  function submitSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const memberId = String(data.get("memberId")); const member = members.items.find((item) => item.id === memberId); if (!member) return;
    schedules.add({ memberId, memberName: member.name, type: String(data.get("type")) as Schedule["type"], start: String(data.get("start")), end: String(data.get("end")), memo: String(data.get("memo")) }); setOpen(false);
  }
  function submitMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); members.add({ name: String(data.get("name")), role: "", email: "", annualLeave: Number(data.get("annualLeave")) }); setMemberOpen(false);
  }

  const leaveCounts = members.items.map((member) => ({ ...member, used: schedules.items.filter((item) => item.memberId === member.id && item.type === "연차").length }));
  return <FeatureLayout icon="🗓️" title="근태캘린더" description="연차, 근무, GY 일정을 달력에서 함께 관리합니다." action={<div className="action-row"><button className="secondary-button" onClick={() => setMemberOpen(true)}>＋ 멤버 추가</button><button className="primary-button" onClick={() => { setSelectedDate(new Date().toISOString().slice(0, 10)); setOpen(true); }}>＋ 일정 추가</button></div>}>
    <div className="leave-summary">{leaveCounts.length === 0 ? <span>멤버를 추가하면 연차 현황이 표시됩니다.</span> : leaveCounts.map((member) => <div className="leave-stat" key={member.id}><b>{member.name}</b><span>사용 {member.used}</span><strong>잔여 {Math.max(0, member.annualLeave - member.used)}</strong></div>)}</div>
    <section className="calendar-panel">
      <div className="calendar-custom-toolbar">
        <div className="calendar-nav"><button onClick={() => move("prev")} aria-label="이전 달">‹</button><button onClick={() => move("next")} aria-label="다음 달">›</button><button onClick={() => move("today")}>오늘</button></div>
        <label className="month-picker"><span className="sr-only">표시할 연도와 월 선택</span><input type="month" value={currentMonth} onChange={(event) => changeMonth(event.target.value)} aria-label="표시할 연도와 월 선택" /></label>
        <div className="calendar-legend"><span className="holiday">공휴일</span><span className="leave">연차</span><span className="work">근무</span><span className="gy">GY</span></div>
      </div>
      <FullCalendar ref={calendarRef} plugins={[dayGridPlugin, interactionPlugin, listPlugin]} initialView="dayGridMonth" locale={koLocale} headerToolbar={false} events={events} dateClick={openDate} dayCellContent={(info) => info.dayNumberText.replace("일", "")} editable selectable eventClick={(info) => { if (!info.event.id.startsWith("holiday-")) { if (window.confirm(`${info.event.title} 일정을 삭제할까요?`)) schedules.remove(info.event.id); } }} datesSet={(info) => { const date = info.view.currentStart; setCurrentMonth(monthValue(date)); loadHolidays(date.getFullYear()); }} height="auto" />
      <p className="calendar-help">월 선택란을 누르면 원하는 연·월로 바로 이동합니다. 날짜를 누르면 일정을 추가하고, 등록된 일정을 누르면 삭제할 수 있습니다.</p>
    </section>
    {open && <Modal title="근태 일정 추가" onClose={() => setOpen(false)}><form className="entry-form" onSubmit={submitSchedule}><label>멤버<select name="memberId" required defaultValue=""><option value="" disabled>멤버 선택</option>{members.items.map((member) => <option value={member.id} key={member.id}>{member.name}</option>)}</select></label><label>일정 종류<select name="type" defaultValue="연차"><option>연차</option><option>근무</option><option>GY</option><option>기타</option></select></label><div className="form-row"><label>시작일<input name="start" type="date" defaultValue={selectedDate} required /></label><label>종료일<input name="end" type="date" defaultValue={selectedDate} /></label></div><label>메모<input name="memo" maxLength={100} /></label>{members.items.length === 0 && <p className="form-warning">먼저 멤버를 추가해 주세요.</p>}<div className="form-actions"><button type="button" className="secondary-button" onClick={() => setOpen(false)}>취소</button><button className="primary-button" disabled={members.items.length === 0}>저장</button></div></form></Modal>}
    {memberOpen && <Modal title="캘린더 멤버 추가" onClose={() => setMemberOpen(false)}><form className="entry-form" onSubmit={submitMember}><label>이름<input name="name" required autoFocus /></label><label>연간 연차 개수<input name="annualLeave" type="number" min="0" step="0.5" defaultValue="15" required /></label><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setMemberOpen(false)}>취소</button><button className="primary-button">저장</button></div></form></Modal>}
  </FeatureLayout>;
}
