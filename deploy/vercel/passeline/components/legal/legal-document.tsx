export function LegalDocument({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <article className="max-w-[44rem]">
      <header className="border-b-[5px] border-dotted border-gold/70 pb-8">
        <h1 className="t-h2 text-[clamp(2.4rem,4.6vw,3.75rem)] text-ink">
          {title}
        </h1>
        <p className="mt-4 text-[0.95rem] text-ink-soft">Effective {updated}</p>
      </header>
      <div className="prose-legal [&>h2:first-child]:mt-10">{children}</div>
    </article>
  )
}
