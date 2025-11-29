const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const Student = require("./models/student");
const fs = require("fs");
const pLimitImport = async () => (await import('p-limit')).default;
const WeeklySchedule = require('./models/weeklySchedule');

// פונקציה גנרית לשליחת מייל
async function sendEmail({ to, subject, text, html, attachments }) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    try {
        await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text, html, attachments });
        console.log(`Email sent to ${to}`);
    } catch (err) {
        console.error("Error sending email:", err);
        throw err;
    }
}

// שליחת מייל איפוס סיסמה
async function sendResetEmail(to, token) {
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    await sendEmail({
        to,
        subject: "Reset Your Password",
        text: `Click here to reset your password: ${resetLink}`,
    });
}

// פונקציה לשליחת דוחות נוכחות שבועיים כטבלת HTML במייל
async function sendWeeklyAttendanceEmails(customBodyText, parshaTitle) {
    try {
        const pLimit = await pLimitImport();
        const limit = pLimit(5);

        const students = await Student.find({ active: true });

        const days = [
            { key: 'sunday', label: 'ראשון' },
            { key: 'monday', label: 'שני' },
            { key: 'tuesday', label: 'שלישי' },
            { key: 'wednesday', label: 'רביעי' },
            { key: 'thursday', label: 'חמישי' },
        ];

        // טקסט ברירת מחדל
        const defaultBodyText =
            `Hi,

Attached is your daughter's attendance for the week.

Thank you,`;

        const bodyText = (customBodyText && customBodyText.trim())
            ? customBodyText
            : defaultBodyText;

        // פרשה — אך אם ריק → לא מציג כלל
        const effectiveParshaTitle =
            (parshaTitle && parshaTitle.trim())
                ? parshaTitle.trim()
                : null; // 👈 אם אין פרשה – null

        // הוספת תצוגה יפה (רק אם קיימת פרשה)
        const parshaDisplay = effectiveParshaTitle
            ? ` - ${effectiveParshaTitle}`
            : ""; // 👈 אחרת לא מציג כלום

        const buildHtmlBodyFromText = (text) => {
            return text
                .split(/\n{2,}/)
                .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
                .join('\n');
        };

        const htmlIntro = buildHtmlBodyFromText(bodyText);

        const statusToSymbol = (status) => {
            switch (status) {
                case 'Present': return 'P';
                case 'Late': return 'L';
                case 'Absent': return 'A';
                default: return '';
            }
        };

        const sendMailForStudent = async (student) => {
            const attendance = student.weeklyAttendance || {};

            const maxLessons = Math.max(
                0,
                ...days.map(d => (attendance[d.key] || []).length)
            );

            if (maxLessons === 0) {
                console.log(`No attendance data for ${student.name}, skipping email`);
                return;
            }

            // ---- בניית ה־HTML ----
            let html = `
                ${htmlIntro}

                <div style="width:100%; text-align:center; margin-top:20px;" dir="rtl">
                <table border="1" cellpadding="6" cellspacing="0"
                    style="
                        border-collapse: collapse;
                        margin-left:auto;
                        margin-right:auto;
                        text-align: center;
                        font-family: Arial, sans-serif;
                    "
                >
                    <thead>
                        <tr>
                            <th colspan="${maxLessons + 2}" 
                            style="text-align:center; font-size:16px; padding:8px; font-weight:normal;">
                                ${student.name}${parshaDisplay}
                            </th>
                        </tr>
                        <tr>
                    <th style="font-weight: normal;">יום</th>
            `;

            for (let i = 0; i < maxLessons; i++) {
                html += `<th style="font-weight: normal;">שיעור ${i + 1}</th>`;
            }

            html += `
                        </tr>
                    </thead>
                    <tbody>
            `;

            days.forEach(d => {
                html += `<tr>`;
                html += `<td>${d.label}</td>`;

                for (let i = 0; i < maxLessons; i++) {
                    const dayEntries = attendance[d.key] || [];
                    const entry = dayEntries.find(e => Number(e.lessonIndex) === i);
                    html += `<td>${statusToSymbol(entry?.status)}</td>`;
                }

                html += `</tr>`;
            });

            html += `
                    </tbody>
                </table>
                </div>
            `;

            await sendEmail({
                to: student.parentEmail,
                subject: `Attendance Report`,
                text: bodyText + `

(Attendance table is shown in the email body.)`,
                html,
            });
        };

        await Promise.all(
            students.map(student => limit(() => sendMailForStudent(student)))
        );

        return { message: "Emails sent successfully!" };

    } catch (err) {
        console.error("Error sending weekly attendance emails:", err);
        throw new Error(err.message || "Error sending emails");
    }
}

function isValidId(id) {
    if (id.length !== 9 || !/^\d+$/.test(id)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        let digit = parseInt(id[i]);
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
    }
    return sum % 10 === 0;
}

// איפוס נוכחות שבועית
const resetWeeklyAttendance = async () => {
    try {
        await Student.updateMany({}, {
            $set: {
                weeklyAttendance: {
                    sunday: [], monday: [], tuesday: [], wednesday: [], thursday: []
                }
            }
        });
        console.log('Weekly attendance reset successfully.');
    } catch (err) {
        console.error('Error resetting weekly attendance:', err);
    }
};

module.exports = {
    isValidId,
    resetWeeklyAttendance,
    sendWeeklyAttendanceEmails,
    sendResetEmail,
    sendEmail
};
