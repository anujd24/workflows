# ZapFlux

> **Workflow automation platform** — connect apps, automate tasks, and build event-driven pipelines at scale.

🌐 **Live Demo:** [workflows-wheat-ten.vercel.app](https://workflows-wheat-ten.vercel.app)

---

## What is ZapFlux?

ZapFlux is a full-stack **Zapier-like automation platform** built from scratch. Users create "Zaps" — automated workflows triggered by external events (e.g. a GitHub webhook) that execute a chain of actions (e.g. send an email, notify Slack).

The system is designed around **reliability and scalability** : using the Transactional Outbox Pattern to guarantee zero event loss, and Apache Kafka to decouple trigger ingestion from action execution.

---

## Architecture Overview

```
┌─────────────┐     webhook POST      ┌──────────────────┐
│   GitHub /  │ ──────────────────►  │   Hook Service   │
│  External   │                       │ (hooks.zapflux)  │
└─────────────┘                       └────────┬─────────┘
                                               │  $transaction (atomic)
                                               ▼
                                  ┌────────────────────────┐
                                  │     PostgreSQL (DB)     │
                                  │  ┌──────────────────┐  │
                                  │  │     ZapRun       │  │
                                  │  │  zapId + metadata│  │
                                  │  └──────────────────┘  │
                                  │  ┌──────────────────┐  │
                                  │  │  ZapRunOutbox    │  │
                                  │  │   zapRunId ref   │  │
                                  │  └──────────────────┘  │
                                  └────────────┬───────────┘
                                               │  polls outbox
                                               ▼
                                       ┌───────────────┐
                                       │   Processor   │
                                       │ (polls + pub) │
                                       └───────┬───────┘
                                               │  publish
                                               ▼
                                         ┌──────────┐
                                         │  Kafka   │
                                         └──┬───┬───┘
                                    consume │   │ consume
                                    ┌───────┘   └───────┐
                                    ▼                   ▼
                             ┌──────────┐        ┌──────────┐
                             │ Worker 1 │        │ Worker 2 │  ...N
                             │(email,   │        │(webhook, │
                             │ slack)   │        │ next step│
                             └──────────┘        └──────────┘
```

---

## Key Design Decisions

### 1. Transactional Outbox Pattern
The Hook Service never writes to Kafka directly. Instead, it uses a **single atomic DB transaction** to write both the `ZapRun` record and a `ZapRunOutbox` entry simultaneously.

```typescript
await client.$transaction(async tx => {
  const run = await tx.zapRun.create({
    data: { zapId, metadata: body }
  });
  await tx.zapRunOutbox.create({
    data: { zapRunId: run.id }
  });
});
```

**Why?** If we wrote directly to Kafka after the DB insert, a crash between those two operations would lose the event permanently. The outbox guarantees **at-least-once delivery** — the event is never lost, even if the processor crashes and restarts.

### 2. Decoupled Microservices
Each service has a single responsibility:

| Service | Responsibility |
|---|---|
| `hook-service` | Receives webhooks, writes atomically to DB |
| `processor` | Polls outbox, publishes to Kafka, clears processed rows |
| `worker` | Consumes Kafka messages, tracks action progress, executes steps |
| `primary-backend` | REST API for user/zap/trigger/action management |
| `frontend` | React UI for building and managing workflows |

### 3. Horizontal Worker Scaling
Workers are stateless Kafka consumers. Need more throughput? Add more worker instances — Kafka's consumer group protocol automatically rebalances partitions across them.

---

## Tech Stack

**Backend**
- Node.js + TypeScript
- Express.js (REST API)
- Prisma ORM
- PostgreSQL
- Apache Kafka (message queue)
- Zod (runtime schema validation)
- JWT (authentication)
- CORS middleware

**Frontend**
- React
- Next.js
- Tailwind CSS

**Infrastructure**
- Vercel (frontend deployment)
- Docker (local Kafka + Postgres)

---

## Project Structure

```
zapflux/
├── primary-backend/
│   ├── router/
│   │   ├── user.ts        # Signup, signin, JWT auth
│   │   ├── zap.ts         # Create/read zaps
│   │   ├── trigger.ts     # Available triggers
│   │   └── action.ts      # Available actions
│   ├── types/
│   │   └── index.ts       # Zod schemas (SignupSchema, ZapCreateSchema...)
│   ├── middleware.ts       # JWT verification middleware
│   └── index.ts           # Express app entry point
├── hook-service/           # Webhook receiver + outbox writer
├── processor/              # Outbox poller + Kafka publisher
├── worker/                 # Kafka consumer + action executor
└── frontend/               # React/Next.js UI
```

---

## API Reference

### Auth
```
POST /api/v1/user/signup    — Register new user
POST /api/v1/user/signin    — Login, returns JWT
```

### Zaps
```
POST /api/v1/zap            — Create a new zap (trigger + actions)
GET  /api/v1/zap            — List all zaps for current user
GET  /api/v1/zap/:id        — Get specific zap details
```

### Triggers & Actions
```
GET /api/v1/trigger         — List available triggers
GET /api/v1/action          — List available actions
```

**Zap creation payload:**
```json
{
  "availableTriggerId": "github-webhook",
  "triggeredMetadata": {},
  "actions": [
    {
      "availableActionId": "send-email",
      "actionMetadata": { "to": "user@example.com" }
    }
  ]
}
```

---

## Running Locally

**Prerequisites:** Node.js 18+, Docker

```bash
# Clone the repo
git clone https://github.com/yourusername/zapflux.git
cd zapflux

# Start infrastructure (Kafka + PostgreSQL)
docker-compose up -d

# Install dependencies
npm install

# Run DB migrations
cd primary-backend && npx prisma migrate dev

# Start all services (4 terminal tabs)
cd primary-backend && npm run dev   # :3000
cd hook-service    && npm run dev   # :3001
cd processor       && npm run dev
cd worker          && npm run dev

# Start frontend
cd frontend && npm run dev          # :3002
```

---

## What I Learned

- Implementing the **Transactional Outbox Pattern** to guarantee exactly-once semantics at the application level
- Designing **event-driven microservices** that are independently deployable and scalable
- Using **Kafka consumer groups** for parallel, fault-tolerant message processing
- Building **type-safe APIs** end-to-end with TypeScript + Zod schema validation
- Structuring a **monorepo** with shared types across services

---

## Author

**Anuj Dubey**
[LinkedIn](https://linkedin.com/in/yourprofile) · [GitHub](https://github.com/yourusername) · [Live Demo](https://workflows-wheat-ten.vercel.app)