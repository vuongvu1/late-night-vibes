import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} fill="none" viewBox="0 0 9 9" {...props}>
    <path
      fill="#fff"
      d="M2 0h1v2h3v1h-4v1h-1v-1h-1v-1h1v-1h1Z M6 3h1v1h-1Z M7 4h1v2h-1Z M1 6h1v1h-1Z M6 6h1v1h-1Z M2 7h4v1h-4Z"
    />
  </svg>
);
export default SvgComponent;
