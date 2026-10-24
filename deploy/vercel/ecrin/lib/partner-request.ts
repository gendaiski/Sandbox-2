import { z } from "zod"

import { usStates } from "@/lib/us-states"

export const categories = [
  { value: "jewelry", label: "Jewelry" },
  { value: "ceramics", label: "Ceramics, home goods" },
  { value: "florist", label: "Florist" },
  { value: "specialty-food", label: "Specialty food" },
  { value: "chocolate", label: "Chocolate, candy" },
  { value: "beauty", label: "Beauty, spa" },
  { value: "wellness", label: "Wellness" },
  { value: "fashion", label: "Fashion, accessories" },
  { value: "stationery", label: "Stationery, books" },
  { value: "other", label: "Something else" },
] as const

export const wellnessTypes = [
  { value: "massage", label: "Massage" },
  { value: "meditation", label: "Meditation, breathwork" },
  { value: "yoga", label: "Yoga, Pilates" },
  { value: "coaching", label: "Wellness coaching" },
  { value: "reflexology", label: "Reflexology" },
  { value: "chiropractic", label: "Chiropractic" },
  { value: "other", label: "Something else" },
] as const

export const roles = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Store manager" },
  { value: "partner", label: "Business partner" },
  { value: "ceo", label: "CEO or president" },
  { value: "other", label: "Something else" },
] as const

const stateCodes = usStates.map((s) => s.value) as [string, ...string[]]

const required = (message: string) => z.string().trim().min(1, message)
const phone = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine(
      (value) =>
        /^(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(value),
      "Enter a US phone number, like (614) 555-0142."
    )
const email = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .pipe(z.email("That email address looks incomplete."))

export const partnerRequestSchema = z.object({
  shopName: required("Tell us your shop’s name."),
  category: z.enum(
    categories.map((c) => c.value) as [string, ...string[]],
    "Pick what best describes your shop."
  ),
  wellnessType: z.string().optional(),
  street: required("We need your shop’s street address."),
  city: required("Add the city."),
  state: z.enum(stateCodes, "Choose a state."),
  zip: z
    .string()
    .trim()
    .refine(
      (value) => /^\d{5}(?:-\d{4})?$/.test(value),
      "A ZIP code has 5 digits."
    ),
  ein: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{2}-?\d{7}$/.test(value),
      "An EIN looks like 12-3456789."
    )
    .optional(),
  shopPhone: phone("Add your shop’s phone number."),
  shopEmail: email("Add your shop’s email."),
  firstName: required("Add your first name."),
  lastName: required("Add your last name."),
  phone: phone("Add your phone number."),
  email: email("Add your email."),
  role: z.string().optional(),
  message: z
    .string()
    .trim()
    .max(2000, "2,000 characters max, please.")
    .optional(),
  consent: z.literal(
    "on",
    "Check the box so Samuel can call you back."
  ),
})

export type PartnerRequest = z.infer<typeof partnerRequestSchema>
export type PartnerField = keyof PartnerRequest

/** The fields of each form step, in order. */
export const partnerSteps: { title: string; fields: PartnerField[] }[] = [
  { title: "Your shop", fields: ["shopName", "category", "wellnessType"] },
  { title: "Where to find you", fields: ["street", "city", "state", "zip"] },
  {
    title: "Business and contact",
    fields: ["ein", "shopPhone", "shopEmail"],
  },
  {
    title: "About you",
    fields: ["firstName", "lastName", "phone", "email", "role"],
  },
  { title: "Your plans", fields: ["message", "consent"] },
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
