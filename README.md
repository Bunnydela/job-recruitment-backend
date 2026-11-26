# Job Recruitment Portal Backend API

A RESTful backend MVP built with Node.js, Express, and MongoDB for the **TS Academy Backend Development Capstone Project**. Employers can post and manage job listings while candidates browse opportunities, submit applications, and track application statuses.

## Problem Solved & Target Users
- **Employers:** Publish job openings, review incoming candidate applications, and update hiring statuses (`pending`, `reviewed`, `accepted`, `rejected`).
- **Candidates:** Search available jobs, apply with a cover letter, and track application statuses without duplicate submissions.

## Technology Stack
- **Runtime & Framework:** Node.js, Express.js
- **Database & ODM:** MongoDB Atlas, Mongoose
- **Authentication & Security:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `dotenv`, `cors`
- **Testing:** Automated end-to-end API test suite (`tests/api.test.js`)

## Project Structure & Database Design
- `src/config/db.js`: MongoDB Atlas connection setup
- `src/middleware/auth.js`: JWT verification (`protect`) & role authorization (`authorize`)
- `src/middleware/errorHandler.js`: Centralized error handling
- `src/models/User.js`: `name`, `email` (unique), `password` (hashed), `role` (`employer` | `candidate`)
- `src/models/Job.js`: `title`, `description`, `location`, `salaryRange`, `employer` (ref `User`), `isActive`
- `src/models/Application.js`: `job` (ref `Job`), `candidate` (ref `User`), `coverLetter`, `status` (`pending` | `reviewed` | `accepted` | `rejected`)
- `src/routes/`: `auth.js`, `job.js`, and `application.js`
- `tests/api.test.js`: Automated end-to-end workflow tests

## Installation & Setup
1. Clone the repo and run `npm install`
2. Copy `.env.example` to `.env` and set `PORT=5000`, `MONGO_URI`, and `JWT_SECRET`
3. Start server with `npm run dev` (dev) or `npm start` (production)
4. Run automated tests with `npm test`

## Project Structure & Database Design
- `src/config/db.js`: MongoDB Atlas connection setup
- `src/middleware/auth.js`: JWT verification (`protect`) & role authorization (`authorize`)
- `src/middleware/errorHandler.js`: Centralized error handling
- `src/models/User.js`: `name`, `email` (unique), `password` (hashed), `role` (`employer` | `candidate`)
- `src/models/Job.js`: `title`, `description`, `location`, `salaryRange`, `employer` (ref `User`), `isActive`
- `src/models/Application.js`: `job` (ref `Job`), `candidate` (ref `User`), `coverLetter`, `status` (`pending` | `reviewed` | `accepted` | `rejected`)
- `src/routes/`: `auth.js`, `job.js`, and `application.js`
- `tests/api.test.js`: Automated end-to-end workflow tests

## Installation & Setup
1. Clone the repo and run `npm install`
2. Copy `.env.example` to `.env` and set `PORT=5000`, `MONGO_URI`, and `JWT_SECRET`
3. Start server with `npm run dev` (dev) or `npm start` (production)
4. Run automated tests with `npm test`

## Project Structure & Database Design
- `src/config/db.js`: MongoDB Atlas connection setup
- `src/middleware/auth.js`: JWT verification (`protect`) & role authorization (`authorize`)
- `src/middleware/errorHandler.js`: Centralized error handling
- `src/models/User.js`: `name`, `email` (unique), `password` (hashed), `role` (`employer` | `candidate`)
- `src/models/Job.js`: `title`, `description`, `location`, `salaryRange`, `employer` (ref `User`), `isActive`
- `src/models/Application.js`: `job` (ref `Job`), `candidate` (ref `User`), `coverLetter`, `status` (`pending` | `reviewed` | `accepted` | `rejected`)
- `src/routes/`: `auth.js`, `job.js`, and `application.js`
- `tests/api.test.js`: Automated end-to-end workflow tests

## Installation & Setup
1. Clone the repo and run `npm install`
2. Copy `.env.example` to `.env` and set `PORT=5000`, `MONGO_URI`, and `JWT_SECRET`
3. Start server with `npm run dev` (dev) or `npm start` (production)
4. Run automated tests with `npm test`

## API Documentation
All endpoints return `{ "success": true/false, "message": "...", "data": ... }`. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Public | Register user (`name`, `email`, `password`, `role`) |
| POST | `/api/auth/login` | Public | Login & receive JWT (`email`, `password`) |
| GET | `/api/auth/me` | Private | Get current user profile |
| GET | `/api/jobs` | Public | List/search active jobs (`?search=...&location=...`) |
| GET | `/api/jobs/:id` | Public | Get job details by ID |
| POST | `/api/jobs` | Employer | Create job listing (`title`, `description`, `location`, `salaryRange`) |
| PUT | `/api/jobs/:id` | Employer (Owner) | Update job listing |
| DELETE | `/api/jobs/:id` | Employer (Owner) | Delete job listing |
| POST | `/api/applications` | Candidate | Submit job application (`job`, `coverLetter`) |
| GET | `/api/applications` | Private | View own (candidate) or received (employer) applications |
| PATCH | `/api/applications/:id/status` | Employer (Owner) | Update application status (`pending`, `reviewed`, `accepted`, `rejected`) |
