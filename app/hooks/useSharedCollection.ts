"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export type StoredItem = { id: string; createdAt: string };

type SharedRow = {
  id: string;
  collection: string;
  payload: Record<string, unknown>;
  created_at: string;
};

function itemToRow<T extends StoredItem>(collection: string, item: T) {
  const { id, createdAt, ...payload } = item;
  return {
    id,
    collection,
    payload,
    created_at: createdAt,
    updated_at: new Date().toISOString(),
  };
}

function rowToItem<T extends StoredItem>(row: SharedRow) {
  return { ...row.payload, id: row.id, createdAt: row.created_at } as T;
}

export function useSharedCollection<T extends StoredItem>(collection: string, initialItems: T[] = []) {
  const initialItemsRef = useRef(initialItems);
  const [items, setItems] = useState<T[]>(() => initialItems);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const loadRemote = useCallback(async () => {
    if (!supabase) return;
    const { data, error: loadError } = await supabase
      .from("shared_items")
      .select("id, collection, payload, created_at")
      .eq("collection", collection)
      .order("created_at", { ascending: false });

    if (loadError) throw loadError;
    setItems(((data ?? []) as SharedRow[]).map(rowToItem<T>));
  }, [collection]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      setError("");
      if (!supabase) {
        try {
          const saved = window.localStorage.getItem(collection);
          if (saved && active) setItems(JSON.parse(saved) as T[]);
        } catch {
          if (active) setItems(initialItemsRef.current);
        } finally {
          if (active) setReady(true);
        }
        return;
      }

      try {
        const saved = window.localStorage.getItem(collection);
        if (saved) {
          const localItems = JSON.parse(saved) as T[];
          if (localItems.length > 0) {
            const { error: migrationError } = await supabase
              .from("shared_items")
              .upsert(localItems.map((item) => itemToRow(collection, item)), { onConflict: "id" });
            if (migrationError) throw migrationError;
          }
          window.localStorage.removeItem(collection);
        }
        await loadRemote();
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "공동 데이터를 불러오지 못했습니다.");
      } finally {
        if (active) setReady(true);
      }
    }

    void initialize();

    const channel = supabase?.channel(`shared-${collection}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shared_items", filter: `collection=eq.${collection}` },
        () => { void loadRemote(); },
      )
      .subscribe();

    return () => {
      active = false;
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, [collection, loadRemote]);

  useEffect(() => {
    if (ready && !isSupabaseConfigured) {
      window.localStorage.setItem(collection, JSON.stringify(items));
    }
  }, [collection, items, ready]);

  function add(item: Omit<T, "id" | "createdAt">) {
    const complete = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    } as T;
    setItems((current) => [complete, ...current]);

    if (supabase) {
      void supabase.from("shared_items").insert(itemToRow(collection, complete)).then(({ error: addError }) => {
        if (addError) {
          setItems((current) => current.filter((entry) => entry.id !== complete.id));
          setError(addError.message);
        }
      });
    }
    return complete;
  }

  function remove(id: string) {
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== id));
    if (supabase) {
      void supabase.from("shared_items").delete().eq("id", id).eq("collection", collection).then(({ error: removeError }) => {
        if (removeError) {
          setItems(previous);
          setError(removeError.message);
        }
      });
    }
  }

  function update(id: string, changes: Partial<T>) {
    const previous = items;
    const changed = items.find((item) => item.id === id);
    if (!changed) return;
    const next = { ...changed, ...changes } as T;
    setItems((current) => current.map((item) => item.id === id ? next : item));
    if (supabase) {
      void supabase.from("shared_items").update({
        payload: itemToRow(collection, next).payload,
        updated_at: new Date().toISOString(),
      }).eq("id", id).eq("collection", collection).then(({ error: updateError }) => {
        if (updateError) {
          setItems(previous);
          setError(updateError.message);
        }
      });
    }
  }

  return { items, add, remove, update, ready, error, shared: isSupabaseConfigured };
}
