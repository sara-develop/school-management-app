import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { setUser } from './store/userSlice';
import store from './store/store';

import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import HomePage from './components/HomePage';
import ScheduleManagement from './components/schedule/ScheduleManagement';
import StudentManagement from './components/students/StudentManagement';
import LessonsManagement from './components/lessons/LessonsManagement';
import Attendance from './components/attendance/Attendance';
import AllUsers from './components/users/AllUsers';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';


function AppContent() {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.user.token);
    const username = useSelector((state) => state.user.username);

    useEffect(() => {
        // אם אין כבר משתמש ב-Redux, ננסה לשלוף מה-localStorage
        if (!token || !username) {
            const storedToken = localStorage.getItem('token');
            const storedUsername = localStorage.getItem('username');
            const storedIsManager = localStorage.getItem('isManager') === 'true';

            if (storedToken && storedUsername) {
                dispatch(setUser({
                    token: storedToken,
                    username: storedUsername,
                    isManager: storedIsManager
                }));
            }
        }
    }, [dispatch, token, username]);

    return (
        <Router>
            <Routes>
                {/* עמוד login ללא Layout */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* דפים אחרים עם Layout */}
                <Route path="/schedule" element={<Layout><ScheduleManagement /></Layout>} />
                <Route path="/lessons" element={<Layout><LessonsManagement /></Layout>} />
                <Route path="/students" element={<Layout><StudentManagement /></Layout>} />
                <Route path="/homePage" element={<Layout><HomePage /></Layout>} />
                <Route path="/attendance" element={<Layout><Attendance /></Layout>} />
                <Route path="/allUsers" element={<Layout><AllUsers /></Layout>} />

            </Routes>
        </Router>
    );
}

function App() {
    return (
        <Provider store={store}>
            <AppContent />
        </Provider>
    );
}

export default App;
// App.js - הקובץ הראשי של הלקוח