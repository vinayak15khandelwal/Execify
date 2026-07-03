# Execify – Online Code Execution Engine

## Overview

Execify is a secure online code execution platform inspired by systems like Judge0 and HackerRank. It allows users to write, compile, and execute code directly in the browser using isolated Docker containers.

The platform supports multiple programming languages and provides real-time execution results while enforcing security through sandboxing, resource limits, execution timeouts, and queue-based job processing.

---

## Features

- Multi-language code execution
- Python support
- JavaScript support
- C++ support
- Monaco Editor (VS Code-like experience)
- Docker-based sandboxing
- Redis-powered Bull Queue
- Concurrent job processing
- Execution timeout protection
- Resource-limited containers
- Rate limiting
- Real-time execution status

---

## Architecture

Frontend (React + Monaco Editor)
↓
Backend API (Node.js + Express)
↓
Bull Queue (Redis)
↓
Worker Processes
↓
Docker Sandboxed Containers
↓
Execution Results

---

## Tech Stack

### Frontend
- React
- Vite
- Monaco Editor

### Backend
- Node.js
- Express.js

### Queue System
- Bull Queue
- Redis

### Sandbox
- Docker Containers

### Languages Supported
- Python
- JavaScript
- C++

---

## Installation

### Clone Repository

```bash
git clone <repo-url>
cd execify
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

```bash
cd ../server
npm install
```

### Start Redis

```bash
redis-server
```

### Start Backend

```bash
npm start
```

### Start Frontend

```bash
cd ../client
npm run dev
```

---

## Security Features

- Docker sandbox execution
- Network isolation
- Memory limits
- CPU limits
- Execution timeout
- Queue isolation
- API rate limiting

---

## Future Improvements

- User authentication
- Submission history
- Custom test cases
- 
- Contest mode
- Kubernetes deployment
- WebSocket live execution

---

## Author

Vinayak Khandelwal