export default function Crescent({ className = "" }: { className?: string }) {
  // A crescent: a full disc with a second, offset disc cut out of it.
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <defs>
        <mask id="crescent-cut">
          <rect width="200" height="200" fill="white" />
          <circle cx="128" cy="86" r="78" fill="black" />
        </mask>
      </defs>
      <circle cx="100" cy="100" r="92" fill="currentColor" mask="url(#crescent-cut)" />
    </svg>
  );
}
