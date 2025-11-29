const express = require("express");
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const WeeklyScheduleController = require("../controllers/weeklyScheduleController");

router.post("/createSchedule", verifyJWT, WeeklyScheduleController.createSchedule);
router.get("/getSchedule", verifyJWT, WeeklyScheduleController.getSchedule);
router.put("/updateSchedule", verifyJWT, WeeklyScheduleController.updateSchedule);
router.put("/updateOneDaySchedule", verifyJWT, WeeklyScheduleController.updateOneDaySchedule);
router.delete("/deleteSchedule", verifyJWT, WeeklyScheduleController.deleteSchedule);
router.get("/getScheduleByClassNumber/:classNumber", verifyJWT, WeeklyScheduleController.getScheduleByClassNumber);
router.put("/updateLessonInSchedule", verifyJWT, WeeklyScheduleController.updateLessonInSchedule);
module.exports = router;
