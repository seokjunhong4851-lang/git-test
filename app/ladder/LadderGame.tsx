"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { FeatureLayout } from "../components/FeatureLayout";
import { Modal } from "../components/Modal";

const DEFAULT_MEMBERS = ["조려진", "류호석", "홍석준", "박종화", "임창선", "김명주", "반고은", "문효민", "신재경", "전인준"];
const PATH_COLORS = ["#e45765", "#287c65", "#477fd1", "#8b5cc7", "#e68a35", "#258ba0", "#be5b93", "#71843e", "#5d6b89", "#b06c43"];
type Rung = { row: number; left: number };
type Point = { x: number; y: number };

function createRungs(memberCount: number): Rung[] {
  const rungs: Rung[] = [];
  const rows = Math.max(13, memberCount * 2);
  for (let row = 1; row <= rows; row += 1) {
    let previous = -2;
    for (let left = 0; left < memberCount - 1; left += 1) {
      if (left !== previous + 1 && Math.random() < 0.32) {
        rungs.push({ row, left }); previous = left;
      }
    }
  }
  return rungs;
}

function shuffle<T>(values: T[]): T[] {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function calculatePath(start: number, count: number, rungs: Rung[], width: number, height: number): { points: Point[]; end: number } {
  const padX = 42; const top = 28; const bottom = height - 28; const maxRow = Math.max(...rungs.map((rung) => rung.row), 1) + 1;
  const xAt = (column: number) => padX + (column * (width - padX * 2)) / Math.max(1, count - 1);
  const yAt = (row: number) => top + (row * (bottom - top)) / maxRow;
  let column = start; const points: Point[] = [{ x: xAt(column), y: top }];
  for (let row = 1; row <= maxRow; row += 1) {
    const y = yAt(row); points.push({ x: xAt(column), y });
    const rung = rungs.find((item) => item.row === row && (item.left === column || item.left + 1 === column));
    if (rung) { column = rung.left === column ? column + 1 : column - 1; points.push({ x: xAt(column), y }); }
  }
  return { points, end: column };
}

function LadderCanvas({ members, rungs, progress }: { members: string[]; rungs: Rung[]; progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const container = canvas.parentElement; if (!container) return;
    const draw = () => {
      const width = Math.max(720, container.clientWidth); const height = 440; const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio; canvas.height = height * ratio; canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      const context = canvas.getContext("2d"); if (!context) return; context.scale(ratio, ratio); context.clearRect(0, 0, width, height);
      const padX = 42; const top = 28; const bottom = height - 28; const maxRow = Math.max(...rungs.map((rung) => rung.row), 1) + 1;
      const xAt = (column: number) => padX + (column * (width - padX * 2)) / Math.max(1, members.length - 1); const yAt = (row: number) => top + (row * (bottom - top)) / maxRow;
      context.lineCap = "round"; context.strokeStyle = "#cbd7d2"; context.lineWidth = 4;
      members.forEach((_, column) => { context.beginPath(); context.moveTo(xAt(column), top); context.lineTo(xAt(column), bottom); context.stroke(); });
      rungs.forEach((rung) => { context.beginPath(); context.moveTo(xAt(rung.left), yAt(rung.row)); context.lineTo(xAt(rung.left + 1), yAt(rung.row)); context.stroke(); });
      if (progress <= 0) return;
      members.forEach((_, index) => {
        const path = calculatePath(index, members.length, rungs, width, height).points; const segmentProgress = progress * (path.length - 1); const complete = Math.floor(segmentProgress); const partial = segmentProgress - complete;
        context.strokeStyle = PATH_COLORS[index % PATH_COLORS.length]; context.lineWidth = 5; context.beginPath(); context.moveTo(path[0].x, path[0].y);
        for (let point = 1; point <= Math.min(complete, path.length - 1); point += 1) context.lineTo(path[point].x, path[point].y);
        if (complete < path.length - 1) { const from = path[complete]; const to = path[complete + 1]; context.lineTo(from.x + (to.x - from.x) * partial, from.y + (to.y - from.y) * partial); }
        context.stroke();
      });
    };
    draw(); const observer = new ResizeObserver(draw); observer.observe(container); return () => observer.disconnect();
  }, [members, rungs, progress]);
  return <canvas ref={canvasRef} role="img" aria-label={`${members.length}명이 참여하는 사다리 게임`} />;
}

