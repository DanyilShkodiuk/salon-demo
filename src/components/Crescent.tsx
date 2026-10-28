export default function Crescent({ className = "" }: { className?: string }) {
  // A crescent: the outer edge of a full disc, closed by the edge of an offset disc cut out of it.
  // Drawn as one path so several crescents on a page don't share an SVG mask id.
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <path
        d="M114.58 9.16A92 92 0 1 0 181.42 142.84A78 78 0 1 1 114.58 9.16Z"
        fill="currentColor"
      />
    </svg>
  );
}
