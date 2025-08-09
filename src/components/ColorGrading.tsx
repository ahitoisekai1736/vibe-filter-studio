import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Palette, Sun, Moon, Contrast } from "lucide-react";
import { useColorGrading } from "@/context/color-grading";
 
export const ColorGrading = () => {
  const { state, setState, reset, applyPreset } = useColorGrading();
 
  const resetAll = () => {
    reset();
  };

  const controls = [
    {
      icon: Sun,
      label: "Brightness",
      value: [state.brightness],
      setValue: (v: number[]) => setState({ brightness: v[0] }),
      min: 0,
      max: 200,
      step: 1
    },
    {
      icon: Contrast,
      label: "Contrast", 
      value: [state.contrast],
      setValue: (v: number[]) => setState({ contrast: v[0] }),
      min: 0,
      max: 200,
      step: 1
    },
    {
      icon: Palette,
      label: "Saturation",
      value: [state.saturation],
      setValue: (v: number[]) => setState({ saturation: v[0] }),
      min: 0,
      max: 200,
      step: 1
    },
    {
      icon: Sun,
      label: "Temperature",
      value: [state.temperature],
      setValue: (v: number[]) => setState({ temperature: v[0] }),
      min: -100,
      max: 100,
      step: 1
    },
    {
      icon: Moon,
      label: "Tint",
      value: [state.tint],
      setValue: (v: number[]) => setState({ tint: v[0] }),
      min: -100,
      max: 100,
      step: 1
    },
    {
      icon: Sun,
      label: "Exposure",
      value: [state.exposure],
      setValue: (v: number[]) => setState({ exposure: v[0] }),
      min: -100,
      max: 100,
      step: 1
    }
  ];

  return (
    <Card className="glass-card p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Color Grading</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={resetAll}
            className="btn-glass"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="space-y-6">
          {controls.map((control) => {
            const Icon = control.icon;
            return (
              <div key={control.label} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{control.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground font-mono">
                    {control.value[0]}
                  </span>
                </div>
                <Slider
                  value={control.value}
                  onValueChange={control.setValue}
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  className="color-slider"
                />
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-3">Quick Presets</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "Natural", settings: [105, 110, 105, 5, 0, 5] },
              { name: "Cinematic", settings: [95, 130, 90, -10, 5, -10] },
              { name: "Vibrant", settings: [110, 120, 140, 10, 0, 10] },
              { name: "Moody", settings: [85, 140, 80, -15, 10, -15] }
            ].map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                className="btn-glass text-xs"
                onClick={() => {
                  setBrightness([preset.settings[0]]);
                  setContrast([preset.settings[1]]);
                  setSaturation([preset.settings[2]]);
                  setTemperature([preset.settings[3]]);
                  setTint([preset.settings[4]]);
                  setExposure([preset.settings[5]]);
                }}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};