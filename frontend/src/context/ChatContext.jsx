import React, { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [pdfText, setPdfText] = useState(""); // Store extracted text
  const [chatHistory, setChatHistory] = useState([]);

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
      const data = await res.json();
      setPdfText(data.extracted_text); // Save extracted text
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const sendMessage = async (userMessage) => {
    const newHistory = [...chatHistory, { from: "user", text: userMessage }];
    setChatHistory(newHistory);

    const botResponse = `Based on your PDF, here's a reply to: "${userMessage}"\n\n[Sample Text: ${pdfText.slice(0, 100)}...]`;

    setTimeout(() => {
      setChatHistory((prev) => [...prev, { from: "bot", text: botResponse }]);
    }, 500);
  };

  return (
    <ChatContext.Provider value={{ pdfText, chatHistory, uploadPDF, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
