# Project AURA: Personal AI Operating System

Project AURA is a secure, intelligent, modular, and highly extensible Personal AI Operating System designed as an all-in-one cognitive partner. It acts as a Chief of Staff, Software Engineer, Research Scientist, Creative Partner, and Knowledge Base, keeping complete control and ownership of user data in the user's hands.

AURA consolidates features inspired by ChatGPT, Claude, Cursor, Perplexity, Obsidian, and Jarvis into a single, unified operating portal.

---

## 🏗️ High-Level System Architecture

AURA is engineered with a layered, decoupled design to ensure that any individual component—whether the model router, vector storage, caching engine, or web frontend—can be replaced without rewriting core interfaces.

```text
                    User Interface
                           │
                           ▼
                    Frontend Layer
                           │
                           ▼
                      API Gateway
                           │
                           ▼
                  Application Backend
                           │
                           ▼
                    LangGraph Engine
                           │
                           ▼
                       Model Router
                           │
        ┌────────────────────┼───────────────────┐
        │                    │                   │
        ▼                    ▼                   ▼
   OpenAI Models      Anthropic Models     Google Models
     (GPT-5)       (Opus, Sonnet, Haiku)   (Gemini 2/3)
        │                    │                   │
        └────────────────────┼───────────────────┘
                           │
                           ▼
                      Memory Layer
                           │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        PostgreSQL        Redis                Qdrant
        │                   │                    │
        └───────────────────┴────────────────────┘
                           │
                           ▼
                       Tool Layer
                           │
                           ▼
                    External Services
```

---

## 🛠️ Technology Stack & Core Subsystems

