# PROJECT AURA

# INFRASTRUCTURE

Version: 1.0

Status: Active

Owner: Samudra

Classification: Core

---

# Overview

Infrastructure provides the physical foundation for Project AURA.

The infrastructure is designed to prioritize:

* Reliability
* Scalability
* Security
* Modularity
* Observability
* Future expansion

---

# Architectural Principles

## Container First

Everything runs inside Docker containers.

---

## Service Isolation

Each component runs independently.

---

## Stateless APIs

Backend services remain stateless.

---

## Horizontal Scaling

Components can scale independently.

---

## Failure Tolerance

Failures should not cascade.

---

# High-Level Infrastructure

```text
Internet

↓

Reverse Proxy

↓

Frontend

↓

Backend

↓

Workers

↓

Redis

↓

PostgreSQL

↓

Qdrant

↓

Storage
```

---

# Deployment Modes

## Development

Local machine.

---

## Production

Single VPS.

---

## Future

Kubernetes Cluster.

---

# Container Architecture

```text
frontend

backend

worker

postgres

redis

qdrant

nginx

prometheus

grafana
```

---

# Network Topology

```text
Public Network

↓

Nginx

↓

Private Docker Network

↓

Services
```

---

Public Exposure

Only:

Frontend

Reverse Proxy

---

Private Services

Backend

Redis

PostgreSQL

Qdrant

Workers

---

# Frontend Service

Container

frontend

---

Technology

Next.js

---

Port

3000

---

Responsibilities

UI

Streaming

State management

---

Health Check

```text
/health
```

---

# Backend Service

Container

backend

---

Technology

Node.js

Express

LangGraph

---

Port

8080

---

Responsibilities

API

AI orchestration

Memory

Tools

Agents

---

Health Endpoint

```text
/api/health
```

---

# Worker Service

Container

worker

---

Purpose

Background jobs.

---

Handles

Embedding

Research

Notifications

Memory compression

Report generation

Automation

---

Queue

BullMQ

---

# PostgreSQL

Container

postgres

---

Purpose

Persistent data.

---

Stores

Users

Chats

Messages

Projects

Settings

Analytics

Tasks

Memories

---

Port

5432

---

Persistence

Docker volume

---

Backup

Daily

---

# Redis

Container

redis

---

Purpose

Fast storage.

---

Stores

Sessions

Cache

Queues

Working memory

---

Port

6379

---

Persistence

Enabled

---

# Qdrant

Container

qdrant

---

Purpose

Vector search.

---

Stores

Embeddings

Documents

Semantic memories

Repository chunks

---

Port

6333

---

Persistence

Enabled

---

# Reverse Proxy

Container

nginx

---

Responsibilities

HTTPS

Compression

Load balancing

Caching

Security headers

---

Ports

80

443

---

Features

TLS

Gzip

Rate limiting

---

# File Storage

Purpose

Store uploaded files.

---

Structure

```text
storage/

documents/

images/

audio/

reports/

exports/

archives/
```

---

Persistence

Docker volume

---

Future

S3 compatible storage.

---

# Docker Volumes

```text
postgres_data

redis_data

qdrant_data

storage_data

logs_data
```

---

# Environment Variables

Frontend

```env
NEXT_PUBLIC_API_URL=
```

---

Backend

```env
OPENAI_API_KEY=

ANTHROPIC_API_KEY=

DATABASE_URL=

REDIS_URL=

QDRANT_URL=

JWT_SECRET=
```

---

Never Commit

Secrets.

---

# Docker Compose

Services

```yaml
frontend

backend

worker

postgres

redis

qdrant

nginx

prometheus

grafana
```

---

Startup Order

```text
postgres

↓

redis

↓

qdrant

↓

backend

↓

worker

↓

frontend

↓

nginx
```

---

# Health Checks

Every service exposes:

```text
/health
```

---

States

Healthy

Degraded

Unhealthy

---

# Monitoring

Technology

Prometheus

---

Collects

CPU

Memory

Requests

Latency

Errors

Queues

---

# Visualization

Technology

Grafana

---

Dashboards

API

Workers

Database

Memory

Agents

Models

Costs

---

# Logging

Technology

Pino

---

Log Categories

API

Database

Agents

Tools

Models

Queues

Workers

---

Storage

logs/

---

Rotation

Daily

---

Retention

30 days

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

Flow

```text
Task

↓

Queue

↓

Worker

↓

Result
```

---

# Caching

Technology

Redis

---

Caches

Responses

Embeddings

Search results

Settings

Projects

---

TTL

30 minutes

---

# Scaling Strategy

Backend

Horizontal

---

Workers

Horizontal

---

Qdrant

Future cluster

---

PostgreSQL

Read replicas

---

Redis

Cluster

---

# Security

Private network.

---

No direct DB exposure.

---

Secrets via env variables.

---

Encrypted backups.

---

TLS everywhere.

---

# Backup Strategy

PostgreSQL

Daily incremental

Weekly full

---

Redis

Hourly snapshots

---

Qdrant

Daily snapshots

---

Storage

Daily

---

Retention

30 days

---

Encryption

AES-256

---

# Disaster Recovery

RPO

1 hour

---

RTO

15 minutes

---

# Resource Requirements

## Development

CPU

4 cores

---

RAM

16 GB

---

Disk

100 GB SSD

---

## Recommended

CPU

8 cores

---

RAM

32 GB

---

Disk

500 GB NVMe

---

## High-End

CPU

16+ cores

---

RAM

64-128 GB

---

Disk

2 TB NVMe

---

# Production VPS

Minimum

8 vCPU

16 GB RAM

200 GB SSD

---

Recommended

16 vCPU

32 GB RAM

500 GB SSD

---

# Future Infrastructure

Kubernetes

---

Traefik

---

Cloudflare

---

S3 Storage

---

GPU Workers

---

Local Models

---

Voice Server

---

Vision Server

---

Computer Use Server

---

MCP Server

---

Digital Twin Server

---

# Observability

Metrics

Request latency

API cost

Queue length

Memory retrieval

Worker duration

Error rate

---

Targets

Availability

99.9%

---

Latency

<500 ms internal

---

Queue delay

<1 second

---

# Ultimate Goal

Provide a secure, scalable, observable, and resilient infrastructure capable of supporting AURA as a lifelong Personal AI Operating System while remaining simple enough to run locally and powerful enough to scale into a cloud-native architecture.
