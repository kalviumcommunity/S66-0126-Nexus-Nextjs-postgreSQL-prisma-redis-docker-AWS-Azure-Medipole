interface Props {
  params: { id: string };
}

export default async function UserProfile({ params }: Props) {
  const { id } = await params;
  
  // Mock fetch user data
  const user = { 
    id, 
    name: `User ${id}`,
    email: `user${id}@medipole.com`,
    role: "Donor"
  };

  return (
    <main className="flex flex-col items-center mt-10">
      <h2 className="text-xl font-bold">User Profile</h2>
      <div className="mt-6 p-4 bg-gray-100 rounded w-80">
        <p className="text-sm text-gray-700"><strong>ID:</strong> {user.id}</p>
        <p className="text-sm text-gray-700 mt-2"><strong>Name:</strong> {user.name}</p>
        <p className="text-sm text-gray-700 mt-2"><strong>Email:</strong> {user.email}</p>
        <p className="text-sm text-gray-700 mt-2"><strong>Role:</strong> {user.role}</p>
      </div>
      <p className="mt-4 text-xs text-gray-500">
        Dynamic Route: /users/{id}
      </p>
    </main>
  );
}
