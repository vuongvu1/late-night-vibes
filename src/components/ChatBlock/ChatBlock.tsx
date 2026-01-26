import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../services/supabase";
import { Message } from "../../types";
import { CloseIcon } from "../../assets/icons";
import { useStore } from "../../store";
import styles from "./styles.module.css";

const USERNAME_KEY = "chat_username";

const ChatBlock: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [username] = useState(() => {
    let stored = localStorage.getItem(USERNAME_KEY);
    if (!stored) {
      stored = `User${Math.floor(Math.random() * 9000) + 1000}`;
      localStorage.setItem(USERNAME_KEY, stored);
    }
    return stored;
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) {
        console.error("Error fetching messages:", error);
      } else if (data) {
        setMessages(data);
      }
    };

    fetchMessages();

    // 2. Subscribe to real-time changes
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

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const content = inputValue.trim();
    setInputValue("");

    const { error } = await supabase.from("messages").insert([
      {
        username,
        content,
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
      // Optional: show error to user
    }
  };

  const { toggleChat } = useStore();

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <button className={styles.closeButton} onClick={toggleChat}>
          <CloseIcon width={16} />
        </button>
      </div>
      <div className={styles.messagesList} ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={styles.messageItem}>
            <span className={styles.username}>{msg.username}</span>
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
