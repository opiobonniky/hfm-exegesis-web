/** Stained glass decorative arch — shown only in cathedral mode */
export default function CathedralArch() {
  return (
    <svg
      className="hidden cathedral:block w-full h-8 cathedral:mb-2 text-primary/30"
      viewBox="0 0 200 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 24 Q20 4 50 2 Q100 0 100 0 Q100 0 150 2 Q180 4 200 24"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M20 24 Q35 8 60 6 Q100 4 100 4 Q100 4 140 6 Q165 8 180 24"
        stroke="currentColor"
        strokeWidth="0.3"
        fill="none"
        opacity="0.25"
      />
      <circle cx="100" cy="5" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
