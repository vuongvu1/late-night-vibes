import type { SVGProps } from "react";

// Pixel gear on the same 9×9 grid as the other icons.
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} fill="none" viewBox="0 0 9 9" {...props}>
    <path
      fill="#fff"
      d="M4 0h1v2h-1Z M4 7h1v2h-1Z M0 4h2v1h-2Z M7 4h2v1h-2Z M3 2h3v1h-3Z M2 3h1v3h-1Z M6 3h1v3h-1Z M3 6h3v1h-3Z"
    />
  </svg>
);
export default SvgComponent;
