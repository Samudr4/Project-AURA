# PROJECT AURA

# MODEL_ROUTER

Version: 1.0

Status: Active

Owner: Samudra

---

# Overview

The Model Router is responsible for selecting the most appropriate AI model for every task.

Its purpose is to maximize:

* Intelligence
* Quality
* Reliability
* Speed
* Cost efficiency

while hiding model complexity from the user.

---

# Supported Providers

## OpenAI

Models

* GPT-5

---

## Anthropic

Models

* Claude Opus
* Claude Sonnet
* Claude Haiku

---

## Google

Models

* Gemini 2 models
* Gemini 3 models

---

# Goals

Provide:

* Intelligent model selection
* Automatic fallback
* Context optimization
* Cost control
* Reliability

---

# High-Level Architecture

```text
User Input

↓

Intent Detection

↓

Task Classification

↓

Model Router

↓

Provider

↓

Response
```

---

# Routing Principles

## Best Model Wins

Always use the strongest model for the task.

---

## Transparent

Users should not need to manually choose models.

---

## Cost Aware

Avoid expensive reasoning when unnecessary.

---

## Fault Tolerant

Provider failures should not affect the user experience.

---

# Task Categories

```text
General Chat

Coding

Research

Writing

Vision

Reasoning

Tool Use

Planning

Analysis
```

---

# Default Routing

When all API keys are active, the default routing matrix is:

| Task           | Primary Model  | Alternative/Fallback Model |
| -------------- | -------------- | -------------------------- |
| General Chat   | Claude Sonnet  | Gemini 2                   |
| Coding         | GPT-5          | Gemini 3 / Claude Opus     |
| Vision         | GPT-5          | Gemini 2 / Claude Sonnet   |
| Tool Use       | GPT-5          | Gemini 2                   |
| Deep Reasoning | Claude Opus    | Gemini 3                   |
| Architecture   | Claude Opus    | Gemini 3                   |
| Writing        | Claude Sonnet  | Claude Opus                |
| Research       | Claude Sonnet  | Gemini 2                   |
| Planning       | Claude Opus    | Claude Sonnet              |
| Summarization  | Claude Haiku   | Gemini 2 Flash             |

---

# Intent Classification

Input

```text
User Message
```

↓

Classifier

↓

Task Type

↓

Model

---

Example

Input

```text
Refactor this TypeScript code.
```

Task

Coding

Model

GPT-5

---

Input

```text
Design a startup roadmap.
```

Task

Planning

Model

Claude Sonnet

---

# Routing Pipeline

```text
User Input

↓

Intent Detection

↓

Memory Retrieval

↓

Task Classification

↓

Context Compression

↓

Model Selection

↓

Provider

↓

Response
```

---

# GPT-5

Purpose

General coding, structured function calling, and desktop/browser tool automation.

---

Strengths

* Complex code generation
* Tool use & desktop orchestration
* Multi-modal image analysis
* High instruction-following accuracy

---

Used For

* Codebase generation & refactoring
* Script automation
* UI screenshots/OCR interpretation
* Active computer control execution

---

# Claude Opus

Purpose

High-end conceptual reasoning, planning, complex architecture design, and strategic writing.

---

Strengths

* Advanced logical deduction
* Deep architectural mapping
* Long-context understanding
* Nuanced tone and creative writing

---

Used For

* Codebase architecture review
* Multi-agent debate & supervisor task planning
* Long-form documentation drafts
* Startup strategy and roadmaps

---

# Claude Sonnet

Purpose

General everyday tasks, research synthesis, and rapid text generation.

---

Strengths

* Balanced speed, cost, and intelligence
* Clear writing style
* Excellent instruction following

---

Used For

* Daily chat sessions
* Summarizing search agent outputs
* Email & blog drafting
* General text parsing

---

# Claude Haiku

Purpose

Ultra-fast utility tasks and low-cost structured formatting.

---

Strengths

* Near-instant execution speed
* Very low cost per token
* Ideal for quick checklist generation

---

Used For

* Intermediate agent sub-task formatting
* Basic text categorization
* Small summaries and prompt template generation

---

# Gemini 2

Purpose

Fast chat execution, high-performance general search, and quick visual tasks.

