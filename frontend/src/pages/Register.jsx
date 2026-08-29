import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import GoogleAuthButton from "../components/common/GoogleAuthButton";
import { sendRegisterOtp, verifyRegisterOtp, googleAuth, getCurrentUser } from "../services/auth";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  // Step 1: Details, Step 2: 2-Step OTP Verification
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [demoCode, setDemoCode] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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

  function calculatePasswordStrength(pass) {
    if (!pass) return { strength: 0, label: "None", className: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass) || /[A-Z]/.test(pass)) score += 1;

    if (score <= 1) return { strength: 25, label: "Weak", className: "weak" };
    if (score === 2) return { strength: 50, label: "Fair", className: "fair" };
    if (score === 3) return { strength: 75, label: "Good", className: "good" };
    return { strength: 100, label: "Strong", className: "strong" };
  }

  const pwdStrength = calculatePasswordStrength(formData.password);

  // Handle Step 1: Validate info and send OTP
  async function handleDetailsSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setInfoMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the Terms of Service to create an account.");
      return;
    }

    const disposableDomains = [
      "mailinator.com", "guerrillamail.com", "tempmail.com", "10minutemail.com",
      "throwawaymail.com", "temp-mail.org", "yopmail.com", "sharklasers.com",
      "dispostable.com", "trashmail.com", "fakemailgenerator.com", "fake.com",
      "test.com", "example.com", "asdf.com", "temp.com", "burnermail.io"
    ];

    const emailDomain = formData.email.split("@")[1]?.toLowerCase() || "";
    if (disposableDomains.some(d => emailDomain === d || emailDomain.endsWith("." + d))) {
      setErrorMessage("Registration with disposable or temporary email domains is not allowed. Please use a legitimate email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await sendRegisterOtp(formData.email);
      setStep(2);
      setResendTimer(60);
      setInfoMessage(`Verification OTP dispatched to ${formData.email}`);
      if (res.demo_code) setDemoCode(res.demo_code);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || "Could not dispatch verification code. Please try again."
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
      setOtp(pasteData.split(""));
      otpInputsRef.current[5]?.focus();
    }
  };

  // Handle Step 2: Verify OTP & Register
  async function handleVerifySubmit(e) {
    if (e) e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      await verifyRegisterOtp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        code: fullOtp,
      });

      setSuccessMessage("Public User account verified & created! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || "Invalid or expired verification code."
      );
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResend() {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res = await sendRegisterOtp(formData.email);
      setResendTimer(60);
      setInfoMessage(`A fresh verification code was sent to ${formData.email}`);
      if (res.demo_code) setDemoCode(res.demo_code);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  }

  // Google Sign-up
  async function handleGoogleSuccess(googlePayload) {
    setErrorMessage("");
    setLoading(true);

    try {
      const data = await googleAuth(googlePayload);
      localStorage.setItem("token", data.access_token);
      const user = data.user || (await getCurrentUser());
      localStorage.setItem("user", JSON.stringify(user));

      setSuccessMessage("Signed in with Google successfully! Redirecting...");
      setTimeout(() => {
        if (user.role === "admin") navigate("/admin");
        else if (user.role === "traffic_operator") navigate("/operator");
        else navigate("/commuter");
      }, 1000);
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
                <span>Citizen Transit Network</span>
              </div>

              <h2>Join Bengaluru's AI Traffic Intelligence Platform.</h2>
              <p className="hero-desc">
                Plan optimal routes, avoid heavy congestion bottlenecks, and receive real-time telemetry updates.
              </p>

              <div className="hero-features-list">
                <div className="hero-feature-item">
                  <div className="feature-icon-box">🗺️</div>
                  <div className="feature-text">
                    <h4>Real-Time Corridor Heatmaps</h4>
                    <p>Live congestion velocities across 18+ arterial junctions.</p>
                  </div>
                </div>

                <div className="hero-feature-item">
                  <div className="feature-icon-box">🔐</div>
                  <div className="feature-text">
                    <h4>2-Step OTP Security</h4>
                    <p>Secured accounts with automated email authentication.</p>
                  </div>
                </div>

                <div className="hero-feature-item">
                  <div className="feature-icon-box">🚨</div>
                  <div className="feature-text">
                    <h4>Emergency Incident Notifications</h4>
                    <p>Instant alerts when severe congestion or roadworks are detected.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-metrics-footer">
              <div className="metric-stat">
                <span className="num">100% Free</span>
                <span className="label">Citizen Portal</span>
              </div>
              <div className="metric-stat">
                <span className="num">Instant</span>
                <span className="label">Route Planner</span>
              </div>
              <div className="metric-stat">
                <span className="num">24/7</span>
                <span className="label">AI Telemetry</span>
              </div>
            </div>
          </div>

          {/* Right Form Pane */}
          <div className="auth-form-pane">
            {step === 1 ? (
              <>
                <div className="auth-header">
                  <h1>Create Account</h1>
                  <p>Register as a commuter for live navigation and detour alerts.</p>
                </div>

                {/* Google OAuth Quick Sign Up */}
                <div style={{ marginBottom: "18px" }}>
                  <GoogleAuthButton
                    onGoogleSuccess={handleGoogleSuccess}
                    onError={() => setErrorMessage("Google registration was cancelled or failed.")}
                    disabled={loading}
                    label="Sign up with Google"
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
                  <span>Or register with email</span>
                  <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
                </div>

                {errorMessage && (
                  <div className="auth-alert-banner error">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleDetailsSubmit} className="auth-form">
                  <div className="input-field-group">
                    <label htmlFor="name">Full Name</label>
                    <div className="input-box-wrapper">
                      <span className="field-icon">👤</span>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

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

                  <div className="input-field-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-box-wrapper">
                      <span className="field-icon">🔒</span>
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="••••••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-options-row">
                    <label className="remember-checkbox-label">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        required
                      />
                      <span>I agree to the Terms of Service & Privacy Policy</span>
                    </label>
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="btn-spinner"></span>
                        <span>Sending Security OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Verification</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-switch-footer">
                  <span>Already have an account?</span>
                  <Link to="/login">Sign In</Link>
                </div>
              </>
            ) : (
              /* Step 2: 2-Step OTP Verification */
              <>
                <div className="auth-header">
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--primary-light)", padding: "4px 12px", borderRadius: "14px", color: "var(--primary)", fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>
                    🔒 2-Step Account Verification
                  </div>
                  <h1>Verify Your Email</h1>
                  <p>
                    We sent a 6-digit verification code to <strong>{formData.email}</strong>. Enter it below to activate your account.
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

                {successMessage && (
                  <div className="auth-alert-banner success">
                    <span>✓</span>
                    <span>{successMessage}</span>
                  </div>
                )}

                <form onSubmit={handleVerifySubmit} className="auth-form">
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
                        <span>Verifying & Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Registration</span>
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
                      ← Back to details
                    </button>

                    <button
                      type="button"
                      onClick={handleResend}
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

export default Register;