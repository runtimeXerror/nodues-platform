# 🎓 NoDues Clearance Platform v2.0

Digital No-Dues Clearance System for **Rashtrakavi Ramdhari Singh Dinkar College of Engineering, Begusarai**

---

## 🗂️ Project Structure

```
nodues-v2/
├── backend/     → Node.js + Express + Sequelize + PostgreSQL
└── frontend/    → React.js + Vite
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js 18 + Vite + React Router v6 |
| **HTTP Client** | Axios with JWT interceptors |
| **Backend** | Node.js + Express.js |
| **ORM** | Sequelize v6 |
| **Database** | PostgreSQL 17 (Neon.tech — cloud hosted) |
| **DB Driver** | pg + pg-hstore |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Validation** | express-validator |
| **Security** | Helmet + express-rate-limit |
| **Email** | Nodemailer (Gmail SMTP) |
| **PDF** | PDFKit (server-side generation) |
| **Dev Server** | nodemon |

---

## ⚡ Quick Start (VS Code)

### Prerequisites
- Node.js v18+
- Git
- Neon.tech account (free PostgreSQL)

---

### Step 1 — Neon.tech Database Setup
1. Go to [neon.tech](https://neon.tech) → Sign up free
2. Create project → Name: `nodues-db` → Region: `AWS Asia Pacific (Singapore)`
3. Copy connection string:
```
postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

---

### Step 2 — Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — paste your Neon connection string
npm run dev
```

✅ Expected output:
```
Database synced
Admin created: admin@college.ac.in / Admin@1234
Server running on http://localhost:5000
```

---

### Step 3 — Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

✅ Opens `http://localhost:3000`

---

## 🔑 First Time Setup

1. Open `http://localhost:3000`
2. System checks if admin exists → shows **Setup Page** if not
3. Enter admin name, email, password → Submit
4. Logged in as Admin ✅
5. **Change default password immediately!**

---

## 📋 Environment Variables

### `backend/.env`
```env
PORT=5000

# Neon PostgreSQL
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# JWT
JWT_SECRET=your_long_random_secret_here

# Email (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=yourcollege@gmail.com
MAIL_PASS=your_gmail_app_password
MAIL_FROM=NoDues Portal <yourcollege@gmail.com>

# College Info (appears on certificate)
COLLEGE_NAME=Rashtrakavi Ramdhari Singh Dinkar College of Engineering
COLLEGE_SHORT=RRSDCE

NODE_ENV=development
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 👥 User Roles

| Role | Access | How Created |
|------|--------|-------------|
| **Admin** | Full system control | First-time setup page |
| **Teacher/Faculty** | Dept-wise approval | Join request → Admin approves → Email credentials |
| **Student** | Apply + track + download | Register with Uni. Reg. No. → Verified against DB → Email credentials |
| **Principal** | Final approval | Admin creates via panel or `/api/auth/create-principal` |
| **Principal Assistant** | Data correction complaints | Admin creates via panel |

---

## 📋 Complete Flow

```
1. Admin logs in
   → Adds departments (Library, Hostel, Accounts, etc.)
   → Uploads student database (manual or bulk CSV)

2. Teachers submit join requests
   → Admin approves → Credentials emailed automatically

3. Student registers with University Reg. No. + Email
   → System verifies against admin-loaded DB
   → If valid → Credentials emailed
   → If invalid → Error email + complaint form link

4. Student fills No-Dues form (8 fields + T&C mandatory)
   → Request sent to ALL registered teachers simultaneously

5. Each teacher approves their department section
   → Auto digital signature stamped (name + designation + dept + date/time)
   → Student emailed after each dept approval

6. All departments cleared
   → Request forwarded to Principal

7. Principal gives final approval
   → Auto Principal signature + College seal stamped
   → Student emailed: "Certificate is ready"

8. Student downloads certificate
   → Must type digital signature
   → Must accept T&C
   → PDF generated with all details + all signatures
```

---

## 📧 Gmail SMTP Setup

1. Google Account → Security → **2-Step Verification** ON
2. Security → **App Passwords** → Generate for "Mail"
3. Copy 16-character password → paste in `.env` as `MAIL_PASS`

---

## 🗄️ Database Config (`backend/src/config/database.js`)

```js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
});

