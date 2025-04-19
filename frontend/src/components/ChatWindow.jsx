import { useChat } from "../context/ChatContext";
import React, { useEffect, useRef } from "react";
import { User, Bot, CheckCircle, Clock } from "lucide-react";

export default function ChatWindow() {
  const { chatHistory } = useChat();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Welcome message when chat is empty */}
      {chatHistory.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Bot size={28} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to the Chat</h3>
          <p className="text-gray-500 max-w-sm">
            Start the conversation by typing a message below. I'm here to help!
          </p>
        </div>
      )}

      {/* Message thread */}
      <div className="space-y-6">
        {chatHistory.map((msg, index) => {
          const isUser = msg.from === "user";
          const isLastMessage = index === chatHistory.length - 1;
          const showAvatar = index === 0 || chatHistory[index - 1].from !== msg.from;
          
          return (
            <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar */}
                {showAvatar && (
                  <div className={`flex-shrink-0 ${isUser ? "ml-3" : "mr-3"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                      ${isUser ? "bg-blue-600" : "bg-gray-200"}`}>
                      {isUser ? (
                        <User size={16} className="text-white" />
                      ) : (
                        <Bot size={16} className="text-gray-700" />
                      )}
                    </div>
                  </div>
                )}
                
                {/* Message bubble */}
                <div className="flex flex-col">
                  {/* Show name if it's the first message from this sender or after a sender change */}
                  {showAvatar && (
                    <span className={`text-xs font-medium mb-1 ${isUser ? "text-right text-blue-700" : "text-gray-600"}`}>
                      {isUser ? "You" : "Assistant"}
                    </span>
                  )}
                  
                  <div className={`relative group`}>
                    <div
                      className={`px-4 py-3 rounded-xl text-sm shadow-sm transition-shadow hover:shadow-md
                      ${isUser 
                        ? "bg-blue-600 text-white" 
                        : "bg-white border border-gray-200 text-gray-800"}`}
                    >
                      <div className="whitespace-pre-line">
                        {msg.text}
                      </div>
                      
                      {/* Message timestamp and status */}
                      <div className={`flex items-center mt-1 text-xs 
                        ${isUser ? "justify-end text-blue-100" : "justify-start text-gray-400"}`}>
                        <span>{formatTime(msg.timestamp || Date.now())}</span>
                        {isUser && (
                          <div className="ml-1">
                            {msg.status === "sent" ? (
                              <CheckCircle size={12} />
                            ) : (
                              <Clock size={12} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}