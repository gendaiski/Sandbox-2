"use client"

import * as React from "react"
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

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

/** Minuscules sans accents, pour trouver « Celadon » comme « Céladon ». */
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
}

function plural(count: number, one: string, many: string) {
  return count + "\u00a0" + (count === 1 ? one : many)
}

function AskFounder({ className }: { className?: string }) {
  return (
    <div className={cn("border-t border-gold/70 pt-5", className)}>
      <p className="display text-[1.625rem] leading-[1.05]">
        Still have a question?
      </p>
      <p className="mt-3 text-[0.9375rem] leading-[1.6] text-ink-soft">
        Write to Clémence. She answers personally.
      </p>
      <a
        href={"mailto:" + site.email}
        className="link-edito mt-3 inline-block text-[0.9375rem]"
      >
        {site.email}
      </a>
    </div>
  )
}

export function FaqBrowser({ categories }: { categories: FaqCategory[] }) {
  const [query, setQuery] = React.useState("")
  // null : rien n'a encore été ouvert à la main, on suit le lien direct.
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
  // Rubriques qui gardent au moins une réponse pour la recherche en cours.
  const shown = new Set(results.map((category) => category.id))

  // Ouvre la question visée par un lien direct (/faq#service-area).
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
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-[clamp(3rem,6vw,7rem)]">
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <nav aria-label="FAQ sections" className="hidden lg:block">
          <p className="serif text-[1.125rem] italic">Contents</p>
          <ul className="mt-4 border-t border-gold/70">
            {categories.map((category) => {
              const visible = shown.has(category.id)
              return (
                <li key={category.id} className="border-b border-ink/10">
                  <a
                    href={"#" + category.id}
                    aria-current={
                      activeCategory === category.id ? "true" : undefined
                    }
                    data-empty={visible ? undefined : ""}
                    className={cn(
                      "relative flex items-baseline justify-between gap-3 py-2.5 text-[0.9375rem] text-ink-soft transition-colors hover:text-ink aria-[current=true]:text-ink data-empty:pointer-events-none data-empty:opacity-40",
                      "before:absolute before:top-2 before:bottom-2 before:-left-4 before:w-[3px] before:bg-gold before:opacity-0 before:transition-opacity aria-[current=true]:before:opacity-100"
                    )}
                  >
                    {category.title}
                    <span className="serif text-[0.9375rem] text-gold-ink italic tabular-nums">
                      {category.items.length}
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
        <AskFounder className="mt-12 hidden lg:block" />
      </aside>

      <div className="min-w-0">
        <div className="max-w-xl">
          <label
            htmlFor="faq-search"
            className="serif text-[1.125rem] text-ink italic"
          >
            Search the answers
          </label>
          <InputGroup className="mt-1 h-14">
            <InputGroupAddon>
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={1.4}
                className="size-5 text-gold-ink"
              />
            </InputGroupAddon>
            <InputGroupInput
              id="faq-search"
              type="search"
              placeholder="Price, keeper, code…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              className="text-[1.1875rem] [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-sm"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.4} />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
          <p
            aria-live="polite"
            className="mt-3 min-h-5 text-[0.8125rem] text-ink-soft italic"
          >
            {terms.length && count
              ? plural(count, "matching answer", "matching answers")
              : null}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="mt-10 border-t border-gold/70 pt-8">
            <p className="display text-[2rem] leading-[1.05] text-balance">
              Nothing for “{deferredQuery.trim()}”
            </p>
            <p className="mt-4 max-w-md text-[1rem] leading-[1.65] text-ink-soft">
              Try another word, or send your question to{" "}
              <a href={"mailto:" + site.email} className="link-edito">
                {site.email}
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="mt-10 flex flex-col gap-20">
            {results.map((category) => (
              <section
                key={category.id}
                id={category.id}
                aria-labelledby={category.id + "-title"}
                className="scroll-mt-8"
              >
                <div className="mb-2 flex items-baseline justify-between gap-6">
                  <h2
                    id={category.id + "-title"}
                    className="display text-[2.5rem] sm:text-[3rem]"
                  >
                    {category.title}
                  </h2>
                  <span className="text-[0.8125rem] text-ink-soft italic">
                    {plural(category.items.length, "question", "questions")}
                  </span>
                </div>
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
                      className="scroll-mt-8"
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

        <AskFounder className="mt-20 lg:hidden" />
      </div>
    </div>
  )
}
