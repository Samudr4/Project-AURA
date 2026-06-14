# PROJECT AURA

# RAG_SYSTEM

Version: 1.0

Status: Active

Owner: Samudra

---

# Overview

The Retrieval-Augmented Generation (RAG) System is the knowledge engine of AURA.

Its purpose is to provide:

* Long-term knowledge
* Accurate retrieval
* Source attribution
* Repository understanding
* Document understanding
* Search capabilities

AURA's RAG system combines ideas from:

* Perplexity
* Obsidian
* Cursor
* NotebookLM

---

# Goals

Enable AURA to understand:

* Documents
* Repositories
* Notes
* Websites
* Videos
* Research papers

while providing:

* Citations
* Source transparency
* Semantic search
* Hybrid search

---

# High-Level Architecture

```text
Source

↓

Ingestion

↓

Chunking

↓

Embedding

↓

Qdrant

↓

Retrieval

↓

Reranking

↓

Context Builder

↓

LLM

↓

Response
```

---

# Knowledge Sources

---

## Documents

Supported

* PDF
* DOCX
* TXT
* Markdown
* PPTX

---

## Notes

Supported

* Obsidian
* Notion exports

---

## Repositories

Supported

* GitHub
* Local repositories

---

## Websites

Supported

* Articles
* Blogs
* Documentation

---

## Videos

Supported

* YouTube transcripts

---

## Research Papers

Supported

* PDF papers
* arXiv papers

---

# Ingestion Pipeline

```text
Upload

↓

Parser

↓

Metadata Extraction

↓

Chunking

↓

Embedding

↓

Storage

↓

Indexing
```

---

# Metadata

Every chunk stores:

```json
{
  "source":"",
  "title":"",
  "author":"",
  "createdAt":"",
  "projectId":"",
  "tags":[]
}
```

---

# Chunking

Purpose

Break large content into meaningful units.

---

Methods

### Fixed

Simple chunks.

---

### Recursive

Preferred.

---

### Semantic

Future.

---

### Hierarchical

Future.

---

# Chunk Size

Default

1000 tokens

---

Overlap

200 tokens

---

# Embeddings

Purpose

Convert text into vectors.

---

Embedding Model

OpenAI embeddings.

---

Future

* BGE-M3
* Local embeddings

---

Dimensions

1536

---

# Vector Database

Technology

Qdrant

---

Collections

documents

semantic_memories

repository_chunks

knowledge_base

research_papers

youtube_transcripts

---

# Qdrant Payload

```json
{
  "projectId":"",
  "source":"",
  "type":"",
  "chunk":"",
  "metadata":{}
}
```

---

# Retrieval Pipeline

```text
User Query

↓

Embedding

↓

Similarity Search

↓

Ranking

↓

Reranking

↓

Context Builder

↓

Model
```

---

# Search Types

---

## Semantic Search

Meaning-based.

---

## Keyword Search

Exact words.

---

## Hybrid Search

Preferred.

Combines:

Semantic + Keyword

---

## Metadata Search

Filter by:

Project

Tags

Source

Author

Date

---

# Ranking Factors

Similarity

Importance

Recency

Source quality

Project relevance

---

# Reranking

Purpose

Improve relevance.

---

Pipeline

```text
Top 50

↓

Rerank

↓

Top 10

↓

Context
```

---

# Context Builder

Final Prompt

```text
System

↓

Retrieved Chunks

↓

Memory

↓

User Input

↓

Model
```

---

# Citation System

Purpose

Transparency.

---

Format

```text
[Source 1]

[Source 2]

[Source 3]
```

---

Every answer should reference:

Document

Section

Page

Source

---

# Repository Indexing

Purpose

Cursor-like understanding.

---

Supported

TypeScript

JavaScript

Python

Go

Rust

Java

C#

---

Pipeline

```text
Repository

↓

Files

↓

Chunking

↓

Embeddings

↓

Qdrant

↓

Search
```

---

# File Metadata

```json
{
  "filepath":"",
  "language":"",
  "repository":""
}
```

---

# Website Ingestion

Pipeline

```text
URL

↓

Crawler

↓

Content Extraction

↓

Chunking

↓

Embeddings

↓

Qdrant
```

---

# Obsidian Support

Vault

↓

Markdown Files

↓

Embeddings

↓

Knowledge Base

---

Features

Bidirectional links.

Tags.

Graph relationships.

---

# YouTube Support

Pipeline

```text
Video

↓

Transcript

↓

Chunking

↓

Embedding

↓

Search
```

---

# Research Papers

Stores

Abstract

Sections

References

Figures

---

Enables

Paper comparison.

Literature reviews.

Citation generation.

---

# Project Isolation

Every project maintains independent knowledge.

---

Example

Project AURA

↓

AURA documents

---

Portfolio

↓

Portfolio documents

---

Startup

↓

Startup knowledge

---

No contamination.

---

# Search Examples

```text
What architecture decisions did I make?

Find TypeScript repositories.

Summarize the AI alignment paper.

Show my portfolio notes.

Compare GPT-5 and Claude.
```

---

# Source Types

```text
pdf

docx

markdown

repository

website

youtube

paper

memory
```

---

# Caching

Redis

Stores

Frequent searches.

Embeddings.

Results.

---

TTL

30 minutes

---

# Background Workers

Embedding Worker

Index Worker

Rerank Worker

Cleanup Worker

---

# Knowledge Graph

Future.

---

Nodes

People

Projects

Documents

Companies

Repositories

Concepts

---

Relationships

```text
Project

↓

Document

↓

Concept

↓

Company
```

---

# Multimodal RAG

Future.

---

Supports

Images

Screenshots

Audio

Video

Whiteboards

Diagrams

---

# Compression

Old chunks

↓

Summaries

↓

Archive

---

# Security

Encrypted storage.

---

Project isolation.

---

Access controls.

---

Audit logs.

---

# Metrics

Retrieval latency

Chunk quality

Rerank accuracy

Search success

Embedding costs

---

Targets

Retrieval latency

<100 ms

---

Search relevance

> 95%

---

Top-k accuracy

> 90%

---

# Future Features

GraphRAG

Hierarchical RAG

Agentic RAG

Multimodal RAG

Temporal RAG

Memory Graphs

Knowledge Graphs

Repository Graphs

---

# Ultimate Goal

Transform AURA into a continuously evolving knowledge engine capable of understanding:

* Documents
* Repositories
* Research
* Notes
* Videos
* Websites
* Memories

and delivering highly relevant, explainable, and source-grounded intelligence while maintaining privacy and full ownership.
