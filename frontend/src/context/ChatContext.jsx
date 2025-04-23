import React, { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([]);

  // ✅ Only uploads file to backend, does not store extracted text
  const uploadPDF = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("lang", "eng");

    try {
      const res = await fetch("http://localhost:5000/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload file");

      // ❌ No need to store or use extracted text
      // const data = await res.json();
      // setPdfText(data.extracted_text);

    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  // 💬 Adds user message to chat history, generates a bot response
  const sendMessage = async (userMessage) => {
    const newHistory = [...chatHistory, { from: "user", text: userMessage }];
    setChatHistory(newHistory);

    // 🧠 Dummy bot reply (can be updated to use real backend AI later)
    const botResponse = `This is a bot reply to: "${userMessage}"`;

    setTimeout(() => {
      setChatHistory((prev) => [...prev, { from: "bot", text: botResponse }]);
    }, 500);
  };

  return (
    <ChatContext.Provider value={{ chatHistory, uploadPDF, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
