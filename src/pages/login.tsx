import { Link } from "react-router-dom";
import { CircleUser, Lock } from "lucide-react";
import validation from '../LoginValidation';
import React, { useState } from "react";


export function App() {

    if (localStorage.getItem("username") !== null) {
        window.location.href = "/";
    }

    const [values, setValues] = useState({
        username: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const handleInput = (event) => {
        setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
    }

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const validationErrors = validation(values);

        setErrors(validationErrors);

        if (validationErrors.error === "") {
            try {
                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: values.username,
                        password: values.password,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setErrors({ error: data.error });
                    return;
                }

                // Save logged in user
                localStorage.setItem(
                    "username",
                    data.username
                );

                // Redirect
                window.location.href = "/";
            } catch (err) {
                setErrors({
                    error: "Server error",
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <form className="w-full min-h-screen rounded bg-white shadow-md flex flex-col gap-4 p-10" onSubmit={handleSubmit}>
                <p className="text-xl font-bold w-full text-center">Login</p>

                <div className="relative w-full">
                    <CircleUser
                        className="absolute left-2 top-4.5 -translate-y-1/2 text-gray-800"
                        size={20} />

                    <input
                        type="text"
                        placeholder="Username"
                        id="username"
                        name="username"
                        onChange={handleInput}
                        className="w-full rounded py-2 px-8 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white border-b-2 border-slate-500"
                    />
                </div>

                <div className="relative w-full">
                    <Lock
                        className="absolute left-2 top-4.5 -translate-y-1/2 text-gray-800"
                        size={20} />
                    <input
                        type="password"
                        placeholder="Password"
                        id="password"
                        name="password"
                        onChange={handleInput}
                        className="w-full rounded py-2 px-8 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white border-b-2 border-slate-500"
                    />
                    {errors.error && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.error}
                        </p>
                    )}
                </div>
                <div className="flex gap-4">
                    <button type="submit" className="bg-gray-200 hover:bg-gray-300 font-bold w-40 py-1 px-1 rounded text-sm inline-block">Login</button>
                    <Link to="/register" className="bg-gray-200 hover:bg-gray-300 font-bold w-40 py-1 px-1 rounded text-sm text-center">Register </Link>
                </div>
            </form>
        </div>
    );
}

export default App;