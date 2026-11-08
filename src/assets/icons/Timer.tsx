import type { SVGProps } from "react";

// Pixel stopwatch on the same 9×9 grid as the other icons.
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} fill="none" viewBox="0 0 9 9" {...props}>
    <path
      fill="#fff"
      d="M3 0h3v1h-3Z M2 1h5v1h-5Z M1 2h1v5h-1Z M7 2h1v5h-1Z M2 7h5v1h-5Z M4 3h1v2h-1Z M5 4h1v1h-1Z"
    />
  </svg>
);
export default SvgComponent;
