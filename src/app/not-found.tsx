export default function NotFound() {
  return (
    <main className="flex flex-col items-center mt-10 text-red-600">
      <h1 className="text-2xl font-bold">404 — Page Not Found</h1>
      <p className="mt-4 text-gray-600">
        Oops! This route doesn't exist.
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Please check the URL and try again.
      </p>
    </main>
  );
}
