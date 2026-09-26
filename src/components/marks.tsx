export function Arrow({
  direction = "down",
}: {
  direction?: "down" | "up-right" | "right";
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
export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`spark ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m50 2 5 35L81 13 63 43l35 7-35 7 18 30-26-24-5 35-5-35-26 24 18-30-35-7 35-7-18-30 26 24z"
        fill="currentColor"
      />
    </svg>
  );
}
export function Scribble({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`scribble ${className}`}
      viewBox="0 0 420 60"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 27C105 6 294 4 412 18M25 42c88-14 220-20 340-12"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function AugustineArt() {
  return (
    <svg
      className="augustine-art"
      viewBox="0 0 440 500"
      role="img"
      aria-label="Ilustración editorial de un joven Agustín, con un libro entre sus manos"
    >
      <circle cx="223" cy="234" r="181" fill="#E4BC4C" />
      <path
        d="M90 492c3-104 35-175 105-187l69-2c66 31 84 98 93 189"
        fill="#254D62"
      />
      <path d="m196 249-5 77 47 34 35-40-22-72" fill="#BD7658" />
      <path
        d="M155 154c2-71 132-87 146 5l-4 91c-14 45-43 66-66 67-30-4-59-34-66-66z"
        fill="#DBA27A"
      />
      <path
        d="M156 222c-25-11-24-33-16-57-13-34 6-62 35-66 22-38 72-36 100-15 36 1 52 27 48 55 12 25 1 51-24 70l-7-57c-30 9-50-3-67-18-19 25-49 37-63 32z"
        fill="#143748"
      />
      <path
        d="m183 213 19-4m42-2 19 5m-35 0-5 31 13 3m-34 18c14 10 29 11 42 0"
        stroke="#654336"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M175 322c-20 32-44 71-43 127m131-129c38 42 57 89 65 132"
        stroke="#729AA0"
        strokeWidth="4"
        fill="none"
      />
      <path d="m123 370 100 14 93-29-3 108-91 29-92-22z" fill="#F1E9D3" />
      <path
        d="m223 384-1 108m-83-106 66 12m-67 8 66 12m43-15 50-17m-50 38 50-17"
        stroke="#B6A888"
        strokeWidth="3"
      />
      <path
        d="M128 437c-28-9-21-35-1-29l41 17c11 6 7 18-3 18zm185-12c25-8 23-35 3-28l-41 18c-12 6-6 18 3 18z"
        fill="#DBA27A"
      />
      <path
        d="M40 189c-12-37-12-69-3-96m-1 47L12 115m24 0 23-25M366 92l17-27m-1 57 32-9"
        stroke="#BD7658"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
