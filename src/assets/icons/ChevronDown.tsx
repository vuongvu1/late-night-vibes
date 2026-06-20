import type { SVGProps } from "react";

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} fill="none" viewBox="0 0 9 8" {...props}>
    <path
      fill="#fff"
      d="M1 2h1v1H1zM2 3h1v1H2zM3 4h1v1H3zM4 5h1v1H4zM5 4h1v1H5zM6 3h1v1H6zM7 2h1v1H7z"
    />
  </svg>
);
export default SvgComponent;
