const mongoose = require("mongoose");

const attendanceEntrySchema = new mongoose.Schema({
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
    },
    lessonIndex: {
        type: Number   // ← הוספנו אינדקס של השיעור באותו יום
    },
    status: {
        type: String,
        enum: ['Present', 'Late', 'Absent'],
        default: 'Absent'
    }
}, { _id: true });

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    idNumber: {
        type: String,
        required: true,
        unique: true
    },
    active: {
        type: Boolean,
        default: true
    },
    parentEmail: {
        type: String,
        required: true,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Invalid email format']
    },
    classNumber: {
        type: Number,
        required: true
    },
    weeklyAttendance: {
        type: {
            sunday: [attendanceEntrySchema],
            monday: [attendanceEntrySchema],
            tuesday: [attendanceEntrySchema],
            wednesday: [attendanceEntrySchema],
            thursday: [attendanceEntrySchema]
        },
        default: {
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: []
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
