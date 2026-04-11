# ⚡ SwiftCourier - MERN Courier Management System

A full-stack courier management system built using the MERN stack to manage courier bookings, tracking, and delivery workflows with role-based access.

---

## 🚀 Features
- JWT authentication with Customer / Admin roles  
- Book couriers with auto-generated Tracking ID + OTP  
- Real-time status tracking with animated progress bar  
- Admin dashboard with Recharts pie/bar charts  
- OTP verification to complete delivery  
- Dark mode toggle  
- Toast notifications  
- Fully responsive design  

---

## 🧰 Tech Stack

**Frontend:**
- React  
- Recharts  
- CSS3  

**Backend:**
- Node.js  
- Express.js  
- MongoDB  
- JWT Authentication  

---

## 📋 Prerequisites
- Node.js v16+  
- MongoDB (Local or Atlas)  

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/PrathikshaAmin/swiftcourier.git
cd swiftcourier
```

### 2. Backend Setup
```bash
cd backend  
npm install  
```

Create a `.env` file inside backend and add:  
```bash
MONGO_URI=your_mongodb_uri  
JWT_SECRET=your_secret_key  
```

Run backend:  
```bash
npm run dev  
```
Server runs on: http://localhost:5000  

### 3. Frontend Setup
```bash
cd frontend  
npm install  
npm start  
```
App runs on: http://localhost:3000  

---

## 🔐 Default Admin Account
Register a new user and select role as **admin** from the registration page.

---

## 📡 API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| POST | /api/couriers | Customer |
| GET | /api/couriers/my | Customer |
| GET | /api/couriers/track/:id | Public |
| GET | /api/couriers/all | Admin |
| PUT | /api/couriers/:id | Admin |
| POST | /api/couriers/:id/verify-otp | Customer |
| GET | /api/couriers/stats/summary | Admin |

---

## 🌱 Future Improvements
- Email/SMS notifications for tracking updates  
- Payment integration  
- Delivery time prediction using analytics  
- Mobile app version  

---

## 🤝 Contributing
- Fork the repository  
- Create a feature branch (git checkout -b feature-name)  
- Commit your changes (git commit -m "Add feature")  
- Push to the branch (git push origin feature-name)  
- Open a Pull Request  
