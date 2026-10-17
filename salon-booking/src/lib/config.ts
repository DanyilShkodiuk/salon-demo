export const SALON = {
  name: "Luna Hair Studio",
  timezone: "Europe/Warsaw",
  /** Opening hours in minutes since midnight, keyed by weekday (0 = Sunday). null = closed. */
  hours: {
    0: null,
    1: { open: 9 * 60, close: 18 * 60 },
    2: { open: 9 * 60, close: 18 * 60 },
    3: { open: 9 * 60, close: 18 * 60 },
    4: { open: 9 * 60, close: 20 * 60 },
    5: { open: 9 * 60, close: 18 * 60 },
    6: { open: 10 * 60, close: 15 * 60 },
  } as Record<number, { open: number; close: number } | null>,
  slotStepMinutes: 30,
  /** How far ahead a customer may book */
  maxDaysAhead: 60,
} as const;

export type Service = {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
  minutes: number;
};

export const SERVICES: readonly Service[] = [
  { id: "cut", name: "Haircut", description: "Wash, cut and blow-dry.", priceUsd: 45, minutes: 60 },
  { id: "color", name: "Colour", description: "Full colour with toner and finish.", priceUsd: 120, minutes: 120 },
  { id: "style", name: "Styling", description: "Event or everyday styling.", priceUsd: 60, minutes: 60 },
  { id: "trim", name: "Quick trim", description: "Tidy ends, no wash.", priceUsd: 25, minutes: 30 },
];

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
