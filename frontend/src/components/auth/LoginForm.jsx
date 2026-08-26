import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
    FaEye,
    FaEyeSlash,
    FaArrowRight
} from "react-icons/fa";

import AuthService from "../../services/authService";
import Button from "../ui/Button";


function LoginForm() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const selectedRole = searchParams.get("role");

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

            const data = await AuthService.login(formData);

            /*
             * The backend response is the source of truth
             * for the user's actual role.
             */

            const actualRole =
                data?.role ||
                data?.user?.role ||
                AuthService.getRole();


            /*
             * If the user came from a specific role button,
             * make sure the logged-in account matches it.
             */

            if (
                selectedRole &&
                actualRole &&
                actualRole.toLowerCase() !==
                selectedRole.toLowerCase()
            ) {

                AuthService.logout();

                setError(
                    `This account is registered as ${actualRole}. ` +
                    `Please use the ${actualRole} login option.`
                );

                return;

            }


            /*
             * Successful authentication.
             *
             * Keep the existing application flow.
             */

            navigate("/dashboard", {
                replace: true
            });

        }


        catch (err) {

            console.error("Login error:", err);

            setError(
                err?.response?.data?.detail ||
                "Unable to login. Please check your email and password."
            );

        }


        finally {

            setLoading(false);

        }

    }


    const roleLabel =
        selectedRole === "admin"
            ? "Administrator"
            : selectedRole === "operator"
                ? "Operator"
                : "Traffic Intelligence Platform";


    return (

        <form
            onSubmit={handleSubmit}
            className="w-full"
        >

            {/* ROLE CONTEXT */}

            {selectedRole && (

                <div
                    className="
                        mb-6
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        border
                        border-blue-100
                        bg-blue-50
                        px-4
                        py-3
                    "
                >

                    <div>

                        <p
                            className="
                                text-xs
                                font-medium
                                text-slate-500
                            "
                        >
                            Signing in as
                        </p>

                        <p
                            className="
                                mt-0.5
                                text-sm
                                font-semibold
                                text-blue-700
                            "
                        >
                            {roleLabel}
                        </p>

                    </div>


                    <Link
                        to="/"
                        className="
                            text-xs
                            font-semibold
                            text-blue-600
                            hover:text-blue-700
                        "
                    >
                        Change
                    </Link>

                </div>

            )}


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
                        leading-5
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
                    disabled={loading}
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

                        disabled:cursor-not-allowed
                        disabled:opacity-60
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
                        disabled={loading}
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

                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    />


                    <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                            setShowPassword(!showPassword)
                        }
                        className="
                            absolute
                            right-4
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                            transition
                            hover:text-slate-700
                            disabled:opacity-50
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
                        disabled={loading}
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
                    disabled={loading}
                    className="
                        text-sm
                        font-semibold
                        text-blue-600
                        transition
                        hover:text-blue-700
                        disabled:opacity-50
                    "
                >
                    Forgot password?
                </button>

            </div>


            {/* LOGIN BUTTON */}

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
                        disabled:cursor-not-allowed
                        disabled:opacity-70
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
                            <FaArrowRight
                                className="text-xs"
                            />
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