import { useCallback, useEffect, useRef, useState } from "react";
import { load, type Store } from "@tauri-apps/plugin-store";
import { DEFAULT_SETTINGS, type Settings } from "./types";

const STORE_FILE = "subtrakt.json";
const STORE_KEY = "settings";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const storeRef = useRef<Store | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const store = await load(STORE_FILE, { autoSave: true });
      storeRef.current = store;
      const saved = await store.get<Settings>(STORE_KEY);
      if (!cancelled) {
        setSettings(saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback(async (next: Settings) => {
    setSettings(next);
    const store = storeRef.current;
    if (store) {
      await store.set(STORE_KEY, next);
      await store.save();
    }
  }, []);

  return { settings, loading, updateSettings };
}
