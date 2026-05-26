# **GraVITal** 
> The Ultimate Academic Tracking & Simulation Platform for VIT Students.

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-green.svg?style=flat&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248.svg?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Why this project exists

Tracking academic progress should be intuitive, precise, and visually engaging. GraVITal was built to solve the frustration of manually calculating CGPAs, estimating required grades for targets, and exploring "what-if" scenarios. We engineered a seamless, SaaS-grade platform specifically tailored for VIT students, bringing predictability and clarity to their academic journey.

## 🚀 Key Highlights

- **SaaS-Grade Aesthetics:** Modern glassmorphism UI, fluid micro-interactions, and a distraction-free environment.
- **Predictive Intelligence:** Instantly simulate how different grades will impact your final CGPA.
- **Enterprise-Level Security:** Robust JWT-based session handling with exclusive domain-level access (`@vitstudent.ac.in`).

---

## ✨ Features

- **Exclusive Access:** Strict `@vitstudent.ac.in` email restriction ensures a localized, secure community.
- **Real-time CGPA Simulator:** Explore "what-if" scenarios and adjust expected grades to see the immediate impact on your CGPA.
- **Target Calculator:** Input your desired CGPA and let the system calculate the exact credits and grades required to achieve it.
- **Semester Breakdown:** Granular tracking of individual semester performance.
- **Responsive & Minimalist UI:** Built with performance and aesthetics in mind—perfectly scaling from ultra-wide monitors to mobile devices.
- **Cloud Sync:** Securely save your GPA data to your profile and access it anywhere.

---

## 🛠 Tech Stack

### Frontend
- **React.js** – Component-driven architecture
- **React Router** – Client-side routing
- **Context API** – Global state management
- **Vanilla CSS** – Highly optimized, utility-free custom styling

### Backend
- **Node.js & Express.js** – Fast, non-blocking REST API
- **MongoDB & Mongoose** – Flexible, NoSQL document storage
- **JWT & bcryptjs** – Secure authentication and password hashing

---

## 📁 Project Structure

```
GraVITal/
├── backend/
│   └── server.js              # Express API (auth + data endpoints)
├── public/
│   ├── favicon.svg
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── AnimatedNumber.jsx      # Smooth number count-up component
│   │   ├── AuthScreen.jsx          # Login / Register / Guest auth
│   │   ├── Dashboard.jsx           # Main app shell with tab navigation
│   │   ├── GradeSimulator.jsx      # What-if grade simulation
│   │   ├── LandingPage.jsx         # Marketing landing page
│   │   ├── Navbar.jsx              # Global navigation with theme toggle
│   │   ├── OverallCalculator.jsx   # CGPA tracker with semester cards
│   │   ├── ParticleBackground.jsx  # Canvas particle effect (theme-aware)
│   │   ├── SemesterCalculator.jsx  # Subject-wise GPA calculator
│   │   ├── Spotlight.jsx           # Interactive card & magnetic button effects
│   │   └── TargetCalculator.jsx    # Target GPA planner
│   ├── context/
│   │   ├── AuthContext.jsx         # Authentication state management
│   │   └── ThemeContext.jsx        # Dark/Light theme provider
│   ├── hooks/
│   │   └── useLocalStorage.js      # localStorage sync hook
│   ├── utils/
│   │   └── ocrParser.js            # AI-powered grade OCR
│   ├── App.jsx                     # Root layout with routing
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global design tokens & theme variables
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local instance or MongoDB Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/GraVITal.git
cd GraVITal
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Frontend Setup
```bash
cd ../
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory and configure the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

---

## 🚦 Usage Guide

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend Application**
   ```bash
   # From the root directory
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite/React).

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register a new user (VIT Email required) | No |
| `POST` | `/api/auth/login` | Authenticate user and issue token | No |
| `GET`  | `/api/gpa/:username` | Fetch user's saved GPA data | Yes |
| `POST` | `/api/gpa/save-gpa` | Update user's academic records | Yes |

---

## 📂 Folder Structure

```text
GraVITal/
├── backend/
│   ├── models/           # Mongoose schemas (User.js)
│   ├── routes/           # Express routes (authRoutes.js)
│   ├── .env              # Environment configurations
│   └── server.js         # Entry point for the backend
├── src/
│   ├── components/       # Reusable React components
│   ├── context/          # React Context (AuthContext, ThemeContext)
│   ├── utils/            # Helper functions
│   ├── App.jsx           # Main application routing
│   └── main.jsx          # React DOM render entry
├── public/               # Static assets
├── package.json          # Frontend dependencies
└── README.md
```

---

## 🛡 Security Notes

GraVITal takes security seriously:
- **VIT Email Validation:** Registration aggressively validates against the `@vitstudent.ac.in` domain on both the frontend and backend.
- **Password Security:** Passwords are salted and hashed using `bcryptjs` before persisting to the database.
- **JWT Sessions:** Authentication is stateless and relies on JWTs, eliminating server-side session vulnerabilities.
- **Input Sanitization:** All user inputs (usernames, emails) are trimmed and normalized to prevent injection or padding attacks.

---

## 🛣 Future Improvements

- [ ] **OAuth Integration:** One-click Google Login restricted to VIT Workspace.
- [ ] **Historical Analytics:** Visual charts mapping CGPA progress over 8 semesters.
- [ ] **Course Database:** Auto-fetch credit weights based on standardized course codes.
- [ ] **Export to PDF:** Download detailed semester reports.

---

## 🤝 Contributing

We welcome contributions to make GraVITal even better! 

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Open a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Darshan**  
*Lead Developer & UI/UX Architect*  
[GitHub](https://github.com/Dev-withDarshan) • [LinkedIn](https://www.linkedin.com/in/kdarshan2256/)
