# Apex Learning Hub - Enterprise Authentication System

A production-ready, full-stack authentication system for Apex Learning Hub, built with **React + Vite + TypeScript** (frontend) and **Flask + PostgreSQL** (backend).

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 14+ (or Docker)
- Git

---

### 1. Start PostgreSQL (Docker)

```bash
docker-compose up -d
```

This starts:

- **PostgreSQL** on `localhost:5432`
- **pgAdmin** on `http://localhost:5050` (admin@apexhub.edu / admin123)

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your database/mail/Google credentials

# Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Start Flask server
python run.py
```

Backend runs on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already done)
npm install

# Configure environment
copy .env.example .env
# Edit .env with your Google Client ID

# Start dev server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 📁 Project Structure

```
demo tester 1/
├── frontend/              # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # AuthContext, ThemeContext
│   │   ├── pages/        # Auth pages + Dashboard pages
│   │   ├── routes/       # Protected route guards
│   │   ├── services/     # API service functions
│   │   └── types/        # TypeScript types
│   ├── .env              # Frontend environment
│   └── vercel.json       # Vercel deployment
│
├── backend/               # Flask API
│   ├── app/
│   │   ├── models/       # SQLAlchemy models
│   │   ├── routes/       # Auth + User blueprints
│   │   ├── services/     # OTP service
│   │   └── utils/        # Validators, audit logging
│   ├── .env.example
│   ├── render.yaml       # Render deployment
│   └── requirements.txt
│
└── docker-compose.yml     # PostgreSQL + pgAdmin
```

---

## 🔐 Authentication Features

| Feature                    | Status |
| -------------------------- | ------ |
| Username / Email Login     | ✅     |
| Password Login             | ✅     |
| Google OAuth               | ✅     |
| JWT Access Tokens (15 min) | ✅     |
| Refresh Tokens (7 days)    | ✅     |
| Remember Me                | ✅     |
| Forgot Password (OTP Flow) | ✅     |
| Email Verification (OTP)   | ✅     |
| Reset Password             | ✅     |
| Role-Based Access Control  | ✅     |
| Dark Mode                  | ✅     |
| Rate Limiting              | ✅     |
| Audit Logs                 | ✅     |
| Login History              | ✅     |

---

## 👥 Roles & Redirects

| Role    | Dashboard            |
| ------- | -------------------- |
| Admin   | `/admin/dashboard`   |
| Teacher | `/teacher/dashboard` |
| Student | `/student/dashboard` |
| Parent  | `/parent/dashboard`  |

---

## 🌐 API Reference

### Auth Endpoints

| Method | Endpoint                    | Description                       |
| ------ | --------------------------- | --------------------------------- |
| `POST` | `/api/auth/register`        | Register new user                 |
| `POST` | `/api/auth/login`           | Login (username/email + password) |
| `POST` | `/api/auth/google-login`    | Google OAuth                      |
| `POST` | `/api/auth/logout`          | Logout                            |
| `POST` | `/api/auth/refresh`         | Refresh access token              |
| `GET`  | `/api/auth/profile`         | Get current user profile          |
| `POST` | `/api/auth/forgot-password` | Send OTP to email                 |
| `POST` | `/api/auth/verify-otp`      | Verify OTP                        |
| `POST` | `/api/auth/reset-password`  | Reset password                    |
| `POST` | `/api/auth/resend-otp`      | Resend OTP                        |

### User Endpoints

| Method | Endpoint                  | Description    |
| ------ | ------------------------- | -------------- |
| `GET`  | `/api/user/profile`       | Get profile    |
| `PUT`  | `/api/user/profile`       | Update profile |
| `POST` | `/api/user/avatar`        | Upload avatar  |
| `GET`  | `/api/user/login-history` | Login history  |
| `GET`  | `/api/user/audit-logs`    | Audit logs     |

---

## 🚀 Deployment

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import to Vercel
3. Add environment variables from `.env.example`
4. Deploy!

### Backend → Render

1. Push `backend/` to GitHub
2. Import to Render using `render.yaml`
3. Add secret environment variables (MAIL_PASSWORD, GOOGLE_CLIENT_SECRET)
4. Deploy!

---

## 🔧 Environment Variables

### Backend (`.env`)

```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=postgresql://postgres:password@localhost:5432/auth_db
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-app-password
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
CORS_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** (Web Application)
4. Add to **Authorized JavaScript Origins**:
   - `http://localhost:5173`
   - Your production URL
5. Copy the **Client ID** to both `.env` files

---

## 📧 Gmail SMTP Setup

1. Enable **2-Step Verification** on your Gmail account
2. Go to **Google Account → Security → App Passwords**
3. Generate an App Password for **Mail**
4. Use that 16-character password as `MAIL_PASSWORD`

---

## 🏗️ Tech Stack

**Frontend:** React 18 · Vite · TypeScript · Tailwind CSS v4 · Framer Motion · React Router DOM · Axios · React Hook Form · Zod · React Query · React Hot Toast · Lucide React

**Backend:** Flask · Flask-JWT-Extended · Flask-SQLAlchemy · Flask-Bcrypt · Flask-Mail · Flask-CORS · Flask-Migrate · Flask-Limiter

**Database:** PostgreSQL

**Infrastructure:** Docker · Vercel · Render

---

## 📄 License

MIT License — Free for educational and commercial use.
