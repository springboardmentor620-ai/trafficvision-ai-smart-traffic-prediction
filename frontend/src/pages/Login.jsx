import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import GoogleAuthButton from "../components/common/GoogleAuthButton";
import { login, loginStep1, loginVerifyOtp, googleAuth, getCurrentUser } from "../services/auth";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  // Mode: "direct" (Instant Password Login) or "2fa" (2-Step Email OTP Login)
  const [authMode, setAuthMode] = useState("direct");
  const [step, setStep] = useState(1); // 1: email/password, 2: OTP code (only for 2fa mode)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [demoCode, setDemoCode] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const otpInputsRef = useRef([]);

  useEffect(() => {
    let timer;
    if (step === 2 && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  function handleChange(e) {
    setErrorMessage("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function redirectByRole(role) {
    if (role === "admin") {
      navigate("/admin");
    } else if (role === "traffic_operator") {
      navigate("/operator");
    } else if (role === "commuter") {
      navigate("/commuter");
    } else {
      navigate("/commuter");
    }
  }

  // Handle Quick Demo One-Click Login
  const handleQuickLogin = async (email, password) => {
    setFormData({ email, password });
    setErrorMessage("");
    setInfoMessage("");
    setLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access_token);

      const user = data.user || (await getCurrentUser());
      localStorage.setItem("user", JSON.stringify(user));

      redirectByRole(user.role);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || "Could not sign in with demo credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Direct Standard Password Login (Default)
  async function handleDirectSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      localStorage.setItem("token", data.access_token);

      const user = data.user || (await getCurrentUser());
      localStorage.setItem("user", JSON.stringify(user));

      redirectByRole(user.role);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || "Invalid email address or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // 2-Step OTP Step 1
  async function handle2FAStep1(e) {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    setLoading(true);

    try {
      const res = await loginStep1(formData.email, formData.password);
      setStep(2);
      setResendTimer(60);
      setInfoMessage(`Security OTP code sent to ${formData.email}`);
      if (res.demo_code) {
        setDemoCode(res.demo_code);
      }
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || "Invalid email address or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Handle OTP Inputs
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split("");
      setOtp(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  // 2-Step OTP Step 2
  async function handleOtpSubmit(e) {
    if (e) e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of your verification code.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const data = await loginVerifyOtp(formData.email, fullOtp);
      localStorage.setItem("token", data.access_token);

      const user = data.user || (await getCurrentUser());
      localStorage.setItem("user", JSON.stringify(user));

      redirectByRole(user.role);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || "Invalid or expired verification code."
      );
    } finally {
      setLoading(false);
    }
  }

  // Handle Google OAuth
  async function handleGoogleSuccess(googlePayload) {
    setErrorMessage("");
    setLoading(true);

    try {
      const data = await googleAuth(googlePayload);
      localStorage.setItem("token", data.access_token);

      const user = data.user || (await getCurrentUser());
      localStorage.setItem("user", JSON.stringify(user));

      redirectByRole(user.role);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PublicNavbar />

      <div className="auth-page-wrapper">
        <div className="auth-split-container">
          {/* Left Hero Pane */}
          <div className="auth-hero-pane">
            <div>
              <div className="hero-badge-pill">
                <span className="pulse-beacon"></span>
                <span>AI Urban Mobility Platform</span>
              </div>

              <h2>Intelligent Traffic Forecasting at Scale.</h2>
              <p className="hero-desc">
                Real-time machine learning predictions, autonomous congestion rerouting, and unified city telemetry.
              </p>

              <div className="hero-features-list">
                <div className="hero-feature-item">
                  <div className="feature-icon-box">🧠</div>
                  <div className="feature-text">
                    <h4>Predictive Congestion Models</h4>
                    <p>Accurate 15-60 minute forecasts with ML traffic flow intelligence.</p>
                  </div>
                </div>

                <div className="hero-feature-item">
                  <div className="feature-icon-box">⚡</div>
                  <div className="feature-text">
                    <h4>Instant 1-Click Access</h4>
                    <p>Direct login with password, Google Identity, or optional 2FA verification.</p>
                  </div>
                </div>

                <div className="hero-feature-item">
                  <div className="feature-icon-box">🌐</div>
                  <div className="feature-text">
                    <h4>Role-Based Operations</h4>
                    <p>Tailored portals for City Admins, Traffic Operators & Public Users.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-metrics-footer">
              <div className="metric-stat">
                <span className="num">Random Forest</span>
                <span className="label">Predictive Engine</span>
              </div>
              <div className="metric-stat">
                <span className="num">Google OAuth</span>
                <span className="label">Identity Provider</span>
              </div>
              <div className="metric-stat">
                <span className="num">18+</span>
                <span className="label">Monitored Junctions</span>
              </div>
            </div>
          </div>

          {/* Right Form Pane */}
          <div className="auth-form-pane">
            {step === 1 ? (
              <>
                <div className="auth-header">
                  <h1>Welcome Back</h1>
                  <p>Sign in with your credentials to access your traffic portal.</p>
                </div>

                {/* Google OAuth Quick Sign In */}
                <div style={{ marginBottom: "18px" }}>
                  <GoogleAuthButton onGoogleSuccess={handleGoogleSuccess} disabled={loading} />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    margin: "18px 0",
                    color: "var(--text-muted)",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
                  <span>Or sign in with email</span>
                  <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
                </div>

                {/* Quick Demo Role Logins */}
                <div style={{ marginBottom: "18px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "8px",
                      textAlign: "center",
                    }}
                  >
                    🚀 Instant 1-Click Demo Logins
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("admin@trafficvision.ai", "password123")}
                      disabled={loading}
                      style={{
                        padding: "8px 4px",
                        fontSize: "12px",
                        fontWeight: "700",
                        borderRadius: "8px",
                        border: "1px solid #3b82f6",
                        backgroundColor: "rgba(59, 130, 246, 0.08)",
                        color: "#3b82f6",
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      👑 Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("operator@trafficvision.ai", "password123")}
                      disabled={loading}
                      style={{
                        padding: "8px 4px",
                        fontSize: "12px",
                        fontWeight: "700",
                        borderRadius: "8px",
                        border: "1px solid #10b981",
                        backgroundColor: "rgba(16, 185, 129, 0.08)",
                        color: "#10b981",
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      🚦 Operator
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("user@trafficvision.ai", "password123")}
                      disabled={loading}
                      style={{
                        padding: "8px 4px",
                        fontSize: "12px",
                        fontWeight: "700",
                        borderRadius: "8px",
                        border: "1px solid #8b5cf6",
                        backgroundColor: "rgba(139, 92, 246, 0.08)",
                        color: "#8b5cf6",
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      🚗 Commuter
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="auth-alert-banner error">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={authMode === "2fa" ? handle2FAStep1 : handleDirectSubmit} className="auth-form">
                  <div className="input-field-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-box-wrapper">
                      <span className="field-icon">✉️</span>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-field-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-box-wrapper">
                      <span className="field-icon">🔒</span>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      margin: "6px 0 16px",
                      fontSize: "13px",
                    }}
                  >
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "var(--text-secondary)" }}>
                      <input
                        type="checkbox"
                        checked={authMode === "2fa"}
                        onChange={(e) => setAuthMode(e.target.checked ? "2fa" : "direct")}
                        style={{ cursor: "pointer" }}
                      />
                      <span>Require 2-Step OTP Code</span>
                    </label>

                    <Link
                      to="/forgot-password"
                      style={{
                        color: "var(--accent-color)",
                        textDecoration: "none",
                        fontWeight: "500",
                      }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? "Signing in..." : authMode === "2fa" ? "Send Security OTP →" : "Sign In to Dashboard →"}
                  </button>
                </form>

                <div className="auth-footer-prompt">
                  <span>Don't have an account? </span>
                  <Link to="/register">Create an account</Link>
                </div>
              </>
            ) : (
              /* Step 2: Enter 6-Digit OTP */
              <>
                <div className="auth-header">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMessage("");
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--accent-color)",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer",
                      padding: "0 0 12px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    ← Back to credentials
                  </button>
                  <h1>Two-Step Verification</h1>
                  <p>
                    Enter the 6-digit security code dispatched to <strong>{formData.email}</strong>.
                  </p>
                </div>

                {infoMessage && (
                  <div className="auth-alert-banner info">
                    <span>📩</span>
                    <span>{infoMessage}</span>
                  </div>
                )}

                {demoCode && (
                  <div
                    style={{
                      margin: "12px 0 16px",
                      padding: "10px 14px",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                      Demo Code: <strong style={{ color: "var(--accent-color)", letterSpacing: "2px" }}>{demoCode}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtp(demoCode.split(""));
                        otpInputsRef.current[5]?.focus();
                      }}
                      style={{
                        background: "var(--accent-color)",
                        color: "#fff",
                        border: "none",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                {errorMessage && (
                  <div className="auth-alert-banner error">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleOtpSubmit} className="auth-form">
                  <div style={{ margin: "16px 0 24px" }}>
                    <label style={{ display: "block", marginBottom: "10px", fontSize: "13px", fontWeight: "600" }}>
                      Security Verification Code
                    </label>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                      onPaste={handleOtpPaste}
                    >
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputsRef.current[index] = el)}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          style={{
                            width: "48px",
                            height: "54px",
                            textAlign: "center",
                            fontSize: "20px",
                            fontWeight: "700",
                            borderRadius: "10px",
                            border: "2px solid var(--border-color)",
                            backgroundColor: "var(--bg-surface)",
                            color: "var(--text-primary)",
                            outline: "none",
                            transition: "all 0.2s ease",
                          }}
                          onFocus={(e) => (e.target.style.borderColor = "var(--accent-color)")}
                          onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
                        />
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? "Verifying..." : "Verify & Sign In →"}
                  </button>

                  <div style={{ textAlign: "center", marginTop: "18px", fontSize: "13px" }}>
                    {resendTimer > 0 ? (
                      <span style={{ color: "var(--text-muted)" }}>
                        Resend code in <strong>{resendTimer}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handle2FAStep1}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--accent-color)",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        Resend Verification Code
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;