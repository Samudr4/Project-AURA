# PROJECT AURA

# DEPLOYMENT

Version: 1.0

Status: Active

Owner: Samudra

Classification: Core

---

# Overview

This document defines how Project AURA is deployed across:

* Development
* Staging
* Production
* Future Kubernetes environments

Goals:

* Reliability
* Simplicity
* Reproducibility
* Zero data loss
* Easy upgrades

---

# Deployment Philosophy

## Container First

Everything runs inside Docker.

---

## Infrastructure as Code

Configurations should be version-controlled.

---

## Self-Healing

Failures should automatically recover.

---

## Zero Downtime

Updates should minimize interruptions.

---

## Backup First

Every deployment must be recoverable.

---

# Environments

## Development

Purpose

Local development.

---

Platform

Docker Compose

---

Services

```text
frontend

backend

worker

postgres

redis

qdrant
```

---

## Staging

Purpose

Testing before production.

---

Platform

Docker Compose

---

Separate databases.

---

## Production

Purpose

Real usage.

---

Platform

Docker Compose

Single VPS

---

## Future

Kubernetes

---

# Local Development

Requirements

Docker

Docker Compose

Git

Node.js

---

Clone

```bash
git clone aura
```

---

Start

```bash
docker compose up
```

---

Services

```text
Frontend

http://localhost:3000

Backend

http://localhost:8080

Qdrant

http://localhost:6333
```

---

# Docker Images

Frontend

```text
aura/frontend
```

---

Backend

```text
aura/backend
```

---

Worker

```text
aura/worker
```

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
PostgreSQL

↓

Redis

↓

Qdrant

↓

Backend

↓

Worker

↓

Frontend

↓

Nginx
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

Secrets

Never committed.

---

# VPS Deployment

Recommended Providers

Hetzner

DigitalOcean

AWS

GCP

Azure

---

Recommended Specs

CPU

16 vCPU

---

RAM

32 GB

---

Disk

500 GB NVMe

---

OS

Ubuntu 24.04

---

# Domain Configuration

Example

```text
aura.samudra.dev
```

---

DNS

Cloudflare

---

Subdomains

```text
app.aura.dev

api.aura.dev

grafana.aura.dev
```

---

# Reverse Proxy

Technology

Nginx

---

Responsibilities

HTTPS

Compression

Caching

Rate limiting

Security headers

---

Ports

80

443

---

# SSL

Provider

Let's Encrypt

---

Renewal

Automatic

---

# Health Checks

Every service exposes

```text
/health
```

---

States

Healthy

Degraded

Unhealthy

---

# CI/CD

Platform

GitHub Actions

---

Workflow

```text
Push

↓

Tests

↓

Build

↓

Docker Images

↓

Deploy

↓

Health Checks

↓

Success
```

---

# Branches

main

Production

---

develop

Staging

---

feature/*

Development

---

# Release Strategy

Semantic Versioning

---

Example

```text
1.0.0

1.1.0

2.0.0
```

---

# Blue-Green Deployment

Future

---

Flow

```text
Old Version

↓

New Version

↓

Health Checks

↓

Switch Traffic

↓

Success
```

---

# Database Migration

Technology

Prisma

---

Flow

```text
Deploy

↓

Migration

↓

Verify

↓

Start Services
```

---

Rollback

Supported

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

Daily backups

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

# Monitoring

Technology

Prometheus

Grafana

---

Metrics

CPU

Memory

Disk

Latency

Queue Length

Errors

Token Usage

API Costs

---

# Logging

Technology

Pino

---

Storage

```text
logs/
```

---

Retention

30 days

---

Rotation

Daily

---

# Scaling

Backend

Horizontal

---

Workers

Horizontal

---

Redis

Cluster

Future

---

PostgreSQL

Read replicas

Future

---

Qdrant

Cluster

Future

---

# Security

TLS

Enabled

---

Private Docker Network

Enabled

---

Secrets

Environment variables

---

API Keys

Encrypted

---

Backups

Encrypted

---

# Update Procedure

Step 1

Backup databases.

---

Step 2

Pull latest images.

---

Step 3

Run migrations.

---

Step 4

Restart services.

---

Step 5

Health checks.

---

Step 6

Verify dashboards.

---

# Rollback Procedure

```text
Stop Services

↓

Restore Backup

↓

Previous Images

↓

Restart

↓

Verify
```

---

# Failure Handling

Provider Failure

↓

Retry

↓

Fallback

↓

Continue

---

Worker Failure

↓

Restart

---

Database Failure

↓

Restore Backup

---

# Observability

Dashboards

API

Database

Workers

Agents

Memory

Costs

Latency

---

Alerts

High CPU

Low Disk

Provider Errors

Queue Backlog

Memory Issues

---

# Future Deployment

Kubernetes

---

Traefik

---

Cloudflare Tunnel

---

S3 Storage

---

GPU Workers

---

Voice Server

---

Vision Server

---

Computer Use Server

---

Digital Twin Server

---

Multi-region deployment

---

# Production Checklist

### HTTPS

### Backups

### Monitoring

### Logging

### Rate Limiting

### Health Checks

### Alerts

### Migrations

### Disaster Recovery

### Audit Logs

### Secret Management

---

# Target Availability

99.9%

---

Maximum Data Loss

1 hour

---

Recovery Time

15 minutes

---

# Ultimate Goal

Provide a deployment architecture that is:

* Reliable
* Secure
* Reproducible
* Observable
* Scalable

and capable of supporting Project AURA from a personal workstation to a future cloud-native Personal AI Operating System.
