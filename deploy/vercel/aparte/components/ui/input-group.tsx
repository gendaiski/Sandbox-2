"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

/** InputGroup shadcn, restylé : le même filet souligné que les champs. */
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-12 w-full min-w-0 items-center border-b border-ink/35 bg-transparent transition-[border-color,box-shadow,background-color] duration-150 outline-none hover:border-ink/70 in-data-[slot=combobox-content]:border-ink/15 has-[[data-slot=input-group-control]:focus-visible]:border-teal has-[[data-slot=input-group-control]:focus-visible]:bg-teal/[0.035] has-[[data-slot=input-group-control]:focus-visible]:shadow-[inset_0_-1px_0_var(--teal)] has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:shadow-[inset_0_-1px_0_var(--destructive)] has-[>textarea]:h-auto",
        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-2 text-[0.875rem] text-ink-soft select-none group-data-[disabled=true]/input-group:opacity-50 [&>svg:not([class*='size-'])]:size-[1.125rem]",
  {
    variants: {
      align: {
        "inline-start": "order-first pr-2.5 pl-0.5 has-[>button]:-ml-1",
        "inline-end": "order-last pr-0.5 pl-2.5 has-[>button]:-mr-1",
        "block-start": "order-first w-full justify-start px-0.5 pt-3",
        "block-end": "order-last w-full justify-start px-0.5 pb-3",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 rounded-full text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-7 gap-1 px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 px-3",
        "icon-xs": "size-7 p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset"
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm text-ink-soft [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "h-full flex-1 border-0 bg-transparent shadow-none hover:border-0 focus-visible:bg-transparent focus-visible:shadow-none aria-invalid:shadow-none",
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 border-0 bg-transparent shadow-none focus-visible:shadow-none",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
