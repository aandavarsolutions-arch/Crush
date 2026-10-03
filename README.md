# 💘 Viral Crush Prank Link Web Application

A production-ready, mobile-first, high-converting viral web application where users create fake "Crush Love Calculator" links and send them to friends. When the friend enters their crush's name, the website reveals they were fooled, records the crush name, and prompts them to create their own link to continue the viral loop.

---

## 🌟 Key Features

- **⚡ Fast & Mobile-First**: Built with HTML5, CSS3 glassmorphism design system, and Vanilla JS for instant page loads.
- **🔄 Complete Viral Loop**: Seamless sequence turning every fooled recipient into a new prank link creator.
- **🎭 Believable Animation**: 2-4s fake calculation progress sequence (0% to 100%) with dynamic progress tickers.
- **🎉 Confetti Reveal & Reaction System**: Canvas confetti burst on reveal + interactive reaction buttons (😂 😭 💀 ❤️ 😡).
- **📊 Creator Statistics Dashboard**: Secret key protected dashboard tracking total opens, completed pranks, crush names, and reactions.
- **🗄️ Supabase PostgreSQL + Local DB Fallback**: Direct Supabase database integration with automatic local JSON database fallback when Supabase keys are not set.
- **🔒 Security & Sanitization**: XSS sanitization, rate limiting, and parameter verification.
- **💰 AdSense-Ready**: Non-intrusive, publisher policy-compliant advertisement containers.

---

## 🛠️ Project Structure

```text
crush-prank/
├── backend/
│   ├── config/
│   │   └── supabase.js          # Supabase & local DB data layer
│   ├── controllers/
│   │   └── prankController.js   # Main API handler functions
│   ├── middleware/
│   │   ├── rateLimiter.js       # Express rate limiting
│   │   └── sanitize.js          # XSS & input length sanitization
│   ├── routes/
│   │   ├── api.js               # REST API endpoints
│   │   └── pages.js             # HTML page routes (/c/:code, /stats/:code, etc.)
│   └── server.js                # Express app launcher
├── database/
│   └── schema.sql               # Supabase PostgreSQL SQL schema script
├── public/
│   ├── css/
│   │   └── style.css            # Romantic dark-mode glassmorphism design system
│   ├── js/
│   │   ├── app.js               # Shared utility (Toast, Particles, Copy/Share API)
│   │   ├── create.js            # Link creation client script
│   │   ├── prank.js             # Calculation animation & reveal script
│   │   └── stats.js             # Statistics dashboard client script
│   ├── index.html               # Landing & Link Creator
│   ├── prank.html               # Recipient Love Calculator & Fooled Reveal
│   ├── stats.html               # Creator Statistics Dashboard
│   ├── privacy.html             # Privacy Policy
│   ├── terms.html               # Terms of Service
│   └── about.html               # About & Contact
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Installation
Clone or navigate to the project folder and install dependencies:
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional)* Add your Supabase project credentials in `.env`:
```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```
> **Note:** If Supabase credentials are not provided, the application will automatically run in local fallback mode using local storage.

### 3. Database Setup (Supabase)
Run the SQL script located in `database/schema.sql` inside your Supabase SQL Editor to create the `links` and `submissions` tables along with indexes and RLS policies.

### 4. Running the Application
Start the server:
```bash
npm start
```
Or for development:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Prank Loop

1. **Create a Link**: Enter your name (e.g. "Prabu") on the homepage and click **Create Your Link**.
2. **Copy / Open Share Link**: Copy the generated share link (e.g. `http://localhost:3000/c/AbX72K`).
3. **Friend Experience**: Open the link in a private/incognito window. Enter a visitor name (e.g. "Rahul") and crush name (e.g. "Priya"). Click **Calculate Love Percentage**.
4. **Prank Reveal**: Watch the 3-second fake calculation animation followed by the **YOU ARE FOOLED!** reveal screen and reaction buttons.
5. **Check Stats**: Open the Creator Stats link (e.g. `http://localhost:3000/stats/AbX72K?key=...`) to view the captured crush name and submission details!
