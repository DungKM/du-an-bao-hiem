export default function Logo({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="44" height="44" rx="12" fill="currentColor" fillOpacity="0.16" />
      <path
        d="M13 14h22a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-7v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V21h-7a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z"
        fill="currentColor"
      />
      <path
        d="M29 30c3.5-1 6-3.6 6-7"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M33 33c4.2-1.6 7-5.6 7-10.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
    </svg>
  );
}
