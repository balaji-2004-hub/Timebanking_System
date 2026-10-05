# TimeBanking System

A full-stack community TimeBanking platform built with **Next.js 15, React 19, TypeScript, and Tailwind CSS**. The application enables members to exchange services using time credits rather than traditional currency.

The project is organized as two separate Next.js applications:

- **Frontend** — user-facing application and UI on `http://localhost:4028`
- **Backend** — API routes, business logic, and development persistence on `http://localhost:4029`

> **Project scope:** This README documents the implementation contained in this repository. The backend currently uses a local file-backed JSON store for development/demo purposes.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Application Modules](#application-modules)
7. [Frontend Architecture](#frontend-architecture)
8. [Backend Architecture](#backend-architecture)
9. [API Architecture](#api-architecture)
10. [Data Persistence](#data-persistence)
11. [Authentication](#authentication)
12. [Time-Credit Workflow](#time-credit-workflow)
13. [Messaging and Reviews](#messaging-and-reviews)
14. [Admin and Dispute Management](#admin-and-dispute-management)
15. [Environment Configuration](#environment-configuration)
16. [Prerequisites](#prerequisites)
17. [Installation and Setup](#installation-and-setup)
18. [Running the Application](#running-the-application)
19. [Validation and Build Commands](#validation-and-build-commands)
20. [Troubleshooting](#troubleshooting)
21. [Git and Environment Files](#git-and-environment-files)
22. [Development and Production Considerations](#development-and-production-considerations)
23. [Future Enhancements](#future-enhancements)
24. [Technical Skills Demonstrated](#technical-skills-demonstrated)

---

## Project Overview

TimeBanking is a community-oriented service exchange platform where members can:

- Create an account and sign in.
- Maintain a personal member profile.
- Offer services to other members.
- Request services from the community.
- Earn and spend time credits.
- Complete credit-based exchanges.
- Communicate through member messaging.
- Submit and view ratings and reviews.
- Raise and manage disputes.
- Access administrative member and analytics functionality.

The application separates the presentation layer from the API/data layer, making the project easier to develop, test, maintain, and extend.

---

## Core Features

### Member Management

- User registration and login
- Member profiles
- Profile settings
- Skills offered and skills needed
- Member statistics
- Member directory functionality

### Service and Listing Management

- Service offers
- Service requests
- Service categories
- Listing descriptions
- Credit-hour values
- Listing retrieval and detail views

### Time-Credit Management

- Earn credits
- Spend credits
- Complete member-to-member exchanges
- Track credit balances
- Record transaction history
- Track exchange activity

### Communication

- Send messages between members
- View message threads
- Mark messages as read
- Store sender, recipient, subject, body, and timestamps

### Reviews and Ratings

- Submit member reviews
- Store numerical ratings
- Associate reviews with exchanges when applicable
- Calculate member rating information

### Administration

- Member management
- Analytics summary
- Recent exchanges
- Recent listings
- Category breakdown
- Review information
- Dispute creation and management
- Dispute severity and status tracking

### UI and Developer Experience

- Responsive Tailwind CSS interface
- React component architecture
- React Hook Form for form handling
- Lucide icons
- Recharts for chart/analytics visualization
- TypeScript type safety
- ESLint and Prettier configuration

---

## System Architecture

```text
                    ┌──────────────────────────┐
                    │       User / Browser     │
                    └────────────┬─────────────┘
                                 │
                                 │ HTTP / JSON
                                 ▼
                    ┌──────────────────────────┐
                    │        Frontend          │
                    │ Next.js + React + TS     │
                    │ Tailwind CSS              │
                    │ Port: 4028               │
                    └────────────┬─────────────┘
                                 │
                                 │ REST-style API requests
                                 ▼
                    ┌──────────────────────────┐
                    │         Backend          │
                    │ Next.js API Routes       │
                    │ TypeScript               │
                    │ Port: 4029               │
                    └────────────┬─────────────┘
                                 │
                                 │ Read / Write
                                 ▼
                    ┌──────────────────────────┐
                    │ Local JSON Persistence   │
                    │ .timebank/db.json        │
                    └──────────────────────────┘
```

The frontend communicates with the backend through the API base URL configured in `NEXT_PUBLIC_API_BASE_URL`.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 15 |
| UI Library | React 19 |
| Programming Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Forms | React Hook Form |
| Icons | Lucide React |
| Charts | Recharts |
| Backend | Next.js API Routes |
| Runtime | Node.js |
| Data Format | JSON |
| API Communication | Fetch API |
| Code Quality | ESLint + Prettier |
| Build Tooling | Next.js |

---

## Project Structure

```text
Timebanking_System-main/
│
├── backend/
│   ├── src/
│   │   ├── app/
│   │   │   └── api/
│   │   │       ├── auth/
│   │   │       ├── admin/
│   │   │       ├── credits/
│   │   │       ├── exchanges/
│   │   │       ├── listings/
│   │   │       ├── members/
│   │   │       ├── messages/
│   │   │       ├── profile/
│   │   │       ├── reviews/
│   │   │       └── services/
│   │   ├── lib/
│   │   │   └── server-db.ts
│   │   └── middleware.ts
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## Application Modules

### 1. Authentication

Provides:

- Member registration
- Member login
- Authentication context/state on the frontend
- Account/profile initialization

Relevant API routes:

```text
POST /api/auth/register
POST /api/auth/login
```

### 2. Member Profiles

Members can maintain profile information including:

- Display name
- Email
- Age group
- Skills offered
- Skills needed
- Settings
- Credit statistics
- Recent activity
- Transactions

Relevant routes include:

```text
GET   /api/profile/[email]
PATCH /api/profile/[email]
GET   /api/member/profile
GET   /api/members
GET   /api/admin/members
```

### 3. Service Listings

Members can publish services as either an **offer** or a **request**.

A listing can contain:

- Title
- Category
- Type
- Description
- Credit hours
- Owner
- Creation timestamp

Relevant routes:

```text
GET  /api/listings
POST /api/listings
GET  /api/listings/[id]

GET  /api/services
POST /api/services
GET  /api/services/[id]
```

### 4. Credits and Exchanges

The application supports:

- Earning credits
- Spending credits
- Member-to-member exchanges
- Exchange status tracking
- Transaction history

Relevant routes:

```text
POST /api/credits/earn
POST /api/credits/spend
POST /api/credits/exchange

GET  /api/exchanges
GET  /api/exchanges/[id]
```

### 5. Messaging

Members can communicate through stored messages.

Message records include:

- Sender
- Recipient
- Subject
- Body
- Timestamp
- Read/unread status
- Thread identifier

Relevant route:

```text
GET   /api/messages
POST  /api/messages
PATCH /api/messages
```

### 6. Reviews and Ratings

Members can provide feedback after interactions.

Review information includes:

- Author
- Target member
- Rating
- Comment
- Related exchange, when applicable
- Creation timestamp

Relevant route:

```text
GET  /api/reviews
POST /api/reviews
```

### 7. Admin Analytics and Disputes

Administrative functionality includes:

- Member information
- Platform analytics
- Recent exchanges
- Recent listings
- Category statistics
- Reviews
- Disputes

Disputes support:

- Severity: `low`, `medium`, `high`
- Status: `open`, `investigating`, `resolved`
- Resolution information
- Optional exchange association

Relevant routes:

```text
GET   /api/admin/members
GET   /api/admin/analytics
GET   /api/admin/disputes
POST  /api/admin/disputes
PATCH /api/admin/disputes
```

---

## Frontend Architecture

The frontend is implemented with Next.js and React.

### Component-Based UI

The application separates reusable interface elements into components and organizes pages under the Next.js `app` directory.

### API Client

The frontend API layer is implemented in:

```text
frontend/src/lib/timebank-api.ts
```

It provides reusable functions for:

- Login
- Registration
- Profile retrieval/update
- Credit operations
- Exchanges
- Listings
- Members
- Messages
- Reviews
- Analytics
- Disputes

The API base URL is read from:

```env
NEXT_PUBLIC_API_BASE_URL
```

with the local backend URL used as the development fallback.

### Authentication State

The frontend contains an authentication provider that manages the current user state and authentication-related actions.

### Forms

React Hook Form is used for structured form handling and validation in the authentication UI.

---

## Backend Architecture

The backend is implemented using Next.js API Route Handlers with TypeScript.

The backend contains:

- API route handlers
- Validation and request processing
- Profile operations
- Credit operations
- Exchange processing
- Messaging operations
- Review operations
- Dispute operations
- Analytics calculations
- Local persistence

The main persistence module is:

```text
backend/src/lib/server-db.ts
```

The backend middleware also provides API-level CORS headers and handles `OPTIONS` requests.

---

## API Architecture

The backend exposes JSON-based API endpoints.

Representative endpoint groups:

| Module | Endpoints |
|---|---|
| Authentication | `/api/auth/*` |
| Profiles | `/api/profile/*`, `/api/member/profile` |
| Members | `/api/members`, `/api/admin/members` |
| Services | `/api/services/*`, `/api/listings/*` |
| Credits | `/api/credits/*`, `/api/member/credits` |
| Exchanges | `/api/exchanges/*` |
| Messages | `/api/messages` |
| Reviews | `/api/reviews` |
| Analytics | `/api/admin/analytics` |
| Disputes | `/api/admin/disputes` |

The frontend uses the browser Fetch API to send JSON requests to these endpoints.

---

## Data Persistence

The current backend uses a **file-backed JSON database** for development and demonstration.

The persistence directory is:

```text
.timebank/
```

and the database file is:

```text
.timebank/db.json
```

When the backend is started from the `backend` directory, this is created under:

```text
backend/.timebank/db.json
```

The store contains collections for:

```text
accounts
profiles
listings
exchanges
messages
reviews
disputes
```

The database file is created automatically when required.

### Important

The JSON store is intended for local development/demo use. It is **not a production-grade multi-user database**.

For production deployment, the persistence layer should be replaced with a managed relational or document database with appropriate concurrency, backup, migration, and access-control mechanisms.

---

## Authentication

The current application provides registration and login through backend API routes.

The frontend sends authentication requests to:

```text
POST /api/auth/register
POST /api/auth/login
```

The current development implementation stores account information in the local JSON persistence layer and performs application-level credential comparison.

### Production Security Recommendation

Before production deployment, implement:

- Password hashing using a strong password-hashing algorithm
- Secure session or token-based authentication
- Authorization middleware
- Role-based access control enforcement on protected API routes
- Secure cookies where applicable
- Restricted CORS origins
- Environment-based secrets
- Input validation and rate limiting
- Audit logging

These are production hardening measures and are not represented as completed features unless implemented in the repository.

---

## Time-Credit Workflow

The central concept of the application is exchanging time-based value through credits.

A typical workflow is:

```text
Member offers/request a service
            │
            ▼
Service listing is created
            │
            ▼
Another member selects/requests the service
            │
            ▼
Credit-based exchange is completed
            │
            ├── Provider receives/records value
            │
            └── Requester spends/records value
            │
            ▼
Transaction and exchange history updated
            │
            ▼
Members can review the interaction
```

Credit operations include:

```text
Earn
Spend
Exchange
Transaction history
```

The backend validates important exchange conditions such as member existence, positive credit amounts, and valid provider/requester relationships.

---

## Messaging and Reviews

### Messaging

The messaging module supports member-to-member communication.

Messages contain:

```text
senderEmail
recipientEmail
subject
body
createdAt
read
threadId
```

This enables basic conversation grouping and read/unread tracking.

### Reviews

Reviews allow members to provide feedback using:

- Rating
- Comment
- Reviewer
- Target member
- Optional related exchange
- Timestamp

The backend also supports average-rating calculations for member analytics.

---

## Admin and Dispute Management

The admin functionality provides platform-level visibility.

Analytics can include:

- Total members
- Total administrators
- Total credits
- Total exchanges
- Total listings
- Total messages
- Total reviews
- Total disputes
- Open disputes
- Average rating
- Top members
- Recent exchanges
- Recent listings
- Category breakdown

Dispute records support a lifecycle from:

```text
Open
  ↓
Investigating
  ↓
Resolved
```

with severity levels:

```text
Low
Medium
High
```

---

## Environment Configuration

### Frontend

Create:

```text
frontend/.env.local
```

with:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4029
```

The frontend uses this value to communicate with the backend.

### Environment File Rules

Use `.env.example` files as templates.

Do not commit:

```text
.env
.env.local
```

if they contain private or environment-specific configuration.

---

## Prerequisites

Install the following before running the project:

- Node.js 18.18 or newer
- Node.js 20 LTS or newer recommended
- npm 9 or newer

Verify:

```bash
node -v
npm -v
```

---

## Installation and Setup

Clone or extract the project and open two terminals.

### Step 1 — Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2 — Start Backend

```bash
npm run dev
```

Backend:

```text
http://localhost:4029
```

### Step 3 — Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### Step 4 — Configure Frontend

Create:

```text
frontend/.env.local
```

Add:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4029
```

### Step 5 — Start Frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:4028
```

---

## Running the Application

Once both applications are running:

1. Open `http://localhost:4028`.
2. Register a test member.
3. Sign in.
4. Complete profile information.
5. Create or browse service listings.
6. Test credit earning/spending and exchanges.
7. Test member messaging.
8. Test reviews and ratings.
9. If applicable, test administrative analytics and dispute management.

The backend should remain running while using the frontend.

---

## Validation and Build Commands

### Frontend

```bash
cd frontend

npm run dev
npm run type-check
npm run build
npm run start
```

### Backend

```bash
cd backend

npm run dev
npm run type-check
npm run build
npm run start
```

Use `type-check` before committing changes and `build` to verify that the application can be compiled for a production-style build.

---

## Troubleshooting

### Backend Cannot Be Reached

Verify that the backend is running:

```text
http://localhost:4029
```

Verify:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4029
```

Then restart the frontend development server.

### Port Already in Use

Configured development ports:

```text
Frontend → 4028
Backend  → 4029
```

If either port is occupied, stop the existing process or update the corresponding project configuration and frontend API URL.

### Dependency Installation Problems

From the affected application directory:

```bash
rm -rf node_modules
npm install
```

For Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules,.next -ErrorAction SilentlyContinue
npm install
```

Run the cleanup separately inside `frontend` and `backend`.

### Stale Frontend Configuration

If the backend URL was changed in `.env.local`, restart the Next.js development server because environment configuration is loaded when the development process starts.

---

## Git and Environment Files

The following generated/local files should not be committed:

```text
node_modules/
.next/
.timebank/
.env
.env.local
```

Safe example configuration can be maintained in:

```text
.env.example
```

The local `.timebank` directory contains development data and should be treated as environment-specific data.

---

## Development and Production Considerations

This repository is structured as a development/demo-oriented full-stack application.

### Current Development Approach

- Separate frontend and backend applications
- Next.js API Route Handlers
- TypeScript
- Local JSON persistence
- Local development ports
- CORS middleware
- Client-side API abstraction

### Production Hardening Required

A production deployment should additionally address:

- Production database
- Password hashing
- Secure authentication/session management
- Authorization enforcement
- Restricted CORS
- HTTPS
- Secret management
- Input/schema validation
- Rate limiting
- Logging and monitoring
- Database migrations
- Backups
- Error tracking
- Concurrent write handling
- Automated testing
- CI/CD

---

## Future Enhancements

Potential next-stage improvements include:

- PostgreSQL/MySQL integration
- Secure password hashing
- JWT or session-based authentication
- Fine-grained role-based authorization
- Production-grade database migrations
- Service search and filtering
- Notifications
- Real-time messaging
- Email notifications
- Automated testing
- API documentation
- Deployment automation
- Improved analytics dashboards
- Production monitoring and logging

---

## Technical Skills Demonstrated

This project demonstrates practical experience with:

- **JavaScript / TypeScript**
- **React**
- **Next.js**
- **Tailwind CSS**
- **React Hook Form**
- **REST-style API design**
- **Fetch API**
- **Client/server application architecture**
- **CRUD operations**
- **Authentication workflows**
- **Profile management**
- **Data persistence**
- **Credit and transaction logic**
- **Messaging**
- **Reviews and ratings**
- **Admin analytics**
- **Dispute workflows**
- **Responsive UI development**
- **Git/GitHub project organization**
- **ESLint and Prettier**

---

## Project Status

**Status:** Development / Demonstration Project

The current repository provides an end-to-end TimeBanking workflow with separate frontend and backend applications and local JSON persistence.

For production use, the security, persistence, authentication, authorization, scalability, and deployment layers should be hardened as described above.

---

## Author

**Talapaneni Balaji**

B.Tech — Artificial Intelligence & Data Science

---

## License

No explicit open-source license is defined in the current repository. Add an appropriate `LICENSE` file before distributing the project as an open-source package.
