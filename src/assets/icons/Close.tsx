import { SVGProps } from "react";

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} fill="none" viewBox="0 0 9 9" {...props}>
    <path
      fill="currentColor"
      d="M2 1h1v1h1v1h1v1h1V3h1V2h1V1h1v1H8v1H7v1H6v1h1v1h1v1h1v1H8v-1H7v-1H6V5H5V4H4v1H3v1H2v1H1v-1h1V6h1V5h1V4H3V3H2V2H1V1h1Z"
    />
  </svg>
);

export default SvgComponent;
