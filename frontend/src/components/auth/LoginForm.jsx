import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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

        try {

            setLoading(true);

            setError("");

            await AuthService.login(formData);

            navigate("/dashboard");

        }

        catch (err) {

            console.error(err);

            setError("Invalid email or password.");

        }

        finally {

            setLoading(false);

        }

    }

    return (

        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >

            {

                error &&

                <div
                    className="
                        bg-red-100
                        text-red-700
                        border
                        border-red-300
                        rounded-xl
                        p-3
                    "
                >

                    {error}

                </div>

            }

            <div>

                <label className="font-medium">

                    Email Address

                </label>

                <input

                    type="email"

                    name="email"

                    value={formData.email}

                    onChange={handleChange}

                    placeholder="Enter your email"

                    required

                    className="
                        mt-2
                        w-full
                        border
                        rounded-xl
                        p-3
                        focus:ring-2
                        focus:ring-blue-600
                        outline-none
                    "

                />

            </div>

            <div>

                <label className="font-medium">

                    Password

                </label>

                <div className="relative mt-2">

                    <input

                        type={

                            showPassword

                                ? "text"

                                : "password"

                        }

                        name="password"

                        value={formData.password}

                        onChange={handleChange}

                        placeholder="Enter your password"

                        required

                        className="
                            w-full
                            border
                            rounded-xl
                            p-3
                            pr-12
                            focus:ring-2
                            focus:ring-blue-600
                            outline-none
                        "

                    />

                    <button

                        type="button"

                        onClick={() =>

                            setShowPassword(

                                !showPassword

                            )

                        }

                        className="
                            absolute
                            right-4
                            top-4
                            text-slate-500
                        "

                    >

                        {

                            showPassword

                                ?

                                <FaEyeSlash />

                                :

                                <FaEye />

                        }

                    </button>

                </div>

            </div>

            <div
                className="
                    flex
                    justify-between
                    items-center
                    text-sm
                "
            >

                <label
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <input type="checkbox" />

                    Remember Me

                </label>

                <button
                    type="button"
                    className="text-blue-600"
                >

                    Forgot Password?

                </button>

            </div>

            <Button

                type="submit"

                className="w-full"

                disabled={loading}

            >

                {

                    loading

                        ?

                        "Signing In..."

                        :

                        "Login"

                }

            </Button>

            <p
                className="
                    text-center
                    text-slate-500
                "
            >

                Don't have an account?

                <Link

                    to="/register"

                    className="
                        ml-2
                        text-blue-600
                        font-semibold
                    "

                >

                    Register

                </Link>

            </p>

        </form>

    );

}

export default LoginForm;