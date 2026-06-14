# PROJECT AURA

# CONFIG

Version: 1.0

Status: Active

Owner: Samudra

Classification: Core System

---

# Overview

The Configuration System provides centralized control over all aspects of AURA.

It defines:

* Models
* Agents
* Memory
* Security
* Features
* Limits
* Experimental capabilities

Configuration should be:

* Centralized
* Typed
* Versioned
* Observable
* Dynamic

---

# Architecture

```text
Environment Variables

↓

Config Loader

↓

Validation

↓

Typed Config

↓

Services
```

---

# Configuration Layers

```text
System

↓

Environment

↓

User

↓

Project

↓

Runtime
```

Priority

Runtime

>

Project

>

User

>

Environment

>

System

---

# Structure

```txt
config/

app.config.ts

model.config.ts

memory.config.ts

agent.config.ts

security.config.ts

queue.config.ts

feature.config.ts

voice.config.ts

vision.config.ts

experimental.config.ts
```

---

# App Configuration

Contains

Application name

Version

Environment

Timezone

Locale

---

Example

```typescript
{
  appName:"AURA",
  version:"1.0.0",
  environment:"development"
}
```

---

# Environment Modes

Development

---

Staging

---

Production

---

Testing

---

# Model Configuration

Purpose

Configure providers.

---

Providers

OpenAI

Anthropic

Google

---

Default Models

```json
{
 "general":"claude-sonnet",
 "coding":"gpt-5",
 "writing":"claude-sonnet",
 "reasoning":"claude-opus",
 "fast":"claude-haiku",
 "vision":"gpt-5",
 "longContext":"gemini-3",
 "multimodal":"gemini-3"
}
```

---

Temperature

Default

0.7

---

Max Tokens

Default

8192

---

Timeout

30 seconds

---

Retries

3

---

Streaming

Enabled

---

Fallback Order

```text
GPT-5 / Claude Opus / Gemini 3
↓
Claude Sonnet / Gemini 2
↓
Claude Haiku / Gemini 2 Flash
```

---

# Memory Configuration

Working Memory

Enabled

---

Semantic Memory

Enabled

---

Relationship Memory

Enabled

---

Compression

Enabled

---

Daily Summary

Enabled

---

Importance Threshold

0.6

---

Decay

Enabled

---

Maximum Context

200k tokens

---

# Agent Configuration

Supervisor Agent

Enabled

---

Research Agent

Enabled

---

Coding Agent

Enabled

---

Writing Agent

Enabled

---

Finance Agent

Enabled

---

Video Agent

Enabled

---

Maximum Parallel Agents

5

---

Reflection Step

Enabled

---

Self Correction

Enabled

---

# Queue Configuration

Technology

BullMQ

---

Queues

research

coding

memory

reports

notifications

automation

---

Retries

3

---

Backoff

Exponential

---

Timeout

60 seconds

---

# Cache Configuration

Technology

Redis

---

Response Cache

30 minutes

---

Search Cache

10 minutes

---

Embedding Cache

24 hours

---

Memory Cache

5 minutes

---

# Security Configuration

Rate Limiting

100 requests/minute

---

Session Timeout

24 hours

---

Encryption

AES-256

---

Audit Logging

Enabled

---

Human Approval

Enabled

---

Protected Directories

```text
/system

/bin

/usr

/windows
```

---

# Feature Flags

Purpose

Enable gradual rollout.

---

Features

Chat

Projects

Memory

RAG

Research

Agents

Automation

Computer Use

Voice

Vision

Analytics

---

Example

```json
{
 "voice":false,
 "vision":false,
 "computerUse":true
}
```

---

# Voice Configuration

Status

Experimental

---

Wake Word

AURA

---

Continuous Mode

Enabled

---

Interruptions

Enabled

---

Preferred Voice

Default

---

Language

English

---

# Vision Configuration

Status

Experimental

---

OCR

Enabled

---

Screenshot Analysis

Enabled

---

Diagram Analysis

Enabled

---

Video Understanding

Disabled

---

# Computer Use Configuration

Status

Experimental

---

Human Approval

Required

---

Maximum Steps

50

---

Retries

3

---

Screenshot Verification

Enabled

---

Protected Paths

Enabled

---

# Automation Configuration

Daily Summary

08:00

---

Weekly Review

Sunday

---

Monthly Report

Month End

---

Notifications

Enabled

---

Goal Tracking

Enabled

---

# Analytics Configuration

Cost Tracking

Enabled

---

Latency Tracking

Enabled

---

Token Tracking

Enabled

---

Agent Metrics

Enabled

---

Retention

90 days

---

# Search Configuration

Hybrid Search

Enabled

---

Top-k

10

---

Reranking

Enabled

---

Maximum Results

50

---

# Upload Configuration

Maximum File Size

100 MB

---

Supported Types

PDF

DOCX

TXT

MD

PPTX

Images

---

# Logging Configuration

Level

Info

---

Rotation

Daily

---

Retention

30 days

---

Sensitive Data Logging

Disabled

---

# Experimental Features

Voice Mode

---

Vision Mode

---

Computer Use

---

GraphRAG

---

Knowledge Graph

---

Digital Twin

---

Autonomous Planning

---

Disabled By Default

---

# User Configuration

Theme

Dark

---

Preferred Persona

Developer

---

Preferred Model

Auto

---

Notifications

Enabled

---

# Project Configuration

Default Persona

Architect

---

Default Agent

Supervisor

---

Memory Isolation

Enabled

---

# Runtime Configuration

Dynamic

---

Can Change

Model

Persona

Temperature

Context

Features

---

# Validation

Technology

Zod

---

Invalid Configurations

Rejected

---

Startup

Fails Fast

---

# Backup

Export

JSON

---

Import

Supported

---

Versioned

Yes

---

# Metrics

Track

Config Changes

Feature Usage

Experimental Usage

Failures

---

# Future Configurations

Plugin System

MCP Servers

Local Models

GPU Workers

Digital Twin

Multi-user Support

---

# Ultimate Goal

Provide a centralized, strongly typed configuration layer that allows AURA to remain:

Flexible

Observable

Safe

Extensible

and capable of evolving without architectural rewrites.
