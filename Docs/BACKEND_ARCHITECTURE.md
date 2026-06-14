# PROJECT AURA

# BACKEND_ARCHITECTURE

Version: 1.0

Status: Active

Owner: Samudra

---

# Overview

The backend is the core intelligence layer of AURA.

Responsibilities:

* API handling
* Business logic
* AI orchestration
* Memory management
* Agent execution
* Tool execution
* Background jobs
* Database access
* Event handling

---

# Technology Stack

Runtime

* Node.js

Language

* TypeScript

Framework

* Express

AI Orchestration

* LangGraph

Validation

* Zod

ORM

* Prisma

Queue

* BullMQ

Cache

* Redis

Database

* PostgreSQL

Vector Database

* Qdrant

Logging

* Pino

---

# High-Level Architecture

```text
Frontend

↓

API Gateway

↓

Controllers

↓

Services

↓

LangGraph

↓

Model Router

↓

Providers

↓

Memory Layer

↓

Repositories

↓

Databases
```

---

# Folder Structure

```txt
src/

├── api
├── controllers
├── services
├── repositories
├── providers
├── memory
├── agents
├── graphs
├── tools
├── workers
├── queues
├── middleware
├── validators
├── schemas
├── events
├── utils
├── config
├── types
├── logger
└── app.ts
```

---

# API Layer

Purpose

Expose REST endpoints.

---

Example

```txt
POST /chat

POST /research

POST /documents

GET /projects

POST /memory
```

---

# Controllers

Purpose

Handle requests.

No business logic allowed.

---

Example

```txt
controllers/

chat.controller.ts

project.controller.ts

memory.controller.ts

document.controller.ts

research.controller.ts

settings.controller.ts
```

---

Responsibilities

* Validate requests
* Call services
* Return responses

---

# Services

Purpose

Business logic.

---

Structure

```txt
services/

chat.service.ts

project.service.ts

memory.service.ts

document.service.ts

research.service.ts

analytics.service.ts

agent.service.ts
```

---

Responsibilities

* Execute workflows
* Coordinate repositories
* Interact with LangGraph
* Tool execution

---

# Repositories

Purpose

Database access layer.

---

Structure

```txt
repositories/

chat.repository.ts

project.repository.ts

memory.repository.ts

document.repository.ts

analytics.repository.ts
```

---

Responsibilities

* CRUD operations
* Queries
* Transactions

---

# Provider Layer

Purpose

Model abstraction.

---

Structure

```txt
providers/

openai.provider.ts

anthropic.provider.ts

google.provider.ts

provider.interface.ts
```

---

Responsibilities

* API calls
* Streaming
* Error handling
* Retry logic

---

# Model Router

Purpose

Select best model.

---

Rules

Coding

↓

GPT-5 / Gemini 3 / Claude Opus

---

Architecture

↓

Claude Opus / Gemini 3

---

Vision & Tool Use

↓

GPT-5 / Gemini 2

---

Writing & Research

↓

Claude Sonnet / Gemini 2

---

Deep Reasoning

↓

Claude Opus / Gemini 3

---

Fallback

```text
GPT-5 / Claude Opus / Gemini 3
↓
Claude Sonnet / Gemini 2
↓
Claude Haiku / Gemini 2 Flash
```

---

# LangGraph Layer

Purpose

AI orchestration.

---

Folder

```txt
graphs/
```

---

Graphs

### Chat Graph

Handles conversations.

---

### Research Graph

Handles search.

---

### Coding Graph

Handles repositories.

---

### Writing Graph

Handles content generation.

---

### Memory Graph

Handles memory retrieval.

---

### Report Graph

Handles reports.

---

# Agents

Folder

```txt
agents/
```

---

Agents

Research Agent

Coding Agent

Writing Agent

Finance Agent

Startup Agent

Calendar Agent

Email Agent

Video Agent

---

Agent Structure

