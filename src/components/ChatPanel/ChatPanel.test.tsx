import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatPanel from "./ChatPanel";

// Mock supabase
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(),
};

vi.mock("../../services/supabase", () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      lt: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

// Mock the store
vi.mock("../../store", () => ({
  useStore: vi.fn(() => ({
    toggleChat: vi.fn(),
  })),
}));

// Mock icons
vi.mock("../../assets/icons", () => ({
  CloseIcon: () => <div>Close</div>,
}));

describe("ChatPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should render the chat container", async () => {
    const { container } = render(<ChatPanel />);
    expect(container.firstChild).toBeInTheDocument();

    // Wait for effects to complete
    await screen.findByPlaceholderText(/Anonymous\d+/);
  });

  it("should render username input", async () => {
    render(<ChatPanel />);
    const usernameInput = await screen.findByPlaceholderText(/Anonymous\d+/);
    expect(usernameInput).toBeInTheDocument();
  });

  it("should render message input", async () => {
    render(<ChatPanel />);
    const messageInput = await screen.findByPlaceholderText(
      "Say something nice...",
    );
    expect(messageInput).toBeInTheDocument();
  });

  it("should render send button", async () => {
    render(<ChatPanel />);
    const sendButton = await screen.findByText("Send");
    expect(sendButton).toBeInTheDocument();
  });

  it("should render close button", async () => {
    render(<ChatPanel />);
    const closeIcon = await screen.findByText("Close");
    expect(closeIcon).toBeInTheDocument();
  });

  it("should disable send button when input is empty", async () => {
    render(<ChatPanel />);
    const sendButton = await screen.findByText("Send");
    expect(sendButton).toBeDisabled();
  });

  it("should enable send button when input has text", async () => {
    const user = userEvent.setup();
    render(<ChatPanel />);

    const messageInput = screen.getByPlaceholderText("Say something nice...");
    await user.type(messageInput, "Hello!");

    const sendButton = screen.getByText("Send");
    expect(sendButton).not.toBeDisabled();
  });

  it("should save username to localStorage", async () => {
    const user = userEvent.setup();
    render(<ChatPanel />);

    const usernameInput = screen.getByPlaceholderText(/Anonymous\d+/);
    await user.type(usernameInput, "TestUser");

    expect(localStorage.getItem("chat_username")).toBe("TestUser");
  });

  it("should limit username to 20 characters", async () => {
    const user = userEvent.setup();
    render(<ChatPanel />);

    const usernameInput = screen.getByPlaceholderText(
      /Anonymous\d+/,
    ) as HTMLInputElement;
    await user.type(usernameInput, "a".repeat(30));

    expect(usernameInput.value.length).toBeLessThanOrEqual(20);
  });

  it("should subscribe to live chat channel on mount", async () => {
    render(<ChatPanel />);

    // Wait for all effects including channel subscription to complete
    await waitFor(async () => {
      const { supabase } = await import("../../services/supabase");
      expect(supabase.channel).toHaveBeenCalledWith("live-chat");
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });
  });

  it("should load saved username from localStorage", async () => {
    localStorage.setItem("chat_username", "SavedUser");
    render(<ChatPanel />);

    const usernameInput = await screen.findByDisplayValue("SavedUser");
    expect(usernameInput).toBeInTheDocument();
  });

  it("should handle form submission", async () => {
    const user = userEvent.setup();
    render(<ChatPanel />);

    const messageInput = screen.getByPlaceholderText("Say something nice...");
    await user.type(messageInput, "Test message");

    const sendButton = screen.getByText("Send");
    await user.click(sendButton);

    // Input should be cleared after sending
    expect(messageInput).toHaveValue("");
  });
});
