"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import AddUser from "./AddUser";

export default function UsersPage() {
  const { data, error, isLoading } = useSWR("/api/mock-users", fetcher);

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          Failed to load users
        </h1>
        <p className="text-red-500">{error.message}</p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">User List</h1>
        <p className="text-gray-500">Loading users...</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">User List</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {data?.data?.users?.map((user: any) => (
            <li
              key={user.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {user.email}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {user.id}</p>
                  <p className="text-sm text-gray-500">Role: {user.role}</p>
                </div>
                <div className="text-sm text-gray-500">
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {data?.data?.users?.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>No users found</p>
          </div>
        )}
      </div>

      <AddUser />

      {/* Cache Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-medium text-blue-900 mb-2">
          SWR Cache Information
        </h2>
        <p className="text-sm text-blue-700">
          Data is cached and will automatically revalidate when you refocus this
          tab or navigate back.
        </p>
      </div>
    </main>
  );
}
