type IconName =
  | "download"
  | "shield"
  | "rocket_launch"
  | "arrow_forward"
  | "menu"
  | "close"
  | "check"
  | "content_copy"
  | "error"
  | "link"
  | "dns"
  | "open_in_new"
  | "check_circle";

const PATHS: Record<IconName, React.ReactNode> = {
  download: (
    <>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),
  shield: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />,
  rocket_launch: (
    <>
      <path d="M12 2c2.5 2 4 5.5 4 9 0 2-.5 3.5-1.5 5L12 20l-2.5-4c-1-1.5-1.5-3-1.5-5 0-3.5 1.5-7 4-9z" />
      <circle cx="12" cy="9" r="1.5" />
      <path d="M8.5 15.5L6 18M15.5 15.5L18 18" />
    </>
  ),
  arrow_forward: (
    <>
      <path d="M4 12h16" />
      <path d="M13 5l7 7-7 7" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  check: <path d="M5 12l5 5L19 8" />,
  content_copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="1.5" />
      <path d="M6 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1" />
    </>
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" />
    </>
  ),
  link: (
    <>
      <path d="M9 15l6-6" />
      <path d="M11 6l1-1a4 4 0 015.5 5.5l-1 1" />
      <path d="M13 18l-1 1A4 4 0 016.5 13.5l1-1" />
    </>
  ),
  dns: (
    <>
      <rect x="3" y="5" width="18" height="6" rx="1.5" />
      <rect x="3" y="13" width="18" height="6" rx="1.5" />
      <circle cx="7" cy="8" r="0.75" fill="currentColor" />
      <circle cx="7" cy="16" r="0.75" fill="currentColor" />
    </>
  ),
  open_in_new: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M18 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4" />
    </>
  ),
  check_circle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9" />
    </>
  ),
};

export function Icon({
  name,
  className = "w-5 h-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
