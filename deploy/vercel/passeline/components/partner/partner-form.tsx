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
import { PartnerWelcome } from "@/components/illustrations/partner-scenes"
import { Email } from "@/components/site/email"
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
  photoErrors,
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

/** La photo est validée avec l'écran « Business details ». */
const PHOTO_STEP = 2

const stepTitles = [
  "What’s your shop called?",
  "Where can customers find you?",
  "Business details",
  "Who runs the shop?",
  "What would you like to offer?",
]

function toPayload(values: Values) {
  return { ...values, consent: values.consent ? "on" : "" }
}

function stepOf(field: string) {
  return partnerSteps.findIndex((step) =>
    (step.fields as string[]).includes(field)
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
  const shownStep = React.useRef(step)
  const total = partnerSteps.length
  const isLast = step === total - 1

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  // Quand on change d'écran (et seulement là, pas au premier affichage ni
  // au double appel des effets en dev), le titre de l'écran prend le focus.
  React.useEffect(() => {
    if (shownStep.current === step) return
    shownStep.current = step
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current
      ?.closest("form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [step])

  // Si le serveur refuse un champ, on rouvre l'écran qui le contient ;
  // l'ajustement se fait pendant le rendu, sans effet.
  const [handledState, setHandledState] = React.useState(state)
  if (state !== handledState) {
    setHandledState(state)
    if (state.status === "error" && state.fieldErrors) {
      setErrors(state.fieldErrors)
      const first = Object.keys(state.fieldErrors)[0]
      const target = first === "photo" ? PHOTO_STEP : stepOf(first)
      if (target >= 0) setStep(target)
    }
  }

  function validate(fields?: string[]) {
    const result = partnerRequestSchema.safeParse(toPayload(values))
    const found: Errors = result.success ? {} : firstErrors(result.error)
    const checksPhoto = !fields || fields.includes("ein")
    if (photo && checksPhoto) {
      if (!photoRules.types.includes(photo.type)) {
        found.photo = photoErrors.type
      } else if (photo.size > photoRules.maxBytes) {
        found.photo = photoErrors.size
      }
    }
    const scoped = fields
      ? Object.fromEntries(
          Object.entries(found).filter(
            ([key]) => fields.includes(key) || (key === "photo" && checksPhoto)
          )
        )
      : found
    setErrors(scoped)
    return scoped
  }

  function focusField(name: string) {
    requestAnimationFrame(() => {
      const element = document.getElementById(`partner-${name}`)
      // Pour un groupe radio, c'est l'option active (tabindex 0) qui reçoit le focus.
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
      const target = first === "photo" ? PHOTO_STEP : stepOf(first)
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
        className="paper-card flex min-h-[32rem] animate-in scroll-mt-28 flex-col items-center justify-center px-8 py-14 text-center text-ink duration-500 fade-in-0 outline-none [--focus:var(--color-teal-deep)] zoom-in-[0.98]"
      >
        <PartnerWelcome className="h-auto w-full max-w-[17rem]" />
        <h3 className="t-h3 mt-6 text-[1.85rem] md:text-[2.2rem]">
          You’re on your way to the line
        </h3>
        <p className="mt-4 max-w-md text-ink-soft">
          Hugo Lescure will get back to you within 72 hours to say hello and
          plan how your storefront joins the app.
        </p>
      </div>
    )
  }

  const current = partnerSteps[step]

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
      <aside className="hidden flex-col gap-10 pt-4 text-cream lg:flex">
        <ol
          className="relative flex flex-col gap-7"
          aria-label="Application steps"
        >
          <span
            aria-hidden="true"
            className="absolute top-5 bottom-5 left-[21px] border-l-[5px] border-dotted border-gold"
          />
          {partnerSteps.map((item, index) => {
            const done = index < step
            const active = index === step
            return (
              <li
                key={item.title}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "relative flex items-center gap-4 text-[0.98rem] transition-colors duration-200",
                  active && "font-[650] text-cream",
                  !active && done && "text-cream/85",
                  !active && !done && "text-cream/65"
                )}
              >
                <span
                  className={cn(
                    "t-figure grid h-[50px] w-[42px] shrink-0 place-items-center rounded-t-full rounded-b-[8px] pt-1.5 text-[1.25rem] transition-colors duration-300",
                    done &&
                      "bg-gold-light text-teal-deep shadow-[0_4px_0_#a27c2e]",
                    active &&
                      "bg-cream text-teal-deep shadow-[0_4px_0_#cdb98b]",
                    !done &&
                      !active &&
                      "bg-[#24504a] text-cream/70 shadow-[0_4px_0_#0a2523]"
                  )}
                >
                  {done ? (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      strokeWidth={2.6}
                      className="size-5"
                    />
                  ) : (
                    index + 1
                  )}
                  {done ? <span className="sr-only">(done)</span> : null}
                </span>
                {item.title}
              </li>
            )
          })}
        </ol>
        <div className="mt-auto flex flex-col gap-4 border-t border-cream/15 pt-8 text-[0.95rem] text-cream/75">
          <p>
            Hugo Lescure gets back to you within 72 hours. What you share here
            stays with our team.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="link-under font-[650] text-gold-light"
          >
            <Email />
          </a>
        </div>
      </aside>

      <form
        noValidate
        onSubmit={handleSubmit}
        aria-labelledby="partner-step-title"
        className="paper-card flex scroll-mt-28 flex-col px-5 py-7 text-ink [--focus:var(--color-teal-deep)] sm:px-8 md:p-12"
      >
        <Progress value={((step + 1) / total) * 100} className="gap-2.5">
          <ProgressLabel className="text-[0.95rem] text-teal">
            Step {step + 1} of {total}
            <span className="font-normal text-ink-soft">: {current.title}</span>
          </ProgressLabel>
        </Progress>

        <h3
          id="partner-step-title"
          ref={headingRef}
          tabIndex={-1}
          className="t-h3 mt-8 text-[1.75rem] text-ink outline-none md:text-[2.25rem]"
        >
          {stepTitles[step]}
        </h3>

        {state.status === "error" && !state.fieldErrors ? (
          <Alert variant="destructive" className="mt-6">
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.8} />
            <AlertTitle>Your application didn’t go through</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}

        <div
          key={current.title}
          className="mt-8 animate-in duration-300 fade-in-0 slide-in-from-bottom-1"
        >
          {step === 0 && (
            <FieldGroup>
              <Field data-invalid={!!errors.shopName}>
                <FieldLabel htmlFor="partner-shopName">Shop name</FieldLabel>
                <Input
                  id="partner-shopName"
                  autoComplete="organization"
                  placeholder="For example, Quayside Flowers"
                  value={values.shopName}
                  onChange={(event) => set("shopName", event.target.value)}
                  aria-invalid={!!errors.shopName}
                />
                <FieldError>{errors.shopName}</FieldError>
              </Field>

              <Field data-invalid={!!errors.category}>
                <FieldLabel id="partner-category-label">
                  Line of business
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
                      htmlFor={`category-${category.value}`}
                    >
                      <Field
                        orientation="horizontal"
                        className="gap-3 px-4! py-3.5!"
                      >
                        <RadioGroupItem
                          value={category.value}
                          id={`category-${category.value}`}
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
                    Practice
                  </FieldLabel>
                  <Select
                    items={wellnessTypes}
                    value={values.wellnessType || null}
                    onValueChange={(value) =>
                      set("wellnessType", (value as string | null) ?? "")
                    }
                  >
                    <SelectTrigger id="partner-wellnessType">
                      <SelectValue placeholder="Choose a practice" />
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
                  placeholder="12 Market Street"
                  value={values.street}
                  onChange={(event) => set("street", event.target.value)}
                  aria-invalid={!!errors.street}
                />
                <FieldError>{errors.street}</FieldError>
              </Field>
              <Field data-invalid={!!errors.city}>
                <FieldLabel htmlFor="partner-city">City or town</FieldLabel>
                <Input
                  id="partner-city"
                  autoComplete="address-level2"
                  placeholder="Wrenhaven"
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
                  />
                  <FieldError>{errors.zip}</FieldError>
                </Field>
              </div>
              <FieldDescription>
                We work with shops up to 12 miles from downtown Wrenhaven.
              </FieldDescription>
            </FieldGroup>
          )}

          {step === 2 && (
            <FieldGroup>
              <Field data-invalid={!!errors.ein}>
                <FieldLabel htmlFor="partner-ein">
                  EIN
                  <span className="font-normal text-ink-soft">(optional)</span>
                </FieldLabel>
                <Input
                  id="partner-ein"
                  inputMode="numeric"
                  placeholder="12-3456789"
                  maxLength={10}
                  value={values.ein}
                  onChange={(event) =>
                    set("ein", formatEin(event.target.value))
                  }
                  aria-invalid={!!errors.ein}
                />
                <FieldDescription>
                  Your federal tax ID, if you have one handy. It speeds up our
                  setup call.
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
                    placeholder="(802) 555-0142"
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
                    placeholder="hello@yourshop.com"
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
                  <FieldLabel htmlFor="partner-firstName">
                    First name
                  </FieldLabel>
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
                    placeholder="(802) 555-0187"
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
                  Your role
                  <span className="font-normal text-ink-soft">(optional)</span>
                </FieldLabel>
                <Select
                  items={roles}
                  value={values.role || null}
                  onValueChange={(value) =>
                    set("role", (value as string | null) ?? "")
                  }
                >
                  <SelectTrigger id="partner-role">
                    <SelectValue placeholder="What do you do at the shop?" />
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
                  A few words about your plans
                  <span className="font-normal text-ink-soft">(optional)</span>
                </FieldLabel>
                <Textarea
                  id="partner-message"
                  placeholder="What you sell, what makes you different, what you’d like to offer on Passeline…"
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
                    Passeline may call me about this application.
                  </FieldLabel>
                  <FieldDescription>
                    We use these details only to review your application, and
                    they never leave our team.
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
              : "Next step"}
          </Button>
        </div>
      </form>
    </div>
  )
}

/** Garde les chiffres et place le tiret de l'EIN après les deux premiers. */
function formatEin(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 9)
  return digits.length > 2 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : digits
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
  const selected = usStates.find((item) => item.code === value) ?? null
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="partner-state">State</FieldLabel>
      <Combobox<UsState>
        items={usStates}
        value={selected}
        itemToStringLabel={(item) => item.name}
        isItemEqualToValue={(item, current) => item.code === current.code}
        onValueChange={(item) => onChange(item?.code ?? "")}
        autoHighlight
      >
        <ComboboxInput
          id="partner-state"
          autoComplete="address-level1"
          placeholder="Start typing a state"
          aria-invalid={!!error}
          className="w-full"
        />
        <ComboboxContent>
          <ComboboxEmpty>No state matches that.</ComboboxEmpty>
          <ComboboxList>
            {(item: UsState) => (
              <ComboboxItem key={item.code} value={item}>
                <span className="flex w-full items-baseline justify-between gap-3">
                  <span className="font-[600]">{item.name}</span>
                  <span className="text-sm text-ink-soft">{item.code}</span>
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
 * Allège les grosses images avant l'envoi : redimensionnement à 1 600 px et
 * conversion en JPEG, directement dans le navigateur.
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
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
  const inputRef = React.useRef<HTMLInputElement>(null)
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
        A photo of your storefront
        <span className="font-normal text-ink-soft">(optional)</span>
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
        <div className="flex items-center gap-4 rounded-[0.8rem] border-2 border-ink/22 bg-paper p-3 pr-2 shadow-[0_3px_0_rgb(15_35_36/0.07)] peer-focus-visible:border-teal-deep peer-focus-visible:ring-4 peer-focus-visible:ring-gold-light/70">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className="size-14 shrink-0 rounded-lg object-cover ring-2 ring-tuffeau"
            />
          ) : (
            <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-tuffeau text-ink-soft">
              <HugeiconsIcon icon={ImageUpload01Icon} strokeWidth={1.6} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-[600] text-ink">{photo.name}</p>
            <p className="text-sm text-ink-soft">{formatSize(photo.size)}</p>
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
            aria-label="Remove the photo"
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
          className="flex cursor-pointer items-center gap-4 rounded-[0.9rem] border-2 border-dashed border-gold bg-paper px-4 py-4 transition-[border-color,background-color,box-shadow] duration-150 ease-(--ease-out) peer-focus-visible:border-teal-deep peer-focus-visible:ring-4 peer-focus-visible:ring-gold-light/70 peer-aria-invalid:border-destructive hover:border-teal-deep hover:bg-[#fbf3de] data-dragging:border-teal-deep data-dragging:bg-[#f7e9c4]"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-[0.7rem] bg-teal-deep text-gold-light shadow-[0_3px_0_#0a2523]">
            <HugeiconsIcon
              icon={ImageUpload01Icon}
              strokeWidth={1.6}
              className="size-5"
            />
          </span>
          <span className="flex flex-col">
            <span className="font-[650] text-ink">Choose an image</span>
            <span className="text-sm text-ink-soft">
              Drop a file here or browse your folders
            </span>
          </span>
        </label>
      )}
      <FieldDescription id="partner-photo-hint">
        JPG, PNG or WebP, up to 5 MB. A sunny shot of the window works great.
      </FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  )
}
