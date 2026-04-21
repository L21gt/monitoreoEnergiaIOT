// src/app.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const jksClient = require("jwks-rsa");
const metricaRoutes = require("./routes/metricaRoutes");
require("dotenv").config();

// Importacion de rutas
const nodoRoutes = require("./routes/nodoRoutes");

const app = express();
const server = http.createServer(app);

// Configuracion de WebSockets
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Configuración del cliente para obtener las llaves públicas de Auth0
const client = jksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Middleware de Socket.io para validar el JWT en el handshake
io.use((socket, next) => {
  // El token suele venir en el objeto 'auth' del cliente socket.io
  const token = socket.handshake.auth.token;

  console.log("Token recibido en el Socket:", token ? "Sí hay token" : "No hay token");

  if (!token) {
    return next(new Error("Error de autenticación: Token no proporcionado"));
  }

  // Validamos el token usando las llaves de Auth0
  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ["RS256"],
    },
    (err, decoded) => {
      if (err) {
        return next(new Error("Error de autenticación: Token inválido"));
      }
      // Guardamos los datos del usuario decodificados en el socket para uso futuro
      socket.user = decoded;
      next();
    },
  );
});

// Middleware
app.use(cors());
app.use(express.json()); // Necesario para parsear el cuerpo de las peticiones POST

// Inyeccion de Socket.io en la peticion para que sea accesible desde controladores
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Definicion de Prefijos de Rutas
app.use("/api/nodos", nodoRoutes);
app.use("/api/metricas", metricaRoutes);

// Manejo basico de errores de conexion en el socket
io.on("connection", (socket) => {
  console.log("Nueva conexion establecida: " + socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado: " + socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor de monitoreo corriendo en el puerto ${PORT}`);
});
