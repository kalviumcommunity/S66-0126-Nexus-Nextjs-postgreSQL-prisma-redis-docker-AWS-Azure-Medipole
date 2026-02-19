"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Heart,
  MapPin,
  Zap,
  ClipboardCheck,
  Users,
  ShieldCheck,
  Target,
  Building2,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── animation variant ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const },
  }),
};

/* ── data ── */
const stats = [
  { value: "50K+", label: "Last Saved" },
  { value: "10K+", label: "Active Donors" },
  { value: "200+", label: "Hospitals" },
  { value: "24/7", label: "Emergency Support" },
];

const features = [
  {
    Icon: MapPin,
    title: "Location-Based Matching",
    desc: "Find nearby donors and hospitals with our intelligent geolocation system.",
    iconColor: "#b91c1c",
    iconBg: "#fef2f2",
  },
  {
    Icon: Zap,
    title: "Emergency Alerts",
    desc: "Instant notifications for urgent blood requests reaching the right donors.",
    iconColor: "#b91c1c",
    iconBg: "#fef2f2",
  },
  {
    Icon: ClipboardCheck,
    title: "Inventory Management",
    desc: "Real-time blood inventory tracking for hospitals and blood banks.",
    iconColor: "#b91c1c",
    iconBg: "#fef2f2",
  },
  {
    Icon: Users,
    title: "Donor Network",
    desc: "Build and manage a network of Verified, eligible blood donors.",
    iconColor: "#b91c1c",
    iconBg: "#fef2f2",
  },
  {
    Icon: ShieldCheck,
    title: "Verified Hospitals",
    desc: "All hospitals undergo verification for trust and security.",
    iconColor: "#16a34a",
    iconBg: "#f0fdf4",
  },
  {
    Icon: Target,
    title: "Impact Tracking",
    desc: "See the lives you've impacted with detailed donation history.",
    iconColor: "#b91c1c",
    iconBg: "#fef2f2",
  },
];

const howItWorks = [
  {
    Icon: Heart,
    title: "For Donors",
    desc: "Register, get notified of emergencies nearby, and save lives with your donation.",
    iconColor: "#b91c1c",
    iconBg: "#fef2f2",
  },
  {
    Icon: Building2,
    title: "For Hospitals",
    desc: "Manage blood inventory, raise emergency requests, and connect with donors instantly.",
    iconColor: "#b91c1c",
    iconBg: "#fef2f2",
  },
  {
    Icon: Droplets,
    title: "For NGOs",
    desc: "Verify hospitals, monitor analytics, and organize blood donation drives.",
    iconColor: "#b91c1c",
    iconBg: "#fef2f2",
  },
];

/* ── page ── */
export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      {/* ═══════ NAVBAR ═══════ */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#fef2f2",
                border: "2px solid #b91c1c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Droplets style={{ width: 20, height: 20, color: "#b91c1c" }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
              Medipole
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="rounded-full"
                style={{
                  padding: "0 24px",
                  height: 40,
                  fontSize: 14,
                  fontWeight: 500,
                  borderColor: "#d1d5db",
                }}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button
                className="rounded-full"
                style={{
                  padding: "0 24px",
                  height: 40,
                  fontSize: 14,
                  fontWeight: 500,
                  background: "#b91c1c",
                  color: "#fff",
                }}
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section style={{ padding: "64px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 9999,
              padding: "6px 16px",
              marginBottom: 32,
            }}
          >
            <Heart
              style={{
                width: 16,
                height: 16,
                color: "#b91c1c",
                fill: "#b91c1c",
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#991b1b" }}>
              Blood shortages aren&apos;t physical. They&apos;re informational.
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            style={{
              fontSize: "clamp(40px, 5vw, 60px)",
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Connect. Donate.{" "}
            <span style={{ color: "#b91c1c" }}>Save Lives.</span>
          </motion.h1>

          {/* Sub heading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            style={{
              marginTop: 24,
              fontSize: 17,
              lineHeight: 1.65,
              color: "#6b7280",
              maxWidth: 520,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Medipole connects blood donors with hospitals and blood banks in
            real- time. Find nearby donation centers, respond to emergencies,
            and track your impact.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            style={{
              marginTop: 40,
              display: "flex",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="rounded-full"
                style={{
                  padding: "0 32px",
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                  background: "#b91c1c",
                  color: "#fff",
                  gap: 8,
                }}
              >
                Start Saving Lives{" "}
                <ArrowRight style={{ width: 18, height: 18 }} />
              </Button>
            </Link>
            <Link href="/auth/signup?role=HOSPITAL">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                style={{
                  padding: "0 32px",
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                  borderColor: "#d1d5db",
                  color: "#111827",
                }}
              >
                Hospital
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section style={{ padding: "16px 24px 48px" }}>
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "24px 8px",
                textAlign: "center",
                transition: "box-shadow 0.2s",
              }}
              whileHover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#b91c1c",
                  lineHeight: 1.2,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section style={{ padding: "64px 24px 72px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          {/* heading */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <h2
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              Powerful Features for Everyone
            </h2>
            <p
              style={{
                marginTop: 16,
                fontSize: 17,
                color: "#6b7280",
                maxWidth: 520,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Whether you&apos;re a donor, hospital, or organization, Medipole
              has the tools you need.
            </p>
          </motion.div>

          {/* cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 24,
                  transition: "box-shadow 0.25s, transform 0.25s",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: f.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <f.Icon
                    style={{ width: 22, height: 22, color: f.iconColor }}
                  />
                </div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: 8,
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#9ca3af",
                    margin: 0,
                  }}
                >
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section style={{ padding: "64px 24px 80px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          {/* heading */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <h2
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              How It Works
            </h2>
            <p style={{ marginTop: 16, fontSize: 17, color: "#6b7280" }}>
              A seamless platform connecting blood donors, hospitals, and NGOs
            </p>
          </motion.div>

          {/* cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 24,
                  transition: "box-shadow 0.25s, transform 0.25s",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: item.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <item.Icon
                    style={{ width: 22, height: 22, color: item.iconColor }}
                  />
                </div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#9ca3af",
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA BANNER ═══════ */}
      <section style={{ padding: "24px 24px 80px" }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          style={{
            maxWidth: 900,
            margin: "0 auto",
            background: "#b91c1c",
            borderRadius: 20,
            padding: "72px 40px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              marginBottom: 16,
            }}
          >
            Ready to Make a Difference ?
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.8)",
              maxWidth: 460,
              margin: "0 auto 32px",
              lineHeight: 1.6,
            }}
          >
            Join thousands of heroes who are saving lives every day. Your
            donation could be someone&apos;s second chance.
          </p>
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="rounded-full"
              style={{
                padding: "0 32px",
                height: 48,
                fontSize: 16,
                fontWeight: 600,
                background: "#fff",
                color: "#b91c1c",
                gap: 8,
              }}
            >
              Get Started <ArrowRight style={{ width: 18, height: 18 }} />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer style={{ borderTop: "1px solid #e5e7eb", padding: "32px 24px" }}>
        <div
          style={{
            maxWidth: 1060,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>
            © 2025 Medipole. Saving lives, one drop at a time.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {["privacy", "Terms", "Contact"].map((t) => (
              <Link
                key={t}
                href="#"
                style={{
                  fontSize: 14,
                  color: "#9ca3af",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#111827")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
