import type React from "react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ChevronDownIcon, CloseIcon } from "../../assets/icons";
import { supabase } from "../../services/supabase";
import { useStore } from "../../store";
import type { Message } from "../../types";
import { formatTimestamp } from "../../utils";
import DraggablePanel from "../DraggablePanel";
import { shouldBackfill } from "./backfill";
import styles from "./styles.module.css";

const USERNAME_KEY = "chat_username";

const PAGE_SIZE = 5;

// Treat "within 100px of the bottom" as at-bottom for auto-scroll decisions.
const SCROLL_BOTTOM_THRESHOLD = 100;
const isNearBottom = (el: HTMLElement) =>
  el.scrollHeight - el.scrollTop <= el.clientHeight + SCROLL_BOTTOM_THRESHOLD;

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  // Surfaces Supabase reachability so failures aren't silent.
  const [isConnected, setIsConnected] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Shown when the user has scrolled up away from the latest message.
  const [showScrollButton, setShowScrollButton] = useState(false);
  // Bumped whenever the messages list is resized, to re-check backfill.
  const [resizeTick, setResizeTick] = useState(0);
  const [username, setUsername] = useState(() => {
    return localStorage.getItem(USERNAME_KEY) || "";
  });
  const [defaultUsername] = useState(() => {
    return `User${Math.floor(Math.random() * 9000) + 1000}`;
  });
  const usernameInputId = useId();
  const messageInputId = useId();

  const scrollRef = useRef<HTMLDivElement>(null);
  // Whether to keep the list pinned to the bottom as new content renders.
  // Starts true so the panel opens at the latest message; flipped by the
  // user scrolling away from / back to the bottom.
  const stickToBottom = useRef(true);

  const { toggleChat, activeIndex } = useStore();

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (error) {
        console.error("Error fetching messages:", error);
        setIsConnected(false);
      } else if (data) {
        setIsConnected(true);
        setMessages(data.reverse());
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("Network error fetching messages:", err);
      setIsConnected(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || messages.length === 0) return;

    const scrollContainer = scrollRef.current;
    const previousScrollHeight = scrollContainer?.scrollHeight || 0;
    const wasSticky = stickToBottom.current;

    setIsLoadingMore(true);
    const oldestTimestamp = messages[0].created_at;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .lt("created_at", oldestTimestamp)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (error) {
      console.error("Error loading more messages:", error);
    } else if (data) {
      if (data.length < PAGE_SIZE) setHasMore(false);
      const newBatch = data.reverse();
      setMessages((prev) => [...newBatch, ...prev]);

      // Sticky (backfill while following) → the layout effect re-pins to the
      // bottom after the new messages render. Otherwise (user scrolled to the
      // top to read history) → restore their reading position.
      if (!wasSticky) {
        setTimeout(() => {
          if (scrollContainer) {
            scrollContainer.scrollTop =
              scrollContainer.scrollHeight - previousScrollHeight;
          }
        }, 0);
      }
    }
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore, messages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount; fetchMessages identity changes would cause infinite re-subscription
  useEffect(() => {
    queueMicrotask(() => void fetchMessages());

    const channel = supabase
      .channel("live-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe((status) => {
        // Surface realtime connectivity; Supabase auto-reconnects and fires
        // SUBSCRIBED again, which clears the notice.
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Keep the list pinned to the bottom while the user is following along
  // (initial load, backfill, incoming messages). useLayoutEffect runs after
  // layout, so scrollHeight already reflects the just-rendered messages — no
  // setTimeout race against the browser laying out the new rows.
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages dep is intentional — effect must re-run when messages update to auto-scroll
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || isLoadingMore) return;

    if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
      setShowScrollButton(false);
    }
  }, [messages, isLoadingMore]);

  // The scroll-to-top trigger below only fires when the list overflows. Watch
  // the list's size so expanding the panel (which can remove the scrollbar)
  // re-checks whether older messages still need backfilling.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setResizeTick((t) => t + 1));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Backfill older messages whenever the list can't scroll but more exist —
  // re-runs on new messages (loadMore identity changes), load-state changes,
  // and panel resizes (resizeTick), loading page by page until the list
  // overflows or the history is exhausted.
  // biome-ignore lint/correctness/useExhaustiveDependencies: resizeTick dep is intentional — must re-run when panel resizes to backfill messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el && shouldBackfill(el, hasMore, isLoadingMore)) {
      loadMore();
    }
  }, [loadMore, hasMore, isLoadingMore, resizeTick]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop === 0) {
      loadMore();
    }
    const atBottom = isNearBottom(el);
    stickToBottom.current = atBottom;
    setShowScrollButton(!atBottom);
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) {
      stickToBottom.current = true;
      el.scrollTop = el.scrollHeight;
      setShowScrollButton(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const content = inputValue.trim();
    const baseUsername = username.trim() || defaultUsername;
    // Tag each message with the channel the sender is on, e.g. "User123 (Radio #2)"
    const finalUsername = `${baseUsername} (Radio #${activeIndex + 1})`;
    setInputValue("");

    try {
      const { error } = await supabase.from("messages").insert([
        {
          username: finalUsername,
          content,
        },
      ]);

      if (error) {
        console.error("Error sending message:", error);
        setIsConnected(false);
      } else {
        setIsConnected(true);
      }
    } catch (err) {
      console.error("Network error sending message:", err);
      setIsConnected(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 20);
    setUsername(value);
    localStorage.setItem(USERNAME_KEY, value);
  };

  return (
    <DraggablePanel
      storageKey="chat-panel-position"
      sizeStorageKey="chat-panel-size"
      initialX={20}
      // Near the bottom, but never above the top title bar on short windows.
      initialY={Math.max(170, window.innerHeight - 520)}
      className={styles.chatContainer}
    >
      {(handleMouseDown) => (
        <>
          {/* Names the chat region for screen readers (h1 → h2 hierarchy) without
              taking visual space — the panel's purpose is obvious on screen. */}
          <h2 className="sr-only">Live chat</h2>
          <div className={styles.header} onMouseDown={handleMouseDown}>
            <div className={styles.usernameInputWrapper}>
              <label className={styles.usernameLabel} htmlFor={usernameInputId}>
                Name:
              </label>
              <input
                id={usernameInputId}
                className={styles.usernameInput}
                value={username}
                onChange={handleUsernameChange}
                placeholder={defaultUsername}
                maxLength={20}
                aria-label="Chat username"
              />
            </div>
            <button
              className={styles.closeButton}
              type="button"
              onClick={toggleChat}
              aria-label="Close chat panel"
            >
              <CloseIcon />
            </button>
          </div>
          {!isConnected && (
            <div className={styles.connectionNotice} role="status">
              Reconnecting… messages may not send.
            </div>
          )}
          <div
            className={styles.messagesList}
            ref={scrollRef}
            onScroll={handleScroll}
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-label="Chat messages"
          >
            {isLoadingMore && (
              <div
                className={styles.loadingMore}
                role="status"
                aria-live="polite"
              >
                Loading older messages...
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={styles.messageItem}>
                <div className={styles.messageMeta}>
                  <span className={styles.username}>{msg.username}</span>
                  <span className={styles.timestamp}>
                    {formatTimestamp(msg.created_at)}
                  </span>
                </div>
                <div className={styles.content}>{msg.content}</div>
              </div>
            ))}
          </div>
          {showScrollButton && (
            <button
              className={styles.scrollToBottom}
              type="button"
              onClick={scrollToBottom}
              aria-label="Scroll to latest messages"
            >
              <ChevronDownIcon />
            </button>
          )}
          <form
            className={styles.inputArea}
            onSubmit={handleSendMessage}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <input
              id={messageInputId}
              className={styles.input}
              placeholder="Say something nice..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              maxLength={500}
              aria-label="Message"
            />
            <button
              className={styles.sendButton}
              type="submit"
              disabled={!inputValue.trim()}
            >
              Send
            </button>
          </form>
        </>
      )}
    </DraggablePanel>
  );
};

export default ChatPanel;
