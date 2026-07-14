import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

console.log("NEW LOGIN CODE RUNNING");

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const login = async () => {
        try {
            const formData = new URLSearchParams({
                username: email,
                password: password
            });

            const response = await api.post(
                "/auth/login",
                formData.toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            // Save JWT token
            localStorage.setItem(
                "access_token",
                response.data.access_token
            );

            localStorage.setItem(
                "role",
                response.data.role
            );

            localStorage.setItem(
                "role",
                response.data.role
            );

            toast.success("Login Successful!");

            navigate("/dashboard");

        } catch (error) {
            console.log(error.response);

            if (error.response) {
                console.log(error.response.data);
                alert(JSON.stringify(error.response.data));
            } else {
                console.log(error);
            }
        }
    };

    return (
        <div style={{ marginTop: "80px", textAlign: "center" }}>
            <h1>🚦 TrafficVision AI</h1>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <br /><br />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <br /><br />

            <button onClick={login}>
                Login
            </button>
        </div>
    );
}

export default Login;