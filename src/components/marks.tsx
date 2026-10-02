export function Arrow({
  direction = "down",
}: {
  direction?: "down" | "up" | "up-right" | "right";
}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`arrow arrow-${direction}`}
    >
      <path
        d="M12 4v16m-6-6 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
/** Eight-spoke asterisk, drawn so phones do not turn it into a green emoji. */
export function Spark({ className = "spark" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M18.7 5.3 5.3 18.7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
