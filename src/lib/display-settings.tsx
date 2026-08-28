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

/**
 * Applied inline in <head> so the saved photo opacity / scrim are painted on
 * the very first frame — no flash of the un-adjusted dusk photography.
 */
export const DISPLAY_BOOT_SCRIPT = `(function(){try{var d={imageOpacity:${DEFAULT_DISPLAY.imageOpacity},scrim:${DEFAULT_DISPLAY.scrim}};var raw=localStorage.getItem("${STORAGE_KEY}");if(raw){var p=JSON.parse(raw);if(typeof p.imageOpacity==="number")d.imageOpacity=Math.min(100,Math.max(10,p.imageOpacity));if(typeof p.scrim==="number")d.scrim=Math.min(95,Math.max(0,p.scrim));}var s=document.documentElement.style;s.setProperty("--tf-img-opacity",String(d.imageOpacity/100));s.setProperty("--tf-scrim",String(d.scrim/100));}catch(e){}})();`;

interface DisplayContextValue extends DisplaySettings {
  set: (patch: Partial<DisplaySettings>) => void;
  reset: () => void;
}

const DisplayContext = createContext<DisplayContextValue | null>(null);

function applyVars(next: DisplaySettings) {
  const s = document.documentElement.style;
  s.setProperty("--tf-img-opacity", String(next.imageOpacity / 100));
  s.setProperty("--tf-scrim", String(next.scrim / 100));
}

export function DisplayProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_DISPLAY);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DisplaySettings>;
        const next = {
          imageOpacity: clamp(parsed.imageOpacity ?? DEFAULT_DISPLAY.imageOpacity, 10, 100),
          scrim: clamp(parsed.scrim ?? DEFAULT_DISPLAY.scrim, 0, 95),
        };
        setSettings(next);
        applyVars(next);
        return;
      }
    } catch {
      /* ignore */
    }
    applyVars(DEFAULT_DISPLAY);
  }, []);

  const persist = useCallback((next: DisplaySettings) => {
    setSettings(next);
    applyVars(next);
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
