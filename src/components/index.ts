// ChatPanel and OnlineCounter are intentionally NOT re-exported here: they are
// lazy-loaded directly in App.tsx so their @supabase/supabase-js dependency is
// code-split into an on-demand chunk. Re-exporting them from this eager barrel
// would pull them (and Supabase) back into the initial bundle.
export { default as Background } from "./Background";
export { default as Button } from "./Button";
export { default as ControlPanel } from "./ControlPanel";
export { Flex } from "./Flex";
export { NeonText } from "./NeonText";
export { default as SoundEffectsPanel } from "./SoundEffectsPanel";
export { Spinner } from "./Spinner";
export { Tooltip } from "./Tooltip";
export { default as VolumeSlider } from "./VolumeSlider";
export { default as YouTubePlayer } from "./YouTubePlayer";
