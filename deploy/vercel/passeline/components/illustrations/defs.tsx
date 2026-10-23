/**
 * Définitions partagées par toutes les illustrations de la page : le grain
 * (feTurbulence posé seulement sur les formes) et le dégradé des halos.
 * Rendu une seule fois, en haut de la page.
 */
export function IllustrationDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter
          id="bb-grain"
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed="11"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0.06  0 0 0 0 0.13  0 0 0 0 0.14  0.52 0 0 0 -0.19"
            result="speckle"
          />
          <feComposite
            in="speckle"
            in2="SourceAlpha"
            operator="in"
            result="grain"
          />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="grain" />
          </feMerge>
        </filter>

        <radialGradient id="bb-glow">
          <stop offset="0" stopColor="#F6D98F" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#E3BE6B" stopOpacity="0.32" />
          <stop offset="1" stopColor="#E3BE6B" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="bb-glow-soft">
          <stop offset="0" stopColor="#E3BE6B" stopOpacity="0.38" />
          <stop offset="1" stopColor="#E3BE6B" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="bb-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#123F3B" />
          <stop offset="0.5" stopColor="#3E6E62" />
          <stop offset="0.8" stopColor="#D9B26E" />
          <stop offset="1" stopColor="#F0D394" />
        </linearGradient>

        <linearGradient id="bb-golden" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F8E7BF" />
          <stop offset="1" stopColor="#F1CF8E" />
        </linearGradient>

        <linearGradient id="bb-late" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9FC7BC" />
          <stop offset="0.55" stopColor="#E9C88C" />
          <stop offset="1" stopColor="#E7AE6C" />
        </linearGradient>

        <linearGradient id="bb-medallion" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FCF6E6" />
          <stop offset="1" stopColor="#F6E2B4" />
        </linearGradient>

        <linearGradient id="bb-morning" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9E4DD" />
          <stop offset="1" stopColor="#EEF3EA" />
        </linearGradient>

        <linearGradient id="bb-noon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFDFD8" />
          <stop offset="1" stopColor="#E9F1E6" />
        </linearGradient>

        <linearGradient id="bb-window-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7DE9C" />
          <stop offset="1" stopColor="#E3BE6B" />
        </linearGradient>
      </defs>
    </svg>
  )
}
