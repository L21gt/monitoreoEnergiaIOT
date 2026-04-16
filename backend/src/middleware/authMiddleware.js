// src/middleware/authMiddleware.js
const { auth } = require("express-oauth2-jwt-bearer");
require("dotenv").config();

/**
 * Middleware para validar el JSON Web Token (JWT) enviado desde el cliente.
 * Este middleware verifica que el token haya sido emitido por nuestro Tenant de Auth0
 * y que este dirigido a nuestra API (Audience).
 */
const verificarToken = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: "RS256",
});

module.exports = {
  verificarToken,
};
