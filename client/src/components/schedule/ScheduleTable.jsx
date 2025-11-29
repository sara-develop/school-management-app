import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import axios from 'axios';
import AttendanceDialog from './AttendanceDialog';
import LessonDialog from './LessonDialog';
import './schedule.css';
import { useSelector } from 'react-redux'; // לקריאת מידע מה־Redux store


const ScheduleTable = ({ classNumber }) => {
    const token = useSelector(state => state.user.token)  // קריאת שם המשתמש מה־Redux, או ברירת מחדל
    const [schedule, setSchedule] = useState({});
    const [showDialog, setShowDialog] = useState(false);
    const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [lessonIndex, setLessonIndex] = useState(null);

    const fetchSchedule = async () => {
        try {
            const response = await axios.get(
                `http://localhost:1235/api/schedule/getScheduleByClassNumber/${classNumber}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('Fetched schedule:', response.data);
            setSchedule(response.data);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [classNumber]);

    const handleEdit = (day, lessonIndex) => {
        setSelectedDay(day);
        setLessonIndex(lessonIndex);
        setShowDialog(true);
    };

    const handleAttendance = (day, lessonIndex) => {
        setSelectedDay(day);
        setLessonIndex(lessonIndex);
        setShowAttendanceDialog(true);
    };

    const days = [
        { key: 'sunday', label: 'Sunday' },
        { key: 'monday', label: 'Monday' },
        { key: 'tuesday', label: 'Tuesday' },
        { key: 'wednesday', label: 'Wednesday' },
        { key: 'thursday', label: 'Thursday' },
    ];

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 0 8px rgba(0,0,0,0.1)' }}>
                <table className="schedule-table">
                    <thead style={{ backgroundColor: '#542468', color: '#fff' }}>
                        <tr>
                            <th>Lesson</th>
                            {days.map(day => (
                                <th key={day.key}>{day.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 8 }, (_, lessonIndex) => (
                            <tr key={lessonIndex}>
                                <td>Lesson {lessonIndex + 1}</td>
                                {days.map(day => (
                                    <td key={day.key} className="schedule-cell">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 500 }}>
                                                {(() => {
                                                    const slot = schedule[day.key]?.lessons?.find(l => l.lessonIndex === lessonIndex);
                                                    return slot
                                                        ? (slot.lessonId?.name || "Unknown Lesson")
                                                        : "No Lesson";
                                                })()}
                                            </span>
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <Button
                                                    icon="pi pi-pencil"
                                                    className="p-button-rounded p-button-sm"
                                                    style={{ backgroundColor: '#542468', borderColor: '#542468', color: '#fff' }}
                                                    onClick={() => handleEdit(day.key, lessonIndex)}
                                                />
                                                <Button
                                                    label="Attendance"
                                                    className="p-button-outlined p-button-sm"
                                                    style={{ color: '#542468', borderColor: '#542468' }}
                                                    onClick={() => handleAttendance(day.key, lessonIndex)}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <LessonDialog
                visible={showDialog}
                onHide={() => setShowDialog(false)}
                selectedDay={selectedDay}
                lessonIndex={lessonIndex}
                schedule={schedule}
                setSchedule={setSchedule}
                classNumber={classNumber}
                refreshSchedule={fetchSchedule}
            />
            <AttendanceDialog
                visible={showAttendanceDialog}
                onHide={() => setShowAttendanceDialog(false)}
                selectedDay={selectedDay}
                lessonIndex={lessonIndex}
                classNumber={classNumber}
                schedule={schedule}
            />
        </div>
    );
};

export default ScheduleTable;
