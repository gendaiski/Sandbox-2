"use client"

import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "cn"

/**
 * Slider shadcn (Base UI), restylé « filet » : une piste d'un pixel, une
 * portion parcourue en or, un curseur rond à l'encre.
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbLabel,
  ...props
}: SliderPrimitive.Root.Props & { thumbLabel?: string }) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max]

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex h-6 w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow bg-ink/20 select-none data-horizontal:h-px data-horizontal:w-full data-vertical:h-full data-vertical:w-px"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-gold select-none data-horizontal:h-[3px] data-horizontal:-translate-y-px data-vertical:w-[3px]"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            aria-label={thumbLabel}
            className="block size-4 shrink-0 rounded-full border border-paper bg-ink shadow-[0_0_0_1px_var(--ink)] transition-[box-shadow,scale] duration-150 ease-(--ease-out) select-none hover:shadow-[0_0_0_1px_var(--ink),0_0_0_6px_color-mix(in_oklab,var(--gold)_30%,transparent)] has-[:focus-visible]:shadow-[0_0_0_1px_var(--ink),0_0_0_6px_color-mix(in_oklab,var(--gold)_45%,transparent)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-teal has-[:focus-visible]:outline-solid active:scale-110 disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
