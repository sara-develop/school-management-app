const express = require("express")
const router = express.Router()
const verifyJWT = require('../middleware/verifyJWT')
const Lesson = require("../controllers/lessonController")

router.post("/addLesson", verifyJWT, Lesson.addLesson)
router.get("/getLessonById/:id", verifyJWT, Lesson.getById)
router.get("/getAllLessons", verifyJWT, Lesson.getAll)
router.put("/updateLesson/:id", verifyJWT, Lesson.updateLesson)
router.delete("/deleteLesson/:id", verifyJWT, Lesson.deleteById)
router.post("/getMultiple", verifyJWT, Lesson.getMultiple)

module.exports = router
// This code defines the routes for managing lessons in a school system.
// It includes routes for adding, retrieving, updating, and deleting lessons.