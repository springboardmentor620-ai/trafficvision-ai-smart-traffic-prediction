import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import GoogleAuthButton from "../components/common/GoogleAuthButton";
import { loginStep1, loginVerifyOtp, googleAuth, getCurrentUser } from "../services/auth";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  // Step 1: Credentials, Step 2: 2-Step OTP Verification
  const [step, setStep] = useState(1);

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

  // Handle Step 1: Credentials Check & Send OTP
  async function handleCredentialsSubmit(e) {
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

    // Auto-advance focus to next input
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

  // Handle Step 2: Verify OTP
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

  // Handle Resend OTP
  async function handleResendOtp() {
    if (resendTimer > 0) return;
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await loginStep1(formData.email, formData.password);
      setResendTimer(60);
      setInfoMessage(`A fresh verification code was dispatched to ${formData.email}`);
      if (res.demo_code) setDemoCode(res.demo_code);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Failed to resend verification code.");
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

  function redirectByRole(role) {
    if (role === "admin") {
      navigate("/admin");
    } else if (role === "traffic_operator") {
      navigate("/operator");
    } else if (role === "commuter") {
      navigate("/commuter");
    } else {
      setErrorMessage("Unknown user role received from server.");
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
                  <div className="feature-icon-box">🔒</div>
                  <div className="feature-text">
                    <h4>2-Step Security Verification</h4>
                    <p>Multi-factor OTP protection with automated SMTP alert dispatching.</p>
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
                <span className="num">2FA / OTP</span>
                <span className="label">Access Security</span>
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
                  <GoogleAuthButton
                    onGoogleSuccess={handleGoogleSuccess}
                    onError={() => setErrorMessage("Google sign-in was cancelled or failed.")}
                    disabled={loading}
                  />
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

                {errorMessage && (
                  <div className="auth-alert-banner error">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleCredentialsSubmit} className="auth-form">
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
                        placeholder="••••••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-visibility-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "👁️‍🗨️" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div className="auth-options-row">
                    <label className="remember-checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Remember this device</span>
                    </label>
                    <Link to="/forgot-password" className="forgot-link">
                      Forgot password?
                    </Link>
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="btn-spinner"></span>
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to 2-Step Verification</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-switch-footer">
                  <span>Don't have an account?</span>
                  <Link to="/register">Create a Public User Account</Link>
                </div>
              </>
            ) : (
              /* Step 2: 2-Step OTP Verification Form */
              <>
                <div className="auth-header">
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--primary-light)", padding: "4px 12px", borderRadius: "14px", color: "var(--primary)", fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>
                    🔒 2-Step Verification
                  </div>
                  <h1>Enter 6-Digit Code</h1>
                  <p>
                    We sent a security code to <strong>{formData.email}</strong>. Enter it below to complete sign-in.
                  </p>
                </div>

                {infoMessage && (
                  <div style={{ padding: "10px 14px", backgroundColor: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: "8px", color: "var(--success)", fontSize: "13px", fontWeight: "600", marginBottom: "16px" }}>
                    {infoMessage}
                  </div>
                )}

                {errorMessage && (
                  <div className="auth-alert-banner error">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleOtpSubmit} className="auth-form">
                  {/* 6-Digit OTP Box Grid */}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "space-between",
                      margin: "12px 0 24px 0",
                    }}
                    onPaste={handleOtpPaste}
                  >
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        style={{
                          width: "48px",
                          height: "56px",
                          textAlign: "center",
                          fontSize: "22px",
                          fontWeight: "800",
                          borderRadius: "10px",
                          border: digit ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                          backgroundColor: "var(--bg-input)",
                          color: "var(--text-primary)",
                          outline: "none",
                          boxShadow: digit ? "0 0 0 3px var(--primary-light)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      />
                    ))}
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loading || otp.join("").length < 6}>
                    {loading ? (
                      <>
                        <span className="btn-spinner"></span>
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Access Dashboard</span>
                        <span>✓</span>
                      </>
                    )}
                  </button>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", fontSize: "13px" }}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", textDecoration: "underline" }}
                    >
                      ← Back to credentials
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || loading}
                      style={{
                        background: "none",
                        border: "none",
                        color: resendTimer > 0 ? "var(--text-muted)" : "var(--primary)",
                        cursor: resendTimer > 0 ? "not-allowed" : "pointer",
                        fontWeight: "600",
                      }}
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code ✉️"}
                    </button>
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