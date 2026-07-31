# 🌱 GreenFlow

> A Smart Agriculture and Irrigation Management System built using the MERN Stack.

## 📖 Overview

GreenFlow helps farmers efficiently manage farms, schedule irrigation, monitor water usage, and make better farming decisions using weather data and analytics.

---

## ✨ Features

- 🌾 Farm Management
- 💧 Smart Irrigation Scheduling
- 🌦 Weather Information
- 📊 Analytics Dashboard
- 🔐 Secure User Authentication
- 📱 Responsive Design

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Authentication
- JWT
- bcrypt

### Deployment
- Render

---

## 📂 Project Structure

```text
GreenFlow/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── assets/
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
│
├── README.md
└── package.json
```

---

## 🚀 Installation

Clone the repository

```bash
git clone https://github.com/your-username/GreenFlow.git
```

Go to project folder

```bash
cd GreenFlow
```

Install dependencies

```bash
npm install
```

Install client dependencies

```bash
cd client
npm install
```

Install server dependencies

```bash
cd ../server
npm install
```

Run backend

```bash
npm run dev
```

Run frontend

```bash
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file inside the server folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

WEATHER_API_KEY=your_api_key
```

---

## 🏗 Architecture

```text
Farmer
   │
   ▼
React Frontend
   │
   ▼
Node.js + Express
   │
   ▼
MongoDB Database
   │
   ├── Authentication
   ├── Farm Management
   ├── Weather Service
   └── Analytics
```

---

## 🔄 Workflow

```text
Login
   │
   ▼
Dashboard
   │
   ▼
Select Farm
   │
   ▼
Check Weather
   │
   ▼
Schedule Irrigation
   │
   ▼
Monitor Water Usage
   │
   ▼
View Analytics
```

---

## 📡 API Endpoints

### Authentication

```
POST /api/auth/register

POST /api/auth/login
```

### Farms

```
GET /api/farms

POST /api/farms

PUT /api/farms/:id

DELETE /api/farms/:id
```

### Weather

```
GET /api/weather
```

### Dashboard

```
GET /api/dashboard
```

---

## 📈 Future Improvements

- 🤖 AI Irrigation Prediction
- 📱 Mobile Application
- 🌐 IoT Sensor Integration
- 🚁 Drone Monitoring
- 🛰 Satellite Analytics
- 🎤 Voice Assistant

---

## 🌍 Benefits

- Save Water
- Reduce Costs
- Improve Productivity
- Smart Farm Management
- Sustainable Agriculture

---

## ❤️ Built With

- React
- TypeScript
- Node.js
- Express.js
- MongoDB
- Tailwind CSS

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you like this project,

⭐ Star this repository

🍴 Fork the project

🤝 Contribute to GreenFlow
