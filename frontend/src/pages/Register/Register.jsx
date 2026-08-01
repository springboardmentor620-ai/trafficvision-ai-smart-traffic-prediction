import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";

function Register() {

    return (

        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

            <div className="bg-white rounded-3xl shadow-2xl p-16 w-full max-w-xl">

                <h1 className="text-4xl font-bold">

                    Create Account

                </h1>

                <p className="text-gray-500 mt-3">

                    Register to access TrafficVision AI.

                </p>

                <form className="mt-10 space-y-6">

                    <input

                        placeholder="Full Name"

                        className="w-full border rounded-xl p-4"

                    />

                    <input

                        placeholder="Email"

                        className="w-full border rounded-xl p-4"

                    />

                    <input

                        type="password"

                        placeholder="Password"

                        className="w-full border rounded-xl p-4"

                    />

                    <Button className="w-full">

                        Register

                    </Button>

                </form>

                <p className="mt-8">

                    Already have an account?

                    <Link

                        className="text-blue-600 ml-2"

                        to="/login"

                    >

                        Login

                    </Link>

                </p>

            </div>

        </div>

    );

}

export default Register;