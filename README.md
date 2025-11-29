# Student Attendance Management System
## Live Demo
[View App](https://your-live-link-if-exists.com)

מערכת ניהול נוכחות תלמידות מתקדמת  
ניהול תלמידות, שיעורים, מערכת שעות, דיווחי נוכחות ושליחת דוחות שבועיים במייל  
**Stack מלא: Node.js, Express, React, MongoDB, Redux, PrimeReact**

---

## טכנולוגיות עיקריות

| תחום         | טכנולוגיה/כלי         | תיאור |
|--------------|-----------------------|-------|
| Backend      | **Node.js**           | סביבת הרצה ל-JavaScript |
|              | **Express.js**        | מסגרת שרת מהירה ל-API |
|              | **MongoDB + Mongoose**| מסד נתונים לניהול תלמידות, שיעורים ומערכת שעות |
|              | **Nodemailer**        | שליחת דוחות נוכחות שבועיים להורים |
|              | **JWT**               | הרשאות משתמשים |
|              | **dotenv**            | ניהול משתני סביבה |
| Frontend     | **React**             | SPA מודרני |
|              | **Redux Toolkit**     | ניהול סטייט גלובלי |
|              | **PrimeReact**        | קומפוננטות UI מקצועיות לטפסים וטבלאות |
|              | **Axios**             | תקשורת בין הקליינט לשרת |
| DevOps       | **Nodemon**           | פיתוח מהיר בשרת |

---

## מבנה הפרויקט

```
Team Task Manager App/
│
├── server/                # צד שרת (Node.js + Fastify)
│   ├── db/                # חיבורי מסדי נתונים (SQL, Mongo, Redis)
│   ├── models/            # סכמות למסדי נתונים
│   ├── sql/               # ראוטים ולוגיקה ל-SQL (פרויקטים, משימות, משתמשים)
│   ├── mongoDB/           # הערות/תגובות (Mongo)
│   ├── mq/                # RabbitMQ Producer/Consumer
│   ├── json/              # דאטה לדוגמה/עזר
│   └── server.js          # קובץ הפעלה ראשי
│
├── client/                # צד לקוח (React)
│   ├── src/
│   │   ├── components/    # קומפוננטות (Kanban, Projects, Users, Comments)
│   │   └── services/      # קריאות API
│   └── public/            # קבצי סטטיים
│
└── README.md              # מדריך זה
```

---

---

## פיצ'רים עיקריים

- **ניהול תלמידות:** יצירה, עריכה, מחיקה וצפייה בפרטים מלאים.
- **ניהול שיעורים:** שם שיעור, מורה, ושיוך למערכת השעות.
- **מערכת שעות שבועית:**  
  ✔ עריכה ברמת שיעור  
  ✔ ולידציה: מניעת הכנסת שיעור במקום שיעור חסר  
  ✔ התאמה אוטומטית של lessonIndex

- **דיווחי נוכחות לפי שיעור:**  
  (נוכחת / מאחרת / נעדרת)

- **הפקת דוחות שבועיים:**  
  ✔ טבלת HTML מלאה מובנית במייל  
  ✔ שם התלמידה + פרשת שבוע  
  ✔ סימון P / L / A בשיעורים  
  ✔ אפשרות לשינוי טקסט גוף ההודעה לפני שליחה

- **שליחת דוחות במייל:**  
  לכל ההורים של כיתה בלחיצת כפתור אחת

- **מערכת משתמשים:**  
  הרשאת מנהל בלבד לעריכת מערכת שעות, ניהול תלמידות ושליחת דוחות.

---

## התקנה והרצה

### דרישות מוקדמות
- Node.js 18+
- MongoDB רץ מקומית
- npm

### התקנת צד שרת
```bash
cd server
npm install
npm run dev
.

---

## התקנה והרצה

### דרישות מוקדמות
- Node.js 18+
- SQL Server (Express/Local)
- MongoDB
- Redis
- Docker (להרצת RabbitMQ)

### התקנת צד שרת
```bash
cd server
npm install
# ערוך את קובץ .env לפי הצורך
npm run dev
```
PORT=1235
MONGO_URI=mongodb://localhost:27017/attendance
EMAIL_USER=yourEmail@gmail.com
EMAIL_PASS=yourGeneratedAppPassword
JWT_SECRET=yourSecretKey

### התקנת צד לקוח
```bash
cd client
npm install
npm start
```

### הרצת RabbitMQ (Docker)
```bash
cd server/mq
docker compose up -d
```

---

## דגשים טכנולוגיים

- **שכבות קוד מופרדות:** כל ישות (משתמשים, פרויקטים, משימות) מחולקת ל-controller ו-route.
- **שימוש ב-Redis:** טעינת Kanban מהירה, עדכון אוטומטי בכתיבה.
- **שימוש ב-RabbitMQ:** כל שיוך משימה למשתמש שולח הודעה ל-Queue, עם Consumer שמדפיס/מדמה שליחת התראה.
- **MongoDB:** הערות נשמרות במסד NoSQL, גמיש ונוח.
- **React Kanban:** ממשק מודרני, Drag & Drop, עיצוב צבעוני לכל סטטוס.
- **בדיקות:** תשתית מוכנה לבדוקי API ו-UI.

---

## הרחבות אפשריות

- אימות משתמשים (JWT)
- הרשאות לפי תפקיד
- שליחת התראות במייל/SMS
- דוחות סטטיסטיים
- בדיקות אוטומטיות

---

## תרומה והרצה

- מוזמנים להציע פיצ'רים, לדווח על באגים ולתרום קוד!
- להרצה בסביבת פיתוח – ראו הוראות למעלה.
- להרצה בסביבת Production – יש להוסיף reverse proxy, הגדרות אבטחה, ועוד.

---

## שאלות ותמיכה

לכל שאלה, פנייה או תמיכה – ניתן לפנות אליי במייל או ב-GitHub.

---

בהצלחה!
