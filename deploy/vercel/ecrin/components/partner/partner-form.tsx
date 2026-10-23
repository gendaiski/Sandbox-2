"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
  ImageUpload01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { submitPartnerRequest } from "@/app/for-merchants/actions"
import { Mark } from "@/components/brand/logo"
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
  FieldTitle,
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
import { usStates, type UsState } from "@/lib/us-states"
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

function toPayload(values: Values) {
  return { ...values, consent: values.consent ? "on" : "" }
}

function stepOf(field: string) {
  return partnerSteps.findIndex((step) =>
    (step.fields as string[]).includes(field)
  )
}

export function PartnerForm() {
  const [values, setValues] = React.useState(initialValues)
  const [photo, setPhoto] = React.useState(null as File | null)
  const [errors, setErrors] = React.useState({} as Errors)
  const [step, setStep] = React.useState(0)
  const [state, formAction, pending] = React.useActionState<
    PartnerFormState,
    FormData
  >(submitPartnerRequest, { status: "idle" })

  const headingRef = React.useRef(null as HTMLHeadingElement | null)
  const isFirstRender = React.useRef(true)
  const total = partnerSteps.length
  const isLast = step === total - 1

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current
      ?.closest("form")
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
        found.photo = "Use a JPG, PNG, or WebP image."
      } else if (photo.size > photoRules.maxBytes) {
        found.photo = "That photo is too large: 5 MB max."
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
      // A radio group takes focus through its active option (tabindex 0).
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
        className="flex min-h-[32rem] animate-in scroll-mt-10 flex-col items-center justify-center rounded-[2rem] border border-cream/12 bg-[radial-gradient(40rem_20rem_at_50%_0%,rgb(197_153_64/0.22),transparent_70%),linear-gradient(180deg,#153231,#0f2526)] px-8 py-16 text-center duration-500 fade-in-0 outline-none zoom-in-[0.98] motion-reduce:animate-none"
      >
        <span className="flex size-20 items-center justify-center rounded-full border border-gold-light/50 bg-night shadow-[0_0_40px_-6px_rgb(227_190_107/0.55)]">
          <Mark className="w-11" />
        </span>
        <h3 className="mt-8 font-display text-[clamp(1.6rem,1.3rem+1.2vw,2.25rem)] leading-tight font-[420] tracking-[-0.035em] text-cream">
          Got it, thank you
        </h3>
        <p className="mt-4 max-w-md text-cream/75">
          Samuel is reading your application and will call you within
          24&nbsp;business hours to sketch out your storefront together.
        </p>
      </div>
    )
  }

  const current = partnerSteps[step]

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-[2rem] border border-cream/12 bg-[linear-gradient(180deg,#153231,#0f2526)] shadow-[0_40px_90px_-40px_rgb(0_0_0/0.8)] lg:grid-cols-[19rem_1fr]">
      <aside className="hidden flex-col gap-10 border-r border-cream/10 bg-[radial-gradient(120%_70%_at_0%_0%,rgb(197_153_64/0.16),transparent_65%),#0e2223] p-10 text-cream lg:flex">
        <ol className="flex flex-col gap-1" aria-label="Form steps">
          {partnerSteps.map((item, index) => {
            const done = index < step
            const active = index === step
            return (
              <li
                key={item.title}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5",
                  "text-[0.9375rem] transition-colors duration-200",
                  active && "bg-cream/[0.07] font-medium text-cream",
                  !active && done && "text-cream/85",
                  !active && !done && "text-cream/60"
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full font-display text-xs ring-1",
                    done && "bg-gold-light/15 text-gold-light ring-gold-light/60",
                    active &&
                      "bg-gold-light text-ink shadow-[0_0_18px_rgb(227_190_107/0.5)] ring-gold-light",
                    !done && !active && "ring-cream/30"
                  )}
                >
                  {done ? (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      strokeWidth={2.4}
                      className="size-3.5"
                    />
                  ) : (
                    index + 1
                  )}
                </span>
                {item.title}
              </li>
            )
          })}
        </ol>
        <div className="mt-auto flex flex-col gap-4 border-t border-cream/15 pt-8 text-sm text-cream/75">
          <p>
            A call from the founder within 24&nbsp;business hours. What you share
            here stays with Écrin.
          </p>
          <a
            href={"mailto:" + site.email}
            className="self-start font-medium text-gold-light underline underline-offset-4"
          >
            {site.email}
          </a>
        </div>
      </aside>

      <form
        noValidate
        onSubmit={handleSubmit}
        aria-labelledby="partner-step-title"
        className="flex scroll-mt-10 flex-col p-6 sm:p-8 md:p-12"
      >
        <Progress value={((step + 1) / total) * 100} className="gap-2.5">
          <ProgressLabel className="text-sm font-medium text-gold-light">
            Step {step + 1} of {total}
          </ProgressLabel>
        </Progress>

        <h3
          id="partner-step-title"
          ref={headingRef}
          tabIndex={-1}
          className="mt-7 font-display text-[clamp(1.5rem,1.25rem+1vw,2.1rem)] leading-tight font-[420] tracking-[-0.035em] text-balance text-cream outline-none"
        >
          {stepTitles[step]}
        </h3>

        {state.status === "error" && !state.fieldErrors ? (
          <Alert variant="destructive" className="mt-6">
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.8} />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}

        <div
          key={current.title}
          className="mt-8 animate-in duration-300 fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none"
        >
          {step === 0 && (
            <FieldGroup>
              <Field data-invalid={!!errors.shopName}>
                <FieldLabel htmlFor="partner-shopName">
                  Shop name
                </FieldLabel>
                <Input
                  id="partner-shopName"
                  autoComplete="organization"
                  placeholder="For example, Moon Ceramics"
                  value={values.shopName}
                  onChange={(event) => set("shopName", event.target.value)}
                  aria-invalid={!!errors.shopName}
                />
                <FieldError>{errors.shopName}</FieldError>
              </Field>

              <Field data-invalid={!!errors.category}>
                <FieldLabel id="partner-category-label">
                  What you sell
                </FieldLabel>
                <RadioGroup
                  id="partner-category"
                  aria-labelledby="partner-category-label"
                  value={values.category}
                  onValueChange={(value) => set("category", value as string)}
                  aria-invalid={!!errors.category}
                  className="grid gap-2.5 sm:grid-cols-2"
                >
                  {categories.map((category) => (
                    <FieldLabel
                      key={category.value}
                      htmlFor={"category-" + category.value}
                    >
                      <Field
                        orientation="horizontal"
                        className="gap-3 px-4! py-3.5!"
                      >
                        <RadioGroupItem
                          value={category.value}
                          id={"category-" + category.value}
                        />
                        <FieldTitle className="font-medium">
                          {category.label}
                        </FieldTitle>
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
                <FieldError>{errors.category}</FieldError>
              </Field>

              {values.category === "wellness" ? (
                <Field>
                  <FieldLabel htmlFor="partner-wellnessType">
                    Type of wellness
                  </FieldLabel>
                  <Select
                    items={wellnessTypes}
                    value={values.wellnessType || null}
                    onValueChange={(value) =>
                      set("wellnessType", (value as string | null) ?? "")
                    }
                  >
                    <SelectTrigger id="partner-wellnessType">
                      <SelectValue placeholder="Choose an activity" />
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
                  placeholder="21 Linden Avenue"
                  value={values.street}
                  onChange={(event) => set("street", event.target.value)}
                  aria-invalid={!!errors.street}
                />
                <FieldError>{errors.street}</FieldError>
              </Field>
              <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8.5rem]">
                <Field data-invalid={!!errors.city}>
                  <FieldLabel htmlFor="partner-city">City</FieldLabel>
                  <Input
                    id="partner-city"
                    autoComplete="address-level2"
                    placeholder="Vantry"
                    value={values.city}
                    onChange={(event) => set("city", event.target.value)}
                    aria-invalid={!!errors.city}
                  />
                  <FieldError>{errors.city}</FieldError>
                </Field>
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
                    maxLength={10}
                    value={values.zip}
                    onChange={(event) => set("zip", event.target.value)}
                    aria-invalid={!!errors.zip}
                  />
                  <FieldError>{errors.zip}</FieldError>
                </Field>
              </div>
              <FieldDescription>
                We deliver in Vantry and within 10&nbsp;miles: your shop needs
                to be inside that area.
              </FieldDescription>
            </FieldGroup>
          )}

          {step === 2 && (
            <FieldGroup>
              <Field data-invalid={!!errors.ein}>
                <FieldLabel htmlFor="partner-ein">
                  EIN
                  <span className="font-normal text-cream/55">(optional)</span>
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
                />
                <FieldDescription id="partner-ein-hint">
                  Your federal Employer Identification Number, nine digits. It
                  speeds up the review but isn’t required.
                </FieldDescription>
                <FieldError>{errors.ein}</FieldError>
              </Field>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field data-invalid={!!errors.shopPhone}>
                  <FieldLabel htmlFor="partner-shopPhone">
                    Shop phone
                  </FieldLabel>
                  <Input
                    id="partner-shopPhone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(614) 555-0142"
                    value={values.shopPhone}
                    onChange={(event) => set("shopPhone", event.target.value)}
                    aria-invalid={!!errors.shopPhone}
                  />
                  <FieldError>{errors.shopPhone}</FieldError>
                </Field>
                <Field data-invalid={!!errors.shopEmail}>
                  <FieldLabel htmlFor="partner-shopEmail">
                    Shop email
                  </FieldLabel>
                  <Input
                    id="partner-shopEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="hello@yourshop.example"
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
                  <FieldLabel htmlFor="partner-phone">Phone</FieldLabel>
                  <Input
                    id="partner-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(614) 555-0187"
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
                  Role
                  <span className="font-normal text-cream/55">
                    (optional)
                  </span>
                </FieldLabel>
                <Select
                  items={roles}
                  value={values.role || null}
                  onValueChange={(value) =>
                    set("role", (value as string | null) ?? "")
                  }
                >
                  <SelectTrigger id="partner-role">
                    <SelectValue placeholder="Choose your role" />
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
                  What makes your shop special
                  <span className="font-normal text-cream/55">
                    (optional)
                  </span>
                </FieldLabel>
                <Textarea
                  id="partner-message"
                  placeholder="Your signature pieces, how you work, the écrin you’d love to put together…"
                  value={values.message}
                  maxLength={2000}
                  onChange={(event) => set("message", event.target.value)}
                  aria-invalid={!!errors.message}
                />
                <FieldError>{errors.message}</FieldError>
              </Field>
              <Field
                orientation="horizontal"
                data-invalid={!!errors.consent}
                className="items-start"
              >
                <Checkbox
                  id="partner-consent"
                  nativeButton
                  render={<button type="button" />}
                  checked={values.consent}
                  onCheckedChange={(checked) =>
                    set("consent", checked === true)
                  }
                  aria-invalid={!!errors.consent}
                  className="mt-0.5"
                />
                <FieldContent>
                  <FieldLabel htmlFor="partner-consent" className="font-medium">
                    I agree that Écrin may call me about this application.
                  </FieldLabel>
                  <FieldDescription>
                    We use this information to review your application and
                    nothing else. No third party ever sees it.
                  </FieldDescription>
                  <FieldError>{errors.consent}</FieldError>
                </FieldContent>
              </Field>
            </FieldGroup>
          )}
        </div>

        <div className="mt-12 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                strokeWidth={1.8}
                data-icon="inline-start"
              />
              Back
            </Button>
          ) : (
            <span aria-hidden="true" />
          )}
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="sm:min-w-56"
          >
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {isLast
              ? pending
                ? "Sending…"
                : "Send my application"
              : "Next"}
          </Button>
        </div>
      </form>
    </div>
  )
}

