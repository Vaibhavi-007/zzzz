# Affective Decision & Negotiation Study (MERN Stack)

A cognitive science and behavioral economics research platform designed to measure how standardized affective state induction influences bargaining dynamics, negotiation run time, and decision accuracy.

---

## 🔬 Experimental Paradigm

1. **Standardized Stimulus Phase (`Video` / `Photo`)**:
   - Participants view standardized emotion-evoking stimuli across 3 valence categories (**Pleasant**, **Neutral**, **Unpleasant**).
   - Preceded by a 1.5-second fixation cross (`+`) for experimental baseline orientation.
   - Built-in video clips and photographic stimuli with automatic fallback visualizers.

2. **Self-Report Valence Assessment (Likert Scale)**:
   - Participants rate their affective state on a Likert scale:
     - **Pleasant** (Valence 5–7)
     - **Neutral** (Valence 4)
     - **Unpleasant** (Valence 1–3)
   - Decision latency (Reaction Time in ms) is logged with sub-millisecond precision via `performance.now()`.

3. **Master Accumulator Gauge (Top Pointer)**:
   - A calibrated top pointer gauge showing cumulative points towards a target of **500 points**.
   - Includes real-time numerical delta, milestone notches (0, 100, 200, 300, 400, 500), and a moving needle/pointer that dynamically advances.

4. **The Interactive Negotiate Wire**:
   - Calibrated 0–100 horizontal bargaining wire representing the pool split.
   - **Bot Offer Peg**: Marked in dark slate showing the bot's current standing.
   - **Participant Demand Grip**: Draggable and numeric-synced slider handle.
   - **Tension Spread Zone**: Visual highlight representing the bargaining gap between positions.

5. **Mood-Conditioned Bot Dynamics**:
   - **Pleasant Mood (Easy Negotiation)**:
     - Bot makes generous opening offers (48 pts).
     - High reservation limit (accepts demands up to 75 pts).
     - Rapid concessions (+8 pts per counter).
     - Friendly, cooperative dialogue.
   - **Neutral Mood (Moderate Negotiation)**:
     - Standard economic bargaining (opens at 32 pts, limit 60 pts, concessions +5 pts).
   - **Unpleasant Mood (Hard Negotiation)**:
     - Aggressive lowball opening (18 pts).
     - Strict stubborn reservation ceiling (will not accept demands above 42 pts).
     - Minimal concessions (+3 pts per counter).
     - Firm, unyielding dialogue.

6. **Behavioral Telemetry (Run Time & Accuracy)**:
   - **Run Time**: Milliseconds to reach agreement / rounds to target.
   - **Negotiation Accuracy**: Ratio of points obtained relative to the theoretical Pareto frontier ($\text{Points} / \text{Bot Reservation Limit}$).
   - **Deal Speed**: Points per second.
   - **Reaction Time**: First-action latency upon offer presentation.

---

## 🛠️ Technology Stack (MERN)

- **MongoDB**: Native document storage (`Participant`, `Session`, `Trial`) with automated local hybrid persistence fallback.
- **Express.js**: REST API with real-time negotiation engine and empirical statistics controllers.
- **React 18 + Vite**: Clean, academic, non-AI scientific UI designed with Tailwind CSS and Lucide icons.
- **Node.js**: Asynchronous runtime environment.

---

## 🚀 Running the Application

### 1. Unified Production Mode (Single Port: 5050)
The Express server serves both the REST API and the compiled React production client:
```bash
node server/server.js
```
Open **[http://localhost:5050](http://localhost:5050)** in your browser.

### 2. Development Mode with Hot Reloading (Port 5174)
```bash
# Terminal 1: Backend API
cd server
npm start # or node server.js (runs on port 5050)

# Terminal 2: React Client
cd client
npm run dev # runs on port 5174 with /api proxy to 5050
```
Open **[http://localhost:5174](http://localhost:5174)** in your browser.

---

## 📊 Researcher Analytics & CSV Export

Switch to **Researcher Analytics** mode from the top navigation bar to:
- Compare **Mean Run Time** across Pleasant, Neutral, and Unpleasant conditions.
- Compare **Negotiation Accuracy** and Pareto efficiency.
- Generate sample pilot datasets via the **Seed Pilot Data** button.
- Download RFC 4180 compliant CSV files with full trial-by-trial millisecond telemetry via **Export CSV Dataset**.
