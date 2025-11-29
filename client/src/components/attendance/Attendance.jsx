import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Messages } from 'primereact/messages';
import { useSelector } from 'react-redux';
import Axios from 'axios';
import { Toast } from "primereact/toast";

const Attendance = () => {
    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentLessons, setStudentLessons] = useState({});
    const [weeklySchedule, setWeeklySchedule] = useState(null);
    const [showDialog, setShowDialog] = useState(false);

    // טקסט ברירת מחדל
    const [emailBody, setEmailBody] = useState(
        "Hi,\n\nAttached is your daughter's attendance for the week.\n\nThank you,"
    );
    const [parshaTitle, setParshaTitle] = useState(''); // יישלח לשרת
    const [showEditDialog, setShowEditDialog] = useState(false);

    const messagesRef = useRef(null);
    const toast = useRef(null);

    const token = useSelector(state => state.user.token);
    const user = useSelector(state => state.user);
    const isManager = user?.isManager || user?.role === 'principal';

    const fetchStudents = async () => {
        try {
            const { data } = await Axios.get(
                'http://localhost:1235/api/student/getAllStudents',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAllStudents(data);
        } catch (err) {
            console.error('Failed to fetch students', err);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleViewAttendance = async (student) => {
        const schedule = await Axios.get(
            `http://localhost:1235/api/schedule/getScheduleByClassNumber/${student.classNumber}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const weeklySchedule = schedule.data;
        setWeeklySchedule(weeklySchedule);

        console.log("=== FULL STUDENT OBJECT ===");
        console.log(JSON.stringify(student, null, 2));

        console.log("=== WEEKLY ATTENDANCE ===");
        console.log(JSON.stringify(student.weeklyAttendance, null, 2));

        setSelectedStudent(student);

        const lessonIds = [];
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];

        days.forEach(day => {
            const entries = student.weeklyAttendance?.[day];
            if (Array.isArray(entries)) {
                entries.forEach(entry => {
                    if (entry?.lessonId) {
                        lessonIds.push(entry.lessonId);
                    }
                });
            }
        });

        console.log("lessonIds BEFORE request:", lessonIds);

        if (lessonIds.length === 0) {
            setStudentLessons({});
            setShowDialog(true);
            return;
        }

        try {
            const { data: lessonsData } = await Axios.post(
                'http://localhost:1235/api/lesson/getMultiple',
                { ids: lessonIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const lessonsMap = {};
            lessonsData.forEach(lesson => {
                lessonsMap[lesson._id] = lesson;
            });

            setStudentLessons(lessonsMap);
            setShowDialog(true);
        } catch (err) {
            console.error('Failed to fetch lessons', err);
        }
    };

    const renderAttendanceTable = () => {
        if (!selectedStudent) return null;

        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
        const dayLabels = {
            sunday: 'Sunday',
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday'
        };
        const numLessons = 8;

        const cellStyle = {
            border: '1px solid #ccc',
            padding: '8px',
            textAlign: 'center',
            verticalAlign: 'top',
            width: '200px',
            height: '20px',
            boxSizing: 'border-box',
            whiteSpace: 'normal',
            wordBreak: 'break-word'
        };

        return (
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    background: '#fff',
                    tableLayout: 'fixed'
                }}
            >
                <thead>
                    <tr>
                        <th style={{ ...cellStyle, background: '#eee', fontWeight: 600 }}>Lesson #</th>
                        {days.map(day => (
                            <th
                                key={day}
                                style={{
                                    ...cellStyle,
                                    background: '#eee',
                                    fontWeight: 600
                                }}
                            >
                                {dayLabels[day]}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {Array.from({ length: numLessons }, (_, lessonIdx) => (
                        <tr key={lessonIdx}>
                            <td style={{ ...cellStyle, fontWeight: 600 }}>
                                {lessonIdx + 1}
                            </td>

                            {days.map(day => {
                                const scheduledSlot =
                                    weeklySchedule?.[day]?.lessons?.find(l => l.lessonIndex === lessonIdx);

                                const scheduledLessonId =
                                    scheduledSlot?.lessonId?._id || scheduledSlot?.lessonId;

                                if (!scheduledLessonId) {
                                    return (
                                        <td key={day} style={cellStyle}>
                                            <span style={{ color: '#bbb' }}>—</span>
                                        </td>
                                    );
                                }

                                const entry = selectedStudent.weeklyAttendance?.[day]?.find(
                                    e => e.lessonId === scheduledLessonId && e.lessonIndex === lessonIdx
                                );

                                const lesson = studentLessons[scheduledLessonId];
                                const status = entry?.status;
                                return (
                                    <td key={day} style={cellStyle}>
                                        {lesson ? (
                                            <>
                                                <div><strong>Lesson:</strong> {lesson.name}</div>
                                                <div><strong>Status:</strong> {status || "—"}</div>
                                            </>
                                        ) : (
                                            <span style={{ color: '#bbb' }}>—</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const handleSendWeeklyEmails = async () => {
        try {
            await Axios.post(
                'http://localhost:1235/api/student/sendWeeklyAttendanceEmails',
                { bodyText: emailBody, parshaTitle },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.current?.show({
                severity: 'success',
                summary: 'Emails Sent',
                detail: 'Weekly attendance emails have been sent to parents.',
                life: 3000,
            });
        } catch (err) {
            console.error('Failed to send weekly emails', err);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to send weekly attendance emails.',
                life: 3000,
            });
        }
    };

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-xl text-900 font-bold" style={{ color: '#6A0DAD' }}>Attendance</span>
        </div>
    );

    const footer = `In total there are ${allStudents ? allStudents.length : 0} students.`;

    const buttonStyle = { backgroundColor: '#542468', borderColor: '#542468', color: '#fff' };

    const editDialogFooter = (
        <Button
            label="Save"
            icon="pi pi-check"
            onClick={() => setShowEditDialog(false)}
            style={{ backgroundColor: '#542468', border: 'none' }}
        />
    );

    return (
        <div className="card" style={{ backgroundColor: '#F4F4F4' }}>
            <Messages ref={messagesRef} />
            <Toast ref={toast} />

            {/* כפתורים למעלה */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
                <Button
                    label="Send Weekly Attendance Emails"
                    icon="pi pi-send"
                    style={buttonStyle}
                    onClick={handleSendWeeklyEmails}
                />

                {isManager && (
                    <Button
                        label="Change email text"
                        icon="pi pi-pencil"
                        className="p-button-outlined"
                        style={{ borderColor: '#542468', color: '#542468' }}
                        onClick={() => setShowEditDialog(true)}
                    />
                )}
            </div>

            <DataTable
                value={allStudents}
                header={header}
                footer={footer}
                tableStyle={{ minWidth: '60rem' }}
                style={{ backgroundColor: '#fff' }}
            >
                <Column field="name" header="Name" />
                <Column field="idNumber" header="ID Number" />
                <Column field="classNumber" header="Class Number" />
                <Column field="parentEmail" header="Parent Email" />
                <Column
                    field="active"
                    header="Active"
                    body={(rowData) => <span>{rowData.active ? "Yes" : "No"}</span>}
                />
                <Column
                    body={(rowData) => (
                        <div className="flex align-items-center gap-2">
                            <Button
                                onClick={() => handleViewAttendance(rowData)}
                                icon="pi pi-eye"
                                className="p-button-rounded"
                                style={buttonStyle}
                                tooltip="View Attendance"
                            />
                        </div>
                    )}
                />
            </DataTable>

            {/* דיאלוג הצגת נוכחות */}
            <Dialog
                header={`Attendance for ${selectedStudent?.name || ''}`}
                visible={showDialog}
                style={{
                    width: '90vw',
                    maxHeight: '90vh',
                    overflow: 'visible'
                }}
                contentStyle={{
                    overflow: 'visible',
                }}
                breakpoints={{
                    '960px': '95vw',
                    '640px': '100vw'
                }}
                onHide={() => setShowDialog(false)}
            >
                {renderAttendanceTable()}
            </Dialog>

            {/* דיאלוג עריכת גוף המייל + פרשה */}
            <Dialog
                header="Edit email content"
                visible={showEditDialog}
                onHide={() => setShowEditDialog(false)}
                style={{ width: '40rem', maxWidth: '95vw' }}
                footer={editDialogFooter}
            >
                <div className="field" style={{ marginBottom: '1rem' }}>
                    <label>Parsha title</label>
                    <input
                        type="text"
                        value={parshaTitle}
                        onChange={(e) => setParshaTitle(e.target.value)}
                        style={{ width: '100%', marginTop: '0.25rem' }}
                    />
                </div>

                <div className="field">
                    <label>Email body</label>
                    <textarea
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        rows={6}
                        style={{ width: '100%', marginTop: '0.25rem' }}
                    />
                </div>
            </Dialog>
        </div>
    );
};

export default Attendance;
