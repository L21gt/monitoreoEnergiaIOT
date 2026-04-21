// src/services/socket.js
import { io } from 'socket.io-client';

export const conectarSocket = (token) => {
    const socket = io('http://localhost:3000', {
        auth: {
            token: token // <-- IMPORTANTE: Solo enviamos el token puro, sin "Bearer "
        }
    });

    socket.on('connect_error', (err) => {
        console.error("Error de socket:", err.message);
    });

    return socket;
};