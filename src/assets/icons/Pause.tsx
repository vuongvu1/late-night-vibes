import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width="18px" fill="none" viewBox="0 0 9 9" {...props}>
    <path fill="#fff" d="M2 1h2v7H2zM5 1h2v7H5z" />
  </svg>
);
export default SvgComponent;
