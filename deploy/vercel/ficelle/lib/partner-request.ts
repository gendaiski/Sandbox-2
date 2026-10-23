import { z } from "zod"

import { usStates } from "@/lib/us-states"

export const categories = [
  { value: "specialty-food", label: "Specialty food" },
  { value: "flowers", label: "Flowers and plants" },
  { value: "wellness", label: "Spa and wellness" },
  { value: "beauty", label: "Beauty, nails" },
  { value: "wine", label: "Wine and spirits" },
  { value: "home", label: "Home decor" },
  { value: "jewelry", label: "Jewelry, watches" },
  { value: "books", label: "Books and games" },
  { value: "workshops", label: "Classes, workshops" },
  { value: "other", label: "Something else" },
] as const

/** Précision demandée quand la boutique choisit « Spa and wellness ». */
export const wellnessTypes = [
  { value: "massage", label: "Massage" },
  { value: "spa", label: "Spa, sauna" },
  { value: "yoga", label: "Yoga, meditation" },
  { value: "bodywork", label: "Chiropractic, reflexology" },
  { value: "hair", label: "Hair salon" },
  { value: "other", label: "Another practice" },
] as const

export const roles = [
  { value: "owner", label: "Owner" },
  { value: "co-owner", label: "Co-owner, partner" },
  { value: "manager", label: "Store manager" },
  { value: "staff", label: "Team member" },
  { value: "other", label: "Another role" },
] as const

const stateCodes = usStates.map((state) => state.value) as [string, ...string[]]

const required = (message: string) => z.string().trim().min(1, message)
const phone = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine(
      (value) => /^(?:\+?1[\s.-]?)?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(value),
      "That doesn’t look like a US number. Try (503) 555-0142."
    )
const email = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .pipe(z.email("Something’s missing in that email address."))

export const partnerRequestSchema = z.object({
  shopName: required("Tell us the name on your storefront."),
  category: z.enum(
    categories.map((c) => c.value) as [string, ...string[]],
    "Pick what you sell."
  ),
  wellnessType: z.string().optional(),
  street: required("Add the street address."),
  city: required("Add the city."),
  state: z.enum(stateCodes, "Choose a state from the list."),
  zip: z
    .string()
    .trim()
    .refine((value) => /^\d{5}$/.test(value), "A ZIP code has 5 digits."),
  ein: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{2}-?\d{7}$/.test(value),
      "An EIN looks like 12-3456789."
    ),
  shopPhone: phone("Add the store’s phone number."),
  shopEmail: email("Add the store’s email."),
  firstName: required("Your first name, please."),
  lastName: required("Your last name, please."),
  phone: phone("A number where we can reach you, please."),
  email: email("An email where we can write to you, please."),
  role: z.string().optional(),
  message: z
    .string()
    .trim()
    .max(2000, "Keep it under 2,000 characters.")
    .optional(),
  consent: z.literal("on", "We can’t call you back without your OK."),
})

export type PartnerRequest = z.infer<typeof partnerRequestSchema>
export type PartnerField = keyof PartnerRequest

/** Les champs de chaque étape du formulaire, dans l'ordre. */
export const partnerSteps: { title: string; fields: PartnerField[] }[] = [
  { title: "Store", fields: ["shopName", "category", "wellnessType"] },
  { title: "Address", fields: ["street", "city", "state", "zip"] },
  { title: "Business", fields: ["ein", "shopPhone", "shopEmail"] },
  {
    title: "Contact",
    fields: ["firstName", "lastName", "phone", "email", "role"],
  },
  { title: "Your note", fields: ["message", "consent"] },
]

export const photoRules = {
  maxBytes: 5 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/webp"],
}

export type PartnerFormState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error"
      message: string
      fieldErrors?: Partial<Record<PartnerField | "photo", string>>
    }

export function firstErrors(error: z.ZodError) {
  const result: Partial<Record<string, string>> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0])
    if (!result[key]) result[key] = issue.message
  }
  return result
}
