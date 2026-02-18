"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Droplets,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  RefreshCw,
  CalendarDays,
  Activity,
  HandHeart,
} from "lucide-react";
import { useUserStore } from "@/store/userStore";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

interface EmergencyRequest {
  id: number;
  hospital: string;
  urgency: string;
  urgencyColor: string;
  distance: string;
  time: string;
  phone: string;
  bloodType: string;
  bloodBg: string;
  bloodText: string;
  units: number;
}

const initialRequests: EmergencyRequest[] = [
  {
    id: 1,
    hospital: "City General Hospital",
    urgency: "Critical",
    urgencyColor: "#dc2626",
    distance: "2.5 km",
    time: "2 mins ago",
    phone: "+91 -9465964967",
    bloodType: "O-",
    bloodBg: "#dc2626",
    bloodText: "white",
    units: 3,
  },
  {
    id: 2,
    hospital: "City General Hospital",
    urgency: "Critical",
    urgencyColor: "#dc2626",
    distance: "2.5 km",
    time: "2 mins ago",
    phone: "+91 -9465964967",
    bloodType: "AB-",
    bloodBg: "#dc2626",
    bloodText: "white",
    units: 2,
  },
];

const statCards = [
  {
    icon: RefreshCw,
    value: "8",
    label: "Total Donations",
    sub: "Lifetime contributions",
    iconBg: "#fef2f2",
    iconColor: "#b91c1c",
    borderColor: "#e5e7eb",
  },
  {
    icon: Droplets,
    value: "O+",
    label: "Blood Group",
    sub: "Universal Donor",
    iconBg: "#f3f4f6",
    iconColor: "#1f2937",
    borderColor: "#e5e7eb",
  },
  {
    icon: CalendarDays,
    value: "Feb 15",
    label: "Next Eligible Date",
    sub: "",
    iconBg: "#fef2f2",
    iconColor: "#b91c1c",
    borderColor: "#e5e7eb",
  },
  {
    icon: Clock,
    value: "2023",
    label: "Donor Since",
    sub: "+2 years of service",
    iconBg: "#f0fdf4",
    iconColor: "#16a34a",
    borderColor: "#e5e7eb",
  },
  {
    icon: Activity,
    value: "5",
    label: "Active Requests",
    sub: "Nearby",
    iconBg: "#fef2f2",
    iconColor: "#b91c1c",
    borderColor: "#e5e7eb",
  },
];

export default function DashboardPage() {
  const user = useUserStore((s) => s.user);
  const [requests, setRequests] = useState<EmergencyRequest[]>(initialRequests);

  const handleAccept = (id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success("Request accepted!", {
      description: "Thank you for volunteering to donate blood.",
    });
  };

  const handleDecline = (id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast("Request declined", {
      description: "The request has been removed from your list.",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: 0 }}>
            Welcome Back,{" "}
            <span style={{ color: "#b91c1c", fontStyle: "italic" }}>
              {user?.name || "Sreedhil Pavishanker B"}
            </span>
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 6, margin: 0, marginBlockStart: 6 }}>
            Your contributions are saving lives. Thank you for being a hero.
          </p>
        </div>
        <button
          onClick={() =>
            toast.info("Feature coming soon", {
              description: "Blood request feature is under development.",
            })
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 10,
            border: "1.5px solid #d1d5db",
            background: "white",
            fontSize: 14,
            fontWeight: 600,
            color: "#111827",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#b91c1c";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#d1d5db";
          }}
        >
          <HandHeart style={{ width: 18, height: 18, color: "#111827" }} />
          Request Blood
        </button>
      </div>

      {/* Eligibility Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #166534 0%, #15803d 50%, #16a34a 100%)",
            borderRadius: 16,
            padding: "20px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle style={{ width: 24, height: 24, color: "white" }} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", margin: 0 }}>
                You&apos;re Eligible to Donate!
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                  margin: 0,
                  marginTop: 4,
                }}
              >
                You can donate blood today. Find a nearby blood bank and save lives.
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              toast.info("Feature coming soon", {
                description: "Nearby blood banks feature is under development.",
              })
            }
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "1.5px solid white",
              background: "white",
              color: "#166534",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "white";
            }}
          >
            Donate Now
          </button>
        </div>
      </motion.div>

      {/* Stats Grid - 5 cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
        }}
        className="max-lg:!grid-cols-3 max-sm:!grid-cols-2"
      >
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div
              style={{
                background: "white",
                borderRadius: 14,
                padding: "20px 18px",
                border: `1px solid ${stat.borderColor}`,
                minHeight: 130,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: stat.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <stat.icon style={{ width: 20, height: 20, color: stat.iconColor }} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", lineHeight: 1.1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginTop: 4 }}>
                  {stat.label}
                </div>
                {stat.sub && (
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    {stat.sub}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Emergency Requests Section */}
      <motion.div
        custom={5}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
              Emergency Requests Near You
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0, marginTop: 4 }}>
              Blood request matching your blood type
            </p>
          </div>
          <button
            onClick={() =>
              toast.info("Feature coming soon", {
                description: "View all emergency requests.",
              })
            }
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "1.5px solid #16a34a",
              background: "white",
              color: "#16a34a",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            View all
          </button>
        </div>

        {/* Request Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
            marginTop: 16,
          }}
          className="max-md:!grid-cols-1"
        >
          {requests.map((req) => (
            <div
              key={req.id}
              style={{
                background: "white",
                borderRadius: 16,
                border: "1.5px solid #fecaca",
                overflow: "hidden",
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  padding: "16px 20px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {/* Hospital name + badges */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#fef2f2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Droplets
                      style={{ width: 16, height: 16, color: "#b91c1c" }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {req.hospital}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "white",
                      background: req.urgencyColor,
                      padding: "2px 10px",
                      borderRadius: 10,
                    }}
                  >
                    {req.urgency}
                  </span>
                  <Droplets
                    style={{ width: 16, height: 16, color: "#b91c1c", marginLeft: "auto" }}
                  />
                </div>

                {/* Meta row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin style={{ width: 14, height: 14, color: "#9ca3af" }} />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      {req.distance}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock style={{ width: 14, height: 14, color: "#9ca3af" }} />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                      {req.time}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
                    <Phone style={{ width: 14, height: 14, color: "#16a34a" }} />
                    <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                      {req.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Blood type + Units */}
              <div
                style={{
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderTop: "1px solid #f3f4f6",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 50,
                    height: 36,
                    borderRadius: 8,
                    background: req.bloodBg,
                    color: req.bloodText,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {req.bloodType}
                </span>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    background: "#f3f4f6",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      padding: "8px 14px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      background: "#e5e7eb",
                      borderRadius: "8px 0 0 8px",
                    }}
                  >
                    Units
                  </span>
                  <span
                    style={{
                      padding: "8px 14px",
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    {req.units} units needed
                  </span>
                </div>
              </div>

              {/* Accept / Decline */}
              <div
                style={{
                  padding: "12px 20px 16px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <button
                  onClick={() => handleAccept(req.id)}
                  style={{
                    padding: "10px 0",
                    borderRadius: 10,
                    border: "none",
                    background: "#b91c1c",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#991b1b";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#b91c1c";
                  }}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(req.id)}
                  style={{
                    padding: "10px 0",
                    borderRadius: 10,
                    border: "1.5px solid #d1d5db",
                    background: "white",
                    color: "#374151",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "white";
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "40px 0",
                color: "#9ca3af",
                fontSize: 14,
              }}
            >
              No emergency requests at this time.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
