require("dotenv").config()

// מודולים חיצוניים
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const cron = require('node-cron');

// קבצים פנימיים
const { resetScheduleForClass1 } = require("./controllers/weeklyScheduleController");
const corsOptions = require("./config/corsOptions")
const connectDB = require("./config/dbconn")
const { resetWeeklyAttendance } = require('./utils'); // אם הפרדת לפונקציה נפרדת


// הגדרות כלליות
const PORT = process.env.PORT || 1234
const app = express()

// התחברות למסד נתונים
connectDB()

// מידלוורים
app.use(cors(corsOptions))
app.use(express.json())

// ראוטים
app.use('/api/lesson', require("./routes/lessonRoute"))
app.use('/api/student', require("./routes/studentRoute"))
app.use('/api/user', require("./routes/userRoute"))
app.use('/api/schedule', require("./routes/weeklyScheduleRoute"))

// ראוט ברירת מחדל
app.get('/', (req, res) => res.send("welcome!!"))


// הרצה כל ראשון ב-00:00 בלילה
cron.schedule('0 0 * * 0', () => {
  console.log('Running weekly attendance reset task');
  resetWeeklyAttendance();
});

// cron.schedule('38 16 * * 1', () => {
//   console.log('Running weekly attendance reset task at Monday 16:38');
//   resetWeeklyAttendance();
// });

// setTimeout(() => {
//     console.log('Running one-time attendance reset task');
//     resetWeeklyAttendance();
// }, 60);

// setTimeout(() => {
//     console.log("Running one-time reset for schedule class 1");
//     resetScheduleForClass1();
// }, 50);


// התחלת האזנה לשרת לאחר חיבור למסד נתונים
mongoose.connection.once('open', () => {
    app.listen(PORT, () => console.log(`The project is running on port ${PORT}`))
})

// טיפול בשגיאות במסד נתונים
mongoose.connection.on('error', err => {
    console.log(err)
})
