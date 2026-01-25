import { SVGProps } from "react";

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} fill="none" viewBox="0 0 9 9" {...props}>
    <path
      fill="#fff"
      d="M1 1h3v1H2v2H1V1Zm5 0h3v3H8V2H6V1ZM1 5h1v2h2v1H1V5Zm7 0v3H5v-1h2V5h1Z"
    />
  </svg>
);

export default SvgComponent;
