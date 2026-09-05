import { useState, useEffect } from "react";
import type { TripItem } from "@/types";

const STORAGE_KEY = "bhraman_trip_list";
const CUSTOM_EVENT = "bhraman_trip_list_change";

function getStoredItems(): TripItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) =>
        typeof item === "string" ? { placeId: item, addedAt: Date.now() } : item
      );
    }
    return [];
  } catch (e) {
    console.error("Failed to load trip list:", e);
    return [];
  }
}

function saveItems(items: TripItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CUSTOM_EVENT));
  } catch (e) {
    console.error("Failed to save trip list:", e);
  }
}

export function useTripList() {
  const [items, setItems] = useState<TripItem[]>(getStoredItems);

  useEffect(() => {
    const handleUpdate = () => {
      setItems(getStoredItems());
    };
    window.addEventListener(CUSTOM_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(CUSTOM_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const has = (placeId: string) => {
    return items.some((item) => item.placeId === placeId);
  };

  const toggle = (placeId: string) => {
    const current = getStoredItems();
    const exists = current.some((item) => item.placeId === placeId);
    let next: TripItem[];
    if (exists) {
      next = current.filter((item) => item.placeId !== placeId);
    } else {
      next = [...current, { placeId, addedAt: Date.now() }];
    }
    saveItems(next);
    setItems(next);
  };

  const updateNotes = (placeId: string, notes: string) => {
    const current = getStoredItems();
    const next = current.map((item) =>
      item.placeId === placeId ? { ...item, notes } : item
    );
    saveItems(next);
    setItems(next);
  };

  const setDay = (placeId: string, customDay?: number) => {
    const current = getStoredItems();
    const next = current.map((item) =>
      item.placeId === placeId ? { ...item, customDay } : item
    );
    saveItems(next);
    setItems(next);
  };

  const remove = (placeId: string) => {
    const current = getStoredItems();
    const next = current.filter((item) => item.placeId !== placeId);
    saveItems(next);
    setItems(next);
  };

  const clear = () => {
    saveItems([]);
    setItems([]);
  };

  return {
    items,
    count: items.length,
    has,
    toggle,
    updateNotes,
    setDay,
    remove,
    clear,
  };
}
