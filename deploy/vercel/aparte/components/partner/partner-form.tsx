"use client"

import * as React from "react"
import {
  Alert02Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
  ImageUpload01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

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
  usStates,
  wellnessTypes,
  type PartnerField,
  type PartnerFormState,
  type UsState,
} from "@/lib/partner-request"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

type Values = Record<Exclude<PartnerField, "consent">, string> & {
  consent: boolean
}

const initialValues: Values = {
  shopName: "",
  category: "",
  wellnessType: "",
  address: "",
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

const stepTitles = [
  "What name is on your door?",
  "Where can we find you?",
  "Your business, and how to reach it",
  "Who should we call?",
  "Tell us about your shop",
]

function toPayload(values: Values) {
  return { ...values, consent: values.consent ? "on" : "" }
}

function stepOf(field: string) {
  return partnerSteps.findIndex((step) =>
    (step.fields as string[]).includes(field)
  )
}

const optional = (
  <span className="font-normal text-ink-soft italic">(optional)</span>
)

export function PartnerForm() {
  const [values, setValues] = React.useState(initialValues)
  const [errors, setErrors] = React.useState<Errors>({})
  const [photo, setPhoto] = React.useState<File | null>(null)
  const [step, setStep] = React.useState(0)
  const [state, formAction, pending] = React.useActionState<
    PartnerFormState,
    FormData
  >(submitPartnerRequest, { status: "idle" })

  const isFirstRender = React.useRef(true)
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const total = partnerSteps.length
  const isLast = step === total - 1

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  // À chaque changement d'étape : le titre de l'étape reçoit le focus.
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    headingRef.current?.focus({ preventScroll: true })
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    headingRef.current
      ?.closest("[data-bulletin]")
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
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
        found.photo = "Only JPG, PNG or WebP files work here."
      } else if (photo.size > photoRules.maxBytes) {
        found.photo = "That image is larger than 5 MB."
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
      // Pour un groupe radio, on vise l’option qui porte le tabindex 0.
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
        data-bulletin
        role="status"
        ref={(node) => node?.focus({ preventScroll: false })}
        tabIndex={-1}
        className="bulletin flex min-h-[30rem] scroll-mt-8 flex-col items-center justify-center px-8 py-16 text-center"
      >
        <Mark className="h-[3.75rem]" />
        <h3 className="display mt-8 text-[2.25rem] md:text-[3rem]">
          Got it. Thank you!
        </h3>
        <p className="mt-5 max-w-md text-[1rem] leading-[1.65] text-ink-soft">
          Clémence Varenne will call you within five business days to set
          up the photo shoot and the launch of your page.
        </p>
      </div>
    )
  }

  return (
    <div
      data-bulletin
      className="bulletin grid scroll-mt-8 grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)]"
    >
      {/* Sommaire du bulletin */}
      <aside className="hidden flex-col border-r border-gold/50 px-8 py-10 lg:flex">
        <p className="serif text-[1.125rem] text-ink italic">
          Application form
        </p>
        <ol
          className="mt-8 flex flex-col border-t border-ink/10"
          aria-label="Form steps"
        >
          {partnerSteps.map((item, index) => {
            const done = index < step
            const active = index === step
            return (
              <li
                key={item.title}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "relative flex items-baseline gap-3 border-b border-ink/10 py-3 text-[0.9375rem] transition-colors duration-200",
                  active ? "text-ink" : "text-ink-soft"
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-2 bottom-2 -left-5 w-[3px] bg-gold"
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className={cn(
                    "serif w-5 shrink-0 text-[1.0625rem] italic tabular-nums",
                    active ? "text-gold-ink" : "text-ink-soft"
                  )}
                >
                  {done ? (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      strokeWidth={1.8}
                      className="size-4 translate-y-0.5 text-gold-ink"
                    />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className={active ? "font-medium" : undefined}>
                  {item.title}
                  {done ? <span className="sr-only"> (done)</span> : null}
                </span>
              </li>
            )
          })}
        </ol>
        <div className="mt-auto pt-10 text-[0.8125rem] leading-[1.6] text-ink-soft">
          <p>
            Clémence calls back within five business days. What you write
            here stays between us.
          </p>
          <a href={"mailto:" + site.email} className="link-edito mt-3 inline-block">
            {site.email}
          </a>
        </div>
      </aside>

      <form
        noValidate
        onSubmit={handleSubmit}
        aria-labelledby="partner-step-title"
        className="flex flex-col px-5 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12"
      >
        <Progress value={((step + 1) / total) * 100} className="gap-3">
          <ProgressLabel>
            Step {step + 1} of {total}
            <span className="lg:hidden">: {partnerSteps[step].title}</span>
          </ProgressLabel>
        </Progress>

        <h3
          id="partner-step-title"
          ref={headingRef}
          tabIndex={-1}
          className="display mt-8 text-[2.125rem] leading-[1] text-balance outline-none md:text-[2.75rem]"
        >
          {stepTitles[step]}
        </h3>

        {state.status === "error" && !state.fieldErrors ? (
          <Alert variant="destructive" className="mt-6">
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.6} />
            <AlertTitle>Your application didn’t go through</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}

        <div key={step} className="mt-10">
          {step === 0 && (
            <FieldGroup>
              <Field data-invalid={!!errors.shopName}>
                <FieldLabel htmlFor="partner-shopName">
                  Shop name
                </FieldLabel>
                <Input
                  id="partner-shopName"
                  autoComplete="organization"
                  placeholder="For example: Petal & Stem"
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
                  className="grid gap-x-10 gap-y-0 border-t border-ink/10 sm:grid-cols-2"
                >
                  {categories.map((category) => (
                    <label
                      key={category.value}
                      htmlFor={"category-" + category.value}
                      className="flex cursor-pointer items-center gap-3.5 border-b border-ink/10 py-3 text-[1rem] text-ink transition-colors hover:text-teal has-data-checked:font-medium has-data-checked:text-teal"
                    >
                      <RadioGroupItem
                        value={category.value}
                        id={"category-" + category.value}
                      />
                      {category.label}
                    </label>
                  ))}
                </RadioGroup>
                <FieldError>{errors.category}</FieldError>
              </Field>

              {values.category === "wellness" ? (
                <Field>
                  <FieldLabel htmlFor="partner-wellnessType">
                    Specialty {optional}
                  </FieldLabel>
                  <Select
                    items={wellnessTypes}
                    value={values.wellnessType || null}
                    onValueChange={(value) =>
                      set("wellnessType", (value as string | null) ?? "")
                    }
                  >
                    <SelectTrigger id="partner-wellnessType">
                      <SelectValue placeholder="Choose your practice" />
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
              <Field data-invalid={!!errors.address}>
                <FieldLabel htmlFor="partner-address">Street address</FieldLabel>
                <Input
                  id="partner-address"
                  autoComplete="street-address"
                  placeholder="3 Market Hall Square"
                  value={values.address}
                  onChange={(event) => set("address", event.target.value)}
                  aria-invalid={!!errors.address}
                />
                <FieldError>{errors.address}</FieldError>
              </Field>
              <Field data-invalid={!!errors.city}>
                <FieldLabel htmlFor="partner-city">City</FieldLabel>
                <Input
                  id="partner-city"
                  autoComplete="address-level2"
                  placeholder="Larch Harbor"
                  value={values.city}
                  onChange={(event) => set("city", event.target.value)}
                  aria-invalid={!!errors.city}
                />
                <FieldError>{errors.city}</FieldError>
              </Field>
              <div className="grid gap-8 sm:grid-cols-[1fr_9rem]">
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
                We work with shops in Larch Harbor and within 20&nbsp;miles of
                it.
              </FieldDescription>
            </FieldGroup>
          )}

          {step === 2 && (
            <FieldGroup>
              <Field data-invalid={!!errors.ein}>
                <FieldLabel htmlFor="partner-ein">EIN {optional}</FieldLabel>
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
                  Your federal Employer Identification Number, if you have one.
                  It stays on file and is never shown in the app.
                </FieldDescription>
                <FieldError>{errors.ein}</FieldError>
              </Field>
              <div className="grid gap-8 sm:grid-cols-2">
                <Field data-invalid={!!errors.shopPhone}>
                  <FieldLabel htmlFor="partner-shopPhone">
                    Shop phone
                  </FieldLabel>
                  <Input
                    id="partner-shopPhone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(360) 555-0142"
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
              <div className="grid gap-8 sm:grid-cols-2">
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
                    placeholder="(360) 555-0187"
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
                <FieldLabel htmlFor="partner-role">Your role {optional}</FieldLabel>
                <Select
                  items={roles}
                  value={values.role || null}
                  onValueChange={(value) =>
                    set("role", (value as string | null) ?? "")
                  }
                >
                  <SelectTrigger id="partner-role">
                    <SelectValue placeholder="Choose one" />
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
                  What makes your shop yours {optional}
                </FieldLabel>
                <Textarea
                  id="partner-message"
                  placeholder="What you sell, what sets you apart, what you’d like to see on your page…"
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
                className="items-start gap-3.5"
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
                  <FieldLabel
                    htmlFor="partner-consent"
                    className="text-[0.9375rem] font-normal"
                  >
                    I agree that Aparté may call me back about this
                    application.
                  </FieldLabel>
                  <FieldDescription>
                    We only use this information to prepare our call. It never
                    leaves Aparté.
                  </FieldDescription>
                  <FieldError>{errors.consent}</FieldError>
                </FieldContent>
              </Field>
            </FieldGroup>
          )}
        </div>

        <div className="mt-12 flex flex-col-reverse gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="-ml-3 self-start sm:self-auto"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                strokeWidth={1.4}
                data-icon="inline-start"
                aria-hidden="true"
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
              : "Next step"}
          </Button>
        </div>
      </form>
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
  const selected = usStates.find((state) => state.code === value) ?? null
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="partner-state">State</FieldLabel>
      <Combobox<UsState>
        items={usStates}
        value={selected}
        itemToStringLabel={(item) => item.name}
        isItemEqualToValue={(item, current) => item.code === current.code}
        onValueChange={(item) => onChange(item ? item.code : "")}
      >
        <ComboboxInput
          id="partner-state"
          autoComplete="address-level1"
          placeholder="Start typing"
          aria-invalid={!!error}
          className="w-full"
        />
        <ComboboxContent>
          <ComboboxEmpty>No state matches that.</ComboboxEmpty>
          <ComboboxList>
            {(item: UsState) => (
              <ComboboxItem key={item.code} value={item}>
                <span className="w-7 shrink-0 text-[0.8125rem] text-gold-ink tabular-nums">
                  {item.code}
                </span>
                {item.name}
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
 * Allège les images trop lourdes avant l'envoi : 1 600 px de côté au plus,
 * en JPEG, directement dans le navigateur.
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

const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 })

/** Poids lisible d'un fichier : en KB jusqu'à 1 MB, en MB au-delà. */
function formatSize(bytes: number) {
  const kilo = bytes / 1024
  if (kilo < 1024) return Math.max(1, Math.round(kilo)) + "\u00a0KB"
  return decimal.format(kilo / 1024) + "\u00a0MB"
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
        A photo of your storefront {optional}
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
        <div className="flex items-center gap-4 border border-ink/15 bg-paper p-3 pr-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal peer-focus-visible:outline-solid">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className="size-16 shrink-0 bg-white object-cover p-1 shadow-[0_1px_0_rgb(15_35_36/0.12),0_6px_14px_-8px_rgb(15_35_36/0.35)]"
            />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center bg-paper-deep text-ink-soft">
              <HugeiconsIcon icon={ImageUpload01Icon} strokeWidth={1.4} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.9375rem] text-ink">{photo.name}</p>
            <p className="text-[0.8125rem] text-ink-soft">
              {formatSize(photo.size)}
            </p>
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
            size="icon"
            aria-label="Remove photo"
            onClick={clear}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.4} />
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
          className="flex cursor-pointer items-center gap-4 border border-dashed border-gold px-4 py-5 transition-[border-color,background-color] duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal peer-focus-visible:outline-solid peer-aria-invalid:border-destructive hover:border-teal hover:bg-teal/[0.035] data-dragging:border-teal data-dragging:bg-teal/[0.06]"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/70 text-gold-ink">
            <HugeiconsIcon
              icon={ImageUpload01Icon}
              strokeWidth={1.4}
              className="size-5"
            />
          </span>
          <span className="flex flex-col">
            <span className="serif text-[1.125rem] text-ink italic">
              Add a photo
            </span>
            <span className="text-[0.8125rem] text-ink-soft">
              Drop the file here, or browse your folders
            </span>
          </span>
        </label>
      )}
      <FieldDescription id="partner-photo-hint">
        JPG, PNG or WebP, up to 5&nbsp;MB. We’ll take proper photos on site
        anyway.
      </FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  )
}
