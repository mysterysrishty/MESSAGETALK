# 💬 MsgMate - Real-Time Chat Application

A professional full-stack **MERN** (MongoDB, Express.js, React, Node.js) chat application with real-time messaging, private chats, group conversations, and emoji support.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.0.0-61dafb.svg)

---

## ✨ Features

- 💬 **Real-time Messaging** - Instant message delivery using Socket.io
- 👤 **Private Chats** - One-on-one conversations
- 👥 **Group Chats** - Create groups with multiple participants
- 🔐 **User Authentication** - Secure JWT-based auth + Google OAuth
- 😊 **Emoji Support** - Express yourself with emoji picker
- 🟢 **Online Status** - See who's online in real-time
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Beautiful neobrutalist design

---

## 🛠 Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **Socket.io** - WebSocket connections for real-time communication
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 19** - UI library
- **TailwindCSS** - Styling framework
- **Socket.io-client** - Real-time client
- **React Router** - Navigation
- **Emoji Picker React** - Emoji support
- **Axios** - HTTP client

---

## 📁 Project Structure

```
msgmate/
├── server/                    # Backend (Node.js + Express)
│   ├── config/               # Database configuration
│   │   └── database.js
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── conversationController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── middleware/           # Authentication middleware
│   │   └── authMiddleware.js
│   ├── models/               # MongoDB schemas
│   │   ├── User.js
│   │   ├── Conversation.js
│   │   ├── Message.js
│   │   └── UserSession.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── conversationRoutes.js
│   │   ├── messageRoutes.js
│   │   └── userRoutes.js
│   ├── socket/               # WebSocket handlers
│   │   └── socketHandler.js
│   ├── utils/                # Helper functions
│   │   └── helpers.js
│   ├── server.js             # Entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/                  # Frontend (React)
    ├── src/
    │   ├── context/          # React context (Auth & Chat)
    │   │   ├── AuthContext.js
    │   │   └── ChatContext.js
    │   ├── pages/            # Page components
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   └── ChatPage.js
    │   ├── App.js            # Main component
    │   ├── index.js          # Entry point
    │   └── index.css         # Global styles
    ├── public/
    ├── package.json
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB Atlas** account (free tier works) ([Sign up](https://www.mongodb.com/cloud/atlas))
- **Git**

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/msgmate.git
cd msgmate
```

**2. Setup Backend**

```bash
cd server
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
# MONGO_URL=mongodb+srv://...
# JWT_SECRET=your-secret-key
```

**3. Setup Frontend**

```bash
cd ../frontend
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your backend URL
# REACT_APP_BACKEND_URL=http://localhost:8001
```

**4. Run the Application**

```bash
# Terminal 1 - Start backend
cd server
npm start

# Terminal 2 - Start frontend
cd frontend
npm start
```

The app will open at `http://localhost:3000` 🎉

---

## 🔧 Environment Variables

### Server (.env)

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/msgmate
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=8001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@msgmate.com
ADMIN_PASSWORD=admin123
```

### Frontend (.env)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| POST | `/api/auth/google/session` | Google OAuth login | ❌ |
| POST | `/api/auth/logout` | Logout user | ✅ |
| GET | `/api/users` | Get all users | ✅ |
| GET | `/api/users/search?q=` | Search users | ✅ |
| GET | `/api/conversations` | Get user's conversations | ✅ |
| POST | `/api/conversations/private` | Start private chat | ✅ |
| POST | `/api/conversations/group` | Create group chat | ✅ |
| GET | `/api/conversations/:id` | Get conversation details | ✅ |
| GET | `/api/conversations/:id/messages` | Get messages | ✅ |
| POST | `/api/conversations/:id/messages` | Send message | ✅ |

---

## 🔌 WebSocket Events

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `join_conversation` | `conversation_id` | Join a chat room |
| `leave_conversation` | `conversation_id` | Leave a chat room |
| `send_message` | `{ conversation_id, content, type }` | Send a message |
| `typing` | `{ conversation_id, is_typing }` | Typing indicator |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `new_message` | `{ message_id, content, sender, ... }` | Receive new message |
| `user_online` | `{ user_id }` | User came online |
| `user_offline` | `{ user_id }` | User went offline |
| `user_typing` | `{ user_id, name, is_typing }` | Typing status update |

---

## 👤 Default Accounts

After first run, the following test accounts are created:

| Email | Password | Role |
|-------|----------|------|
| `admin@msgmate.com` | `admin123` | Admin |
| `test@msgmate.com` | `test123` | User |

---

## 🎨 Design System

MsgMate uses a **neobrutalist** design aesthetic:
- Bold borders and shadows
- Vibrant colors
- Playful, expressive UI
- High contrast elements

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 📧 Contact

**MsgMate Team** - [your.email@example.com](mailto:your.email@example.com)

**Project Link**: [https://github.com/yourusername/msgmate](https://github.com/yourusername/msgmate)

---

## 🙏 Acknowledgments

- [Socket.io](https://socket.io/) for real-time communication
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
- [DiceBear](https://dicebear.com/) for avatar generation
- [Lucide Icons](https://lucide.dev/) for beautiful icons

---

Made with ❤️ using the MERN Stack