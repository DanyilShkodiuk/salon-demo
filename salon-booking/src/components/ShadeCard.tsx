const SHADES = [
  ["Ash", "#b9b3b0"],
  ["Sand", "#d8bf94"],
  ["Honey", "#c9953c"],
  ["Copper", "#a8552f"],
  ["Chestnut", "#6b3a26"],
  ["Mocha", "#432a21"],
  ["Plum", "#4b2347"],
  ["Ink", "#1e1822"],
] as const;

export default function ShadeCard() {
  return (
    <div className="flex h-full flex-col">
      <h3 className="heading text-3xl sm:text-4xl">Colour, mixed for you</h3>
      <p className="mt-3 max-w-[44ch] text-pretty text-muted">
        Every colour appointment starts with a shade consultation. These are some of the tones we
        mix most.
      </p>
      <ul className="mt-auto grid grid-cols-4 gap-3 pt-10 sm:grid-cols-8">
        {SHADES.map(([name, hex]) => (
          <li key={name}>
            <span
              className="block aspect-[3/5] rounded-full border border-black/10"
              style={{ background: hex }}
              role="img"
              aria-label={`${name} shade`}
            />
            <span className="mt-2 block text-center text-sm">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
