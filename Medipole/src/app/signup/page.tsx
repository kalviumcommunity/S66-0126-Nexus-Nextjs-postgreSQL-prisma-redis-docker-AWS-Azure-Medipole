"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import FormInput from "@/components/FormInput";

// 1. Define validation schema
const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// 2. Derive TypeScript types
type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    const toastId = toast.loading("Creating your account...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Form Submitted:", data);
      toast.success("Welcome! Your account has been created successfully.", {
        id: toastId,
      });
      reset();
    } catch (error) {
      toast.error("Something went wrong! Please try again.", {
        id: toastId,
      });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create Account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              label="Full Name"
              name="name"
              register={register}
              error={errors.name?.message}
              placeholder="Enter your full name"
              required
            />

            <FormInput
              label="Email Address"
              name="email"
              type="email"
              register={register}
              error={errors.email?.message}
              placeholder="Enter your email address"
              required
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              register={register}
              error={errors.password?.message}
              placeholder="Create a strong password"
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Already have an account?{" "}
              <a href="/auth/login" className="text-blue-600 hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
