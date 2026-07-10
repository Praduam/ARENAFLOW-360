# ArenaFlow 360: FIFA World Cup 2026 Smart Stadiums & Tournament Operations Hub

ArenaFlow 360 is a premium, GenAI-enabled web application designed to optimize stadium logistics, volunteer coordination, and fan experiences during the FIFA World Cup 2026 (customized for MetLife Stadium host venue). It features distinct portals for three main personas: Fans, Venue Staff & Organizers, and Volunteers.

---

## 🏆 Key Features

### 1. Fan Experience Portal
*   **GenAI Match Day Companion**: Multilingual chatbot supporting queries about ticketing, security clear-bag policies, restrooms, transport hubs, and food locations with built-in Text-To-Speech (TTS) audio playback.
*   **Interactive Stadium Explorer**: A custom vector SVG map detailing section wait times, crowd density indices, and simulated Seat View Previews with nearby accessibility guides.
*   **Smart Mobility Hub**: Real-time traffic, parking lot capacities, and train shuttle wait times.

### 2. Operations & Organizers Dashboard
*   **Live Control Tower Metrics**: Displays total attendance, open incidents, staff capacity, and warning congestion indices.
*   **Recharts Entry Analytics**: Interactive area charts comparing ticket entry flow rates vs Gate capacity safety limits.
*   **GenAI Dispatch Engine**: Automatically parses reported incident details and drafts appropriate emergency or maintenance radio scripts for dispatch.
*   **Operations Oracle**: A context-aware operations guidelines lookup tool.

### 3. Volunteer Hub
*   **Check-In Simulation**: Allows field helpers to check-in for shifts and generates a dynamic digital QR Entry Pass.
*   **GenAI Multilingual Translation Toolkit**: Instantly translates statements between English and Spanish, French, German, Arabic, Japanese, or Portuguese, featuring voice announcement capabilities to greet international fans.
*   **Shift Guidelines**: Active checklist tracking security and service parameters.

---

## 📊 System Architecture & Workflows

### 1. High-Level System Architecture
The application runs as a modular single-page React app. The `aiService` coordinates the simulated database states and routes chat queries either to the Gemini API or the local context-aware NLP parser.

```mermaid
graph TD
    subgraph UI_Portals [User Portals Interface]
        Fan[Fan Experience Portal]
        Staff[Operations Dashboard]
        Volunteer[Volunteer Hub]
    end

    subgraph Service_Core [ArenaFlow Core Services]
        AIService[aiService.js Manager]
        LocalState[(Local Simulator State)]
    end

    subgraph External_APIs [External Integrations]
        Gemini[Google Gemini API]
        TTS[Browser Web Speech API]
    end

    %% UI Connections
    Fan <-->|Queries & Updates| AIService
    Staff <-->|Incidents & Config| AIService
    Volunteer <-->|Shift Check-in & Translations| AIService

    %% Service Core Connections
    AIService <-->|Sync| LocalState
    AIService <-->|Fetch if API Key Active| Gemini
    
    %% Output Connections
    Fan -->|Text to Speech| TTS
    Volunteer -->|Speech Output| TTS
```

### 2. GenAI Incident Dispatcher Workflow
This diagram illustrates the automated sequence when a stadium incident is reported, drafted into emergency instructions by the GenAI dispatch engine, and transmitted to volunteers.

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Stadium Operations Coordinator
    participant System as Staff Portal UI
    participant AI as GenAI Dispatch Engine
    actor Volunteer as Standby Volunteer Detail

    Staff->>System: Reports new incident (e.g. Spill in Sector 300)
    System->>System: Logs incident to Active Feed
    Staff->>System: Clicks "GenAI Dispatch"
    System->>AI: Sends incident details (category, location, details)
    AI->>AI: Generates structured radio dispatcher order
    AI-->>System: Returns draft radio transmission script
    Staff->>System: Assigns volunteer crew & clicks "Transmit"
    System->>Volunteer: Transmits dispatch order & logs status as 'Dispatched'
```

### 3. Multilingual AI Assistant Routing
This diagram outlines how queries in the Fan Chatbot and Volunteer Translator are routed and processed.

```mermaid
graph TD
    Query[User Query / Volunteer Statement] --> Input[Input Handler]
    Input --> CheckAPI{Gemini API Key Set?}
    
    %% Active Gemini Path
    CheckAPI -->|Yes| GeminiCall[Send Request to Gemini API]
    GeminiCall --> AIResponse[Generate Contextual Response]
    
    %% Local Mock Path
    CheckAPI -->|No| NLPParse[NLP Keyword Pattern Matching]
    NLPParse --> MockResponse[Fetch Contextual DB Answer]
    
    %% Audio / Output Path
    AIResponse --> UI[Render in Chat Bubble]
    MockResponse --> UI
    UI --> TTSCheck{User Clicks Audio Button?}
    TTSCheck -->|Yes| Speech[Synthesize Speech via Web Speech API]
    TTSCheck -->|No| End([End Process])
```

---

## 🚀 Running Locally

### Prerequisites
*   **Node.js**: v20 or later
*   **npm**: v10 or later

### Installation & Run Commands
1. Clone this repository (or copy folders).
2. Install the node packages:
    ```bash
    npm install
    ```
3. Run the local development server:
    ```bash
    npm run dev
    ```
4. Access the server at `http://localhost:5173/` in your browser.

### Enabling Real Gemini AI Responses
1. Open the website in your browser.
2. Click the **Developer Controls** cog icon in the bottom-right.
3. Enter your **Google Gemini API Key** and click **Save**. 
4. The Fan Companion, Global Assistant, and Operations Oracle will now generate live GenAI answers.
