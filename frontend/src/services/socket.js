// src/services/socket.js
import { io } from "socket.io-client";

const URL_SERVIDOR = "http://localhost:3000";

/**
 * Inicializa la conexion con el servidor de WebSockets.
 * Se debe pasar el token obtenido de Auth0 para superar el handshake.
 */
export const conectarSocket = (token) => {
  return io(URL_SERVIDOR, {
    auth: {
      token: token,
    },
    transports: ["websocket"],
  });
};
