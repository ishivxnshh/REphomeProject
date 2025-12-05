## Rephome – MERN Phone Repair Booking App

A complete **MERN stack** application for doorstep phone repair bookings, with **JWT authentication**, **user-owned bookings**, OTP verification over email, and an admin view for managing requests.

### Overview
- **What it does**: Lets customers book doorstep phone repairs, verify bookings via email OTP, and track booking status.
- **Who it’s for**: End users who need quick repair bookings and admins/ops teams who manage those bookings.
- **Architecture**: Node/Express API + MongoDB backend, React + Vite frontend, stateless JWT auth.

### Tech Stack
- **Server**: Node.js, Express, Mongoose (MongoDB)
- **Client**: React 18, Vite, React Router
- **Auth**: JSON Web Tokens (JWT) with role-based access for admin

### Repository Structure
```
.
├─ server/          # Express API (MongoDB, JWT auth, bookings, OTP email)
├─ client/          # React app (auth, dashboards, bookings UI)
└─ (no root package.json)
```

## Getting Started

### 1. Prerequisites
- **Node.js**: 18+
- **npm**: 9+
- **MongoDB**: running locally at `mongodb://127.0.0.1:27017` (or update the URI in `.env`)

### 2. Backend Environment Variables
Create a `.env` file in `server/`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/rephome
JWT_SECRET=replace_with_long_random_string
CLIENT_URL=http://localhost:5173

# Email Configuration (for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Email setup notes**
- **Gmail**: Use an **App Password** (not your regular password). Enable 2FA and generate one at `https://myaccount.google.com/apppasswords`.
- **Other providers**: Update `SMTP_HOST` and `SMTP_PORT` accordingly.
- **Testing-only**: You can use services like Mailtrap or Ethereal Email to avoid sending real emails.

### 3. Install Dependencies
From the repository root:

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Run in Development
Run server and client in separate terminals:

```bash
# Terminal 1 – API
cd server
npm run dev

# Terminal 2 – React client
cd client
npm run dev
```

- **Client**: `http://localhost:5173`
- **API**: `http://localhost:5000`
- **Health check**: `GET /api/health` → `{ "status": "ok" }`

## API Reference

### Base URL
- **Base**: `http://localhost:5000/api`

### Auth
- **POST** `/auth/register`  
  - **Body**: `{ name, email, password }`
- **POST** `/auth/login`  
  - **Body**: `{ email, password }`
- **GET** `/auth/me`  
  - **Headers**: `Authorization: Bearer <token>`

### Bookings (Authenticated)
- **GET** `/bookings`  
  - Lists bookings for the **current user**.
- **POST** `/bookings`  
  - Creates a booking and sends an OTP email.
  - **Body**:  
    `{ name, phone, email, address, deviceModel, issue, description?, preferredDate, preferredTime }`
  - **Returns**: booking with `otpSent` status.
- **POST** `/bookings/verify-otp`  
  - Confirms booking via OTP.  
  - **Body**: `{ bookingId, otp }`
- **POST** `/bookings/resend-otp`  
  - Resends OTP email.  
  - **Body**: `{ bookingId }`
- **GET** `/bookings/:id`  
  - Fetch a single **own** booking.
- **PUT** `/bookings/:id`  
  - Update a **own** booking (e.g., reschedule, details).
- **DELETE** `/bookings/:id`  
  - Cancel a **own** booking (`status = "cancelled"`).

### Admin (role: `admin`)
- **GET** `/bookings/admin/all`  
  - List all bookings in the system.
- **PATCH** `/bookings/admin/:id/status`  
  - Update booking status.  
  - **Body**: `{ status }` where  
    `status ∈ "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"`.

## Client App Overview

- **State & auth**
  - JWT token and user info stored in `localStorage`.
  - Protected routes check for a valid token.
- **Pages**
  - **Login**: `/login`
  - **Register**: `/register`
  - **Dashboard**: `/` (quick links and overview)
  - **My Bookings**: `/bookings` (protected; shows user’s bookings)
- **Demo flow**
  - A minimal **“Create booking”** flow exists to verify end-to-end API + email OTP working.

## Development Notes

- **CORS** is configured on the backend to allow `CLIENT_URL`.
- Legacy static pages were removed in favor of the modern React client in `client/`.
- All backend logic (auth, bookings, email, etc.) lives under `server/`.

## Useful Commands

- **Run server (dev)**: `cd server && npm run dev`
- **Run client (dev)**: `cd client && npm run dev`

## Production Considerations

- **Security**
  - Use a strong, unique `JWT_SECRET` per environment.
  - Lock down `CLIENT_URL` to your real frontend origin(s).
  - Consider rate limiting, request validation (e.g., zod/joi), and structured logging (morgan/pino).
- **Deployment**
  - Serve the React app via a production host (e.g., Vercel, Netlify, or behind Nginx).
  - Host the API on a Node-friendly platform (e.g., Render, Railway, EC2, etc.).
  - Configure HTTPS and secure cookies if you move to cookie-based auth.
- **Ops**
  - Configure CI/CD, environment secrets, and backups for MongoDB.

## Troubleshooting

- **MongoDB connection issues**
  - Ensure MongoDB is running and `MONGODB_URI` is correct.
- **CORS errors in the browser**
  - Verify `CLIENT_URL` in `server/.env` and restart the API server.
- **Windows PowerShell execution**
  - Run commands **from the repository root** or the respective `server/` / `client/` folder.

---

This README covers end-to-end **setup, run, and usage** for the Rephome MERN app.  
For UI/UX enhancements, new features, or production hardening, feel free to extend these sections or add your own documentation.