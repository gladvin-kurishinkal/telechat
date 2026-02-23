const { Server } = require('socket.io');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL || 'http://localhost:5173'],
        methods: ['GET', 'POST'],
    }
});

// Map to keep track of user socket connections { userId: socketId }
const userSocketMap = {};

const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    // When a user connects, client sends userId in query
    const userId = socket.handshake.query.userId;
    if (userId && userId !== 'undefined') {
        userSocketMap[userId] = socket.id;
    }

    // Emit to all connected clients array of online userIds
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
        if (userId) {
            delete userSocketMap[userId];
            // update online status
            io.emit('getOnlineUsers', Object.keys(userSocketMap));
        }
    });
});

module.exports = { app, io, server, getReceiverSocketId };
