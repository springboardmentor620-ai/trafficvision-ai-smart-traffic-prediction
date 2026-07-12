import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "traffic_operator"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/register",
        formData
      );

      if (response.data.success) {
        alert(response.data.message);
        navigate("/login");
      } else {
        alert(response.data.message);
      }

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Unable to register. Please try again."
      );
    }
  };

  return (
    <div className="register-page">

      <div className="register-container">

        <div className="register-left">
          <h1>Create Account</h1>
          <p>Register to access TrafficVision AI.</p>
        </div>

        <div className="register-right">

          <h2>Register</h2>

          <form onSubmit={handleSubmit}>

            <label>Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="(example@gmail.com)"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit">
              Create Account
            </button>

          </form>

          <p>
            Already have an account?
            <Link to="/login"> Login</Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;