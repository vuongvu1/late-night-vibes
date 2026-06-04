import type { SVGProps } from "react";

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} fill="none" viewBox="0 0 9 9" {...props}>
    <path
      fill="#fff"
      d="M1 1h1v1H1zM2 2h1v1H2zM3 3h1v1H3zM4 4h1v1H4zM5 5h1v1H5zM6 6h1v1H6zM7 7h1v1H7zM7 1h1v1H7zM6 2h1v1H6zM5 3h1v1H5zM3 5h1v1H3zM2 6h1v1H2zM1 7h1v1H1z"
    />
  </svg>
);
export default SvgComponent;
