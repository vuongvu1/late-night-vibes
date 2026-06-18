import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SHORTCUTS } from "../../shortcuts";
import { playSound } from "../../utils";
import InfoPanel from "./index";

// jsdom doesn't implement HTMLMediaElement.play; stub the click sound out.
vi.mock("../../utils", () => ({ playSound: vi.fn() }));

const openPanel = async () => {
  const user = userEvent.setup();
  render(<InfoPanel />);
  await user.click(screen.getByRole("button", { name: /info/i }));
};

describe("InfoPanel", () => {
  it("does not show panel content until opened", () => {
    render(<InfoPanel />);
    expect(screen.queryByText("About")).not.toBeInTheDocument();
    expect(screen.queryByText("Shortcuts")).not.toBeInTheDocument();
  });

  it("opens the panel with About and Shortcuts sections when clicked", async () => {
    await openPanel();
    expect(await screen.findByText("About")).toBeInTheDocument();
    expect(screen.getByText("Shortcuts")).toBeInTheDocument();
  });

  it("describes the app in the About section", async () => {
    await openPanel();
    expect(await screen.findByText(/Late Night Vibes/i)).toBeInTheDocument();
  });

  it("plays a click sound when the info button is pressed", async () => {
    const user = userEvent.setup();
    render(<InfoPanel />);
    await user.click(screen.getByRole("button", { name: /info/i }));
    expect(playSound).toHaveBeenCalled();
  });

  it("lists every keyboard shortcut with its key label and description", async () => {
    await openPanel();
    await screen.findByText("Shortcuts");

    for (const shortcut of SHORTCUTS) {
      expect(screen.getByText(shortcut.keyLabel)).toBeInTheDocument();
      expect(screen.getByText(shortcut.description)).toBeInTheDocument();
    }
  });
});
