import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import { Send } from "lucide-react";

export default function ChatInput() {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { sendMessage } = useChat();
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "44px";
      }
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height =
        scrollHeight <= 200 ? `${scrollHeight}px` : "200px";
    }
  }, [message]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow-lg border border-gray-100">
      <form
        onSubmit={handleSubmit}
        className={`flex items-end transition-all duration-300 ${
          isFocused ? "bg-gray-50" : "bg-white"
        }`}
      >
        {/* Message input area */}
        <div className="flex-grow relative p-3">
          <textarea
            ref={textareaRef}
            className="w-full resize-none bg-transparent outline-none text-gray-800 placeholder-gray-400 py-2 px-2 max-h-48 overflow-y-auto"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center px-3 pb-3">
          {/* Send button */}
          <button
            type="submit"
            disabled={!message.trim()}
            className={`flex items-center justify-center p-3 rounded-full focus:outline-none transition-all duration-200 ${
              message.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            aria-label="Send message"
          >
            <Send size={18} className={message.trim() ? "fill-white" : ""} />
          </button>
        </div>
      </form>

      <div className="absolute bottom-0 left-0 right-0 text-xs text-center text-gray-400 -mb-5 pointer-events-none">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
