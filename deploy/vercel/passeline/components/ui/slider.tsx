"use client"

import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "cn"

import { Bow } from "@/components/brand/logo"

/**
 * Curseur shadcn (Base UI) restylé : la piste est une route en pointillés or,
 * la poignée un petit cadeau noué du nœud or.
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
      : [
          typeof value === "number"
            ? value
            : typeof defaultValue === "number"
              ? defaultValue
              : min,
        ]

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex h-14 w-full touch-none items-center select-none data-disabled:opacity-50">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative h-3 w-full grow rounded-full bg-[#ece0c2] bg-[radial-gradient(circle,#c59940_2.6px,transparent_3px)] bg-[length:16px_100%] bg-center select-none"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="rounded-full bg-gold select-none data-horizontal:h-full"
          />
        </SliderPrimitive.Track>
        {_values.map((_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            index={index}
            getAriaLabel={thumbLabel ? () => thumbLabel : undefined}
            className="relative block size-10 shrink-0 rounded-[10px] bg-teal bg-[linear-gradient(90deg,transparent_42%,#c59940_42%,#c59940_58%,transparent_58%)] shadow-[0_4px_0_#123f3b] transition-[transform,box-shadow] duration-150 ease-(--ease-out) select-none active:scale-105 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-teal-deep"
          >
            <Bow className="pointer-events-none absolute -top-[13px] left-1/2 w-9 -translate-x-1/2" />
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
