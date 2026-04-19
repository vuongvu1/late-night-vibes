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
  const renderChatPanel = async () => {
    const view = render(<ChatPanel />);

    await waitFor(() => {
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    return view;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should render the chat container", async () => {
    const { container } = await renderChatPanel();
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should render username input", async () => {
    await renderChatPanel();
    const usernameInput = screen.getByLabelText("Chat username");
    expect(usernameInput).toBeInTheDocument();
  });

  it("should render message input", async () => {
    await renderChatPanel();
    const messageInput = screen.getByPlaceholderText(
      "Say something nice...",
    );
    expect(messageInput).toBeInTheDocument();
  });

  it("should render send button", async () => {
    await renderChatPanel();
    const sendButton = screen.getByText("Send");
    expect(sendButton).toBeInTheDocument();
  });

  it("should render close button", async () => {
    await renderChatPanel();
    const closeIcon = screen.getByText("Close");
    expect(closeIcon).toBeInTheDocument();
  });

  it("should disable send button when input is empty", async () => {
    await renderChatPanel();
    const sendButton = screen.getByText("Send");
    expect(sendButton).toBeDisabled();
  });

  it("should enable send button when input has text", async () => {
    const user = userEvent.setup();
    await renderChatPanel();

    const messageInput = screen.getByPlaceholderText("Say something nice...");
    await user.type(messageInput, "Hello!");

    const sendButton = screen.getByText("Send");
    expect(sendButton).not.toBeDisabled();
  });

  it("should save username to localStorage", async () => {
    const user = userEvent.setup();
    await renderChatPanel();

    const usernameInput = screen.getByLabelText("Chat username");
    await user.type(usernameInput, "TestUser");

    expect(localStorage.getItem("chat_username")).toBe("TestUser");
  });

  it("should limit username to 20 characters", async () => {
    const user = userEvent.setup();
    await renderChatPanel();

    const usernameInput = screen.getByLabelText(
      "Chat username",
    ) as HTMLInputElement;
    await user.type(usernameInput, "a".repeat(30));

    expect(usernameInput.value.length).toBeLessThanOrEqual(20);
  });

  it("should subscribe to live chat channel on mount", async () => {
    await renderChatPanel();

    // Wait for all effects including channel subscription to complete
    await waitFor(async () => {
      const { supabase } = await import("../../services/supabase");
      expect(supabase.channel).toHaveBeenCalledWith("live-chat");
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });
  });

  it("should load saved username from localStorage", async () => {
    localStorage.setItem("chat_username", "SavedUser");
    await renderChatPanel();

    const usernameInput = screen.getByDisplayValue("SavedUser");
    expect(usernameInput).toBeInTheDocument();
  });

  it("should handle form submission", async () => {
    const user = userEvent.setup();
    await renderChatPanel();

    const messageInput = screen.getByPlaceholderText("Say something nice...");
    await user.type(messageInput, "Test message");

    const sendButton = screen.getByText("Send");
    await user.click(sendButton);

    // Input should be cleared after sending
    expect(messageInput).toHaveValue("");
  });
});
