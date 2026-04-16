// src/routes/nodoRoutes.js
const express = require("express");
const router = express.Router();
const nodoController = require("../controllers/nodoController");
const { verificarToken } = require("../middleware/authMiddleware");

/**
 * Definicion de rutas para el recurso de Nodos Sensores
 */

// El listado de nodos puede ser publico para que el Dashboard lo cargue inicialmente
router.get("/", nodoController.listarNodos);

// Solo usuarios autenticados a traves de Auth0 pueden registrar nuevos nodos
router.post("/", verificarToken, nodoController.registrarNodo);

module.exports = router;