```txt
agent.ts

state.ts

tools.ts

prompts.ts

memory.ts
```

---

# Memory Layer

Folder

```txt
memory/
```

---

Components

Working Memory

Redis

---

Semantic Memory

Qdrant

---

Episodic Memory

PostgreSQL

---

Project Memory

PostgreSQL + Qdrant

---

Responsibilities

* Memory retrieval
* Memory ranking
* Compression
* Summarization

---

# Tool Layer

Folder

```txt
tools/
```

---

Categories

Search

Documents

GitHub

Files

Calendar

Gmail

Drive

Notion

Obsidian

YouTube

Browser

---

Structure

```txt
tools/

search/

documents/

github/

calendar/

gmail/

filesystem/
```

---

Tool Interface

```ts
execute()

validate()

authorize()

format()
```

---

# Event System

Folder

```txt
events/
```

---

Events

chat.created

message.created

document.uploaded

memory.created

task.completed

agent.executed

report.generated

---

Flow

```text
Action

↓

Event

↓

Subscribers

↓

Side Effects
```

---

# Queue System

Technology

BullMQ

---

Queues

research

coding

embedding

notifications

memory

reports

automation

---

Folder

```txt
queues/
```

---

Structure

```txt
queues/

research.queue.ts

coding.queue.ts

embedding.queue.ts

notification.queue.ts
```

---

# Workers

Folder

```txt
workers/
```

---

Responsibilities

Background tasks.

---

Workers

Embedding Worker

Research Worker

Memory Worker

Report Worker

Notification Worker

Automation Worker

---

Flow

```text
Queue

↓

Worker

↓

Database

↓

Response
```

---

# Validation Layer

Technology

Zod

---

Folder

```txt
validators/
```

---

Example

Chat Request

Project Request

Memory Request

Document Request

---

Responsibilities

* Input validation
* Type safety

---

# Middleware

Folder

```txt
middleware/
```

---

Components

Authentication

Authorization

Error Handler

Logger

Rate Limiter

Request Tracker

---

# Authentication

Future

JWT

Session Cookies

OAuth

---

Supported Providers

Google

GitHub

Local

---

# Error Handling

Strategy

Centralized.

---

Categories

Validation Errors

AI Provider Errors

Database Errors

Timeout Errors

Tool Errors

---

Response Format

```json
{
  "success": false,
  "error": "",
  "code": ""
}
```

---

# Retry Logic

Provider failures

↓

Retry

↓

Fallback Model

↓

Return Result

---

# Logging

Technology

Pino

---

Levels

Info

Warn

Error

Debug

---

Log Categories

API

Models

Tools

Memory

Agents

Database

---

# Observability

Metrics

Response time

Token usage

API cost

Memory retrieval

Agent duration

Queue length

---

# Dependency Injection

Purpose

Loose coupling.

---

Services depend on interfaces.

Never concrete implementations.

---

Example

```ts
ChatService

↓

ProviderInterface

↓

OpenAIProvider
```

---

# Caching

Technology

Redis

---

Cached Items

Responses

Search results

User settings

Embeddings

Active projects

---

TTL

30 minutes

---

# Security

Secrets

Environment variables

Encrypted API keys

---

Sensitive data

Never logged.

---

All provider requests

Audited.

---

# Scalability

Horizontal scaling supported.

---

Components that scale independently

Workers

Queues

API

LangGraph

Providers

---

# Future Components

WebSocket Gateway

Voice Service

Computer Use Service

Vision Service

Mobile Sync Service

Plugin System

MCP Server

Multi-user Support

Digital Twin Engine

---

# Architectural Goal

Provide a robust backend capable of powering:

* Personal AI Operating System
* Long-Term Memory
* Multi-Agent Workflows
* Research System
* Coding Assistant
* Voice Assistant
* Computer Use

while maintaining:

* Reliability
* Security
* Extensibility
* High Performance
* Future Scalability
