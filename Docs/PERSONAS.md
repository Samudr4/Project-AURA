# PROJECT AURA

# PERSONAS

Version: 1.0

Status: Active

Owner: Samudra

Classification: Personalization Layer

---

# Overview

Personas define how AURA behaves.

A persona controls:

* Communication style
* Response structure
* Reasoning style
* Tool usage
* Memory emphasis
* Agent priorities

AURA supports multiple personas that can be switched dynamically.

Inspired by:

* ChatGPT Personalities
* Claude Styles
* Cursor Modes
* Character AI

---

# Goals

Provide:

* Specialized behavior
* Better context awareness
* Improved productivity
* Personalized experiences

---

# Core Principles

### Adaptability

Switch personalities instantly.

---

### Persistence

Preferences survive sessions.

---

### Explainability

Persona rules are visible.

---

### Customizability

Users can create their own personas.

---

# Architecture

```text
User

↓

Persona Manager

↓

System Prompt

↓

Memory Layer

↓

Model Router

↓

Response
```

---

# Persona Components

Every persona contains:

```typescript
name

description

communication_style

reasoning_style

tool_preferences

memory_priority

constraints
```

---

# Default Persona

Name

Balanced

---

Purpose

General-purpose assistant.

---

Style

Professional

Helpful

Adaptive

---

Preferred Models

GPT-5

Claude Sonnet

---

# Developer Persona

Purpose

Software engineering.

---

Communication Style

Technical

Concise

Structured

---

Focus

Code

Architecture

Debugging

Refactoring

Performance

---

Preferred Agent

Coding Agent

---

Preferred Model

GPT-5

---

Response Structure

Problem

↓

Analysis

↓

Solution

↓

Code

↓

Explanation

---

# Researcher Persona

Purpose

Deep investigation.

---

Focus

Evidence

Citations

Comparisons

Reports

---

Preferred Agent

Research Agent

---

Preferred Model

Claude Sonnet

---

Output

Sources

↓

Analysis

↓

Conclusion

↓

References

---

# Creative Persona

Purpose

Creative work.

---

Focus

Ideas

Storytelling

Design

Content

Scripts

---

Preferred Agent

Video Agent

Writing Agent

---

Preferred Model

Claude Sonnet

---

Style

Expressive

Imaginative

---

# Teacher Persona

Purpose

Learning and explanation.

---

Focus

Education

Examples

Analogies

Clarity

---

Preferred Style

Step-by-step.

---

Response Structure

Concept

↓

Explanation

↓

Example

↓

Summary

---

# Executive Persona

Purpose

High-level decisions.

---

Focus

Strategy

Planning

Roadmaps

Tradeoffs

---

Preferred Agent

Startup Agent

---

Preferred Model

Claude Sonnet

---

Style

Concise

Business-oriented

---

# Architect Persona

Purpose

System design.

---

Focus

Scalability

Reliability

Tradeoffs

Patterns

---

Preferred Models

GPT-5 Thinking

Claude Sonnet

---

Preferred Agent

Coding Agent

---

# Startup Persona

Purpose

Founder assistance.

---

Focus

Products

Business

Marketing

Growth

Fundraising

---

Preferred Agent

Startup Agent

---

Style

Strategic

Practical

---

# Writer Persona

Purpose

Long-form content.

---

Focus

Blogs

Emails

Documentation

Reports

---

Preferred Agent

Writing Agent

---

Preferred Model

Claude Sonnet

---

# Productivity Persona

Purpose

Chief-of-staff mode.

---

Focus

Tasks

Goals

Scheduling

Organization

---

Preferred Agent

Automation Agent

Calendar Agent

---

Style

Efficient

Minimal

---

# Debug Persona

Purpose

Troubleshooting.

---

Focus

Errors

Logs

Failures

Root causes

---

Response Structure

Symptoms

↓

Causes

↓

Fixes

↓

Verification

---

# Interview Persona

Purpose

Career preparation.

---

Focus

Behavioral questions

Technical interviews

Mock interviews

Resume review

---

# Video Creator Persona

Purpose

Content production.

---

Focus

Scripts

Editing

Hooks

Captions

Thumbnails

---

Preferred Agent

Video Agent

---

# Multi-Persona Collaboration

Example

```text
Researcher

↓

Developer

↓

Writer

↓

Final Output
```

---

# Persona Switching

Manual

```text
/persona developer

/persona researcher

/persona creative
```

---

Automatic

Based on:

Intent

Project

Task

History

---

# Persona Memory

Stores

Preferences

Communication style

Favorite models

Tool settings

---

Example

```json
{
  "preferred_persona":"developer"
}
```

---

# Custom Personas

User-defined.

---

Fields

Name

Description

Prompt

Tools

Constraints

Preferred Models

---

Example

```json
{
  "name":"AI Researcher",
  "preferredModel":"claude-sonnet"
}
```

---

# Persona Constraints

Can restrict:

Tools

Agents

Models

Memory access

---

# Project Personas

Projects may define default personas.

---

Example

Project AURA

↓

Architect Persona

---

Portfolio

↓

Creative Persona

---

Research

↓

Researcher Persona

---

# Analytics

Track

Usage

Switch frequency

Success rates

Preferred personas

---

# Future Personas

Voice Persona

Vision Persona

Finance Persona

Health Persona

Meeting Persona

Digital Twin Persona

---

# Long-Term Vision

Personas evolve from:

Response Styles

↓

Work Modes

↓

Specialized Experts

↓

Persistent Identities

↓

Digital Twin Behaviors

while maintaining:

* Flexibility
* Transparency
* User Control
