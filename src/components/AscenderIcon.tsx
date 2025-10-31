interface AscenderIconProps {
  className?: string;
  size?: number;
}

export function AscenderIcon({ className = '', size = 24 }: AscenderIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
        fill="currentColor"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
