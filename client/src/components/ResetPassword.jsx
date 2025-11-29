// ResetPassword.jsx
import { useState } from "react";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "axios";

import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const gray = "#58585a";
    const purple = "#542468";

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await Axios.post("http://localhost:1235/api/user/resetPassword", { token, newPassword });
            setMessage(res.data.message);
        } catch (err) {
            setMessage("Error resetting password");
        }
    };

    return (
        <div className="flex flex-column justify-content-center align-items-center min-h-screen px-3 bg-white">
            <div className="w-full md:w-6 lg:w-5 p-4 border-round shadow-2">
                <h2 className="mb-4" style={{ color: purple }}>Reset Password</h2>
                <form onSubmit={handleSubmit} className="flex flex-column">
                    <label className="mb-2 font-bold" style={{ color: gray }}>New Password</label>
                    <Password
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full mb-3"
                        feedback={false}
                        toggleMask
                        placeholder="Enter new password"
                        inputClassName="w-full"
                    />

                    <Button
                        label="Reset Password"
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

export default ResetPassword;
