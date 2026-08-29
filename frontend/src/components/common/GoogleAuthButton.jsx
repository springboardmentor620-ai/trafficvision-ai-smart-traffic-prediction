import { useState } from "react";

function GoogleAuthButton({ onGoogleSuccess, disabled = false, label = "Continue with Google" }) {
  const [showModal, setShowModal] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const presetAccounts = [
    {
      name: "Alex Turner",
      email: "alex.turner@gmail.com",
      avatarBg: "#4285F4",
    },
    {
      name: "Priya Sharma",
      email: "priya.sharma@gmail.com",
      avatarBg: "#34A853",
    },
    {
      name: "David Chen",
      email: "david.chen@gmail.com",
      avatarBg: "#EA4335",
    },
  ];

  const handleSelectAccount = async (account) => {
    setLoading(true);
    setError("");
    try {
      const sanitizedId = account.email.replace(/[^a-zA-Z0-9]/g, "_");
      await onGoogleSuccess({
        email: account.email.trim().toLowerCase(),
        name: account.name.trim(),
        google_id: `g_oauth_${sanitizedId}`,
      });
      setShowModal(false);
    } catch (err) {
      setError(err?.response?.data?.detail || "Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@")) {
      setError("Please enter a valid Google email address.");
      return;
    }
    const derivedName = customName.trim() || customEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase());
    await handleSelectAccount({
      email: customEmail,
      name: derivedName,
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!disabled && !loading) {
            setError("");
            setShowModal(true);
          }
        }}
        disabled={disabled || loading}
        style={{
          width: "100%",
          height: "46px",
          backgroundColor: "var(--bg-surface, #ffffff)",
          color: "var(--text-primary, #0f172a)",
          border: "1px solid var(--border-color, #e2e8f0)",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          cursor: disabled || loading ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
        }}
        onMouseEnter={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.borderColor = "#4285F4";
            e.currentTarget.style.backgroundColor = "var(--bg-surface-secondary, #f8fafc)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-color, #e2e8f0)";
          e.currentTarget.style.backgroundColor = "var(--bg-surface, #ffffff)";
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{loading ? "Connecting to Google..." : label}</span>
      </button>

      {/* Google Account Selector Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) setShowModal(false);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "var(--bg-surface, #ffffff)",
              borderRadius: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              border: "1px solid var(--border-color, #e2e8f0)",
              overflow: "hidden",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "24px 24px 16px",
                borderBottom: "1px solid var(--border-color, #e2e8f0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "var(--text-primary, #0f172a)",
                    }}
                  >
                    Sign in with Google
                  </h3>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary, #64748b)" }}>
                    Choose an account to continue to TrafficVision AI
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "var(--text-secondary, #94a3b8)",
                  lineHeight: "1",
                  padding: "4px",
                }}
              >
                ✕
              </button>
            </div>

            {error && (
              <div
                style={{
                  margin: "16px 24px 0",
                  padding: "10px 14px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "8px",
                  color: "#ef4444",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                {error}
              </div>
            )}

            {/* Quick Demo Accounts */}
            <div style={{ padding: "16px 24px 8px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--text-secondary, #64748b)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "10px",
                }}
              >
                Instant 1-Click Google Accounts
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {presetAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    disabled={loading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color, #e2e8f0)",
                      backgroundColor: "var(--bg-surface, #ffffff)",
                      cursor: loading ? "not-allowed" : "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = "var(--bg-surface-secondary, #f8fafc)";
                        e.currentTarget.style.borderColor = "#4285F4";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--bg-surface, #ffffff)";
                      e.currentTarget.style.borderColor = "var(--border-color, #e2e8f0)";
                    }}
                  >
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        backgroundColor: acc.avatarBg,
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      {acc.name.charAt(0)}
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "var(--text-primary, #0f172a)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {acc.name}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary, #64748b)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {acc.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Google Email Form */}
            <form onSubmit={handleCustomSubmit} style={{ padding: "12px 24px 24px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--text-secondary, #64748b)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "10px",
                }}
              >
                Or Enter Your Google Email
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  disabled={loading}
                  required
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #e2e8f0)",
                    backgroundColor: "var(--bg-input, #ffffff)",
                    color: "var(--text-primary, #0f172a)",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
                <input
                  type="text"
                  placeholder="Your Full Name (Optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #e2e8f0)",
                    backgroundColor: "var(--bg-input, #ffffff)",
                    color: "var(--text-primary, #0f172a)",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !customEmail}
                  style={{
                    height: "42px",
                    backgroundColor: "#4285F4",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: loading || !customEmail ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {loading ? "Authenticating with Google..." : "Continue with this Account →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default GoogleAuthButton;
