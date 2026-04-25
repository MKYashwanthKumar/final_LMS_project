import React from "react";

const toneStyles = {
  success: {
    bg: "rgba(16, 185, 129, 0.16)",
    color: "#10b981"
  },
  info: {
    bg: "rgba(59, 130, 246, 0.16)",
    color: "#60a5fa"
  },
  warning: {
    bg: "rgba(245, 158, 11, 0.16)",
    color: "#f59e0b"
  },
  danger: {
    bg: "rgba(239, 68, 68, 0.16)",
    color: "#ef4444"
  },
  primary: {
    bg: "rgba(139, 92, 246, 0.16)",
    color: "#8b5cf6"
  },
  muted: {
    bg: "rgba(148, 163, 184, 0.16)",
    color: "#94a3b8"
  }
};

const StatsGrid = ({ stats = [] }) => {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const tone = toneStyles[stat.tone] || toneStyles.info;

        return (
          <div className="stat-card" key={`${stat.label}-${index}`}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                background: tone.bg,
                color: tone.color,
                marginBottom: 16
              }}
            >
              {Icon ? <Icon size={22} /> : null}
            </div>

            <div style={{ color: "#dbe7ff", fontSize: 14, marginBottom: 8 }}>
              {stat.label}
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", marginBottom: 10 }}>
              {stat.value}
            </div>

            {stat.badge ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  background: tone.bg,
                  color: tone.color
                }}
              >
                {stat.badge}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default StatsGrid;