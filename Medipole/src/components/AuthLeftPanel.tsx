"use client";

import { Droplets } from "lucide-react";

export default function AuthLeftPanel() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(160deg, #991b1b 0%, #b91c1c 40%, #7f1d1d 100%)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 48px",
      }}
    >
      {/* Curved right edge */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: -1,
          bottom: 0,
          width: 120,
          background: "#fff",
          borderRadius: "100% 0 0 100% / 50%",
        }}
      />

      {/* Puzzle piece (the white cross shape in the middle-right) */}
      <div
        style={{
          position: "absolute",
          right: 60,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
        }}
      >
        {/* Vertical bar */}
        <div
          style={{
            width: 36,
            height: 100,
            background: "#fff",
            borderRadius: 12,
            position: "absolute",
            top: -50,
            left: 0,
          }}
        />
        {/* Horizontal bar */}
        <div
          style={{
            width: 100,
            height: 36,
            background: "#fff",
            borderRadius: 12,
            position: "absolute",
            top: -18,
            left: -32,
          }}
        />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 3, maxWidth: 420 }}>
        {/* Logo */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <Droplets style={{ width: 32, height: 32, color: "#fff" }} />
        </div>

        {/* App name */}
        <p
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.01em",
            marginBottom: 12,
          }}
        >
          Medipole
        </p>

        {/* Heading */}
        <h1
          style={{
            fontSize: "clamp(32px, 3.5vw, 44px)",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.15,
            marginBottom: 20,
          }}
        >
          Save <span style={{ fontStyle: "italic" }}>Lives</span>,
          <br />
          One <span style={{ fontStyle: "italic" }}>drop</span> at a{" "}
          <span style={{ fontStyle: "italic" }}>Time</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.75)",
            marginBottom: 36,
            maxWidth: 360,
          }}
        >
          Connect donors with hospitals, manage blood inventory, and respond to
          emergencies in real-time.
        </p>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {[
            { value: "10K+", label: "Active Donors" },
            { value: "200+", label: "Hospitals" },
            { value: "50K+", label: "Last Used" },
            { value: "24/7", label: "Emergency Support" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                borderRadius: 12,
                padding: "16px 20px",
                textAlign: "center",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.7)",
                  marginTop: 2,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
