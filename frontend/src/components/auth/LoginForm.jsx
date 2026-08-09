import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    FaEye,
    FaEyeSlash,
    FaArrowRight
} from "react-icons/fa";

import AuthService from "../../services/authService";
import Button from "../ui/Button";


function LoginForm() {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });


    function handleChange(event) {

        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });

    }


    async function handleSubmit(event) {

        event.preventDefault();

        setLoading(true);
        setError("");

        try {

            await AuthService.login(formData);

            navigate("/dashboard");

        }

        catch (err) {

            console.error(err);

            setError(
                "Unable to login. Please check your email and password."
            );

        }

        finally {

            setLoading(false);

        }

    }


    return (
        <form
            onSubmit={handleSubmit}
            className="w-full"
        >

            {/* ERROR */}

            {error && (

                <div
                    className="
                        mb-6
                        rounded-xl
                        border
                        border-red-200
                        bg-red-50
                        px-4
                        py-3
                        text-sm
                        text-red-600
                    "
                >
                    {error}
                </div>

            )}


            {/* EMAIL */}

            <div>

                <label
                    htmlFor="email"
                    className="
                        block
                        text-sm
                        font-semibold
                        text-slate-800
                    "
                >
                    Email address
                </label>


                <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    className="
                        mt-2
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        focus:border-blue-500
                        focus:bg-white
                        focus:ring-4
                        focus:ring-blue-500/10
                    "
                />

            </div>


            {/* PASSWORD */}

            <div className="mt-7">

                <label
                    htmlFor="password"
                    className="
                        block
                        text-sm
                        font-semibold
                        text-slate-800
                    "
                >
                    Password
                </label>


                <div className="relative mt-2">

                    <input
                        id="password"
                        name="password"
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        className="
                            h-12
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            px-4
                            pr-12
                            text-sm
                            text-slate-900
                            outline-none
                            transition
                            focus:border-blue-500
                            focus:bg-white
                            focus:ring-4
                            focus:ring-blue-500/10
                        "
                    />


                    <button
                        type="button"
                        onClick={() =>
                            setShowPassword(!showPassword)
                        }
                        className="
                            absolute
                            right-4
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                            hover:text-slate-700
                        "
                    >

                        {showPassword
                            ? <FaEyeSlash />
                            : <FaEye />
                        }

                    </button>

                </div>

            </div>


            {/* REMEMBER + FORGOT */}

            <div
                className="
                    mt-5
                    flex
                    items-center
                    justify-between
                "
            >

                <label
                    className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-slate-500
                    "
                >

                    <input
                        type="checkbox"
                        className="
                            h-4
                            w-4
                            accent-blue-600
                        "
                    />

                    Remember me

                </label>


                <button
                    type="button"
                    className="
                        text-sm
                        font-semibold
                        text-blue-600
                        hover:text-blue-700
                    "
                >
                    Forgot password?
                </button>

            </div>


            {/* BUTTON */}

            <div className="mt-7">

                <Button
                    type="submit"
                    disabled={loading}
                    className="
                        h-12
                        w-full
                        rounded-xl
                        bg-blue-600
                        text-white
                        shadow-[0_10px_25px_rgba(37,99,235,0.20)]
                        transition
                        hover:bg-blue-700
                    "
                >

                    <span
                        className="
                            flex
                            items-center
                            justify-center
                            gap-3
                        "
                    >

                        {loading
                            ? "Signing in..."
                            : "Sign in"
                        }

                        {!loading && (
                            <FaArrowRight className="text-xs" />
                        )}

                    </span>

                </Button>

            </div>


            {/* REGISTER */}

            <p
                className="
                    mt-5
                    text-center
                    text-sm
                    text-slate-500
                "
            >

                Don't have an account?

                <Link
                    to="/register"
                    className="
                        ml-1
                        font-semibold
                        text-blue-600
                        hover:text-blue-700
                    "
                >
                    Create an account
                </Link>

            </p>

        </form>
    );
}

export default LoginForm;