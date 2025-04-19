import React from "react";
import { ChatProvider } from "./context/ChatContext";
import PDFUploader from "./components/PDFUploader";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import "./App.css";

export default function App() {
  return (
    <ChatProvider>
      <div className="flex h-screen">
        {/* Left Side */}
        <div className="w-1/3 p-6 bg-gray-100 border-r">
          <PDFUploader />
        </div>

        {/* Right Side */}
        <div className="w-2/3 p-6 flex flex-col bg-white">
          <ChatWindow />
          <ChatInput />
        </div>
      </div>
    </ChatProvider>
  );
}
