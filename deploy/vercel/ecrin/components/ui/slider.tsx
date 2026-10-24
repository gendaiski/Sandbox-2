import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "cn"

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
      : [value ?? defaultValue ?? min]

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
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center py-3 select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-cream/12 select-none data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-[linear-gradient(90deg,var(--brand-teal),var(--teal-glow))] select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            aria-label={thumbLabel}
            getAriaValueText={getAriaValueText}
            className="block size-6 shrink-0 rounded-full border-2 border-ink bg-gold-light shadow-[0_0_0_1px_rgb(227_190_107/0.6),0_6px_18px_-4px_rgb(227_190_107/0.6)] transition-[box-shadow,transform] duration-150 ease-(--ease-out) select-none hover:shadow-[0_0_0_6px_rgb(227_190_107/0.18),0_6px_18px_-4px_rgb(227_190_107/0.6)] has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-gold-light active:scale-110 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
