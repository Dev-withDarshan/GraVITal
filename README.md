<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-In--Memory-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
</p>

<h1 align="center">⬡ ScoreLoom</h1>
<p align="center"><em>Weave Your Academic Future</em></p>

<p align="center">
  A premium, full-stack GPA calculator and academic performance tracker with a modern glassmorphic UI, real-time cloud sync, and intelligent grade simulation.
</p>

---

## ✨ Features

### 🎓 Semester GPA Calculator
- **Subject-wise entry** with name, credits, and grade selection (VIT grading: S/A/B/C/D/F)
- Separate **Theory** and **Lab** subject sections with collapsible panels
- **Real-time GPA computation** — updates instantly as you type
- **OCR-powered auto-fill** — upload a screenshot of your grades and let AI parse it
- Quality badge & progress bar visualization

### 📊 Overall CGPA Tracker
- **Dual-mode semester entry** — Quick (manual GPA + credits) or Detailed (subject-by-subject)
- Accordion-style semester cards with smooth expand/collapse transitions
- **Include/Exclude toggle** per semester for what-if analysis
- Sticky, compact CGPA header that adapts on scroll

### 🎯 Target Calculator
- Set your **desired CGPA** and see the exact GPA you need next semester
- Animated progress ring with real-time feasibility analysis
- Status badges: ✅ Achievable / ❌ Impossible
- Smart insights and contextual tips

### 🌗 Dark & Light Mode
- Professional **theme toggle** in the global navbar (Sun/Moon icons)
- Full design-system-level theming with CSS custom properties
- Theme preference persisted via `localStorage`

### 🫧 Interactive Particle Background
- Subtle, animated canvas particle effect on the **Landing** and **Login** pages
- **Mouse repulsion** — particles smoothly push away from the cursor
- Theme-aware palettes (bright pastels for dark mode, rich tones for light mode)
- Zero external libraries — pure vanilla JS with `requestAnimationFrame`

### ☁️ Cloud Sync
- **User authentication** (register / login / guest mode)
- Semester data saved to MongoDB and synced across devices
- Auto-save with visual feedback

### 🎨 Premium UI/UX
- Glassmorphic card design with `backdrop-filter` blur
- Smooth gradient text animations (Indigo → Cyan)
- Magnetic hover buttons and 3D tilt card effects via `Spotlight.jsx`
- Animated number transitions on GPA values (count-up with easing)
- Staggered fade-in entrance animations
- Fully responsive — works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer       | Technology                                   |
|-------------|----------------------------------------------|
| **Frontend**| React 19, Vite 8, React Router 7             |
| **Styling** | Vanilla CSS with CSS Custom Properties       |
| **Icons**   | Lucide React                                 |
| **Backend** | Node.js, Express 5                           |
| **Database**| MongoDB (via Mongoose) / In-Memory Server    |
| **AI/OCR**  | Google Generative AI (Gemini)                |
| **Hosting** | Vercel (frontend) + Render (backend)         |

---

## 📁 Project Structure

```
ScoreLoom/
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
- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/darsh175223/GradeDarshan.git
cd GradeDarshan

# Install dependencies
npm install

# Create .env file (optional — for OCR and cloud features)
echo "GEMINI_API_KEY=your_google_ai_key" > .env
```

### Development

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start them separately:
npm run dev:frontend   # Vite dev server (http://localhost:5173)
npm run dev:backend    # Express API (http://localhost:5000)
```

### Production Build

```bash
npm run build      # Output to dist/
npm run preview    # Preview the production build locally
```

---

## 🌐 Deployment

### Frontend (Vercel)
The project includes a `vercel.json` for zero-config deployment:
```bash
npx vercel --prod
```

### Backend (Render)
A `render.yaml` is included for one-click deployment on Render.

---

## 📸 Screenshots

| Dark Mode | Light Mode |
|-----------|------------|
| Premium dark glassmorphic dashboard with glowing particle background | Clean, bright interface with rich contrast particles |

---

## 🧠 Key Design Decisions

1. **No heavy animation libraries** — All animations use CSS transitions and `requestAnimationFrame` for maximum performance
2. **CSS Custom Properties for theming** — A single `[data-theme]` attribute swap changes the entire UI without re-renders
3. **Accordion via `max-height`** — Semester card expand/collapse uses stable `max-height` transitions instead of error-prone height: auto hacks
4. **Particle count scales with viewport** — ~1 particle per 7000px² ensures smooth 60fps on any screen size

---

## 👤 Author

**Darshan**  
GitHub: [@Dev-withDarshan](https://github.com/Dev-withDarshan)

---

## 📄 License

This project is for personal/educational use.

---

<p align="center">
  Built with ❤️ and a lot of ☕
</p>
