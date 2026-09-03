import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useDisplaySettings } from "@/lib/display-settings";

interface Props {
  /** Optional label describing which surface the controls affect */
  surface?: string;
  className?: string;
}

export function DisplayControls({ surface = "photo", className = "" }: Props) {
  const { imageOpacity, scrim, set, reset } = useDisplaySettings();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Adjust ${surface} readability`}
          className={`inline-flex min-h-11 items-center gap-2 rounded-sm border border-border-strong bg-background/80 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-foreground backdrop-blur-md transition-colors hover:border-ember hover:text-ember-text ${className}`}
        >
          <SlidersHorizontal className="size-3.5" aria-hidden="true" />
          Display
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 border-border-strong bg-popover text-popover-foreground"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Photo readability
          </h3>
          <button
            type="button"
            onClick={reset}
            aria-label="Reset display settings to default"
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground transition-colors hover:text-ember-text"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label htmlFor="tf-image-opacity" className="text-sm font-medium text-foreground">
                Photo opacity
              </label>
              <span className="font-mono text-xs text-ember-text">{imageOpacity}%</span>
            </div>
            <Slider
              id="tf-image-opacity"
              aria-label="Photo opacity"
              value={[imageOpacity]}
              min={10}
              max={100}
              step={1}
              onValueChange={([v]) => set({ imageOpacity: v })}
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label htmlFor="tf-scrim" className="text-sm font-medium text-foreground">
                Contrast scrim
              </label>
              <span className="font-mono text-xs text-ember-text">{scrim}%</span>
            </div>
            <Slider
              id="tf-scrim"
              aria-label="Contrast scrim strength"
              value={[scrim]}
              min={0}
              max={95}
              step={1}
              onValueChange={([v]) => set({ scrim: v })}
            />
          </div>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Dims the dusk photography behind text. Your setting is saved on this device.
        </p>
      </PopoverContent>
    </Popover>
  );
}
