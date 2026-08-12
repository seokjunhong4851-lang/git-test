"use client";
import { FormEvent, useState } from "react";
import { FeatureLayout } from "./FeatureLayout";
import { Modal } from "./Modal";
import { StoredItem, useLocalCollection } from "../hooks/useLocalCollection";
type Entry = StoredItem & { name: string; detail: string };
export function SimpleListFeature({ storageKey, icon, title, description, addLabel, nameLabel, detailLabel }: { storageKey: string; icon: string; title: string; description: string; addLabel: string; nameLabel: string; detailLabel: string }) {
  const store = useLocalCollection<Entry>(storageKey); const [open, setOpen] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); store.add({ name: String(data.get("name")), detail: String(data.get("detail")) }); setOpen(false); }
  return <FeatureLayout icon={icon} title={title} description={description} action={<button className="primary-button" onClick={() => setOpen(true)}>＋ {addLabel}</button>}><section className="content-panel">{store.items.length === 0 ? <div className="empty-state"><b>등록된 내용이 없습니다.</b><span>{addLabel} 버튼으로 첫 항목을 추가해 보세요.</span></div> : <div className="simple-list">{store.items.map((item) => <article key={item.id}><div><h2>{item.name}</h2><p>{item.detail || "상세 내용 없음"}</p></div><button className="danger-button" onClick={() => store.remove(item.id)}>삭제</button></article>)}</div>}</section>{open && <Modal title={addLabel} onClose={() => setOpen(false)}><form className="entry-form" onSubmit={submit}><label>{nameLabel}<input name="name" required autoFocus /></label><label>{detailLabel}<textarea name="detail" rows={4} /></label><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setOpen(false)}>취소</button><button className="primary-button">저장</button></div></form></Modal>}</FeatureLayout>;
}