const stepTitles = [
  "Your shop, in a few words",
  "Where can customers find you?",
  "The business behind the shop",
  "Who are we talking to?",
  "What you’d like to sell",
]

function StateField({
  value,
  error,
  onChange,
}: {
  value: string
  error?: string
  onChange: (code: string) => void
}) {
  const selected = usStates.find((item) => item.value === value) ?? null
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="partner-state">State</FieldLabel>
      <Combobox<UsState>
        items={usStates}
        value={selected}
        itemToStringLabel={(item) => item.label}
        isItemEqualToValue={(item, other) => item.value === other.value}
        onValueChange={(item) => onChange(item ? item.value : "")}
      >
        <ComboboxInput
          id="partner-state"
          autoComplete="address-level1"
          placeholder="Start typing"
          aria-invalid={!!error}
          className="w-full"
        />
        <ComboboxContent>
          <ComboboxEmpty>No state matches.</ComboboxEmpty>
          <ComboboxList>
            {(item: UsState) => (
              <ComboboxItem key={item.value} value={item}>
                <span className="flex w-full items-baseline justify-between gap-3">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-sm text-cream/55">{item.value}</span>
                </span>
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
 * Shrinks heavy photos in the browser (1,600 px, JPEG) so the upload stays
 * light, whatever the host.
 */
async function compressPhoto(file: File): Promise<File> {
  if (file.size < 1.5 * 1024 * 1024) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas
      .getContext("2d")
      ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
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
    ? Math.max(1, Math.round(bytes / 1024)) + " KB"
    : (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

function PhotoField({
  photo,
  error,
  onChange,
}: {
  photo: File | null
  error?: string
  onChange: (file: File | null) => void
}) {
  const inputRef = React.useRef(null as HTMLInputElement | null)
  const [loaded, setLoaded] = React.useState<{
    file: File
    url: string
  } | null>(null)
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
        Shop photo
        <span className="font-normal text-cream/55">(optional)</span>
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
        <div className="flex items-center gap-4 rounded-xl border border-cream/20 bg-night/60 p-3 pr-2 peer-focus-visible:border-teal-glow peer-focus-visible:shadow-[0_0_0_4px_rgb(26_121_113/0.35)]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className="size-14 shrink-0 rounded-lg object-cover ring-1 ring-cream/15"
            />
          ) : (
            <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-cream/8 text-cream/60">
              <HugeiconsIcon icon={ImageUpload01Icon} strokeWidth={1.6} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-cream">{photo.name}</p>
            <p className="text-sm text-cream/60">{formatSize(photo.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Replace
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove photo"
            onClick={clear}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.8} />
          </Button>
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
          className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-cream/28 bg-night/40 px-4 py-4 transition-[border-color,background-color,box-shadow] duration-150 ease-(--ease-out) peer-focus-visible:border-teal-glow peer-focus-visible:shadow-[0_0_0_4px_rgb(26_121_113/0.35)] peer-aria-invalid:border-destructive hover:border-gold-light/60 hover:bg-gold/8 data-dragging:border-gold-light data-dragging:bg-gold/12"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold-light/40 bg-gold/10 text-gold-light">
            <HugeiconsIcon
              icon={ImageUpload01Icon}
              strokeWidth={1.6}
              className="size-5"
            />
          </span>
          <span className="flex flex-col">
            <span className="font-medium text-cream">Add a photo</span>
            <span className="text-sm text-cream/62">
              Drop it here, or tap to browse
            </span>
          </span>
        </label>
      )}
      <FieldDescription id="partner-photo-hint">
        JPG, PNG, or WebP, up to 5&nbsp;MB. Your workbench, your counter,
        or a piece you’re proud of.
      </FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  )
}
