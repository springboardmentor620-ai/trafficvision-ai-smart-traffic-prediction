import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("access_token");
        navigate("/");
    };

    return (
        <div
            style={{
                background: "#2563eb",
                padding: "15px",
                display: "flex",
                gap: "25px",
                alignItems: "center",
                color: "white"
            }}
        >
            <Link
                to="/dashboard"
                style={{ color: "white", textDecoration: "none" }}
            >
                Dashboard
            </Link>

            <Link
                to="/traffic/add"
                style={{ color: "white", textDecoration: "none" }}
            >
                Add Traffic
            </Link>

            <Link
                to="/traffic/list"
                style={{ color: "white", textDecoration: "none" }}
            >
                Traffic Records
            </Link>

            <button
                onClick={logout}
                style={{
                    marginLeft: "auto",
                    cursor: "pointer",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "5px",
                    background: "#dc2626",
                    color: "white"
                }}
            >
                Logout
            </button>
        </div>
    );
}

export default Navbar;