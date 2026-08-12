"use client";
import { useEffect, useState } from "react";
export type StoredItem = { id: string; createdAt: string };
export function useLocalCollection<T extends StoredItem>(key: string, initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems); const [ready, setReady] = useState(false);
  useEffect(() => { const saved = window.localStorage.getItem(key); if (saved) { try { setItems(JSON.parse(saved) as T[]); } catch { setItems(initialItems); } } setReady(true); }, [key]);
  useEffect(() => { if (ready) window.localStorage.setItem(key, JSON.stringify(items)); }, [items, key, ready]);
  function add(item: Omit<T, "id" | "createdAt">) { const complete = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() } as T; setItems((current) => [complete, ...current]); return complete; }
  function remove(id: string) { setItems((current) => current.filter((item) => item.id !== id)); }
  function update(id: string, changes: Partial<T>) { setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item)); }
  return { items, add, remove, update, ready };
}
