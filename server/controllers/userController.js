const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const crypto = require('crypto');
const { sendResetEmail } = require("../utils"); // ייבוא הפונקציה החדשה


const login = async (req, res) => {
    try {
        const { id, password } = req.body;

        if (!id || !password) {
            return res.status(400).json({ message: 'ID and password are required' });
        }

        const foundUser = await User.findOne({ id }).lean();
        if (!foundUser) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const isManager = id === process.env.MANAGER_ID;

        const userInfo = {
            _id: foundUser._id,
            name: foundUser.name,
            role: foundUser.role,
            id: foundUser.id,
            isManager
        };

        const accessToken = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h'
        });

        return res.status(200).json({ accessToken });
    } catch (err) {
        return res.status(500).json({ message: 'Login failed', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
    }
};

const register = async (req, res) => {
    try {
        const { name, id, email, password, role } = req.body;

        if (!name || !id || !password || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const normalizedId = String(id).trim();

        // בדיקה אם ה־id כבר קיים
        const duplicate = await User.findOne({ id: normalizedId }).lean();
        if (duplicate) {
            return res.status(409).json({ message: 'Duplicate ID' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userObject = {
            name,
            id: normalizedId,
            email: email.trim(), // השארת מייל חופשי
            password: hashedPassword,
            role: role || 'secretary'
        };

        const user = await User.create(userObject);
        return res.status(201).json({ message: `New user ${user.name} created` });

    } catch (err) {
        console.error('REGISTER ERROR >>>', err);

        if (err && err.code === 11000) {
            return res.status(409).json({ message: 'Duplicate ID' });
        }

        if (err && err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message).join('; ');
            return res.status(400).json({ message: 'Validation error', details: messages });
        }

        return res.status(500).json({
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id, name, password } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'ID is required' });
        }

        const user = await User.findOne({ id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (password) user.password = await bcrypt.hash(password, 10);

        await user.save();
        return res.status(200).json({ message: `User ${id} updated` });
    } catch (err) {
        return res.status(500).json({ message: 'Update failed', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'ID is required' });
        }

        const user = await User.findOne({ id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        return res.status(200).json({ message: `User ${id} deleted` });
    } catch (err) {
        return res.status(500).json({ message: 'Deletion failed', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
    }
};

const getAllUsers = async (req, res) => {
    try {
        // בדיקת הרשאת מנהל לפי ה-id
        if (!req.user || req.user.id !== process.env.MANAGER_ID) {
            return res.status(403).json({ message: "Only the manager can view all users" });
        }

        const users = await User.find({}, { password: 0 }).lean(); // לא מחזירים את הסיסמה
        return res.status(200).json(users);

    } catch (err) {
        return res.status(500).json({
            message: 'Failed to fetch users',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { id } = req.body;
        const user = await User.findOne({ id });

        // כדי לא לחשוף אם המשתמש קיים
        if (!user) return res.status(200).json({ message: "If the user exists, an email was sent" });

        // צור טוקן אקראי
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpire = Date.now() + 1000 * 60 * 15; // 15 דקות
        await user.save();

        // שלח מייל באמצעות הפונקציה הגנרית
        await sendResetEmail(user.email, resetToken);

        res.status(200).json({ message: "If the user exists, an email was sent" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
        resetToken: token,
        resetTokenExpire: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
};

module.exports = {
    login,
    register,
    updateUser,
    deleteUser,
    getAllUsers,
    forgotPassword,
    resetPassword
};