export function LadderGame() {
  const [members, setMembers] = useState(DEFAULT_MEMBERS); const [winnerCount, setWinnerCount] = useState(1);
  const [rungs, setRungs] = useState<Rung[]>(() => createRungs(DEFAULT_MEMBERS.length)); const [winningSlots, setWinningSlots] = useState<number[]>([]);
  const [progress, setProgress] = useState(0); const [running, setRunning] = useState(false); const [finished, setFinished] = useState(false); const [revealed, setRevealed] = useState(false); const [editing, setEditing] = useState(false); const [shareStatus, setShareStatus] = useState("");
  const outcomes = useMemo(() => members.map((_, index) => calculatePath(index, members.length, rungs, 1000, 440).end), [members, rungs]);
  const winners = useMemo(() => members.filter((_, index) => winningSlots.includes(outcomes[index])), [members, outcomes, winningSlots]);

  function reset(nextMembers = members) { setRungs(createRungs(nextMembers.length)); setWinningSlots([]); setProgress(0); setRunning(false); setFinished(false); setRevealed(false); setShareStatus(""); }
  function startGame() {
    const slots = shuffle(Array.from({ length: members.length }, (_, index) => index)).slice(0, winnerCount); setWinningSlots(slots); setRunning(true); setFinished(false); setRevealed(false); setProgress(0);
    const started = performance.now(); const duration = 3800;
    function frame(now: number) { const value = Math.min(1, (now - started) / duration); setProgress(1 - Math.pow(1 - value, 3)); if (value < 1) requestAnimationFrame(frame); else { setRunning(false); setFinished(true); } }
    requestAnimationFrame(frame);
  }
  async function shareResult() {
    const text = `🎉 TSV 근무표 사다리 결과\n당첨 ${winners.length}명: ${winners.join(", ")}`;
    try { if (navigator.share) await navigator.share({ title: "TSV 근무표 사다리 결과", text }); else { await navigator.clipboard.writeText(text); setShareStatus("결과가 클립보드에 복사되었습니다."); } } catch { setShareStatus("공유가 취소되었습니다."); }
  }
  function addMember(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const name = String(data.get("name")).trim(); if (name && !members.includes(name)) { const next = [...members, name]; setMembers(next); reset(next); form.reset(); } }
  function removeMember(name: string) { if (members.length <= 2) return; const next = members.filter((member) => member !== name); setMembers(next); setWinnerCount((count) => Math.min(count, next.length - 1)); reset(next); }

  return <FeatureLayout icon="🪜" title="근무표 사다리" description="참가자 모두가 실제 경로를 따라가는 공정한 사다리 게임입니다." action={<button className="secondary-button" onClick={() => setEditing(true)}>＋ 참가자 편집</button>}>
    <section className="ladder-control-panel"><div><label htmlFor="winner-count">당첨 인원</label><select id="winner-count" value={winnerCount} onChange={(event) => { setWinnerCount(Number(event.target.value)); reset(); }} disabled={running}>{Array.from({ length: Math.max(1, members.length - 1) }, (_, index) => <option value={index + 1} key={index + 1}>{index + 1}명</option>)}</select></div><p>참가자 <b>{members.length}명</b> 중 <b>{winnerCount}명</b>이 당첨됩니다.</p><button className="secondary-button" onClick={() => reset()} disabled={running}>새 사다리</button><button className="primary-button ladder-start" onClick={startGame} disabled={running}>{running ? "사다리 타는 중…" : finished ? "다시 시작" : "사다리 시작"}</button></section>
    <section className="ladder-game-panel">
      <div className="ladder-labels" style={{ gridTemplateColumns: `repeat(${members.length}, minmax(64px, 1fr))` }}>{members.map((member, index) => <span style={{ color: PATH_COLORS[index % PATH_COLORS.length] }} key={member}>{member}</span>)}</div>
      <div className="ladder-canvas-wrap"><LadderCanvas members={members} rungs={rungs} progress={progress} /></div>
      <div className="ladder-results-slots" style={{ gridTemplateColumns: `repeat(${members.length}, minmax(64px, 1fr))` }}>{members.map((_, index) => <span className={finished && winningSlots.includes(index) ? "winning-slot" : ""} key={index}>{revealed ? (winningSlots.includes(index) ? "당첨" : "통과") : "?"}</span>)}</div>
    </section>
    <section className={`ladder-result-box ${finished ? "ready" : ""}`} aria-live="polite">{!finished ? <><b>결과는 게임이 끝날 때까지 비공개입니다.</b><span>사다리 시작 버튼을 눌러 주세요.</span></> : !revealed ? <><b>사다리 타기가 끝났습니다!</b><span>결과는 아직 숨겨져 있습니다.</span><button className="reveal-button" onClick={() => setRevealed(true)}>🎁 결과 공개</button></> : <><span className="result-celebration">🎉 당첨자 발표 🎉</span><h2>{winners.join(" · ")}</h2><p>총 {winners.length}명이 당첨되었습니다.</p><button className="primary-button" onClick={shareResult}>결과 공유</button>{shareStatus && <small>{shareStatus}</small>}</>}</section>
    {editing && <Modal title="사다리 참가자 편집" onClose={() => setEditing(false)}><div className="participant-list">{members.map((member) => <div key={member}><span>{member}</span><button className="danger-button" onClick={() => removeMember(member)} disabled={members.length <= 2}>삭제</button></div>)}</div><form className="participant-add" onSubmit={addMember}><input name="name" placeholder="새 참가자 이름" required maxLength={20} /><button className="primary-button">추가</button></form><p className="modal-help">참가자는 최소 2명이 필요합니다. 변경하면 새로운 사다리가 자동 생성됩니다.</p></Modal>}
  </FeatureLayout>;
}
