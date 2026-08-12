"use client";
import { FormEvent, useState } from "react";
import { FeatureLayout } from "../components/FeatureLayout";
import { Modal } from "../components/Modal";
import { StoredItem, useLocalCollection } from "../hooks/useLocalCollection";
export type Member = StoredItem & { name: string; role: string; email: string; annualLeave: number };
export function MemberBoard() {
  const store = useLocalCollection<Member>("tsv-members"); const [open, setOpen] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); store.add({ name: String(data.get("name")), role: String(data.get("role")), email: String(data.get("email")), annualLeave: Number(data.get("annualLeave")) }); setOpen(false); }
  return <FeatureLayout icon="👥" title="멤버 소개" description="TSV 팀원과 담당 업무를 함께 관리합니다." action={<button className="primary-button" onClick={() => setOpen(true)}>＋ 그룹 멤버 추가</button>}><section className="content-panel">{store.items.length === 0 ? <div className="empty-state"><b>등록된 멤버가 없습니다.</b><span>그룹 멤버를 추가해 보세요.</span></div> : <div className="member-grid">{store.items.map((member) => <article className="member-card" key={member.id}><div className="avatar">{member.name.slice(0, 1)}</div><div><h2>{member.name}</h2><p>{member.role || "담당 업무 미정"}</p><small>{member.email || "이메일 미등록"}</small><span className="leave-chip">연차 {member.annualLeave}일</span></div><button className="danger-button" onClick={() => store.remove(member.id)} aria-label={`${member.name} 삭제`}>삭제</button></article>)}</div>}</section>{open && <Modal title="그룹 멤버 추가" onClose={() => setOpen(false)}><form className="entry-form" onSubmit={submit}><label>이름<input name="name" required autoFocus /></label><label>담당 업무<input name="role" /></label><label>이메일<input name="email" type="email" /></label><label>연간 연차 개수<input name="annualLeave" type="number" min="0" step="0.5" defaultValue="15" required /></label><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setOpen(false)}>취소</button><button className="primary-button">저장</button></div></form></Modal>}</FeatureLayout>;
}
