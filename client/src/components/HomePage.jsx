import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { HDate } from "@hebcal/core";
import { Button } from "primereact/button";

const getHebrewDayName = (date) => {
    const days = ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "יום שישי", "יום שבת"];
    return days[date.getDay()];
};

const numberToHebrew = (num) => {
    const hebrewLetters = [
        '', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳',
        'י׳', 'יא׳', 'יב׳', 'יג׳', 'יד׳', 'טו׳', 'טז׳', 'יז׳', 'יח׳', 'יט׳',
        'כ׳', 'כא׳', 'כב׳', 'כג׳', 'כד׳', 'כה׳', 'כו׳', 'כז׳', 'כח׳', 'כט׳',
        'ל׳'
    ];
    return hebrewLetters[num] || num;
};


// פונקציה להמרת שם חודש באנגלית לעברית
const convertHebrewMonthToHebrew = (englishMonth) => {
    const monthMap = {
        "Tishrei": "תשרי",
        "Cheshvan": "חשוון",
        "Kislev": "כסלו",
        "Tevet": "טבת",
        "Shevat": "שבט",
        "Adar": "אדר",
        "Adar I": "אדר א׳",
        "Adar II": "אדר ב׳",
        "Nisan": "ניסן",
        "Iyar": "אייר",
        "Sivan": "סיוון",
        "Tamuz": "תמוז",
        "Av": "אב",
        "Elul": "אלול"
    };
    return monthMap[englishMonth] || englishMonth;
};

const HomePage = () => {
    const navigate = useNavigate();
    const username = useSelector((state) => state.user.username);
    const isManager = useSelector((state) => state.user.isManager);

    const [hebrewDateStr, setHebrewDateStr] = useState("");
    const [gregorianDateStr, setGregorianDateStr] = useState("");
    const [timeStr, setTimeStr] = useState("");

    const purple = "#542468";
    const gray = "#58585a";

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
        }

        const updateDateTime = () => {
            const today = new Date();

            const day = String(today.getDate()).padStart(2, "0");
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const year = today.getFullYear();
            setGregorianDateStr(`${day}/${month}/${year}`);

            const hours = String(today.getHours()).padStart(2, "0");
            const minutes = String(today.getMinutes()).padStart(2, "0");
            setTimeStr(`${hours}:${minutes}`);

            const hdate = new HDate(today);
            const hebDay = getHebrewDayName(today);
            const hebDayNum = numberToHebrew(hdate.getDate());
            const rawMonth = hdate.getMonthName(); // שם החודש באנגלית
            const hebMonth = convertHebrewMonthToHebrew(rawMonth);

            setHebrewDateStr(`${hebDay} ${hebDayNum} ${hebMonth}`);
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 10000);
        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <div className="flex flex-column justify-content-start align-items-center p-4 min-h-screen bg-white">
            <h1 style={{ color: purple, marginTop: "2rem", textAlign: "center" }}>
                Welcome {username}
            </h1>

            <div style={{
                width: "100%",
                maxWidth: "500px",
                background: "#f7f3ff",
                borderRadius: "12px",
                padding: "1.5rem",
                marginTop: "1rem",
                boxShadow: "0 4px 12px rgba(84,36,104,0.2)",
                textAlign: "center"
            }}>
                <div style={{ fontWeight: "bold", color: purple, fontSize: "1.2rem" }}>{hebrewDateStr}</div>
                <div style={{ color: gray, marginTop: "0.5rem" }}>{gregorianDateStr}</div>
                <div style={{ color: gray, marginTop: "0.2rem", fontSize: "1.1rem" }}>Time: {timeStr}</div>
            </div>

            {isManager && (
                <div
                    className="flex flex-wrap md:flex-nowrap gap-3 md:gap-4 mt-6 justify-content-center"
                    style={{ maxWidth: "100%" }}
                >
                    <Button
                        label="Add A New Staff Member"
                        icon="pi pi-user-plus"
                        onClick={() => navigate("/register")}
                        className="p-button-rounded p-button-lg"
                        style={{ backgroundColor: purple, borderColor: purple, whiteSpace: "nowrap" }}
                    />
                    <Button
                        label="View All Staff Members"
                        icon="pi pi-users"
                        onClick={() => navigate("/allUsers")}
                        className="p-button-rounded p-button-lg"
                        style={{ backgroundColor: "#6a4c93", borderColor: "#6a4c93", whiteSpace: "nowrap" }}
                    />
                </div>
            )}

        </div>
    );
};

export default HomePage;
