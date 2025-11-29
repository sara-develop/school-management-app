import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';

const AttendanceDialog = ({ visible, onHide, selectedDay, lessonIndex, classNumber, schedule }) => {
    const token = useSelector(state => state.user.token);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);

    const toast = useRef(null);

    const slot = schedule[selectedDay]?.lessons?.[lessonIndex];

    console.log("DEBUG slot:", slot);

    let lessonId = null;

    // 1) new schema → lessonId is a string
    if (slot?.lessonId && typeof slot.lessonId === "string") {
        lessonId = slot.lessonId;
    }

    // 2) populated schema → lessonId is an object {_id, name, ...}
    else if (slot?.lessonId && typeof slot.lessonId === "object") {
        lessonId = slot.lessonId._id;
    }

    // 3) fallback → slot._id (in case lessons array is populated directly)
    else if (slot?._id) {
        lessonId = slot._id;
    }

    console.log("USING LESSON ID:", lessonId);

    const fetchStudents = async () => {
        try {
            const response = await axios.get(
                `http://localhost:1235/api/student/getAttendanceByLesson/${classNumber}/${selectedDay}/${lessonId}/${lessonIndex}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setStudents(response.data);

            setAttendance(
                response.data.map((student) => ({
                    idNumber: student.idNumber,
                    status: student.status,
                }))
            );
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchStudents();
            console.log("DEBUG selectedDay:", selectedDay);
            console.log("DEBUG lessonIndex:", lessonIndex);
            console.log("DEBUG schedule day:", schedule[selectedDay]);
            console.log("DEBUG lesson slot:", schedule[selectedDay]?.lessons?.[lessonIndex]);
        }
    }, [visible]);

    const handleStatusChange = (idNumber, status) => {
        setAttendance((prev) =>
            prev.map((a) => (a.idNumber === idNumber ? { ...a, status } : a))
        );
    };

    const handleSaveAttendance = () => {
        if (!lessonId) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No lesson selected!',
                life: 3000
            });
            return;
        }

        axios
            .put(
                'http://localhost:1235/api/student/updateAttendanceForLesson',
                {
                    classNumber,
                    day: selectedDay,
                    lessonId,
                    lessonIndex,
                    attendanceUpdates: attendance,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then(() => {
                toast.current.show({
                    severity: 'success',
                    summary: 'Saved',
                    detail: 'Attendance updated successfully',
                    life: 2500
                });
                onHide();
            })
            .catch((err) => {
                console.error('Error updating attendance:', err);
                toast.current.show({
                    severity: 'error',
                    summary: 'Update failed',
                    detail: 'Error updating attendance. Please try again later.',
                    life: 3000
                });
            });

        console.log("=== SENDING TO SERVER ===");
        console.log("classNumber:", classNumber);
        console.log("day:", selectedDay);
        console.log("lessonId:", lessonId);
        console.log("lessonIndex:", lessonIndex);
        console.log("attendanceUpdates:", attendance);

    };

    return (
        <Dialog
            header="Manage Attendance"
            visible={visible}
            onHide={onHide}
            style={{ width: '50vw', minWidth: '350px' }}
            breakpoints={{ '960px': '90vw', '640px': '100vw' }}
            footer={
                <Button
                    label="Save"
                    icon="pi pi-check"
                    onClick={handleSaveAttendance}
                    style={{
                        backgroundColor: '#542468',
                        border: 'none',
                        color: 'white',
                        width: '100%',
                        fontWeight: 'bold',
                    }}
                />
            }
        >
            {/* TOAST בתוך ה־Dialog */}
            <Toast ref={toast} position="top-center" />

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4' }}>
                        <th style={{ textAlign: 'left', padding: '0.75rem' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length === 0 && (
                        <tr>
                            <td colSpan={2} style={{ padding: '1rem', textAlign: 'center', fontStyle: 'italic' }}>
                                No students found.
                            </td>
                        </tr>
                    )}
                    {students.map((student) => {
                        const currentStatus = attendance.find((a) => a.idNumber === student.idNumber)?.status;

                        return (
                            <tr key={student.idNumber} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '0.75rem' }}>{student.name}</td>
                                <td style={{ padding: '0.75rem' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <Button
                                            label="Present"
                                            className={`p-button ${currentStatus === 'Present' ? 'p-button-success' : 'p-button-outlined'}`}
                                            onClick={() => handleStatusChange(student.idNumber, 'Present')}
                                            style={{ minWidth: '75px' }}
                                        />
                                        <Button
                                            label="Late"
                                            className={`p-button ${currentStatus === 'Late' ? 'p-button-warning' : 'p-button-outlined'}`}
                                            onClick={() => handleStatusChange(student.idNumber, 'Late')}
                                            style={{ minWidth: '75px' }}
                                        />
                                        <Button
                                            label="Absent"
                                            className={`p-button ${currentStatus === 'Absent' ? 'p-button-danger' : 'p-button-outlined'}`}
                                            onClick={() => handleStatusChange(student.idNumber, 'Absent')}
                                            style={{ minWidth: '75px' }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Dialog>
    );
};

export default AttendanceDialog;
