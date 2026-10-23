import { z } from "zod"

import { usStates } from "@/lib/us-states"

export const categories = [
  { value: "florist", label: "Flowers and plants" },
  { value: "chocolate", label: "Chocolate and candy" },
  { value: "bakery", label: "Bakery and pastry" },
  { value: "beauty", label: "Beauty salon, spa" },
  { value: "wellness", label: "Wellness" },
  { value: "restaurant", label: "Restaurant, catering" },
  { value: "jewelry", label: "Jewelry and watches" },
  { value: "fashion", label: "Clothing and accessories" },
  { value: "books", label: "Books and stationery" },
  { value: "other", label: "Something else" },
] as const

export const wellnessTypes = [
  { value: "massage", label: "Massage" },
  { value: "relaxation", label: "Relaxation, breathwork" },
  { value: "yoga", label: "Yoga, Pilates" },
  { value: "coaching", label: "Wellness coaching" },
  { value: "reflexology", label: "Reflexology" },
  { value: "bodywork", label: "Bodywork" },
  { value: "other", label: "Another practice" },
] as const

export const roles = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Store manager" },
  { value: "partner", label: "Business partner" },
  { value: "staff", label: "Team member" },
  { value: "other", label: "Something else" },
] as const

/** US phone numbers: 10 digits, with an optional +1 and the usual separators. */
const usPhone = /^(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/

const required = (message: string) => z.string().trim().min(1, message)
const phone = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine(
      (value) => usPhone.test(value),
      "Use a 10-digit US number, like (802) 555-0142."
    )
const email = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .pipe(z.email("That email address looks incomplete."))

export const partnerRequestSchema = z.object({
  shopName: required("What’s your shop called?"),
  category: z.enum(
    categories.map((c) => c.value) as [string, ...string[]],
    "Pick the line of business closest to yours."
  ),
  wellnessType: z.string().optional(),
  street: required("We need the street address of your shop."),
  city: required("Which city or town is it in?"),
  state: z.enum(
    usStates.map((s) => s.code) as [string, ...string[]],
    "Choose a state from the list."
  ),
  zip: z
    .string()
    .trim()
    .refine((value) => /^\d{5}$/.test(value), "A ZIP code has 5 digits."),
  ein: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{2}-?\d{7}$/.test(value),
      "An EIN has 9 digits, written like 12-3456789."
    ),
  shopPhone: phone("Add the shop’s phone number."),
  shopEmail: email("Add the shop’s email address."),
  firstName: required("What’s your first name?"),
  lastName: required("And your last name?"),
  phone: phone("Where can we call you?"),
  email: email("Where can we email you?"),
  role: z.string().optional(),
  message: z
    .string()
    .trim()
    .max(2000, "Keep it under 2,000 characters.")
    .optional(),
  consent: z.literal("on", "Check the box so we can call you back."),
})

export type PartnerRequest = z.infer<typeof partnerRequestSchema>
export type PartnerField = keyof PartnerRequest

/** How the form is split up: one screen, its fields. */
export const partnerSteps: { title: string; fields: PartnerField[] }[] = [
  { title: "Your shop", fields: ["shopName", "category", "wellnessType"] },
  { title: "Location", fields: ["street", "city", "state", "zip"] },
  { title: "Business details", fields: ["ein", "shopPhone", "shopEmail"] },
  {
    title: "Who runs it",
    fields: ["firstName", "lastName", "phone", "email", "role"],
  },
  { title: "Your plans", fields: ["message", "consent"] },
]

export const photoRules = {
  maxBytes: 5 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/webp"],
}

export const photoErrors = {
  type: "We can only take JPG, PNG or WebP images.",
  size: "That image is over 5 MB.",
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
