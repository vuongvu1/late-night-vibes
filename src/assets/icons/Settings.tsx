import type { SVGProps } from "react";

// Smooth cog (⚙): 8 teeth + round hole. Unlike the other icons it's not on the
// 9×9 pixel grid — a cog that small doesn't read as a cog.
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M9.6 4.16 L9.9 1.2 L14.1 1.2 L14.4 4.16 L15.85 4.76 L18.15 2.88 L21.12 5.85 L19.24 8.15 L19.84 9.6 L22.8 9.9 L22.8 14.1 L19.84 14.4 L19.24 15.85 L21.12 18.15 L18.15 21.12 L15.85 19.24 L14.4 19.84 L14.1 22.8 L9.9 22.8 L9.6 19.84 L8.15 19.24 L5.85 21.12 L2.88 18.15 L4.76 15.85 L4.16 14.4 L1.2 14.1 L1.2 9.9 L4.16 9.6 L4.76 8.15 L2.88 5.85 L5.85 2.88 L8.15 4.76Z M15.6 12A3.6 3.6 0 1 0 8.4 12A3.6 3.6 0 1 0 15.6 12Z"
    />
  </svg>
);
export default SvgComponent;
