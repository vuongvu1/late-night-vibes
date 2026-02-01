import { SVGProps } from "react";

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    version="1.0"
    xmlns="http://www.w3.org/2000/svg"
    width="128.000000pt"
    height="128.000000pt"
    viewBox="0 0 128.000000 128.000000"
    preserveAspectRatio="xMidYMid meet"
    {...props}
  >
    <g
      transform="translate(0.000000,128.000000) scale(0.050000,-0.050000)"
      fill="#fff"
      stroke="none"
    >
      <path d="M460 2100 l0 -80 -80 0 -80 0 0 -820 0 -820 80 0 80 0 0 85 0 85 93 -7 c89 -7 92 -6 80 40 -7 26 -13 63 -13 82 0 27 -17 35 -80 35 l-80 0 0 660 0 660 820 0 820 0 0 -490 0 -490 -661 0 -660 0 5 -72 c6 -94 -49 -86 681 -93 l635 -5 0 85 0 85 80 0 80 0 0 490 0 490 -80 0 -80 0 0 80 0 80 -820 0 -820 0 0 -80z" />
      <path d="M955 1685 c-39 -77 1 -155 82 -161 l83 -6 0 91 0 91 -79 0 c-43 0 -82 -7 -86 -15z" />
      <path d="M1280 1610 l0 -90 80 0 80 0 0 90 0 90 -80 0 -80 0 0 -90z" />
      <path d="M1600 1611 l0 -91 91 0 91 0 -6 85 c-6 85 -6 85 -91 91 l-85 6 0 -91z" />
      <path d="M624 796 l6 -86 86 -6 86 -6 -6 86 -6 86 -86 6 -86 6 6 -86z" />
    </g>
  </svg>
);

export default SvgComponent;
