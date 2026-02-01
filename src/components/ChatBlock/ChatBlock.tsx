import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../services/supabase";
import { Message } from "../../types";
import { CloseIcon } from "../../assets/icons";
import { useStore } from "../../store";
import styles from "./styles.module.css";

const USERNAME_KEY = "chat_username";

const PAGE_SIZE = 5;

const ChatBlock: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [username, setUsername] = useState(() => {
    return localStorage.getItem(USERNAME_KEY) || "";
  });
  const [defaultUsername] = useState(() => {
    return `Anonymous${Math.floor(Math.random() * 9000) + 1000}`;
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (error) {
      console.error("Error fetching messages:", error);
    } else if (data) {
      setMessages(data.reverse());
      setHasMore(data.length === PAGE_SIZE);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoadingMore || messages.length === 0) return;

    const scrollContainer = scrollRef.current;
    const previousScrollHeight = scrollContainer?.scrollHeight || 0;

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

      // Maintain scroll position after state update
      setTimeout(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop =
            scrollContainer.scrollHeight - previousScrollHeight;
        }
      }, 0);
    }
    setIsLoadingMore(false);
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("live-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll to bottom on initial load and new messages
  useEffect(() => {
    if (scrollRef.current && !isLoadingMore) {
      const isAtBottom =
        scrollRef.current.scrollHeight - scrollRef.current.scrollTop <=
        scrollRef.current.clientHeight + 100;

      if (isInitialLoad.current || isAtBottom) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        isInitialLoad.current = false;
      }
    }
  }, [messages, isLoadingMore]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0) {
      loadMore();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const content = inputValue.trim();
    const finalUsername = username.trim() || defaultUsername;
    setInputValue("");

    const { error } = await supabase.from("messages").insert([
      {
        username: finalUsername,
        content,
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 20);
    setUsername(value);
    localStorage.setItem(USERNAME_KEY, value);
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    } catch (e) {
      return "";
    }
  };

  const { toggleChat } = useStore();

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <div className={styles.usernameInputWrapper}>
          <span className={styles.usernameLabel}>Name:</span>
          <input
            className={styles.usernameInput}
            value={username}
            onChange={handleUsernameChange}
            placeholder={defaultUsername}
            maxLength={20}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        <button className={styles.closeButton} onClick={toggleChat}>
          <CloseIcon />
        </button>
      </div>
      <div
        className={styles.messagesList}
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {isLoadingMore && <div className={styles.loadingMore}>Loading...</div>}
        {messages.map((msg) => (
          <div key={msg.id} className={styles.messageItem}>
            <div className={styles.messageMeta}>
              <span className={styles.username}>{msg.username}</span>
              <span className={styles.timestamp}>
                {formatTime(msg.created_at)}
              </span>
            </div>
            <div className={styles.content}>{msg.content}</div>
          </div>
        ))}
      </div>
      <form
        className={styles.inputArea}
        onSubmit={handleSendMessage}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <input
          className={styles.input}
          placeholder="Say something nice..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          className={styles.sendButton}
          type="submit"
          disabled={!inputValue.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBlock;
