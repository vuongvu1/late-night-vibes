import type { SVGProps } from "react";

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  // biome-ignore lint/a11y/noSvgWithoutTitle: decorative icon; accessible label provided by parent Button tooltip
  <svg width={24} fill="none" viewBox="0 0 9 9" {...props}>
    <path fill="#fff" d="M4 1H3v7h1V7h1V6h1V5h1V4H6V3H5V2H4V1Z" />
  </svg>
);
export default SvgComponent;
