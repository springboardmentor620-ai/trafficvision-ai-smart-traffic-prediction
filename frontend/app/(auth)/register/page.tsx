"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../../services/api";

export default function RegisterPage() {
  const router = useRouter();

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const response = await registerUser({
      full_name,
      email,
      password,
    });

    if (response.email) {
      alert("Registration Successful");
      router.push("/login");
    } else {
      alert(response.detail || "Registration Failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-96">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
          TrafficVision AI
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Create Your Account
        </p>

        <form onSubmit={handleRegister} className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full border rounded-lg p-3 text-black"
            value={full_name}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg p-3 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg p-3 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3"
          >
            Register
          </button>

        </form>
      </div>
    </div>
  );
}