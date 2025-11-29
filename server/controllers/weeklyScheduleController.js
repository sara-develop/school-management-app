const WeeklySchedule = require('../models/weeklySchedule');

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];

// פונקציה שמוודאת שלכל שיעור במערך יש lessonIndex נכון לפי האינדקס שלו
const withLessonIndexes = (lessons = []) => {
    return lessons.map((l, idx) => {
        if (!l || !l.lessonId) return null;
        return {
            lessonId: l.lessonId,
            lessonIndex: idx
        };
    });
};


const checkLessonsBeforeUpdate = async (classNumber, day, lessonIndex) => {
    const schedule = await WeeklySchedule.findOne({ classNumber }).lean();
    if (!schedule || !schedule[day]) return false;

    if (!Array.isArray(schedule[day].lessons)) schedule[day].lessons = [];

    // לא מחזירים false אם השיעורים הקודמים ריקים
    return true;
};

const createSchedule = async (req, res) => {
    const { classNumber } = req.body;

    if (!classNumber) {
        return res.status(400).json({ message: 'Class number is required' });
    }

    try {
        const schedule = await WeeklySchedule.create({
            classNumber,
            sunday: { lessons: [] },
            monday: { lessons: [] },
            tuesday: { lessons: [] },
            wednesday: { lessons: [] },
            thursday: { lessons: [] }
        });

        return res.status(201).json(schedule);
    } catch (err) {
        console.error('Error creating schedule:', err);
        return res.status(500).json({ message: 'Failed to create schedule' });
    }
};


const getScheduleByClassNumber = async (req, res) => {
    const { classNumber } = req.params;

    try {
        const schedule = await WeeklySchedule.findOne({ classNumber })
            .populate("sunday.lessons.lessonId")
            .populate("monday.lessons.lessonId")
            .populate("tuesday.lessons.lessonId")
            .populate("wednesday.lessons.lessonId")
            .populate("thursday.lessons.lessonId");

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        // הדפסה כדי לבדוק שהנתונים נטענים כראוי
        console.log("Schedule data with populated lessons:", schedule);

        return res.status(200).json(schedule);
    } catch (err) {
        console.error('Error fetching schedule:', err);
        return res.status(500).json({ message: 'Failed to get schedule' });
    }
};

const getSchedule = async (req, res) => {
    const { classNumber } = req.query;

    if (!classNumber) {
        return res.status(400).json({ message: 'Class number is required' });
    }

    try {
        const schedule = await WeeklySchedule.findOne({ classNumber })
            .populate("sunday.lessons.lessonId")
            .populate("monday.lessons.lessonId")
            .populate("tuesday.lessons.lessonId")
            .populate("wednesday.lessons.lessonId")
            .populate("thursday.lessons.lessonId");

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        return res.status(200).json(schedule);
    } catch (err) {
        console.error('Error fetching schedule:', err);
        return res.status(500).json({ message: 'Failed to get schedule' });
    }
};

const updateSchedule = async (req, res) => {
    const { classNumber, scheduleUpdates } = req.body;

    if (!classNumber || !scheduleUpdates) {
        return res.status(400).json({ message: 'Class number and updates are required' });
    }

    try {
        const schedule = await WeeklySchedule.findOne({ classNumber });

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        Object.entries(scheduleUpdates).forEach(([day, data]) => {
            // נוודא שזה אכן יום חוקי
            if (DAYS.includes(day) && schedule[day]) {
                const lessons = Array.isArray(data.lessons) ? data.lessons : [];
                schedule[day].lessons = withLessonIndexes(lessons);
            }
        });

        await schedule.save();
        return res.status(200).json({ message: 'Schedule updated' });
    } catch (err) {
        console.error('Error updating schedule:', err);
        return res.status(500).json({ message: 'Update failed' });
    }
};

const updateOneDaySchedule = async (req, res) => {
    const { classNumber, day, lessons } = req.body;

    if (!classNumber || !day || !lessons) {
        return res.status(400).json({ message: 'Class number, day and lessons are required' });
    }

    // ולידציה שהיום חוקי
    if (!DAYS.includes(day)) {
        return res.status(400).json({ message: 'Invalid day value' });
    }

    try {
        const schedule = await WeeklySchedule.findOne({ classNumber });

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        // כאן הקסם – השרת עצמו קובע lessonIndex לפי מיקום במערך
        schedule[day].lessons = withLessonIndexes(lessons);

        await schedule.save();

        return res.status(200).json({ message: 'Day schedule updated' });
    } catch (err) {
        console.error('Error updating day schedule:', err);
        return res.status(500).json({ message: 'Update failed' });
    }
};

const updateLessonInSchedule = async (req, res) => {
    const { classNumber, day, lessonIndex, lessonId } = req.body;

    if (!classNumber || !day || lessonIndex === undefined || !lessonId) {
        return res.status(400).json({
            message: 'classNumber, day, lessonIndex, and lessonId are required'
        });
    }

    try {
        const schedule = await WeeklySchedule.findOne({ classNumber });

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        if (!schedule[day]) schedule[day] = { lessons: [] };

        const lessons = schedule[day].lessons;

        // ודא שהמערך מכיל null ולא {}
        while (lessons.length <= lessonIndex) {
            lessons.push(null);
        }

        // בדיקה: אסור לשים שיעור ללא הקודם
        if (lessonIndex > 0) {
            const prev = lessons[lessonIndex - 1];
            if (!prev) {
                return res.status(400).json({
                    message: `אי אפשר להכניס שיעור מספר ${lessonIndex + 1} לפני שמגדירים את שיעור מספר ${lessonIndex}`
                });
            }
        }

        lessons[lessonIndex] = {
            lessonId,
            lessonIndex
        };

        await schedule.save();

        return res.status(200).json({ message: 'Lesson updated successfully' });

    } catch (err) {
        console.error('Error updating lesson:', err);
        return res.status(500).json({ message: 'Update failed' });
    }
};



const deleteSchedule = async (req, res) => {
    const { classNumber } = req.body;

    if (!classNumber) {
        return res.status(400).json({ message: 'Class number is required' });
    }

    try {
        const result = await WeeklySchedule.deleteOne({ classNumber });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        return res.status(200).json({ message: 'Schedule deleted' });
    } catch (err) {
        console.error('Error deleting schedule:', err);
        return res.status(500).json({ message: 'Deletion failed' });
    }
};

const resetScheduleForClass1 = async () => {
    try {
        const classNumber = 1;

        const schedule = await WeeklySchedule.findOne({ classNumber });

        if (!schedule) {
            console.log("No schedule found for class 1");
            return;
        }

        schedule.sunday.lessons = [];
        schedule.monday.lessons = [];
        schedule.tuesday.lessons = [];
        schedule.wednesday.lessons = [];
        schedule.thursday.lessons = [];

        await schedule.save();

        console.log("Weekly schedule for class 1 has been cleared successfully!");
    } catch (err) {
        console.error("Error clearing schedule:", err);
    }
};

module.exports = {
    createSchedule,
    getSchedule,
    updateSchedule,
    updateOneDaySchedule,
    updateLessonInSchedule,
    deleteSchedule,
    getScheduleByClassNumber,
    resetScheduleForClass1
};
