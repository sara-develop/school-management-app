import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './lessonDialog.css';

const LessonDialog = ({
    visible,
    onHide,
    selectedDay,
    lessonIndex,
    classNumber,
    refreshSchedule,
}) => {
    const token = useSelector(state => state.user.token);

    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);

    const toast = useRef(); // ⬅ יצירת Toast

    const purpleColor = '#542468';

    /** Fetch lessons only when dialog opens */
    useEffect(() => {
        if (!visible) return;

        axios.get('http://localhost:1235/api/lesson/getAllLessons', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => setLessons(res.data))
        .catch(err => console.error('Error fetching lessons:', err));

    }, [visible, token]);


    /** Save selected lesson */
    const handleSave = async () => {
        if (!selectedLesson) return;

        try {
            await axios.put(
                'http://localhost:1235/api/schedule/updateLessonInSchedule',
                {
                    classNumber,
                    day: selectedDay,
                    lessonIndex,
                    lessonId: selectedLesson._id,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            refreshSchedule();
            onHide();

        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save lesson';

            toast.current.show({
                severity: 'warn',
                summary: 'Cannot Save',
                detail: msg,
                life: 3500
            });
        }
    };


    /** How lesson item appears in dropdown */
    const lessonItemTemplate = (option) => {
        return (
            <div style={{ padding: "0.4rem 0.2rem" }}>
                <div style={{ fontWeight: 600, color: purpleColor }}>
                    {option.name}
                </div>
                {option.teacher && (
                    <div style={{ fontSize: "0.85rem", color: "#777" }}>
                        {option.teacher}
                    </div>
                )}
            </div>
        );
    };


    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            closable={false}
            modal
            className="lesson-dialog"
            style={{
                width: "90%",
                maxWidth: "550px",
                borderRadius: "16px"
            }}
        >
            <Toast ref={toast} /> {/* ⬅ ה־Toast עובד */}

            <Button
                icon="pi pi-times"
                onClick={onHide}
                className="p-button-rounded p-button-text"
                style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    color: purpleColor,
                    fontSize: "1.4rem"
                }}
            />

            <h2 className="lesson-dialog-title">Choose Lesson</h2>

            <h4 className="lesson-dialog-subtitle">
                {selectedDay} • Lesson #{lessonIndex + 1}
            </h4>

            <div className="lesson-dialog-divider"></div>

            <div className="lesson-dropdown p-fluid">
                <label htmlFor="lesson-dropdown" className="lesson-dropdown-label">
                    Select lesson
                </label>

                <Dropdown
                    inputId="lesson-dropdown"
                    value={selectedLesson}
                    options={lessons}
                    onChange={(e) => setSelectedLesson(e.value)}
                    optionLabel="name"
                    placeholder="Choose a lesson..."
                    itemTemplate={lessonItemTemplate}
                    filter
                    filterPlaceholder="Search lessons..."
                    showClear
                />
            </div>

            <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
                <Button
                    label="Cancel"
                    onClick={onHide}
                    className="lesson-btn-cancel p-button-outlined"
                />
                <Button
                    label="Save"
                    onClick={handleSave}
                    disabled={!selectedLesson}
                    className="lesson-btn-save"
                />
            </div>
        </Dialog>
    );
};

export default LessonDialog;
