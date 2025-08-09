import React, { createContext, useContext, useMemo, useState } from "react";

export interface GradingState {
  brightness: number; // 0-200 (100 = default)
  contrast: number;   // 0-200 (100 = default)
  saturation: number; // 0-200 (100 = default)
  temperature: number; // -100 to 100 (mapped to warm/cool)
  tint: number;        // -100 to 100 (green-magenta)
  exposure: number;    // -100 to 100
}

interface ColorGradingContextValue {
  state: GradingState;
  setState: (next: Partial<GradingState>) => void;
  reset: () => void;
  applyPreset: (settings: [number, number, number, number, number, number]) => void;
  computeFilterString: () => string;
}

const defaults: GradingState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  temperature: 0,
  tint: 0,
  exposure: 0,
};

const ColorGradingContext = createContext<ColorGradingContextValue | undefined>(undefined);

export function ColorGradingProvider({ children }: { children: React.ReactNode }) {
  const [state, setLocalState] = useState<GradingState>(defaults);

  const setState = (next: Partial<GradingState>) => setLocalState((s) => ({ ...s, ...next }));

  const reset = () => setLocalState(defaults);

  const applyPreset = (settings: [number, number, number, number, number, number]) => {
    setLocalState({
      brightness: settings[0],
      contrast: settings[1],
      saturation: settings[2],
      temperature: settings[3],
      tint: settings[4],
      exposure: settings[5],
    });
  };

  const computeFilterString = useMemo(() => {
    return () => {
      // Map sliders to CSS filter values
      const b = state.brightness / 100; // 1 = default
      const c = state.contrast / 100;   // 1 = default
      const s = state.saturation / 100; // 1 = default
      // temperature: positive warms (hue -), negative cools (hue +)
      const hue = -state.temperature * 0.6; // map to degrees
      const tint = state.tint * 0.4;        // map to degrees (approx)
      const exposure = state.exposure / 100; // -1..1

      // exposure approximated by brightness + contrast tweak
      const exposureBrightness = 1 + exposure * 0.5;
      const exposureContrast = 1 + exposure * 0.3;

      return `brightness(${(b * exposureBrightness).toFixed(3)}) contrast(${(c * exposureContrast).toFixed(3)}) saturate(${s.toFixed(3)}) hue-rotate(${(hue + tint).toFixed(1)}deg)`;
    };
  }, [state]);

  return (
    <ColorGradingContext.Provider value={{ state, setState, reset, applyPreset, computeFilterString }}>
      {children}
    </ColorGradingContext.Provider>
  );
}

export function useColorGrading() {
  const ctx = useContext(ColorGradingContext);
  if (!ctx) throw new Error("useColorGrading must be used within ColorGradingProvider");
  return ctx;
}
