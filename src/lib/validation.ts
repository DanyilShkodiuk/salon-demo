import { z } from "zod";
import { DATE_RE } from "./time";

const clean = (s: string) => s.replace(/[\u0000-\u001f\u007f]/g, " ").trim();

export const bookingInput = z.object({
  serviceId: z.string().min(1).max(40),
  date: z.string().regex(DATE_RE, "Use the format YYYY-MM-DD"),
  startMinute: z.number().int().min(0).max(24 * 60),
  name: z.string().transform(clean).pipe(z.string().min(2, "Enter your name").max(80)),
  contact: z
    .string()
    .transform(clean)
    .pipe(
      z
        .string()
        .min(5, "Enter an email or phone number")
        .max(120)
        .refine(
          (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\+?[\d\s()-]{7,20}$/.test(v),
          "Enter a valid email or phone number",
        ),
    ),
  note: z.string().transform(clean).pipe(z.string().max(300)).optional().default(""),
  /** Honeypot: real visitors leave this empty. The route silently ignores filled ones. */
  website: z.string().max(200).optional().default(""),
});

export type BookingInput = z.infer<typeof bookingInput>;
