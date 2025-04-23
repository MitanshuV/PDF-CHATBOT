import React, { createContext, useState, useContext } from "react";

// 1. Create the ChatContext to hold shared state and functions
const ChatContext = createContext();

// 2. Custom hook for accessing the ChatContext
export const useChat = () => useContext(ChatContext);

// 3. Context Provider that wraps your app and provides chat state
export const ChatProvider = ({ children }) => {
  // Holds uploaded PDF file or document ID (used when sending messages)
  const [pdfFile, setPdfFile] = useState(null);

  // Stores all chat messages between user and bot
  const [chatHistory, setChatHistory] = useState([]);

  // Function to store uploaded PDF (can be file or docId)
  const uploadPDF = (file) => {
    setPdfFile(file); // This could later be a docId returned from backend
  };

  // Function to send user's message and receive a response from bot
  const sendMessage = async (userMessage) => {
    // Step 1: Add user's message to chat history
    const newHistory = [...chatHistory, { from: "user", text: userMessage }];
    setChatHistory(newHistory);

    // Step 2: Simulate a bot response (this is a placeholder for real API call)
    const botResponse = `You asked: "${userMessage}" — here's a sample answer.`;

    // Step 3: Add bot's response after delay (simulating backend delay)
    setTimeout(() => {
      setChatHistory((prev) => [...prev, { from: "bot", text: botResponse }]);
    }, 500);
  };

  // 4. Return the context provider with the values we want to share
  return (
    <ChatContext.Provider
      value={{ pdfFile, chatHistory, uploadPDF, sendMessage }}
    >
      {children}
    </ChatContext.Provider>
  );
};
