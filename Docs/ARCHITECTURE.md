# PROJECT AURA

# ARCHITECTURE

Version: 1.0

Status: Active

Owner: Samudra

---

# Overview

Project AURA is a modular, extensible Personal AI Operating System designed around:

* Intelligence
* Privacy
* Reliability
* Scalability
* Long-term evolution

The architecture follows a layered design where each subsystem is independently replaceable.

---

# High-Level Architecture

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
 (GPT-5)         (Opus, Sonnet, Haiku)   (Gemini 2/3)
      │                    │                   │
      └────────────────────┼───────────────────┘
                           │
                           ▼
                     Memory Layer
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │

  PostgreSQL            Redis               Qdrant

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

# Architectural Principles

## Modular

Every component should be independently replaceable.

---

## Stateless Services

Business logic remains stateless whenever possible.

---

## Event Driven

Long-running tasks should execute asynchronously.

---

## Separation of Concerns

UI, orchestration, memory, and model execution remain isolated.

---

## Future Scalability

Architecture should support:

* Multi-device usage
* Additional AI providers
* Local models
* Cloud deployment

---

# System Layers

---

# Layer 1

# Frontend

Technology

* Next.js
* TypeScript
* Tailwind
* shadcn/ui

Responsibilities

* Rendering UI
* User interactions
* State management
* Streaming responses

---

Pages

```text
/dashboard (Includes API keys configuration panel)

/chat

/projects

/memory

/knowledge

/agents

/settings

/analytics
```

---

# Layer 2

# API Gateway

Purpose

Single entry point for all requests.

---

Responsibilities

* Authentication
* Authorization
* Rate limiting
* Request validation
* Session handling

---

Communication

Frontend

↓

REST API

↓

Backend

---

# Layer 3

# Application Backend

Technology

* Node.js
* Express
* TypeScript

---

Responsibilities

* Business logic
* Tool execution
* Database operations
* Memory management
* Agent execution

---

Architecture

```text
Controller

↓

Service

↓

Repository

↓

Database
```

---

# Layer 4

# LangGraph Engine

Purpose

AI orchestration.

---

Responsibilities

* Workflow execution
* Context assembly
* Tool selection
* Memory injection
* Multi-agent coordination

---

Supported Workflows

### Chat

### Research

### Coding

### Writing

### Memory Retrieval

### Report Generation

---

# Layer 5

# Model Router

Purpose

Use the best model for each task.

---

Routing Rules (Default with all API keys active)

## Coding

GPT-5 (Fallback: Gemini 3 / Claude Opus)

---

## Architecture

Claude Opus (Fallback: Gemini 3)

---

## Deep Analysis & Reasoning

Claude Opus / Gemini 3

---

## Vision & Tool Use

GPT-5 (Fallback: Gemini 2 / Claude Sonnet)

---

## Writing & Summarization

Claude Sonnet (Fallback: Gemini 2 / Claude Haiku)

---

## Low-Latency Utilities

Claude Haiku / Gemini 2 Flash

---

## Dynamic Key Auto-Switching

The router dynamically updates the routing matrix at boot and runtime based on active keys. If a key is missing (e.g. only Google Gemini key is present), all tasks fall back to available models under that key.

---

Fallback Order (All providers active)

```text
GPT-5 / Claude Opus / Gemini 3 (High-end)
↓
Claude Sonnet / Gemini 2 (Mid-range)
↓
Claude Haiku / Gemini 2 Flash (Low-cost/Speed)
```

---

# Layer 6

# Memory Layer

Purpose

Persistent intelligence.

---

Components

## Working Memory

Redis

---

## Episodic Memory

PostgreSQL

---

## Semantic Memory

Qdrant

---

## Project Memory

PostgreSQL + Qdrant

---

Responsibilities

* Memory retrieval
* Context compression
* Memory ranking
* Summarization

---

# Layer 7

# Tool Layer

Purpose

Provide external capabilities.

---

Supported Tools

### Web Search

### Document Search

### GitHub

### Gmail

### Calendar

### Drive

### Notion

### Obsidian

### Local Files

### YouTube

---

Tool Interface

```text
Agent

↓

Tool Executor

↓

Provider Adapter

↓

External Service
```

---

# Layer 8

# External Services

Supported Services

### OpenAI

### Anthropic

### Google Gemini

### GitHub

### Google Drive

### Gmail

### Calendar

### Notion

### YouTube

---

# Data Architecture

---

# PostgreSQL

Stores

### Users

### Chats

### Messages

### Projects

### Settings

### Memories

### Tasks

### Metadata

---

# Redis

Stores

### Cache

### Sessions

### Working Memory

### Active Context

---

# Qdrant

Stores

### Embeddings

### Documents

### Semantic Memories

### Repository Chunks

### Knowledge Base

---

# Request Flow

---

# Standard Chat

```text
User

↓

Frontend

↓

API Gateway

↓

Backend

↓

LangGraph

↓

Memory Retrieval

↓

Model Router

↓

GPT-5 / Claude

↓

Response

↓

Frontend
```

---

# Research Workflow

```text
User

↓

Research Agent

↓

Search Tool

↓

Source Collection

↓

Summarization

↓

Citation Generation

↓

Report

↓

Response
```

---

# Coding Workflow

```text
User

↓

Coding Agent

↓

Repository Search

↓

Memory Retrieval

↓

GPT-5

↓

Generated Code

↓

Response
```

---

# Document Search Workflow

```text
Upload

↓

Chunking

↓

Embedding

↓

Qdrant

↓

Retrieval

↓

Context Assembly

↓

LLM

↓

Response
```

---

# Multi-Agent Architecture

```text
Supervisor Agent

│

├── Research Agent

├── Coding Agent

├── Writing Agent

├── Startup Agent

├── Finance Agent

├── Calendar Agent

├── Video Agent

└── Email Agent
```

---

# Worker Architecture

Purpose

Execute background jobs.

---

Examples

### Embedding generation

### Summarization

### Notifications

### Report generation

### Memory compression

### Scheduled tasks

---

Queue Flow

```text
Task

↓

Redis Queue

↓

Worker

↓

Database
```

---

# Caching Strategy

Redis caches:

### Model responses

### Embeddings

### Search results

### User preferences

### Active projects

---

# Error Handling

Strategies

### Retry

### Timeout

### Circuit breaker

### Fallback model

### Logging

---

# Observability

Metrics

### API latency

### Token usage

### Cost tracking

### Memory retrieval success

### Agent execution time

---

# Security Architecture

Layers

```text
Authentication

↓

Authorization

↓

Encryption

↓

Audit Logs

↓

Secrets Management
```

---

Security Features

### API key vault

### AES encryption

### Session security

### Backup system

### Audit trail

---

# Deployment Architecture

```text
Frontend

↓

Reverse Proxy

↓

Backend

↓

Worker

↓

PostgreSQL

↓

Redis

↓

Qdrant
```

---

Deployment Options

### Docker Compose

Primary deployment.

---

### Kubernetes

Future scaling.

---

### Local Machine

Development.

---

### Cloud VPS

Production.

---

# Future Architecture

Support for

### Local Models

### Voice System

### Computer Use

### Vision

### Mobile Applications

### Multi-device Sync

### Digital Twin

### Autonomous Agents

---

# Architectural Goal

AURA should evolve into a robust, modular, and intelligent Personal AI Operating System capable of functioning as:

* Chief of Staff
* Research Scientist
* Software Engineer
* Creative Partner
* Memory Engine
* Productivity Platform

while maintaining complete ownership, privacy, and extensibility.