module.exports = sequelize;
```

---

## 🚀 Deploy

### Backend → Render.com (Free)
1. New Web Service → Connect GitHub repo
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add Environment Variables (all from `.env`)

### Frontend → Vercel (Free)
1. Import GitHub repo
2. Root Directory: `frontend`
3. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
4. Deploy ✅

### Database → Neon.tech (Free)
- 0.5 GB storage (sufficient for 1500+ students)
- Auto-scales
- PostgreSQL 17
- Region: AWS Asia Pacific Singapore

---

## 🔌 API Reference

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/auth/check-setup | Public | Check if admin exists |
| POST | /api/auth/setup | Public | First-time admin setup |
| POST | /api/auth/login | Public | Admin / Teacher / Principal login |
| POST | /api/auth/student-login | Public | Student login with Reg. No. |
| POST | /api/auth/student-register | Public | Student register + verify |
| POST | /api/auth/teacher-register | Public | Teacher join request |
| PUT | /api/auth/change-password | Auth | Change password (first login) |
| GET | /api/auth/create-principal | Public | Create/reset principal account |
| GET | /api/auth/reset-password/:id | Public | Reset any user password to Test@1234 |
| GET | /api/admin/stats | Admin | Dashboard statistics |
| GET | /api/admin/pending-teachers | Admin | Pending teacher requests |
| POST | /api/admin/approve-teacher/:id | Admin | Approve teacher → email credentials |
| POST | /api/admin/reject-teacher/:id | Admin | Reject teacher → email notification |
| GET | /api/admin/allowed-students | Admin | Student whitelist |
| POST | /api/admin/allowed-students | Admin | Add single student |
| POST | /api/admin/allowed-students/bulk | Admin | Bulk add students |
| GET | /api/admin/departments | Admin | All departments |
| POST | /api/admin/departments | Admin | Add department |
| GET | /api/admin/requests | Admin | All clearance requests |
| GET | /api/clearance/departments | Public | Departments list |
| POST | /api/clearance/submit | Student | Submit no-dues form |
| GET | /api/clearance/my | Student | My requests + status |
| POST | /api/clearance/:id/sign-download | Student | Sign + download PDF |
| GET | /api/clearance/teacher-requests | Teacher | Pending dept requests (10/page) |
| PATCH | /api/clearance/dept/:id | Teacher | Approve / reject dept clearance |
| GET | /api/clearance/principal-pending | Principal | Fully cleared requests |
| POST | /api/clearance/principal-approve/:id | Principal | Final approval + seal |
| POST | /api/clearance/principal-reject/:id | Principal | Reject with reason |
| POST | /api/clearance/complaint | Public | Submit data correction complaint |

---

## ⚠️ Important Notes

```
1. reset-password route → Remove before production deployment
2. create-principal route → Remove before production deployment
3. Change all default passwords (Admin@1234, Test@1234) before going live
4. Neon.tech free tier → auto-sleeps after inactivity (5-10 sec cold start)
5. .env file → NEVER push to GitHub (already in .gitignore)
```

---

## 📁 Key Files

```
backend/
  src/
    config/
      database.js     → Neon PostgreSQL connection
      email.js        → Nodemailer + email templates
      seed.js         → Auto-seed admin + departments
    models/index.js   → All Sequelize models + associations
    controllers/
      authController.js      → Login, register, setup
      adminController.js     → Admin operations
      clearanceController.js → Clearance + PDF generation
    routes/index.js   → All API routes
    index.js          → Express app entry point

frontend/
  src/
    context/AuthContext.jsx  → Global auth state
    utils/api.js             → Axios + JWT interceptors
    components/
      Layout.jsx      → Sidebar + outlet
      Sidebar.jsx     → Role-based navigation
    pages/
      Landing.jsx     → Role selection (3 cards)
      Setup.jsx       → First-time admin setup
      Login.jsx       → Admin/Teacher/Principal login
      Auth.jsx        → Student/Teacher register
      Admin.jsx       → All admin pages
      Teacher.jsx     → Teacher approval dashboard
      Student.jsx     → Student dashboard + apply + certificate
      Principal.jsx   → Principal approval + complaints
```

---

Built with ❤️ for RRSDCE, Begusarai — Bihar Engineering University