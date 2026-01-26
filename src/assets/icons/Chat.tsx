import { SVGProps } from "react";

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} fill="none" viewBox="0 0 9 9" {...props}>
    <path fill="#fff" d="M1 1h7v5H5L2 8V6H1V1Zm1 1v3h1v1.17L4.17 5H8V2H2Z" />
  </svg>
);

export default SvgComponent;