---

Strengths

* High execution speed
* Great visual processing
* Cost efficiency

---

Used For

* Rapid user queries
* Live research tool summarization
* Standard chart/diagram understanding

---

# Gemini 3

Purpose

Deep analysis, codebase reasoning, large vector-retrieval ingestion, and complex video/multimodal understanding.

---

Strengths

* Native 2M+ token context window
* Native video and audio processing
* Deep reasoning capabilities

---

# Routing Examples

---

## Coding

Input

```text
Build an Express API.
```

↓

GPT-5

---

## Architecture

Input

```text
Design a microservice architecture.
```

↓

Claude Sonnet

---

## Reasoning

Input

```text
Compare three approaches and justify one.
```

↓

GPT-5 Thinking

---

## Writing

Input

```text
Write a blog post.
```

↓

Claude Sonnet

---

## Vision

Input

```text
Analyze this screenshot.
```

↓

GPT-5

---

# Context Builder

Before routing:

```text
Current Message

↓

Working Memory

↓

Project Memory

↓

Knowledge Retrieval

↓

Compression

↓

Model
```

---

# Context Limits

General Chat

Medium context.

---

Research

Large context.

---

Coding

Repository context.

---

Reasoning

Maximum context.

---

# Fallback Strategy

Primary (High-end)

↓

Secondary (Mid-range)

↓

Tertiary (Utility)

---

Default (All providers active)

```text
GPT-5 / Claude Opus / Gemini 3
↓
Claude Sonnet / Gemini 2
↓
Claude Haiku / Gemini 2 Flash
```

---

# Dynamic Provider Fallback

If an API key is missing for the primary routed provider, the model router dynamically falls back to the next available tier provider. For example, if OpenAI (GPT-5) is not configured, a Coding task will fall back to Gemini 3 or Claude Opus.

# Provider Failure

```text
Request

↓

Timeout

↓

Retry

↓

Fallback Model

↓

Response
```

---

# Retry Policy

Attempts

3

---

Backoff

Exponential

---

Timeout

30 seconds

---

# Cost Optimization

Simple questions

↓

GPT-5

---

Heavy reasoning

↓

GPT-5 Thinking

---

Long writing

↓

Claude Sonnet

---

# Agent Routing

Research Agent

↓

Claude Sonnet / Gemini 2

---

Coding Agent

↓

GPT-5 / Gemini 3

---

Writing Agent

↓

Claude Sonnet / Claude Opus

---

Memory Agent

↓

Claude Opus / Gemini 3

---

Startup Agent

↓

Claude Opus / Claude Sonnet

---

Video Agent

↓

Gemini 3 / Claude Sonnet

---

# Streaming Support

Supported Models

GPT-5

Claude Sonnet

---

Events

```text
token

tool

done

error
```

---

# Reflection Layer

Purpose

Evaluate output quality.

---

Questions

Was the answer complete?

Should another model be consulted?

Was tool usage sufficient?

---

# Multi-Model Collaboration

Example

Architecture Request

```text
User

↓

Claude Sonnet

↓

GPT-5 Review

↓

Final Response
```

---

Research Request

```text
Research Agent

↓

Claude Sonnet

↓

GPT-5 Thinking

↓

Writing Agent

↓

Final Report
```

---

# User Overrides

Allowed

Explicit model selection.

---

Example

```text
/model gpt-5

/model claude

/model thinking
```

---

# Configuration

Temperature

Max Tokens

Streaming

Timeouts

Fallback Order

---

# Future Providers

xAI

Local Models

OpenRouter

---

# Analytics

Track

Latency

Tokens

Cost

Success rate

Provider failures

---

Metrics

Average latency

Average cost

Fallback frequency

---

# Target Performance

Response latency

<5 seconds

---

Fallback success

> 99%

---

Model selection accuracy

> 95%

---

# Future Features

Adaptive routing

Self-improving routing

Cost-aware routing

Quality scoring

Multi-model debate

Consensus systems

Model ensembles

---

# Ultimate Goal

Create a routing system that allows AURA to use the right intelligence, at the right time, with maximum quality and reliability, while making the entire experience feel like a single unified mind.
