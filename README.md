# Smart Mobile Service Center Chatbot 📱⚡

An AI-powered and keyword-classified hybrid customer support chatbot designed as a responsive, dual-pane web application.

---

## 🛠️ Architecture & Core Tech Stack

This application has been developed on a production-grade, high-performance full-stack TypeScript environment:

-   **Frontend:** React 19, Vite, Tailwind CSS (Utility-First Layout), Lucide Icons, and Motion transitions.
-   **Backend:** Express (Node.js RESTful API, server-side endpoints).
-   **Database:** A robust file-persisted JSON database engine replicating structured relational SQLite tables (`appointments`, `repair_status`, `feedback`).
-   **NLP Engine:** Fully custom NLP pipeline containing lowercasing, stopword filtering, basic suffix stemming, and rule-based keyword mapping for core repair intents.
-   **AI Foundation:** Google Gemini integration via `@google/genai` (utilizing `gemini-3.5-flash`), synthesizing conversational support replies based on our knowledge base.

---

## 🌟 Interactive Features

### 1. Hybrid NLP Chatbot ("Smarty")
-   **Natural Greetings:** Responds warmly to Hello, Hi, Hey, Good Morning, etc.
-   **Brand & Repair Support:** Detects support queries for **Samsung, Apple, Xiaomi, Vivo, Oppo, OnePlus, Realme, and Motorola**.
-   **Repair pricing diagnostics:** Provides estimated repair quotes for broken screens (₹2500 - ₹12000), batteries (₹1000 - ₹4500), water damage, charging ports, and more.
-   **Instant Job Tracking:** Customers can enter any Job ID (e.g., `JOB101`, `JOB102`) to track their repair status directly in the chat!
-   **Voice Input (STT):** Dictate questions directly using the microphone button (Web Speech API).
-   **Speech Response (TTS):** The chatbot speaks its responses aloud (Speech Synthesis) with a mute/unmute control.
-   **Chat Persistence:** Chat logs are automatically saved in browser `localStorage` and can be wiped with a single click.

### 2. Priority Service Scheduler
-   A clean booking form collecting Customer Name, Phone, Brand, Model, Problem Description, and Preferred Date.
-   Assigns a unique **Job ID** (e.g., `JOB1001`) and registers an active ticket in the database.

### 3. Repair Status Visualizer
-   A dedicated search tracker showing a 4-step progress timeline: `Pending` ➡️ `In Progress` ➡️ `Ready for Pickup` ➡️ `Delivered`.

### 4. Admin Management Dashboard
-   **Live Statistics:** Displays counts of Total Appointments, Active Repairs, Total Reviews, and Average Customer Satisfaction Stars.
-   **Appointments Table:** A visual database log showing scheduled slots.
-   **Repair Status Controller:** Staff can update device repair status (e.g., changing status to `Ready for Pickup` or `Delivered`) via dropdowns, instantly updating client searches.
-   **Review logs:** View all customer-submitted reviews and comments.

---

## 📂 Project Structure

```bash
SmartMobileServiceChatbot/
│
├── data/                    # Local persistent JSON database store
│   ├── appointments.json
│   ├── repair_status.json
│   └── feedback.json
│
├── src/
│   ├── components/
│   │   ├── ServiceCatalog.tsx   # Brands supported, Price lists & FAQs
│   │   ├── AppointmentForm.tsx  # Booking reservation form with receipts
│   │   ├── JobTracker.tsx       # Search bar and 4-step progress timeline
│   │   ├── FeedbackForm.tsx     # Satisfaction review & star ratings (1-5)
│   │   ├── ChatbotPanel.tsx     # Chat window, STT, TTS, suggestion chips
│   │   └── AdminPanel.tsx       # Live stats and staff status controller
│   │
│   ├── types.ts             # Shared typescript interfaces
│   ├── index.css            # Global fonts (Inter, JetBrains Mono) & animations
│   ├── main.tsx             # Client entrypoint
│   └── App.tsx              # Main dual-pane responsive workspace
│
├── server.ts                # Express backend routing & Vite middleware handler
├── package.json             # Build commands and dependancies
├── vite.config.ts           # Bundler and aliases configuration
└── requirements.txt         # Python library reference
```

---

## ⚡ Setup & Run Instructions

All dependencies are pre-configured. To launch the application locally, use the following commands:

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (using `.env.example` as a template):
```env
GEMINI_API_KEY="your-google-gemini-api-key"
```
*(If `GEMINI_API_KEY` is omitted, the chatbot automatically falls back to our keyword NLP rule engine smoothly).*

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` to interact with the dashboard and support chatbot!

### 4. Production Build & Execution
```bash
npm run build
npm start
```
