<div align="center">

# 🌱 GreenFlow
### AI-Powered Smart Agriculture & Irrigation Management Platform

<p align="center">

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![NodeJS](https://img.shields.io/badge/Node.js-22-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Backend-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwindcss)
![Render](https://img.shields.io/badge/Deployment-Render-5f43dc)
![License](https://img.shields.io/badge/License-MIT-blue)

</p>

A modern **AI-powered Agriculture Management Platform** built with the **MERN Stack** that enables farmers to efficiently manage farms, monitor irrigation, analyze crop performance, optimize water usage, track weather conditions, and make data-driven farming decisions.

---

</div>

# 📖 Table of Contents

- Introduction
- Features
- Technology Stack
- System Architecture
- Project Structure
- Installation
- Environment Variables
- API Documentation
- Authentication
- Security
- Screenshots
- Deployment
- Performance
- Future Roadmap
- Contributing
- License

---

# 🌍 Introduction

GreenFlow is an intelligent agriculture platform designed for modern farming.

The application provides:

- Smart Farm Management
- Irrigation Scheduling
- Weather Forecasting
- Water Consumption Analytics
- Crop Monitoring
- Secure Authentication
- Dashboard Analytics
- AI Ready Architecture

GreenFlow aims to reduce water waste while improving agricultural productivity using data-driven decision making.

---

# ✨ Core Features

## 👨‍🌾 Farm Management

- Create unlimited farms
- Edit farm details
- Delete farms
- Farm location tracking
- Farm area calculation
- Crop information
- Soil type management

---

## 💧 Smart Irrigation

- Automatic irrigation scheduler
- Manual irrigation control
- Water usage monitoring
- Daily irrigation history
- Irrigation calendar
- Irrigation reminders

---

## 🌦 Weather Module

- Current weather
- Temperature
- Humidity
- Wind Speed
- Rain Prediction
- Weather Alerts
- 7 Day Forecast

---

## 📊 Dashboard

Interactive dashboard showing

- Total Farms
- Active Crops
- Water Consumption
- Irrigation Status
- Monthly Analytics
- Productivity Reports
- Weather Summary

---

## 📈 Analytics

Charts include

- Water Usage
- Crop Growth
- Farm Statistics
- Monthly Reports
- Rain Analysis
- Irrigation Efficiency

---

## 🔐 Authentication

- JWT Authentication
- Password Encryption
- Protected Routes
- Role Based Authorization
- Secure Login
- Session Management

---

## 👤 User Profile

- Profile Management
- Password Update
- Farm Preferences
- Notification Settings
- Language Settings

---

# 🚀 Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hook Form
- React Icons
- Framer Motion
- Chart.js
- React ChartJS
- Leaflet Maps

---

## Backend

- Node.js
- Express.js
- REST API
- JWT Authentication
- Multer
- Morgan
- Helmet
- CORS
- Compression
- Express Validator

---

## Database

- MongoDB
- Mongoose

---

## Cloud

- Render
- MongoDB Atlas
- Cloudinary

---

## APIs

- OpenWeather API
- Map API
- Email Service
- SMS Gateway

---

# 🏗 System Architecture

```text
                     +--------------------+
                     |    Farmer Mobile   |
                     +--------------------+
                               |
                               |
                     HTTPS REST API
                               |
               +-----------------------------+
               |      React Frontend         |
               +-----------------------------+
                               |
                               |
                     Axios HTTP Requests
                               |
               +-----------------------------+
               |     Express REST API        |
               +-----------------------------+
                  |       |          |
                  |       |          |
             JWT Auth  Weather   Analytics
                  |       |          |
                  +-------+----------+
                          |
                   MongoDB Database
                          |
          Farms • Users • Crops • Reports
```

---

# 📂 Project Structure

```text
GreenFlow/

client/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── layouts/
│   ├── services/
│   ├── context/
│   ├── utils/
│   ├── routes/
│   ├── styles/
│   ├── types/
│   └── App.tsx
│
└── package.json

server/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── validators/
├── uploads/
├── app.js
├── server.js
└── package.json

README.md
LICENSE
```

---

# ⚙ Installation

Clone Repository

```bash
git clone https://github.com/yourusername/GreenFlow.git
```

Move into folder

```bash
cd GreenFlow
```

Install dependencies

```bash
npm install
```

Install Frontend

```bash
cd client
npm install
```

Install Backend

```bash
cd ../server
npm install
```

---

# ▶ Run Development Server

Backend

```bash
npm run dev
```

Frontend

```bash
npm run dev
```

Application

```
Frontend

http://localhost:5173

Backend

http://localhost:5000
```

---

# 🔐 Environment Variables

Server

```env
PORT=5000

NODE_ENV=development

MONGO_URI=mongodb+srv://...

JWT_SECRET=your_jwt_secret

JWT_EXPIRE=7d

WEATHER_API_KEY=xxxxxxxx

EMAIL_USER=example@gmail.com

EMAIL_PASSWORD=password

CLIENT_URL=http://localhost:5173

CLOUDINARY_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_SECRET=
```

---

# 📡 REST API

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
PUT  /api/auth/profile
PUT  /api/auth/change-password
```

---

## Farms

```http
GET /api/farms

GET /api/farms/:id

POST /api/farms

PUT /api/farms/:id

DELETE /api/farms/:id
```

---

## Irrigation

```http
GET /api/irrigation

POST /api/irrigation

PUT /api/irrigation/:id

DELETE /api/irrigation/:id
```

---

## Weather

```http
GET /api/weather/current

GET /api/weather/forecast

GET /api/weather/history
```

---

## Dashboard

```http
GET /api/dashboard

GET /api/dashboard/analytics

GET /api/dashboard/statistics
```

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing (bcrypt)
- HTTPS Ready
- Helmet Security
- Rate Limiting
- MongoDB Injection Protection
- XSS Protection
- CORS Configuration
- Secure Cookies
- Input Validation
- Environment Variable Protection

---

# ⚡ Performance

- Lazy Loading
- Code Splitting
- Image Optimization
- Compression
- API Caching
- Optimized MongoDB Queries
- Reusable Components
- Efficient State Management

---

# 📊 Database Schema

```text
Users
│
├── name
├── email
├── password
├── role
└── createdAt

Farms
│
├── farmName
├── location
├── crop
├── area
├── soilType
└── owner

Irrigation
│
├── farmId
├── date
├── duration
├── waterUsage
└── status

Weather
│
├── temperature
├── humidity
├── rainfall
└── forecast
```

---

# 📱 Responsive Design

✔ Desktop

✔ Tablet

✔ Mobile

✔ Progressive Web App Ready

---

# ☁ Deployment

Frontend

```
Vercel
```

Backend

```
Render
```

Database

```
MongoDB Atlas
```

Images

```
Cloudinary
```

---

# 🤖 Future Roadmap

- AI Irrigation Prediction
- Machine Learning Crop Recommendation
- IoT Sensor Integration
- Drone Monitoring
- Satellite Monitoring
- Disease Detection
- Yield Prediction
- Voice Assistant
- Offline Support
- Mobile Application
- GPS Tracking
- Smart Notifications
- Multi Language Support
- AI Chatbot
- Blockchain Crop Traceability

---

# 🤝 Contributing

Contributions are welcome.

1. Fork Repository

2. Create Feature Branch

```bash
git checkout -b feature/new-feature
```

3. Commit Changes

```bash
git commit -m "Added new feature"
```

4. Push

```bash
git push origin feature/new-feature
```

5. Create Pull Request

---

# 📜 License

Licensed under the MIT License.

---

# ❤️ Developed With

- React
- TypeScript
- Node.js
- Express.js
- MongoDB
- Tailwind CSS
- Vite
- JWT
- Chart.js
- Leaflet
- Render

---

<div align="center">

## ⭐ If you like GreenFlow

Give this repository a ⭐

Fork 🍴

Contribute ❤️

Build Smart Agriculture Together 🌱

</div>
