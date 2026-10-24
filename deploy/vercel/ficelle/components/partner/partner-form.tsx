"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
  ImageUpload01Icon,
} from "@hugeicons/core-free-icons"

import { submitPartnerRequest } from "@/app/for-merchants/actions"
import { Mark } from "@/components/brand/logo"
import { Stamp, Tape } from "@/components/colis/stamp"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  categories,
  firstErrors,
  partnerRequestSchema,
  partnerSteps,
  photoRules,
  roles,
  wellnessTypes,
  type PartnerField,
  type PartnerFormState,
} from "@/lib/partner-request"
import { site } from "@/lib/site"
import { usStates } from "@/lib/us-states"
import { cn } from "@/lib/utils"

type Values = Record<Exclude<PartnerField, "consent">, string> & {
  consent: boolean
}

const initialValues: Values = {
  shopName: "",
  category: "",
  wellnessType: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  ein: "",
  shopPhone: "",
  shopEmail: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  role: "",
  message: "",
  consent: false,
}

type Errors = Partial<Record<PartnerField | "photo", string>>

type UsState = (typeof usStates)[number]

const stepTitles = [
  "What’s the name on your storefront?",
  "Where should couriers stop by?",
  "Your business, in two lines",
  "Who are we talking to?",
  "What you’d like to sell",
]

function toPayload(values: Values) {
  return { ...values, consent: values.consent ? "on" : "" }
}

function stepOf(field: string) {
  return partnerSteps.findIndex((step) =>
    (step.fields as string[]).includes(field)
  )
}

/** « (optional) » dans un intitulé de case. */
function Optional() {
  return (
    <span className="font-sans text-[0.8125rem] font-normal tracking-normal text-ink-soft normal-case">
      (optional)
    </span>
  )
}

