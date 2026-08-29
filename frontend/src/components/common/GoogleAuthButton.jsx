import { useState } from "react";

function GoogleAuthButton({ onGoogleSuccess, disabled = false, label = "Continue with Google" }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleClick = () => {
    if (disabled || loading) return;
    setLoading(true);

    // Prompt or simulated instant Google account profile selector
    const simulatedGoogleEmail = `user.${Math.floor(1000 + Math.random() * 9000)}@gmail.com`;
    const userPrompt = window.prompt(
      "Enter your Google Account Email for OAuth sign-in:",
      simulatedGoogleEmail
    );

    if (!userPrompt || !userPrompt.includes("@")) {
      setLoading(false);
      return;
    }

    const googlePayload = {
      email: userPrompt.trim().toLowerCase(),
      name: userPrompt.split("@")[0].replace(".", " ").toUpperCase(),
      google_id: `g_oauth_${Date.now()}`,
    };

    onGoogleSuccess(googlePayload);
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={disabled || loading}
      style={{
        width: "100%",
        height: "46px",
        backgroundColor: "var(--bg-surface)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.borderColor = "#4285F4";
          e.currentTarget.style.backgroundColor = "var(--bg-surface-secondary)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-color)";
        e.currentTarget.style.backgroundColor = "var(--bg-surface)";
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
  );
}

export default GoogleAuthButton;
