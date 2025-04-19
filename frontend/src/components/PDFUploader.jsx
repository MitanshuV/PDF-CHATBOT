import { useChat } from "../context/ChatContext";
import React, { useState } from "react";
import { FileText, Upload, X, CheckCircle } from "lucide-react";

export default function PDFUploader() {
  const { uploadPDF } = useChat();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle file input selection (multiple PDFs)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter(
      (file) => file.type === "application/pdf"
    );
    if (files.length > 0) {
      setSelectedFiles(files);
      setIsSuccess(false);
    } else {
      alert("Please upload valid PDF files.");
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave" || e.type === "drop") {
      setIsDragging(false);
    }
  };

  // Handle drop event (multiple files)
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );
    if (files.length > 0) {
      setSelectedFiles(files);
      setIsSuccess(false);
    } else {
      alert("Please upload valid PDF files.");
    }
  };

  // Upload multiple PDFs
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (let file of selectedFiles) {
        await uploadPDF(file); // uploadPDF expected to handle single file
      }
      setIsSuccess(true);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading one or more PDFs.");
    } finally {
      setIsUploading(false);
    }
  };

  // Clear selected files
  const handleClear = () => {
    setSelectedFiles([]);
    setIsSuccess(false);
  };

  // Display readable file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Upload Document</h2>

      {selectedFiles.length === 0 ? (
        <div
          className={`relative group transition-all duration-300 ease-in-out
            ${
              isDragging
                ? "bg-blue-50 border-blue-500"
                : "bg-gray-50 border-gray-300 hover:border-blue-400 hover:bg-gray-100"
            } 
            border-2 border-dashed rounded-xl p-8`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="application/pdf"
            multiple // ✅ allow multiple files
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <div className="p-4 bg-blue-100 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
              <Upload size={24} />
            </div>
            <div>
              <p className="font-medium text-gray-700">
                Drag & drop your PDF here
              </p>
              <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Supported format: PDF (max 10MB)
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="text-blue-600" size={24} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleClear}
              className="text-sm text-red-500 hover:underline"
            >
              Clear all
            </button>
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading || isSuccess}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all duration-300
              ${
                isSuccess
                  ? "bg-green-500 text-white"
                  : isUploading
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              }`}
          >
            {isUploading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Uploading...
              </div>
            ) : isSuccess ? (
              <div className="flex items-center">
                <CheckCircle size={18} className="mr-2" />
                Upload Complete
              </div>
            ) : (
              "Upload PDF"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