export function PartnerForm() {
  const [values, setValues] = React.useState<Values>(initialValues)
  const [photo, setPhoto] = React.useState<File | null>(null)
  const [errors, setErrors] = React.useState<Errors>({})
  const [step, setStep] = React.useState(0)
  const [state, formAction, pending] = React.useActionState<
    PartnerFormState,
    FormData
  >(submitPartnerRequest, { status: "idle" })

  const headingRef = React.useRef<HTMLHeadingElement>(null)
  // Étape déjà affichée : on ne recentre le bordereau que lorsqu'elle change
  // (robuste au double montage du mode strict en développement).
  const shownStep = React.useRef(0)
  const total = partnerSteps.length
  const isLast = step === total - 1

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  React.useEffect(() => {
    if (shownStep.current === step) return
    shownStep.current = step
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current
      ?.closest("[data-slip]")
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [step])

  // Erreurs renvoyées par le serveur : on les affiche et on revient à
  // l'étape concernée (ajustement pendant le rendu, sans effet).
  const [handledState, setHandledState] = React.useState(state)
  if (state !== handledState) {
    setHandledState(state)
    if (state.status === "error" && state.fieldErrors) {
      setErrors(state.fieldErrors)
      const first = Object.keys(state.fieldErrors)[0]
      const target = first === "photo" ? 2 : stepOf(first)
      if (target >= 0) setStep(target)
    }
  }

  function validate(fields?: string[]) {
    const result = partnerRequestSchema.safeParse(toPayload(values))
    const found: Errors = result.success ? {} : firstErrors(result.error)
    if (photo && (!fields || fields.includes("ein"))) {
      if (!photoRules.types.includes(photo.type)) {
        found.photo = "We only take JPG, PNG or WebP images."
      } else if (photo.size > photoRules.maxBytes) {
        found.photo = "That image is too large: 5 MB max."
      }
    }
    const scoped = fields
      ? Object.fromEntries(
          Object.entries(found).filter(
            ([key]) =>
              fields.includes(key) ||
              (key === "photo" && fields.includes("ein"))
          )
        )
      : found
    setErrors(scoped)
    return scoped
  }

  function focusField(name: string) {
    requestAnimationFrame(() => {
      const element = document.getElementById("partner-" + name)
      // Un groupe radio se focalise par son option active (tabindex 0).
      const target =
        element?.getAttribute("role") === "radiogroup"
          ? element.querySelector<HTMLElement>(
              '[role="radio"]:not([tabindex="-1"])'
            )
          : element
      target?.focus()
    })
  }

  function next() {
    const found = validate(partnerSteps[step].fields)
    const first = Object.keys(found)[0]
    if (first) {
      focusField(first)
      return
    }
    setStep((current) => Math.min(current + 1, total - 1))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isLast) {
      next()
      return
    }
    const found = validate()
    const first = Object.keys(found)[0]
    if (first) {
      const target = first === "photo" ? 2 : stepOf(first)
      if (target >= 0 && target !== step) setStep(target)
      else focusField(first)
      return
    }
    const data = new FormData()
    for (const [key, value] of Object.entries(toPayload(values))) {
      data.append(key, value)
    }
    if (photo) data.append("photo", await compressPhoto(photo))
    React.startTransition(() => formAction(data))
  }

  if (state.status === "success") {
    return (
      <div
        role="status"
        ref={(node) => node?.focus({ preventScroll: false })}
        tabIndex={-1}
        className="paper relative mx-auto flex max-w-[44rem] scroll-mt-28 flex-col items-center overflow-hidden rounded-[3px] px-6 pt-10 pb-12 text-center outline-none sm:px-12"
      >
        <p className="type-field text-ink/70">Receipt</p>
        <Mark className="mt-6 w-14" />
        <h3 className="type-title mt-5 text-[2.75rem] sm:text-[3.5rem]">
          Got it, thank you!
        </h3>
        <p className="mt-4 max-w-[40ch] text-[1.0625rem] leading-[1.6] text-ink-soft">
          Inès Morvan will call you within 3 business days to talk about your store and
          the first products to put on the shelf.
        </p>
        <dl className="mt-8 grid w-full max-w-[26rem] gap-2 border-t-[1.5px] border-dashed border-ink/40 pt-5 text-left font-mono text-[0.875rem]">
          <div className="flex justify-between gap-4">
            <dt className="uppercase">Store</dt>
            <dd className="truncate">{values.shopName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="uppercase">Call</dt>
            <dd>within 3 business days</dd>
          </div>
        </dl>
        <Stamp
          r={-10}
          className="anim-stamp absolute top-6 right-4 text-[1.5rem] [--d:150ms] sm:right-8 sm:text-[1.9rem]"
        >
          Slip
          <br />
          received
        </Stamp>
      </div>
    )
  }

  const current = partnerSteps[step]

  return (
    <div data-slip className="paper relative scroll-mt-24 rounded-[3px]">
      <Tape r={-3} className="-top-3 left-1/2 w-28 -translate-x-1/2" />

      {/* En-tête du bordereau */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b-[3px] border-ink px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Mark className="w-8" />
          <p className="type-field text-[0.8125rem] text-ink">Merchant sign-up slip</p>
        </div>
        <p className="type-field text-ink/70">Call back within 3 business days</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[17rem_1fr]">
        {/* Souche du bordereau */}
        <aside className="kraft-pale relative hidden flex-col gap-10 border-r-2 border-dashed border-ink/40 p-8 lg:flex">
          <ol className="flex flex-col gap-1" aria-label="Form steps">
            {partnerSteps.map((item, index) => {
              const done = index < step
              const active = index === step
              return (
                <li
                  key={item.title}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-3 py-2 text-[1rem]",
                    active ? "font-bold text-ink" : "text-ink-soft"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-7 shrink-0 place-items-center border-2 font-mono text-[0.8125rem] font-semibold",
                      done && "border-ink bg-paper text-ink",
                      active && "border-teal-deep bg-teal text-white",
                      !done && !active && "border-ink/45 text-ink/70"
                    )}
                  >
                    {done ? (
                      <svg viewBox="0 0 12 12" className="size-3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M2 2l8 8M10 2l-8 8" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>
                  {item.title}
                  {done ? <span className="sr-only">(done)</span> : null}
                </li>
              )
            })}
          </ol>
          <div className="mt-auto flex flex-col gap-3 border-t-[1.5px] border-ink/30 pt-6 text-[0.9375rem] leading-[1.5] text-ink-soft">
            <p>
              The founder calls you back within 3 business days. Nothing you write here
              leaves Ficelle.
            </p>
            <a
              href={"mailto:" + site.email}
              className="font-semibold text-ink underline decoration-2 underline-offset-4 hover:decoration-teal"
            >
              {site.email}
            </a>
          </div>
        </aside>

        <form
          noValidate
          onSubmit={handleSubmit}
          aria-labelledby="partner-step-title"
          className="flex min-w-0 flex-col p-5 sm:p-8 lg:p-12"
        >
          <Progress value={((step + 1) / total) * 100} className="gap-2.5">
            <ProgressLabel className="text-ink">
              Step {step + 1} of {total}
            </ProgressLabel>
            <span className="ml-auto hidden font-mono text-[0.75rem] tracking-[0.07em] text-ink-soft uppercase sm:block">
              {current.title}
            </span>
          </Progress>

          <h3
            id="partner-step-title"
            ref={headingRef}
            tabIndex={-1}
            className="type-title mt-8 text-[2.4rem] text-ink outline-none sm:text-[3rem]"
          >
            {stepTitles[step]}
          </h3>

          {state.status === "error" && !state.fieldErrors ? (
            <Alert variant="destructive" className="mt-6">
              <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.8} />
              <AlertTitle>Your slip didn’t go through</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div key={current.title} className="mt-8 animate-in duration-300 fade-in-0">
            {step === 0 && (
              <FieldGroup>
                <Field data-invalid={!!errors.shopName}>
                  <FieldLabel htmlFor="partner-shopName">Store name</FieldLabel>
                  <Input
                    id="partner-shopName"
                    autoComplete="organization"
                    placeholder="For example: Tansy Pantry"
                    value={values.shopName}
                    onChange={(event) => set("shopName", event.target.value)}
                    aria-invalid={!!errors.shopName}
                  />
                  <FieldError>{errors.shopName}</FieldError>
                </Field>

                <Field data-invalid={!!errors.category}>
                  <FieldLabel id="partner-category-label">What you sell</FieldLabel>
                  <RadioGroup
                    id="partner-category"
                    aria-labelledby="partner-category-label"
                    value={values.category}
                    onValueChange={(value) => set("category", value as string)}
                    aria-invalid={!!errors.category}
                    className="grid gap-2.5 sm:grid-cols-2"
                  >
                    {categories.map((category) => (
                      <label
                        key={category.value}
                        className="group/cat relative flex cursor-pointer items-center gap-3 rounded-[3px] border-[1.5px] border-ink/35 bg-paper py-2.5 pr-4 pl-3 transition-[border-color,background-color] duration-150 hover:border-ink has-data-checked:border-teal has-data-checked:bg-[#edf5f3] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal/40 has-[:focus-visible]:outline-solid"
                      >
                        <RadioGroupItem
                          value={category.value}
                          className="size-6 focus-visible:outline-none"
                        />
                        <span aria-hidden="true" className="h-6 border-l border-dashed border-ink/30" />
                        <span className="text-[1rem] font-semibold">{category.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  <FieldError>{errors.category}</FieldError>
                </Field>

                {values.category === "wellness" ? (
                  <Field>
                    <FieldLabel htmlFor="partner-wellnessType">Which practice?</FieldLabel>
                    <Select
                      items={wellnessTypes}
                      value={values.wellnessType || null}
                      onValueChange={(value) => set("wellnessType", (value as string | null) ?? "")}
                    >
                      <SelectTrigger id="partner-wellnessType">
                        <SelectValue placeholder="Massage, yoga, hair…" />
                      </SelectTrigger>
                      <SelectContent>
                        {wellnessTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                ) : null}
              </FieldGroup>
            )}

            {step === 1 && (
              <FieldGroup>
                <Field data-invalid={!!errors.street}>
                  <FieldLabel htmlFor="partner-street">Street address</FieldLabel>
                  <Input
                    id="partner-street"
                    autoComplete="address-line1"
                    placeholder="12 Ropewalk Street"
                    value={values.street}
                    onChange={(event) => set("street", event.target.value)}
                    aria-invalid={!!errors.street}
                  />
                  <FieldError>{errors.street}</FieldError>
                </Field>
                <Field data-invalid={!!errors.city}>
                  <FieldLabel htmlFor="partner-city">City</FieldLabel>
                  <Input
                    id="partner-city"
                    autoComplete="address-level2"
                    placeholder="Bellmere"
                    value={values.city}
                    onChange={(event) => set("city", event.target.value)}
                    aria-invalid={!!errors.city}
                  />
                  <FieldError>{errors.city}</FieldError>
                </Field>
                <div className="grid gap-6 sm:grid-cols-[1fr_10rem]">
                  <StateField
                    value={values.state}
                    error={errors.state}
                    onChange={(code) => set("state", code)}
                  />
                  <Field data-invalid={!!errors.zip}>
                    <FieldLabel htmlFor="partner-zip">ZIP code</FieldLabel>
                    <Input
                      id="partner-zip"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="00000"
                      maxLength={5}
                      value={values.zip}
                      onChange={(event) => set("zip", event.target.value)}
                      aria-invalid={!!errors.zip}
                      className="font-mono tracking-[0.2em]"
                    />
                    <FieldError>{errors.zip}</FieldError>
                  </Field>
                </div>
                <FieldDescription>
                  We work with stores in Bellmere and towns within 15 miles, Corbin Falls included.
                </FieldDescription>
              </FieldGroup>
            )}

            {step === 2 && (
              <FieldGroup>
                <Field data-invalid={!!errors.ein}>
                  <FieldLabel htmlFor="partner-ein">
                    EIN <Optional />
                  </FieldLabel>
                  <Input
                    id="partner-ein"
                    inputMode="numeric"
                    placeholder="12-3456789"
                    maxLength={10}
                    value={values.ein}
                    onChange={(event) => set("ein", event.target.value)}
                    aria-invalid={!!errors.ein}
                    aria-describedby="partner-ein-hint"
                    className="font-mono tracking-[0.12em]"
                  />
                  <FieldDescription id="partner-ein-hint">
                    Your federal Employer Identification Number, if you have one. Sole
                    proprietors can skip it.
                  </FieldDescription>
                  <FieldError>{errors.ein}</FieldError>
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field data-invalid={!!errors.shopPhone}>
                    <FieldLabel htmlFor="partner-shopPhone">Store phone</FieldLabel>
                    <Input
                      id="partner-shopPhone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="(503) 555-0142"
                      value={values.shopPhone}
                      onChange={(event) => set("shopPhone", event.target.value)}
                      aria-invalid={!!errors.shopPhone}
                    />
                    <FieldError>{errors.shopPhone}</FieldError>
                  </Field>
                  <Field data-invalid={!!errors.shopEmail}>
                    <FieldLabel htmlFor="partner-shopEmail">Store email</FieldLabel>
                    <Input
                      id="partner-shopEmail"
                      type="email"
                      autoComplete="email"
                      placeholder="hello@yourstore.example"
                      value={values.shopEmail}
                      onChange={(event) => set("shopEmail", event.target.value)}
                      aria-invalid={!!errors.shopEmail}
                    />
                    <FieldError>{errors.shopEmail}</FieldError>
                  </Field>
                </div>
                <PhotoField
                  photo={photo}
                  error={errors.photo}
                  onChange={(file) => {
                    setPhoto(file)
                    setErrors((e) => ({ ...e, photo: undefined }))
                  }}
                />
              </FieldGroup>
            )}

            {step === 3 && (
              <FieldGroup>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field data-invalid={!!errors.firstName}>
                    <FieldLabel htmlFor="partner-firstName">First name</FieldLabel>
                    <Input
                      id="partner-firstName"
                      autoComplete="given-name"
                      value={values.firstName}
                      onChange={(event) => set("firstName", event.target.value)}
                      aria-invalid={!!errors.firstName}
                    />
                    <FieldError>{errors.firstName}</FieldError>
                  </Field>
                  <Field data-invalid={!!errors.lastName}>
                    <FieldLabel htmlFor="partner-lastName">Last name</FieldLabel>
                    <Input
                      id="partner-lastName"
                      autoComplete="family-name"
                      value={values.lastName}
                      onChange={(event) => set("lastName", event.target.value)}
                      aria-invalid={!!errors.lastName}
                    />
                    <FieldError>{errors.lastName}</FieldError>
                  </Field>
                  <Field data-invalid={!!errors.phone}>
                    <FieldLabel htmlFor="partner-phone">Mobile phone</FieldLabel>
                    <Input
                      id="partner-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="(503) 555-0187"
                      value={values.phone}
                      onChange={(event) => set("phone", event.target.value)}
                      aria-invalid={!!errors.phone}
                    />
                    <FieldError>{errors.phone}</FieldError>
                  </Field>
                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="partner-email">Email</FieldLabel>
                    <Input
                      id="partner-email"
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={(event) => set("email", event.target.value)}
                      aria-invalid={!!errors.email}
                    />
                    <FieldError>{errors.email}</FieldError>
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="partner-role">
                    Role <Optional />
                  </FieldLabel>
                  <Select
                    items={roles}
                    value={values.role || null}
                    onValueChange={(value) => set("role", (value as string | null) ?? "")}
                  >
                    <SelectTrigger id="partner-role">
                      <SelectValue placeholder="Your role at the store" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            )}

            {step === 4 && (
              <FieldGroup>
                <Field data-invalid={!!errors.message}>
                  <FieldLabel htmlFor="partner-message">
                    A few words about your store <Optional />
                  </FieldLabel>
                  <Textarea
                    id="partner-message"
                    placeholder="What people find at your place, your best sellers, what you’d like to feature…"
                    value={values.message}
                    maxLength={2000}
                    onChange={(event) => set("message", event.target.value)}
                    aria-invalid={!!errors.message}
                  />
                  <FieldError>{errors.message}</FieldError>
                </Field>
                <Field orientation="horizontal" data-invalid={!!errors.consent} className="items-start gap-3.5">
                  <Checkbox
                    id="partner-consent"
                    nativeButton
                    render={<button type="button" />}
                    checked={values.consent}
                    onCheckedChange={(checked) => set("consent", checked === true)}
                    aria-invalid={!!errors.consent}
                    className="mt-0.5"
                  />
                  <FieldContent>
                    <FieldLabel
                      htmlFor="partner-consent"
                      className="font-sans text-[1.0625rem] font-semibold tracking-normal normal-case"
                    >
                      Ficelle may call or email me to follow up on this slip.
                    </FieldLabel>
                    <FieldDescription>
                      We only use this information to review your sign-up, and it stays with
                      Ficelle.
                    </FieldDescription>
                    <FieldError>{errors.consent}</FieldError>
                  </FieldContent>
                </Field>
              </FieldGroup>
            )}
          </div>

          <div className="mt-12 flex flex-col-reverse gap-3 border-t-[1.5px] border-dashed border-ink/35 pt-8 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.8} />
                Back
              </Button>
            ) : (
              <span aria-hidden="true" />
            )}
            <Button type="submit" size="lg" disabled={pending} className="sm:min-w-56">
              {pending ? <Spinner /> : null}
              {isLast ? (pending ? "Sending…" : "Send my slip") : "Next step"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function StateField({
  value,
  error,
  onChange,
}: {
  value: string
  error?: string
  onChange: (code: string) => void
}) {
  const selected = usStates.find((state) => state.value === value) ?? null
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="partner-state">State</FieldLabel>
      <Combobox<UsState>
        items={usStates}
        itemToStringLabel={(item) => item.label}
        isItemEqualToValue={(item, current) => item.value === current.value}
        value={selected}
        onValueChange={(item) => onChange(item?.value ?? "")}
      >
        <ComboboxInput
          id="partner-state"
          autoComplete="address-level1"
          placeholder="Start typing a state"
          aria-invalid={!!error}
          className="w-full"
        />
        <ComboboxContent>
          <ComboboxEmpty>No state by that name.</ComboboxEmpty>
          <ComboboxList>
            {(item: UsState) => (
              <ComboboxItem key={item.value} value={item}>
                <span className="w-8 font-mono text-[0.8125rem] text-ink-soft">{item.value}</span>
                <span className="font-semibold">{item.label}</span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldError>{error}</FieldError>
    </Field>
  )
}

/**
 * Réduit les photos lourdes dans le navigateur (1 600 px, JPEG) pour que
 * l'envoi reste léger, quel que soit l'hébergeur.
 */
async function compressPhoto(file: File): Promise<File> {
  if (file.size < 1.5 * 1024 * 1024) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    )
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
      type: "image/jpeg",
    })
  } catch {
    return file
  }
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? Math.max(1, Math.round(bytes / 1024)) + " KB"
    : (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

/** Photo de la vitrine : un polaroïd à joindre au bordereau. */
function PhotoField({
  photo,
  error,
  onChange,
}: {
  photo: File | null
  error?: string
  onChange: (file: File | null) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [loaded, setLoaded] = React.useState<{ file: File; url: string } | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const preview = loaded && loaded.file === photo ? loaded.url : null

  React.useEffect(() => {
    if (!photo || !photoRules.types.includes(photo.type)) return
    const reader = new FileReader()
    reader.onload = () => setLoaded({ file: photo, url: String(reader.result) })
    reader.readAsDataURL(photo)
    return () => reader.abort()
  }, [photo])

  function clear() {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ""
    inputRef.current?.focus()
  }

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="partner-photo">
        A photo of your storefront <Optional />
      </FieldLabel>
      <Input
        ref={inputRef}
        id="partner-photo"
        type="file"
        accept={photoRules.types.join(",")}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        aria-invalid={!!error}
        aria-describedby="partner-photo-hint"
        className="peer sr-only h-px w-px border-0 p-0"
      />
      {photo ? (
        <div className="flex flex-wrap items-center gap-4 rounded-[2px] border-[1.5px] border-ink/40 bg-paper p-3 peer-focus-visible:border-teal peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal/35 peer-focus-visible:outline-solid sm:flex-nowrap">
          <div className="relative -rotate-3 bg-paper p-1.5 pb-4 shadow-[0_6px_12px_-4px_rgb(60_38_12/0.5)] ring-1 ring-ink/10">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="size-16 object-cover" />
            ) : (
              <span className="flex size-16 items-center justify-center bg-kraft-pale text-ink-soft">
                <HugeiconsIcon icon={ImageUpload01Icon} strokeWidth={1.6} />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">{photo.name}</p>
            <p className="font-mono text-[0.8125rem] text-ink-soft">{formatSize(photo.size)}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
              Replace
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove photo" onClick={clear}>
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.8} />
            </Button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="partner-photo"
          data-dragging={dragging || undefined}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            const file = event.dataTransfer.files?.[0]
            if (file) onChange(file)
          }}
          className="flex cursor-pointer items-center gap-4 rounded-[2px] border-2 border-dashed border-ink/40 bg-paper px-4 py-4 transition-[border-color,background-color] duration-150 ease-(--ease-out) peer-focus-visible:border-teal peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal/35 peer-focus-visible:outline-solid peer-aria-invalid:border-destructive hover:border-teal hover:bg-[#edf5f3] data-dragging:border-teal data-dragging:bg-[#edf5f3]"
        >
          <span
            aria-hidden="true"
            className="grid h-16 w-14 shrink-0 -rotate-3 place-items-center bg-paper p-1 pb-3 shadow-[0_4px_10px_-3px_rgb(60_38_12/0.45)] ring-1 ring-ink/10"
          >
            <span className="grid size-full place-items-center bg-kraft-pale text-teal">
              <HugeiconsIcon icon={ImageUpload01Icon} strokeWidth={1.6} className="size-5" />
            </span>
          </span>
          <span className="flex flex-col">
            <span className="font-semibold text-ink">Add a photo</span>
            <span className="text-[0.9375rem] text-ink-soft">Drop the file here, or tap to browse</span>
          </span>
        </label>
      )}
      <FieldDescription id="partner-photo-hint">
        JPG, PNG or WebP, up to 5&nbsp;MB. Your storefront or a shelf: whatever feels like you.
      </FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  )
}
