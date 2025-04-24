import React, { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [fileId, setFileId] = useState(null); // store the file ID
  const [sessionId, setSessionId] = useState(null); // store the session ID

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

      const data = await res.json(); // expecting { file_id: "..." }
      const uploadedFileId = data.file_id;
      console.log("Uploaded file ID:", uploadedFileId);
      setFileId(uploadedFileId); // store it in state

      // After getting the file_id, get the session ID
      getSessionId(uploadedFileId); // Call function to start the chat session

      return uploadedFileId;
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

      const data = await res.json(); // expecting { session_id: "..." }
      const receivedSessionId = data.session_id;
      console.log("Received session ID:", receivedSessionId);
      setSessionId(receivedSessionId); // store the session ID

      return receivedSessionId;
    } catch (err) {
      console.error("Error getting session ID:", err);
    }
  };

  const sendMessage = async (userMessage) => {
    const newHistory = [...chatHistory, { from: "user", text: userMessage }];
    setChatHistory(newHistory);

    // Simulate bot response
    const botResponse = `This is a bot reply to: "${userMessage}"`;

    setTimeout(() => {
      setChatHistory((prev) => [...prev, { from: "bot", text: botResponse }]);
    }, 500);
  };

  return (
    <ChatContext.Provider value={{ chatHistory, uploadFile, sendMessage, fileId, sessionId }}>
      {children}
    </ChatContext.Provider>
  );
};
