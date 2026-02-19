interface LoaderProps {
  isLoading: boolean;
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "white";
}

export default function Loader({
  isLoading,
  message = "Loading...",
  size = "md",
  variant = "primary",
}: LoaderProps) {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const variantClasses = {
    primary: "text-blue-600",
    secondary: "text-gray-600",
    white: "text-white",
  };

  return (
    <div
      className="flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <div
            className={`${sizeClasses[size]} ${variantClasses[variant]} animate-spin rounded-full border-2 border-current border-t-transparent`}
          />
        </div>
        {message && (
          <span className="mt-2 text-sm text-gray-600">{message}</span>
        )}
      </div>
    </div>
  );
}

// Full page loader variant
interface FullPageLoaderProps {
  message?: string;
}

export function FullPageLoader({
  message = "Loading...",
}: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-12 h-12 text-blue-600 animate-spin rounded-full border-4 border-current border-t-transparent" />
        </div>
        <span className="mt-4 text-lg font-medium text-gray-700">
          {message}
        </span>
      </div>
    </div>
  );
}
