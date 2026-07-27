function Base({ children, size = 20, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ShieldIcon(props) {
  return (
    <Base {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </Base>
  );
}

export function ChevronDownIcon(props) {
  return (
    <Base {...props}>
      <path d="m6 9 6 6 6-6" />
    </Base>
  );
}

export function ChevronUpIcon(props) {
  return (
    <Base {...props}>
      <path d="m18 15-6-6-6 6" />
    </Base>
  );
}

export function PlusIcon(props) {
  return (
    <Base {...props}>
      <path d="M5 12h14M12 5v14" />
    </Base>
  );
}

export function ArrowUpIcon(props) {
  return (
    <Base {...props}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </Base>
  );
}

export function ArrowDownIcon(props) {
  return (
    <Base {...props}>
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </Base>
  );
}
