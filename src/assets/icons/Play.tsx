import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={20} fill="none" viewBox="0 0 9 9" {...props}>
    <path fill="#fff" d="M4 1H3v7h1V7h1V6h1V5h1V4H6V3H5V2H4V1Z" />
  </svg>
);
export default SvgComponent;
