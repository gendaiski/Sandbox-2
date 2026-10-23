"use client"

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

/**
 * Accordéon shadcn (Base UI) restylé pour la nuit : filets crème, signe plus
 * dans un petit médaillon or qui pivote à l'ouverture.
 */
function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-(--acc-line) first:border-t", className)}
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
          "group/accordion-trigger flex flex-1 items-center justify-between gap-6 rounded-md py-6 text-left text-[1.2rem] leading-snug font-[680] tracking-[-0.01em] text-(--acc-fg) transition-colors duration-150 [font-variation-settings:'opsz'_24,'wdth'_96] hover:text-(--acc-hover) aria-disabled:pointer-events-none aria-disabled:opacity-50 md:text-[1.35rem]",
          className
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-(--acc-icon-bg) text-(--acc-icon-fg) transition-[background-color,color,rotate] duration-200 ease-(--ease-out) group-aria-expanded/accordion-trigger:rotate-45 group-aria-expanded/accordion-trigger:bg-gold-light group-aria-expanded/accordion-trigger:text-ink"
        >
          <HugeiconsIcon
            icon={PlusSignIcon}
            strokeWidth={2}
            data-slot="accordion-trigger-icon"
            className="pointer-events-none size-5"
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
      className="h-(--accordion-panel-height) overflow-hidden text-(--acc-text) transition-[height] duration-250 ease-(--ease-out) data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
      {...props}
    >
      <div
        className={cn(
          "max-w-[62ch] pb-7 leading-relaxed md:pr-16 [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
