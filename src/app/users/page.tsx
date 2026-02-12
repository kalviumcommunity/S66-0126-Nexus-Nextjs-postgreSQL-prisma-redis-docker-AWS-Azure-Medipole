import Link from "next/link";

export default function UsersList() {
  const mockUsers = [
    { id: "1", name: "User 1", email: "user1@medipole.com" },
    { id: "2", name: "User 2", email: "user2@medipole.com" },
    { id: "3", name: "User 3", email: "user3@medipole.com" },
    { id: "4", name: "User 4", email: "user4@medipole.com" },
  ];

  return (
    <main className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold">Users List</h1>
      <p className="mt-2 text-gray-600">
        Protected Route: /users
      </p>
      <div className="mt-6 w-96">
        {mockUsers.map((user) => (
          <Link
            key={user.id}
            href={`/users/${user.id}`}
            className="block p-3 mb-2 border border-gray-300 rounded hover:bg-gray-100 transition"
          >
            <p className="font-semibold text-blue-600">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
