# PROJECT AURA

# MEMORY_SYSTEM

Version: 1.0

Status: Active

Owner: Samudra

---

# Overview

The Memory System is the core intelligence layer of AURA.

Its purpose is to transform AURA from a stateless chatbot into a persistent Personal AI Operating System.

Memory enables:

* Personalization
* Long-term context
* Project awareness
* Relationship understanding
* Continuous learning
* Knowledge retention

---

# Memory Philosophy

Human memory consists of multiple systems.

AURA follows the same approach.

---

# Memory Hierarchy

```text
Working Memory

↓

Episodic Memory

↓

Semantic Memory

↓

Project Memory

↓

Relationship Memory

↓

Knowledge Base

↓

Archived Memory
```

---

# Architectural Goals

### Persistence

Information survives across sessions.

---

### Relevance

Retrieve only useful memories.

---

### Compression

Avoid excessive context growth.

---

### Explainability

Every memory should have a source.

---

### Forgetting

Not all information deserves permanent storage.

---

# High-Level Architecture

```text
User Message

↓

Memory Extractor

↓

Importance Scoring

↓

Memory Classifier

↓

Storage Layer

↓

Retrieval Engine

↓

Context Builder

↓

Model
```

---

# Memory Types

---

# Working Memory

Purpose

Temporary context.

Equivalent to short-term memory.

---

Storage

Redis

---

Retention

Current session.

---

Examples

Current task

Current file

Current discussion

Recent messages

---

Structure

```json
{
  "activeGoal":"",
  "recentMessages":[]
}
```

---

# Episodic Memory

Purpose

Store experiences.

Equivalent to human experiences.

---

Storage

PostgreSQL

---

Examples

Conversations

Events

Decisions

Milestones

---

Examples

```text
User started Project AURA.

User redesigned portfolio.

User applied to Anthropic.
```

---

Retention

Long-term.

---

# Semantic Memory

Purpose

Store facts.

---

Storage

Qdrant

---

Examples

```text
User prefers TypeScript.

User uses GPT-5.

User likes dark themes.

User works with MERN stack.
```

---

Retrieval

Similarity search.

---

# Project Memory

Purpose

Separate knowledge per project.

---

Storage

PostgreSQL + Qdrant

---

Examples

Project requirements.

Architecture decisions.

Repository structure.

Agents.

Goals.

---

Project Isolation

Each project maintains independent memories.

---

Example

Project AURA

↓

Memories specific to AURA

---

Portfolio

↓

Portfolio memories

---

Startup

↓

Startup memories

---

# Relationship Memory

Purpose

Track entities.

---

Stores

People

Companies

Clients

Repositories

Products

---

Examples

```text
Anthropic

OpenAI

EncryptArx

GitHub repositories
```

---

# Knowledge Memory

Purpose

Store documents and external knowledge.

---

Storage

Qdrant

---

Sources

PDF

DOCX

Markdown

GitHub

Websites

Research papers

YouTube transcripts

---

# Archived Memory

Purpose

Cold storage.

---

Retention

Forever.

---

Used for

Historical conversations.

Past projects.

Reports.

---

Storage

Compressed.

---

# Memory Pipeline

```text
Conversation

↓

Memory Extraction

↓

Classification

↓

Importance Scoring

↓

Deduplication

↓

Embedding

↓

Storage

↓

Retrieval
```

---

# Memory Extraction

Purpose

Identify meaningful information.

---

Extract

Preferences

Goals

Decisions

Facts

Relationships

Habits

Projects

Tasks

---

Example

Input

```text
I prefer TypeScript over Python.
```

Extracted Memory

```text
Preference:
TypeScript preferred.
```

---

# Memory Classification

Categories

Preference

Goal

Fact

Decision

Relationship

Project

Task

Event

Habit

---

Example

```json
{
  "type":"preference",
  "content":"Prefers TypeScript"
}
```

---

# Importance Scoring

Range

0–1

---

Formula

Importance =

Frequency +

Recency +

Novelty +

User relevance

---

Scores

0.9

Permanent

---

0.7

Long-term

---

0.5

Temporary

---

0.2

Ignore

---

# Deduplication

Purpose

Avoid duplicates.

---

Example

Already stored

```text
User prefers TypeScript.
```

New memory

```text
User likes TypeScript.
```

Result

Update existing memory.

---

# Memory Compression

Purpose

Reduce context size.

---

Methods

Summarization

Clustering

Merging

Hierarchical compression

---

Example

100 conversations

↓

Summary

↓

Single memory

---

# Retrieval Pipeline

```text
User Query

↓

Working Memory

↓

Project Memory

↓

Semantic Search

↓

Ranking

↓

Compression

↓

Context Builder

↓

Model
```

---

# Ranking Factors

Similarity

Importance

Recency

Frequency

Project relevance

Source reliability

---

# Context Builder

Purpose

Prepare model context.

---

Components

Current Message

Working Memory

Relevant Memories

Project Memories

Knowledge Chunks

Recent Conversations

---

Final Prompt

```text
System

↓

Context

↓

Memories

↓

User Input

↓

Model
```

---

# Forgetting System

Purpose

Prevent memory overload.

---

Low Importance

↓

Decay

↓

Archive

---

Types

Soft Delete

Hard Delete

Archive

---

# Memory Decay

Old memories lose weight.

---

Formula

Importance × Time

---

Allows

Fresh information to dominate.

---

# User Controls

Create memory

Edit memory

Pin memory

Delete memory

Archive memory

Search memory

---

# Memory Search

Supports

Semantic search

Keyword search

Hybrid search

---

Examples

```text
What startups did I discuss last year?

What are my preferences?

Show architecture decisions.

Find MERN-related memories.
```

---

# Project Memory Isolation

Each project has:

Own memories

Own documents

Own agents

Own conversations

---

Benefits

No context pollution.

---

# Memory Summaries

Daily

Conversation summaries.

---

Weekly

Project summaries.

---

Monthly

Knowledge summaries.

---

Yearly

Historical snapshots.

---

# Relationship Graph

Stores

People

Companies

Projects

Repositories

Products

---

Graph Example

```text
Samudra

↓

Project AURA

↓

GPT-5

↓

OpenAI
```

---

# Memory Storage

---

PostgreSQL

Stores

Metadata

Source

Importance

Type

---

Redis

Stores

Active session memory.

---

Qdrant

Stores

Embeddings.

---

# Memory Collections

semantic_memories

project_memories

relationship_memories

knowledge_memories

conversation_summaries

---

# Future Features

Memory graph

Knowledge graph

Visual memory explorer

Temporal memories

Voice memories

Image memories

Screen memories

Meeting memories

Digital Twin

---

# Digital Twin Memory

Future capability.

---

Stores

Writing style

Preferences

Decision patterns

Goals

Habits

Communication style

Personality

---

Allows

Personal AI clone.

---

# Backup Strategy

Daily

Incremental.

---

Weekly

Full backup.

---

Monthly

Archive snapshot.

---

Encryption

AES-256

---

Retention

Unlimited.

---

# Metrics

Memory retrieval accuracy

Memory relevance

Compression ratio

Duplicate rate

Average retrieval latency

---

Target

Retrieval latency

<100ms

---

Relevance

> 95%

---

# Ultimate Goal

Transform AURA from:

Chatbot

↓

Assistant

↓

Knowledge Base

↓

Memory Engine

↓

Chief of Staff

↓

Digital Twin

while maintaining:

* Privacy
* Intelligence
* Ownership
* Explainability
* Long-term evolution
