const mongoose = require("mongoose");

const lessonSlotSchema = new mongoose.Schema({
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
    },
    lessonIndex: {
        type: Number,
        required: true
    }
}, { _id: false });

const daySchema = new mongoose.Schema({
    lessons: {
        type: [lessonSlotSchema],
        default: []
    }
}, { _id: false });

const weeklyScheduleSchema = new mongoose.Schema({
    classNumber: {
        type: Number,
        required: true
    },
    sunday: daySchema,
    monday: daySchema,
    tuesday: daySchema,
    wednesday: daySchema,
    thursday: daySchema
});

module.exports = mongoose.model('WeeklySchedule', weeklyScheduleSchema);
