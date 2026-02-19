"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher, postFetcher } from "@/lib/fetcher";

export default function AddUser() {
  const { data } = useSWR("/api/mock-users", fetcher);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addUser = async () => {
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      role: "USER",
      createdAt: new Date().toISOString(),
    };

    try {
      // Optimistic update - update UI immediately
      const currentUsers = data?.data?.users || [];
      mutate(
        "/api/users",
        {
          ...data,
          data: {
            ...data?.data,
            users: [...currentUsers, newUser],
          },
        },
        false
      );

      // Actual API call
      await postFetcher("/api/mock-users", {
        name: name.trim(),
        email: email.trim(),
      });

      // Revalidate after successful update
      await mutate("/api/mock-users");

      // Clear form
      setName("");
      setEmail("");
    } catch (error: any) {
      // Rollback optimistic update on error
      await mutate("/api/mock-users");
      alert(`Error adding user: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      addUser();
    }
  };

  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Add New User</h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Enter user name"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Enter user email"
          />
        </div>

        <button
          onClick={addUser}
          disabled={isSubmitting || !name.trim() || !email.trim()}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Adding User..." : "Add User"}
        </button>
      </div>

      {/* Optimistic Update Information */}
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <h3 className="text-sm font-medium text-green-800 mb-1">
          Optimistic Updates
        </h3>
        <p className="text-xs text-green-700">
          The UI updates immediately while the request is being processed in the
          background. If the request fails, the UI will automatically rollback
          to the previous state.
        </p>
      </div>
    </div>
  );
}
