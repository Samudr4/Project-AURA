# PROJECT AURA

# DB_SCHEMA

Version: 1.0

Status: Active

Owner: Samudra

---

# Overview

This document defines the database architecture for Project AURA.

Storage layers:

* PostgreSQL
* Redis
* Qdrant

The design supports:

* Conversations
* Memory
* Projects
* Agents
* Tasks
* Documents
* Knowledge Base
* Analytics
* Future expansion

---

# Database Architecture

```text
PostgreSQL
│
├── Users
├── Chats
├── Messages
├── Projects
├── Memories
├── Tasks
├── Agents
├── Documents
├── Settings
└── Logs

Redis
│
├── Cache
├── Sessions
├── Working Memory
└── Queues

Qdrant
│
├── Documents
├── Semantic Memories
├── Codebase Chunks
└── Knowledge Base
```

---

# PostgreSQL

---

# USERS

Purpose

Store user information.

Table

users

Fields

```sql
id UUID PRIMARY KEY

name VARCHAR(255)

email VARCHAR(255)

avatar_url TEXT

created_at TIMESTAMP

updated_at TIMESTAMP
```

Indexes

```sql
INDEX email_idx
```

---

# PROJECTS

Purpose

Organize workspaces.

Table

projects

Fields

```sql
id UUID PRIMARY KEY

user_id UUID

name VARCHAR(255)

description TEXT

icon VARCHAR(255)

color VARCHAR(50)

created_at TIMESTAMP

updated_at TIMESTAMP
```

Relationships

```text
User

↓

Many Projects
```

---

# CHATS

Purpose

Conversation containers.

Table

chats

Fields

```sql
id UUID PRIMARY KEY

project_id UUID

title VARCHAR(255)

summary TEXT

created_at TIMESTAMP

updated_at TIMESTAMP
```

Relationships

```text
Project

↓

Many Chats
```

---

# MESSAGES

Purpose

Store conversation messages.

Table

messages

Fields

```sql
id UUID PRIMARY KEY

chat_id UUID

role VARCHAR(50)

content TEXT

model VARCHAR(255)

token_count INTEGER

created_at TIMESTAMP
```

Roles

```text
system

user

assistant

tool
```

---

# MEMORIES

Purpose

Persistent facts.

Table

memories

Fields

```sql
id UUID PRIMARY KEY

project_id UUID

type VARCHAR(50)

content TEXT

importance_score FLOAT

source VARCHAR(100)

created_at TIMESTAMP
```

Types

```text
episodic

semantic

project

relationship
```

---

# DOCUMENTS

Purpose

Knowledge base files.

Table

documents

Fields

```sql
id UUID PRIMARY KEY

project_id UUID

filename TEXT

mime_type VARCHAR(255)

file_size BIGINT

storage_path TEXT

status VARCHAR(50)

created_at TIMESTAMP
```

Status

```text
uploaded

processing

embedded

failed
```

---

# DOCUMENT_CHUNKS

Purpose

Track chunk metadata.

Table

document_chunks

Fields

```sql
id UUID PRIMARY KEY

document_id UUID

chunk_index INTEGER

chunk_size INTEGER

created_at TIMESTAMP
```

---

# AGENTS

Purpose

Agent registry.

Table

agents

Fields

```sql
id UUID PRIMARY KEY

project_id UUID

name VARCHAR(255)

type VARCHAR(100)

description TEXT

enabled BOOLEAN

created_at TIMESTAMP
```

Types

```text
research

coding

writing

startup

finance

calendar

email

video
```

---

# TASKS

Purpose

Background jobs.

Table

tasks

Fields

```sql
id UUID PRIMARY KEY

project_id UUID

agent_id UUID

status VARCHAR(50)

type VARCHAR(100)

payload JSONB

result JSONB

created_at TIMESTAMP

completed_at TIMESTAMP
```

Status

```text
queued

running

completed

failed
```

---

# SETTINGS

Purpose

User preferences.

Table

settings

Fields

```sql
id UUID PRIMARY KEY

user_id UUID

theme VARCHAR(50)

default_model VARCHAR(255)

persona VARCHAR(255)

preferences JSONB

updated_at TIMESTAMP
```

---

# API_KEYS

Purpose

Encrypted secrets.

Table

api_keys

Fields

```sql
id UUID PRIMARY KEY

user_id UUID

provider VARCHAR(100)

encrypted_key TEXT

created_at TIMESTAMP
```

Providers

```text
openai

anthropic

github

google

notion
```

---

# LOGS

Purpose

Audit system.

Table

logs

Fields

```sql
id UUID PRIMARY KEY

user_id UUID

action VARCHAR(255)

metadata JSONB

created_at TIMESTAMP
```

---

# ANALYTICS

Purpose

Usage tracking.

Table

analytics

Fields

```sql
id UUID PRIMARY KEY

user_id UUID

model VARCHAR(255)

tokens_input INTEGER

tokens_output INTEGER

cost FLOAT

latency_ms INTEGER

created_at TIMESTAMP
```

---

# REDIS

Purpose

Fast storage.

---

# Sessions

Key

```text
session:user_id
```

Stores

```json
{
  "userId":"",
  "expiresAt":""
}
```

---

# Working Memory

Key

```text
working_memory:chat_id
```

Stores

```json
{
  "context":[]
}
```

---

# Response Cache

Key

```text
response:model:hash
```

TTL

30 minutes

---

# Search Cache

Key

```text
search:query
```

TTL

10 minutes

---

# Active Project

Key

```text
active_project:user_id
```

---

# Queue Structures

Research jobs

```text
queue:research
```

Coding jobs

```text
queue:coding
```

Embedding jobs

```text
queue:embedding
```

Notification jobs

```text
queue:notifications
```

---

# QDRANT

Purpose

Vector search.

---

# Collection

documents

Stores

```json
{
  "document_id":"",
  "project_id":"",
  "chunk":"",
  "metadata":{}
}
```

Dimensions

1536

---

# Collection

semantic_memories

Stores

```json
{
  "memory_id":"",
  "content":"",
  "importance_score":0.8
}
```

---

# Collection

code_chunks

Stores

```json
{
  "repository":"",
  "filepath":"",
  "language":"typescript",
  "chunk":""
}
```

---

# Collection

knowledge_base

Stores

```json
{
  "source":"",
  "title":"",
  "content":""
}
```

---

# Entity Relationships

```text
User

↓

Projects

↓

Chats

↓

Messages


Projects

↓

Documents

↓

Document Chunks


Projects

↓

Agents

↓

Tasks


Projects

↓

Memories
```

---

# Indexing Strategy

Users

```sql
email_idx
```

Projects

```sql
user_id_idx
```

Chats

```sql
project_id_idx
```

Messages

```sql
chat_id_idx
```

Documents

```sql
project_id_idx
```

Tasks

```sql
status_idx
```

Analytics

```sql
model_idx
```

---

# Future Tables

meetings

emails

calendar_events

notifications

personas

voice_profiles

screenshots

browser_sessions

computer_actions

research_reports

repositories

repository_files

repository_embeddings

daily_summaries

weekly_reviews

model_usage

tool_usage

workflow_runs

automation_jobs

---

# Backup Strategy

PostgreSQL

Daily backups

---

Redis

Snapshot every hour

---

Qdrant

Daily vector snapshot

---

Retention

30 days

---

Encryption

AES-256

---

Disaster Recovery

Maximum acceptable loss:

1 hour

---

Scalability Goal

Support:

* Millions of messages
* Hundreds of projects
* Large knowledge bases
* Thousands of documents
* Multi-agent workflows
* Future local model support

while maintaining high performance and low latency.