* **Frontend Layer**: Built using [Next.js](file:///c:/UserX/Dev/Aura%20AI/frontend) and TypeScript, featuring sleek visual components designed via Tailwind CSS and shadcn/ui. See [page.tsx](file:///c:/UserX/Dev/Aura%20AI/frontend/src/app/page.tsx) for the main dashboard layout.
* **API Gateway & Proxy**: Handled by an [Nginx](file:///c:/UserX/Dev/Aura%20AI/nginx.conf) reverse-proxy layer routing `/` requests to the Next.js server and `/api` requests to the backend engine, configuring safety constraints (50MB payload cap for voice and video).
* **Application Backend**: Run via Node.js/Express configured with TypeScript and Prisma ORM. Key configurations and endpoints are set up in [app.ts](file:///c:/UserX/Dev/Aura%20AI/backend/src/app.ts).
* **LangGraph Engine**: Orchestrates agent routing, multi-step agent behaviors, dynamic state management, context gathering, and memory consolidation.
* **Model Router**: A dynamic AI gateway that automatically coordinates API keys, providing intelligent failovers and mapping specific workloads to optimal models (e.g. OpenAI GPT-5 for coding, Claude Opus for planning/analysis, Gemini 3 for multimodal context).
* **Memory & Storage**:
  * **Working Memory**: Redis for fast session contexts, active logs, and short-term operational cache.
  * **Episodic & Project Memory**: PostgreSQL (via Prisma) to capture metadata, users, messages, projects, and active tasks.
  * **Semantic Memory**: Qdrant vector database for document embeddings, repository indexes, and semantic search.
* **Worker & Queue System**: Redis-backed BullMQ for background executions like chunk embeddings, document processing, and scheduled jobs.

---

## 📂 Project Structure

```text
├── backend/                  # Node.js, Express, TypeScript, & Prisma project
│   ├── src/                  # Application source code
│   │   ├── app.ts            # Entrypoint routing and middleware setup
│   │   ├── controllers/      # API controller logic
│   │   ├── services/         # Domain-level service operations
│   │   └── providers/        # LLM client wrappers and router
│   ├── prisma/               # Schema and DB migration files
│   └── Dockerfile            # Container definition for backend service
├── frontend/                 # Next.js and Tailwind CSS portal
│   ├── src/                  # React components & page routes
│   │   └── app/              # App router hierarchy
│   └── Dockerfile            # Container definition for frontend service
├── docker-compose.yml        # Multi-container local execution setup
├── nginx.conf                # Nginx proxy mapping routing
└── .env.example              # Environment variables template
```

---

## 🌟 Core Features

### 🧠 Advanced Memory & Storage Hierarchy
AURA operates using a layered memory architecture inspired by human cognition, transforming the system from a stateless chatbot into a persistent assistant:
* **Working Memory (Redis)**: Manages short-term operational cache, active conversation threads, current file paths, and active session goals.
* **Episodic Memory (PostgreSQL)**: Captures experiences, historical conversations, decisions, events, and milestones across sessions.
* **Semantic Memory (Qdrant)**: Stores persistent facts, preferences, habits, and user-specific knowledge.
* **Project Memory (PostgreSQL + Qdrant)**: Ensures strict workspace isolation. Contexts from one project (e.g., personal portfolio) do not contaminate others (e.g., startup operations).
* **Relationship Memory**: Tracks interactions and metadata for entities like people, clients, companies, repositories, and products.
* **Archived Memory**: Retains cold, compressed historical logs and closed projects permanently for auditability.
* **Memory Operations Pipeline**: Automatically extracts preferences, goals, and facts from conversations; scores them on an Importance Scale (0.0 to 1.0); deduplicates; decays older memories; and implements custom compression algorithms to prevent token bloat.

### 🤖 Autonomous Multi-Agent System (LangGraph Engine)
AURA utilizes a multi-agent hierarchy orchestrated via LangGraph, enabling specialized workers to collaborate on complex goals:
* **Supervisor Agent**: Central orchestrator that understands user intent, decomposes complex requests into task lists, schedules work, delegates to specialized agents, resolves conflicts, and merges final outputs.
* **Research Agent**: Deep web search capability, Perplexity-style source comparison, and publication-ready report drafting with full citation attribution.
* **Coding Agent**: Cursor-like engineer capable of repository-wide indexing, code generation, debugging, refactoring, and test writing across multiple languages.
* **Writing Agent**: Dedicated assistant for drafting emails, blog posts, documentation, scripts, and reports.
* **Startup Agent**: Specialized tool for business roadmaps, market analysis, financial modeling, and pitch-deck drafting.
* **Finance Agent**: Oversees expense tracking, budget creation, and cashflow reports (sandboxed with no filesystem access).
* **Calendar & Email Agents**: Integrates with Gmail and Google Calendar to categorize messages, draft priority replies, and schedule events.
* **Video Agent**: Drafts storyboards, scripts, editing guidelines, and social media clip plans.
* **Memory, Knowledge, & Automation Agents**: Maintain vector indices, prune stale logs, execute RAG chunking, and run background worker routines.

### 🔍 Retrieval-Augmented Generation (RAG) System
The core knowledge engine features advanced RAG techniques inspired by Obsidian, Cursor, and NotebookLM:
* **Multi-Format Parsing**: Automatically ingests and extracts metadata from PDFs, DOCX files, Markdown documents, PPTX decks, and TXT files.
* **Obsidian Support**: Preserves Obsidian vault structures including bidirectional links, tags, and graph relationships.
* **Repository Indexing**: Parses and indices codebases (supporting TypeScript, JavaScript, Python, Go, Rust, Java, and C#) into code chunks for repository-aware queries.
* **Web & Media Ingestion**: Crawls documentation, blogs, websites, and retrieves YouTube transcripts.
* **Advanced Search Pipeline**: Performs hybrid search (combining dense vector semantic matching and BM25 sparse keyword matching) filtered by project tags, followed by cross-attention reranking (top 50 results compressed to the top 10 most relevant).
* **Citation System**: Generates inline citations linked to specific documents, sections, pages, or URLs for maximum auditability.

### 👁️ Multimodal Vision System
AURA is equipped with visual intelligence capabilities:
* **UI & Screenshot Analysis**: Interprets screenshot errors, inspects UI wireframes, and reads development log images.
* **OCR & Table Extraction**: Parses text and structures from scanned receipts, invoices, and physical documents.
* **Diagram Decoding**: Comprehends system architectures, ER diagrams, mind maps, and flowcharts to suggest optimizations or export markdown notes.
* **Computer Use Integration**: Guides cursor automation by scanning visual coordinates, recognizing icons/buttons, and detecting screen states.

### 🗣️ Jarvis-Like Speech & Voice Engine
Designed for natural hands-free verbal interaction:
* **Real-Time Streaming**: Implements low-latency Voice Activity Detection (Silero VAD) connected to Speech-to-Text (Whisper API) and Text-to-Speech (OpenAI TTS / ElevenLabs).
* **Hands-Free Interaction**: Supports Push-to-Talk, Wake Word activation ("AURA"), and Continuous Listening modes.
* **Interruption Handling**: Instant audio playback termination when user speech is detected, switching smoothly back to listening.
* **Dynamic Personas**: Configurable voices (Developer, Creative, Teacher, Executive) combined with emotional styles (Calm, Energetic, Friendly).

### 💻 Computer Use & Desktop Automation
Acts as an active digital operator directly inside your operating systems:
* **Environment Control**: Controls web browsers (Chrome, Edge, Firefox), text editors (VS Code, Cursor), office tools, and operating systems (Windows, Linux, macOS).
* **Direct Actions**: Performs mouse clicks, dragging, scrolling, text typing, keyboard shortcuts, window resizing, and filesystem tasks.
* **Human-in-the-Loop Safeguards**: Implements progressive safety levels (Level 0: Read-only up to Level 5: Critical actions). Destructive operations, email sends, external uploads, and payments strictly require explicit user verification.
* **Self-Verification Loop**: Captures screenshots after actions to verify UI updates, performing up to 3 automated retries or alternative route rollbacks on failure.

### ⚡ Proactive Automation Engine
Transforms AURA from a reactive helper into an active Chief of Staff:
* **Event-Driven Workflows**: Triggers background tasks based on actions (e.g. document uploaded, task failed, or memory created).
* **Scheduled Routines**: Automates cron-based tasks like the Daily Planning Summary (at 08:00), Weekly Progress Reviews, monthly reports, backup execution, and memory database cleanups.
* **Queue Management**: BullMQ worker pools distribute and rate-limit heavy jobs (embeddings, document processing, API routing) to guarantee low UI latency.

### 🔒 Privacy, Security & Key Vault
Built on a local-first, zero-trust security framework:
* **Self-Hosted Ownership**: All data remains in the user's direct environment with no external model training allowed.
* **AES-256 Key Vault**: Encrypts and isolates third-party API keys (OpenAI, Anthropic, Google) securely on the PostgreSQL backend. Keys are never exposed to the frontend, logs, or agent prompts.
* **Argon2 Authenticated Access**: Enforces strong local user authentication, sessions managed securely in Redis, and TLS/HTTPS encrypted network paths.

---

## 🚀 Getting Started

### 📋 Prerequisites
Ensure you have the following installed on your local host:
* [Docker & Docker Compose](https://www.docker.com/)
* [Node.js (v18+)](https://nodejs.org/)
* [Git](https://git-scm.com/)

### 🔧 Configuration
1. Clone the repository to your local workspace.
2. Duplicate the environment variables template file:
   ```bash
   cp .env.example .env
   ```
3. Open the newly created `.env` file and input your active API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GOOGLE_API_KEY`). At least one key is required; AURA dynamically adjusts agent roles and routing based on active configurations.

### 🐳 Running with Docker Compose
To boot up the complete Aura OS ecosystem (including PostgreSQL, Redis, Qdrant, Nginx, Backend, and Frontend):

```bash
docker compose up --build
```

Once running, the core services can be accessed at:
* **Frontend Portal / Dashboard**: [http://localhost](http://localhost) (Proxied via Nginx)
* **Backend API Gateway**: [http://localhost/api/v1](http://localhost/api/v1)
* **Qdrant DB Dashboard**: [http://localhost:6333/dashboard](http://localhost:6333/dashboard)
