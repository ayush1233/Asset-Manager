# ScoutFlow – VC Intelligence Interface with Live AI Enrichment

ScoutFlow is a thesis-driven VC intelligence platform that helps investors discover, analyze, and organize startups through a modern, explainable sourcing workflow. The system combines a premium SaaS interface with a live enrichment engine that fetches public website data and uses AI to extract structured insights, signals, and investment relevance scores.

Built as a full-stack application with secure server-side enrichment, persistent data storage, and a responsive, animated UI.

---

## 🌐 Live Demo

**Application URL:**
https://asset-manager--uzumakinaaruto2.replit.app

**GitHub Repository:**
https://github.com/ayush1233/Asset-Manager

---

## 🎯 Key Features

### 🔎 Company Discovery

* Advanced search and filtering (sector, stage, location)
* Sortable, paginated company table using TanStack Table
* Global search with keyboard shortcut support

### 🧠 Live AI Enrichment

* Fetches real public website content
* Uses OpenAI to extract:

  * Summary
  * What the company does
  * Keywords
  * Derived signals
  * Explainable VC interest score
* Displays enrichment sources and timestamps
* Secure server-side processing (API keys never exposed)

### 🏢 Company Profiles

* Detailed company overview
* Enrichment panel with structured intelligence
* Signals timeline
* Persistent notes system

### 📂 Deal Flow Management

* Create and manage custom company lists
* Save and re-run searches
* Persistent storage for notes, lists, and saved searches

### ✨ Premium User Experience

* Smooth animations using Framer Motion
* Modern SaaS interface
* Responsive layout
* Loading states, error handling, and polished interactions

---

## 🏗 Architecture Overview

### Frontend

* Next.js / React
* TypeScript
* TailwindCSS
* shadcn/ui
* Framer Motion
* TanStack React Table

### Backend

* Node.js / Express
* REST API architecture
* Server-side enrichment pipeline
* Secure environment variable handling

### AI Enrichment Pipeline

Workflow:

1. User clicks "Enrich" on a company profile
2. Server fetches public website content
3. Content is processed and sent to OpenAI API
4. OpenAI extracts structured intelligence
5. Signals and scoring are computed
6. Results stored and returned to frontend
7. UI updates with enrichment insights

All enrichment occurs server-side for security.

---

## 🔐 Security and API Key Protection

* OpenAI API key stored in environment variables
* Keys never exposed to frontend
* Enrichment handled entirely server-side
* Secure API architecture

---

## 📁 Project Structure

```
Asset-Manager/
│
├── client/           # Frontend (React / Next.js)
├── server/           # Backend (Express API)
├── shared/           # Shared types and utilities
├── README.md
├── package.json
└── .env.example
```

---

## ⚙️ Local Setup Instructions

### 1. Clone the repository

```
git clone https://github.com/ayush1233/Asset-Manager.git
cd Asset-Manager
```

### 2. Install dependencies

```
npm install
```

### 3. Create environment file

Create a `.env` file in the root directory:

```
OPENAI_API_KEY=your_openai_api_key_here
```

---

### 4. Run the development server

```
npm run dev
```

---

### 5. Open in browser

```
http://localhost:3000
```

---

## 🚀 Deployment

The application is deployed on Replit and is production-ready.

Recommended deployment platforms:

* Vercel
* Netlify
* Replit

---

## 🧠 Design Philosophy

ScoutFlow is designed around a thesis-first sourcing workflow:

Discover → Analyze → Enrich → Score → Organize → Act

The goal is to reduce manual research and provide explainable, actionable intelligence for investment decisions.

---

## 🛠 Technologies Used

* Next.js / React
* TypeScript
* Node.js / Express
* OpenAI API
* TailwindCSS
* shadcn/ui
* Framer Motion
* TanStack Table

---

## 📈 Future Improvements

* Automated enrichment scheduling
* Thesis-based recommendation engine
* Vector search and similarity matching
* CRM integrations

---

## 👨‍💻 Author

Ayush Sonone

GitHub: https://github.com/ayush1233

---

## 📄 License

This project was developed as part of a VC Intelligence Interface assignment and is intended for evaluation and educational purposes.

---
