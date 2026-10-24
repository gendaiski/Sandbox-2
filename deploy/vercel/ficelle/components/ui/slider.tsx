"use client"

import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "cn"

/*
 * Curseur en forme de mètre ruban : graduations encrées sur papier, portion
 * parcourue en ruban or, poignée carrée teal comme un tampon.
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbLabel,
  getAriaValueText,
  ...props
}: SliderPrimitive.Root.Props & {
  thumbLabel?: string
  getAriaValueText?: SliderPrimitive.Thumb.Props["getAriaValueText"]
}) {
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
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center py-2 select-none data-disabled:opacity-50">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative h-4 w-full grow overflow-hidden rounded-[2px] border border-ink/70 bg-[repeating-linear-gradient(90deg,var(--ink)_0_1px,transparent_1px_10px)] bg-[length:100%_45%] bg-bottom bg-no-repeat select-none"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="ribbon-band h-full shadow-none select-none"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            aria-label={thumbLabel}
            getAriaValueText={getAriaValueText}
            className="block size-8 shrink-0 rounded-[3px] border-2 border-teal-deep bg-teal shadow-[0_3px_0_var(--teal-deep)] transition-[scale] duration-150 ease-(--ease-out) select-none before:absolute before:inset-[5px] before:rounded-[1px] before:border before:border-dashed before:border-white/60 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink active:scale-110"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
