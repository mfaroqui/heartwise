# Features V2 — Monthly Value System

## Build Order (per Mouzam's request)

### 1. Quarterly Strategy Snapshot (#7)
- Full career report: scores + trends + tool activity + peer comparison + strategic position + recommendations
- PDF/print-friendly
- Covers the full quarter, not just a month (upgrades existing generateMonthlyReport)
- Adds: peer benchmarking section, strategic assessment, "Where you stand" narrative, recommended next quarter actions
- Trigger: button on home screen + profile screen

### 2. Peer Benchmarking (#8)  
- "How do you compare to similar users"
- Uses getPeerBenchmarks() data (NRMP data) + anonymized platform stats
- Shows: your scores vs. avg for your specialty/stage
- Where: integrated into dashboard + quarterly report
- Visual: bar chart comparison

### 3. Seasonal Content Calendar (#5)
- Expands existing renderUpcomingDeadlines()
- Adds: actionable tool suggestions per deadline
- "It's October — ERAS opens soon. Have you run Fellowship Application Planner?"
- Proactive tool nudges based on academic calendar month
- Where: home screen card

### 4. Career Progress Dashboard (#4)
- Enhances existing renderToolHistory() and renderToolProgress()
- Makes score trends more prominent on home screen
- Visual: larger sparklines, score comparison over last 3 months
- Where: existing tool-progress element, enhanced

### 5. Tool Re-run Reminders (#2)
- Check U.toolHistory for tools last run >30 days ago
- "You ran Contract Risk Scanner 45 days ago. Anything changed?"
- Smart: only suggest re-runs for tools where re-running makes sense
- Where: home screen card

### 6. Monthly Career Check-in (#1)
- Upgrades existing showWeeklyCheckin to monthly career check-in
- Guided questionnaire: "What's changed this month?"
- Updates career profile data
- Captures: new offers, new scores, new pubs, job changes, decisions made
- Feeds back into tool recommendations
- Where: modal, triggered from home screen

## Implementation
- All code goes into js-app.js (inline with existing pattern)
- HTML elements go into screens.html (home screen section)
- Build with node build.js after changes
