import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SHORTCUTS } from "../../shortcuts";
import { playSound } from "../../utils";
import InfoPanel from "./index";

// jsdom doesn't implement HTMLMediaElement.play; stub the click sound out.
vi.mock("../../utils", () => ({ playSound: vi.fn() }));

// Capture feedback inserts without hitting Supabase.
const insertMock = vi.fn(
  async (): Promise<{ error: { message: string } | null }> => ({ error: null }),
);
vi.mock("../../services/supabase", () => ({
  supabase: { from: () => ({ insert: insertMock }) },
}));

const openPanel = async () => {
  const user = userEvent.setup();
  render(<InfoPanel />);
  await user.click(screen.getByRole("button", { name: /info/i }));
  return user;
};

beforeEach(() => {
  insertMock.mockClear();
  insertMock.mockResolvedValue({ error: null });
});

describe("InfoPanel", () => {
  it("does not show panel content until opened", () => {
    render(<InfoPanel />);
    expect(screen.queryByText("Feedback")).not.toBeInTheDocument();
    expect(screen.queryByText("Shortcuts")).not.toBeInTheDocument();
  });

  it("opens the panel with Feedback and Shortcuts sections when clicked", async () => {
    await openPanel();
    expect(await screen.findByText("Feedback")).toBeInTheDocument();
    expect(screen.getByText("Shortcuts")).toBeInTheDocument();
  });

  it("no longer shows the About section", async () => {
    await openPanel();
    await screen.findByText("Feedback");
    expect(screen.queryByText("About")).not.toBeInTheDocument();
  });

  it("plays a click sound when the info button is pressed", async () => {
    const user = userEvent.setup();
    render(<InfoPanel />);
    await user.click(screen.getByRole("button", { name: /info/i }));
    expect(playSound).toHaveBeenCalled();
  });

  it("disables Send until feedback is entered", async () => {
    await openPanel();
    expect(await screen.findByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("submits feedback to Supabase and confirms", async () => {
    const user = await openPanel();
    await user.type(
      await screen.findByRole("textbox", { name: /feedback/i }),
      "love it",
    );
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(insertMock).toHaveBeenCalledWith([{ content: "love it" }]);
    expect(await screen.findByText(/thanks/i)).toBeInTheDocument();
  });

  it("surfaces an error when the insert fails", async () => {
    insertMock.mockResolvedValue({ error: { message: "nope" } });
    const user = await openPanel();
    await user.type(
      await screen.findByRole("textbox", { name: /feedback/i }),
      "broken",
    );
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByText(/couldn't send/i)).toBeInTheDocument();
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
