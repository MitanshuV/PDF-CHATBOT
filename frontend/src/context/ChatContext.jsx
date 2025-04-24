import React, { createContext, useState, useContext } from "react";

const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [fileId, setFileId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("lang", "eng");

    try {
      const res = await fetch("http://localhost:5000/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload file");

      const data = await res.json();
      const uploadedFileId = data.file_id;
      setFileId(uploadedFileId);
      getSessionId(uploadedFileId);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const getSessionId = async (uploadedFileId) => {
    try {
      const res = await fetch("http://127.0.0.1:5001/chat/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file_id: uploadedFileId }),
      });

      if (!res.ok) throw new Error("Failed to start chat session");

      const data = await res.json();
      const receivedSessionId = data.session_id;
      setSessionId(receivedSessionId);
    } catch (err) {
      console.error("Error getting session ID:", err);
    }
  };

  const sendMessage = async (userMessage) => {
    if (!sessionId) {
      console.error("No session ID available.");
      return;
    }

    setChatHistory((prev) => [...prev, { from: "user", text: userMessage }]);

    try {
      const res = await fetch("http://127.0.0.1:5001/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
        }),
      });

      if (!res.ok) throw new Error("Failed to get bot response");

      const data = await res.json();
      const botResponse = data.answer;

      setChatHistory((prev) => [...prev, { from: "bot", text: botResponse }]);
    } catch (err) {
      console.error("Error sending message:", err);
      setChatHistory((prev) => [
        ...prev,
        { from: "bot", text: "Something went wrong. Please try again." },
      ]);
    }
  };

  return (
    <ChatContext.Provider value={{ chatHistory, uploadFile, sendMessage, fileId, sessionId }}>
      {children}
    </ChatContext.Provider>
  );
};
