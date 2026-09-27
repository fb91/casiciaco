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
