"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import type { FaqCategory } from "@/lib/faq"
import { site } from "@/lib/site"
import { typo } from "@/lib/typo"
import { cn } from "@/lib/utils"

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback)
  return () => window.removeEventListener("hashchange", callback)
}

function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

export function FaqBrowser({ categories }: { categories: FaqCategory[] }) {
  const [query, setQuery] = React.useState("")
  // null : l'utilisateur n'a encore rien ouvert, on suit le lien direct.
  const [open, setOpen] = React.useState<string[] | null>(null)
  const hash = React.useSyncExternalStore(
    subscribeToHash,
    () => decodeURIComponent(window.location.hash.slice(1)),
    () => ""
  )
  const [activeCategory, setActiveCategory] = React.useState(categories[0]?.id)
  const deferredQuery = React.useDeferredValue(query)
  const terms = normalize(deferredQuery).split(/\s+/).filter(Boolean)

  const results = categories
    .map((category) => ({
      ...category,
      items: terms.length
        ? category.items.filter((item) => {
            const haystack = normalize(
              item.question + " " + item.answer.join(" ")
            )
            return terms.every((term) => haystack.includes(term))
          })
        : category.items,
    }))
    .filter((category) => category.items.length > 0)

  const count = results.reduce(
    (total, category) => total + category.items.length,
    0
  )

  // Ouvre la question visée par un lien direct (/faq#zone).
  const linked = categories.some((category) =>
    category.items.some((item) => item.id === hash)
  )
  const expanded = open ?? (linked ? [hash] : [])

  // Met en avant la rubrique en cours de lecture dans le sommaire.
  React.useEffect(() => {
    const sections = categories
      .map((category) => document.getElementById(category.id))
      .filter((node): node is HTMLElement => node !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActiveCategory(visible.target.id)
      },
      { rootMargin: "-20% 0px -70% 0px" }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [categories, deferredQuery])

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20">
      <aside className="lg:sticky lg:top-10 lg:self-start">
        <nav aria-label="FAQ topics" className="hidden lg:block">
          <ul className="flex flex-col gap-1">
            {categories.map((category) => {
              const visible = results.some((result) => {
                return result.id === category.id
              })
              return (
                <li key={category.id}>
                  <a
                    href={"#" + category.id}
                    aria-current={
                      activeCategory === category.id ? "true" : undefined
                    }
                    className={cn(
                      "relative flex items-center justify-between rounded-md py-2.5 pr-3 pl-5 text-[0.9375rem] text-cream/68 transition-colors duration-150 hover:bg-cream/5 hover:text-cream",
                      "aria-[current=true]:bg-cream/6 aria-[current=true]:text-cream aria-[current=true]:before:absolute aria-[current=true]:before:inset-y-2 aria-[current=true]:before:left-0 aria-[current=true]:before:w-[3px] aria-[current=true]:before:rounded-full aria-[current=true]:before:bg-[linear-gradient(180deg,#8e6a26,#e3be6b_50%,#8e6a26)]",
                      !visible && ["pointer-events-none", "opacity-40"]
                    )}
                  >
                    {category.title}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="mt-10 hidden rounded-2xl border border-cream/10 bg-[radial-gradient(120%_90%_at_0%_0%,rgb(197_153_64/0.2),transparent_60%),#132d2c] p-6 text-cream lg:block">
          <p className="font-display text-[1.25rem] leading-snug font-[420] tracking-[-0.03em]">
            Still have a question?
          </p>
          <p className="mt-3 text-sm text-cream/75">
            One email is all it takes, and Samuel reads it himself.
          </p>
          <a
            href={"mailto:" + site.email}
            className="mt-5 inline-block text-sm font-medium text-gold-light underline underline-offset-4"
          >
            {site.email}
          </a>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="max-w-xl">
          <label htmlFor="faq-search" className="sr-only">
            Search the FAQ
          </label>
          <InputGroup className="h-15 rounded-2xl">
            <InputGroupAddon>
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={1.8}
                className="size-5"
              />
            </InputGroupAddon>
            <InputGroupInput
              id="faq-search"
              type="search"
              placeholder="Search: code, price, Écrin Point…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              className="text-base [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-sm"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.8} />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
          <p
            aria-live="polite"
            className="mt-3 min-h-6 text-sm text-cream/62"
          >
            {terms.length
              ? count
                ? count + (count > 1 ? " answers found" : " answer found")
                : ""
              : null}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-cream/10 bg-night/50 px-8 py-12">
            <p className="font-display text-[1.375rem] leading-snug font-[420] tracking-[-0.03em] text-cream">
              No answers for “{deferredQuery.trim()}”
            </p>
            <p className="mt-3 max-w-md text-cream/70">
              Try another word, or send us your question as is at{" "}
              <a
                href={"mailto:" + site.email}
                className="font-medium text-gold-light underline underline-offset-4"
              >
                {site.email}
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-16">
            {results.map((category) => (
              <section
                key={category.id}
                id={category.id}
                aria-labelledby={category.id + "-title"}
                className="scroll-mt-10"
              >
                <h2
                  id={category.id + "-title"}
                  className="mb-4 font-display text-[clamp(1.4rem,1.2rem+0.8vw,1.85rem)] font-[420] tracking-[-0.03em] text-cream"
                >
                  {category.title}
                </h2>
                <Accordion
                  multiple
                  hiddenUntilFound
                  value={
                    terms.length
                      ? category.items.map((item) => item.id)
                      : expanded
                  }
                  onValueChange={(value) => {
                    if (!terms.length) setOpen(value as string[])
                  }}
                >
                  {category.items.map((item) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      id={item.id}
                      className="scroll-mt-10"
                    >
                      <AccordionTrigger>{typo(item.question)}</AccordionTrigger>
                      <AccordionContent>
                        {item.answer.map((paragraph) => (
                          <p key={paragraph}>{typo(paragraph)}</p>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
        )}

        <div className="mt-16 rounded-2xl border border-cream/10 bg-[radial-gradient(120%_90%_at_0%_0%,rgb(197_153_64/0.2),transparent_60%),#132d2c] p-7 text-cream lg:hidden">
          <p className="font-display text-[1.25rem] leading-snug font-[420] tracking-[-0.03em]">
            Still have a question?
          </p>
          <p className="mt-3 text-sm text-cream/75">
            One email is all it takes, and Samuel reads it himself.
          </p>
          <a
            href={"mailto:" + site.email}
            className="mt-5 inline-block text-sm font-medium text-gold-light underline underline-offset-4"
          >
            {site.email}
          </a>
        </div>
      </div>
    </div>
  )
}
