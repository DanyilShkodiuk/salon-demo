/**
 * Brand story and page copy for the sample salon. Everything here is invented demo content:
 * swap it for a real salon's story, team, reviews and address.
 */

export const STORY = {
  title: "A quiet room on Moon Street",
  paragraphs: [
    "Luna began in 2019 as a single chair in a ground-floor flat on Księżycowa Street, which translates as Moon Street. Our founder, Marta Lis, had spent ten years in busy salons where clients waited, were rushed, and left without really being heard.",
    "She wanted the opposite: one client at a time, a proper conversation before the scissors, and prices you know before you sit down. The name came from the street, and from the late Thursday evenings we still keep for people who work during the day.",
  ],
  quote: "Good hair starts with listening. The cutting is the easy part.",
  quoteBy: "Marta Lis, founder",
} as const;

export const VALUES = [
  ["One client at a time", "No double booking and no waiting room. The chair is yours for the whole appointment."],
  ["Consultation first", "Every visit starts with five minutes of talking about your hair, your routine and your plans."],
  ["Honest prices", "The price you see when you book is the price you pay. No surprise extras at the till."],
] as const;

export const TIMELINE = [
  ["2019", "One chair on Moon Street", "Marta opens Luna in a small flat with a single chair and a borrowed mirror."],
  ["2021", "The colour studio", "A second room with a mixing bar, daylight lamps and a shade library of 40 tones."],
  ["2023", "A team of three", "Olena and Zofia join, bringing curly-hair cutting and event styling."],
  ["2026", "Booking online", "Clients pick a free time themselves, day or night, and we confirm personally."],
] as const;

/** Headline numbers, counted up when they scroll into view. */
export const STATS = [
  { value: 7, suffix: "", label: "years on Moon Street" },
  { value: 2400, suffix: "+", label: "regular clients" },
  { value: 4.9, suffix: "", label: "average rating", decimals: 1 },
  { value: 87, suffix: "%", label: "come back within 3 months" },
] as const;

export const TEAM = [
  {
    name: "Marta Lis",
    role: "Founder · Colour",
    bio: "Fifteen years of colour work. Known for soft, lived-in blondes and honest advice on what will suit you.",
    initials: "ML",
    tone: "from-gold/70 to-sand-deep",
  },
  {
    name: "Olena Kravets",
    role: "Cuts · Curly hair",
    bio: "Cuts curls dry, one curl at a time. Trained in Kyiv and Lisbon, and patient with every hair type.",
    initials: "OK",
    tone: "from-sage/70 to-sage-soft",
  },
  {
    name: "Zofia Wójcik",
    role: "Styling · Events",
    bio: "Weddings, proms and big days. Plans every look in a trial session so the day itself is calm.",
    initials: "ZW",
    tone: "from-[#c9a2a0]/70 to-sand",
  },
] as const;

export const REVIEWS = [
  {
    text: "The first salon where someone asked how I actually style my hair in the morning. The cut still looks good six weeks later.",
    name: "Ania",
    detail: "Haircut with Olena",
  },
  {
    text: "Booked at midnight from my phone, got a confirmation the next morning. Marta talked me out of platinum and into something much better.",
    name: "Kasia",
    detail: "Colour with Marta",
  },
  {
    text: "Zofia did my wedding hair and it survived dancing until 3 a.m. Calm, kind and on time. I could not have asked for more.",
    name: "Natalia",
    detail: "Bridal styling with Zofia",
  },
] as const;

export const FAQ = [
  ["How do I pay?", "You pay at the salon after your appointment, by card or cash. Nothing is charged when you book online."],
  ["Can I cancel or move my appointment?", "Yes. Reply to your confirmation or call us at least 24 hours before, and we will free the time or move it."],
  ["Is the colour consultation extra?", "No. It is part of every colour appointment. If you are unsure, book a colour visit and we will plan it together first."],
  ["Do you cut children's hair?", "Yes, from age six. Book a Quick trim or a Haircut and mention the age in the notes."],
  ["Is there parking nearby?", "There is street parking on Księżycowa Street and a paid car park two minutes away on the corner."],
] as const;

export const CONTACT = {
  street: "Księżycowa 12",
  city: "00-001 Warsaw",
  phone: "+48 22 000 00 00",
  email: "hello@luna-studio.example",
  instagram: "@luna.hairstudio",
} as const;
