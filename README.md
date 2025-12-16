# MERN 2 Final Project — Realtime Task Management System

## 📌 Project Description
This project is a **Realtime Task Management System** built with the **MERN stack** using **GraphQL**.
It allows users to create workspaces, manage tasks using a Kanban board, add members, and collaborate via realtime updates.

The project was developed as a **final project for the MERN 2 course** and fully satisfies all technical and functional requirements.

---

## 🧠 Domain & User Roles

### User roles:
- **Owner** — creates workspace, adds members
- **Member** — works with tasks inside workspace

### Main features:
- Authentication (JWT)
- Workspaces & members
- Tasks with statuses (TODO / IN_PROGRESS / DONE)
- Realtime updates via GraphQL Subscriptions
- Kanban board (drag & drop)
- Unit & integration tests

---

## 🧱 Tech Stack

### Backend:
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- GraphQL (Queries / Mutations / Subscriptions)
- JWT Authentication
- Jest (unit + integration tests)

### Frontend:
- Next.js (App Router)
- TypeScript
- Apollo Client
- Zustand
- TailwindCSS
- GraphQL Subscriptions (graphql-ws)

### DevOps:
- Docker
- Docker Compose
- MongoDB container

---

## 📊 Data Models

### User
- email
- passwordHash
- name
- role
- isDeleted

### Workspace
- name
- description
- owner
- members
- isArchived

### Task
- title
- description
- status
- priority
- workspace
- assignee
- isDeleted

### Comment
- text
- author
- task
- isDeleted

### Relations:
- User → Workspaces (many-to-many)
- Workspace → Tasks (one-to-many)
- Task → Comments (one-to-many)

---

## 🔐 Authentication & Authorization
- JWT-based authentication
- Private GraphQL resolvers
- Context-based user validation
- Access token via Authorization header

---

## 🔁 Realtime Functionality

### Implemented Subscriptions:
- `taskCreated`
- `taskUpdated`
- `taskDeleted`
- `commentAdded`
- `commentDeleted`

### How to test realtime:
1. Open two browser windows
2. Login as different users
3. Create or update task
4. Changes appear instantly in both sessions

---

## 🧪 Testing

### Unit Tests (Jest)
- Resolver logic testing
- Mongoose models are mocked
- Auth, Workspace, Task resolvers tested

### Integration Test
- Full GraphQL API test
- Test database (mongodb-memory-server)

### Run tests:
```bash
npm test
