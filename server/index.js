const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io setup for real-time collaboration
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arps');
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

// Routes
const authRoutes = require('./routes/auth.routes');
const documentRoutes = require('./routes/document.routes');
const referenceRoutes = require('./routes/reference.routes');
const aiRoutes = require('./routes/ai.routes');

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/references', referenceRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ARPS Server Running' });
});

// Socket.io for real-time collaboration
const documentRooms = new Map();

io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // Join document room
    socket.on('join-document', ({ documentId, userId, userName }) => {
        socket.join(documentId);

        if (!documentRooms.has(documentId)) {
            documentRooms.set(documentId, new Map());
        }
        documentRooms.get(documentId).set(socket.id, { userId, userName });

        // Notify others in the room
        socket.to(documentId).emit('user-joined', { userId, userName });

        // Send current users list
        const users = Array.from(documentRooms.get(documentId).values());
        io.to(documentId).emit('users-in-document', users);
    });

    // Sync document changes
    socket.on('document-update', ({ documentId, delta, cursorPosition }) => {
        socket.to(documentId).emit('receive-update', { delta, cursorPosition, socketId: socket.id });
    });

    // Cursor position updates
    socket.on('cursor-move', ({ documentId, position, userId, userName }) => {
        socket.to(documentId).emit('cursor-update', { position, userId, userName });
    });

    // Leave document
    socket.on('leave-document', ({ documentId }) => {
        socket.leave(documentId);
        if (documentRooms.has(documentId)) {
            documentRooms.get(documentId).delete(socket.id);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔌 User disconnected:', socket.id);
        // Clean up from all rooms
        documentRooms.forEach((users, docId) => {
            if (users.has(socket.id)) {
                const user = users.get(socket.id);
                users.delete(socket.id);
                io.to(docId).emit('user-left', user);
            }
        });
    });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 ARPS Server running on port ${PORT}`);
    });
});

module.exports = { app, io };
