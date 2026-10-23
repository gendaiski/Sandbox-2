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
      <header className="border-b border-cream/12 pb-9">
        <h1 className="font-display text-[clamp(2.1rem,1.4rem+2.6vw,3.4rem)] leading-[1.04] font-[400] tracking-[-0.035em] text-balance text-cream">
          {title}
        </h1>
        <p className="mt-5 text-[0.9375rem] text-cream/62">
          Last updated: {updated}
        </p>
      </header>
      <div className="prose-legal">{children}</div>
    </article>
  )
}
