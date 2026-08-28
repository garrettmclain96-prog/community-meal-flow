import { useDisplaySettings } from "@/lib/display-settings";

interface Props {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  /** Extra multiplier applied on top of the user opacity (0–1) */
  intensity?: number;
  children?: React.ReactNode;
}

/**
 * Renders a dusk photograph behind content, honouring the user's saved
 * opacity + contrast-scrim preferences from DisplayProvider.
 */
export function PhotoBackdrop({
  src,
  alt,
  className = "",
  imgClassName = "",
  width,
  height,
  loading,
  intensity = 1,
  children,
}: Props) {
  const { imageOpacity, scrim } = useDisplaySettings();

  return (
    <div className={`absolute inset-0 ${className}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={`size-full object-cover ${imgClassName}`}
        style={{ opacity: (imageOpacity / 100) * intensity }}
      />
      <div
        className="absolute inset-0 bg-background"
        style={{ opacity: scrim / 100 }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
