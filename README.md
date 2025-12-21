# 🗳️ PingPoll - Real-Time Polling & Chat Application

A modern, full-stack polling application built with the MEAN stack (MongoDB, Express, Angular, Node.js) featuring real-time voting, live chat, and interactive discussions.

![Angular](https://img.shields.io/badge/Angular-19-red)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

### 🔐 Authentication & Security
- Google OAuth 2.0 authentication with Firebase
- JWT-based session management
- Protected routes with auth guards
- Secure HTTP-only cookie storage

### 📊 Poll Management
- Create polls with 2-6 options
- Real-time vote counting
- Live poll results visualization
- Set expiration dates for polls
- Poll status management (active/closed)
- Vote change support (users can update their vote)
- Prevent duplicate voting

### 💬 Real-Time Chat
- Live chat for each poll discussion
- Typing indicators showing who's typing
- User profile pictures and names
- Message history persistence
- Auto-scroll to latest messages
- Real-time message delivery

### 👥 User Experience
- Clean, modern UI with glassmorphism design
- Responsive layout for all devices
- Active user count per poll
- Connection status indicators
- Loading states and error handling
- Toast notifications for user actions

### 📱 Dashboard
- Overview of all created polls
- Recent polls section
- Poll statistics (total votes, active polls)
- Create, view, and delete polls
- Tab-based navigation

## 🚀 Tech Stack

### Frontend
- **Angular 19** - Modern web framework with signals
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Socket.IO Client** - Real-time communication
- **Firebase Auth** - Authentication
- **RxJS** - Reactive programming

### Backend
- **Node.js & Express** - Server framework
- **TypeScript** - Type-safe backend
- **MongoDB & Mongoose** - Database
- **Socket.IO** - WebSocket server
- **TSyringe** - Dependency injection
- **JWT** - Token authentication

### Architecture
- Clean Architecture pattern
- Repository pattern for data access
- Service layer for business logic
- DTO (Data Transfer Objects) for type safety
- Dependency injection with interfaces

## 📋 Prerequisites

- Node.js 20+ and npm
- MongoDB 7.0+
- Angular CLI 19+
- Firebase project (for Google OAuth)
- Git

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd pingpoll
