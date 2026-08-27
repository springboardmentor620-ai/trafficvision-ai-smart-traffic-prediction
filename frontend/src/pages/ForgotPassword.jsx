import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import { forgotPassword, resetPassword } from "../services/auth";
import "../styles/Login.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [resendTimer, setResendTimer] = useState(60);
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

  // Step 1: Submit email to receive OTP
  async function handleEmailSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(email);
      setStep(2);
      setResendTimer(60);
      setInfoMessage(`Password reset code dispatched to ${email}`);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || "Could not dispatch reset code. Please check your email."
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

  // Step 2: Submit OTP & New Password
  async function handleResetSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of your reset code.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, fullOtp, newPassword);
      setSuccessMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || "Invalid or expired reset code. Please try again."
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
      await forgotPassword(email);
      setResendTimer(60);
      setInfoMessage(`A fresh reset code was sent to ${email}`);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Failed to resend reset code.");
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
                <span>Account Recovery</span>
              </div>

              <h2>Reset Your Account Password.</h2>
              <p className="hero-desc">
                Secure 2-Step OTP email verification allows you to regain immediate access to your TrafficVision AI portal.
              </p>

              <div className="hero-features-list">
                <div className="hero-feature-item">
                  <div className="feature-icon-box">✉️</div>
                  <div className="feature-text">
                    <h4>Direct Email Dispatch</h4>
                    <p>6-digit cryptographic security code sent to your registered inbox.</p>
                  </div>
                </div>

                <div className="hero-feature-item">
                  <div className="feature-icon-box">🔒</div>
                  <div className="feature-text">
                    <h4>Instant Credential Refresh</h4>
                    <p>Immediate password update with SHA-256 / bcrypt security.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-metrics-footer">
              <div className="metric-stat">
                <span className="num">5 Min</span>
                <span className="label">Code Expiry</span>
              </div>
              <div className="metric-stat">
                <span className="num">TLS / SSL</span>
                <span className="label">Encrypted Dispatch</span>
              </div>
            </div>
          </div>

          {/* Right Form Pane */}
          <div className="auth-form-pane">
            {step === 1 ? (
              <>
                <div className="auth-header">
                  <h1>Forgot Password</h1>
                  <p>Enter your registered account email to receive a password reset code.</p>
                </div>

                {errorMessage && (
                  <div className="auth-alert-banner error">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleEmailSubmit} className="auth-form">
                  <div className="input-field-group">
                    <label htmlFor="reset-email">Email Address</label>
                    <div className="input-box-wrapper">
                      <span className="field-icon">✉️</span>
                      <input
                        id="reset-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => {
                          setErrorMessage("");
                          setEmail(e.target.value);
                        }}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="btn-spinner"></span>
                        <span>Dispatching Reset Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Password Reset Code</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-switch-footer">
                  <span>Remember your password?</span>
                  <Link to="/login">Back to Sign In</Link>
                </div>
              </>
            ) : (
              /* Step 2: OTP Verification & New Password */
              <>
                <div className="auth-header">
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--primary-light)", padding: "4px 12px", borderRadius: "14px", color: "var(--primary)", fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>
                    🔒 Reset Verification
                  </div>
                  <h1>Set New Password</h1>
                  <p>
                    Enter the 6-digit code sent to <strong>{email}</strong> and choose a new password.
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

                <form onSubmit={handleResetSubmit} className="auth-form">
                  {/* 6-Digit OTP Box Grid */}
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                    Verification Code
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "space-between",
                      margin: "8px 0 18px 0",
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
                          height: "54px",
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

                  <div className="input-field-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="input-box-wrapper">
                      <span className="field-icon">🔒</span>
                      <input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                    <label htmlFor="confirmNewPassword">Confirm New Password</label>
                    <div className="input-box-wrapper">
                      <span className="field-icon">🔒</span>
                      <input
                        id="confirmNewPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loading || otp.join("").length < 6}>
                    {loading ? (
                      <>
                        <span className="btn-spinner"></span>
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Password & Sign In</span>
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
                      ← Re-enter email
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

export default ForgotPassword;
