import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "tf:display";

export interface DisplaySettings {
  /** Photo opacity 10–100 */
  imageOpacity: number;
  /** Scrim / dim strength 0–95 */
  scrim: number;
}

export const DEFAULT_DISPLAY: DisplaySettings = {
  imageOpacity: 42,
  scrim: 62,
};

interface DisplayContextValue extends DisplaySettings {
  set: (patch: Partial<DisplaySettings>) => void;
  reset: () => void;
}

const DisplayContext = createContext<DisplayContextValue | null>(null);

export function DisplayProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_DISPLAY);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DisplaySettings>;
        setSettings({
          imageOpacity: clamp(parsed.imageOpacity ?? DEFAULT_DISPLAY.imageOpacity, 10, 100),
          scrim: clamp(parsed.scrim ?? DEFAULT_DISPLAY.scrim, 0, 95),
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: DisplaySettings) => {
    setSettings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const set = useCallback(
    (patch: Partial<DisplaySettings>) => {
      persist({ ...settings, ...patch });
    },
    [settings, persist],
  );

  const reset = useCallback(() => persist(DEFAULT_DISPLAY), [persist]);

  return (
    <DisplayContext.Provider value={{ ...settings, set, reset }}>
      {children}
    </DisplayContext.Provider>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function useDisplaySettings() {
  const ctx = useContext(DisplayContext);
  if (!ctx) throw new Error("useDisplaySettings must be used within DisplayProvider");
  return ctx;
}
