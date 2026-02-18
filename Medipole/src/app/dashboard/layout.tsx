"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Droplets,
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Building2,
  HeartHandshake,
  Package,
  Users,
  Activity,
} from "lucide-react";
import { useUserStore } from "@/store/userStore";

const getSidebarItems = (role: string) => {
  const commonItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  ];

  const roleSpecificItems: Record<string, typeof commonItems> = {
    DONOR: [
      {
        icon: AlertTriangle,
        label: "Emergency Requests",
        href: "/dashboard/emergency",
      },
      { icon: Clock, label: "Donation History", href: "/dashboard/history" },
      {
        icon: ShieldCheck,
        label: "Eligibility",
        href: "/dashboard/eligibility",
      },
      { icon: MapPin, label: "Nearby Map", href: "/dashboard/nearby" },
    ],
    HOSPITAL: [
      { icon: Package, label: "Inventory", href: "/dashboard/inventory" },
      {
        icon: AlertTriangle,
        label: "Blood Requests",
        href: "/dashboard/requests",
      },
      { icon: Users, label: "Donors", href: "/dashboard/donors" },
    ],
    NGO: [
      {
        icon: HeartHandshake,
        label: "Campaigns",
        href: "/dashboard/campaigns",
      },
      { icon: Activity, label: "Analytics", href: "/dashboard/analytics" },
      {
        icon: ShieldCheck,
        label: "Verify Hospitals",
        href: "/dashboard/verify",
      },
    ],
    ADMIN: [
      { icon: Users, label: "Users", href: "/dashboard/users" },
      { icon: Building2, label: "Hospitals", href: "/dashboard/hospitals" },
      { icon: Activity, label: "Analytics", href: "/dashboard/analytics" },
    ],
  };

  return [
    ...commonItems,
    ...(roleSpecificItems[role] || roleSpecificItems.DONOR),
  ];
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(() => false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [mounted, isAuthenticated, router]);

  const sidebarItems = getSidebarItems(user?.role || "DONOR");

  if (!mounted || !isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f9fafb",
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
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  const handleNavClick = (href: string) => {
    if (href === "/dashboard") {
      router.push(href);
    } else {
      toast.info("Feature coming soon", {
        description: "This feature is currently under development.",
      });
    }
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex" }}>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 40,
            }}
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "linear-gradient(180deg, #991b1b 0%, #7f1d1d 100%)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transition: "transform 0.3s ease",
        }}
        className={`lg:translate-x-0 ${!sidebarOpen ? "max-lg:-translate-x-full" : ""}`}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Droplets style={{ width: 22, height: 22, color: "white" }} />
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            Medipole
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            style={{
              marginLeft: "auto",
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "none",
            }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Nav items */}
        <nav
          style={{
            flex: 1,
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: isActive ? "white" : "transparent",
                  color: isActive ? "#b91c1c" : "rgba(255,255,255,0.85)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(255,255,255,0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                  }
                }}
              >
                <item.icon style={{ width: 20, height: 20 }} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User section at bottom */}
        <div
          style={{
            padding: "16px 16px 20px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {/* User info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#166534",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {user?.name?.charAt(0) || "S"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "white",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name?.toLowerCase().replace(/\s+/g, ".") ||
                  "sreedhil.pavishanker"}
              </p>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 3,
                  fontSize: 10,
                  fontWeight: 600,
                  color: "white",
                  background: "#16a34a",
                  padding: "2px 10px",
                  borderRadius: 10,
                  textTransform: "capitalize",
                }}
              >
                {user?.role
                  ? user.role.charAt(0).toUpperCase() +
                    user.role.slice(1).toLowerCase()
                  : "Donor"}
              </span>
            </div>
          </div>

          {/* Settings */}
          <button
            onClick={() =>
              toast.info("Feature coming soon", {
                description: "Settings page is under development.",
              })
            }
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.8)",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "none";
            }}
          >
            <Settings style={{ width: 18, height: 18 }} />
            Settings
          </button>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.8)",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "none";
            }}
          >
            <LogOut style={{ width: 18, height: 18 }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          marginLeft: 240,
        }}
        className="max-lg:ml-0!"
      >
        {/* Top bar */}
        <header
          style={{
            height: 56,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:!hidden"
            style={{
              color: "#6b7280",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "none",
            }}
          >
            <Menu style={{ width: 24, height: 24 }} />
          </button>
          <div style={{ marginLeft: "auto" }} />
          {/* Notification bell */}
          <div style={{ position: "relative", cursor: "pointer" }}>
            <Bell style={{ width: 22, height: 22, color: "#6b7280" }} />
            <div
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#b91c1c",
                border: "2px solid white",
              }}
            />
          </div>
        </header>

        {/* Page content */}
        <main
          style={{ flex: 1, padding: "24px 32px", overflowY: "auto" }}
          className="max-lg:!px-4"
        >
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
