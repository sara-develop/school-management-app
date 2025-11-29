// ForgotPassword.jsx
import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

const ForgotPassword = () => {
    const [id, setId] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const gray = "#58585a";
    const purple = "#542468";

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await Axios.post("http://localhost:1235/api/user/forgotPassword", { id });
            setMessage(res.data.message);
        } catch (err) {
            setMessage("Error sending reset request");
        }
    };

    return (
        <div className="flex flex-column justify-content-center align-items-center min-h-screen px-3 bg-white">
            <div className="w-full md:w-6 lg:w-5 p-4 border-round shadow-2">
                <h2 className="mb-4" style={{ color: purple }}>Forgot Password</h2>
                <form onSubmit={handleSubmit} className="flex flex-column">
                    <label className="mb-2 font-bold" style={{ color: gray }}>Username / ID</label>
                    <InputText
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="w-full mb-3"
                        placeholder="Enter your ID"
                    />

                    <Button
                        label="Send Reset Link"
                        type="submit"
                        className="w-full mb-3"
                        style={{ backgroundColor: purple, borderColor: purple }}
                    />

                    {message && <div style={{ color: purple, fontWeight: "bold", textAlign: "center" }}>{message}</div>}
                </form>

                <div className="text-center mt-3">
                    <Button 
                        label="Back to Login"
                        className="p-button-text"
                        style={{ color: purple }}
                        onClick={() => navigate("/")}
                    />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
