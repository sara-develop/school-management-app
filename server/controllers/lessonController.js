const mongoose = require("mongoose")
const Lesson = require("../models/lesson")
const WeeklySchedule = require("../models/weeklySchedule");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

const getMultiple = async (req, res) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "ids array is required" });
    }

    try {
        const lessons = await Lesson.find({ _id: { $in: ids } }).lean();
        return res.status(200).json(lessons);
    } catch (err) {
        return res.status(500).json({
            message: "Failed to fetch lessons",
            error: err.message
        });
    }
};

const addLesson = async (req, res) => {
    try {
        const { name, teacher } = req.body;

        // Check for required fields and validate they are non-empty strings
        if (!name || !teacher || typeof name !== 'string' || typeof teacher !== 'string' || !name.trim() || !teacher.trim()) {
            return res.status(400).json({ message: "Both 'name' and 'teacher' fields are required and must be non-empty strings" });
        }

        const lesson = await Lesson.create({ name: name.trim(), teacher: teacher.trim() });
        return res.status(201).json({ message: `Lesson '${lesson.name}' created successfully` });

    } catch (err) {
        return res.status(500).json({ message: "Failed to create lesson", error: err.message });
    }
};

const getById = async (req, res) => {
    const { id } = req.params

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid lesson ID format" })
    }

    try {
        const lesson = await Lesson.findById(id).lean()
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" })
        }

        return res.status(200).json(lesson)
    } catch (err) {
        return res.status(500).json({ message: "Error retrieving lesson", error: err.message })
    }
};

const getAll = async (req, res) => {
    try {
        const lessons = await Lesson.find().lean()
        return res.status(200).json(lessons)
    } catch (err) {
        return res.status(500).json({ message: "Error retrieving lessons", error: err.message })
    }
};

const updateLesson = async (req, res) => {
    const { id } = req.params
    const { name, teacher } = req.body

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid lesson ID format" })
    }

    if ((!name && !teacher) || (name && typeof name !== 'string') || (teacher && typeof teacher !== 'string')) {
        return res.status(400).json({ message: "At least one of 'name' or 'teacher' must be provided and be a string" })
    }

    try {
        const lesson = await Lesson.findById(id)
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" })
        }

        let updated = false;
        if (name && lesson.name !== name.trim()) {
            lesson.name = name.trim();
            updated = true;
        }

        if (teacher && lesson.teacher !== teacher.trim()) {
            lesson.teacher = teacher.trim();
            updated = true;
        }

        if (updated) {
            await lesson.save()
            return res.status(200).json({ message: `Lesson '${lesson.name}' updated successfully` })
        } else {
            return res.status(400).json({ message: "No changes were made to the lesson" })
        }

    } catch (err) {
        return res.status(500).json({ message: "Failed to update lesson", error: err.message })
    }
};

const deleteById = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid lesson ID format" });
    }

    try {
        // בדיקה אם השיעור מופיע באחד הימים
        const isInUse = await WeeklySchedule.findOne({
            $or: [
                { "sunday.lessons.lessonId": id },
                { "monday.lessons.lessonId": id },
                { "tuesday.lessons.lessonId": id },
                { "wednesday.lessons.lessonId": id },
                { "thursday.lessons.lessonId": id }
            ]
        });

        if (isInUse) {
            return res.status(409).json({
                message: "This lesson is assigned to a weekly schedule and cannot be deleted."
            });
        }

        const deleted = await Lesson.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        return res.status(200).json({
            message: `Lesson '${deleted.name}' deleted successfully`
        });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to delete lesson",
            error: err.message
        });
    }
};

module.exports = {
    addLesson,
    getById,
    getAll,
    updateLesson,
    deleteById,
    getMultiple
};

