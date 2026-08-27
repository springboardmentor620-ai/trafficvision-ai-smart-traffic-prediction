import { Link } from "react-router-dom";

export function LogoMark({ size = 34 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="markBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="markNodeRose" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>
        <linearGradient id="markNodeAmber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="markNodeEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="markNodeCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <filter id="markGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Modern Rounded Prism Container */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill="url(#markBgGrad)"
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeOpacity="0.45"
      />

      {/* Cyber Flow Grid */}
      <path
        d="M12 34 L24 14 L36 34"
        stroke="#38bdf8"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <line
        x1="17"
        y1="25"
        x2="31"
        y2="25"
        stroke="#38bdf8"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
      <line
        x1="24"
        y1="12"
        x2="24"
        y2="36"
        stroke="#60a5fa"
        strokeWidth="1.8"
        strokeDasharray="2 2"
        opacity="0.75"
      />

      {/* Glowing Neural Traffic Nodes */}
      <circle cx="24" cy="14" r="4.2" fill="url(#markNodeRose)" filter="url(#markGlow)" />
      <circle cx="24" cy="14" r="1.8" fill="#ffffff" />

      <circle cx="24" cy="25" r="3.8" fill="url(#markNodeAmber)" filter="url(#markGlow)" />
      <circle cx="24" cy="25" r="1.6" fill="#ffffff" />

      <circle cx="12" cy="34" r="3.8" fill="url(#markNodeEmerald)" filter="url(#markGlow)" />
      <circle cx="12" cy="34" r="1.6" fill="#ffffff" />

      <circle cx="36" cy="34" r="3.8" fill="url(#markNodeCyan)" filter="url(#markGlow)" />
      <circle cx="36" cy="34" r="1.6" fill="#ffffff" />
    </svg>
  );
}

function Logo({
  size = "md",
  showSubtitle = true,
  to = "/",
  iconOnly = false,
  className = "",
  style = {},
}) {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
  };

  const titleSizes = {
    sm: "16px",
    md: "19px",
    lg: "24px",
  };

  const currentIconSize = iconSizes[size] || 36;
  const currentTitleSize = titleSizes[size] || "19px";

  const content = (
    <div
      className={`tv-logo-container ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        textDecoration: "none",
        userSelect: "none",
        ...style,
      }}
    >
      <LogoMark size={currentIconSize} />

      {!iconOnly && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontSize: currentTitleSize,
                fontWeight: "700",
                background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 60%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
              TrafficVision
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "800",
                color: "#38bdf8",
                background: "rgba(56, 189, 248, 0.15)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                padding: "2px 6px",
                borderRadius: "5px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              AI
            </span>
          </div>

          {showSubtitle && size !== "sm" && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: "600",
                color: "var(--text-muted, #94a3b8)",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              Smart Mobility Platform
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: "none", color: "inherit", display: "inline-flex" }}>
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
