import { useState } from "react";
import PublicNavbar from "../components/PublicNavbar";
import { register } from "../services/auth";
import "../styles/Register.css";

function Register() {
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "traffic_operator",
  });
  
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      const response = await register(userData);

      console.log(response);

      alert("Registration successful!");

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
        "Registration failed."
      );
    }
  }

  return (
    <>
      <PublicNavbar />

      <div className="register-container">
        <div className="register-card">

          <h1>Create Account</h1>

          <p>
            Join TrafficVision AI and start monitoring traffic smarter.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Role</label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="traffic_operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit">
              Create Account
            </button>

          </form>

        </div>
      </div>
    </>
  );
}

export default Register;