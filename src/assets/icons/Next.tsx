import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} fill="none" viewBox="0 0 9 9" {...props}>
    <path
      fill="#fff"
      d="M2 1h1v1h1v1h1V1h1v1h1v1h1v1h1v1H8v1H7v1H6v1H5V6H4v1H3v1H2V1Z"
    />
  </svg>
);
export default SvgComponent;
