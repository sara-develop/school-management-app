const express = require("express")
const router = express.Router()

const User = require("../controllers/userController")
const verifyJWT = require('../middleware/verifyJWT')

// פתוח לכולם
router.post("/login", User.login)
router.post("/forgotPassword", User.forgotPassword)
router.post("/resetPassword", User.resetPassword)


// רק למשתמשים שמחוברים
router.put("/updateUser", verifyJWT, User.updateUser)
router.delete("/deleteUser", verifyJWT, User.deleteUser)
router.post("/register", verifyJWT, User.register)
router.get("/getAllUsers", verifyJWT, User.getAllUsers)

module.exports = router
