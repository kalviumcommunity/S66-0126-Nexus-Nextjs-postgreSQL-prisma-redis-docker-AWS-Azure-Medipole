"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  Building2,
  HeartHandshake,
  UserCog,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore, type UserRole } from "@/store/userStore";
import AuthLeftPanel from "@/components/AuthLeftPanel";

const roles: { value: UserRole; label: string; Icon: React.ElementType }[] = [
  { value: "DONOR", label: "Donor", Icon: Heart },
  { value: "HOSPITAL", label: "Hospital", Icon: Building2 },
  { value: "NGO", label: "NGO", Icon: HeartHandshake },
  { value: "ADMIN", label: "Admin", Icon: UserCog },
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRole = (searchParams.get("role") as UserRole) || "DONOR";
  const login = useUserStore((s) => s.login);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: preselectedRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Full Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (!form.confirmPassword) errs.confirmPassword = "Confirm your password";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    login({
      name: form.name,
      email: form.email,
      phone: "",
      role: form.role,
    });

    toast.success("Account created successfully!");
    setLoading(false);
    router.push("/dashboard");
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
          overflowY: "auto",
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
            Create your account
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#6b7280",
              marginBottom: 32,
            }}
          >
            Join Medipole and start making a difference
          </p>

          <form onSubmit={handleSubmit}>
            {/* Role selector */}
            <div style={{ marginBottom: 28 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 10,
                }}
              >
                I am a
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                }}
              >
                {roles.map((r) => {
                  const selected = form.role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "14px 8px",
                        borderRadius: 10,
                        border: selected
                          ? "2px solid #b91c1c"
                          : "1.5px solid #e5e7eb",
                        background: selected ? "#fef2f2" : "#fff",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <r.Icon
                        style={{
                          width: 22,
                          height: 22,
                          color: selected ? "#b91c1c" : "#6b7280",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: selected ? "#b91c1c" : "#374151",
                        }}
                      >
                        {r.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                Full Name
              </label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                style={{
                  height: 44,
                  borderRadius: 8,
                  borderColor: errors.name ? "#ef4444" : "#e5e7eb",
                }}
              />
              {errors.name && (
                <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
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
            <div style={{ marginBottom: 20 }}>
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

            {/* Confirm Password */}
            <div style={{ marginBottom: 28 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                  style={{
                    height: 44,
                    borderRadius: 8,
                    paddingRight: 44,
                    borderColor: errors.confirmPassword
                      ? "#ef4444"
                      : "#e5e7eb",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
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
                  {showConfirm ? (
                    <EyeOff style={{ width: 18, height: 18 }} />
                  ) : (
                    <Eye style={{ width: 18, height: 18 }} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>
                  {errors.confirmPassword}
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
              {loading ? "Creating..." : "create Account"}
            </Button>

            {/* Link to sign in */}
            <p
              style={{
                textAlign: "center",
                fontSize: 14,
                color: "#6b7280",
                marginTop: 24,
              }}
            >
              Already have an Account?{" "}
              <Link
                href="/auth/login"
                style={{
                  color: "#b91c1c",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign In
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: "4px solid #b91c1c",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
