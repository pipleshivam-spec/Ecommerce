import { useState } from "react";
import { Palette, Check, X } from "lucide-react";
import { useTheme, Theme } from "@/contexts/ThemeContext";

interface ThemeMeta {
  name: Theme;
  label: string;
  description: string;
  swatches: [string, string, string];
}

const THEMES: ThemeMeta[] = [
  { name: "light",    label: "Light",    description: "Clean and bright",    swatches: ["#ffffff", "#f8f9fa", "#e9ecef"] },
  { name: "dark",     label: "Dark",     description: "Easy on the eyes",    swatches: ["#1a1a1a", "#2d2d2d", "#404040"] },
  { name: "ocean",    label: "Ocean",    description: "Deep blue waters",    swatches: ["#0077be", "#00a8e8", "#48cae4"] },
  { name: "sunset",   label: "Sunset",   description: "Warm and vibrant",    swatches: ["#ff6b6b", "#ff8787", "#ffa07a"] },
  { name: "forest",   label: "Forest",   description: "Natural green",       swatches: ["#2d6a4f", "#40916c", "#52b788"] },
  { name: "lavender", label: "Lavender", description: "Soft purple",         swatches: ["#9d4edd", "#c77dff", "#e0aaff"] },
  { name: "rose",     label: "Rose",     description: "Elegant pink",        swatches: ["#e63946", "#f07167", "#f4978e"] },
  { name: "midnight", label: "Midnight", description: "Deep night blue",     swatches: ["#03045e", "#023e8a", "#0077b6"] },
  { name: "coffee",   label: "Coffee",   description: "Rich brown",          swatches: ["#6f4e37", "#8b6f47", "#a0826d"] },
  { name: "mint",     label: "Mint",     description: "Fresh and cool",      swatches: ["#06d6a0", "#1be7a0", "#5ef4c8"] },
];

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleSelect = (t: Theme) => {
    setTheme(t);
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-full hover:bg-muted/50 transition-colors"
        aria-label="Choose theme"
      >
        <Palette size={18} className="text-muted-foreground hover:text-primary transition-colors" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-primary" />
              <span className="font-semibold text-sm text-foreground">Choose Theme</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-muted/60 transition-colors"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>

          {/* Grid */}
          <div className="p-3 grid grid-cols-2 gap-2 max-h-96 overflow-y-auto custom-scrollbar">
            {THEMES.map(t => {
              const active = theme === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => handleSelect(t.name)}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 ${
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {/* Swatches */}
                  <div className="flex gap-1 mb-2">
                    {t.swatches.map((color, i) => (
                      <div
                        key={i}
                        className="flex-1 h-8 rounded-md border border-black/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Name + check */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground capitalize">{t.label}</span>
                    {active && <Check size={12} className="text-primary shrink-0" />}
                  </div>

                  {/* Description */}
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{t.description}</p>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border/60 bg-muted/30">
            <p className="text-[11px] text-muted-foreground">
              Current: <span className="font-semibold text-foreground capitalize">{theme}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
