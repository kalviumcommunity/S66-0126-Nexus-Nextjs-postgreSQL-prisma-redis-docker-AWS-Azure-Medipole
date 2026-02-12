export default function Dashboard() {
  return (
    <main className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4 text-gray-600">
        Only logged-in users can see this page.
      </p>
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-700">
          Protected Route: /dashboard
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Successfully authenticated via middleware!
        </p>
      </div>
    </main>
  );
}
