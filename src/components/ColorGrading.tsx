import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Palette, Sun, Moon, Contrast } from "lucide-react";

export const ColorGrading = () => {
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [temperature, setTemperature] = useState([0]);
  const [tint, setTint] = useState([0]);
  const [exposure, setExposure] = useState([0]);

  const resetAll = () => {
    setBrightness([100]);
    setContrast([100]);
    setSaturation([100]);
    setTemperature([0]);
    setTint([0]);
    setExposure([0]);
  };

  const controls = [
    {
      icon: Sun,
      label: "Brightness",
      value: brightness,
      setValue: setBrightness,
      min: 0,
      max: 200,
      step: 1
    },
    {
      icon: Contrast,
      label: "Contrast", 
      value: contrast,
      setValue: setContrast,
      min: 0,
      max: 200,
      step: 1
    },
    {
      icon: Palette,
      label: "Saturation",
      value: saturation,
      setValue: setSaturation,
      min: 0,
      max: 200,
      step: 1
    },
    {
      icon: Sun,
      label: "Temperature",
      value: temperature,
      setValue: setTemperature,
      min: -100,
      max: 100,
      step: 1
    },
    {
      icon: Moon,
      label: "Tint",
      value: tint,
      setValue: setTint,
      min: -100,
      max: 100,
      step: 1
    },
    {
      icon: Sun,
      label: "Exposure",
      value: exposure,
      setValue: setExposure,
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