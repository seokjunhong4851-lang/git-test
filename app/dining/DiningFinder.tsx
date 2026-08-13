"use client";

import { FormEvent, useEffect, useState } from "react";
import { FeatureLayout } from "../components/FeatureLayout";
import { Modal } from "../components/Modal";
import { StoredItem, useSharedCollection } from "../hooks/useSharedCollection";

const categories = [{ name: "한식", icon: "🍚" }, { name: "중식", icon: "🥟" }, { name: "일식", icon: "🍣" }, { name: "양식", icon: "🍝" }, { name: "기타", icon: "🍽️" }];
const CENTER = { lat: 37.2188, lng: 127.0772 };
type Place = { id: string; place_name: string; category_name: string; road_address_name: string; address_name: string; phone: string; distance: string; place_url: string; x: string; y: string };
type Candidate = StoredItem & { name: string; category: string; detail: string; url: string };

export function DiningFinder() {
  const candidates = useSharedCollection<Candidate>("tsv-dining-places");
  const [category, setCategory] = useState("한식"); const [places, setPlaces] = useState<Place[]>([]); const [configured, setConfigured] = useState<boolean | null>(null); const [loading, setLoading] = useState(false); const [manualOpen, setManualOpen] = useState(false);
  useEffect(() => { setLoading(true); fetch(`/api/restaurants?category=${encodeURIComponent(category)}`).then((response) => response.json()).then((data) => { setPlaces(data.places || []); setConfigured(Boolean(data.configured)); }).catch(() => { setPlaces([]); setConfigured(false); }).finally(() => setLoading(false)); }, [category]);
  const query = encodeURIComponent(`삼성전자 화성캠퍼스 H3정문 ${category} 맛집`);
  const naverUrl = `https://map.naver.com/p/search/${query}`; const kakaoUrl = `https://map.kakao.com/?q=${query}`;
  function addCandidate(place: Place) { if (candidates.items.some((item) => item.name === place.place_name)) return; candidates.add({ name: place.place_name, category, detail: `${place.road_address_name || place.address_name}${place.distance ? ` · 약 ${place.distance}m` : ""}`, url: place.place_url }); }
  function addManual(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); candidates.add({ name: String(data.get("name")), category, detail: String(data.get("detail")), url: "" }); setManualOpen(false); }

  return <FeatureLayout icon="🍽️" title="회식 장소" description="삼성전자로 1 H3 Gate를 기준으로 이번 달 회식 장소를 찾아봅니다." action={<button className="primary-button" onClick={() => setManualOpen(true)}>＋ 후보 직접 추가</button>}>
    <section className="food-vote-panel"><p>이번 달 회식으로 먹고 싶은 음식은?</p><div className="food-categories">{categories.map((item) => <button className={category === item.name ? "selected" : ""} onClick={() => setCategory(item.name)} key={item.name}><span>{item.icon}</span>{item.name}</button>)}</div></section>
    <div className="dining-layout"><section className="map-panel"><div className="map-title"><div><span className="current-dot" />현재 기준 위치</div><strong>삼성전자 화성캠퍼스 H3 Gate</strong><small>경기도 화성시 삼성전자로 1</small></div><iframe title="H3 Gate 주변 지도" src={`https://www.openstreetmap.org/export/embed.html?bbox=${CENTER.lng - .018}%2C${CENTER.lat - .012}%2C${CENTER.lng + .018}%2C${CENTER.lat + .012}&layer=mapnik&marker=${CENTER.lat}%2C${CENTER.lng}`} loading="lazy" /><div className="map-links"><a href={naverUrl} target="_blank" rel="noreferrer">네이버지도에서 보기</a><a href={kakaoUrl} target="_blank" rel="noreferrer">카카오맵에서 보기</a></div></section>
      <section className="recommendation-panel"><div className="recommendation-head"><div><span>{category}</span><h2>H3 Gate 근처 추천</h2></div><small>거리순 최대 12곳</small></div>{loading ? <div className="place-empty">주변 맛집을 찾고 있습니다…</div> : places.length > 0 ? <div className="place-list">{places.map((place) => <article key={place.id}><div><h3>{place.place_name}</h3><p>{place.road_address_name || place.address_name}</p><small>{place.distance ? `약 ${place.distance}m` : "거리 정보 없음"} {place.phone && `· ${place.phone}`}</small></div><div><a href={place.place_url} target="_blank" rel="noreferrer">지도</a><button onClick={() => addCandidate(place)}>후보 추가</button></div></article>)}</div> : <div className="place-empty"><b>{configured === false ? "지도 검색 연결 준비 중" : "검색 결과가 없습니다."}</b><p>현재는 네이버지도 또는 카카오맵에서 실제 주변 결과를 바로 확인할 수 있습니다.</p><div><a href={naverUrl} target="_blank" rel="noreferrer">네이버 추천 보기</a><a href={kakaoUrl} target="_blank" rel="noreferrer">카카오 추천 보기</a></div></div>}</section></div>
    <section className="candidate-panel"><div className="candidate-title"><h2>우리 팀 회식 후보</h2><span>{candidates.items.length}곳</span></div>{candidates.items.length === 0 ? <p className="candidate-empty">마음에 드는 장소를 후보로 추가해 보세요.</p> : <div className="candidate-chips">{candidates.items.map((candidate) => <div key={candidate.id}><span>{candidate.category}</span>{candidate.url ? <a href={candidate.url} target="_blank" rel="noreferrer">{candidate.name}</a> : <b>{candidate.name}</b>}<button onClick={() => candidates.remove(candidate.id)} aria-label={`${candidate.name} 후보 삭제`}>×</button></div>)}</div>}</section>
    {manualOpen && <Modal title="회식 장소 후보 추가" onClose={() => setManualOpen(false)}><form className="entry-form" onSubmit={addManual}><label>장소 이름<input name="name" required autoFocus /></label><label>주소 또는 추천 이유<textarea name="detail" rows={4} /></label><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setManualOpen(false)}>취소</button><button className="primary-button">후보 저장</button></div></form></Modal>}
  </FeatureLayout>;
}
