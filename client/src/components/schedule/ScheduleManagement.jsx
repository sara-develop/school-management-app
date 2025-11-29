import { useState, useEffect } from 'react';
import axios from 'axios';
import ScheduleTable from './ScheduleTable';
import './scheduleManagement.css';
import { useSelector } from 'react-redux'; // לקריאת מידע מה־Redux store


const ScheduleManagement = () => {


    const [classNumber, setClassNumber] = useState('');
    const [allClasses, setAllClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = useSelector(state => state.user.token); // או כל מקום שבו אתה שומר את הטוקן

    useEffect(() => {
        if (!token) return; // אם אין טוקן אל תשלח בקשה

        axios.get('http://localhost:1235/api/student/getAllClasses', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setAllClasses(response.data.map(Number));
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch class numbers', err);
                setLoading(false);
            });
    }, [token]);


    const handleClassChange = (event) => {
        setClassNumber(event.target.value);
    };

    if (loading) {
        return <div className="schedule-loading">Loading classes...</div>;
    }

    return (
        <div className="schedule-management-container">
            <h2 className="schedule-title">
                Weekly Schedule Class #{classNumber && `${classNumber}`}
            </h2>

            <div className="select-class-container">
                <label htmlFor="classNumber" className="select-label">Select Class Number: </label>
                <select
                    id="classNumber"
                    value={classNumber}
                    onChange={handleClassChange}
                    className="class-dropdown"
                >
                    <option value="">Select a class</option>
                    {allClasses.map((classNum) => (
                        <option key={classNum} value={classNum}>
                            {classNum}
                        </option>
                    ))}
                </select>
            </div>

            {classNumber && (
                <div className="schedule-table-wrapper">
                    <ScheduleTable classNumber={classNumber} />
                </div>
            )}
        </div>
    );
};

export default ScheduleManagement;