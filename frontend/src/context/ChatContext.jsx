import React, { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([]);

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
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  // create a get request to get hello world from the backend
  // const getHelloWorld = async () => {
  //   try {
  //     const res = await fetch("http://localhost:5000/hello");
  //     if (!res.ok) throw new Error("Failed to fetch hello world");
  //     const data = await res.json();
  //     console.log(data);
  //   } catch (err) {
  //     console.error("Fetch error:", err);
  //   }
  // };
  // getHelloWorld();

  const sendMessage = async (userMessage) => {
    const newHistory = [...chatHistory, { from: "user", text: userMessage }];
    setChatHistory(newHistory);

    const botResponse = `This is a bot reply to: "${userMessage}"`;

    setTimeout(() => {
      setChatHistory((prev) => [...prev, { from: "bot", text: botResponse }]);
    }, 500);
  };

  return (
    <ChatContext.Provider value={{ chatHistory, uploadFile, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
