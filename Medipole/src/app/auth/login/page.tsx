"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/userStore";
import AuthLeftPanel from "@/components/AuthLeftPanel";

export default function LoginPage() {
  const router = useRouter();
  const login = useUserStore((s) => s.login);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email";
    if (!form.password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Login failed");
        setLoading(false);
        return;
      }

      login(
        {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: "",
          role: data.user.role,
        },
        data.token
      );

      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left panel — hidden on mobile */}
      <div
        style={{ flex: "0 0 50%", display: "none" }}
        className="lg:!flex"
      >
        <div style={{ width: "100%", height: "100%" }}>
          <AuthLeftPanel />
        </div>
      </div>

      {/* Right panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 32px",
          background: "#fff",
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%", maxWidth: 440 }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Welcome Back
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#6b7280",
              marginBottom: 40,
            }}
          >
            Enter your credentials to access the account
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                Email Address
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                style={{
                  height: 44,
                  borderRadius: 8,
                  borderColor: errors.email ? "#ef4444" : "#e5e7eb",
                }}
              />
              {errors.email && (
                <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 32 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  style={{
                    height: 44,
                    borderRadius: 8,
                    paddingRight: 44,
                    borderColor: errors.password ? "#ef4444" : "#e5e7eb",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    padding: 0,
                    display: "flex",
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: 18, height: 18 }} />
                  ) : (
                    <Eye style={{ width: 18, height: 18 }} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
                color: "#fff",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Link to sign up */}
            <p
              style={{
                textAlign: "center",
                fontSize: 14,
                color: "#6b7280",
                marginTop: 24,
              }}
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                style={{
                  color: "#b91c1c",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Create account
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
