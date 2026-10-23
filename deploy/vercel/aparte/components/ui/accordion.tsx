"use client"

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

/**
 * Accordion shadcn (Base UI), restylé en liste éditoriale : filets or,
 * questions en Bodoni, un « + » fin qui pivote à l'ouverture.
 */
function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col border-b border-gold/70", className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-t border-gold/70", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger serif relative flex flex-1 items-baseline justify-between gap-6 py-6 text-left text-[1.375rem] leading-[1.2] text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal focus-visible:outline-solid aria-disabled:pointer-events-none aria-disabled:opacity-50 lg:py-7 lg:text-[1.75rem]",
          className
        )}
        {...props}
      >
        <span className="transition-colors duration-200 group-hover/accordion-trigger:text-teal">
          {children}
        </span>
        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 translate-y-1 items-center justify-center text-gold-ink transition-transform duration-300 ease-(--ease-out) group-aria-expanded/accordion-trigger:rotate-45"
        >
          <HugeiconsIcon
            icon={PlusSignIcon}
            strokeWidth={1}
            data-slot="accordion-trigger-icon"
            className="pointer-events-none size-6"
          />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="h-(--accordion-panel-height) overflow-hidden text-[1rem] text-ink-soft transition-[height] duration-300 ease-(--ease-out) data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
      {...props}
    >
      <div
        className={cn(
          "max-w-[62ch] pb-7 leading-[1.65] [&_a]:text-teal [&_a]:underline [&_a]:underline-offset-4 [&_p:not(:last-child)]:mb-3",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
