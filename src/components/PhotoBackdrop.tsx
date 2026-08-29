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
 * opacity + contrast-scrim preferences.
 *
 * Reads the CSS custom properties `--tf-img-opacity` / `--tf-scrim`, which are
 * set by the inline boot script in <head> before first paint and updated live
 * by DisplayProvider. Using variables (rather than React state) keeps the SSR
 * and client markup identical while still applying saved prefs immediately.
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
  return (
    <div className={`absolute inset-0 ${className}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={`size-full object-cover ${imgClassName}`}
        style={{ opacity: `calc(var(--tf-img-opacity, 0.42) * ${intensity})` }}
      />
      <div
        className="absolute inset-0 bg-background"
        style={{ opacity: "var(--tf-scrim, 0.62)" }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
