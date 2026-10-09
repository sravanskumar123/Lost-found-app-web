# Campus Recovery – Smart Lost & Found Web Portal

A full-stack, intelligent lost-and-found management portal designed for academic campuses and university communities.

> 📖 **Full Engineering & Architecture Documentation:**  
> Please see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for the complete system architecture, database schema, matching algorithms, API specifications, and design system.

---

## 🚀 Key Highlights
* **Hierarchical Decision-Tree Matching:** Real-time cross-referencing between Lost and Found notices with zero false positives.
* **Multi-Tier Campus Geolocation:** Hardware GPS + IP network fallback + 1-click campus landmark presets integrated with interactive Leaflet.js maps.
* **Privacy-Preserving Claims Lifecycle:** 4-step stepper (`Reported` → `Under Review` → `Verified / Contact Shared` → `Handed Over & Returned`).
* **Role-Based Access Control:** Distinct workspaces for campus students and administrators.

---

## 🛠️ Quick Start

### Backend (Node.js / Express)
```bash
cd backend-express
npm install
npm run dev
# Running on http://localhost:5000
```

### Frontend (React 18 / Vite)
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```
