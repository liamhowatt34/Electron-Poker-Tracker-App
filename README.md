# Poker Tracker

**Poker Tracker** is a lightweight desktop application built with Electron, SQLite, and Chart.js that allows you to log, view, and analyze your live poker sessions.

---

## Features

- **Track key session details** including date, stakes, buy-in, cash-out, and hours played
- **Cumulative profit chart** to visualize performance over time
- **Session viewer** with navigation to view individual sessions
- **Aggregate statistics** including:
  - Total sessions
  - Total hours
  - Total hands (calculated as hours × 30)
  - Total profit
- **Dark theme interface** for a clean and modern user experience
- **Data is stored locally** using SQLite

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/liamhowatt/electronpokertracker.git
cd electronpokertracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the App in Development Mode
```bash
npm run dev
```

### 4. Build the App for Windows
```bash
npm run build
```

The compiled app will be in the dist/ folder.

Run the Poker Tracker Setup.exe file to install the app.