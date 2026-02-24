# TeleChat

A real-time chat application built with React, Express, Socket.IO, and MongoDB.

## Features

- **User Authentication** — Register and login with JWT-based auth
- **Real-Time Messaging** — Instant messaging powered by Socket.IO
- **File Uploads** — Share images and files via Multer
- **Responsive UI** — Modern interface built with React + Tailwind CSS

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Zustand |
| Backend  | Node.js, Express 5, Socket.IO                   |
| Database | MongoDB (Mongoose)                               |

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally or an Atlas URI

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/gladvin-kurishinkal/telechat.git
cd telechat
```

### 2. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/telechat
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
```

> [!NOTE]
> Replace `MONGO_URI` with your MongoDB Atlas connection string if not running locally.
> Replace `JWT_SECRET` with a strong, random secret key.

Start the backend server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The backend runs on **http://localhost:5001** by default.

### 3. Setup the frontend

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend runs on **http://localhost:5173** by default.

### 4. Open the app

Navigate to [http://localhost:5173](http://localhost:5173) in your browser. Register a new account and start chatting!

## Project Structure

```
telechat/
├── backend/
│   ├── controllers/       # Route handlers (auth, messages, users)
│   ├── db/                # MongoDB connection
│   ├── middlewares/        # Auth & file upload middleware
│   ├── models/            # Mongoose schemas (User, Message, Conversation)
│   ├── routes/            # API route definitions
│   ├── socket/            # Socket.IO setup
│   └── server.js          # Entry point
└── frontend/
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── pages/         # Page components (Home, Login, Register)
    │   ├── store/         # Zustand state management
    │   └── lib/           # Axios & Socket.IO client config
    └── index.html
```

## API Endpoints

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| POST   | `/api/auth/register` | Register a new user    |
| POST   | `/api/auth/login`    | Login                  |
| GET    | `/api/auth/check`    | Check auth status      |
| GET    | `/api/users`         | Get all users          |
| GET    | `/api/messages/:id`  | Get conversation messages |
| POST   | `/api/messages/:id`  | Send a message         |
| GET    | `/api/health`        | Server health check    |

## License

GPL-3.0 license
