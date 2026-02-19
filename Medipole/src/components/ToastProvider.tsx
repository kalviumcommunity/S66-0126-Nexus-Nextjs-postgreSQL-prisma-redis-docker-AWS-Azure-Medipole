"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        className: "",
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "500",
        },
        // Specific styles for different toast types
        success: {
          style: {
            background: "#10B981",
            color: "#fff",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#10B981",
          },
        },
        error: {
          style: {
            background: "#EF4444",
            color: "#fff",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        },
        loading: {
          style: {
            background: "#3B82F6",
            color: "#fff",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#3B82F6",
          },
        },
      }}
    />
  );
}
