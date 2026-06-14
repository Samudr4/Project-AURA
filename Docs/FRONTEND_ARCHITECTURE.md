# PROJECT AURA

# FRONTEND_ARCHITECTURE

Version: 1.0

Status: Active

Owner: Samudra

---

# Overview

The frontend is the primary interaction layer for AURA.

Its purpose is to provide a world-class user experience inspired by:

* ChatGPT
* Claude
* Perplexity
* Cursor
* Notion
* Obsidian

while maintaining:

* Simplicity
* Speed
* Modularity
* Extensibility

---

# Technology Stack

Framework

* Next.js 15

Language

* TypeScript

Styling

* TailwindCSS

Components

* shadcn/ui

State Management

* Zustand

Server State

* TanStack Query

Forms

* React Hook Form

Validation

* Zod

Markdown

* react-markdown

Code Highlighting

* Shiki

Animations

* Framer Motion

---

# App Structure

```txt
app/

dashboard/

chat/

projects/

knowledge/

memory/

agents/

research/

settings/

analytics/

layout.tsx

page.tsx
```

---

# Layout

Global Layout

```text
Navbar

↓

Sidebar

↓

Main Workspace

↓

Panels

↓

Footer
```

---

# Navigation

Sidebar

Contains

* Dashboard
* Chat
* Projects
* Knowledge
* Memory
* Research
* Agents
* Analytics
* Settings

---

# Dashboard

Route

```text
/dashboard
```

Purpose

Overview of AURA.

---

Widgets

Recent Chats

Projects

Agent Status

Memory Statistics

Token Usage

API Costs

API Keys Configuration (OpenAI, Anthropic, Google)

Recent Files

Notifications

Tasks

---

# Chat

Route

```text
/chat
```

Purpose

Main interaction area.

---

Features

Streaming

Markdown

Code blocks

Attachments

Search

Pinned chats

Folders

Conversation summaries

---

Components

ChatSidebar

ChatWindow

MessageBubble

CodeBlock

AttachmentCard

ModelBadge

StreamingIndicator

TypingIndicator

---

Input Features

Text

Files

Images

Voice

Commands

---

Supported Commands

```text
/research

/code

/summarize

/report

/memory

/agent
```

---

# Projects

Route

```text
/projects
```

Purpose

Workspace organization.

---

Features

Create project

Archive project

Tags

Colors

Icons

Project settings

---

Inside Project

Chats

Files

Memories

Agents

Research

Tasks

Repositories

---

Components

ProjectCard

ProjectHeader

ProjectSidebar

ProjectSettings

---

# Knowledge Base

Route

```text
/knowledge
```

Purpose

Document management.

---

Features

Upload files

Search documents

Tagging

Folder organization

Source tracking

Chunk inspection

Embedding status

---

Supported Sources

PDF

DOCX

Markdown

TXT

PPTX

GitHub

Websites

YouTube

Obsidian

Notion

---

Components

DocumentGrid

DocumentCard

UploadModal

SearchBar

MetadataPanel

---

# Memory

Route

```text
/memory
```

Purpose

Visualize intelligence.

---

Sections

Working Memory

Semantic Memory

Project Memory

Relationship Memory

Episodic Memory

---

Features

Search memories

Delete memories

Pin memories

Edit memories

Memory importance

---

Components

MemoryCard

MemoryTimeline

MemoryGraph

MemorySearch

---

# Research

Route

```text
/research
```

Purpose

Perplexity-like experience.

---

Features

Web search

Source comparison

Citations

Summaries

Report generation

---

Outputs

Markdown

PDF

DOCX

---

Components

ResearchInput

SourceCard

CitationPanel

ReportViewer

---

# Agents

Route

```text
/agents
```

Purpose

Manage AI workers.

---

Agents

Research Agent

Coding Agent

Writing Agent

Startup Agent

Finance Agent

Calendar Agent

Email Agent

Video Agent

---

Features

Enable

Disable

Edit prompts

Assign tools

Monitor status

---

Components

AgentCard

AgentSettings

ToolSelector

ExecutionHistory

---

# Analytics

Route

```text
/analytics
```

Purpose

Usage monitoring.

---

Metrics

Token usage

API costs

Latency

Agent performance

Memory retrieval

Queue status

---

Charts

Daily usage

Weekly usage

Cost breakdown

Model usage

Agent activity

---

Components

MetricCard

UsageChart

CostChart

ModelChart

---

# Settings

Route

```text
/settings
```

Purpose

System configuration.

---

Sections

General

Appearance

Models

Agents

Security

Memory

API Keys

Notifications

Experimental

---

# Models

Configure

* OpenAI: GPT-5
* Anthropic: Claude Opus, Claude Sonnet, Claude Haiku
* Google: Gemini 2 models, Gemini 3 models

---

Features

Default model

Routing rules

Temperature

Max tokens

Fallback order

---

# Personas

Developer

Researcher

Creative

Teacher

Executive

Custom

---

# Security

Manage

API keys

Sessions

Backups

Encryption

Audit logs

---

# Design System

Theme

Dark-first

---

Colors

Background

Surface

Primary

Secondary

Accent

Danger

Success

Warning

---

Typography

Sans-serif

Monospace

---

Spacing

4px scale

---

Radius

12px

---

Shadows

Soft

---

# Components

ui/

button

card

dialog

tabs

dropdown

tooltip

input

textarea

badge

table

chart

separator

---

# Shared Components

components/

Sidebar

Navbar

SearchBar

PageHeader

LoadingState

EmptyState

ErrorBoundary

MarkdownRenderer

CodeBlock

---

# State Management

Zustand Stores

chatStore

projectStore

memoryStore

agentStore

settingsStore

analyticsStore

---

# Server State

TanStack Query

Caches

Chats

Projects

Documents

Memories

Agents

Analytics

---

# Streaming Architecture

User

↓

Send Message

↓

Server Stream

↓

Incremental UI Updates

↓

Final Response

---

# Notifications

Toast

Success

Warning

Error

Info

---

# Search

Global Search

Searches

Chats

Projects

Memories

Documents

Agents

Reports

---

Keyboard Shortcut

Ctrl + K

---

# Command Palette

Inspired by Cursor.

---

Commands

Create Project

Search Memory

Open Chat

Run Agent

Generate Report

Upload Document

Settings

---

Keyboard Shortcut

Ctrl + Shift + P

---

# Mobile Support

Responsive layouts.

---

Tablet

Supported.

---

Desktop

Primary experience.

---

# Accessibility

Keyboard navigation

Screen readers

High contrast mode

Reduced motion

Focus states

---

# Performance

Lazy loading

Code splitting

Virtualization

Streaming

Memoization

Suspense

---

# Error Handling

Boundary components

Retry actions

Fallback UI

Offline state

---

# Future Features

Voice Mode

Computer Use

Live Camera

Screen Sharing

Multi-window Chat

Plugin Marketplace

MCP Explorer

Mobile App

Desktop App

Digital Twin Interface

---

# UX Goal

Provide an experience that combines:

ChatGPT

*

Claude

*

Perplexity

*

Cursor

*

Obsidian

*

Notion

into a single, beautiful, fast, and highly productive Personal AI Operating System.
