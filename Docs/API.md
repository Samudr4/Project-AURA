# PROJECT AURA

# API

Version: 1.0

Base URL

```text
/api/v1
```

Status: Active

---

# Overview

This document defines the REST API contract between:

Frontend

↓

Backend

↓

LangGraph

↓

Models

↓

Memory Layer

↓

Databases

---

# Design Principles

Consistent

Versioned

Stateless

Streaming-first

Strongly typed

Predictable

---

# Authentication

## POST

```text
/auth/login
```

Purpose

User authentication.

---

Request

```json
{
  "email": "",
  "password": ""
}
```

Response

```json
{
  "success": true,
  "user": {},
  "token": ""
}
```

---

## POST

```text
/auth/logout
```

Purpose

Terminate session.

---

## GET

```text
/auth/me
```

Purpose

Current user.

---

Response

```json
{
  "id":"",
  "name":"",
  "email":""
}
```

---

# Chat APIs

---

## POST

```text
/chat
```

Purpose

Send message.

---

Request

```json
{
  "projectId":"",
  "chatId":"",
  "message":"",
  "attachments":[],
  "model":"auto"
}
```

---

Response

```json
{
  "chatId":"",
  "messageId":"",
  "status":"streaming"
}
```

---

## GET

```text
/chat/:chatId
```

Purpose

Retrieve conversation.

---

## GET

```text
/chat
```

Purpose

List chats.

---

Query Parameters

```text
projectId

search

page

limit
```

---

## DELETE

```text
/chat/:chatId
```

Purpose

Delete conversation.

---

# Streaming

Endpoint

```text
/chat/stream
```

Protocol

SSE

---

Events

message

token

tool

error

done

---

Event Example

```json
{
  "type":"token",
  "content":"Hello"
}
```

---

# Projects

---

## GET

```text
/projects
```

---

## POST

```text
/projects
```

Request

```json
{
  "name":"",
  "description":""
}
```

---

Response

```json
{
  "id":"",
  "name":""
}
```

---

## GET

```text
/projects/:id
```

---

## PATCH

```text
/projects/:id
```

---

## DELETE

```text
/projects/:id
```

---

# Memory APIs

---

## GET

```text
/memory
```

Purpose

Search memories.

---

Query

```text
query

projectId

type
```

---

Response

```json
[
 {
   "id":"",
   "content":"",
   "importanceScore":0.8
 }
]
```

---

## POST

```text
/memory
```

Purpose

Create memory.

---

## PATCH

```text
/memory/:id
```

---

## DELETE

```text
/memory/:id
```

---

# Document APIs

---

## POST

```text
/documents/upload
```

Purpose

Upload file.

---

Multipart

Supported

PDF

DOCX

TXT

MD

PPTX

Images

---

Response

```json
{
 "documentId":"",
 "status":"processing"
}
```

---

## GET

```text
/documents
```

---

## GET

```text
/documents/:id
```

---

## DELETE

```text
/documents/:id
```

---

## GET

```text
/documents/search
```

Parameters

```text
query

projectId

limit
```

---

# Knowledge Base

---

## POST

```text
/knowledge/index
```

Purpose

Index source.

---

Request

```json
{
 "sourceType":"pdf"
}
```

---

## GET

```text
/knowledge/search
```

Parameters

```text
query
```

---

# Research APIs

---

## POST

```text
/research
```

Purpose

Perplexity workflow.

---

Request

```json
{
 "query":"",
 "depth":"normal"
}
```

---

Response

```json
{
 "reportId":"",
 "status":"running"
}
```

---

## GET

```text
/research/:id
```

---

## DELETE

```text
/research/:id
```

---

# Agent APIs

---

## GET

```text
/agents
```

---

## POST

```text
/agents
```

Request

```json
{
 "name":"",
 "type":"research"
}
```

---

## PATCH

```text
/agents/:id
```

---

## DELETE

```text
/agents/:id
```

---

## POST

```text
/agents/:id/run
```

Purpose

Execute agent.

---

Response

```json
{
 "taskId":"",
 "status":"running"
}
```

---

# Task APIs

---

## GET

```text
/tasks
```

---

## GET

```text
/tasks/:id
```

---

Response

```json
{
 "status":"completed",
 "result":{}
}
```

---

# Settings APIs

---

## GET

```text
/settings
```

---

## PATCH

```text
/settings
```

---

Request

```json
{
 "theme":"dark",
 "defaultModel":"auto"
}
```

---

# Model APIs

---

## GET

```text
/models
```

Response

```json
[
 {
  "name":"gpt-5",
  "provider":"openai"
 },
 {
  "name":"claude-opus",
  "provider":"anthropic"
 },
 {
  "name":"claude-sonnet",
  "provider":"anthropic"
 },
 {
  "name":"claude-haiku",
  "provider":"anthropic"
 },
 {
  "name":"gemini-2",
  "provider":"google"
 },
 {
  "name":"gemini-3",
  "provider":"google"
 }
]
```

---

## GET

```text
/models/router
```

Purpose

Routing configuration.

---

## PATCH

```text
/models/router
```

Purpose

Update routing.

---

# Analytics APIs

---

## GET

```text
/analytics
```

---

Response

```json
{
 "tokens":10000,
 "cost":1.5
}
```

---

## GET

```text
/analytics/models
```

---

## GET

```text
/analytics/agents
```

---

# Search APIs

---

## GET

```text
/search
```

Global search.

---

Searches

Chats

Projects

Documents

Memories

Agents

Reports

---

Response

```json
{
 "results":[]
}
```

---

# Report APIs

---

## POST

```text
/reports
```

---

## GET

```text
/reports
```

---

## GET

```text
/reports/:id
```

---

Supported Formats

Markdown

PDF

DOCX

---

# File APIs

---

## GET

```text
/files
```

---

## DELETE

```text
/files/:id
```

---

# Voice APIs

Future

---

## POST

```text
/voice/transcribe
```

---

## POST

```text
/voice/speak
```

---

## POST

```text
/voice/session
```

---

# Vision APIs

Future

---

## POST

```text
/vision/analyze
```

---

Request

Multipart image.

---

# Computer Use APIs

Future

---

## POST

```text
/computer/run
```

---

## POST

```text
/browser/run
```

---

## GET

```text
/browser/session
```

---

# Notifications

---

## GET

```text
/notifications
```

---

## PATCH

```text
/notifications/:id/read
```

---

# Error Format

Standard

```json
{
 "success":false,
 "error":"Validation Error",
 "code":"VALIDATION_ERROR"
}
```

---

# Success Format

```json
{
 "success":true,
 "data":{}
}
```

---

# Pagination

```json
{
 "items":[],
 "page":1,
 "limit":20,
 "total":100
}
```

---

# HTTP Codes

200

Success

---

201

Created

---

400

Bad Request

---

401

Unauthorized

---

403

Forbidden

---

404

Not Found

---

409

Conflict

---

422

Validation Error

---

429

Rate Limited

---

500

Internal Server Error

---

# Versioning

Current

```text
/api/v1
```

Future

```text
/api/v2
```

---

# WebSocket Events

Future

---

chat.token

chat.done

agent.started

agent.completed

task.updated

memory.created

notification.created

---

# Architectural Goal

Provide a stable, scalable API contract capable of supporting:

* Chat
* Memory
* Projects
* Research
* Agents
* Knowledge Base
* Voice
* Vision
* Computer Use
* Future Digital Twin capabilities

while maintaining strong typing, consistency, and extensibility.
