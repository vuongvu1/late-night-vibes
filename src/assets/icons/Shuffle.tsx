import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} fill="none" viewBox="0 0 9 9" {...props}>
    <path fill="#fff" d="M7 1H6v2H4v2H2v1H1v1h2V6h2V4h2V3h1V2H7V1Z" />
    <path fill="#fff" d="M3 2H1v1h1v1h1V2ZM8 6H7V5H6v3h1V7h1V6Z" />
  </svg>
);
export default SvgComponent;
