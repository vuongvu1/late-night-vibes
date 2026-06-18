// Canonical, ordered list of keyboard shortcuts — the single source of truth for
// both the keybindings (App.tsx wires a handler per `code`, typed against
// `ShortcutCode`) and the Shortcuts section of the info panel (which renders this
// list). Keep one entry per `KeyboardEvent.code`; adding one here without a
// matching handler in App.tsx fails the type check.
export const SHORTCUTS = [
  { code: "Space", keyLabel: "Space", description: "Play / Pause" },
  { code: "KeyR", keyLabel: "R", description: "Random channel" },
  { code: "ArrowRight", keyLabel: "→", description: "Next channel" },
  { code: "ArrowLeft", keyLabel: "←", description: "Previous channel" },
  { code: "ArrowUp", keyLabel: "↑", description: "Volume up" },
  { code: "ArrowDown", keyLabel: "↓", description: "Volume down" },
  { code: "KeyF", keyLabel: "F", description: "Toggle fullscreen" },
  { code: "KeyC", keyLabel: "C", description: "Toggle chat" },
  { code: "KeyM", keyLabel: "M", description: "Toggle sound mixer" },
] as const;

export type ShortcutCode = (typeof SHORTCUTS)[number]["code"];
