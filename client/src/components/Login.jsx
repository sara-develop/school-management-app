import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import logo from "../assets/logo.png";
import Axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice"; // ייבוא הפעולה

import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

const Login = () => {
    const [id, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch(); // ייבוא הפונקציה dispatch

    const gray = "#58585a";
    const purple = "#542468";

    const handleLogin = async () => {
        try {
            const response = await Axios.post("http://localhost:1235/api/user/login", {
                id,
                password,
            });

            const token = response.data.accessToken;
            const decoded = jwtDecode(token);
            const username = decoded.username || decoded.name || decoded.id;
            const isManager = decoded.isManager;

            localStorage.setItem("token", token);
            localStorage.setItem("username", username);
            localStorage.setItem("isManager", isManager); // שמירה ב-localStorage

            dispatch(setUser({ username, token, isManager })); // שמירה ב-Redux

            navigate("/HomePage");
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
        }
    };

    const goToRegister = () => {
        navigate("/register");
    };

    return (
        <div className="flex flex-column justify-content-center align-items-center min-h-screen px-3 bg-white">
            <div className="mb-4">
                <img src={logo} alt="Logo" style={{ width: "120px" }} />
            </div>

            <div className="flex flex-wrap w-full md:w-10 lg:w-8 xl:w-7">
                <div className="w-full md:w-6 p-4 flex flex-column justify-content-center align-items-start">
                    <h3 className="mb-3 font-bold" style={{ color: purple }}>
                        Welcome to our platform
                    </h3>
                    <p style={{ color: gray }}>
                        Login to manage the schedule, attendance and users.
                    </p>

                    <div className="flex justify-content-center align-items-center mt-5 w-full">
                        <i className="pi pi-users" style={{ fontSize: "3rem", color: purple }}></i>
                    </div>
                </div>

                <div className="hidden md:block" style={{ width: "1px", backgroundColor: purple, margin: "0 1rem" }}></div>

                <div className="w-full md:w-5 p-4">
                    <h2 className="mb-4" style={{ color: purple }}>Login</h2>

                    <div className="mb-3">
                        <label className="block font-bold mb-1" style={{ color: gray }}>Username</label>
                        <InputText
                            value={id}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block font-bold mb-1" style={{ color: gray }}>Password</label>
                        <Password
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full"
                            feedback={false}
                            toggleMask
                            placeholder="Enter your password"
                            inputClassName="w-full"
                        />
                    </div>

                    <Button
                        label="Login"
                        onClick={handleLogin}
                        className="w-full mb-3"
                        style={{ backgroundColor: purple, borderColor: purple }}
                    />

                    <div className="text-center mt-2">
                        <Link 
                            to="/forgot-password" 
                            style={{ color: purple, textDecoration: "none", fontWeight: "bold" }}
                        >
                            Forgot Password?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
