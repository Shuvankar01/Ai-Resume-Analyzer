# AI Resume Analyzer

A full-stack, production-grade AI Resume Analyzer built with FastAPI, React, PostgreSQL, Redis, Docker, and Google Gemini API.

Designed to simulate a real-world ATS (Applicant Tracking System), this platform helps candidates optimize resumes for job descriptions while giving recruiters powerful analytics and ranking insights.

---

## Features

### Candidate Features

* Secure JWT-based Authentication
* PDF Resume Upload System
* ATS Score Calculation against Job Description
* Matched Keywords Detection
* Missing Skills Identification
* AI-Powered Recommendations
* Recruiter Summary Insights
* Candidate Strength Analysis
* PDF Report Export

### Recruiter Features

* Recruiter Dashboard Analytics
* Average ATS Score Monitoring
* Top Missing Skills Analysis
* Candidate Ranking System
* Resume Performance Tracking

### System Features

* Dockerized Microservice Architecture
* Redis Caching for Faster Duplicate Analysis
* PostgreSQL Production Database
* Alembic Database Migrations
* Role-Based Authentication (Candidate / Recruiter)
* Premium Dark UI with Glassmorphism + Neon Theme

---

## Tech Stack

### Frontend

* React
* Vite
* TailwindCSS
* Axios

### Backend

* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* Python 3.11

### Database & Caching

* PostgreSQL
* Redis

### AI Integration

* Google Gemini API

### DevOps

* Docker
* Docker Compose
* Alembic

---

## Screenshots

### Login Page

![Login Page](./screenshots/login.png)

### Candidate Dashboard

![Candidate Dashboard](./screenshots/dashboard.png)

### Recruiter Dashboard

![Recruiter Dashboard](./screenshots/recruiter-dashboard.png)

---

## Project Structure

```text
ai-resume-analyzer/
│
├── backend/
│   ├── routers/
│   ├── models/
│   ├── schemas/
│   ├── utils/
│   ├── services/
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── docker-compose.yml
├── alembic/
├── README.md
└── .env
```

---

## Prerequisites

Before running the project, make sure you have:

* Docker
* Docker Compose
* Google Gemini API Key

---

## Setup & Running

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-resume-analyzer.git
cd ai-resume-analyzer
```

---

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
DATABASE_URL=your-postgres-url
REDIS_URL=your-redis-url
SECRET_KEY=your-secret-key
```

> Never push `.env` files to GitHub.

---

### 3. Build and Start Application

```bash
docker-compose up --build
```

---

### 4. Apply Database Migrations

Once backend is running:

```bash
docker-compose exec backend alembic upgrade head
```

---

## Services

### Frontend

[http://localhost:3000](http://localhost:3000)

### Backend API

[http://localhost:8000](http://localhost:8000)

### API Documentation

[http://localhost:8000/docs](http://localhost:8000/docs)

(FastAPI Swagger UI)

---

## Usage Flow

### Candidate Flow

1. Register/Login
2. Upload Resume PDF
3. Paste Target Job Description
4. Click **Analyze Match**
5. View ATS Score + Recommendations
6. Export Final PDF Report

### Recruiter Flow

1. Login as Recruiter
2. Access Analytics Dashboard
3. View Candidate Rankings
4. Track Missing Skills Trends
5. Monitor Overall ATS Performance

---

## Future Improvements

* Real-Time AI Response Streaming
* Resume Version History
* AI Interview Preparation Assistant
* Cloud Deployment (AWS / Render / Railway)
* GitHub Actions CI/CD Pipeline
* Team-Based Recruiter Collaboration
* Resume Benchmark Against Top Candidates
* Mobile Responsive Optimization

---

## Live Demo

Frontend: Coming Soon

Backend API: Coming Soon

---

## Author

## Shuvankar Sahoo

* GitHub: [https://github.com/yourusername](https://github.com/Shuvankar01)
* LinkedIn: [https://linkedin.com/in/your-linkedin](https://www.linkedin.com/in/shuvankarsahoo/)

---

## Why This Project Matters

This project demonstrates:

* Production-ready backend architecture
* Real-world AI integration
* Resume optimization using ATS logic
* Secure authentication systems
* Dockerized deployment workflow
* Scalable recruiter analytics system

This is not a basic CRUD project — it is designed as a startup-level portfolio project for backend, full-stack, and AI-focused internship opportunities.
