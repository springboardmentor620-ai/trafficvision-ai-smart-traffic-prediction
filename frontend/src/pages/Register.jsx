import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import GoogleAuthButton from "../components/common/GoogleAuthButton";
import { register, googleAuth, getCurrentUser } from "../services/auth";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  // Handle Direct Registration Submit
  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!formData.email || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the Terms of Service to create an account.");
      return;
    }

    setLoading(true);

    try {
      const data = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        const user = data.user || {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role || "commuter",
        };
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/commuter");
      } else {
        setSuccessMessage("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 1200);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || "Registration failed. Please check your details and try again."
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

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "traffic_operator") {
        navigate("/operator");
      } else {
        navigate("/commuter");
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Google registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PublicNavbar />

      <div className="register-page-wrapper">
        <div className="register-split-container">
          {/* Left Hero Pane */}
          <div className="register-hero-pane">
            <div>
              <div className="hero-badge-pill">
                <span className="pulse-beacon"></span>
                <span>Next-Gen Transit Infrastructure</span>
              </div>

              <h2>Join the AI Traffic Network.</h2>
              <p className="hero-desc">
                Register as a city commuter or municipal stakeholder to access live congestion maps, autonomous route recommendations, and telemetry analytics.
              </p>

              <div className="hero-features-list">
                <div className="hero-feature-item">
                  <div className="feature-icon-box">🗺️</div>
                  <div className="feature-text">
                    <h4>Live Congestion Heatmaps</h4>
                    <p>Real-time visual velocity mapping across all 18+ arterial corridors.</p>
                  </div>
                </div>

                <div className="hero-feature-item">
                  <div className="feature-icon-box">⚡</div>
                  <div className="feature-text">
                    <h4>Dynamic Route Optimization</h4>
                    <p>Sub-second detour planning tailored around live bottlenecks and roadwork.</p>
                  </div>
                </div>

                <div className="hero-feature-item">
                  <div className="feature-icon-box">🛡️</div>
                  <div className="feature-text">
                    <h4>Fast & Secure Access</h4>
                    <p>Protected with industry-standard encryption and 1-click Google OAuth.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-metrics-footer">
              <div className="metric-stat">
                <span className="num">Instant</span>
                <span className="label">Account Setup</span>
              </div>
              <div className="metric-stat">
                <span className="num">Google</span>
                <span className="label">1-Click Sign In</span>
              </div>
              <div className="metric-stat">
                <span className="num">100% Free</span>
                <span className="label">Public Access</span>
              </div>
            </div>
          </div>

          {/* Right Form Pane */}
          <div className="register-form-pane">
            <div className="register-header">
              <h1>Create Your Account</h1>
              <p>Sign up to start navigating with AI-powered traffic intelligence.</p>
            </div>

            {/* Google OAuth Quick Sign Up */}
            <div style={{ marginBottom: "18px" }}>
              <GoogleAuthButton
                onGoogleSuccess={handleGoogleSuccess}
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
              <div className="register-alert-banner error">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="register-alert-banner success">
                <span>✅</span>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="register-form">
              <div className="input-field-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-box-wrapper">
                  <span className="field-icon">👤</span>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Jane Doe"
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
                    placeholder="jane.doe@example.com"
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
                    placeholder="Create a strong password (min 6 chars)"
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

                {formData.password && (
                  <div className="pwd-strength-container">
                    <div className="pwd-strength-bar-bg">
                      <div
                        className={`pwd-strength-bar-fill ${pwdStrength.className}`}
                        style={{ width: `${pwdStrength.strength}%` }}
                      ></div>
                    </div>
                    <span className="pwd-strength-label">
                      Strength: <strong>{pwdStrength.label}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="input-field-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-box-wrapper">
                  <span className="field-icon">🔐</span>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="terms-checkbox-group">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label htmlFor="agreeTerms">
                  I agree to the <a href="#!">Terms of Service</a> and <a href="#!">Privacy Policy</a>.
                </label>
              </div>

              <button type="submit" className="register-submit-btn" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account & Start →"}
              </button>
            </form>

            <div className="register-footer-prompt">
              <span>Already have an account? </span>
              <Link to="/login">Sign in here</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;