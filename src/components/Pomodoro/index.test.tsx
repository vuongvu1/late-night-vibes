import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Pomodoro from "./index";

vi.mock("../../store", () => ({ SOUNDS: {} }));
vi.mock("../../utils", () => ({ playSound: vi.fn() }));
vi.mock("./chime", () => ({ playChime: vi.fn() }));

const clock = () => screen.getByRole("timer").textContent;
const tab = (name: string) => screen.getByRole("button", { name });

describe("Pomodoro", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => vi.useRealTimers());

  it("opens paused on focus at full length", () => {
    render(<Pomodoro />);
    expect(clock()).toBe("25:00");
    expect(tab("Focus")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Start timer" })).toBeTruthy();
  });

  it("a tab switches phase, resets to full length and pauses", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Pomodoro />);
    await user.click(screen.getByRole("button", { name: "Start timer" }));
    act(() => vi.advanceTimersByTime(3000));
    expect(clock()).not.toBe("25:00");

    await user.click(tab("Short break"));
    expect(clock()).toBe("05:00");
    expect(tab("Short break")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Start timer" })).toBeTruthy();
  });

  it("phase end loads the next phase paused when auto-start is off", async () => {
    localStorage.setItem("pomodoro-settings", JSON.stringify({ focus: 1 }));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Pomodoro />);
    await user.click(screen.getByRole("button", { name: "Start timer" }));
    act(() => vi.advanceTimersByTime(61_000));

    expect(tab("Short break")).toHaveAttribute("aria-pressed", "true");
    expect(clock()).toBe("05:00");
    expect(screen.getByRole("button", { name: "Start timer" })).toBeTruthy();
  });

  it("next skips to the following phase", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Pomodoro />);
    await user.click(screen.getByRole("button", { name: "Next phase" }));
    expect(tab("Short break")).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Next phase" }));
    expect(tab("Focus")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Round 2/4")).toBeTruthy();
  });

  it("save applies settings and resets the clock, paused", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Pomodoro />);
    await user.click(screen.getByRole("button", { name: "Start timer" }));
    act(() => vi.advanceTimersByTime(3000));

    fireEvent.change(screen.getByLabelText("Focus (min)"), {
      target: { value: "50" },
    });
    fireEvent.submit(screen.getByLabelText("Focus (min)").closest("form")!);

    expect(clock()).toBe("50:00");
    expect(screen.getByRole("button", { name: "Start timer" })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("pomodoro-settings")!).focus).toBe(
      50,
    );
  });

  it("reset to defaults fills the fields, save applies them", async () => {
    localStorage.setItem("pomodoro-settings", JSON.stringify({ focus: 40 }));
    render(<Pomodoro />);
    expect(clock()).toBe("40:00");

    fireEvent.click(
      screen.getByRole("button", { name: "Reset to defaults", hidden: true }),
    );
    expect(screen.getByLabelText<HTMLInputElement>("Focus (min)").value).toBe(
      "25",
    );
    fireEvent.submit(screen.getByLabelText("Focus (min)").closest("form")!);
    expect(clock()).toBe("25:00");
  });
});
