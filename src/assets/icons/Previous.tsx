import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={18} fill="none" viewBox="0 0 9 9" {...props}>
    <path
      fill="#fff"
      d="M4 1h1v2h1V2h1V1h1v7H7V7H6V6H5v2H4V7H3V6H2V5H1V4h1V3h1V2h1V1Z"
    />
    <script />
  </svg>
);
export default SvgComponent;
